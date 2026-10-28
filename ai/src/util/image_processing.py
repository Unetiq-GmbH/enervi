import numpy as np
from PIL import Image
from matplotlib import pyplot as plt
from torch import tensor
import cv2

from src.util import enervi_logger


def process_image_to_PIL(
    image: np.ndarray | Image.Image | str, resize_to: tuple = None
) -> Image.Image:
    if isinstance(image, np.ndarray):
        if image.dtype == np.float32:
            image = image * 255
        image = Image.fromarray(image.astype(np.uint8))

    if isinstance(image, str):
        image = Image.open(image).convert("RGB")

    if resize_to is not None:
        image = image.resize(resize_to)
    return image


def process_image_to_cv2(input_img: np.ndarray | Image.Image | str) -> np.ndarray:
    if isinstance(input_img, str):
        image = cv2.cvtColor(cv2.imread(input_img), cv2.COLOR_BGR2RGB)
    else:
        image = np.asarray(input_img).astype(np.uint8)

    return image


def show_image(img, file_path, cmap=None, box_to_draw: tensor = None) -> None:
    plt.imshow(img, cmap=cmap)

    if box_to_draw is not None:
        plt.plot(
            [
                box_to_draw[0],
                box_to_draw[2],
                box_to_draw[2],
                box_to_draw[0],
                box_to_draw[0],
            ],
            [
                box_to_draw[1],
                box_to_draw[1],
                box_to_draw[3],
                box_to_draw[3],
                box_to_draw[1],
            ],
            color="red",
            linewidth=0.5,
        )
    plt.axis("off")
    if file_path is not None:
        plt.savefig(
            file_path,
            dpi=300,
            bbox_inches="tight",
            pad_inches=0,
        )
    else:
        plt.show()
    plt.close()


def fill_original_image(
    original_image: np.ndarray, inpainted_image, mask: np.ndarray
) -> np.ndarray:
    """Fill original image with inpainted image where mask is white."""

    original_image = original_image.copy()
    original_image[mask == 255] = np.array(inpainted_image)[mask == 255]

    return original_image


def resize_image_within_boundary(
    image: np.ndarray, max_res: tuple = (1024, 1024)
) -> np.ndarray:
    pil_image = process_image_to_PIL(image)
    width, height = pil_image.size
    max_width, max_height = min(max_res[0], width), min(max_res[1], height)

    # Calculate the new dimensions while preserving the aspect ratio
    aspect_ratio = width / height
    new_width = min(max_width, int(max_height * aspect_ratio))
    new_height = min(max_height, int(max_width / aspect_ratio))

    # make divisible by eight
    new_width = new_width - (new_width % 8)
    new_height = new_height - (new_height % 8)

    enervi_logger.ENERVI_LOGGER.info(
        f"Resizing image from {width}x{height} to {new_width}x{new_height}"
    )

    # Resize the image while preserving the aspect ratio
    pil_image = pil_image.resize((new_width, new_height))

    # Convert the resized PIL image back to a numpy array
    return np.array(pil_image)


def enlarge_image(image: np.ndarray, enlarge_to=1024):
    width, height = image.shape[1], image.shape[0]

    if width >= enlarge_to or height >= enlarge_to:
        return image

    # Calculate the new dimensions while preserving the aspect ratio
    aspect_ratio = width / height
    if aspect_ratio > 1:
        new_width = enlarge_to
        new_height = int(enlarge_to / aspect_ratio)
    else:
        new_width = int(enlarge_to * aspect_ratio)
        new_height = enlarge_to

    # make divisible by eight
    new_width = new_width - (new_width % 8)
    new_height = new_height - (new_height % 8)

    enervi_logger.ENERVI_LOGGER.info(
        f"Enlarging image from {width}x{height} to {new_width}x{new_height}"
    )

    # Resize the image while preserving the aspect ratio
    pil_image = process_image_to_PIL(image)
    pil_image = pil_image.resize((new_width, new_height))

    return np.array(pil_image)


def resize_image_for_sdxl(image: np.ndarray):
    """https://www.reddit.com/r/StableDiffusion/comments/15c3rf6/sdxl_resolution_cheat_sheet/"""

    sdxl_ratios = {
        1.0: (1024, 1024),
        1.29: (1152, 896),
        0.78: (896, 1152),
        1.46: (1216, 832),
        0.68: (832, 1216),
        1.75: (1344, 768),
        0.57: (768, 1344),
        2.4: (1536, 640),
        0.42: (640, 1536),
    }

    width, height = image.shape[1], image.shape[0]
    aspect_ratio = width / height

    closest_ratio = min(sdxl_ratios, key=lambda x: abs(x - aspect_ratio))
    new_width, new_height = sdxl_ratios[closest_ratio]

    enervi_logger.ENERVI_LOGGER.info(
        f"Resizing image from {width}x{height} to {new_width}x{new_height}"
    )

    # Resize the image while preserving the aspect ratio
    pil_image = process_image_to_PIL(image)
    pil_image = pil_image.resize((new_width, new_height))

    return np.array(pil_image)


def check_input_image(img: Image.Image):
    dimension_sum = 1024
    if img.size[0] + img.size[1] < dimension_sum:
        raise ValueError(
            f"Image is too small. Dimensions should add up to at least {dimension_sum}."
        )
    return True
