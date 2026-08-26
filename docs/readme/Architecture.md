Ce projet a été créé dans le cadre du cursus 42 par <dle-fur[Technical Lead - Architect]>

## Architecture :

```
FT_TRANSCENDENCE/                    # Racine générale du projet
│
├── backend/                         # Backend Python : API, logique métier et accès à PostgreSQL
│   │
│   ├── config/                      # Configuration principale du projet Django
│   │   ├── __init__.py              # Indique à Python que config est un paquet importable
│   │   ├── asgi.py                  # Point d’entrée Django pour les serveurs ASGI
│   │   ├── settings.py              # Paramètres Django : DB, applications, sécurité, langue, etc.
│   │   ├── urls.py                  # Routes principales du backend : /admin/, /api/, etc.
│   │   └── wsgi.py                  # Point d’entrée Django pour les serveurs WSGI
│   │
│   ├── .dockerignore                # Fichiers du backend exclus du contexte de build Docker
│   ├── Dockerfile                   # Instructions pour construire l’image Docker Django
│   ├── manage.py                    # Utilitaire en ligne de commande de Django
│   └── requirements.txt             # Liste des dépendances Python du backend
│
├── docs/                            # Documentation du projet : architecture, API, installation, choix techniques
│
├── frontend/                        # Frontend React chargé de l’interface utilisateur
│   │
│   ├── node_modules/                # Dépendances JavaScript installées par npm, non versionnées
│   │
│   ├── public/                      # Fichiers publics copiés tels quels et accessibles par URL
│   │   ├── favicon.svg              # Icône affichée dans l’onglet du navigateur
│   │   └── icons.svg                # Fichier contenant des icônes SVG publiques
│   │
│   ├── src/                         # Code source principal de l’application React
│   │   ├── assets/                  # Images, icônes et autres ressources importées par React
│   │   ├── App.css                  # Styles spécifiques au composant principal App
│   │   ├── App.jsx                  # Composant React principal de l’application
│   │   ├── index.css                # Styles CSS globaux de l’application
│   │   └── main.jsx                 # Point d’entrée JavaScript qui monte React dans la page HTML
│   │
│   ├── .dockerignore                # Fichiers du frontend exclus du contexte de build Docker
│   ├── .gitignore                   # Fichiers du frontend exclus du dépôt Git
│   ├── .oxlintrc.json               # Configuration d’Oxlint pour analyser la qualité du code JS/React
│   ├── Dockerfile                   # Instructions pour construire l’image React/Vite
│   ├── index.html                   # Page HTML de base dans laquelle React est chargé
│   ├── package-lock.json            # Versions exactes des dépendances npm installées
│   ├── package.json                 # Dépendances, scripts et informations du projet frontend
│   ├── README.md                    # Documentation propre au frontend, générée initialement par Vite
│   └── vite.config.js               # Configuration du serveur et du build Vite
│
├── nginx/                           # Configuration du reverse proxy et serveur web Nginx
│   ├── .dockerignore                # Fichiers Nginx exclus de son contexte de build
│   ├── Dockerfile                   # Instructions pour construire l’image Nginx
│   └── nginx.conf                   # Routage des requêtes vers React ou Django
│
├── .env                             # Variables d’environnement réelles et secrètes, non versionnées
├── .env.example                     # Modèle public des variables nécessaires, sans valeurs secrètes
├── .gitignore                       # Fichiers et dossiers exclus du dépôt Git pour tout le projet
├── docker-compose.yml               # Décrit et relie PostgreSQL, Django, React/Vite et Nginx
└── Makefile                         # Raccourcis pour construire, démarrer et gérer les conteneurs
```

```
Navigateur
    │
    ▼
Nginx
    ├── /api/     → Uvicorn → Django HTTP
    ├── /admin/   → Uvicorn → Django HTTP
    ├── /ws/      → Uvicorn → Django Channels
    └── /         → Vite

Django Channels
    │
    ▼
Redis

Django ORM
    │
    ▼
PostgreSQL
```

Les volumes :
```
postgres_data
└── données PostgreSQL importantes et persistantes

frontend_node_modules
└── dépendances npm du frontend

static_data
└── CSS, JavaScript et images statiques de Django
```

====================================================================================================

## Descriptions des outils utilisés :

