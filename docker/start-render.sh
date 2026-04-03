#!/bin/sh
set -eu

WEB_PORT="${PORT:-8080}"
API_PORT="${API_PORT:-18080}"

PORT="${API_PORT}" /app/symbolize-api &
API_PID=$!

cleanup() {
  kill "${API_PID}" 2>/dev/null || true
}
trap cleanup INT TERM EXIT

API_UPSTREAM="http://127.0.0.1:${API_PORT}" \
PORT="${WEB_PORT}" \
  /usr/local/bin/start-nginx.sh
