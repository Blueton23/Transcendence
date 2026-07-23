#!/bin/sh

set -e

echo "Collecte des fichiers statiques Django..."
python manage.py collectstatic --noinput

echo "Démarrage du serveur ASGI Uvicorn..."
exec python -m uvicorn config.asgi:application \
    --host 0.0.0.0 \
    --port 8000 \
    --reload