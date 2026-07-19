COMPOSE = docker compose

up:
	$(COMPOSE) up --build

start:
	$(COMPOSE) up -d

down:
	$(COMPOSE) down

stop:
	$(COMPOSE) stop

restart:
	$(COMPOSE) restart

build:
	$(COMPOSE) build

logs:
	$(COMPOSE) logs -f

ps:
	$(COMPOSE) ps

createsuperuser:
	$(COMPOSE) exec backend python manage.py createsuperuser

migrate:
	$(COMPOSE) exec backend python manage.py migrate

makemigrations:
	$(COMPOSE) exec backend python manage.py makemigrations

shell:
	$(COMPOSE) exec backend python manage.py shell

clean:
	$(COMPOSE) down --remove-orphans

fclean:
	$(COMPOSE) down -v --remove-orphans

re: fclean up

.PHONY: up start down stop restart build logs ps \
	createsuperuser migrate makemigrations shell \
	clean fclean re