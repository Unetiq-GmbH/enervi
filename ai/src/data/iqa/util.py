import torch
import numpy as np


def numpy_to_tensor(image: np.ndarray):
    image = torch.from_numpy(image)
    image = image.unsqueeze(0)
    image = image.permute(0, 3, 1, 2)

    return image


def interpret_metric(metric: str):
    """Return whether a metric should be maximized or minimized."""
    if metric == "clip_iqa":
        return "max"
    elif metric in {"piqe", "brisque"}:
        return "min"
    else:
        raise ValueError(f"No interpretation for metric {metric}")
