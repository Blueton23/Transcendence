# Evite la création de fichiers Python __pycache__ et .pyc dans le projet
# Affiche les logs Django dans Docker
# Définit /app comme dossier de travail dans le conteneur
# Copie les dépendances
# Installe les requirements
# Utilise le script comme point d'entrée
# Port backend
# uvicorn pour asgi
# --reload est uniquement destiné au développement

FROM    python:3.13-slim-bookworm

ENV     PYTHONDONTWRITEBYTECODE=1
ENV     PYTHONUNBUFFERED=1

WORKDIR /app

COPY    requirements.txt .

RUN     pip install --no-cache-dir -r requirements.txt

COPY    . .

COPY    entrypoint.sh /entrypoint.sh

RUN     chmod +x /entrypoint.sh

EXPOSE  8000

CMD     ["/entrypoint.sh"]