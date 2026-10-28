import logging
import warnings
from functools import partial


def log_warning(
    message: str,
    category,
    filename,
    lineno,
    file=None,
    line=None,
    logger: logging.Logger = logging.getLogger(),
):
    logger.warning(f"{filename}:{lineno} {category.__name__}: {message}")


def init_logging(name: str = "enervi-logger", level: int = logging.INFO):
    logger = logging.getLogger(name)

    if not logger.handlers:
        logger.setLevel(level)

        formatter = logging.Formatter(
            "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
        )

        console_handler = logging.StreamHandler()
        console_handler.setLevel(level)
        console_handler.setFormatter(formatter)
        logger.addHandler(console_handler)

        warnings.showwarning = partial(log_warning, logger=logger)

    return logger


ENERVI_LOGGER = logging.getLogger("enervi-logger")
