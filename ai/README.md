# EnerVi image service

Python 3.10 service that edits a photo for an energy-transition scenario. Model weights are downloaded on first use and are not stored in this repository. See `NOTICE` in the repository root for the upstream model licenses.

## Setup

```shell
pip install -r requirements.txt
python -m pip install -e .
```

Set `MODEL_CACHE_PATH` if you want weights stored somewhere other than the Hugging Face cache. `FLASK_DEBUG` defaults to off.

## Run

From this directory:

```shell
python -m src.deploy.app
```

Or with gunicorn:

```shell
gunicorn src.deploy.app:app
```

Demo scripts, which do not start the HTTP server:

```shell
python -m src.inpainting_demo
python -m src.controlnet_demo
```

## Docker

```shell
docker build -t enervi-image .
docker run -p 8080:8080 -v enervi-volume:/app/models/ --name gpu_server --gpus all enervi-image
```

`ai/docker-compose.yml` passes `STARTUP_SERVER_URL` and `SEGMIND_API_KEY` through from the environment. Do not put real values in the compose file.
