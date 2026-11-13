Ce projet a été créé dans le cadre du cursus 42 par <dle-fur[Technical Lead - Architect]>

## Architecture :

```
FT_TRANSCENDENCE/                    # Racine générale du projet
│
├── .github/                         # Intégration continue GitHub Actions
│   ├── docker-compose.ci.yml        # Surcharge compose pour la CI (cache des images Docker)
│   └── workflows/                   # smoke.yml, backend-ci.yml, frontend-ci.yml, automatisations du Project
│
├── docs/                            # Documentation du projet : architecture, API, installation, choix techniques
│
├── scripts/
│   └── smoke.sh                     # Test de bout en bout de la stack lancée, en HTTPS via nginx (make smoke)
│
├── srcs/
│   │
│   ├── backend/                     # Backend Python : API, logique métier et accès à PostgreSQL
│   │   ├── config/                  # Configuration principale du projet Django
│   │   │   ├── __init__.py          # Indique à Python que config est un paquet importable
│   │   │   ├── asgi.py              # Point d’entrée ASGI : HTTP + WebSockets (utilisé par Uvicorn)
│   │   │   ├── settings.py          # Paramètres Django : DB, applications, sécurité, langue, etc.
│   │   │   ├── urls.py              # Routes principales du backend : /admin/, /api/, etc.
│   │   │   ├── websocket_urls.py    # Routes WebSocket : /ws/...
│   │   │   └── wsgi.py              # Point d’entrée WSGI (non utilisé en production)
│   │   ├── common/ traveler/ travel/ idea/ chat/ spending/   # Applications Django
│   │   ├── .dockerignore            # Fichiers du backend exclus du contexte de build Docker
│   │   ├── Dockerfile               # Construction de l’image Django (non-root)
│   │   ├── entrypoint.sh            # Démarrage : migrations, collectstatic, reset_presence, Uvicorn
│   │   ├── manage.py                # Utilitaire en ligne de commande de Django
│   │   └── requirements.txt         # Liste des dépendances Python du backend
│   │
│   ├── frontend/                    # Frontend React + TypeScript chargé de l’interface utilisateur
│   │   ├── public/                  # Fichiers publics copiés tels quels (favicons, icônes PWA)
│   │   ├── src/                     # Code source : app/, features/, shared/, main.tsx, index.css
│   │   ├── .dockerignore            # Exclut node_modules, dist, .env du build Docker
│   │   ├── Dockerfile               # npm ci → npm run build → dist/ servi par serve
│   │   ├── eslint.config.js         # Configuration ESLint
│   │   ├── .prettierrc              # Configuration Prettier
│   │   ├── index.html               # Page HTML de base dans laquelle React est chargé
│   │   ├── package-lock.json        # Versions exactes des dépendances npm (fait foi pour le build)
│   │   ├── package.json             # Dépendances, scripts et informations du projet frontend
│   │   ├── tsconfig*.json           # Configuration TypeScript
│   │   └── vite.config.ts           # Configuration Vite (React, Tailwind, PWA)
│   │
│   └── nginx/                       # Reverse proxy HTTPS, unique porte d’entrée
│       ├── .dockerignore            # Fichiers Nginx exclus de son contexte de build
│       ├── Dockerfile               # Construction de l’image Nginx
│       └── nginx.conf               # TLS + routage des requêtes vers React ou Django
│
├── certs/                           # Certificat Let's Encrypt (fullchain.pem, privkey.pem) - NON versionné
├── kit.tgz                          # Kit de déploiement : certs/ + secrets.env - NON versionné
├── .env                             # Variables d’environnement réelles et secrètes - NON versionné, généré par make
├── .env.example                     # Modèle public des variables nécessaires, sans valeurs secrètes
├── .gitignore                       # Exclut .env, certs/, kit.tgz, secrets.env, node_modules, dist…
├── docker-compose.yml               # Décrit et relie PostgreSQL, Redis, Django, React et Nginx
└── Makefile                         # Prépare l’environnement, construit, démarre et gère les conteneurs
```

