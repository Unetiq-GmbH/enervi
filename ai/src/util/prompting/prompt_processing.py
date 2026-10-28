import json
import pathlib

from compel import Compel, ReturnedEmbeddingsType
from diffusers import DiffusionPipeline

from src.util import enervi_logger


def load_prompts(
    path: pathlib.Path = pathlib.Path(__file__).parents[2] / "prompts.json",
) -> dict:
    with open(path, "r") as f:
        prompts = json.load(f)
    return prompts


def enhance_prompt(prompt: str, pipeline: DiffusionPipeline):
    """Compute caption embeddings to allow caption weighting.
    https://huggingface.co/docs/diffusers/main/en/using-diffusers/weighted_prompts
    """
    if "xl" in pipeline.name_or_path:
        prompt_enhancer = Compel(
            tokenizer=[pipeline.tokenizer, pipeline.tokenizer_2],
            text_encoder=[pipeline.text_encoder, pipeline.text_encoder_2],
            returned_embeddings_type=(
                ReturnedEmbeddingsType.PENULTIMATE_HIDDEN_STATES_NON_NORMALIZED
            ),
            requires_pooled=[False, True],
        )

    else:
        prompt_enhancer = Compel(
            tokenizer=pipeline.tokenizer,
            text_encoder=pipeline.text_encoder,
            requires_pooled=False,
        )
    enervi_logger.ENERVI_LOGGER.info("Enhancing prompt...")
    return prompt_enhancer(prompt)
