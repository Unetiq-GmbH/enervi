from PIL import Image
from clip_interrogator import Interrogator, Config
from clip_interrogator.clip_interrogator import (
    CAPTION_MODELS,
    AutoProcessor,
    BlipForConditionalGeneration,
)
import torch

from src.models.config import device, point_model_to_cache_dir
from src.util import enervi_logger
from src.util.prompting.prompt_processing import load_prompts

from src.data.config import example_image_path


class BLIPCaptioner(Interrogator):
    """Hacky subclass to avoid loading the CLIP model if only the BLIP captioner is required.
    Also, hack the loading of the caption model to allow custom cache dirs."""

    def __init__(self, config: Config):
        """Reduced init method from CLIP-Interrogator."""
        self.config = config
        self.device = config.device
        self.dtype = torch.float16 if self.device == "cuda" else torch.float32
        self.caption_offloaded = True
        self.cache_dir = point_model_to_cache_dir[config.caption_model_name]
        self.load_caption_model()

    def load_caption_model(self):
        if self.config.caption_model is None and self.config.caption_model_name:
            if not self.config.quiet:
                print(f"Loading caption model {self.config.caption_model_name}...")

            model_path = CAPTION_MODELS[self.config.caption_model_name]
            caption_model = BlipForConditionalGeneration.from_pretrained(
                model_path, torch_dtype=self.dtype, cache_dir=self.cache_dir
            )
            self.caption_processor = AutoProcessor.from_pretrained(
                model_path, cache_dir=self.cache_dir
            )

            caption_model.eval()
            if not self.config.caption_offload:
                caption_model = caption_model.to(self.config.device)
            self.caption_model = caption_model
        else:
            self.caption_model = self.config.caption_model
            self.caption_processor = self.config.caption_processor


class PromptCreator:
    def __init__(
        self,
        clip_model: str | None = None,  # or "ViT-H-14/laion2b_s32b_b79k"
        caption_model: str = "blip-base",
    ):
        """
        This model is not intended for deployment of any kind (https://huggingface.co / laion / CLIP - ViT - H - 14 - laion2B - s32B - b79K).
        https: // github.com / pharmapsychotic / clip - interrogator
        """
        self.clip_model = clip_model
        config = Config(
            clip_model_name=self.clip_model,
            clip_model_path=point_model_to_cache_dir[self.clip_model]
            if self.clip_model is not None
            else None,
            caption_model_name=caption_model,
            caption_max_length=32,
            device=device,
            # this only applies to the clip model
            download_cache=True,
            cache_path=f"{point_model_to_cache_dir[self.clip_model]}/clip-cache/"
            if self.clip_model is not None
            else None,
        )

        if self.clip_model is None:
            self.interrogator = BLIPCaptioner(config)
        else:
            self.interrogator = Interrogator(config)

    def infer_caption(self, img: Image.Image, visualize: str = None, custom_injection_prompt: str = None) -> str:
        """
        Generate a single caption for a given image.
        Post-process caption to prompt if a visualization type is given.
        """
        enervi_logger.ENERVI_LOGGER.info("Inferring caption")
        caption = self.interrogator.generate_caption(img)

        if custom_injection_prompt is not None:
            return self.caption_to_prompt(caption, visualize, custom_injection_prompt=custom_injection_prompt)
        elif visualize is not None:
            return self.caption_to_prompt(caption, visualize)

        return caption

    def infer_prompt(self, img: Image.Image) -> str:
        """
        Generate a caption for a given image with different flavors like style, artists.
        """
        assert self.clip_model is not None, "No CLIP model provided"
        enervi_logger.ENERVI_LOGGER.info("Inferring prompt")

        return self.interrogator.interrogate(img, min_flavors=2, max_flavors=6)

    @staticmethod
    def caption_to_prompt(caption: str, visualize: str, custom_injection_prompt: str = None) -> str:
        """
        Insert the editing prompt into the caption.
        Add some generic prompt parts.
        """

        # load the editing instruction
        prompt_config = load_prompts()
        if visualize in prompt_config.keys() and custom_injection_prompt is None:
            prompt_to_inject = prompt_config[visualize]["injection"]
        elif visualize not in prompt_config.keys() and custom_injection_prompt is None:
            raise ValueError(f"No prompts found for {visualize}")
        else:
            prompt_to_inject = custom_injection_prompt

        caption = f"photograph of {caption}"
        prompt = [caption, prompt_to_inject, "high quality", "detailed", "stockphoto"]
        prompt = ", ".join(prompt)

        return prompt


if __name__ == "__main__":
    img_name = "field_3.jpg"
    img = Image.open(str(example_image_path / img_name))
    prompt_creator = PromptCreator(clip_model=None)
    caption = prompt_creator.infer_caption(img)
    print(caption)

    prompt = prompt_creator.caption_to_prompt(caption, "wind")
    print(prompt)
