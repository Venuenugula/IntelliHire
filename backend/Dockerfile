# Production image for the DELULU backend (FastAPI).
#
# Schema management is NOT done here. Database migrations run as a SEPARATE,
# gated deploy step (`alembic upgrade head` + `alembic -c alembic_gh.ini upgrade
# head`) before this container starts. On boot, app.core.database.init_db()
# fails fast unless the DB is already at the expected head revision.
FROM python:3.10-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

# Install dependencies first for better layer caching.
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Application code (includes both alembic trees for the deploy-time migration step).
COPY . .

# Run as an unprivileged user.
RUN useradd --create-home --uid 10001 appuser \
    && chown -R appuser:appuser /app
USER appuser

EXPOSE 8000

# Runtime only — no table creation, no migrations (see init_db fail-fast guard).
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
