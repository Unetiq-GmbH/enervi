import os
import base64
from io import BytesIO
import requests
from PIL import Image
from openai import OpenAI

SEGMIND_API_KEY = os.getenv("SEGMIND_API_KEY")

API_KEY = os.getenv("OPENAI_KEY", "")
client = OpenAI(api_key=API_KEY)

MAX_FILE_SIZE = 4 * 1024 * 1024  # 4 MB

def compress_image_until_under_limit(img: Image.Image) -> Image.Image:
    buffer = BytesIO()
    img.save(buffer, format="PNG", optimize=True)
    while buffer.tell() > MAX_FILE_SIZE:
        new_w = max(64, int(img.width * 0.9))
        new_h = max(64, int(img.height * 0.9))
        aspect_ratio = img.width / img.height

        if new_w / new_h > aspect_ratio:
            new_w = int(new_h * aspect_ratio)
        else:
            new_h = int(new_w / aspect_ratio)

        img = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
        buffer = BytesIO()
        img.save(buffer, format="PNG", optimize=True)

    return img

def make_landscape_1563x1024(img: Image.Image) -> Image.Image:
    target_width = 1536
    target_height = 1024
    target_ratio = target_width / target_height 

    width, height = img.size
    current_ratio = width / height

    if current_ratio < target_ratio:
        new_height = int(width / target_ratio)
        top = (height - new_height) // 2
        img_cropped = img.crop((0, top, width, top + new_height))
  
    elif current_ratio > target_ratio:
        new_width = int(height * target_ratio)
        left = (width - new_width) // 2
        img_cropped = img.crop((left, 0, left + new_width, height))
    else:
        img_cropped = img

    # Resize to final landscape resolution
    img_resized = img_cropped.resize((target_width, target_height), Image.Resampling.LANCZOS)
    return img_resized

def pil_image_to_base64(img: Image.Image) -> str:
    buffered = BytesIO()
    img.save(buffered, format="PNG")
    return base64.b64encode(buffered.getvalue()).decode()

def base64_to_pil_image(b64_str: str) -> Image.Image:
    decoded = base64.b64decode(b64_str)
    return Image.open(BytesIO(decoded)).convert("L")

def create_mask(input_img_b64: str, object_to_detect: str) -> str:
    data = {
        "prompt": object_to_detect,
        "image": input_img_b64,
        "threshold": 0.2,
        "invert_mask": False,
        "return_mask": True,
        "grow_mask": 10,
        "base64": True
    }
    headers = {'x-api-key': SEGMIND_API_KEY}
    url = "https://api.segmind.com/v1/automatic-mask-generator"

    response = requests.post(url, json=data, headers=headers)
    response.raise_for_status()
    response_json = response.json()
    mask_b64 = response_json["image"]
    return mask_b64

def base64_to_mask_image(b64_str: str, target_size: tuple[int, int]) -> Image.Image:
    decoded = base64.b64decode(b64_str)
    img = Image.open(BytesIO(decoded)).convert("RGBA") 
    img = img.resize(target_size, Image.Resampling.LANCZOS)
    return img


