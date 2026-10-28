from dataclasses import dataclass
from PIL import Image

from diffusers import (
    ControlNetModel,
    StableDiffusionXLControlNetPipeline,
    AutoencoderKL,
    StableDiffusionXLImg2ImgPipeline,
)
import torch
import numpy as np
import cv2

import src.util.evaluation
from src.models.config import device, point_model_to_cache_dir
from src.models.sd_class import StableDiffusionConfig, StableDiffusionWrapper
from src.util import image_processing
from src.util.prompting import prompt_processing
from src.data.config import example_results_path


@dataclass
class ControlnetConfig(StableDiffusionConfig):
    sd_model: str = "diffusers/controlnet-canny-sdxl-1.0"
    device: str = device
    num_images_per_prompt: int = 1
    num_inference_steps: int = 50
    negative_prompt: str = "illustration, painting, distorted, deformed, blurry, unrealistic, low quality, error, cropped, worst quality, artifacts, out of frame, watermark, signature"
    quality_metric: str = "brisque"

    guidance_scale: float = 8.0
    vae_model: str = "madebyollin/sdxl-vae-fp16-fix"
    base_model: str = "stabilityai/stable-diffusion-xl-base-1.0"
    conditioning_scale: float = 0.8
    conditioning_guidance_start: float = 0.0
    conditioning_guidance_end: float = 1.0

    # use the refiner model as the denoiser; leave string empty if no refiner should be applied
    refiner_model: str = "stabilityai/stable-diffusion-xl-refiner-1.0"


class ControlnetWrapper(StableDiffusionWrapper):
    def __init__(self, config: ControlnetConfig):
        self.sd_config = config
        self.torch_dtype = (
            torch.float16 if self.sd_config.device == "cuda" else torch.float32
        )

        controlnet = ControlNetModel.from_pretrained(
            self.sd_config.sd_model,
            torch_dtype=self.torch_dtype,
            cache_dir=point_model_to_cache_dir[self.sd_config.sd_model],
        )
        self.vae = AutoencoderKL.from_pretrained(
            self.sd_config.vae_model,
            torch_dtype=self.torch_dtype,
            cache_dir=point_model_to_cache_dir[self.sd_config.vae_model],
        )

        self.sd_pipeline = StableDiffusionXLControlNetPipeline.from_pretrained(
            self.sd_config.base_model,
            controlnet=controlnet,
            vae=self.vae,
            torch_dtype=self.torch_dtype,
            use_safetensors=True,
            cache_dir=point_model_to_cache_dir[self.sd_config.base_model],
        )

        self.sd_pipeline.enable_model_cpu_offload()

    def generate_image(
        self,
        prompt: str,
        input_img: str | Image.Image,
        run_id: str = None,
        enhance_prompt: bool = True,
    ) -> tuple[list, list]:
        input_img = np.asarray(image_processing.process_image_to_PIL(input_img))

        if "canny" in self.sd_config.sd_model:
            conditional_image = self.detect_canny_edges(input_img, run_id)
        else:
            raise NotImplementedError("Condition type for Controlnet not available.")

        negative_prompt = self.sd_config.negative_prompt
        (
            prompt_embeds,
            pooled_prompt_embeds,
            negative_prompt_embeds,
            negative_pooled_prompt_embeds,
        ) = (None, None, None, None)
        if enhance_prompt:
            prompt_embeds, pooled_prompt_embeds = prompt_processing.enhance_prompt(
                prompt, self.sd_pipeline
            )
            (
                negative_prompt_embeds,
                negative_pooled_prompt_embeds,
            ) = prompt_processing.enhance_prompt(
                self.sd_config.negative_prompt, self.sd_pipeline
            )

        generated_images = self.sd_pipeline(
            prompt=None if enhance_prompt else prompt,
            negative_prompt=None if enhance_prompt else negative_prompt,
            prompt_embeds=prompt_embeds,
            pooled_prompt_embeds=pooled_prompt_embeds,
            negative_prompt_embeds=negative_prompt_embeds,
            negative_pooled_prompt_embeds=negative_pooled_prompt_embeds,
            image=conditional_image,
            controlnet_conditioning_scale=self.sd_config.conditioning_scale,
            guidance_scale=self.sd_config.guidance_scale,
            control_guidance_start=self.sd_config.conditioning_guidance_start,
            control_guidance_end=self.sd_config.conditioning_guidance_end,
            num_images_per_prompt=self.sd_config.num_images_per_prompt,
            num_inference_steps=self.sd_config.num_inference_steps,
            output_type="np",
        ).images

        for i, img in enumerate(generated_images):
            image_processing.show_image(
                img,
                example_results_path / f"{run_id}_controlnet_{i}.png"
                if run_id
                else None,
            )

        if self.sd_config.refiner_model:
            # can't initialize the pipeline during init because of cuda memory limits
            self.refiner_pipeline = StableDiffusionXLImg2ImgPipeline.from_pretrained(
                self.sd_config.refiner_model,
                text_encoder_2=self.sd_pipeline.text_encoder_2,
                vae=self.vae,
                torch_dtype=self.torch_dtype,
                use_safetensors=True,
                cache_dir=point_model_to_cache_dir[self.sd_config.refiner_model],
            )
            self.refiner_pipeline.to(self.sd_config.device)
            self.refiner_pipeline.enable_model_cpu_offload()

            generated_images = self.refiner_pipeline(
                prompt=prompt,
                negative_prompt=negative_prompt,
                image=generated_images,
                num_inference_steps=self.sd_config.num_inference_steps,
                num_images_per_prompt=self.sd_config.num_images_per_prompt,
                output_type="np",
            ).images

            for i, img in enumerate(generated_images):
                image_processing.show_image(
                    img,
                    example_results_path / f"{run_id}_refined_{i}.png"
                    if run_id
                    else None,
                )

        image_qualities = src.util.evaluation.evaluate_quality(
            generated_images,
            self.sd_config.quality_metric,
            reshape=None,
        )

        return generated_images, image_qualities

    def detect_canny_edges(
        self, canny_image: np.ndarray, run_id: str = None
    ) -> Image.Image:
        # edges become too fine if the image is too large
        canny_image = image_processing.resize_image_for_sdxl(canny_image)

        # compute thresholds for canny
        # https://pyimagesearch.com/2015/04/06/zero-parameter-automatic-canny-edge-detection-with-python-and-opencv/
        gray_image = cv2.cvtColor(canny_image, cv2.COLOR_BGR2GRAY)
        gray_image = cv2.GaussianBlur(gray_image, (3, 3), 0)
        v = np.median(gray_image)
        lower = int(max(0, (1.0 - 0.33) * v))
        upper = int(min(255, (1.0 + 0.33) * v))

        canny_image = cv2.Canny(gray_image, lower, upper, L2gradient=True)
        canny_image = canny_image[:, :, None]
        canny_image = np.concatenate([canny_image, canny_image, canny_image], axis=2)

        canny_image = image_processing.resize_image_for_sdxl(canny_image)

        image_processing.show_image(
            canny_image,
            example_results_path / f"{run_id}_canny.png" if run_id else None,
        )

        return Image.fromarray(canny_image)
