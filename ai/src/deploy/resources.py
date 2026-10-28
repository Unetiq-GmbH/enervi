import base64
import json
import sys
import os
import requests

from flask import request, make_response, render_template, jsonify
from flask_restx import Resource
from time import time

from src.deploy import config, image_request
from src.deploy.api_models import api, image_request_model, image_response_model
from src.util import enervi_logger


class EditImage(Resource):
    @classmethod
    def get_doc(cls):
        return {
            "description": f"Edit an image.\n\nInpainting functionalities: {config.inpainting_visualization_types}"
            f"\nControlNet functionalities: {config.controlnet_visualization_types}"
            f"\nDev mode (returns the input image without processing): {config.dev_route}",
            "params": {
                "visualize": {
                    "description": f"Visualization options",
                    "enum": config.inpainting_visualization_types
                    + config.controlnet_visualization_types
                    + [config.dev_route],
                    "default": config.dev_route,
                }
            },
        }

    @api.expect(image_request_model)
    @api.doc(model=image_response_model)
    def post(self, visualize):
        """Edit an image."""
        imageManipulationUUID = None
        try:
            test_mode, cache_results, display_image = False, False, False
            infer_prompt = True
            custom_injection_prompt, custom_negative_prompt = None, None

            # json request
            if request.content_type.startswith("application/json"):
                json_input = json.loads(request.data)
                image = json_input.get("image", None)
                imageManipulationUUID = json_input.get("imageManipulationUUID", None)
                if visualize == "custom_prompt":
                    custom_injection_prompt = json_input.get("custom_prompt", None)
                    custom_negative_prompt = json_input.get("custom_negative_prompt", None)
                    if (custom_negative_prompt is None and
                            custom_injection_prompt is not None and
                            custom_injection_prompt.count("; ") == 1):
                        custom_injection_prompt, custom_negative_prompt = custom_injection_prompt.split("; ")
                    elif (custom_negative_prompt is None and
                            custom_injection_prompt is not None and
                            custom_injection_prompt.count(";") == 1):
                        custom_injection_prompt, custom_negative_prompt = custom_injection_prompt.split(";")

            # html form for testing
            elif request.content_type.startswith("multipart/form-data"):
                image = request.files.get("image", None)
                test_mode = "test_mode" in request.form
                cache_results = "cache" in request.form
                if visualize in config.inpainting_visualization_types:
                    infer_prompt = request.form["prompt"] == "automatic"

            else:
                raise KeyError("No input json or test form was given")

            if image is None:
                raise KeyError("No image given in request")


            response = jsonify({"message": "The image was received and is being processed..."})

            @response.call_on_close
            def processing():
                start_time = time()
                success = process_image(
                    image,
                    visualize,
                    imageManipulationUUID,
                    test_mode,
                    cache_results,
                    infer_prompt,
                    custom_injection_prompt,
                    custom_negative_prompt
                )
                if success:
                    enervi_logger.ENERVI_LOGGER.info(f"Manipulation with type {visualize} "
                                                     f"for UUID {imageManipulationUUID} "
                                                     f"done in {time() - start_time:.2f} seconds")
                else:
                    enervi_logger.ENERVI_LOGGER.info(f"Failed manipulation with type {visualize} "
                                                     f"for UUID {imageManipulationUUID}")
            return response


        except Exception as e:
            exc_type, exc_value, exc_tb = sys.exc_info()
            f_name = os.path.split(exc_tb.tb_frame.f_code.co_filename)[1]
            enervi_logger.ENERVI_LOGGER.info(f"Due to {exc_type} at {exc_tb.tb_lineno} in {f_name}: {str(e)}")
            requests.post(
                config.startup_server_url + "/send_manipulated_image",
                json={
                    "visualizationType": visualize,
                    "imageManipulationUUID": imageManipulationUUID,
                    "status": 500,
                    "error_message": str(e)
                },
            )
            return {"message": f"Something went wrong: {str(e)}"}, 500

def process_image(
        image: str,
        visualize: str,
        imageManipulationUUID: str,
        test_mode: bool,
        cache_results: bool,
        infer_prompt: bool,
        custom_injection_prompt: str,
        custom_negative_prompt: str | None) -> bool:
    try:
        encoded_image = image_request.load_image(image)

        if visualize != config.dev_route:
            edited_image = image_request.edit_image(
                encoded_image,
                visualize,
                test_mode=test_mode,
                save_results=cache_results,
                infer_prompt=infer_prompt,
                custom_injection_prompt=custom_injection_prompt,
                custom_negative_prompt=custom_negative_prompt
            )
        else:
            edited_image = encoded_image
        image_bytes = image_request.PIL_to_bytes(edited_image)

        requests.post(
            config.startup_server_url + "/send_manipulated_image",
            json={
                "editedImage": base64.b64encode(image_bytes.getvalue()).decode("utf-8"),
                "visualizationType": visualize,
                "imageManipulationUUID": imageManipulationUUID,
                "status": 200
            },
        )
        return True
    except Exception as e:
        exc_type, exc_value, exc_tb = sys.exc_info()
        f_name = os.path.split(exc_tb.tb_frame.f_code.co_filename)[1]
        enervi_logger.ENERVI_LOGGER.info(f"Due to {exc_type} at {exc_tb.tb_lineno} in {f_name}: {str(e)}")
        requests.post(
            config.startup_server_url + "/send_manipulated_image",
            json={
                "visualizationType": visualize,
                "imageManipulationUUID": imageManipulationUUID,
                "status": 500,
                "error_message": str(e)
            },
        )
        return False


class TestHTML(Resource):
    @classmethod
    def get_doc(cls):
        return {"description": "Test the image editing route with an HTML form."}

    def get(self):
        """Test the image editing route with an HTML form."""
        headers = {"Content-Type": "text/html"}
        return make_response(render_template("enervi.html"), 200, headers)


class HealthCheck(Resource):
    @classmethod
    def get_doc(cls):
        return {"description": "Check if the API is running."}

    def get(self):
        """Check if the API is running."""
        return (
            {
                "message": "Until 2050, 1.2 billion people are at risk of displacement due to ecological, socioeconomical and political "
                "consequences of human-made climate crisis."
            },
            200,
        )
