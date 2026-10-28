from PIL import Image, UnidentifiedImageError
import io
import base64

from src.inpainting_demo import inpaint
from src.models.sd_inpainting_model import StableDiffusionInpaintingConfig
from src.models.sd_controlnet_model import ControlnetConfig
from src.controlnet_demo import control_sd_output
from src.util import image_processing, bounding_box_processing
from src.util.watermark import watermark
from src.deploy import config


def load_image(image: (bytes, str)) -> Image.Image:
    """
    Loads the image as a PIL.Image instance, based on the type given.
    Args:
        image (str or file object): The image to be loaded
    returns:
        PIL.Image instance
    """

    if type(image) is str:
        image = io.BytesIO(base64.b64decode(image))

    try:
        img = Image.open(image)
    except UnidentifiedImageError:
        raise OSError("Could not read image.")

    if img.mode != "RGB":
        try:
            img = img.convert("RGB")
        except OSError:
            raise OSError("Given image could not be converted to RGB.")
    return img


def PIL_to_bytes(image: Image.Image) -> io.BytesIO:
    """
    Converts a PIL.Image instance to a bytes object.
    Args:
        image (PIL.Image): The image to be converted
    returns:
        io.BytesIO instance
    """
    image_bytes = io.BytesIO()
    image.save(image_bytes, format="JPEG")
    image_bytes.seek(0)

    return image_bytes


def edit_image(
    input_img: Image.Image,
    visualize: str,
    infer_prompt: bool = True,
    test_mode: bool = True,
    save_results: bool = False,
    custom_injection_prompt: str = None,
    custom_negative_prompt: str = None
) -> Image.Image:
    """Edit an image with a generative model.

    Args:
        input_img: PIL.Image to be edited
        visualize: 'solar' (solar panels on roofs), 'wind' (wind turbines on a field), 'vegetation' (dry), 'flood', 'utopia', 'dystopia'.
        infer_prompt: If True, infer the prompt from the image using BLIP. Otherwise use the static prompt from the prompt_config. Only applicable to inpainting.
        test_mode: If True, uses a smaller model with fewer steps for faster inference to enable local testing.
                Note that the stable diffusion 2.0 model still needs to be available (will be downloaded). Only applicable to inpainting.
        save_results: Save intermediate results to the results folder.
        custom_injection_prompt: Custom prompt enabled to let use test their own injection prompt
        custom_negative_prompt: Custom prompt enabled to let use test their own negative prompt

    returns:
        edited PIL.Image
    """

    # --- inpainting functionalities ---
    if visualize in config.inpainting_visualization_types:
        strengths = {"wind": 0.6, "solar": 0.9, "vegetation": 0.8, "flood": 0.9, "flux_wind": 0.9}

        if visualize != "flux_wind":
            # for more options see src/models/sd_inpainting_model
            model_config = StableDiffusionInpaintingConfig(
                sd_model="stabilityai/stable-diffusion-2-inpainting"
                if test_mode
                else "stabilityai/stable-diffusion-xl-base-1.0",
                num_inference_steps=5 if test_mode else 50,
                num_images_per_prompt=1,
                strength=strengths[visualize],
                guidance_scale=9.5,
                refiner_model=""
                if test_mode
                else "stabilityai/stable-diffusion-xl-refiner-1.0",
            )
        else:
            model_config = StableDiffusionInpaintingConfig(
                sd_model="use_flux_api",
                num_inference_steps=50,
                num_images_per_prompt=2,
                strength=0.9,
                guidance_scale=9.5,
                refiner_model="",
            )

        edited_images = inpaint(
            model_config=model_config,
            input_img=input_img,
            visualize=visualize,
            run_id=visualize if save_results else "",
            inpaint_only_mask=False,
            segment_image=visualize != "wind",
            process_box=bounding_box_processing.process_boxes_for_wind_turbines
            if visualize == "wind"
            else None,
            infer_prompt=infer_prompt,
        )

    elif visualize in config.controlnet_visualization_types:
        # for more options see src/models/sd_controlnet_model
        model_config = ControlnetConfig(
            sd_model="diffusers/controlnet-canny-sdxl-1.0",
            num_images_per_prompt=1,
            num_inference_steps=50,
            base_model="stabilityai/stable-diffusion-xl-base-1.0",
            conditioning_scale=0.8,
            refiner_model="stabilityai/stable-diffusion-xl-refiner-1.0",
        )

        edited_images = control_sd_output(
            input_img,
            visualize=visualize,
            run_id=visualize if save_results else None,
            model_config=model_config,
            custom_injection_prompt=custom_injection_prompt,
            custom_negative_prompt=custom_negative_prompt
        )

    else:
        raise ValueError(f"Unknown visualization '{visualize}'.")

    edited_img = image_processing.process_image_to_PIL(edited_images[0], resize_to=input_img.size)
    edited_img = watermark.insert_watermark(edited_img)

    return edited_img
