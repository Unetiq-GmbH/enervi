import numpy as np

from src.data.iqa import assess_image_quality


def evaluate_quality(images: list, quality_metric: str, reshape=None) -> list:
    image_qualities = []

    if reshape is not None:
        images = [np.resize(image, (reshape[1], reshape[0])) for image in images]

    for image in images:
        score = assess_image_quality.get_quality_score(np.array(image), quality_metric)
        image_qualities.append(score)

    return image_qualities
