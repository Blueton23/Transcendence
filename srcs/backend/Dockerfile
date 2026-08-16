# POUR LA PROD DANS ENTRYPOINT.SH
# Ajouter si besoin pour la migration auto - "python manage.py migrate --noinput"
# Remplacer "--reload" par "--workers 4"

FROM    python:3.13-slim-bookworm

ARG     UID=1000
ARG     GID=1000

ENV     PYTHONDONTWRITEBYTECODE=1
ENV     PYTHONUNBUFFERED=1
ENV     RUFF_NO_CACHE=true

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
        mkdir -p /app/staticfiles /app/mediafiles && \
        chown -R appuser:appgroup /app

EXPOSE  8000

USER    appuser

CMD     ["/entrypoint.sh"]