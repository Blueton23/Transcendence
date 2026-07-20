Ce projet a été créé dans le cadre du cursus 42 par dle-fur - Technical Lead / Architect

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
    │
    ├── /              → frontend React/Vite
    ├── /api/          → backend Django
    ├── /admin/        → administration Django
    └── /static/       → fichiers statiques Django

Django
    │
    ▼
PostgreSQL
```

====================================================================================================

## Descriptions des outils utilisés :

### Postgresql (conteneur 1) :
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
| `docker compose exec db psql -U <POSTGRES_DB> -d <POSTGRES_DB>` | Se connecter a postgres + entrée dans la base de données |
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

### Django - backend (conteneur 2) :
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
Chaque aura ses propres fichiers .py, ils seront a connecter

====================================================================================================

### Frontend - react + vite (container 3) :

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

====================================================================================================

### Nginx - server web (container 4) :
NGINX (unique porte d’entrée) :
- permet de mettre en place un serveur web.
- reçoit les requêtes HTTP/HTTPS (navigateur → serveur)
- renvoie des fichiers statiques (HTML/CSS/JS/images)
- gère SSL/TLS, redirections, cache, reverse proxy, etc.
- port 80 en dev, port 443 en production

Lors de la mise en production, le fichier conf sera a modifier pour mettre le port 443 et les certificats
Le dockerfile sera a modifie avec le port 443

====================================================================================================

### Makfile :
- Un makefile pour rassembler les commandes de docker et django

| Commande | Description |
|---|---|
| `make up` | Construit les images si nécessaire et démarre les conteneurs au premier plan |
| `make start` | Démarre les conteneurs en arrière-plan |
| `make down` | Arrête et supprime les conteneurs et le réseau du projet. Les volumes et les données PostgreSQL sont conservés |
| `make stop` | Arrête les conteneurs sans les supprimer |
| `make restart` | Redémarre tous les conteneurs du projet |
| `make build` | Construit ou reconstruit les images Docker |
| `make logs` | Affiche et suit les logs de tous les services |
| `make ps` | Affiche l’état des conteneurs du projet |
| `make createsuperuser` | Creer le super-utilisateur |
| `make migrate` | Applique les migrations Django dans la base de données |
| `make makemigrations` | Crée les fichiers de migration après une modification des modèles Django |
| `make shell` | Ouvre le shell Python avec l’environnement Django chargé |
| `make clean` | Supprime les conteneurs et les services. Les volumes et les données PostgreSQL sont conservés |
| `make fclean` |Supprime les conteneurs, les services et les volumes. Attention : les données PostgreSQL sont définitivement supprimées |
| `make re` | Supprime complètement le projet puis le reconstruit et le redémarre |

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
