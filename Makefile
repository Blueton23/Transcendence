-include .env
export

#######################################

COMPOSE = docker compose

#######################################

# Commandes compose
all: up

env:
	@if [ ! -f kit.tgz ] && { [ ! -f .env ] || [ ! -d certs/live/peripl.app ]; }; then \
		echo "kit.tgz manquant : déposez-le à la racine du projet."; \
		exit 1; \
	fi
	@if [ ! -d certs/live/peripl.app ]; then \
		echo "Installation des certificats..."; \
		tar xzf kit.tgz certs; \
	fi
	@if [ ! -f .env ]; then \
		echo "Création du .env..."; \
		tar xzf kit.tgz secrets.env; \
		. ./secrets.env; \
		cp .env.example .env; \
		sed -i "s|^DJANGO_SECRET_KEY=.*|DJANGO_SECRET_KEY=$$(openssl rand -hex 32)|" .env; \
		sed -i "s|^POSTGRES_PASSWORD=.*|POSTGRES_PASSWORD=$$(openssl rand -hex 16)|" .env; \
		sed -i "s|^UID=.*|UID=$$(id -u)|" .env; \
		sed -i "s|^GID=.*|GID=$$(id -g)|" .env; \
		sed -i "s|^GOOGLE_CLIENT_ID=.*|GOOGLE_CLIENT_ID=$$GOOGLE_CLIENT_ID|" .env; \
		sed -i "s|^GOOGLE_CLIENT_SECRET=.*|GOOGLE_CLIENT_SECRET=$$GOOGLE_CLIENT_SECRET|" .env; \
		sed -i "s|^VITE_MAPBOX_TOKEN=.*|VITE_MAPBOX_TOKEN=$$VITE_MAPBOX_TOKEN|" .env; \
		rm -f secrets.env; \
	fi

up: env
	$(COMPOSE) up --build

down:
	$(COMPOSE) down

start:
	$(COMPOSE) up -d

stop:
	$(COMPOSE) stop

restart:
	$(COMPOSE) restart

build:
	$(COMPOSE) build

ps:
	$(COMPOSE) ps

images:
	$(COMPOSE) images

volumes:
	$(COMPOSE) volumes

front-install:
	$(COMPOSE) exec frontend npm ci
	$(COMPOSE) restart frontend

logs:
	$(COMPOSE) logs -f

clean:
	$(COMPOSE) down --remove-orphans

fclean:
	@echo "⚠️  Cette commande va supprimer TOUTES les données (volumes Postgres inclus)."
	@read -p "Es-tu sûr ? [y/N] " confirm && [ "$$confirm" = "y" ] || exit 1
	docker compose down --rmi local -v
	$(COMPOSE) down -v --remove-orphans

re: fclean up

smoke:
	./scripts/smoke.sh

#######################################

# Commandes db
psql:
	docker compose exec db psql -U $(POSTGRES_USER) -d $(POSTGRES_DB)

test-db:
	docker compose exec backend python -c "\
import psycopg, os; \
conn = psycopg.connect( \
    host=os.environ['POSTGRES_HOST'], \
    dbname=os.environ['POSTGRES_DB'], \
    user=os.environ['POSTGRES_USER'], \
    password=os.environ['POSTGRES_PASSWORD'] \
); \
print('✅ Connexion réussie à la base :', conn.info.dbname)"

#######################################

# Commandes Django/backend
makemigrations:
	$(COMPOSE) exec backend python manage.py makemigrations

check-migrations:
	$(COMPOSE) exec backend python manage.py makemigrations --check --dry-run

migrate:
	$(COMPOSE) exec backend python manage.py migrate

startapp:
	docker compose exec backend python manage.py startapp $(name)

createsuperuser:
	$(COMPOSE) exec backend python manage.py createsuperuser

seed:
	$(COMPOSE) exec backend python manage.py seed $(ARGS)

unseed:
	$(COMPOSE) exec backend python manage.py unseed $(ARGS)

shell:
	$(COMPOSE) exec backend python manage.py shell

check:
	$(COMPOSE) exec backend python manage.py check

test:
	$(COMPOSE) exec backend python manage.py test $(ARGS)

ping:
	$(COMPOSE) exec redis redis-cli ping

logs-backend:
	$(COMPOSE) logs -f backend

format-back:
	$(COMPOSE) exec backend ruff format .

format-check-back:
	$(COMPOSE) exec backend ruff format --check .

lint-back:
	$(COMPOSE) exec backend ruff check .

lint-fix-back:
	$(COMPOSE) exec backend ruff check --fix .

check-back: lint-back format-check-back

fix-back: lint-fix-back format-back

#######################################

# Commandes Frontend
format-front:
	$(COMPOSE) exec frontend npm run format

format-check-front:
	$(COMPOSE) exec frontend npm run format:check

lint:
	$(COMPOSE) exec frontend npm run lint

#######################################

.PHONY: all env up down start stop restart build ps images volumes logs clean fclean re smoke \
	psql test-db \
	makemigrations check-migrations migrate startapp createsuperuser seed unseed shell check test format-back format-check-back \
	lint-back lint-fix-back check-back fix-back format-front format-check-front front-install