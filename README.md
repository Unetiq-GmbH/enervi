# EnerVi

EnerVi lets people visualise possible energy-transition changes on their own photos. A user uploads a picture and chooses a scenario, for example solar panels, wind turbines, vegetation, changes in transport, flooding, or drought. The web app sends the photo to an image service and shows the result.

This work was funded by the German Federal Ministry for Economic Affairs and Energy (BMWE) under grant 03EI5247C (project EnerVi).

## Repository layout

| Directory | Role |
| --- | --- |
| `frontend/` | React and Vite web app |
| `backend/` | Node.js and Express API, MongoDB, Auth0 |
| `ai/` | Local image-generation service. A GPU is recommended. Model weights are not in this repository. |
| `ai-startup/` | HTTP service that accepts visualisation requests and calls the providers configured by environment variables |
| `ai-mock/` | Stand-in image service for local development |

## Requirements

- Node.js 18 or newer for the web app and API
- Python 3.10 for the image services
- MongoDB, an Auth0 application, and blob storage if you want the full upload flow
- A GPU with an NVIDIA driver if you run the local image models

## Configure

Environment variables are documented in [`.env.example`](.env.example). Copy that file and fill in the placeholders. Do not commit real values.

```bash
cp .env.example backend/.env
cp .env.example frontend/.env
```

The API reads `backend/.env`. The web app reads `frontend/.env` and only exposes variables that start with `VITE_`. Generate a new random string for `EXPRESS_FLASK_KEY` and use the same value in the API and the image service.

`MONGODB_URI` is the database connection string. The split `DEV_COSMOSDB_*` and `PROD_COSMOSDB_*` variables are a fallback when `MONGODB_URI` is empty. Set `MONGODB_TLS=true` for a database that requires TLS.

External image providers are optional. The variable names are listed in `.env.example`. Leave a key empty to disable that provider.

## Run the web app and API

```bash
cd backend && npm install && npm start
```

```bash
cd frontend && npm install && npm run dev
```

The API listens on port 5001. The web app listens on port 3000.

You can also build the API image and start it with Docker Compose after creating `.env` from the example:

```bash
docker compose up --build backend
```

## Run an image service

The mock service returns a placeholder image and does not call a model:

```bash
cd ai-mock
python -m venv .venv && . .venv/bin/activate
pip install -r requirements.txt
# set EXPRESS_FLASK_KEY to the same value as the API
python app.py
```

The local model service is in `ai/`. Install its requirements, then run `python -m src.deploy.app` from that directory. Set `MODEL_CACHE_PATH` if the weights should live outside the default Hugging Face cache. See `ai/README.md`.

`ai-startup/` is the lighter HTTP service used when generation is delegated to an external provider. It reads the same provider variables. Flask debug mode is off unless `FLASK_DEBUG=1`.

## License

The code is released under the Apache License, Version 2.0. Copyright 2026 Unetiq GmbH. See [LICENSE](LICENSE) and [NOTICE](NOTICE). Model weights have their own licenses and are not included.