prompts = {
    "solar": {
        "object_to_detect": "roof(s), open space(s), and other areas with tiles, excluding windows",
        "prompt": (
            "If the reference image contains any houses or buildings, add realistic solar panels only on the existing rooftops without modifying their shape or structure; do not create or insert any new buildings, structures, or artificial elements."
            "If there are no buildings present, or if there are suitable open spaces around buildings, place ground-mounted solar panels in natural locations such as flat fields, plains, cleared land, or open areas near buildings." 
            "Ensure solar panels look realistic, follow the perspective and lighting of the scene, and do not exceed two distinct clusters of panels."
            "Avoid placing panels on objects that wouldn't support them, like water surfaces, steep slopes, or trees."
            "The solar panels should have a realistic dark blue or black glass texture with metallic frames, reflecting sunlight naturally."
        )
    },
    "solar_roofs_only": {
        "object_to_detect": "roof(s)",
        "prompt": (
            "Add modern photovoltaic solar panels exclusively to the roofs of houses or buildings in the image." 
            "Place panels neatly across roof surfaces without altering roof shapes, slopes, or perspectives."
            "Panels should have realistic dark blue or black glass with metallic frames, reflecting sunlight naturally." 
            "Ensure lighting, reflections, and shadows match the environment."
            "Do not add ground-mounted panels or modify any other objects."
        )
    },
    "solar_open_spaces_only": {
        "object_to_detect": "open space(s), and other areas with tiles",
        "prompt": (
           "Do not add solar panels to any roofs or buildings."
           "Add modern ground-mounted photovoltaic solar panels only in suitable open areas such as flat fields or naturally cleared land."
           "Limit panels to two distinct locations. Panels should have realistic dark blue or black glass with metallic frames, reflecting sunlight naturally."
           "Ensure lighting, reflections, and shadows match the environment. Do not modify any other objects."
        )
    },

    "wind": {
        "object_to_detect": "fields or other large open spaces",
        "prompt": (
            "Add a maximum of 2 wind turbines to the image, placing them only in the far background; "
            "do not place turbines in the foreground or middle ground; they must appear small and distant, "
            "matching the scale and perspective; ensure turbines are realistically grounded — standing on the ground, "
            "not floating or disconnected; add turbines only to natural landscapes (such as fields, hills, or rural areas), "
            "never in urban or residential scenes; if a large object partially blocks the background, place the turbines behind it "
            "so they remain visible but not dominant; if the central object looks completely out of place or unnatural in the composition, "
            "it may be removed; do not remove or alter any other elements, and do not add unrelated or artificial objects; "
            "the final image must look highly realistic and visually natural, as if the turbines were part of the original photograph. "
            "The lines, edges, and overall details of the turbines must be sharp and well-defined, never blurry."
        )
    },
    "no-climate-protection": {
        "object_to_detect": "sky, street(s), river(s), vegetation",
        "prompt": (
            "Add heavy air pollution and dense industrial smog across the scene to create a degraded atmosphere; "
            "simulate environmental damage by replacing most green vegetation with dry, withered grass, leafless or dead trees, "
            "and faded, desaturated colors — but do not make the image black and white; do not add fire, flames, or visible smoke trails; "
            "remove any visible people from the image; if there are solar panels or wind turbines, remove them completely; "
            "the final image should look bleak, neglected, and highly realistic, reflecting the consequences of severe environmental neglect."
            "Make the sky dark and overcast. "
            "Remove all visible people. "
        )
    },
    "greening-and-de-sealing": {
        "object_to_detect": "pavement(s), concrete areas, wall(s), roof(s)",
        "prompt": (
            "Add moderate ecological greening to the scene. "
            "Install realistic green roofs on suitable buildings. "
            "Replace some paved or concrete areas, such as unused parking spaces, with small green zones like grass patches, shrubs, or low-maintenance plants. "
            "Keep main streets, driveways, and sidewalks mostly unchanged and functional. "
            "Do not place vegetation on roads or areas clearly used for vehicle movement. "
            "Ensure all added greenery looks realistic, fits the existing environment, and is well integrated into the urban setting."
            "replace pavement or concrete areas by grass"
  
        )
    },
    "sealing": {
        "object_to_detect": "natural surfaces, grass areas",
        "prompt": (
            "Transform the scene by replacing grass, lawns, and green ground areas with realistic urban surfaces such as parking lots, paved plazas, "
            "stone or brick walkways, and concrete paths. Avoid creating very large, flat, empty paved zones — keep a natural flow and layout. "
            "Preserve some open spaces for realism. If the scene contains many trees, remove about half of them while keeping the remaining trees naturally spaced, "
            "avoiding harsh or unnatural gaps. Do not add new buildings, large constructions, or unrelated objects. "
            "The result should show realistic urban densification, with a balanced mix of sealed and open spaces, integrated naturally into the existing environment. "
            "Textures, lighting, and perspective should match the original scene so the changes look seamless and believable."
      )
    },
    "alternative-transportation": {
        "object_to_detect": "streets, pathways",
        "prompt": (
            "Remove all cars, vans, and trucks from the scene. Add several realistically proportioned people riding bicycles, wearing casual or sporty clothing. "
            "Place one public bus in a proper road lane, aligned with the street perspective (not on sidewalks, pedestrian zones, or grass). "
            "If the scene shows a wide multi-lane street, add two buses instead of one, spaced naturally. "
            "Optionally, include a few children playing, walking, or interacting on a widened sidewalk or pedestrian square. "
            "Ensure all added elements are scaled correctly, match the lighting and shadows of the scene, and are well integrated into the environment. "
            "Avoid floating objects, overlaps, or unrealistic placements. Preserve existing architecture, street furniture, and natural features."
        )
    },
    "alternative-transportation_buses_and_or_trains_only": {
        "object_to_detect": "streets, pathways",
        "prompt": (
            "Remove all cars, vans, trucks, bicycles, and bike-related infrastructure from the scene."
            "Add one public bus placed realistically in a proper road lane, aligned with the street perspective (not on sidewalks, pedestrian zones, or grass)."
            "If the scene shows a wide multi-lane street, add two buses instead of one, spaced naturally."
            "Optionally, include trains on visible rail tracks. Do not add bicycles, cargo bikes, bike lanes, or pedestrians riding bikes."
            "Ensure all added elements are correctly scaled, match the lighting and shadows of the scene, and are well integrated." 
            "Avoid floating objects, overlaps, or unrealistic placements. Preserve existing architecture, street furniture, and natural features."
        )
    },
    "alternative-transportation_bike_infrastructure_only": {
        "object_to_detect": "streets, pathways",
        "prompt": (
            "Remove all cars, vans, trucks, buses, and trains from the scene."
            "Add several realistically proportioned people riding bicycles, including cargo bikes, wearing casual or sporty clothing."
            "Introduce bike lanes and bicycle-priority paths where appropriate, integrated into the existing street or pathway layout. "
            "Do not add any motorized public transport vehicles. Optionally, include a few children playing, walking, or interacting on widened sidewalks or pedestrian spaces."
            "Ensure all elements are correctly scaled, match the lighting and shadows of the scene, and are naturally integrated."
            "Avoid floating objects, overlaps, or unrealistic placements. Preserve existing architecture, street furniture, and natural features."
        )
    },

    "flood": {
        "object_to_detect": "entire visible ground and street areas",
        "prompt": (
            "Transform the scene into a realistic urban flood caused by recent heavy rain. Show streets, sidewalks, plazas, and the lower parts of existing buildings "
            "partially submerged in muddy or murky floodwater. Existing cars should appear partially underwater, with wheels and lower doors submerged, creating realistic ripples "
            "and reflections. Keep all existing buildings, trees, street furniture, and other objects in place, without adding any new ones. "
            "Maintain the original camera angle, scale, and composition. Do not depict ongoing rain, falling water, or storm clouds — only the calm aftermath. "
            "Ensure water textures, reflections, lighting, and shadow interactions are consistent with the original environment, making the flood appear seamlessly integrated "
            "and highly believable."
        )
    },
    "drought": {
        "object_to_detect": "trees, fields, plants, soil, grass",
        "prompt": (
            "Transform the scene to depict the realistic effects of a prolonged drought. Replace all green grass and vegetation with dry, brown, withered grass "
            "or bare soil. Convert existing trees into leafless or dried-out versions, with brittle branches and faded bark. "
            "Add realistic cracks in exposed soil, lawns, and some asphalt or paved areas where appropriate, matching perspective and scale. "
            "Keep all streets, sidewalks, and paved areas intact — do not replace them with sand, dirt, or desert plants. "
            "Apply a subtle yellowish or dusty tone to the lighting and atmosphere, suggesting heat and arid conditions, while preserving color realism. "
            "Do not add new buildings, vehicles, or unrelated objects. Maintain the original scene composition, perspective, and layout so the drought effects "
            "look naturally integrated and highly believable."
        )
    }
}

def main(base64_image: str, visualization_type: str = "solar"):
    config = prompts.get(visualization_type)
    prompt = config["prompt"]
    object_to_detect = config["object_to_detect"]

    image_data = base64.b64decode(base64_image)
    image = Image.open(BytesIO(image_data)).convert("RGB")

    compressed_image = compress_image_until_under_limit(image)

    square_image = make_landscape_1563x1024(compressed_image)
 
    square_image_b64 = pil_image_to_base64(square_image)

    mask_b64 = create_mask(square_image_b64, object_to_detect)
  
    mask_image = base64_to_mask_image(mask_b64, square_image.size)

    img_buffer = BytesIO()
    mask_buffer = BytesIO()
    square_image.save(img_buffer, format="PNG", optimize=True)
    mask_image.save(mask_buffer, format="PNG", optimize=True)
    img_buffer.seek(0)
    mask_buffer.seek(0)

    response = client.images.edit(
        model="gpt-image-1",
        image=("image.png", img_buffer, "image/png"),
        mask=("mask.png", mask_buffer, "image/png"),
        prompt=prompt,
        n=2,
        size="1536x1024",
    )

    results = []
    for item in response.data:
        results.append(item.b64_json)   

    return results
