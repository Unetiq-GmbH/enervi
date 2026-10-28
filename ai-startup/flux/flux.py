import os
import requests

SEGMIND_API_KEY = os.getenv("SEGMIND_API_KEY", "")

prompts = {
    "solar": {
        "guidance_scale": 10,
        "strength": 0.9,
        "object_to_detect": "roof(s) of the house(s) – only areas with tiles, excluding windows",
        "prompt": "solar panels covering about 50% of each roof"
    },
    "wind": {
        "guidance_scale": 10,
        "strength": 0.9,
        "object_to_detect": "fields or other large open spaces",
        "prompt": "add wind turbines"
    },
    "no-climate-protection": {
        "guidance_scale": 10,
        "strength": 0.85,
        "object_to_detect": "sky, streets, rivers, vegetation",
        "prompt": "make the scene reflect a lack of climate protection, showing pollution, smog, and environmental damage"
    },
    "greening-and-de-sealing": {
        "guidance_scale": 9,
        "strength": 0.8,
        "object_to_detect": "pavement, concrete areas",
        "prompt": "make the scene greener, with more vegetation and less pavement or concrete surfaces"
    },
    "sealing": {
        "guidance_scale": 9,
        "strength": 0.85,
        "object_to_detect": "natural surfaces, grass areas",
        "prompt": "make the scene more urbanized, with sealed surfaces like asphalt and concrete, and reduced greenery"
    },
    "alternative-transportation": {
        "guidance_scale": 10,
        "strength": 0.85,
        "object_to_detect": "streets, pathways",
        "prompt": "add environment-friendly transportation options like bikes, electric buses, and pedestrian walkways"
    },
    "flood": {
        "guidance_scale": 11,
        "strength": 0.95,
        "object_to_detect": "entire visible ground and street areas",
        "prompt": "make the scene appear flooded with heavy rain and rising water"
    },
    "drought": {
        "guidance_scale": 10,
        "strength": 0.9,
        "object_to_detect": "fields, plants, soil",
        "prompt": "make the scene look like a drought, with dry land, withered plants, and no water"
    },
    "heat-pumps": {
        "guidance_scale": 10,
        "strength": 0.85,
        "object_to_detect": "walls and sides of buildings",
        "prompt": "add sustainable technology like heat pumps to the buildings in this picture"
    }
}

def main(
        input_img_b64: str,
        visualization_type: str,
        object_to_detect: str|None,
        prompt: str|None):

    # Temporary commented to provide geminy prompts
    # guidance_scale = 9
    # strength = 0.95
    # if visualization_type == "flux_solar":
    #     guidance_scale = 10
    #     strength = 0.9
    #     object_to_detect = "roof(s) of the house(s) -  only area with tiles, excluding windows"
    #     prompt = "solar panels covering about 50% of each roof"
    # elif visualization_type == "flux_wind":
    #     guidance_scale = 10
    #     strength = 0.9
    #     object_to_detect = "fields, or other large open spaces"
    #     prompt = "add wind turbines"
    # elif visualization_type == "flux_free" and "_" in prompt:
    #     options = list(prompt.split("_"))[1:]
    #     guidance_scale = int(options[0])
    #     if len(options) > 1:
    #         strength = float(options[1])

    config = prompts.get(visualization_type)

    if config:
        guidance_scale = config["guidance_scale"]
        strength = config["strength"]
        object_to_detect = config["object_to_detect"]
        prompt = config["prompt"]
    else:
        raise ValueError(f"Unknown visualization type: {visualization_type}")

    mask = create_mask(input_img_b64, object_to_detect)
    adapted_images = inpaint(guidance_scale, input_img_b64, prompt, mask, strength)

    return adapted_images

def create_mask(input_img_b64, object_to_detect):
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
    mask = response_json["image"]
    return mask


def inpaint(guidance_scale, input_img_b64, prompt, mask, strength):
    # Request payload
    data = {
        "base64": True,
        "guidance_scale": guidance_scale,
        "image": input_img_b64,
        "image_format": "jpeg",
        "mask": mask,
        "negative_prompt": "bad quality, painting, blur",
        "num_inference_steps": 25,
        "prompt": prompt,
        "quality": 95,
        "sampler": "euler",
        "samples": 4,
        "scheduler": "simple",
        "strength": strength
    }
    headers = {'x-api-key': SEGMIND_API_KEY}
    inpaint_url = "https://api.segmind.com/v1/flux-inpaint"

    response = requests.post(inpaint_url, json=data, headers=headers)
    response.raise_for_status()
    response_json = response.json()
    adapted_image = response_json["image"]
    return adapted_image
