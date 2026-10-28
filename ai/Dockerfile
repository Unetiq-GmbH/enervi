# Use a PyTorch image with Python 3.10 and CUDA (choose a version that matches your host and model requirements)
FROM nvidia/cuda:11.7.1-cudnn8-runtime-ubuntu22.04

# Set the working directory
WORKDIR /app

ENV DEBIAN_FRONTEND="noninteractive"
ENV TZ="Europe/Amsterdam"

# Install dependencies and Python packages
RUN apt-get update && apt-get install -y \
    gcc \
    python3-dev \
    python3-pip \
    ffmpeg \
    libsm6 \
    libxext6

# Copy environment variables
ENV RUNTIME_ENV="docker"
ENV HUGGINGFACE_HUB_CACHE="models/"
ENV HF_HOME="models/"
ENV MODEL_CACHE_PATH="models/"

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install -r requirements.txt

# Copy application code
COPY . .

# Install local packages
RUN pip install -e .

# Set the entrypoint for the container
CMD ["gunicorn", "src.deploy.app:app"]