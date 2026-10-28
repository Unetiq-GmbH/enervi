from dataclasses import dataclass
import torch
from torch import Tensor
import numpy as np
from PIL import Image
import os
import wget

from segment_anything import (
    SamAutomaticMaskGenerator,
    SamPredictor,
    sam_model_registry,
    build_sam_vit_b,
)
from groundingdino.util import box_ops as gd_box_ops

from src.models.config import point_model_to_cache_dir
from src.data import image_masking
from src.util import enervi_logger, image_processing


@dataclass
class SamModelConfig:
    # vit_h > vit_l > vit_b; inference will be slower with growing model capacity
    model_type: str = "vit_b"
    # the model checkpoint is expected to be located in this directory
    cache_dir: str = point_model_to_cache_dir["sam_vit_b_01ec64.pth"]
    checkpoint: str = "sam_vit_b_01ec64.pth"
    checkpoint_path: str = os.path.join(cache_dir, checkpoint)


class SamModelWrapper:
    def __init__(self, config: SamModelConfig):
        self.sam_config = config
        self._load_model()
        self.sam_mask_generator = SamAutomaticMaskGenerator(
            sam_model_registry[self.sam_config.model_type](
                self.sam_config.checkpoint_path
            )
        )
        self.sam_predictor = SamPredictor(
            build_sam_vit_b(checkpoint=self.sam_config.checkpoint_path)
        )

    def run_sam(
        self,
        input_img: str | Image.Image,
        boxes: Tensor = None,
        show_masks: bool = True,
        run_id=None,
    ) -> list:
        image = image_processing.process_image_to_cv2(input_img)

        if boxes is None:
            masks = self.generate_all_masks(image)

        else:
            masks = self.generate_masks_by_boxes(image, boxes)

        if show_masks:
            image_masking.image_mask_overlay(
                image, masks, file_id=f"{run_id}_SAM" if run_id else None
            )

        return masks

    def generate_all_masks(self, image: np.ndarray) -> list:
        mask_generator = self.sam_mask_generator

        enervi_logger.ENERVI_LOGGER.info("Finding all segmentations...")
        return mask_generator.generate(image)

    def generate_masks_by_boxes(self, image: np.ndarray, boxes: Tensor) -> list:
        sam_predictor = self.sam_predictor
        sam_predictor.set_image(image)

        transformed_boxes = self._transform_dino_boxes(image.shape, boxes)

        enervi_logger.ENERVI_LOGGER.info(
            "Finding segmentations for given object boxes..."
        )
        masks, _, _ = sam_predictor.predict_torch(
            point_coords=None,
            point_labels=None,
            boxes=transformed_boxes,
            multimask_output=False,
        )

        # imitate the format of the full mask generation
        masks = [
            {"segmentation": mask.numpy().squeeze(), "area": 1.0} for mask in masks
        ]

        return masks

    def _transform_dino_boxes(self, image_shape: tuple, boxes: Tensor) -> Tensor:
        """
        De-normalize boxes from DINO model to original image shape for use in SAM.
        See https://github.com/IDEA-Research/Grounded-Segment-Anything/blob/main/grounded_sam.ipynb
        """

        H, W, _ = image_shape
        boxes_xyxy = gd_box_ops.box_cxcywh_to_xyxy(boxes) * torch.Tensor([W, H, W, H])
        return self.sam_predictor.transform.apply_boxes_torch(
            boxes_xyxy, image_shape[:2]
        )

    def _load_model(self):
        if not os.path.exists(self.sam_config.checkpoint_path):
            enervi_logger.ENERVI_LOGGER.info(
                f"Downloading SAM model to {self.sam_config.cache_dir}..."
            )
            wget.download(
                f"https://dl.fbaipublicfiles.com/segment_anything/{self.sam_config.checkpoint}",
                out=self.sam_config.cache_dir,
            )
        else:
            enervi_logger.ENERVI_LOGGER.info(
                f"SAM model loaded from {self.sam_config.checkpoint_path}"
            )
