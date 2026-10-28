# Flask API

[Set up your environment](../../README.md)

## Run with Docker
Build the image: ```docker build -t enervi-image .```  

Models will be expected in ```/app/models/```. They will be downloaded if not present. I suggest to use a docker volume to persist them across container runs.
Run the container: ```docker run -p [source-port-number]:[target-port-number] -v enervi-volume:/app/models/ enervi-image```

## API Usage

The root path for all endpoints (except the documentation) is ```/enervi/api/```.  

Static API documentation is located at ```src/deploy/documentation/doc.html```. Access the API documentation within the running app at ```http://localhost:3000/enervi```.  
To update the documentation in case of changes, run ```python -m src.deploy.documentation.doc_generator``` while the flask server is up.

### Run flask locally
Run ```python -m src.deploy.app``` from the root dir.   

### Run gunicorn
```gunicorn src.deploy.app:app```  
Configure gunicorn in ```gunicorn.conf.py```.

## Model Locations

Set `MODEL_CACHE_PATH` (see `src/models/config.py`). When run in Docker, models are expected in the mounted Hugging Face cache configured in the Dockerfile.

If a model is not found, it will be downloaded. They can be several GB large.

## Data Locations

Running the demo scripts without flask requires the input image to be in ```data/example_images/```. 
Intermediate and final results will be saved in ```data/example_results/```.



