# Multi-stage production Dockerfile for FastAPI with Astral uv
FROM python:3.11-slim-bookworm AS builder

# Install uv binary directly from official image
COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    UV_SYSTEM_PYTHON=1

WORKDIR /app

# Install dependencies using uv
COPY backend/pyproject.toml /app/backend/pyproject.toml
WORKDIR /app/backend
RUN uv pip install --no-cache fastapi uvicorn firebase-admin google-genai pydantic pydantic-settings python-dotenv

# Final runtime image
FROM python:3.11-slim-bookworm AS runner

WORKDIR /app

# Copy python packages and binaries
COPY --from=builder /usr/local /usr/local

# Copy application code and roadmap asset
COPY roadmap_v3.json /app/roadmap_v3.json
COPY backend/app /app/backend/app

WORKDIR /app/backend

ENV PYTHONPATH=/app/backend \
    PORT=8000

EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD python3 -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1

# Start FastAPI uvicorn server
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
