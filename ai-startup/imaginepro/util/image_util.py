import io
import requests
import time
import base64

from io import BytesIO
from PIL import Image, UnidentifiedImageError

from logger import logger


def get_upload_url(token: str, filename: str) -> dict:
    """
    Requests a signed URL for uploading the image.

    :param token: Authorization token for ImaginePro API.
    :param filename: The name of the file to upload.
    :return: The signed URL and other necessary data for uploading the image.
    """
    url = "https://upload.imaginepro.ai/v1/discord/image/upload/url"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}"
    }
    data = {
        "filename": f"{int(time.time())}_{filename}"
    }

    response = requests.post(url, json=data, headers=headers)
    response_data = response.json()

    if response.status_code != 200 or "message" in response_data:
        raise Exception(f"Failed to get upload URL: {response_data.get('message', 'Unknown error')}")

    return response_data


def upload_image_to_s3(signed_url: str, image_data: BytesIO, content_type: str, upload_token: str) -> str:
    """
    Uploads the image to S3 using the signed URL.

    :param signed_url: The pre-signed URL for uploading the image.
    :param image_data: The image data as a BytesIO object.
    :param content_type: The MIME type of the image.
    :param upload_token: Authorization token required by S3 for the upload.
    :return: Response status of the upload.
    """
    headers = {
        "Content-Type": content_type,
        "Authorization": f"Bearer {upload_token}"
    }
    # Reset the BytesIO object's cursor to the beginning of the stream
    image_data.seek(0)

    response = requests.put(signed_url, data=image_data, headers=headers)

    return response.status_code


def upload_image_b64(image_b64: str, filename: str, token: str) -> str:
    """
    Manages the process of uploading a base64-encoded image to ImaginePro.

    :param image_b64: Base64-encoded image string.
    :param filename: Name of the image file (e.g., 'image.png').
    :param token: Authorization token for ImaginePro API.
    :return: URL where the image is accessible.
    """
    # Convert base64 string to binary data
    image_data = io.BytesIO(base64.b64decode(image_b64))
    content_type = f"image/{filename.split('.')[-1].lower()}"

    # Step 1: Get signed URL
    upload_data = get_upload_url(token, filename)

    # Step 2: Upload image to S3
    status_code = upload_image_to_s3(
        signed_url=upload_data["signedUrl"],
        image_data=image_data,
        content_type=content_type,
        upload_token=upload_data["token"]
    )

    if status_code == 200:
        image_url = f"https://cdn.imaginepro.ai/storage/v1/object/public/image/{upload_data['path']}"
        logger.info(f"Image successfully uploaded to {image_url}")
        return image_url
    else:
        raise Exception("Failed to upload the image to S3.")

def download_image_b64(result_uri: str) -> str:
    """
    Downloads an image from result_uri and returns it as a base64-encoded string.

    :param result_uri: The URL of the image to download.
    :return: The image as a base64-encoded string.
    """
    response = requests.get(result_uri)

    if response.status_code == 200:
        # Encode the image content in base64
        image_b64 = base64.b64encode(response.content).decode('utf-8')
        logger.info("Image successfully downloaded and encoded to base64.")
        return image_b64
    else:
        raise Exception(f"Failed to download the image: {response.status_code}")


def get_image_type_from_b64(image_b64: str) -> str:
    """
    Determines the image type (e.g., jpg, png, jpeg) from a base64-encoded string.

    :param image_b64: Base64-encoded image string.
    :return: Image type as a string (e.g., 'jpg', 'png', 'jpeg').
    """
    # Use a regular expression to extract the image type from the base64 string
    if type(image_b64) is str:
        image_b64 = io.BytesIO(base64.b64decode(image_b64))

    try:
        img = Image.open(image_b64)
    except UnidentifiedImageError:
        raise OSError("Could not read image.")
    return img.format

def resize_image(image: str, input_image: str) -> str:
    resize_to = Image.open(io.BytesIO(base64.b64decode(input_image))).size

    image = Image.open(io.BytesIO(base64.b64decode(image)))
    image = image.resize(resize_to)

    # Save the resized image to bytes
    byte_arr = io.BytesIO()
    image.save(byte_arr, format='PNG')
    resized_image_bytes = byte_arr.getvalue()

    resized_image_b64 = base64.b64encode(resized_image_bytes).decode('utf-8')
    return resized_image_b64
