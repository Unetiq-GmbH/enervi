import cv2
import pathlib
import os
import torch
import numpy as np
import json

from src.data.iqa import piqe, clip_iqa, brisque
from src.data.config import example_results_path
from src.models.grounding_dino_model import transform_boxes_to_xyxy
from src import util


def get_quality_score(
    img: pathlib.Path | str | np.ndarray, metric: str, crop_img: np.ndarray = None
) -> float:
    """Compute a quality score for a single image."""

    supported_metrics = ["piqe", "clip_iqa", "brisque"]
    assert metric in supported_metrics, f"Choose one of {supported_metrics}"

    if not isinstance(img, np.ndarray):
        img = cv2.imread(str(img))

    if crop_img is not None:
        boxes = torch.tensor([crop_img])
        box = transform_boxes_to_xyxy(boxes, img.shape, logits=torch.tensor([1.0]))[0]
        # add some padding
        box = np.array(
            [
                box[0] - 50,
                box[1] - 50,
                box[2] + 50,
                box[3] + 50,
            ]
        )
        img = img[int(box[1]) : int(box[3]), int(box[0]) : int(box[2])]

    if metric == "piqe":
        quality_score = piqe.piqe(img)
    elif metric == "clip_iqa":
        quality_score = clip_iqa.clip_iqa(img)
    elif metric == "brisque":
        quality_score = brisque.compute_brisque(img)

    return round(quality_score, 3)


if __name__ == "__main__":
    img_path = example_results_path / ".." / "results_archive" / "runway_ml" / "03"
    img_dirs = os.listdir(img_path)
    img_dirs = [img_path / img for img in img_dirs if img.endswith(".png")]

    crop_img = None

    for img in img_dirs:
        score = get_quality_score(img, metric="brisque", crop_img=crop_img)

        util.ENERVI_LOGGER.info(f"{img, score}")
