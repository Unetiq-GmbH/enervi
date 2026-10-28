from PIL import Image
import pathlib

watermark_path = pathlib.Path(__file__).parent / "watermark.png"


def insert_watermark(img: Image.Image) -> Image.Image:
    """Add the enerVi watermark to the given image."""
    width, height = img.size
    watermark = Image.open(watermark_path)
    watermark = watermark.convert("RGBA")

    alpha = watermark.split()[3]
    # set alpha dynamically to avoid removing the background
    alpha = alpha.point(lambda x: x * 0.5)
    # make transparent
    watermark.putalpha(alpha)

    width_wm, height_wm = watermark.size
    target_size = (int(width * 0.1), int(height_wm * (width * 0.1 / width_wm)))
    watermark.thumbnail(target_size)

    x, y = 0, 0  # top left corner
    img.paste(watermark, (x, y), watermark)

    return img
