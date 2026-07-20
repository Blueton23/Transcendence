# Evite la création de fichiers Python __pycache__ et .pyc dans le projet
# Affiche les logs Django dans Docker
# Définit /app comme dossier de travail dans le conteneur
# Copie les dépendances
# Installe les requirements
# Port backend
# runserver pour tourner en dev
# uvicorn pour production, CMD ["python", "-m", "uvicorn", "config.asgi:application", "--host", "0.0.0.0", "--port", "8000", "--reload"]

FROM    python:3.13-slim-bookworm

ENV     PYTHONDONTWRITEBYTECODE=1
ENV     PYTHONUNBUFFERED=1

WORKDIR /app

COPY    ./requirements.txt .

RUN     pip install -r requirements.txt

COPY    . .

EXPOSE  8000

CMD     ["python", "manage.py", "runserver", "0.0.0.0:8000"]