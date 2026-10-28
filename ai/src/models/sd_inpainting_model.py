import os
import requests
import base64
import numpy as np
import torch
from dataclasses import dataclass
from torch import tensor
from PIL import Image
from io import BytesIO
from diffusers import (
    StableDiffusionInpaintPipeline,
    StableDiffusionXLInpaintPipeline,
    StableDiffusionXLImg2ImgPipeline,
    AutoencoderKL,
)

import src.util.evaluation
from src.data.config import example_results_path
from src.models.config import device, point_model_to_cache_dir

from src.data import image_masking
from src.util import (
    enervi_logger,
    image_processing,
    bounding_box_processing,
)
from src.util.prompting import prompt_processing
from src.models.sd_class import StableDiffusionConfig, StableDiffusionWrapper
from src.models import grounding_dino_model as gd_model


@dataclass
class StableDiffusionInpaintingConfig(StableDiffusionConfig):
    # this will download the model to the .cache dir if not yet placed there
    sd_model: str = "stabilityai/stable-diffusion-2-inpainting"
    device: str = device
    num_images_per_prompt: int = 2
    num_inference_steps: int = 50
    negative_prompt: str = "illustration, painting, distorted, deformed, blurry, unrealistic, low quality, error, cropped, worst quality, artifacts, out of frame, watermark, signature"
    quality_metric: str = "brisque"

    strength: float = 0.8
    guidance_scale: float = 9.0
    max_res = (1024, 1024)

    refiner_model: str = ""
    refiner_strength: float = 0.1
    vae_model: str = "madebyollin/sdxl-vae-fp16-fix"


