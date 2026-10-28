import os
import base64

from google import genai
from google.genai import types

from io import BytesIO
from PIL import Image, ImageDraw, ImageFont
from concurrent.futures import ThreadPoolExecutor, as_completed

API_KEY = os.getenv("GEMINI_API_KEY", "")

MAX_ATTEMPTS = 5
IMAGES_NEEDED = 4



def b64_to_pil(b64_string):
    if ',' in b64_string:
        b64_string = b64_string.split(',')[1]
    image_data = base64.b64decode(b64_string)
    image = Image.open(BytesIO(image_data))
    return image

def pil_to_b64(image: Image.Image) -> str:
    buffered = BytesIO()
    image.save(buffered, format='PNG')
    b64_string = base64.b64encode(buffered.getvalue()).decode('utf-8')
    return b64_string

def get_prompt_and_temperature(visualization_type: str, custom_prompt: str | None = None):
    prompts = {
        "solar": (
            "If the reference image contains any houses or buildings, add realistic solar panels only on the existing rooftops "
            "without modifying their shape or structure; do not create or insert any new buildings, structures, or artificial elements. "
            "If there are no buildings present, place ground-mounted solar panels in appropriate open areas such as flat fields, plains, "
            "or naturally cleared land surfaces suitable for solar installation. "
            "Add solar panels in no more than two distinct and spatially separated locations. "
            "All panels should be oriented in roughly the same direction, simulating real-world solar alignment toward the sun. "
            "Preserve all original visual elements of the image and do not introduce any irrelevant or unrelated content such as vehicles, "
            "people, or infrastructure."
        ),
        "solar_roofs_only": (
            "Add realistic solar panels exclusively on existing rooftops of houses or buildings visible in the reference image. "
            "Do not place any solar panels on the ground or in open areas. "
            "Do not modify the shape, structure, or appearance of the rooftops. "
            "Do not create or insert any new buildings, structures, or artificial elements. "
            "Add solar panels in no more than two distinct rooftop locations. "
            "All panels should be oriented in roughly the same direction, reflecting realistic solar alignment toward the sun. "
            "Preserve all original visual elements of the image and do not introduce any irrelevant or unrelated content such as "
            "vehicles, people, or infrastructure."
        ),
        "solar_open_spaces_only": (
            "Do not place any solar panels on rooftops or buildings. "
            "Add realistic ground-mounted solar panels only in suitable open areas visible in the reference image, "
            "such as flat fields, plains, or naturally cleared land surfaces that appear appropriate for solar installation. "
            "Do not create or insert any new buildings, structures, or artificial elements. "
            "Add solar panels in no more than two distinct and spatially separated ground locations. "
            "All panels should be oriented in roughly the same direction, simulating real-world solar alignment toward the sun. "
            "Preserve all original visual elements of the image and do not introduce any irrelevant or unrelated content such as "
            "vehicles, people, or infrastructure."
        ),
        "wind": (
            "Add a maximum of 2 wind turbines to the image, placing them only in the far background; "
            "do not place turbines in the foreground or middle ground; they must appear small and distant, "
            "matching the scale and perspective; ensure turbines are realistically grounded — standing on the ground, "
            "not floating or disconnected; add turbines only to natural landscapes (such as fields, hills, or rural areas), "
            "never in urban or residential scenes; if a large object partially blocks the background, place the turbines behind it "
            "so they remain visible but not dominant; if the central object looks completely out of place or unnatural in the composition, "
            "it may be removed; do not remove or alter any other elements, and do not add unrelated or artificial objects; "
            "the final image must look highly realistic and visually natural, as if the turbines were part of the original photograph."
        ),
        "no-climate-protection": (
            "Add heavy air pollution and dense industrial smog across the scene to create a degraded atmosphere; "
            "simulate environmental damage by replacing most green vegetation with dry, withered grass, leafless or dead trees, "
            "and faded, desaturated colors — but do not make the image black and white; "
            "do not add fire, flames, or visible smoke trails; remove any visible people from the image; "
            "if there are solar panels or wind turbines, remove them completely; "
            "the final image should look bleak, neglected, and highly realistic, reflecting the consequences of severe environmental neglect."
        ),
        "greening-and-de-sealing": (
            "Add moderate ecological greening to the scene: install green roofs on suitable buildings, "
            "and replace some paved areas or parking spaces with small green zones such as grass patches, shrubs, "
            "or low-maintenance greenery; keep main streets, driveways, and sidewalks mostly unchanged and functional; "
            "do not place vegetation (especially grass or flowers) on roads or any area clearly used for vehicle movement; "
            "the added greenery should appear realistic, context-aware, and well-integrated into the existing urban environment."
        ),
        "sealing": (
            "Replace grass and green areas with urban surfaces such as parking lots, paved plazas, or concrete walkways — "
            "but avoid large, uninterrupted paved zones; maintain a balanced, realistic urban layout with a mix of sealed "
            "and open areas; if there are many trees, reduce their number by about half, preserving natural distribution "
            "and avoiding harsh gaps; do not add any new buildings or structures; "
            "the transformation should reflect realistic urban densification, not oversimplified paving."
        ),
        "alternative-transportation": (
            "Remove all cars from the image. Add several people riding bicycles, along with one realistically placed public bus "
            "on a proper road lane (not on sidewalks or grass); if the image shows a large multi-lane street, place two buses "
            "instead of one. Optionally, include trains on visible tracks, bike lanes, and cargo bikes, all integrated naturally "
            "into the scene. You may also show a few children playing or interacting on widened sidewalks or pedestrian spaces. "
            "Ensure all elements are properly scaled and positioned realistically, with no floating or misplaced objects. "
            "Preserve the original visual elements not related to transportation."
        ),
        "alternative-transportation_buses_and_or_trains_only": (
            "Remove all cars and bicycles from the image. "
            "Add one realistically placed public bus on a proper road lane (not on sidewalks or grass); "
            "if the image shows a large multi-lane street, place two buses instead of one. "
            "Optionally, include trains on visible tracks. "
            "Do not add bicycles, bike lanes, cargo bikes, or any other forms of personal transportation. "
            "Ensure all elements are properly scaled and positioned realistically, with no floating or misplaced objects. "
            "Preserve all original visual elements not related to transportation."
        ),
        "alternative-transportation_bike_infrastructure_only": (
            "Remove all cars and public transport vehicles from the image. "
            "Add several people riding bicycles, bike lanes, and cargo bikes in appropriate areas such as streets or pedestrian paths. "
            "Do not include buses, trains, or other motorized vehicles. "
            "Optionally, show a few children playing or interacting on widened sidewalks or pedestrian spaces. "
            "Ensure all elements are properly scaled and positioned realistically, with no floating or misplaced objects. "
            "Preserve all original visual elements not related to bicycle infrastructure."
        ),
        "flood": (
            "Transform the scene into a realistic urban flood after heavy rain: show streets, sidewalks, "
            "and lower parts of existing buildings partially submerged in water; existing cars should appear partially underwater "
            "(e.g. wheels or doors submerged); do not add any new buildings, vehicles, or objects; "
            "keep the original camera angle, scale, and scene composition unchanged; "
            "avoid rain or storm clouds — depict only the aftermath; "
            "ensure the floodwater, reflections, and lighting look highly realistic and naturally integrated."
        ),
        "drought": (
            "Change the scene to depict a realistic drought: replace green areas with dry, withered grass, "
            "and turn existing trees into leafless or dried-out versions; show cracks in asphalt and soil surfaces where appropriate; "
            "maintain existing streets — do not replace them with sand, dirt, or desert vegetation; "
            "apply a subtle yellowish or dusty hue to the lighting, simulating a dry, arid atmosphere; "
            "keep all buildings, roads, and layout unchanged, and do not add new objects."
        ),       
    }

    if visualization_type == "custom_prompt":
        if "_" not in custom_prompt:
            return custom_prompt, 0.1
        else:
            *prompt_parts, temp_str = custom_prompt.split("_")
            try:
                temperature = float(temp_str)
            except ValueError:
                temperature = 0.1
            return " ".join(prompt_parts), temperature
    elif visualization_type in prompts:
        return prompts[visualization_type], 0.1
    else:
        raise ValueError(f"{visualization_type} is not a valid visualization type")

