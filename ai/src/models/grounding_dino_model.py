import matplotlib.pyplot as plt
import torch
from torch import tensor
from dataclasses import dataclass
import numpy as np
from PIL import Image

from groundingdino.util.slconfig import SLConfig
import groundingdino.models as gd_models
import groundingdino.util.utils as gd_utils
import groundingdino.util.inference as gd_inference
import groundingdino.datasets.transforms as T

from huggingface_hub import hf_hub_download

from src.data.config import example_results_path
from src.models.config import device, point_model_to_cache_dir
from src.util import enervi_logger, image_processing


@dataclass
class GroundingDinoModelConfig:
    # following https://github.com/IDEA-Research/Grounded-Segment-Anything/blob/main/grounded_sam.ipynb
    ckpt_repo_id: str = "ShilongLiu/GroundingDINO"
    ckpt_filename: str = "groundingdino_swinb_cogcoor.pth"
    ckpt_config_filename: str = "GroundingDINO_SwinB.cfg.py"


@dataclass
class GroundingDinoModelPrompt:
    objects: list[str]
    box_threshold: float = 0.3
    text_threshold: float = 0.25
    device: str = device


class DinoModelWrapper:
    def __init__(
        self,
        model_config: GroundingDinoModelConfig,
        prompt_config: GroundingDinoModelPrompt,
    ):
        self.model_config = model_config
        self.prompt_config = prompt_config

    def run_dino(
        self,
        input_img: str | Image.Image,
        show_annotation: bool = True,
        run_id: str = None,
    ) -> tensor:
        # numpy and tensor versions of the image
        image_source, image = load_image_from_path_or_pil(input_img)

        dino_model = self.load_model_hf()

        object_boxes, object_logits, object_phrases = [], [], []
        for object_to_detect in self.prompt_config.objects:
            enervi_logger.ENERVI_LOGGER.info(f"Detecting {object_to_detect}...")
            boxes, logits, phrases = gd_inference.predict(
                model=dino_model,
                image=image,
                caption=object_to_detect,
                box_threshold=self.prompt_config.box_threshold,
                text_threshold=self.prompt_config.text_threshold,
                device=self.prompt_config.device,
            )
            object_boxes.extend(boxes)
            object_logits.extend(logits)
            object_phrases.extend(phrases)
            enervi_logger.ENERVI_LOGGER.info(
                f"{object_to_detect}: {len(boxes)} instances detected"
            )

        if len(object_boxes) == 0:
            enervi_logger.ENERVI_LOGGER.warning(
                f"No {self.prompt_config.objects} detected"
            )
            raise ValueError(f"No {self.prompt_config.objects} detected in image, returning...")

        object_boxes, object_logits = torch.stack(object_boxes, dim=0), torch.stack(
            object_logits, dim=0
        )

        if show_annotation:
            annotated_frame = gd_inference.annotate(
                image_source=image_source,
                boxes=object_boxes,
                logits=object_logits,
                phrases=object_phrases,
            )
            self.show_annotation(annotated_frame, f"{run_id}_DINO" if run_id else None)

        return object_boxes

    def load_model_hf(self) -> gd_models.GroundingDINO:
        """
        Load a model from the HuggingFace Hub, save it in cache, or load it from cache if it's already there.
        Use the model config to specify the model checkpoint.
        https://github.com/IDEA-Research/GroundingDINO/blob/main/demo/image_editing_with_groundingdino_stablediffusion.ipynb
        """

        cache_config_file = hf_hub_download(
            repo_id=self.model_config.ckpt_repo_id,
            filename=self.model_config.ckpt_config_filename,
            cache_dir=point_model_to_cache_dir[self.model_config.ckpt_repo_id],
        )

        args = SLConfig.fromfile(cache_config_file)
        model = gd_models.build_model(args)
        args.device = self.prompt_config.device

        cache_file = hf_hub_download(
            repo_id=self.model_config.ckpt_repo_id,
            filename=self.model_config.ckpt_filename,
            cache_dir=point_model_to_cache_dir[self.model_config.ckpt_repo_id],
        )
        checkpoint = torch.load(cache_file, map_location=self.prompt_config.device)
        log = model.load_state_dict(
            gd_utils.clean_state_dict(checkpoint["model"]), strict=False
        )
        enervi_logger.ENERVI_LOGGER.info(
            f"DINO model loaded from {cache_file} \n => {log}"
        )
        model.eval()

        return model

    def show_annotation(self, annotated_frame: np.ndarray, file_id: str = None) -> None:
        annotated_frame = annotated_frame[..., ::-1]  # BGR to RGB

        plt.figure(frameon=False)
        plt.imshow(annotated_frame)
        plt.axis("off")

        if file_id is None:
            plt.show()
        else:
            plt.savefig(
                example_results_path / f"{file_id}.png",
                bbox_inches="tight",
                dpi=300,
                pad_inches=0,
            )

        plt.close()


def transform_boxes_to_xyxy(
    boxes: tensor, img_shape: tuple, logits: tensor = tensor([1])
) -> np.ndarray:
    """Make relative box coordinates absolute. Return as list of coordinates in x1 y1 x2 y2 format."""

    # adjust shape of the artificial logits tensor if needed
    if logits.shape[0] != boxes.shape[0]:
        logits = logits.repeat(boxes.shape[0], 1).squeeze()

    return gd_inference.Model.post_process_result(
        img_shape[0], img_shape[1], boxes, logits
    ).xyxy


def load_image_from_path_or_pil(
    img: str | Image.Image,
) -> tuple[np.array, torch.Tensor]:
    """Modification of the load_image function in grounding_dino/util/inference.
    Can also deal with PIL image as input."""
    transform = T.Compose(
        [
            T.RandomResize([800], max_size=1333),
            T.ToTensor(),
            T.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
        ]
    )

    image_source = image_processing.process_image_to_PIL(img)
    image = np.asarray(image_source)
    image_transformed, _ = transform(image_source, None)
    return image, image_transformed
