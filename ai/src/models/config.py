import os
import torch
from huggingface_hub.constants import HUGGINGFACE_HUB_CACHE
from src.util import enervi_logger

# Model weights are not part of this repository. Point the cache at a local
# directory with MODEL_CACHE_PATH, or leave it at the Hugging Face default.
RUNTIME_ENV = os.environ.get("RUNTIME_ENV", "local")
MODEL_CACHE_PATH = os.environ.get("MODEL_CACHE_PATH", HUGGINGFACE_HUB_CACHE)
DIFFUSERS_CACHE = MODEL_CACHE_PATH

enervi_logger.ENERVI_LOGGER.info(f"Using environment: {RUNTIME_ENV}")

point_model_to_cache_dir = {
    # image pre-processing
    "ShilongLiu/GroundingDINO": MODEL_CACHE_PATH,
    "sam_vit_b_01ec64.pth": MODEL_CACHE_PATH,
    # stable diffusion
    "stabilityai/stable-diffusion-xl-base-1.0": MODEL_CACHE_PATH,
    "stabilityai/stable-diffusion-2-inpainting": MODEL_CACHE_PATH,
    "runwayml/stable-diffusion-inpainting": MODEL_CACHE_PATH,
    "madebyollin/sdxl-vae-fp16-fix": MODEL_CACHE_PATH,
    # controlnet
    "diffusers/controlnet-canny-sdxl-1.0": MODEL_CACHE_PATH,
    # refiner
    "stabilityai/stable-diffusion-xl-refiner-1.0": MODEL_CACHE_PATH,
    # caption models
    "blip-base": MODEL_CACHE_PATH,
    "ViT-H-14/laion2b_s32b_b79k": MODEL_CACHE_PATH,
}

device = "cuda" if torch.cuda.is_available() else "cpu"
enervi_logger.ENERVI_LOGGER.info(f"Using device: {device}")
