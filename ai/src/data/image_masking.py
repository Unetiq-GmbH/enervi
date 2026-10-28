import numpy as np
import matplotlib.pyplot as plt
from scipy.ndimage import binary_dilation
from torch import tensor

from src.util import enervi_logger
from src.data.config import example_results_path
from src.models import grounding_dino_model as gd_model


def image_mask_overlay(image: np.ndarray, masks: list, file_id: str = None):
    plt.figure(frameon=False)
    plt.imshow(image)
    show_all_masks(masks)
    plt.axis("off")

    if file_id is None:
        plt.show()
    else:
        plt.savefig(
            example_results_path / f"{file_id}.png",
            dpi=300,
            bbox_inches="tight",
            pad_inches=0,
        )

    plt.close()


def show_all_masks(masks: list):
    # display all generated masks in different colors on a pyplot axis
    # https://github.com/facebookresearch/segment-anything/blob/main/notebooks/automatic_mask_generator_example.ipynb

    if not masks:
        print("No masks to show")
        return

    sorted_annotations = sorted(masks, key=(lambda x: x["area"]), reverse=True)
    ax = plt.gca()
    ax.set_autoscale_on(False)

    img = np.ones(
        (
            sorted_annotations[0]["segmentation"].shape[0],
            sorted_annotations[0]["segmentation"].shape[1],
            4,
        )
    )
    img[:, :, 3] = 0
    for ann in sorted_annotations:
        m = ann["segmentation"]
        color_mask = np.concatenate([np.random.random(3), [0.35]])
        img[m] = color_mask

    ax.imshow(img)


def generate_mask(
    image: np.ndarray,
    masks: list = None,
    boxes: tensor = None,
) -> np.ndarray:
    """Generate a black-white pixel mask to pass to SD model.
    Either takes SAM segmentation output masks (boolean, same shape as image) or bounding boxes from DINO model in relative cx,cy,w,h format.
    """

    assert (masks is None) != (
        boxes is None
    ), "Either segmentation masks or bounding boxes must be provided."

    sd_mask = image.copy()
    sd_mask = sd_mask[:, :, :1].squeeze()

    # reset all white pixels to avoid filling of original white pixels
    sd_mask[sd_mask == 255] = 0

    if masks is None:
        enervi_logger.ENERVI_LOGGER.info("Generating SD mask from boxes...")
        boxes_xyxy = gd_model.transform_boxes_to_xyxy(boxes, image.shape)
        for box in boxes_xyxy:
            sd_mask[int(box[1]) : int(box[3]), int(box[0]) : int(box[2])] = 255
    else:
        enervi_logger.ENERVI_LOGGER.info(
            "Generating SD mask from segmentation masks..."
        )
        for mask in masks:
            sd_mask[mask["segmentation"]] = 255

    # make all non-masked pixels black
    sd_mask[sd_mask != 255] = 0

    return sd_mask


def pad_mask(mask: np.ndarray, dilation_size: int):
    """On a mask with 255, 0 values, add padding to the segmentation mask by dilating it."""
    binary_mask = mask == 255
    dilated_mask = binary_dilation(binary_mask, iterations=dilation_size)
    dilated_mask = np.where(dilated_mask, 255, 0)

    return dilated_mask
