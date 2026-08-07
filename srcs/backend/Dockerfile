# Evite la création de fichiers Python __pycache__ et .pyc dans le projet
# Affiche les logs Django dans Docker
# Définit /app comme dossier de travail dans le conteneur
# Installe curl pour les checks dans compose
# Copie les dépendances
# Installe les requirements
# Utilise le script comme point d'entrée
# Arguments pour les permissions
# Creation du non-root
# Port backend
# uvicorn pour asgi
# --reload est uniquement destiné au développement

FROM    python:3.13-slim-bookworm

ARG     UID=1000
ARG     GID=1000

ENV     PYTHONDONTWRITEBYTECODE=1
ENV     PYTHONUNBUFFERED=1

WORKDIR /app

RUN     apt-get update && apt-get install -y curl \
        && rm -rf /var/lib/apt/lists/*

COPY    requirements.txt .

RUN     pip install --no-cache-dir -r requirements.txt

COPY    . .

COPY    entrypoint.sh /entrypoint.sh

RUN     chmod +x /entrypoint.sh

RUN     groupadd -o -g $GID appgroup && \
        useradd -o -u $UID -g appgroup -m appuser && \
        mkdir -p /app/staticfiles && \
        chown -R appuser:appgroup /app

EXPOSE  8000

USER    appuser

CMD     ["/entrypoint.sh"]