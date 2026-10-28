import requests
import os
import json

from flask import Flask, request, jsonify
from flask_jwt_extended import JWTManager, jwt_required, create_access_token
from flask_cors import CORS
from time import time

from imaginepro.imaginepro import main as imaginepro_main
from flux.flux import main as flux_main
from gemini.gemini import main as gemini_main
from mixed.mixed import main as mixed_main

from logger import logger

express_server_url = os.getenv("EXPRESS_SERVER_URL")

app = Flask(__name__)
cors = CORS(app, resources={r"/enervi/*": {"origins": "*"}})

app.config["JWT_SECRET_KEY"] = os.getenv("EXPRESS_FLASK_KEY")

jwt = JWTManager(app)

@app.route('/enervi/visualize', methods=['POST'])
@jwt_required()
def visualize():
    if request.content_type.startswith("application/json"):
        json_input = json.loads(request.data)
        visualization_type = json_input.get("visualizationType", None)
        adjustment = json_input.get("adjustment", None)
        lang = json_input.get("lang", None)
        image = json_input.get("image", None)
        image_manipulation_uuid = json_input.get("imageManipulationUUID", None)
        custom_injection_prompt = json_input.get("custom_prompt", None)
        custom_negative_prompt = json_input.get("custom_negative_prompt", None)
        flux_prompt = json_input.get("flux_prompt", None)
        flux_object_to_detect = json_input.get("flux_object_to_detect", None)
    else:
        message = "No input json was given"
        logger.info(message)
        return jsonify({"message": message}), 400

    if image is None:
        message = "No image given in request"
        logger.info(message)
        return jsonify({"message": message}), 400
    elif visualization_type is None:
        message = "No visualization type given in request"
        logger.info(message)
        return jsonify({"message": message}), 400
    elif image_manipulation_uuid is None:
        message = "No imageManipulationUUID given in request"
        logger.info(message)
        return jsonify({"message": message}), 400
    elif visualization_type == "custom_prompt" and custom_injection_prompt is None:
        message = "VisualizationType is 'custom_prompt' but no custom_prompt is given in request"
        logger.info(message)
        return jsonify({"message": message}), 400
    elif visualization_type == "flux_free" and (flux_prompt is None or flux_object_to_detect is None):
        message = "VisualizationType is 'flux_free' but no flux_prompt or flux_object_to_detect is given in request"
        logger.info(message)
        return jsonify({"message": message}), 400

    response = jsonify({"message": "The image was received and is being processed..."})

    @response.call_on_close
    def send_for_manipulation():
        logger.info(f"Send image for ai visualization with type {visualization_type}")
        mixed_manipulate(
            image,
            image_manipulation_uuid,
            visualization_type,
            adjustment,
            lang,
        )
    return response

@app.route('/enervi/send_manipulated_image', methods=['POST'])
def send_manipulated_image():
    if request.content_type.startswith("application/json"):
        json_input = json.loads(request.data)
    else:
        fail_message = "Received POST call without json to send manipulated image back to backend"
        logger.info(fail_message)
        return jsonify({"message": fail_message}), 400

    imageManipulationUUID = json_input.get("imageManipulationUUID", None)
    if imageManipulationUUID is None:
        message = "No imageManipulationUUID given in request"
        logger.info(message)
        return jsonify({"message": message}), 400

    status = json_input.get("status")
    if status != 200:
        fail_message = f"Failed to manipulate image: {json_input.get('error_message', '')}"
        logger.info(fail_message)
        requests.post(
            express_server_url + "/manipulated",
            headers=get_express_headers(),
            data={
                "message": fail_message,
                "imageManipulationUUID": imageManipulationUUID,
            },
        )
        return jsonify({"message": "Send feedback to backend"}), 200

    image = json_input.get("editedImage", None)
    visualizationType = json_input.get("visualizationType", None)
    if image is None:
        message = "No image given in request"
        logger.info(message)
        return jsonify({"message": message}), 400
    elif visualizationType is None:
        message = "No visualization type given in request"
        logger.info(message)
        return jsonify({"message": message}), 400

    message = f"Send manipulated image with type {visualizationType} to backend"
    logger.info(message)
    requests.post(
        express_server_url + "/manipulated",
        headers=get_express_headers(),
        data={
            "image": image,
            "visualizationType": visualizationType,
            "imageManipulationUUID": imageManipulationUUID,
        },
    )

    return jsonify({"message": f"Send manipulated image with type {visualizationType} to backend"})


@app.route('/enervi/check_status', methods=['GET'])
def check_status():
    response = jsonify({"message": "Checking if the server is running..."})

    @response.call_on_close
    def check_server():
        logger.info("Not using VMs at this point, so not checking status")
        send_call_to_gpu_status()

    return response

@app.route('/enervi/check_activity', methods=["GET"])
def check_activity():
    return jsonify({"message": "Not using VMs at this point, so not checking activity"})

@app.route('/enervi/health_check', methods=['GET'])
def health_check():
    return jsonify({"message": "All good!"}), 200

