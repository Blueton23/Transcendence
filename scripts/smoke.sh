#!/bin/sh
# Smoke test of the running stack, going through nginx like a browser would.
# Usage: make smoke   (the stack must be up: make start)

set -eu

BASE_URL="${BASE_URL:-http://localhost:8080}"
COMPOSE="docker compose"
USERNAME="smoke-$(date +%s)"
PASSWORD="Smoke-test-$(date +%s)!"
JAR="$(mktemp)"

cleanup() {
    rm -f "$JAR"
    $COMPOSE exec -T backend python manage.py shell -c \
        "from traveler.models import Traveler; Traveler.objects.filter(username='$USERNAME').delete()" \
        >/dev/null 2>&1 || true
}
trap cleanup EXIT

step() { printf '→ %s... ' "$1"; }
ok() { echo "ok"; }

step "frontend is served"
curl -fsS "$BASE_URL/" | grep -q 'id="root"'
ok

step "API answers"
curl -fsS "$BASE_URL/api/" | grep -q '"status":"ok"'
ok

step "static files are served by nginx"
curl -fsS -o /dev/null "$BASE_URL/static/admin/css/base.css"
ok

step "database migrations are applied"
$COMPOSE exec -T backend python manage.py migrate --check >/dev/null
ok

step "signup writes to the database"
curl -fsS -o /dev/null -X POST "$BASE_URL/api/travelers/create/" \
    -H 'Content-Type: application/json' \
    -d "{\"username\":\"$USERNAME\",\"firstName\":\"Smoke\",\"lastName\":\"Test\",\"email\":\"$USERNAME@example.com\",\"password\":\"$PASSWORD\",\"passwordConfirmation\":\"$PASSWORD\"}"
ok

step "login opens a session"
curl -fsS -o /dev/null -c "$JAR" -X POST "$BASE_URL/api/auth/login/" \
    -H 'Content-Type: application/json' \
    -d "{\"username\":\"$USERNAME\",\"password\":\"$PASSWORD\"}"
curl -fsS -b "$JAR" "$BASE_URL/api/auth/me/" | grep -q "\"$USERNAME\""
ok

step "websocket goes through nginx and uvicorn"
$COMPOSE exec -T backend python -c "
from websockets.sync.client import connect
with connect('ws://nginx/ws/ping/', origin='http://localhost') as ws:
    ws.send('{\"message\": \"smoke\"}')
    assert ws.recv(timeout=5) == '{\"message\": \"pong: smoke\"}'
" >/dev/null
ok

step "backend reaches the Redis channel layer"
$COMPOSE exec -T backend python manage.py shell -c "
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
layer = get_channel_layer()
channel = async_to_sync(layer.new_channel)()
async_to_sync(layer.send)(channel, {'type': 'smoke'})
assert async_to_sync(layer.receive)(channel) == {'type': 'smoke'}
" >/dev/null
ok

echo "✅ Smoke test passed"
