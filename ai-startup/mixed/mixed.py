import os
import base64

from google import genai
from google.genai import types

from io import BytesIO
from PIL import Image, ImageDraw, ImageFont
from concurrent.futures import ThreadPoolExecutor, as_completed

from gemini.gemini import main as gemini_main
from open_ai.open_ai import main as gpt_main

MAX_ATTEMPTS = 5

IMAGES_NEEDED = 4

def add_watermark(base64_image: str, lang: str) -> str:
    watermark_texts = {
        "en": "AI-generated image",
        "de": "KI-generiertes Bild"
    }
    watermark_text = watermark_texts.get(lang, "AI-generated image")

    image_data = base64.b64decode(base64_image)
    image = Image.open(BytesIO(image_data)).convert("RGBA")

    watermark_layer = Image.new("RGBA", image.size, (255, 255, 255, 0))
    draw = ImageDraw.Draw(watermark_layer)

    font_size = int(image.height * 0.03)
    try:
        font = ImageFont.truetype("arial.ttf", font_size)
    except OSError:
        font = ImageFont.load_default()

    # Calculate position using textbbox
    bbox = draw.textbbox((0, 0), watermark_text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    padding = 10
    position = (image.width - text_width - padding, image.height - text_height - padding)

    draw.text(position, watermark_text, font=font, fill=(255, 255, 255, 180))

    # Composite the watermark over the image
    watermarked_image = Image.alpha_composite(image, watermark_layer).convert("RGB")

    buffered = BytesIO()
    watermarked_image.save(buffered, format="JPEG", quality=92)
    buffered.seek(0)

    return base64.b64encode(buffered.read()).decode("utf-8")

def get_adjusted_visualization_type(visualization_type: str, adjustment: str) -> str:
    return f"{visualization_type}_{adjustment}" if adjustment not in (None, '') else visualization_type

def main(input_img_b64: str, visualization_type: str, adjustment: str, lang: str):
    images_gemini = []
    images_gpt = []
    attempts = 0

    adjusted_visualization_type = get_adjusted_visualization_type(visualization_type, adjustment)
 
    while (len(images_gemini) < 2 or len(images_gpt) < 2) and attempts < MAX_ATTEMPTS:
        print(f"Attempt {attempts + 1} - Currently have: "
              f"{len(images_gemini)} from gemini_main, {len(images_gpt)} from gpt_main")

        with ThreadPoolExecutor(max_workers=3) as executor:
            futures = [
                ("gpt", executor.submit(gpt_main, input_img_b64, adjusted_visualization_type)),
                ("gemini", executor.submit(gemini_main, input_img_b64, adjusted_visualization_type)),
                ("gemini", executor.submit(gemini_main, input_img_b64, adjusted_visualization_type)),
            ]

            for func_type, future in futures:
                try:
                    result = future.result()
                    if result:
                        if func_type == "gemini" and len(images_gemini) < 2:
                            images_gemini.extend(result)
                        elif func_type == "gpt" and len(images_gpt) < 2:
                            images_gpt.extend(result)
                except Exception as e:
                    print(f"Error in {func_type}: {e}")

        attempts += 1

    if len(images_gemini) < 2 or len(images_gpt) < 2:
        print(f"Warning: Only generated {len(images_gemini)} from gemini_main and "
              f"{len(images_gpt)} from gemini_main_1 after {MAX_ATTEMPTS} attempts.")

    resuts = []
    for image in images_gemini:
        resuts.append(add_watermark(image, lang))
    for image in images_gpt:
        resuts.append(add_watermark(image, lang))

    return resuts

