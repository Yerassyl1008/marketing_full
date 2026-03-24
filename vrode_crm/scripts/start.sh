#!/usr/bin/env sh

set -eu

HOST="${APP_HOST:-0.0.0.0}"
PORT="${PORT:-${APP_PORT:-8000}}"
WORKERS="${WEB_CONCURRENCY:-1}"
LOG_LEVEL_VALUE="${LOG_LEVEL:-info}"
RUN_MIGRATIONS_VALUE="${RUN_MIGRATIONS:-true}"
MAX_ATTEMPTS="${MIGRATION_MAX_ATTEMPTS:-10}"
RETRY_INTERVAL="${MIGRATION_RETRY_INTERVAL:-3}"

case "$RUN_MIGRATIONS_VALUE" in
  true|TRUE|1|yes|YES)
    attempt=1
    until alembic upgrade head; do
      if [ "$attempt" -ge "$MAX_ATTEMPTS" ]; then
        echo "Migrations failed after ${attempt} attempts"
        exit 1
      fi
      echo "Migration attempt ${attempt} failed, retrying in ${RETRY_INTERVAL}s..."
      attempt=$((attempt + 1))
      sleep "$RETRY_INTERVAL"
    done
  ;;
esac

exec uvicorn app.main:app \
  --host "$HOST" \
  --port "$PORT" \
  --workers "$WORKERS" \
  --log-level "$LOG_LEVEL_VALUE" \
  --proxy-headers \
  --forwarded-allow-ips="*"