def main(input_img_b64, visualization_type):
    client = genai.Client(api_key=API_KEY)

    pil_image = b64_to_pil(input_img_b64)
    image_bytes = BytesIO()
    pil_image.save(image_bytes, format="PNG")
    image_bytes = image_bytes.getvalue()
    image_size = pil_image.size

    prompt, temperature = get_prompt_and_temperature(visualization_type)

    try:
        pil_image = Image.open(BytesIO(image_bytes)).copy()

        response = client.models.generate_content(
            model="gemini-2.5-flash-image",
            contents=[prompt, pil_image],
            config=types.GenerateContentConfig(
                response_modalities=['Text', 'Image'],
                temperature=temperature
            )
        )

        result = []

        if not response or not response.candidates:
            print("No candidates returned in response.")
            return []

        candidate = response.candidates[0]
        if not candidate.content or not candidate.content.parts:
            print("Candidate content or parts are missing.")
            return []

        for part in candidate.content.parts:
            if part.inline_data and part.inline_data.data:
                try:
                    adapted_image = Image.open(BytesIO(part.inline_data.data))
                    resized_image = adapted_image.resize(image_size)
                    b64_img = pil_to_b64(resized_image)
                    result.append(b64_img)
                except OSError as e:
                    print(f"Skipped broken image: {e}")
                    continue

        return result

    except Exception as e:
        print(f"Image generation failed: {e}")
        return []

def parallel_main(input_img_b64: str, visualization_type: str, lang: str):

    images = []
    attempts = 0

    while len(images) < IMAGES_NEEDED and attempts < MAX_ATTEMPTS:
        tasks_needed = IMAGES_NEEDED - len(images)
        print(f"Attempt {attempts + 1} - Generating {tasks_needed} more image(s)...")

        with ThreadPoolExecutor(max_workers=tasks_needed) as executor:
            futures = [
                executor.submit(gemini_main, input_img_b64, visualization_type)
                for _ in range(tasks_needed)
            ]

            for future in as_completed(futures):
                result = future.result()
                if result:
                    images.extend(result)

        attempts += 1

    if len(images) < IMAGES_NEEDED:
        print(f"Warning: Only generated {len(images)} image(s) after {MAX_ATTEMPTS} attempts.")

    return images[:IMAGES_NEEDED]