include .env
export

#######################################

COMPOSE = docker compose

#######################################

# Commandes compose
up:
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

# Commandes Django
makemigrations:
	$(COMPOSE) exec backend python manage.py makemigrations

migrate:
	$(COMPOSE) exec backend python manage.py migrate

startapp:
	docker compose exec backend python manage.py startapp $(name)

createsuperuser:
	$(COMPOSE) exec backend python manage.py createsuperuser

shell:
	$(COMPOSE) exec backend python manage.py shell

check:
	docker compose exec backend python manage.py check

#######################################

.PHONY: up down start stop restart build ps images volumes logs clean fclean re \
	psql test-db \
	makemigrations migrate startapp createsuperuser shell check