### Conteneur Postgresql :
- PostgreSQL est un système de gestion de base de données qui permet de stocker, organiser et retrouver des données
- C'est le premier service a mettre en place dans le compose
- La base de données reçoit  des ordres comme : SELECT, INSERT, UPDATE, DELETE
- En developpement le mot passe peut etre simple, pour la production chaque personne doit créer un mot de passe complexe et l'inclure dans son .env
- Lors du premier build, make migrate pour migrer les tables crées par Django
- Lors de chaque changement dans une tables, appliquez les commandes danns l'ordre : make makemigrations / make migrate
- Creer un superuser au départ pour accéder a http://localhost/admin/
- Admin va permettre de gerér la base sans passer par le shell
- L'ORM est directement intégrée dans Django, cela permet de créer des requetes sql en python sans écrire de code SQL

```
Classe Python users
        ↓
ORM Django
        ↓
Table PostgreSQL users
```

| Tables générées par Django| Description |
|---|---|
| `auth_group` | Stocke les groupes d’utilisateurs, par exemple "administrateurs", "modérateurs" ou "joueurs" |
| `auth_group_permissions` | Relie les groupes aux permissions qu’ils possèdent |
| `auth_permission` | Contient les permissions disponibles, par exemple ajouter, modifier, supprimer ou voir un modèle |
| `auth_user` | Contient les utilisateurs Django : username, email, mot de passe hashé, statut actif, superuser, etc. |
| `auth_user_groups` | Relie un utilisateur à un ou plusieurs groupes |
| `auth_user_user_permissions` | Relie directement un utilisateur à des permissions particulières, sans passer par un groupe |
| `django_admin_log` | Enregistre les actions faites dans l’interface d’administration Django |
| `django_content_type` | Répertorie les modèles connus par Django afin de gérer les permissions et les relations génériques |
| `django_migrations` | Enregistre les migrations déjà appliquées dans la base de données |
| `django_session` | Stocke les sessions des utilisateurs connectés, par exemple pour rester connecté entre plusieurs requêtes |

| Commandes psql | Description |
|---|---|
| `docker compose exec db psql -U <POSTGRES_USER> -d <POSTGRES_DB>` | Se connecter a postgres + entrée dans la base de données |
| `\h SELECT` | Aide SQL |
| `\?` | Aide psql |
| `\conninfo` | Connexion actuelle |
| `\l` | Bases de données |
| `\c nom_base` | Changer de base |
| `\dn` | Schémas |
| `\dt` | Tables |
| `\d nom_table` | Structure d’une table |
| `\du` | Utilisateurs et rôles |
| `\password utilisateur` | Changer un mot de passe |
| `\x auto` | Affichage lisible |
| `\timing` | Temps d’exécution |
| `\q` | Quitter |

====================================================================================================

### Conteneur Django - backend :
Django est un framework complet basé sur python incluant des tables de données, un orm et plusieurs fonctionnalité a sa création

Django reçoit toutes les requêtes et gère :
- les routes
- les utilisateurs
- les permissions
- les modèles
- les migrations
- les formulaires
- l'administration
- les API

Le backend installe les dependances via un fichier requirements.txt mis dans dockerfile. Il sera mis a jour au fur et a mesure

| dependances | Description |
|---|---|
| `Django==5.2.16` | Django est le framework principal de ton application backend |
| `djangorestframework==3.17.1` | Django REST Framework sert à créer une API avec Django. Une API permet au frontend de communiquer avec le backend|
| `psycopg[binary]==3.3.4` | Psycopg est le pilote qui permet à Django de communiquer avec PostgreSQL |
| `channels==4.3.2` | Extension officielle qui permet à Django de gérer les WebSockets. Garde une connexion ouverte en continu avec le client |
| `channels-redis==4.3.0` | Backend de communication utilisé par Channels pour faire circuler les messages entre plusieurs connexions |
| `uvicorn[standard]==0.51.0` | Serveur ASGI qui fait tourner l'application |
| `Faker==40.37.0` | Génère des fausses données réalistes (noms, emails, etc.) pour la commande `seed` |

Deux concepts principaux avec Django :
- un Projet
- des Applications

#### Projet :
Le projet Django est créer une seule fois et va contenir (renommé config) :
- la configuration globale
- les URLs
- les paramètres
- le démarrage

Corriger les droits après config si besoin ->  sudo chown -R "$USER":"$USER" backend

Le projet va créer plusieurs fichier .py

