import numpy as np
from torch import tensor
import torch
import matplotlib.pyplot as plt
import matplotlib.patches as patches

from src.util import enervi_logger


def pad_xyxy_box(box: np.ndarray, pad_factor: float) -> np.ndarray:
    """Add padding to a box in xyxy format."""
    pad_x1, pad_y1, pad_x2, pad_y2 = (
        int(box[0] - pad_factor * box[0]),
        int(box[1] - pad_factor * box[1]),
        int(box[2] + pad_factor * box[2]),
        int(box[3] + pad_factor * box[3]),
    )

    return np.array([pad_x1, pad_y1, pad_x2, pad_y2])


def relative_to_absolute_xyxy(box: np.ndarray, original_dims: tuple) -> np.ndarray:
    """Convert a box from relative to absolute coordinates."""
    x1, y1, x2, y2 = box
    x1, y1, x2, y2 = (
        int(x1 * original_dims[0]),
        int(y1 * original_dims[1]),
        int(x2 * original_dims[0]),
        int(y2 * original_dims[1]),
    )

    return np.array([x1, y1, x2, y2])


def box_to_square(box: np.ndarray, original_dims: tuple) -> np.ndarray:
    """Convert a box to a square by adding padding to the shorter side."""

    original_box = box.copy()
    x1, y1, x2, y2 = box
    max_length = max(x2 - x1, y2 - y1)
    # round to nearest int divisible by 8 for SD processing
    max_length = int(np.floor(max_length / 8) * 8)

    box = np.array(
        [
            int(x1 - (max_length - (x2 - x1)) / 2),
            int(y1 - (max_length - (y2 - y1)) / 2),
            int(x2 + (max_length - (x2 - x1)) / 2),
            int(y2 + (max_length - (y2 - y1)) / 2),
        ]
    )

    # move box left or right if exceeding image dimensions
    if box[0] < 0:  # exceeding left border
        box[2] = min(
            original_dims[1], np.ceil((box[2] - box[0]) / 8) * 8
        )  # bound to maximum width
        box[0] = 0
    elif box[2] > original_dims[1]:  # exceeding right border
        box[0] = max(box[0] - (box[2] - original_dims[1]), 0)  # bound to 0
        box[2] = original_dims[1]

    # move box up or down if exceeding image dimensions
    if box[1] < 0:  # exceeding top border
        box[3] = min(
            original_dims[0], np.ceil((box[3] - box[1]) / 8) * 8
        )  # bound to maximum height
        box[1] = 0
    elif box[3] > original_dims[0]:  # exceeding bottom border
        box[1] = max(box[1] - (box[3] - original_dims[0]), 0)  # bound to 0
        box[3] = original_dims[0]

    if box[2] - box[0] != box[3] - box[1]:
        enervi_logger.ENERVI_LOGGER.warning("Could not convert box to square")
        box = original_box

    return box


def slice_box(
    boxes: list, n_slices: int = 3, slice_width: float = 0.1, min_width: int = 0.05
) -> tensor:
    """Slice a box vertically into n random sub slices.
    Slice width is determined by the width of the box and the slice width factor.
    Expects box format cx, cy, w, h, relative."""

    # only consider one detected area to avoid overlapping slices
    box = boxes[0]

    # ensure that slice width is at least min_width
    box_slice_width = box[2] * slice_width
    box_slice_width = max(box_slice_width, min_width)

    # check if box is wide enough to be sliced; if not, return original box
    if box_slice_width * n_slices >= box[2]:
        return tensor(box).unsqueeze(0)

    # pick a single first x coordinate for the first slice
    starting_points = [np.random.uniform(box[0] - box[2] / 2, box[0] + box[2] / 2)]

    for _ in range(n_slices - 1):
        cx = np.random.uniform(box[0] - box[2] / 2, box[0] + box[2] / 2)
        # regenerate another x coordinate if it's too close to any other x coordinate to avoid overlapping slices
        while any(abs(cx - sp) < box_slice_width for sp in starting_points):
            cx = np.random.uniform(box[0] - box[2] / 2, box[0] + box[2] / 2)
        starting_points.append(cx)

    sliced_boxes = [
        [cx, float(box[1]), float(box_slice_width), float(box[3])]
        for cx in starting_points
    ]

    return tensor(sliced_boxes)


def move_full_box_up(boxes: list) -> list:
    """Move the lower half of the full bounding box to the upper half. Expects box to be in relative format, cx, cy, w, h."""

    for box in boxes:
        box[1] = box[1] - 0.5 * box[3]

    return boxes


def process_boxes_for_wind_turbines(boxes: tensor, n_patches: int = 3) -> tensor:
    """Process boxes for wind turbine placement. Expects boxes to be in relative format, cx, cy, w, h."""
    boxes = move_full_box_up(boxes)
    boxes = slice_box(boxes, n_slices=n_patches, slice_width=0.1)

    return boxes


def get_bounding_boxes_from_masks(masks: list | np.ndarray) -> tensor:
    """Find bounding box around each mask."""
    boxes = []
    for mask in masks:
        rows, cols = np.where(mask)
        x1, y1 = np.min(cols), np.min(rows)
        x2, y2 = np.max(cols), np.max(rows)

        cx, cy, w, h = (x1 + x2) / 2, (y1 + y2) / 2, x2 - x1, y2 - y1
        cx, cy, w, h = (
            cx / mask.shape[1],
            cy / mask.shape[0],
            w / mask.shape[1],
            h / mask.shape[0],
        )
        boxes.append([cx, cy, w, h])

    return tensor(boxes)


def draw_only_bounding_boxes(boxes, labels, img_size, save_path: str = None):
    """
    Save an image with bounding boxes.
    The torchvision.draw_bounding_boxes function doesn't work somehow, so this is a workaround.

    Args:
        image (Tensor): Input image tensor of shape (C x H x W) and dtype uint8.
        boxes (Tensor): Bounding boxes tensor of size (N, 4) in (xmin, ymin, xmax, ymax) format.
        labels (List[str]): List of labels for each bounding box.
        save_path (str): Path to save the resulting image.
    """

    if save_path is not None:
        # Convert tensor to numpy array
        image_np = torch.zeros((3, img_size[1], img_size[0]), dtype=torch.uint8).numpy()
        image_np = np.transpose(image_np, (1, 2, 0))
        boxes = np.array(boxes)

        fig, ax = plt.subplots(1)
        ax.imshow(image_np)

        for i in range(boxes.shape[0]):
            box = boxes[i]
            label = labels[i]

            rect = patches.Rectangle(
                (box[0], box[1]),
                box[2] - box[0],
                box[3] - box[1],
                linewidth=1,
                edgecolor="r",
                facecolor="none",
            )

            # Add the patch to the axis
            ax.add_patch(rect)
            ax.text(box[0], box[1], label, color="r", backgroundcolor="black")

        plt.axis("off")
        plt.savefig(save_path, bbox_inches="tight", pad_inches=0)
        plt.close()
