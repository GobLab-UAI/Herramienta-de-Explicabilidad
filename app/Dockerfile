# Contexto de build: raíz del proyecto (para que `app` sea importable como paquete)
FROM python:3.11-slim
WORKDIR /src
RUN apt-get update && apt-get install -y build-essential curl && rm -rf /var/lib/apt/lists/*

COPY app/requirements.txt /tmp/requirements.txt
RUN pip install --no-cache-dir -r /tmp/requirements.txt

COPY app/ /src/app/

ENV PYTHONPATH=/src
CMD exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