Dans config/settings.py :
- Va permettre de configurer l app, la base de données, la langue et d'enregistrer des application
- par defauts le mode debug est active (desactiver en prod)
- Plusieurs choses seront a modifier pour la production
- La secret key sera a modifiée

Dans config/urls :
- Va permettre de definir les routes. Une route est un chemin pour acceder a une ressource, exemple http://localhost/admin/, admin est une route
- Sera ajouter les api/user etc.

Les autres fichiers reste généralement intact sauf settings.py
WSGI ou ASGI a décider en équipe

#### Application :
Une application Django représente un domaine fonctionnel comme :
- Users
- Trips
- Maps
- Expenses
- Chat
- AI
- Notifications

| Commande créer app | Description |
|---|---|
| `docker compose exec backend python manage.py startapp nom_de_l_app` | Creer une app dans le projet |
| `docker compose exec backend python manage.py startapp nom_de_l_app nom_de_l_app/dossier` | Creer une app dans le projet dans un dossier |

Une fois qu'une app est crée, elle doit etre ajouter dans settings.py sous INSTALLED_APPS, exemple : "users"
Chaque app aura ses propres fichiers .py, ils seront a connecter

#### App commune - `common` :
En plus des apps métier (Users, Trips, ...), l'app `common` centralise ce qui est transverse et partagé entre plusieurs apps :
- Champs communs aux modèles (`created_at`, `updated_at`) via une classe abstraite
- Droits d'accès (permissions DRF réutilisables)
- Format d'erreur standardisé pour toutes les API
- Génération de données de test (seeds)

#### Seeds (données de test) :
- Objectif : remplir rapidement la base avec des données de test réalistes, sans tout créer à la main via l'admin
- Centralisé dans `common` car l'ordre de création entre apps (dépendances entre modèles, ex: un traveler doit exister avant une friendship) doit être géré à un seul endroit
- Utilise `Faker` pour générer les données aléatoires

```
common/
├── management/commands/seed.py   # commande "python manage.py seed", orchestre l'ordre de création
└── seeders/
    ├── traveler.py                # génération pour l'app traveler : seed_travelers(), seed_friendships()
    └── travel.py                  # génération pour l'app travel : seed_travels(), seed_participations()
```

- `seed.py` reste volontairement fin : il appelle uniquement les fonctions `seed_*` de `common/seeders/` dans l'ordre des dépendances
- Chaque app avec des données à seed a son propre fichier `common/seeders/nom_app.py`, qui expose des fonctions `seed_xxx(fake, ...)` retournant les objets créés
- Pour seed une nouvelle app : créer `common/seeders/nom_app.py`, puis appeler ses fonctions depuis `seed.py` dans le bon ordre de dépendance

| Commande | Description |
|---|---|
| `docker compose exec backend python manage.py seed --travelers 20 --friendships 10 --travels 10 --participations 30` | Crée 20 travelers, 10 friendships, 10 travels et 30 participations aléatoires |
| `make seed ARGS="--travelers 50 --friendships 30 --travels 20 --participations 60"` | Équivalent via le Makefile |

#### Server ASGI :
- Point d’entrée pour les serveurs Web compatibles aSGI pour déployer le projet
- Django peut servir les requêtes HTTP classiques et les WebSockets depuis la même application ASGI

ASGI peut traiter :
- HTTP classique
- WebSockets
- connexions longues
- communications temps réel

Requirements a installer :
- Django Channels : pour ajouter la gestion des WebSockets à Django
- Uvicorn comme serveur ASGI en développement
- Redis : comme couche de communication entre les connexions WebSocket
- Gunicorn + uvicorn-worker : pour superviser plusieurs workers ASGI en production

### Volumes :
staticfiles
- Dossier où Django va rassembler tous les fichiers statiques via collectstatic

mediafiles
- Dossier où seront stockés les fichiers uploadés par les utilisateurs (images, etc)

### REST Framework :
- Django REST Framework (DRF, package djangorestframework) est une extension de Django pour construire des API. Cela va construire des API REST en JSON que le frontend (React/Vite) va utiliser via des requêtes HTTP et va les transformer en interface

DRF ajoute par-dessus Django :
- Serializers : convertissent les modèles Django (objets Python/DB) en JSON, et inversement (valident les données JSON reçues avant de les sauvegarder en DB)
- Views/ViewSets : gèrent proprement les méthodes HTTP (GET, POST, PUT, DELETE) pour chaque ressource
- Routers : génèrent automatiquement les URLs REST classiques (/api/users/, /api/users/1/, etc.)

