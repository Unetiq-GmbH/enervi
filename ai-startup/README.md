# EnerVi startup service

Small Flask service that accepts a visualisation request and forwards it to the provider selected by the scenario. Provider credentials come only from the environment. See `.env.example` in the repository root.

Debug mode is off unless `FLASK_DEBUG=1`.

## Endpoints

- `GET /enervi/check_status` — whether the image worker is available
- `POST /enervi/visualize` — transform an image. The body includes the image as base64 and the visualisation type
- `GET /enervi/check_activity` — used by the hourly cron inside the container
- `GET /enervi/health_check` — process health

`EXPRESS_SERVER_URL` is the API that receives finished images. `EXPRESS_FLASK_KEY` must match the API.

## Run

```shell
pip install -r requirements.txt
pip install -e .
gunicorn app:app
```

The image does not install an SSH server. Build it with `docker build -t enervi-startup .` from this directory.