class StableDiffusionInpaintingWrapper(StableDiffusionWrapper):
    def __init__(self, config: StableDiffusionInpaintingConfig):
        self.sd_config = config
        self.use_xl = "stable-diffusion-xl" in self.sd_config.sd_model
        self.use_flux_api = "use_flux_api" in self.sd_config.sd_model
        self.segmind_api_key = None
        self.torch_dtype = (
            torch.float16 if self.sd_config.device == "cuda" else torch.float32
        )

        if self.use_xl:
            enervi_logger.ENERVI_LOGGER.info("Using XL model")
            self.sd_pipeline = StableDiffusionXLInpaintPipeline.from_pretrained(
                self.sd_config.sd_model,
                torch_dtype=self.torch_dtype,
                variant="fp16" if self.torch_dtype == torch.float16 else None,
                use_safetensors=True,
                cache_dir=point_model_to_cache_dir[self.sd_config.sd_model],
            )
        elif self.use_flux_api:
            enervi_logger.ENERVI_LOGGER.info("Using Flux API model")
            self.sd_pipeline = None
            self.segmind_api_key = os.getenv("SEGMIND_API_KEY")
            if not self.segmind_api_key:
                enervi_logger.ENERVI_LOGGER.warning(
                    "SEGMIND_API_KEY is not set; the external inpainting call will fail"
                )
        else:
            self.sd_pipeline = StableDiffusionInpaintPipeline.from_pretrained(
                self.sd_config.sd_model,
                cache_dir=point_model_to_cache_dir[self.sd_config.sd_model],
            )

        if self.sd_pipeline:
            self.sd_pipeline.to(self.sd_config.device)
            if self.sd_config.device == "cuda":
                self.sd_pipeline.enable_model_cpu_offload()

        self.base_params_for_pipeline = {
            "strength": self.sd_config.strength,
            "guidance_scale": self.sd_config.guidance_scale,
            "num_inference_steps": self.sd_config.num_inference_steps,
            "num_images_per_prompt": self.sd_config.num_images_per_prompt,
            "output_type": "np",
            "negative_prompt": self.sd_config.negative_prompt,
        }

    def run_inpainting(
        self,
        input_img: str | Image.Image,
        prompt: str,
        masks: list = None,
        boxes: tensor = None,
        run_id: str = None,
        inpaint_only_mask: bool = False,
        enhance_prompt: bool = True,
    ) -> tuple[list, list]:
        """
        Either pass masks or boxes to inpaint.
        If inpaint_only_mask is True, then only the cropped parts of the image will be inpainted and merged with the original image. This is useful
        for keeping the original image quality and limit the context of the inpainting to achieve better results.

        However, if the area to be inpainted is too large, the pipeline will fallback to the default inpainting using the full image context.
        Note that inpainting the full image still keeps the original parts of the image and replaces only the masked parts. Change this with the keep_original_parts flag.
        """

        original_image = np.asarray(image_processing.process_image_to_PIL(input_img))
        inpainted_images = None
        self._prepare_prompt(prompt, enhance_prompt, self.use_xl)

        if inpaint_only_mask:
            inpainted_images = self._inpaint_image_patches(
                original_image, masks, boxes, run_id
            )

        if inpainted_images is None:
            inpainted_images = self._inpaint_full_image(
                original_image, masks, boxes, run_id, keep_original_parts=False
            )

        for i, inpainted_image in enumerate(inpainted_images):
            image_processing.show_image(
                inpainted_image,
                example_results_path / f"{run_id}_SD_inpainting_{i}.png"
                if run_id
                else None,
            )

        if self.sd_config.refiner_model:
            inpainted_images = self._refine_images(inpainted_images, prompt)

            for i, inpainted_image in enumerate(inpainted_images):
                image_processing.show_image(
                    inpainted_image,
                    example_results_path / f"{run_id}_refined_{i}.png"
                    if run_id
                    else None,
                )

        image_qualities = src.util.evaluation.evaluate_quality(
            inpainted_images,
            self.sd_config.quality_metric,
            reshape=None,
        )

        return inpainted_images, image_qualities

    def _inpaint_image_patches(
        self,
        original_image: np.ndarray,
        masks: list,
        boxes: tensor,
        run_id: str = None,
        max_patches: int = 4,
    ) -> list | None:
        """Go through all masks/boxes and inpaint them individually by creating patches.
        When more than max_patches are found, only the largest patches are filled in.
        Returns a list of full inpainted images with the generated patches merged back in.

        Either masks or boxes must be passed, the other one must be None.
        """

        assert (boxes is None) or (
            masks is None
        ), "Either masks or boxes must be passed, the other one must be None."

        patches = {
            "masks": [],
            "cropped_masks": [],
            "inpainted_patches": [],
        }

        # reduce image size to speed up inference and improve generation quality
        resized_original_image = (
            image_processing.resize_image_for_sdxl(original_image)
            if self.use_xl
            else image_processing.resize_image_within_boundary(
                original_image, self.sd_config.max_res
            )
        )

        # generate boxes around segmentation masks for cropping
        if boxes is None:
            boxes = bounding_box_processing.get_bounding_boxes_from_masks(
                [mask["segmentation"] for mask in masks]
            )

        # pick largest boxes
        patch_idx = torch.argsort(boxes[:, 2] * boxes[:, 3])[-max_patches:]
        boxes = boxes[patch_idx]
        masks = np.array(masks)[patch_idx] if masks is not None else [None] * len(boxes)

        for i in range(len(boxes)):
            enervi_logger.ENERVI_LOGGER.info(
                f"Processing patch {i+1} / {min(max_patches, len(boxes))}..."
            )

            # generate masks from boxes if no segmentation masks are passed, otherwise use the segmentation masks
            box_to_mask = tensor(boxes[i]).unsqueeze(0) if masks[0] is None else None
            mask_to_mask = [masks[i]] if masks[i] is not None else None
            sd_mask = image_masking.generate_mask(
                original_image, mask_to_mask, box_to_mask
            )

            resized_sd_mask = (
                image_processing.resize_image_for_sdxl(sd_mask)
                if self.use_xl
                else image_processing.resize_image_within_boundary(
                    sd_mask, self.sd_config.max_res
                )
            )

            tight_box_on_original = gd_model.transform_boxes_to_xyxy(
                boxes[i].unsqueeze(0), resized_original_image.shape
            )[0]
            (
                box_xyxy,
                cropped_mask,
                cropped_image,
            ) = self._process_image_patch(
                tight_box_on_original,
                resized_original_image,
                resized_sd_mask,
                padding=0.25,
            )

            image_processing.show_image(
                resized_sd_mask,
                example_results_path / f"{run_id}_SD_mask_{i}.png" if run_id else None,
                cmap="gray",
                box_to_draw=box_xyxy,
            )

            if box_xyxy is None:
                enervi_logger.ENERVI_LOGGER.warning(
                    "Patch could not be cropped, using full image inpaint"
                )
                return None

            pipeline_params = self.base_params_for_pipeline

            inpainted_image_patch = self.sd_pipeline(
                **pipeline_params,
                image=image_processing.process_image_to_PIL(cropped_image),
                mask_image=image_processing.process_image_to_PIL(cropped_mask),
                height=cropped_image.shape[0],
                width=cropped_image.shape[1],
            ).images

            image_processing.show_image(
                inpainted_image_patch[0],
                file_path=example_results_path / f"{run_id}_SD_patch_{i}.png"
                if run_id
                else None,
            )

            patches["masks"].append(resized_sd_mask)
            patches["cropped_masks"].append(cropped_mask)
            patches["inpainted_patches"].append(inpainted_image_patch)

        return self._fill_patch_by_patch(
            resized_original_image,
            patches,
        )

    def _process_image_patch(
        self,
        box_xyxy: np.ndarray,
        original_image: np.ndarray,
        sd_mask: np.ndarray,
        padding: float = 0.1,
    ) -> tuple[np.ndarray, np.ndarray, np.ndarray] | None:
        """
        For a given box, crop the original image and mask (with padding).
        To fit the SD requirements, the crop is made square. If that's not possible, the patch is too large
        and None is returned.
        Otherwise returns the padded and square box, the cropped mask and the cropped image.
        """

        box_xyxy = bounding_box_processing.pad_xyxy_box(box_xyxy, padding)
        box_xyxy = bounding_box_processing.box_to_square(box_xyxy, original_image.shape)

        enervi_logger.ENERVI_LOGGER.info(
            f"Using patch of size {box_xyxy[2] - box_xyxy[0]}x{box_xyxy[3] - box_xyxy[1]}"
        )

        if box_xyxy[2] - box_xyxy[0] != box_xyxy[3] - box_xyxy[1]:
            enervi_logger.ENERVI_LOGGER.warning("Image patch is too big.")
            return None, None, None

        crop_x1, crop_y1, crop_x2, crop_y2 = box_xyxy

        cropped_mask, cropped_image = (
            sd_mask[
                crop_y1:crop_y2,
                crop_x1:crop_x2,
            ],
            original_image[
                crop_y1:crop_y2,
                crop_x1:crop_x2,
            ],
        )

        return box_xyxy, cropped_mask, cropped_image

    def _fill_patch_by_patch(self, original_image: np.ndarray, patches: dict) -> list:
        """Fill the inpainted patches back into the original image one by one. Requires a dict with
        the inpainted patches, the original masks and the cropped masks."""
        inpainted_images = []
        n_trials = self.sd_config.num_images_per_prompt

        for generative_trial in range(n_trials):
            inpainted_full_image = original_image.copy()

            for patch, mask, cropped_mask in zip(
                patches["inpainted_patches"],
                patches["masks"],
                patches["cropped_masks"],
            ):
                inpainted_image_patch = (patch[generative_trial] * 255).astype(np.uint8)

                # add some padding around the cropped mask to soften the edges and avoid artifacts
                cropped_mask = image_masking.pad_mask(cropped_mask, 10)
                mask = image_masking.pad_mask(mask, 10)

                # only fill mask pixels with inpainted patch
                inpainted_full_image[mask == 255] = inpainted_image_patch[
                    cropped_mask == 255
                ]

            inpainted_images.append(inpainted_full_image)

        return inpainted_images

    def _inpaint_full_image(
        self,
        original_image: np.ndarray,
        masks: list,
        boxes: tensor,
        run_id: str = None,
        keep_original_parts: bool = False,
    ) -> list:
        """Apply the inpainting pipeline using the complete image as context."""

        sd_mask = image_masking.generate_mask(original_image, masks, boxes)

        original_image = (
            image_processing.resize_image_for_sdxl(original_image)
            if self.use_xl
            else image_processing.resize_image_within_boundary(
                original_image, self.sd_config.max_res
            )
        )
        sd_mask = (
            image_processing.resize_image_for_sdxl(sd_mask)
            if self.use_xl
            else image_processing.resize_image_within_boundary(
                sd_mask, self.sd_config.max_res
            )
        )

        # smaller size required for non-XL model versions
        shrink_img = None if self.use_xl else (512, 512)

        image_processing.show_image(
            sd_mask,
            example_results_path / f"{run_id}_SD_mask.png" if run_id else None,
            cmap="gray",
        )

        enervi_logger.ENERVI_LOGGER.info("Inpainting full image...")

        pipeline_params = self.base_params_for_pipeline

        if self.sd_pipeline is not None:
            inpainted_images = self.sd_pipeline(
                **pipeline_params,
                image=image_processing.process_image_to_PIL(original_image, shrink_img),
                mask_image=image_processing.process_image_to_PIL(sd_mask, shrink_img),
                height=512 if shrink_img else original_image.shape[0],
                width=512 if shrink_img else original_image.shape[1],
            ).images
        else:
            def np_array_to_b64(np_array, format="PNG"):
                # Convert numpy array to PIL image
                pil_image = Image.fromarray(np_array)
                # Create a BytesIO stream
                buffered = BytesIO()
                # Save the PIL image to the buffer in the specified format
                pil_image.save(buffered, format=format)
                # Get the binary data and encode it as Base64
                b64_string = base64.b64encode(buffered.getvalue()).decode("utf-8")
                return b64_string

            api_key = self.segmind_api_key
            url = "https://api.segmind.com/v1/flux-inpaint"

            # Request payload
            data = {
                "base64": False,
                "guidance_scale": 9,
                "image": np_array_to_b64(original_image),
                "image_format": "jpeg",
                "mask": np_array_to_b64(sd_mask),
                "negative_prompt": "bad quality, painting, blur",
                "num_inference_steps": 25,
                "prompt": self.base_params_for_pipeline["prompt"],
                "quality": 95,
                "sampler": "euler",
                "samples": 1,
                "scheduler": "simple",
                "seed": 12467,
                "strength": 0.95
            }

            headers = {'x-api-key': api_key}

            response = requests.post(url, json=data, headers=headers)
            # print(response.content)  # The response is the generated image

            image_stream = BytesIO(response.content)
            # Open the image with PIL
            inpainted_images = [Image.open(image_stream)]

        # back to original image size; note that this results in loss of quality
        if shrink_img:
            inpainted_images = [
                np.array(
                    image_processing.process_image_to_PIL(img).resize(
                        (original_image.shape[1], original_image.shape[0])
                    )
                )
                for img in inpainted_images
            ]

        # this can look weird due to differences in quality between inpainted and original parts
        if keep_original_parts:
            inpainted_images = [
                image_processing.fill_original_image(original_image, img, sd_mask)
                for img in inpainted_images
            ]

        return inpainted_images

    def _refine_images(self, inpainted_images: list, prompt: str) -> list:
        """Apply the refiner model to the previously inpainted images."""

        refiner_pipeline = self._init_refiner_pipeline()

        pipeline_params = self.base_params_for_pipeline
        pipeline_params["strength"] = self.sd_config.refiner_strength
        self._prepare_prompt(prompt, enhance_prompt=False, xl_model=True)

        inpainted_images = refiner_pipeline(
            **pipeline_params,
            image=[
                image_processing.process_image_to_PIL(img) for img in inpainted_images
            ],
        ).images

        return inpainted_images

    def _init_refiner_pipeline(self) -> StableDiffusionXLImg2ImgPipeline:
        """Set up the img2img pipeline for the refiner model."""

        pipeline = StableDiffusionXLImg2ImgPipeline
        enervi_logger.ENERVI_LOGGER.info("Initializing refiner pipeline")

        refiner_pipeline = (
            pipeline.from_pretrained(
                self.sd_config.refiner_model,
                text_encoder_2=self.sd_pipeline.text_encoder_2,
                vae=AutoencoderKL.from_pretrained(
                    self.sd_config.vae_model, torch_dtype=self.torch_dtype
                ),
                torch_dtype=self.torch_dtype,
                use_safetensors=True,
                cache_dir=point_model_to_cache_dir[self.sd_config.refiner_model],
            )
            if self.use_xl
            else pipeline.from_pretrained(
                self.sd_config.refiner_model,
                vae=AutoencoderKL.from_pretrained(
                    self.sd_config.vae_model, torch_dtype=self.torch_dtype
                ),
                torch_dtype=self.torch_dtype,
                use_safetensors=True,
                cache_dir=point_model_to_cache_dir[self.sd_config.refiner_model],
            )
        )
        refiner_pipeline.to(self.sd_config.device)

        return refiner_pipeline

    def _prepare_prompt(
        self, prompt: str, enhance_prompt: bool = True, xl_model: bool = True
    ):
        """
        Add prompt to the parameter dictionary to pass to model pipeline.
        If enhance_prompt is True, then the prompt will be pre-processed to embeddings using Compel.
        """
        if self.sd_pipeline is not None and enhance_prompt:
            enervi_logger.ENERVI_LOGGER.info("Processing prompt - enhancement")
            embeds = prompt_processing.enhance_prompt(prompt, self.sd_pipeline)
            if xl_model:
                self.base_params_for_pipeline["prompt_embeds"] = embeds[0]
                self.base_params_for_pipeline["pooled_prompt_embeds"] = embeds[1]
            else:
                self.base_params_for_pipeline["prompt_embeds"] = embeds
            self.base_params_for_pipeline["prompt"] = None

        else:
            enervi_logger.ENERVI_LOGGER.info("Processing prompt - no enhancement")
            self.base_params_for_pipeline["prompt"] = prompt

            # non-XL models don't differentiate between embeddings and pooled embeddings
            if "prompt_embeds" in self.base_params_for_pipeline:
                del self.base_params_for_pipeline["prompt_embeds"]
            if "pooled_prompt_embeds" in self.base_params_for_pipeline:
                del self.base_params_for_pipeline["pooled_prompt_embeds"]