Explication dockerfile backend :
| Nom | Description |
|---|---|
| `ARG UID/GID` | Pour les permissions non-root |
| `ENV PYTHONDONTWRITEBYTECODE=1/PYTHONUNBUFFERED=1` | Evite la création de fichiers Python __pycache__ et .pyc dans le projet |
| `WORKDIR /app` | Définit /app comme dossier de travail dans le conteneur |
| `RUN curl` | Installe curl pour les checks dans compose |
| `COPY requirements.txt .` | Copie les dépendances |
| `RUN pip install` | Installe les requirements |
| `COPY . .` | Copie le code dans l’image |
| `COPY entrypoint.sh` | Utilise le script comme point d'entrée |
| `RUN chmod +x` | Permission entrypoint |
| `RUN groupadd/useradd` | Creation du non-root |
| `EXPOSE 8000` | port backend |
| `USER appuser` | permssion sur appuser |
| `CMD ["/entrypoint.sh"]` | Commande du point d'entré |

====================================================================================================

### Conteneur Redis
- Redis sera utilisé par Django Channels pour transmettre les événements entre les connexions WebSocket
- L’application channels fournit les commandes et l’intégration nécessaires à Django Channels

Redis pourra etre utilisé pour :
- Chat en direct
- Notifications instantanées
- Utilisateurs actuellement connectés
- Modifications collaboratives d’un roadtrip
- Partage de position
- Mise à jour des dépenses

- Relier Django Channels à Redis dans settings.py
- Futures routes WebSocket dans /backend/config/websocket_urls.py
- Ajout du bloc location /ws/ dans nginx.conf

- les apps avec websocket seront connecter dans websocket_urls.py
- les apps sans websocket seront connecter dans urls.py

====================================================================================================

### Conteneur Frontend - react + vite :

#### React :
- React sert à construire l’interface utilisateur de l'application - ce que l’utilisateur voit et manipule
- Va permettre de créer les pages et les éléments visibles du site sous forme de composants réutilisables (bouton, une carte, formulaire ou une page complète)
- React peut mémoriser l’état d’un composant et réafficher automatiquement l’interface lorsque cet état change

React servira aussi a :
- Afficher les itinéraires
- Gérer les formulaires
- Réagir aux clics
- Mettre à jour la page
- Afficher une carte
- Afficher les données reçues de Django

#### Vite :
- Vite est l’outil qui prépare et exécute le projet frontend - fait fonctionner et compile l’application
- Le script vite est défini dans package.json

Vite fournit principalement :
- Un serveur de développement rapide
- Le rechargement automatique lorsque tu modifies un fichier
- La gestion des imports JavaScript, du JSX, du CSS et des ressources
- La compilation finale pour la production

Fonctionnement complet :
```
Utilisateur
    ↓
React affiche l’interface
    ↓
React appelle /api/roadtrips/
    ↓
Nginx transmet à Django
    ↓
Django interroge PostgreSQL
    ↓
Django renvoie du JSON
    ↓
React affiche les résultats
```

Explication dockerfile frontend :
| Nom | Description |
|---|---|
| `WORKDIR /app` | Définit /app comme dossier de travail dans le conteneur |
| `COPY package.json package-lock.json ./` | Installe les versions enregistrées dans package-lock.json |
| `RUN npm ci` | installation propre des dépendances du projet |
| `COPY . .` | Copie le code React dans l’image |
| `--host 0.0.0.0` | Permet aux autres conteneurs d’accéder au serveur Vite |
| `--strictPort` | Vite doit obligatoirement utiliser le port demandé |

====================================================================================================

### Conteneur Nginx - server web :
NGINX (unique porte d’entrée) :
- permet de mettre en place un serveur web.
- reçoit les requêtes HTTP/HTTPS (navigateur → serveur)
- renvoie des fichiers statiques (HTML/CSS/JS/images)
- gère SSL/TLS, redirections, cache, reverse proxy, etc.
- port 80 en dev, port 443 en production

Lors de la mise en production, le fichier conf sera a modifier pour mettre le port 443 et les certificats
Le dockerfile sera a modifie avec le port 443

