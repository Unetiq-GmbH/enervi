from flask import Blueprint
from flask_restx import Api, fields

blueprint = Blueprint("api", __name__, url_prefix="/enervi")
api = Api(
    blueprint,
    version="0.1",
    title="EnerVi API",
    description="Visualization of the energy transformation and consequences of climate crisis.",
)

# data models
image_request_model = api.model(
    "JSONorFormRequest",
    {
        "image": fields.String(required=True, description="Base64-encoded image data"),
        "imageManipulation_UUID": fields.String(required=False, description="UUID of processed image"),
        "custom_prompt": fields.String(required=True, description="Custom injection prompt to use for image"),
        "custom_negative_prompt": fields.String(required=True, description="Custom negative prompt to use for image")
    },
)
image_response_model = api.model(
    "JSONResponse",
    {
        "edited_image": fields.String(
            required=True, description="Base64-encoded image data"
        )
    },
)
