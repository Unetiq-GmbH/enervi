import json
import dataclasses
import numpy as np
import logging
from PIL import Image

from src.util.prompting.prompt_creator import PromptCreator
from src.models.sd_controlnet_model import (
    ControlnetConfig,
    ControlnetWrapper,
)

from src.data import config
from src.util import enervi_logger, image_processing
from src.util.prompting import prompt_processing
import src.data.iqa.util as iqa_util


def control_sd_output(
    input_img: str | Image.Image,
    model_config: ControlnetConfig,
    visualize: str,
    run_id: str,
    custom_injection_prompt: str = None,
    custom_negative_prompt: str = None
):
    if type(input_img) == str:
        input_img = str(config.example_image_path / input_img)
    input_img = Image.open(input_img) if isinstance(input_img, str) else input_img
    image_processing.check_input_image(input_img)

    prompt_config = prompt_processing.load_prompts()[visualize]
    if custom_negative_prompt is not None:
        model_config.negative_prompt = (
            f"{model_config.negative_prompt}, {custom_negative_prompt}"
        )
    elif (negative_prompt := prompt_config["negative_prompt"]) is not None:
        model_config.negative_prompt = (
            f"{model_config.negative_prompt}, {negative_prompt}"
        )

    prompt_creator = PromptCreator()
    prompt = prompt_creator.infer_caption(
        input_img,
        visualize,
        custom_injection_prompt=custom_injection_prompt
    )
    enervi_logger.ENERVI_LOGGER.info(f"Prompt: {prompt}")
    enervi_logger.ENERVI_LOGGER.info(f"Negative prompt: {model_config.negative_prompt}")

    controlnet_wrapper = ControlnetWrapper(model_config)
    generated_images, image_qualities = controlnet_wrapper.generate_image(
        prompt,
        input_img,
        run_id=run_id,
        enhance_prompt=True,
    )

    if run_id:
        with open(config.example_results_path / f"{run_id}_config.json", "w") as f:
            json.dump(
                {
                    "input_img": input_img if type(input_img) == str else visualize,
                    "prompt": prompt,
                    "run_id": run_id,
                    "model_configs": {
                        "controlnet_config": dataclasses.asdict(model_config),
                    },
                    "quality": {
                        "image_qualities": image_qualities,
                        "best_img": int(np.argmax(image_qualities))
                        if iqa_util.interpret_metric(model_config.quality_metric)
                        == "max"
                        else int(np.argmin(image_qualities)),
                    },
                },
                f,
            )

    return generated_images


if __name__ == "__main__":
    enervi_logger.init_logging("enervi-logger", level=logging.DEBUG)

    visualize = "utopian"
    img_name = "berlin/tegel.jpg"
    run_id = "utopian"
    model_config = ControlnetConfig()

    control_sd_output(
        img_name,
        run_id=run_id,
        model_config=model_config,
        visualize=visualize,
    )
