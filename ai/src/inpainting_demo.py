import json
import dataclasses
import numpy as np
import logging
from typing import Callable
from PIL import Image

from src.util.prompting.prompt_creator import PromptCreator
from src.models.sam_model import SamModelWrapper, SamModelConfig
from src.models.grounding_dino_model import (
    DinoModelWrapper,
    GroundingDinoModelConfig,
    GroundingDinoModelPrompt,
)

from src.models.sd_inpainting_model import (
    StableDiffusionInpaintingConfig,
    StableDiffusionInpaintingWrapper,
)

from src.data import config
from src.util import (
    enervi_logger,
    bounding_box_processing,
    image_processing,
)
from src.util.prompting import prompt_processing
import src.data.iqa.util as iqa_util


def inpaint(
    input_img: str | Image.Image,
    model_config: StableDiffusionInpaintingConfig,
    visualize: str,
    run_id: str,
    infer_prompt: bool = False,
    process_box: Callable = None,
    segment_image: bool = False,
    inpaint_only_mask: bool = False,
) -> list:
    """
    Run inpainting on an image.
    infer_prompt: If True, infer the prompt from the image using BLIP. Otherwise use the static prompt from the prompt_config.
    process_box: Preprocessing function for the box/boxes. Applied when not using segmentation.
    segment_image: If True, segment the image with SAM. Otherwise use detected bounding boxes. Applies to SD Inpainting.
    inpaint_only_mask: If True, only inpaint the mask/box, not the full image. Applies to SD Inpainting.
    """

    # prepare configs
    if type(input_img) == str:
        input_img = str(config.example_image_path / input_img)
    input_img = Image.open(input_img) if isinstance(input_img, str) else input_img
    image_processing.check_input_image(input_img)

    prompt_config = prompt_processing.load_prompts()[visualize]
    segment_objects = prompt_config["object"]
    negative_prompt = prompt_config["negative_prompt"]

    # generate prompt from image or use static prompt
    if not infer_prompt:
        prompt = (
            prompt_config["prompt"]["sdxl"]
            if "stable-diffusion-xl" in model_config.sd_model
            else prompt_config["prompt"]["inpainting"]
        )
    else:
        prompt_creator = PromptCreator()
        prompt = prompt_creator.infer_caption(
            input_img,
            visualize,
        )

    # detect objects to be inpainted
    dino_config, dino_prompt = GroundingDinoModelConfig(), GroundingDinoModelPrompt(
        objects=segment_objects
    )
    dino_wrapper = DinoModelWrapper(dino_config, dino_prompt)
    boxes = dino_wrapper.run_dino(input_img, show_annotation=True, run_id=run_id)

    # return original image if there is nothing to inpaint
    if len(boxes) == 0:
        return [input_img]

    # segment detected objects
    masks = None
    sam_config = None
    if segment_image:
        sam_config = SamModelConfig()
        sam_wrapper = SamModelWrapper(sam_config)
        masks = sam_wrapper.run_sam(input_img, boxes, show_masks=True, run_id=run_id)
        boxes = None

    elif process_box is not None:
        boxes = process_box(boxes)

    # process negative prompt
    if negative_prompt is not None:
        model_config.negative_prompt = (
            f"{model_config.negative_prompt}, {negative_prompt}"
        )

    # inpaint with stable diffusion
    sd_wrapper = StableDiffusionInpaintingWrapper(model_config)
    inpainted_images, image_qualities = sd_wrapper.run_inpainting(
        input_img,
        prompt,
        boxes=boxes,
        masks=masks,
        run_id=run_id,
        inpaint_only_mask=inpaint_only_mask,
    )

    if run_id:
        with open(config.example_results_path / f"{run_id}_config.json", "w") as f:
            json.dump(
                {
                    "input_img": input_img
                    if type(input_img) == str
                    else prompt_config["object"],
                    "segment_object": segment_objects,
                    "prompt": prompt,
                    "run_id": run_id,
                    "boxes": boxes.numpy().tolist() if boxes is not None else None,
                    "model_configs": {
                        "dino_config": dataclasses.asdict(dino_config),
                        "sam_config": dataclasses.asdict(sam_config)
                        if sam_config is not None
                        else None,
                        "sd_config": dataclasses.asdict(model_config),
                    },
                    "quality": {
                        "image_qualities": image_qualities,
                        "best_img": int(np.argmax(image_qualities))
                        if iqa_util.interpret_metric(model_config.quality_metric)
                        == "max"
                        else int(np.argmin(image_qualities)),
                    },
                    "inpaint_only_mask": inpaint_only_mask,
                },
                f,
            )

    return inpainted_images


if __name__ == "__main__":
    enervi_logger.init_logging("enervi-logger", level=logging.DEBUG)

    img_name = "candia/sportpark.jpg"
    run_id = "sportpark"
    visualize = "wind"
    inpaint_only_mask = False

    model_config = StableDiffusionInpaintingConfig(
        sd_model="use_flux_api",
        num_inference_steps=50,
        num_images_per_prompt=2,
        strength=0.9,
        guidance_scale=9.5,
        refiner_model="",
    )

    if visualize == "wind":
        segment_image = False
        process_box = bounding_box_processing.process_boxes_for_wind_turbines
    else:
        segment_image = True
        process_box = None

    inpaint(
        input_img=img_name,
        model_config=model_config,
        visualize=visualize,
        run_id=run_id,
        inpaint_only_mask=inpaint_only_mask,
        segment_image=segment_image,
        process_box=process_box,
    )
