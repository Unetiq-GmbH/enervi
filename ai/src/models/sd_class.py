import abc
from dataclasses import dataclass


@dataclass
class StableDiffusionConfig(abc.ABC):
    sd_model: str
    device: str
    num_images_per_prompt: int
    num_inference_steps: int
    negative_prompt: str
    quality_metric: str


class StableDiffusionWrapper(abc.ABC):
    @abc.abstractmethod
    def __init__(self):
        self.sd_config = None
        self.sd_pipeline = None
