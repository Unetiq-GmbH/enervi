import os
import io
from PIL import Image
from flask import Flask, request, Response
from flask_jwt_extended import JWTManager, jwt_required, create_access_token
import requests
import json
import base64
import time

# load environment variables
from dotenv import load_dotenv
load_dotenv()

os.environ['FLASK_APP'] = 'app.py'
os.environ['FLASK_DEBUG'] = os.getenv("FLASK_DEBUG", "0")

app = Flask(__name__)

# set JWT secret key
app.config["JWT_SECRET_KEY"] = os.getenv("EXPRESS_FLASK_KEY")
jwt = JWTManager(app)

EXPRESS_SERVER_URL = "http://localhost:5001/api/image"

add_delay = False

@app.route("/")
def home():
    return "<p>Welcome to Flask mock server!</p>"


@app.route("/enervi/check_status", methods=["GET"])
@jwt_required()
def check_status():
    response = Response(
        "Checking if the server is running",
        status=200,
        mimetype="application/json",
    )

    @response.call_on_close
    def check_server():
        if add_delay:
            time.sleep(5)
        try:
            requests.post(
                EXPRESS_SERVER_URL + "/GPU/ServerStatus",
                headers=get_express_headers(),
                timeout=(5, 1)
            )
        except requests.exceptions.ReadTimeout:
            pass
    return response


@app.route("/enervi/visualize", methods=["POST"])
@jwt_required()
def manipulate_image():
    json_input = json.loads(request.data)
    image = json_input.get("image", None)
    visualizationType = json_input.get("visualizationType", None)
    imageManipulationUUID = json_input.get("imageManipulationUUID", None)
    response = Response(
        "The image was received and is being processed",
        status=200,
        mimetype="application/json",
    )

    @response.call_on_close
    def process_image():
        try:
            # throw an exception to test error response
            # raise Exception("Error occurred while processing image")
            start_manipulation(image, visualizationType, imageManipulationUUID)
        except Exception as e:
            print(e)
            send_error_response(imageManipulationUUID)

    return response


def start_manipulation(image, visualizationType, imageManipulationUUID):
    if add_delay:
        time.sleep(10)
    output_image = Image.open("./output_image.png")

    # Resize the image
    resized_image = output_image.resize(Image.open(io.BytesIO(base64.b64decode(image))).size)

    # Save the resized image to bytes
    byte_arr = io.BytesIO()
    resized_image.save(byte_arr, format='PNG')
    resized_image_bytes = byte_arr.getvalue()

    img = base64.b64encode(resized_image_bytes).decode()
    images = [img, img, img, img]

    data = {
        "images": images,
        "visualizationType": visualizationType,
        "imageManipulationUUID": imageManipulationUUID,
    }
    response = requests.post(
        EXPRESS_SERVER_URL + "/manipulated",
        data=data,
        headers=get_express_headers(),
    )

    if response.status_code == 200:
        print("Image manipulation successful")
    else:
        print("Image manipulation failed")
        send_error_response(imageManipulationUUID)


def send_error_response(imageManipulationUUID):
    response = requests.post(
        EXPRESS_SERVER_URL + "/manipulationFailed/" + imageManipulationUUID,
        headers=get_express_headers(),
    )

    if response.status_code == 200:
        print("Error response sent successfully")
    else:
        print("Error response failed")


def get_express_headers():
    with app.app_context():
        token = create_access_token({"sub": "flask_mock_server"})
        headers = {
            "Authorization": "Bearer " + token,
        }
        return headers


if __name__ == "__main__":
    app.run(port=8000, debug=os.getenv("FLASK_DEBUG", "0") == "1", host="0.0.0.0")
