#!/bin/sh

set -e

echo "Collecte des fichiers statiques Django..."
python manage.py collectstatic --noinput

echo "Remise à zéro des statuts en ligne..."
# In case of server crash so users don't stay stuck on online
python manage.py reset_presence || echo "reset_presence a échoué (make migrate ?)"

echo "Démarrage du serveur ASGI Uvicorn..."
exec python -m uvicorn config.asgi:application \
    --host 0.0.0.0 \
    --port 8000 \
    --reload
