# Running the Image Generation Pipeline

[Set up your environment](../README.md)  

For deployment, refer to ```src/deploy/```.  

## Demo Scripts

You can run the inpainting and controlnet pipelines directly from the root dir:
```python -m src.inpainting_demo``` or ```python -m src.controlnet_demo```.  

Adjust parameters directly in the script. Note that models will be downloaded if not present. Running on CPU for full iterations is not recommended (takes ages).