```
Navigateur
    │  https://peripl.app:8443   (HTTPS, TLS 1.2 / 1.3)
    ▼
Nginx  (port 443 dans le conteneur, publié sur 8443 de la machine)
    ├── /api/     → backend:8000  → Uvicorn → Django HTTP
    ├── /admin/   → backend:8000  → Uvicorn → Django HTTP
    ├── /ws/      → backend:8000  → Uvicorn → Django Channels (wss://)
    ├── /static/  → servi directement par Nginx (volume static_data)
    ├── /media/   → servi directement par Nginx (volume media_data)
    └── /         → frontend:3000 → serve → dist/ (build React)

Django Channels
    │
    ▼
Redis

Django ORM
    │
    ▼
PostgreSQL
```

- Seul Nginx est exposé sur la machine. Backend (8000), frontend (3000), PostgreSQL (5432) et Redis (6379) ne sont joignables qu’à l’intérieur du réseau Docker.
- Le trafic navigateur → Nginx est chiffré (HTTPS). Le trafic interne Nginx → services est en HTTP, ce que le sujet autorise.

Les volumes :
```
postgres_data
└── données PostgreSQL importantes et persistantes

static_data
└── CSS, JavaScript et images statiques de Django (collectstatic), servis par Nginx sur /static/

media_data
└── fichiers uploadés par les utilisateurs (photos de profil), servis par Nginx sur /media/
```

- Il n’y a plus de volume de code : en production, le code est copié dans les images au build (`COPY . .`). Une modification du code demande donc un rebuild (`make down` puis `make`).

====================================================================================================

## Descriptions des outils utilisés :

