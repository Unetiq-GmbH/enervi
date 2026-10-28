import time
import uuid
import requests
import os

from imaginepro.util import image_util
from logger import logger

URL = "https://api.imaginepro.ai/api/v1/midjourney"
API_KEY = os.getenv("IMAGINEPRO_API_KEY", "")


def make_post_request(url: str, headers: dict, data: dict) -> dict:
    response = requests.post(url=url, headers=headers, json=data)
    if response.status_code != 200:
        raise ConnectionError(f"Something went wrong with the call: {response.text}")
    return response.json()


def make_get_request(url: str, headers: dict) -> dict:
    response = requests.get(url=url, headers=headers)
    if response.status_code != 200:
        raise ConnectionError(f"Something went wrong with the call: {response.text}")
    return response.json()


def check_image_generation_status(message_id: str, headers: dict) -> dict:
    i = 1
    while True:
        json_response = make_get_request(url=f"{URL}/message/{message_id}", headers=headers)
        if json_response["status"] == "QUEUED":
            logger.info("Image generation is queued")
        elif json_response["status"] == "PROCESSING":
            logger.info(f"Progress: {json_response['progress']}")
        elif json_response["status"] == "DONE":
            return json_response
        i += 1
        time.sleep(i)


def trigger_upscale(message_id: str, headers: dict) -> str:
    data = {
        "messageId": message_id,
        "button": "U1"
    }
    json_response = make_post_request(url=f"{URL}/button", headers=headers, data=data)
    return json_response["messageId"]


def generate_and_upscale_image(prompt: str) -> str:
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {API_KEY}",
    }

    # Step 1: Generate image
    data = {"prompt": prompt}
    response_json = make_post_request(url=f"{URL}/imagine", headers=headers, data=data)
    message_id = response_json["messageId"]

    # Step 2: Check image generation status
    json_response = check_image_generation_status(message_id, headers)

    if "U1" not in json_response["buttons"]:
        raise ValueError(f"Expected U1 in buttons, got {json_response['buttons']}")

    # Step 3: Trigger upscale
    message_id = trigger_upscale(message_id, headers)

    # Step 4: Check upscale status
    json_response = check_image_generation_status(message_id, headers)

    return json_response["uri"]

def main(input_img_b64: str,
         visualization_type: str,
         custom_injection_prompt: str,
         custom_negative_prompt: str) -> str:
    if visualization_type == "midjourney_solar":
        prompt = "Realistic rooftop with solar panels carefully integrated, maintaining the structure and aesthetics identical to the original image. Ensure the solar panels blend naturally with the roof design, keeping the original roof color, texture, and overall environment intact. High-quality, photorealistic rendering, with precise details to match the reference image."
    else:
        prompt = custom_injection_prompt

        if custom_injection_prompt and custom_injection_prompt != "":
            prompt = f"{prompt} --no {custom_negative_prompt}"
    midjourney_options = "--v 6.1 --iw 3 --q 2"

    temp_file_name = f"{str(uuid.uuid4())}.{image_util.get_image_type_from_b64(input_img_b64)}"

    logger.info(f"Prompt to be used: {prompt}")

    image_url = image_util.upload_image_b64(input_img_b64, temp_file_name, API_KEY)
    result_uri = generate_and_upscale_image(f"{image_url} {prompt} {midjourney_options}")
    output_image = image_util.download_image_b64(result_uri)
    output_image = image_util.resize_image(output_image, input_img_b64)
    return output_image
