FROM python:3.10
WORKDIR /app
RUN apt-get update \
    && apt-get install -y --no-install-recommends cron curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
RUN pip install -e .

EXPOSE 8080

CMD ["./start.sh"]