def midjourney_manipulate(
        image: str,
        image_manipulation_uuid: str,
        visualization_type: str,
        custom_injection_prompt: str,
        custom_negative_prompt: str):
    try:
        start_time = time()
        adapted_image = imaginepro_main(image, visualization_type, custom_injection_prompt, custom_negative_prompt)
        requests.post(
            express_server_url + "/manipulated",
            headers=get_express_headers(),
            data={
                "image": adapted_image,
                "visualizationType": visualization_type,
                "imageManipulationUUID": image_manipulation_uuid,
            },
        )
        logger.info(f"Manipulation with type {visualize} "
                    f"for UUID {image_manipulation_uuid} "
                    f"done in {time() - start_time:.2f} seconds")
    except Exception as e:
        fail_message = f"Failed to manipulate image: {e}"
        logger.info(fail_message)
        requests.post(
            express_server_url + "/manipulated",
            headers=get_express_headers(),
            data={
                "message": fail_message,
                "imageManipulationUUID": image_manipulation_uuid,
            },
        )

def flux_manipulate(
        image: str,
        image_manipulation_uuid: str,
        visualization_type: str,
        flux_object_to_detect: str,
        flux_prompt: str):
    try:
        start_time = time()

        adapted_images = flux_main( image, visualization_type, flux_object_to_detect, flux_prompt )
           
        requests.post(
            express_server_url + "/manipulated",
            headers=get_express_headers(),
            data={
                "images": adapted_images,
                "visualizationType": visualization_type,
                "imageManipulationUUID": image_manipulation_uuid,
            },
        )
        logger.info(f"Manipulation with type {visualize} "
                    f"for UUID {image_manipulation_uuid} "
                    f"done in {time() - start_time:.2f} seconds")
    except Exception as e:
        fail_message = f"Failed to manipulate image: {e}"
        logger.info(fail_message)
        requests.post(
            express_server_url + "/manipulated",
            headers=get_express_headers(),
            data={
                "message": fail_message,
                "imageManipulationUUID": image_manipulation_uuid,
            },
        )

def gemini_manipulate(
        image: str,
        image_manipulation_uuid: str,
        visualization_type: str,
        lang: str,
        custom_prompt: str):
    try:
        start_time = time()

        adapted_images = gemini_main(image, visualization_type, lang)
        
        requests.post(
            express_server_url + "/manipulated",
            headers=get_express_headers(),
            data={
                "images": adapted_images,
                "visualizationType": visualization_type,
                "imageManipulationUUID": image_manipulation_uuid,
            },
        )

        logger.info(f"Manipulation with type {visualize} "
                    f"for UUID {image_manipulation_uuid} "
                    f"done in {time() - start_time:.2f} seconds")
    except Exception as e:
        fail_message = f"Failed to manipulate image: {e}"
        logger.info(fail_message)
        requests.post(
            express_server_url + "/manipulated",
            headers=get_express_headers(),
            data={
                "message": fail_message,
                "imageManipulationUUID": image_manipulation_uuid,
            },
        )

def mixed_manipulate(
        image: str,
        image_manipulation_uuid: str,
        visualization_type: str,
        adjustment: str,
        lang: str):
    try:
        start_time = time()

        adapted_images = mixed_main(image, visualization_type, adjustment, lang)
        
        requests.post(
            express_server_url + "/manipulated",
            headers=get_express_headers(),
            data={
                "images": adapted_images,
                "visualizationType": visualization_type,
                "imageManipulationUUID": image_manipulation_uuid,
            },
        )

        logger.info(f"Manipulation with type {visualize} "
                    f"for UUID {image_manipulation_uuid} "
                    f"done in {time() - start_time:.2f} seconds")
    except Exception as e:
        fail_message = f"Failed to manipulate image: {e}"
        logger.info(fail_message)
        requests.post(
            express_server_url + "/manipulated",
            headers=get_express_headers(),
            data={
                "message": fail_message,
                "imageManipulationUUID": image_manipulation_uuid,
            },
        )


def send_call_to_gpu_status(message="Server is up and running!"):
    try:
        requests.post(
            express_server_url + "/GPU/ServerStatus",
            headers=get_express_headers(),
            data={"message": message},
            timeout=(5, 1)
        )
    except requests.exceptions.ReadTimeout:
        pass


def get_express_headers():
    with app.app_context():
        token = create_access_token({"sub": "flask_server"})
        headers = {
            "Authorization": "Bearer " + token,
        }
        return headers


@app.before_request
def _before_request():
    """Utility method to log a new request."""
    if request.full_path != "/enervi/health_check?":
        logger.info(
            "req [%s %s] %s %s",
            request.method,
            request.full_path,
            request.remote_addr,
            request.scheme,
        )


@app.after_request
def _after_request(response):
    """Utility method to log a new response."""
    if request.full_path != "/enervi/health_check?":
        logger.info(
            "res [%s %s] %s %s %s",
            request.method,
            request.full_path,
            request.remote_addr,
            request.scheme,
            response.status,
        )
    return response


if __name__ == "__main__":
    app.run(port=8081, debug=os.getenv("FLASK_DEBUG", "0") == "1", host="0.0.0.0")