### Conteneur Postgresql :
- PostgreSQL est un système de gestion de base de données qui permet de stocker, organiser et retrouver des données
- C'est le premier service a mettre en place dans le compose
- La base de données reçoit  des ordres comme : SELECT, INSERT, UPDATE, DELETE
- Le mot de passe (`POSTGRES_PASSWORD`) est généré aléatoirement par `make` à la création du `.env`
- Postgres n'enregistre le mot de passe qu'à la création du volume : si le `.env` est supprimé et régénéré, il faut aussi supprimer la base (`make fclean`), sinon le backend échoue avec `password authentication failed`
- Les migrations sont appliquées automatiquement au démarrage du backend (`entrypoint.sh`)
- Lors de chaque changement dans une table : `make makemigrations` en mode dev, puis rebuild (`make`) pour qu'elles s'appliquent
- Creer un superuser au départ (`make createsuperuser`) pour accéder a https://peripl.app:8443/admin/
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
| `ruff==0.16.3` | Linter et formateur du code Python (`make lint-back`, `make format-back`) |
| `djangorestframework-camel-case==1.4.2` | Convertit automatiquement les champs JSON entre `snake_case` (Python) et `camelCase` (frontend) |
| `ipython==9.17.1` | Shell Python interactif amélioré, utilisé par `make shell` |
| `Pillow==12.0.0` | Traitement et validation des images uploadées (photos de profil) |
| `redis==8.1.0` | Client Python pour Redis, utilisé par le cache Django (compteurs du rate limiting) |
| `drf-spectacular==0.30.0` | Génère le schéma OpenAPI et la documentation de l'API publique (`/api/docs/`) |
| `drf-standardized-errors==0.16.0` | Renvoie toutes les erreurs de l'API dans un format JSON uniforme |
| `requests==2.32.5` | Effectue des requêtes HTTP vers des services externes (ex : Google OAuth) |
| `Authlib==1.8.0` | Client OAuth 2.0 / OpenID Connect pour la connexion avec Google (vérifie le jeton d'identité signé par Google) |

Deux concepts principaux avec Django :
- un Projet
- des Applications

#### Projet :
Le projet Django est créer une seule fois et va contenir (renommé config) :
- la configuration globale
- les URLs
- les paramètres
- le démarrage

En dev (code monté en volume), corriger les droits après config si besoin ->  sudo chown -R "$USER":"$USER" srcs/backend

Le projet va créer plusieurs fichier .py

Dans config/settings.py :
- Va permettre de configurer l app, la base de données, la langue et d'enregistrer des application
- Toutes les valeurs sensibles viennent du `.env`

Réglages de production dans settings.py :
| Réglage | Rôle |
|---|---|
| `SECRET_KEY = os.environ["DJANGO_SECRET_KEY"]` | Obligatoire, sans valeur par défaut : le backend refuse de démarrer si elle manque |
| `DEBUG` | `False` par défaut (pas de page d'erreur détaillée exposée) |
| `ALLOWED_HOSTS` | `peripl.app,localhost` (`localhost` est nécessaire au healthcheck) |
| `CSRF_TRUSTED_ORIGINS` | `https://peripl.app:8443,https://localhost:8443` (schéma et port inclus) |
| `SESSION_COOKIE_SECURE` / `CSRF_COOKIE_SECURE` | Les cookies ne circulent qu'en HTTPS |
| `SESSION_COOKIE_HTTPONLY` | Le cookie de session n'est pas lisible en JavaScript |
| `SECURE_PROXY_SSL_HEADER` | Django sait que la requête d'origine était en HTTPS grâce à l'en-tête `X-Forwarded-Proto` envoyé par Nginx |

Dans config/urls :
- Va permettre de definir les routes. Une route est un chemin pour acceder a une ressource, exemple https://peripl.app:8443/admin/, admin est une route
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

#### Modèles métier — app `travel` :
L'app `travel` porte les modèles du roadtrip. Tous héritent de `TimeStampedModel` (`created_at` / `updated_at`) sauf mention contraire.

| Modèle | Rôle | Champs principaux |
|---|---|---|
| `Travel` | Un roadtrip | `title`, `start_date`, `end_date` (contrainte : `end_date >= start_date`), `invite_token` (unique, généré), `status` (`current` / `finished`) |
| `Participation` | Lien traveler ↔ travel | `traveler` (FK), `travel` (FK), `status` (`invited` / `accepted` / `refused` / `left`), `left_at`, `last_read_at` (dernier passage dans le chat) ; unicité `(traveler, travel)` |
| `Step` | Une étape ordonnée d'un travel | `travel` (FK), `position`, `nights` (0 = simple halte), `localisation`, `latitude` / `longitude` (optionnels, remplis par la recherche), `deleted_at` (corbeille) |

- `Step` gère une **suppression douce** : `deleted_at` marque l'étape comme dans la corbeille. Le manager expose `Step.objects.alive()` et `Step.objects.trashed()`, et l'instance a `soft_delete()` / `restore()` + la propriété `is_trashed`.
- Unicité `(travel, position)` restreinte aux étapes vivantes (`deleted_at IS NULL`), pour qu'une étape supprimée ne bloque pas la réutilisation de sa position.
- `Participation.mark_read()` met `last_read_at` à maintenant. `is_travel_member(travel_id, traveler_id)` dit si un traveler est membre d'un voyage (`accepted` ou `left` : un ex-participant garde ce qu'il a produit).

#### Modèles métier — app `idea` :
L'app `idea` porte les propositions rattachées à un voyage (où dormir, manger, quoi voir). `Idea` hérite de `TimeStampedModel`, `Reaction` non (un <3 ne se modifie pas).

| Modèle | Rôle | Champs principaux |
|---|---|---|
| `Idea` | Une proposition faite pour un voyage | `travel` (FK, CASCADE), `traveler` (FK, celui qui propose), `step` (FK optionnel, `SET NULL` → pool si vide), `chosen_by` (FK optionnel, `SET NULL`), `title`, `type` (`restaurant` / `lodging` / `activity` / `sight`), `status` (`suggested` / `placed` / `chosen`), `localisation`, `note` / `url` (optionnels), `latitude` / `longitude` (optionnels), `price_per_night` / `arrival_date` / `departure_date` (si hébergement, contrainte `departure_date >= arrival_date`), `chosen_at` |
| `Reaction` | Un <3 d'un traveler sur une idée, purement indicatif | `traveler` (FK, CASCADE), `idea` (FK, CASCADE) ; unicité `(traveler, idea)` ; `created_at` seul, pas d'`updated_at` |

- Pas de suppression douce pour `Idea` : retirée du pool, elle est supprimée définitivement (`delete()`) ; retirée d'une étape, elle retourne simplement au pool. Manager `Idea.objects.pool()` pour les idées sans étape, propriété `is_in_pool`.
- Une étape supprimée renvoie ses idées au pool (`step` → `NULL`) plutôt que de les emporter. Les réactions, elles, disparaissent avec leur idée (`CASCADE`).

#### Modèles métier — app `chat` :
L'app `chat` porte le fil de discussion d'un voyage. `Message` hérite de `TimeStampedModel` et de `ValidatedModel`.

| Modèle | Rôle | Champs principaux |
|---|---|---|
| `Message` | Un message du chat d'un voyage | `travel` (FK, CASCADE), `traveler` (FK optionnel, `SET NULL` : l'auteur), `step` / `idea` (FK optionnels, `SET NULL`), `is_system`, `body` (2000 caractères max) |

