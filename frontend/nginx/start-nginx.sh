#!/bin/sh
set -eu

PORT="${PORT:-8080}"
API_UPSTREAM="${API_UPSTREAM:-http://api:8080}"

sed \
  -e "s|__PORT__|${PORT}|g" \
  -e "s|__API_UPSTREAM__|${API_UPSTREAM}|g" \
  /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

exec nginx -g 'daemon off;'
