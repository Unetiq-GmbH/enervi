"""Flask server with Flask-RestX"""
import logging
import os


from flask import (
    Flask,
    request,
)

from src.deploy.api_models import blueprint, api
from src.deploy.resources import EditImage, HealthCheck, TestHTML
from src.util import enervi_logger
from flask_cors import CORS

enervi_logger.init_logging(
    "enervi-logger",
    level=logging.DEBUG if os.getenv("FLASK_DEBUG", "0") == "1" else logging.INFO,
)

app = Flask(__name__)
cors = CORS(app, resources={r"/enervi/*": {"origins": "*"}})

### API initialization and documentation ###

app.register_blueprint(blueprint)
ns = api.namespace("api", description="EnerVi operations")


# add the routes
ns.add_resource(EditImage, "/<visualize>", route_doc=EditImage.get_doc())

ns.add_resource(HealthCheck, "/health-check", route_doc=HealthCheck.get_doc())

ns.add_resource(TestHTML, "/test", route_doc=TestHTML.get_doc())


@app.before_request
def _before_request():
    """Utility method to log a new request."""

    enervi_logger.ENERVI_LOGGER.info(
        "req [%s %s] %s %s",
        request.method,
        request.full_path,
        request.remote_addr,
        request.scheme,
    )


@app.after_request
def _after_request(response):
    """Utility method to log a new response."""

    enervi_logger.ENERVI_LOGGER.info(
        "res [%s %s] %s %s %s",
        request.method,
        request.full_path,
        request.remote_addr,
        request.scheme,
        response.status,
    )
    return response


if __name__ == "__main__":
    app.run(port=8080, debug=os.getenv("FLASK_DEBUG", "0") == "1", host="0.0.0.0")