Explication nginx.conf :
| Nom | Description |
|---|---|
| `events` | connexions simultanées |
| `client_max_body_size` | Taille max des fichiers uploadés (ex: media Django) |
| `map` | Gestion des WebSockets Vite |
| `upstream backend` | Serveur backend vers lequel Nginx peut transmettre des requêtes |
| `upstream frontend` | Serveur frontend vers lequel Nginx peut transmettre des requêtes |
| `server` | Server HTTP (en prod, HTTPS et certificat TLS) |
| `location /api/` | Intercepte les URLs qui commencent par /api/ : http://localhost/api/users/, Transmets les requetes au backend Django |
| `location /admin/` | Intercepte les URLs qui commencent par /admin/ : http://localhost/admin/, Permet d’accéder à l’administration Django |
| `location /static/` | Route pour les fichiers statiques Django : /static/admin/css/base.css |
| `location /media/` | Route pour les fichiers media Django (uploads utilisateurs): /media/avatars/photo.jpg |
| `location /ws/` | location /ws/ : WebSockets Django applicatifs |
| `location` | Route principale, envoyer au server Vite, Sert à récupérer les fichiers visuels et techniques de Django (hors python), WebSocket Vite pour le rechargement en développement |

====================================================================================================

### Makefile :
- Un makefile pour rassembler les commandes de docker et django

| Commande compose | Description |
|---|---|
| `make up` | Construit les images si nécessaire et démarre les conteneurs au premier plan |
| `make down` | Arrête et supprime les conteneurs et le réseau du projet. Les volumes et les données PostgreSQL sont conservés |
| `make start` | Démarre les conteneurs en arrière-plan |
| `make stop` | Arrête les conteneurs sans les supprimer |
| `make restart` | Redémarre tous les conteneurs du projet |
| `make build` | Construit ou reconstruit les images Docker |
| `make ps` | Affiche l’état des conteneurs du projet |
| `make images` | Affiche les images du projet |
| `make volumes` | Affiche les volumes du projet |
| `make logs` | Affiche et suit les logs de tous les services |
| `make clean` | Supprime les conteneurs et les services. Les volumes et les données PostgreSQL sont conservés |
| `make fclean` |Supprime les conteneurs, les services et les volumes. Attention : les données PostgreSQL sont définitivement supprimées |
| `make re` | Supprime complètement le projet puis le reconstruit et le redémarre |
| `make front-install` | Réinstalle les dépendances npm du frontend dans le conteneur puis le redémarre. À lancer après un `git pull` qui modifie `package.json` (ex : ajout de react-router). Nécessite que le conteneur frontend tourne (`make start`) |

-------

| Commande db | Description |
|---|---|
| `make psql` | Connexion locale, sans mot de passe |
| `make test-db` | Vérifie que backend peut bien atteindre la base |

-------

| Commande django | Description |
|---|---|
| `make makemigrations` | Crée les fichiers de migration après une modification des modèles Django |
| `make migrate` | Applique les migrations Django dans la base de données |
| `make startapp` | Permet de créer une app django -> "make startapp name=nom_app" |
| `make createsuperuser` | Creer le super-utilisateur |
| `make seed` | Génère les seed pour remplir la DB -> "make seed ARGS=--{table} {quantitée}" |
| `make shell` | Ouvre le shell Python avec l’environnement Django chargé |
| `make check` | Permet de controler avant une migration si aucune erreur dans les settings |
| `make format-back` | Corrige le format au niveau du code backend dans les fichiers, utilise ruff |
| `make format-check-back` | Check (ne corrige pas) le format au niveau du code backend dans les fichiers, utilise ruff |

-------

| Commande Frontend | Description |
|---|---|
| `make format` | Corrige le format au niveau du code frontend dans les fichiers, utilise prettierrc |
| `make format-check` | Check (ne corrige pas) le format au niveau du code frontend dans les fichiers, utilise prettierrc |
| `make lint` | Check les dossiers/fichiers/variable inutilisé |

====================================================================================================

### Rappel :
- git clone le projet
- cp .env.example .env
- make up et controler si les containers sont up
- sudo chown -R "$USER":"$USER" backend - pour les permission manage.py
- make migrate
- make createsuperuser
- make migrate
- ouvrir et tester la page

http://localhost/           -> React
http://localhost:8080/

http://localhost/admin/     -> Django Admin
http://localhost:8080/admin/

http://localhost/api/       -> API Django
http://localhost:8080/api/
