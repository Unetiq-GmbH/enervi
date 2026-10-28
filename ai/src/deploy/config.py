import os

inpainting_visualization_types = ["solar", "wind", "vegetation", "flood", "flux_wind"]
controlnet_visualization_types = ["utopia", "dystopia", "custom_prompt"]
dev_route = "dev"
startup_server_url = os.getenv("STARTUP_SERVER_URL")
