#!/bin/sh

set -e

echo "Application des migrations..."
python manage.py migrate --noinput

echo "Collecte des fichiers statiques Django..."
python manage.py collectstatic --noinput

echo "Démarrage du serveur ASGI Uvicorn..."
exec python -m uvicorn config.asgi:application \
    --host 0.0.0.0 \
    --port 8000 \
    --workers 4 \
    --proxy-headers \
    --forwarded-allow-ips="*"