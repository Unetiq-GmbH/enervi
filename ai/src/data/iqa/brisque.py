import numpy as np

from piq import brisque
from src.data.iqa import util


def compute_brisque(image: np.ndarray) -> float:
    """Similar to piqe, the lower, the better."""
    image = util.numpy_to_tensor(image)
    return brisque(image, data_range=255).squeeze().item()