- Un message relève du voyage, d'une étape **ou** d'une idée, jamais des deux à la fois. Si l'étape ou l'idée disparaît, il reste rattaché au voyage.
- Un message système n'a pas d'auteur. Un message sans auteur n'est pas forcément système : si le compte de l'auteur est supprimé, le message reste dans le fil (`SET NULL`).
- À la création, l'auteur doit être membre du voyage (`is_travel_member`). Cette règle n'est vérifiée qu'à la création, pour qu'un message reste modifiable et supprimable après le départ de son auteur.
- **Pas de corbeille** : un message ne se supprime que définitivement (`delete()`, admin), et pas depuis le chat par les utilisateurs.
- Non-lus : `Message.objects.unread_for(participation)` renvoie les messages des autres, créés après `Participation.last_read_at` (tous si le chat n'a jamais été ouvert). Aucun compteur n'est stocké.

#### Seeds (données de test) :
- Objectif : remplir rapidement la base avec des données de test réalistes, sans tout créer à la main via l'admin
- Centralisé dans `common` car l'ordre de création entre apps (dépendances entre modèles, ex: un traveler doit exister avant une friendship) doit être géré à un seul endroit
- Utilise `Faker` pour générer les données aléatoires

```
common/
├── management/commands/
│   ├── seed.py                    # commande "python manage.py seed", orchestre l'ordre de création
│   └── unseed.py                  # commande "python manage.py unseed", vide les données de seed
└── seeders/
    ├── traveler.py                # génération pour l'app traveler : seed_travelers(), seed_friendships()
    ├── travel.py                  # génération pour l'app travel : seed_travels(), seed_participations(), seed_steps()
    ├── idea.py                    # génération pour l'app idea : seed_ideas(), seed_reactions()
    ├── chat.py                    # génération pour l'app chat : seed_messages()
    └── clear.py                   # clear_seed_data() : suppression partagée par unseed et seed --fresh
```

- `seed.py` reste volontairement fin : il appelle uniquement les fonctions `seed_*` de `common/seeders/` dans l'ordre des dépendances
- Chaque app avec des données à seed a son propre fichier `common/seeders/nom_app.py`, qui expose des fonctions `seed_xxx(fake, ...)` retournant les objets créés
- Pour seed une nouvelle app : créer `common/seeders/nom_app.py`, puis appeler ses fonctions depuis `seed.py` dans le bon ordre de dépendance

#### Nettoyage des seeds :
- Les lignes seedées ne sont pas taguées en base : `unseed` vide donc **tout le domaine** (messages, travels, steps, ideas, reactions, participations, friendships, travelers). Les superusers sont conservés par défaut pour garder l'accès admin.
- `clear_seed_data()` (dans `common/seeders/clear.py`) est la fonction partagée ; elle renvoie un dict `{label: nombre_supprimé}`.
- `unseed` demande une confirmation ; `--yes` la saute, `--all-travelers` supprime aussi les superusers.
- `seed --fresh` appelle `clear_seed_data()` avant de re-générer : reset + reseed en une commande.

| Commande | Description |
|---|---|
| `docker compose exec backend python manage.py seed --travelers 20 --friendships 10 --travels 10 --participations 30` | Crée 20 travelers, 10 friendships, 10 travels et 30 participations aléatoires (+ étapes, idées et réactions par défaut) |
| Options idées : `--steps-per-travel 4 --ideas-per-travel 6 --reactions 40` | Nombre d'étapes et d'idées par voyage, et total de réactions |
| Option chat : `--messages-per-travel 8` | Nombre de messages par voyage |
| `make seed ARGS="--travelers 50 --friendships 30 --travels 20 --participations 60"` | Équivalent via le Makefile |
| `make seed ARGS="--fresh --travelers 50"` | Vide les seeds existants (superusers gardés) puis re-seed |
| `make unseed ARGS="--yes"` | Supprime toutes les données de seed (superusers gardés) |
| `make unseed ARGS="--yes --all-travelers"` | Idem en supprimant aussi les superusers |

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
- Uvicorn comme serveur ASGI, en développement comme en production
- Redis : comme couche de communication entre les connexions WebSocket (et entre les workers)

En production, Uvicorn est lancé par `entrypoint.sh` avec :
| Option | Rôle |
|---|---|
| `--host 0.0.0.0 --port 8000` | Écoute dans le conteneur, joignable par Nginx uniquement (port non publié) |
| `--workers 4` | 4 processus en parallèle pour le multi-utilisateur. Redis synchronise les WebSockets entre eux |
| `--proxy-headers` | Lit les en-têtes `X-Forwarded-Proto` / `X-Forwarded-For` envoyés par Nginx |
| `--forwarded-allow-ips="*"` | Accepte ces en-têtes depuis le conteneur Nginx. Sans danger car seul Nginx peut joindre le port 8000 |

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
| `ARG UID/GID` | Utilisateur non-root fixe (1000). Ne vient pas du `.env` : les UID des postes de l'école sont trop grands pour Docker rootless |
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

Explication entrypoint.sh backend :
| Étape | Description |
|---|---|
| `set -e` | Arrêt à la première erreur (le serveur ne démarre pas sur une base incohérente) |
| `manage.py migrate --noinput` | Crée / met à jour les tables automatiquement à chaque démarrage |
| `manage.py collectstatic --noinput` | Copie les fichiers statiques Django dans le volume `static_data` |
| `manage.py reset_presence` | Remet tous les utilisateurs hors ligne (cas d'un crash serveur) |
| `exec uvicorn ...` | Lance le serveur ASGI comme processus principal du conteneur |

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

En production, Vite ne sert plus le site : il construit les fichiers finaux, puis `serve` les distribue.
```
package-lock.json → npm ci → node_modules (dans l'image) → npm run build → dist/ → serve
```
- `npm run build` lance `tsc -b` (vérification TypeScript, le build échoue en cas d'erreur) puis `vite build` (compilation dans `dist/`)
- `dist/` contient : `index.html`, `assets/` (JS et CSS minifiés, polices), les fichiers de `public/`, `manifest.webmanifest` et le service worker de la PWA
- `node_modules` n'est utilisé que pour construire le site. Le `node_modules` local (sur le disque) ne sert qu'à l'éditeur et est exclu du build par `.dockerignore`

Explication dockerfile frontend :
| Nom | Description |
|---|---|
| `FROM node:22-alpine` | Node 22, quelle que soit la version installée sur la machine |
| `WORKDIR /app` | Définit /app comme dossier de travail dans le conteneur |
| `RUN npm install -g serve` | Installe `serve`, serveur de fichiers statiques |
| `COPY package.json package-lock.json ./` | Copie la liste des dépendances (mise en cache si elle ne change pas) |
| `RUN npm ci` | Installation propre des versions exactes de package-lock.json |
| `COPY . .` | Copie le code React dans l’image (sans node_modules, dist, .env) |
| `ARG VITE_MAPBOX_TOKEN` | Reçoit le token Mapbox depuis le `.env` racine (via docker-compose), il est intégré au JS au moment du build |
| `RUN npm run build` | Construit le site dans `dist/` |
| `EXPOSE 3000` | Port de `serve`, joignable par Nginx uniquement |
| `CMD ["serve", "-s", "dist", "-l", "3000"]` | Sert `dist/`. `-s` renvoie `index.html` pour toute URL inconnue (routes React) |

====================================================================================================

### Conteneur Nginx - server web :
NGINX (unique porte d’entrée) :
- permet de mettre en place un serveur web.
- reçoit les requêtes HTTP/HTTPS (navigateur → serveur)
- renvoie des fichiers statiques (HTML/CSS/JS/images)
- gère SSL/TLS, redirections, cache, reverse proxy, etc.
- écoute en HTTPS sur le port 443 dans le conteneur, publié sur le port 8443 de la machine (`"8443:443"`)
- le port 80 affiché par `docker ps` (`80/tcp`, sans flèche) est hérité de l'image officielle : il n'est ni publié ni écouté

Explication nginx.conf :
| Nom | Description |
|---|---|
| `events` | connexions simultanées |
| `client_max_body_size` | Taille max des fichiers uploadés (ex: media Django) |
| `map` | Transmet correctement la demande de passage en WebSocket (`Upgrade` / `Connection`) à Django Channels |
| `upstream backend` | `backend:8000` : conteneur Django/Uvicorn (nom du service compose résolu par le DNS Docker) |
| `upstream frontend` | `frontend:3000` : conteneur `serve` qui distribue `dist/` |
| `listen 443 ssl` / `http2 on` | HTTPS uniquement, HTTP/2 activé |
| `server_name peripl.app` | Domaine servi, identique au certificat |
| `ssl_certificate` / `ssl_certificate_key` | Certificat Let's Encrypt monté depuis `./certs` (lecture seule) |
| `ssl_protocols TLSv1.2 TLSv1.3` | Versions de TLS autorisées (les anciennes sont refusées) |
| `proxy_set_header Host $http_host` | Transmet le domaine **avec le port** (`peripl.app:8443`), pour que Django génère des URL correctes |
| `proxy_set_header X-Real-IP / X-Forwarded-For` | Transmet la vraie IP du client (logs, rate limiting) |
| `proxy_set_header X-Forwarded-Proto` | Indique à Django que la requête d'origine était en HTTPS |
| `location /api/` | Transmet au backend Django : https://peripl.app:8443/api/... |
| `location /admin/` | Transmet au backend : administration Django |
| `location /static/` | Servi directement par Nginx depuis le volume `static_data` : /static/admin/css/base.css |
| `location /media/` | Servi directement par Nginx depuis le volume `media_data` (uploads utilisateurs) |
| `location /ws/` | WebSockets Django (`wss://`), HTTP/1.1 obligatoire et délai porté à 1 h |
| `location /` | Tout le reste part vers le frontend (`serve`) |

====================================================================================================

### Makefile :
- Un makefile pour rassembler les commandes de docker et django

| Commande compose | Description |
|---|---|
| `make` | Identique à `make up` |
| `make env` | Prépare l'environnement si besoin : extrait `certs/` depuis `kit.tgz`, crée le `.env` depuis `.env.example` avec une clé Django et un mot de passe Postgres générés, et les identifiants Google/Mapbox du kit. Ne touche à rien si `.env` et `certs/` existent déjà |
| `make up` | Lance `make env`, puis construit les images et démarre les conteneurs au premier plan |
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
| `make smoke` | Test de bout en bout de la stack lancée (front, API, statiques, migrations, inscription, connexion, WebSocket, Redis) |

Attention : en production, le code n'est plus monté en volume. Les commandes qui modifient des fichiers (`make format-back`, `make lint-fix-back`, `make format-front`, `make makemigrations`, `make startapp`, `make front-install`) agissent sur la copie du code dans le conteneur, pas sur les fichiers du disque. Les commandes de vérification portent sur le code du dernier build.

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
| `make seed` | Génère les seed pour remplir la DB -> "make seed ARGS=--{table} {quantitée}" (ajouter `--fresh` pour vider avant) |
| `make unseed` | Vide les données de seed -> "make unseed ARGS=--yes" (superusers gardés, `--all-travelers` pour tout supprimer) |
| `make shell` | Ouvre le shell Python avec l’environnement Django chargé |
| `make check` | Permet de controler avant une migration si aucune erreur dans les settings |
| `make ping` | Controle la réponse du container redis -> reponse PONG |
| `make format-back` | Corrige le format au niveau du code backend dans les fichiers, utilise ruff |
| `make format-check-back` | Check (ne corrige pas) le format au niveau du code backend dans les fichiers, utilise ruff |

-------

| Commande Frontend | Description |
|---|---|
| `make format-front` | Corrige le format au niveau du code frontend dans les fichiers, utilise prettierrc |
| `make format-check-front` | Check (ne corrige pas) le format au niveau du code frontend dans les fichiers, utilise prettierrc |
| `make lint` | Check les dossiers/fichiers/variable inutilisé |

====================================================================================================

### Mise en production (HTTPS) :

#### Domaine et certificat :
- Le domaine `peripl.app` (Infomaniak) a un enregistrement DNS **A → `127.0.0.1`** : sur chaque machine, `peripl.app` désigne la machine elle-même. Rien n'est hébergé : le projet tourne en local sur la machine de correction
- Le certificat est un vrai certificat **Let's Encrypt**, obtenu par challenge DNS (enregistrement TXT `_acme-challenge`), ce qui fonctionne même avec un domaine pointant vers `127.0.0.1`
- Les domaines `.app` sont en HSTS préchargé : un certificat auto-signé y serait bloqué par les navigateurs, sans possibilité de continuer. Un certificat reconnu est aussi nécessaire au service worker de la PWA (sinon erreur en console)
- Le certificat est valable **90 jours** : le régénérer (certbot) avant la soutenance si besoin

#### Pourquoi le port 8443 :
- Sur les postes de l'école, Docker tourne en mode **rootless** (sans droits root) : les ports inférieurs à 1024, dont 443, ne peuvent pas être ouverts
- Le HTTPS est donc publié sur **8443**, port HTTPS alternatif conventionnel. Le sujet exige le HTTPS, pas le port 443
- Le port doit être identique dans : `docker-compose.yml`, `.env.example` (`DJANGO_CSRF_TRUSTED_ORIGINS`, `GOOGLE_REDIRECT_URI`) et l'URI de redirection déclarée dans Google Cloud Console

#### Secrets et kit de déploiement :
- Aucun secret n'est dans Git : `.env`, `certs/`, `kit.tgz` et `secrets.env` sont dans le `.gitignore`
- `kit.tgz` contient `certs/` et `secrets.env` (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `VITE_MAPBOX_TOKEN`), c'est-à-dire tout ce qui ne peut pas être généré
- Création du kit (une fois, après génération du certificat) :
```
sudo tar czf kit.tgz certs secrets.env
sudo chown $USER kit.tgz
```
- À conserver hors du dépôt (clé USB, espace privé) et à recréer si le certificat ou un secret change

#### Google OAuth :
- URI de redirection autorisée dans Google Cloud Console : `https://peripl.app:8443/api/auth/google/callback/`
- Application publiée **en production** (sinon seuls les comptes testeurs peuvent se connecter)

#### DNS du réseau :
- Certains réseaux (dont celui de l'école) bloquent les réponses DNS en `127.0.0.1`. Vérification : `dig +short peripl.app` doit répondre `127.0.0.1`
- Si rien ne s'affiche : activer le **DNS sécurisé** du navigateur (Chrome : Paramètres → Confidentialité et sécurité → Sécurité → Utiliser un DNS sécurisé → Cloudflare), ou ajouter `127.0.0.1 peripl.app` dans `/etc/hosts` si `sudo` est disponible

#### CI (GitHub Actions) :
- Le workflow `smoke.yml` génère un `.env` de test (clé Django et mot de passe Postgres aléatoires) et un certificat auto-signé jetable, lance la stack puis `make smoke`
- `scripts/smoke.sh` teste en `https://localhost:8443` avec `curl -k` et le WebSocket en `wss://`

====================================================================================================

### Rappel - lancer le projet :
- git clone le projet
- déposer `kit.tgz` à la racine (à côté de `docker-compose.yml`)
- `make` : extrait les certificats, génère le `.env`, construit et démarre tout (migrations automatiques)
- `make ps` : tous les services doivent être `healthy` (nginx `Up`)
- `make createsuperuser` (dans un second terminal) pour l'administration
- `make seed` si besoin de données de test
- ouvrir et tester la page

https://peripl.app:8443/         -> React
https://peripl.app:8443/admin/   -> Django Admin
https://peripl.app:8443/api/     -> API Django
https://peripl.app:8443/api/docs/ -> Documentation de l'API publique

Rebuild après une modification du code (données conservées) :
```
make down
make
```

Problèmes fréquents :
| Symptôme | Cause / solution |
|---|---|
| `kit.tgz manquant` | Déposer `kit.tgz` à la racine du projet |
| `tar: ... Permission non accordée` | Un dossier `certs/` vide créé par Docker existe : `sudo rm -rf certs` puis `make` |
| nginx `Restarting` / `cannot load certificate` | `certs/` absent ou incomplet : même solution |
| backend unhealthy, `password authentication failed` | Le `.env` a été régénéré sur une base existante : `make fclean` puis `make` |
| `cannot expose privileged port 443` | Docker rootless : utiliser le port 8443 (config actuelle) |
| `peripl.app` ne répond pas | Vérifier le port `:8443` dans l'URL, puis le DNS (`dig +short peripl.app`) |
