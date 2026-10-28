import numpy as np
import torch
from piq import CLIPIQA

from src.data.iqa import util


def clip_iqa(image: np.ndarray) -> float:
    """Scores [0,1], higher meaning better quality."""
    image = util.numpy_to_tensor(image)

    clipiqa = CLIPIQA(data_range=255)
    score = clipiqa(image).squeeze()

    return score.item()
