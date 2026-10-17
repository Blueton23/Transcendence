# Transcendence
Our repo for the 42 school project Transcendence

## stack
Containerization : Docker
Database : Postgres
Backend framework : Django
Frontend framework : React / vite / talwind
nginx : server web



===============================================================================


Ce projet a été créé dans le cadre du cursus 42 par <dle-fur[Technical Lead - Architect], [Developer]>

## Table des matières

- [Stack](#stack)
- [1. Architecture générale](#1-architecture-générale-)
  - [1.1 Schéma des communications et des ports](#11-schéma-des-communications-et-des-ports-)
  - [1.2 Chargement de l’interface](#12-chargement-de-linterface-)
  - [1.3 Chargement des données](#13-chargement-des-données-)
  - [1.4 Commandes utiles](#14-commandes-utiles-)
- [2. Infrastructure Docker](#2-infrastructure-docker-)
  - [2.1 Réseau interne et port exposé](#21-réseau-interne-et-port-exposé-)
  - [2.2 Volumes persistants](#22-volumes-persistants-)
  - [2.3 Ordre de démarrage](#23-ordre-de-démarrage-)
- [3. Nginx — point d’entrée de l’application](#3-nginx---point-dentrée-de-lapplication-)
  - [3.1 Transmission des connexions WebSocket](#31-transmission-des-connexions-websocket-)
  - [3.2 Vérifications du routage](#32-vérifications-du-routage-)
- [4. Backend et stockage des données](#4-backend-et-stockage-des-données-)
  - [4.1 Django — rôle et organisation des applications](#41-django---rôle-et-organisation-des-applications-)
  - [4.2 PostgreSQL : modèles, relations et migrations](#42-postgresql--modèles-relations-et-migrations-)
  - [4.3 Django REST Framework — routes, vues et serializers](#43-django-rest-framework---routes-vues-et-serializers-)
  - [4.4 Authentification, permissions et protection CSRF](#44-authentification-permissions-et-protection-csrf-)
  - [4.5 Erreurs de l’API](#45-erreurs-de-lapi-)
  - [4.6 Vérifications du backend](#46-vérifications-du-backend-)
- [5. Frontend](#5-frontend-)
  - [5.1 Navigation et accès aux pages](#51-navigation-et-accès-aux-pages-)
  - [5.2 Communication avec l’API et gestion de la session](#52-communication-avec-lapi-et-gestion-de-la-session-)
  - [5.3 Gestion des erreurs et des actions](#53-gestion-des-erreurs-et-des-actions-)
- [6. Infrastructure temps réel](#6-infrastructure-temps-réel-)
  - [6.1 Uvicorn et ASGI](#61-uvicorn-et-asgi-)
  - [6.2 Django Channels et WebSockets](#62-django-channels-et-websockets-)
  - [6.3 Rôle de Redis](#63-rôle-de-redis-)
- [7. Fonctionnalité Idea et Reaction](#7-fonctionnalité-idea-et-reaction-)
  - [7.1 Objectif et parcours utilisateur](#71-objectif-et-parcours-utilisateur-)
  - [7.2 Règles métier et droits d’accès](#72-règles-métier-et-droits-daccès-)
  - [7.3 Tests des serializers]((#73-Tests-des-serializers-))
  - [7.4 Routes API et traitement côté backend](#74-routes-api-et-traitement-côté-backend-)
  - [7.5 Affichage et interactions côté frontend](#75-affichage-et-interactions-côté-frontend-)
  - [7.6 Exemple complet : du clic à l’enregistrement](#76-exemple-complet--du-clic-à-lenregistrement-)
  - [7.7 API des idées et des réactions](#77-api-des-idées-et-des-réactions-)
  - [Vue générale des fichiers](#vue-générale-)
    - [Vue Backend](#vue-backend-)
    - [Vue Frontend](#vue-frontend-)
  - [7.8 Scénarios de vérification et tests](#78-scénarios-de-vérification-et-tests-)

## 1. Architecture générale :
Le projet fonctionne dans un environnement de développement composé de cinq services orchestrés par Docker Compose.
Cette séparation permet à chaque service de remplir un rôle précis et fournit un environnement commun.

| Service | Technologies | Rôle dans le projet |
|---|---|---|
| `nginx` | Nginx | Point d’entrée de l’application : reçoit les requêtes et les dirige vers le service concerné. Sert aussi les fichiers statiques et les médias. |
| `frontend` | React, TypeScript, Vite, Tailwind CSS | Fournit l’interface utilisateur. En développement, Vite sert les fichiers du frontend et permet leur rechargement lors des modifications. |
| `backend` | Django, Django REST Framework, Uvicorn, Channels | Traite les requêtes, applique les règles métier, contrôle les accès et communique avec la base de données. Prend également en charge les WebSockets. |
| `db` | PostgreSQL | Conserve les données de l’application : utilisateurs, voyages, étapes, idées et réactions, notamment. |
| `redis` | Redis | Fournit la couche de communication configurée pour échanger des messages entre les consommateurs de Django Channels. |

### 1.1 Schéma des communications et des ports :
Nginx est le seul service dont un port est publié sur la machine hôte. Les autres services communiquent sur le réseau interne Docker, en utilisant leurs noms et leurs ports internes.

```
Navigateur
    │
    │ http://localhost:8080
    ▼
Nginx — port interne 80
    │
    ├── /api/… ─────────► Backend — port 8000
    │                       Uvicorn → Django REST Framework
    │
    ├── /admin/… ───────► Backend — port 8000
    │                       Uvicorn → Administration Django
    │
    ├── /ws/… ──────────► Backend — port 8000
    │                       Uvicorn → Django Channels
    │
    ├── /static/… ──────► Volume static_data
    │                       CSS, JavaScript et images de Django
    │
    ├── /media/… ───────► Volume media_data
    │                       Fichiers téléversés, dont les photos de profil
    │
    └── Autres chemins ─► Frontend — port 5173
                            Vite sert l’interface React


Connexions internes du backend :

    Django ── ORM + Psycopg ─────────► db:5432
                                        PostgreSQL

    Channels ── couche de messages ─► redis:6379
                                        Redis
```

la configuration ASGI dirige ensuite le trafic HTTP vers Django et les WebSockets vers Channels
Les fichiers statiques et les médias sont lus directement par Nginx dans les volumes partagés avec le backend

### 1.2 Chargement de l’interface :
Le navigateur demande une page à Nginx. Nginx transmet la requête à Vite, qui fournit les fichiers du frontend. Le code React s’exécute ensuite dans le navigateur.

### 1.3 Chargement des données :
```
Interface React exécutée dans le navigateur
    │
    │ Requête HTTP vers /api/…
    ▼
Nginx
    │
    │ Transmet la requête au backend
    ▼
Uvicorn → Django / DRF
    │
    │ Vérifie la session et les permissions
    │ Traite la demande
    ▼
ORM Django → Psycopg → PostgreSQL
    │
    │ Renvoie les données recherchées
    ▼
Django / DRF
    │
    │ Prépare la réponse JSON
    ▼
Nginx → Navigateur → Mise à jour de l’affichage React
```

### 1.4 Commandes utiles :
| Commande | Ce qu’elle vérifie | Résultat attendu |
|---|---|---|
| `make ps` | État des cinq services. | Services démarrés |
| `curl -I http://localhost:8080/` | Trajet Nginx -> Vite. | Réponse HTTP `200`. |
| `curl -fsS http://localhost:8080/api/` | Trajet Nginx -> Uvicorn -> Django. | `{"status":"ok"}` |
| `make test-db` | Connexion backend -> PostgreSQL. | Message confirmant la connexion à la base. |
| `make ping` | Disponibilité de Redis. | `PONG` |

## 2. Infrastructure docker :
| Service | Base utilisée | Préparation réalisée |
|---|---|---|
| `db` | PostgreSQL 17 Alpine | Configuration de la base à partir des variables d’environnement. |
| `redis` | Redis 7.4.9 Alpine | Utilisation de l’image sans Dockerfile supplémentaire. |
| `backend` | Python 3.13 Slim | Installation de `requirements.txt`, copie du code et création d’un utilisateur non-root. |
| `frontend` | Node.js 22 Alpine | Installation des dépendances avec `npm ci`, puis copie du code. |
| `nginx` | Nginx 1.30.3 Alpine | Copie de la configuration de routage du projet. |

### 2.1 Réseau interne et port exposé :
Compose crée un réseau commun aux services. Chaque service y est accessible par son nom
```
Machine hôte
    │
    │ Port 8080
    ▼
Réseau Docker Compose
    │
    ├── nginx:80
    ├── frontend:5173
    ├── backend:8000
    ├── db:5432
    └── redis:6379
```

### 2.2 Volumes persistants :
| Volume | Emplacement dans les conteneurs | Utilisation |
|---|---|---|
| `postgres_data` | `db:/var/lib/postgresql/data` | Conserve les données PostgreSQL lorsque le conteneur est recréé |
| `frontend_node_modules` | `frontend:/app/node_modules` | Conserve les dépendances npm dans l’environnement Docker |
| `static_data` | `backend:/app/staticfiles` et `nginx:/static` | Reçoit les fichiers collectés par Django, notamment les CSS, JavaScript et images de l’administration. Nginx les sert sur `/static/…`. |
| `media_data` | `backend:/app/mediafiles` et `nginx:/media` | Conserve les fichiers téléversés par les utilisateurs, notamment les photos de profil. Nginx les sert sur `/media/…`. |

```
Backend                              Nginx
    │                                   ▲
    ├── collectstatic → static_data ─────┤ lecture seule
    │                                   │
    └── téléversements → media_data ─────┘ lecture seule
```

### 2.3 Ordre de démarrage :
Nginx attend que le backend soit déclaré disponible. Pour le frontend, il attend uniquement que le conteneur soit démarré.

```
PostgreSQL disponible ──┐
                        ├──► Démarrage du backend
Redis disponible ───────┘              │
                                      ▼
                              Backend disponible ──┐
                                                   ├──► Démarrage de Nginx
                              Frontend démarré ────┘
```

## 3 Nginx - point d’entrée de l’application :
Il agit comme reverse proxy : il transmet chaque requête au service approprié, selon son chemin

La configuration srcs/nginx/nginx.conf définit deux destinations internes :
| Destination | Adresse Docker | Utilisation |
|---|---|---|
| `frontend` | `frontend:5173` | Serveur de développement Vite. |
| `backend` | `backend:8000` | Serveur Uvicorn exécutant Django et Channels. |

Nginx choisit la destination en fonction du préfixe de l’URL :
```
Requête reçue par Nginx
    │
    ├── /api/…     → backend:8000 → API Django REST Framework
    ├── /admin/…   → backend:8000 → Administration Django
    └── /…        → frontend:5173 → Vite
```

### 3.1 Transmission des connexions WebSocket :
Une connexion WebSocket commence par une requête HTTP, puis bascule vers une connexion persistante permettant des échanges dans les deux sens.
Pour les chemins /ws/, Nginx transmet les en-têtes Upgrade et Connection nécessaires à ce changement de protocole.

```
Navigateur
    │
    │ Demande de connexion à /ws/ping/
    ▼
Nginx
    │
    │ HTTP/1.1 + en-têtes de changement de protocole
    ▼
Uvicorn
    │
    ▼
Configuration ASGI → Channels → PingConsumer
    │
    ▼
Connexion persistante pour échanger des messages
```

### 3.2 Vérifications du routage :
| Commande | Vérification | Résultat attendu |
|---|---|---|
| `docker compose exec nginx nginx -t` | Validité de la configuration Nginx. | Messages `syntax is ok` et `test is successful`. |
| `curl -I http://localhost:8080/admin/` | Transmission à l’administration, sans session. | HTTP `302` vers la page de connexion. |
| `curl -I http://localhost:8080/static/admin/css/base.css` | Lecture directe d’un fichier statique. | HTTP `200` après la collecte des fichiers statiques. |

## 4 Backend et stockage des données :
Le backend utilise Django pour organiser les données, gérer les utilisateurs et appliquer les règles métier. Django REST Framework (DRF) fournit l’API utilisée par le frontend, tandis que PostgreSQL conserve les données.

### 4.1 Django - rôle et organisation des applications :
```
srcs/backend/
    │
    ├── config/      Configuration Django et routes principales
    ├── common/      Éléments partagés entre les applications
```

L’application common centralise notamment :
- les champs de dates partagés, avec TimeStampedModel ;
- la validation avant enregistrement pour les modèles héritant de ValidatedModel ;
- le gestionnaire des erreurs DRF ;
- les commandes de génération des données de démonstration.

Dans les applications métier, les fichiers séparent les responsabilités :
| Fichier | Rôle |
|---|---|
| `models.py` | Définit les données, leurs relations et certaines règles de validation. |
| `serializers.py` | Contrôle les données reçues et prépare celles envoyées par l’API. |
| `views.py` | Traite les requêtes et coordonne permissions, validation et accès aux données. |
| `urls.py` | Associe les chemins de l’API aux vues. |
| `admin.py` | Configure l’administration des modèles. |
| `tests.py` | Regroupe les tests automatisés. |
| `migrations/` | Conserve l’historique des évolutions du schéma de la base. |

### 4.2 PostgreSQL : modèles, relations et migrations :
Django décrit les données sous forme de classes Python appelées modèles. Chaque modèle définit des champs et peut établir des relations avec d’autres modèles.
L’ORM Django traduit les opérations Python en requêtes SQL. Le pilote Psycopg assure la communication avec PostgreSQL.

```
Code du backend
    │
    │ Lecture ou modification d’un modèle
    ▼
ORM Django
    │
    │ Construction de la requête SQL
    ▼
Psycopg
    │
    │ Communication avec db:5432
    ▼
PostgreSQL
```

Cette approche permet de manipuler les données en Python tout en utilisant les relations, les contraintes et les transactions de PostgreSQL.

Les contrôles interviennent à plusieurs niveaux :
| Niveau | Responsabilité |
|---|---|
| Serializer | Vérifie les données reçues par l’API. |
| Modèle | Porte les règles métier définies pour les données. |
| Base de données | Applique les contraintes déclarées, comme les clés étrangères. |

La classe partagée ValidatedModel (common/model.py) appelle full_clean() avant l’enregistrement des modèles qui en héritent. Si toutes les validations réussissent, Django enregistre l'objet en base de données.

```
Modification d’un modèle
    │
    ▼
make makemigrations
    │ Génère les instructions de modification du schéma
    ▼
Fichier de migration
    │
    ▼
make migrate
    │ Applique ces instructions
    ▼
Base PostgreSQL mise à jour
```

### 4.3 Django REST Framework - routes, vues et serializers :
DRF fournit les outils utilisés pour construire l’API HTTP du projet

| Élément | Responsabilité |
|---|---|
| Route | Associe une URL à une vue. |
| Vue | Détermine comment traiter la méthode HTTP reçue. |
| Permission | Vérifie si l’utilisateur peut effectuer l’action. |
| Serializer | Contrôle les données entrantes et représente les données sortantes. |

Données entrantes (Frontend -> Backend) - requête POST, PUT, PATCH
```
Utilisateur
    ↓
Formulaire React
    ↓
Requête POST (JSON)
    ↓
API Django
    ↓
Serializer
    ↓
Validation des données
    ↓
Modèle Idea
    ↓
Base de données
```

Données sortantes (Backend -> Frontend) - requête GET
```
Base de données
    ↓
Modèle Idea
    ↓
Serializer
    ↓
Réponse JSON
    ↓
Frontend React
    ↓
Affichage à l'utilisateur
```

### 4.4 Authentification, permissions et protection CSRF :
Le projet utilise SessionAuthentication de DRF

```
Navigateur : envoi des identifiants
    │
    ▼
Django : vérification des identifiants
    │
    ▼
Création d’une session enregistrée en base
    │
    ▼
Navigateur : réception du cookie sessionid
    │
    ▼
Requêtes suivantes accompagnées du cookie
    │
    ▼
Django : identification de request.user
```

Le cookie contient l’identifiant de session ; les données de session sont conservées côté serveur.

L’authentification par cookie est accompagnée d’une protection CSRF pour les requêtes de modification authentifiées par session.

```
GET /api/auth/csrf/
    │
    ▼
Initialisation du cookie csrftoken
    │
    ▼
Le frontend lit ce jeton
    │
    ▼
Requête de modification :
cookie de session + en-tête X-CSRFToken
    │
    ▼
Contrôle CSRF côté backend
```

Le cookie de session identifie l’utilisateur. Le jeton CSRF sert à protéger les actions effectuées avec cette session contre les requêtes indésirables provenant d’un autre site.

### 4.5 Erreurs de l’API :
Un gestionnaire commun reformate les exceptions prises en charge par DRF :

| Champ | Utilisation |
|---|---|
| `status` | Statut HTTP de la réponse. |
| `code` | Type d’erreur exploitable par le frontend. |
| `message` | Description générale. |
| `details` | Précisions, notamment les erreurs associées aux champs, ou `null`. |

### 4.6 Vérifications du backend :
| Commande | Vérification | Résultat attendu |
|---|---|---|
| `make check` | Configuration Django. | Aucun problème détecté par les contrôles Django. |
| `make test-db` | Connexion du backend à PostgreSQL. | Message confirmant la connexion. |
| `make check-migrations` | Cohérence entre les modèles et les fichiers de migration. | Aucune migration manquante ; aucun fichier créé. |
| `docker compose exec backend python manage.py showmigrations` | État des migrations. | `[X]` devant les migrations appliquées. |
| `docker compose exec backend python manage.py migrate --check` | Présence de migrations restant à appliquer. | Commande terminée avec succès si la base est à jour. |
| `curl -i http://localhost:8080/api/auth/me/` | Protection d’un endpoint sans session. | Empeche un user de se connecter si ce n'est pas son compte |
| `curl -i -X DELETE http://localhost:8080/api/auth/me/` | Protection d’un endpoint sans session. | Empeche de supprimer un compte si ce n'est pas le sien |

## 5 Frontend :
Le frontend fournit l’interface utilisateur et communique avec l’API Django pour consulter ou modifier les données. Il organise l’affichage, la navigation et les interactions.

| Technologie | Utilisation dans le projet | Intérêt |
|---|---|---|
| **React** | Construction de l’interface avec des composants et gestion de leur état. | Réutiliser les composants et actualiser l’affichage lorsque les données changent. |
| **TypeScript** | Définition des types des données, des paramètres et des propriétés des composants. | Détecter des incohérences pendant le développement et rendre les échanges entre fonctions explicites. |
| **Vite** | Serveur de développement sur le port `5173` et génération du build frontend. | Actualiser rapidement l’interface pendant le développement et préparer les fichiers de distribution. |
| **Tailwind CSS** | Mise en forme à partir de classes utilitaires et d’un thème commun. | Utiliser les mêmes couleurs, tailles et espacements dans toute l’application. |
| **React Router** | Association des URL aux pages et organisation des routes imbriquées. | Naviguer dans l’application sans recharger entièrement la page à chaque navigation interne. |

Le dossier shared/ui/ contient notamment les boutons, champs de saisie, cartes, fenêtres modales et éléments de texte.

index.css centralise les couleurs, les polices, les tailles et les arrondis. Une modification du thème ou d’un composant partagé peut ainsi se répercuter sur les écrans qui l’utilisent.

La page /design-system permet de consulter les composants et leurs variantes.

### 5.1 Navigation et accès aux pages :
Le fichier main.tsx initialise React et les éléments partagés par toute l’application

Les routes sont définies dans app/App.tsx

| Accès | Exemples de routes |
|---|---|
| Public | `/`, `/login`, `/signup`, `/design-system` |
| Connexion nécessaire | `/profile`, `/trip`, `/trip/:id/itinerary`, `/trip/:id/ideas` |

### 5.2 Communication avec l’API et gestion de la session :
Les fonctions placées dans les dossiers api/ utilisent fetch pour appeler le backend avec des chemins relatifs commençant par /api/.

Le navigateur transmet ces requêtes à Nginx, qui les dirige vers Django :
```
Interaction utilisateur
    │
    ▼
Composant React
    │
    ▼
Hook ou fonction de traitement
    │
    ▼
Fonction du dossier api/
    │ fetch("/api/…")
    ▼
Nginx → Backend Django
    │
    │ Réponse HTTP et données JSON
    ▼
Traitement de la réponse
    │
    ├── Succès → Mise à jour de l’état React → Actualisation de l’écran
    └── Erreur → Message affiché dans l’interface
```

Les appels API utilisent credentials: "include" pour transmettre les cookies. Le frontend ne lit pas le cookie de session HttpOnly : le navigateur le transmet.

Pour les requêtes de modification qui le nécessitent, le frontend lit le cookie csrftoken et transmet sa valeur dans l’en-tête X-CSRFToken.

"Content-Type": "application/json"Indique au serveur que le corps envoyé est du JSON.

### 5.3 Gestion des erreurs et des actions :
Les outils de shared/api/ permettent notamment de lire les cookies et d’extraire les messages d’erreur du backend. La fonction parseResponse lève une erreur lorsque la réponse HTTP indique un échec.

Le hook partagé useSubmitAction fournit aux composants :
| Valeur | Utilisation |
|---|---|
| `submit` | Déclenche l’action asynchrone. |
| `isSubmitting` | Indique qu’une action est en cours, par exemple pour désactiver un bouton. |
| `error` | Contient le message à afficher si l’action échoue. |

## 6 Infrastructure temps réel :
Le projet dispose d’une infrastructure permettant de maintenir une connexion ouverte entre le navigateur et le backend grâce aux WebSockets.
Cette connexion permet au client et au serveur d’échanger des messages sans envoyer une nouvelle requête HTTP pour chaque échange.

### 6.1 Uvicorn et ASGI :
Uvicorn est le serveur qui exécute le backend. Il reçoit les connexions transmises par Nginx sur le port interne 8000

Il charge l’application définie dans config/asgi.py. ASGI est l’interface qui permet de relier le serveur à l’application et de prendre en charge aussi bien HTTP que les WebSockets.

```
Nginx
    │
    ▼
Uvicorn — backend:8000
    │
    ▼
Application ASGI
    │
    ├── HTTP ──────► Django : API et administration
    │
    └── WebSocket ► Channels : connexions persistantes
```

Le choix du traitement est effectué par ProtocolTypeRouter dans la configuration ASGI.
Cette organisation permet de conserver un seul service backend pour les requêtes HTTP et les connexions WebSocket.

## 6.2 Django Channels et WebSockets :
Django Channels apporte les composants utilisés pour gérer les connexions WebSocket : routage, intégration des sessions et traitement des messages.

Une connexion est prise en charge par un consommateur (consumers.py), une classe qui définit le comportement à la connexion, à la réception d’un message et à la déconnexion.

PingConsumer hérite de AsyncWebsocketConsumer :
| Méthode | Comportement actuel |
|---|---|
| `connect()` | Accepte la connexion. |
| `receive()` | Lit le message JSON et renvoie une réponse contenant `pong`. |
| `disconnect()` | Ne réalise aucun traitement supplémentaire. |

Le fichier config/websocket_urls.py associe /ws/ping/ à ce consommateur
```
Navigateur : ws://localhost:8080/ws/ping/
    │
    ▼
Nginx : transmet la demande de connexion WebSocket
    │
    ▼
Uvicorn → Application ASGI
    │
    ▼
AllowedHostsOriginValidator
    │ Vérifie l’origine par rapport aux hôtes autorisés
    ▼
AuthMiddlewareStack
    │ Rend l’utilisateur de la session accessible au consommateur
    ▼
URLRouter
    │ Associe /ws/ping/ à PingConsumer
    ▼
PingConsumer
```

AuthMiddlewareStack permet de retrouver l’utilisateur associé à la session

## 6.3 Rôle de Redis :
Redis est configuré comme couche de communication de Channels, via la bibliothèque channels-redis
Redis sert de canal de communication entre les workers.

Cette couche permet d’envoyer des messages à des canaux ou à des groupes de canaux. Elle fournit un intermédiaire commun lorsque les consommateurs sont exécutés dans plusieurs processus.

| Élément | Rôle |
|---|---|
| Canal | Destination permettant de recevoir des messages internes. |
| Groupe | Ensemble de canaux auxquels un même événement peut être envoyé. |
| Redis | Assure le transport de ces messages pour Channels. |

Django Channels gère la connexion WebSocket et permet de retrouver l’utilisateur grâce à sa session. Redis transporte les événements internes entre les consommateurs Channels. Le lien entre les deux est assuré par la bibliothèque channels-redis.

Exemple :

```
Navigateur Alice                         Navigateur Bob
       ↕ WebSocket                              ↕ WebSocket
       │                                        │
       └────── Nginx → Uvicorn → Channels ────────┘
                          │
              ┌───────────┴───────────┐
              │                       │
        Consommateur A          Consommateur B
        connexion Alice         connexion Bob
              │                       │
              └── Membres du groupe ──┘
                      « voyage_42 »
```

Chaque consommateur rejoint le même groupe via la couche Redis. Quand Alice envoie un message :

```
1. Alice envoie un message par WebSocket
                    │
                    ▼
2. Son consommateur Channels reçoit le message
   et vérifie les droits et le contenu
                    │
                    ▼
3. Il publie un événement dans le groupe « voyage_42 »
   avec channel_layer.group_send(...)
                    │
                    ▼
4. channels-redis utilise Redis pour transmettre
   l’événement aux canaux membres du groupe
                    │
            ┌───────┴────────┐
            ▼                ▼
5. Consommateur A      Consommateur B
            │                │
            ▼                ▼
6. WebSocket Alice     WebSocket Bob
   affiche le message  affiche le message
```

## 7 Fonctionnalité Idea et Reaction :
Cette partie du projet permet aux participants d’un voyage de proposer des lieux ou des activités, de les rattacher à des étapes et de réagir a des idées via un vote.

Relie les modèles PostgreSQL, les règles métier Django, les endpoints DRF et l’interface React.

### 7.1 Objectif et parcours utilisateur :
Une idée peut représenter un restaurant, un hébergement, une activité ou une visite.

Un participant peut :
- proposer une idée dans le pool du voyage ou directement sur une étape
- modifier ses informations et son placement
- ajouter ou retirer sa réaction
- choisir un hébergement déjà placé
- supprimer une idée

Le pool générale regroupe les idées sans étape active :

```
Création d’une idée
    │
    ├── Sans étape ─────────────► PROPOSÉE
    │                                │
    │                                │ Placement sur une étape
    │                                ▼
    └── Avec une étape ─────────► PLACÉE
                                     │
                                     │ Choix explicite
                                     │ réservé aux hébergements
                                     ▼
                                  CHOISIE
```

Une idée peut avoir différent état :

| État | Signification |
|---|---|
| `suggested` | L’idée n’a pas d’étape. |
| `placed` | L’idée appartient à une étape active. |
| `chosen` | L’idée est un hébergement placé et explicitement choisi. |

Le statut est calculé par le backend

### 7.2 Règles métier et droits d’accès :
Les endpoints exigent un utilisateur connecté dont la participation au voyage est acceptée.

Un participant peut modifier ou supprimer une idée proposée par un autre participant.

Le backend détermine lui-même :
- le voyage à partir de l’URL
- l’auteur d’une nouvelle idée à partir de la session
- l’utilisateur et la date du choix d’un hébergement
- l’utilisateur qui ajoute ou retire sa réaction

Une idée demandée avec un mauvais identifiant de voyage n’est pas accessible

Dates et placement :
| Situation | Règle appliquée |
|---|---|
| Toute idée | Titre et type obligatoires. |
| Dates renseignées | Début et fin doivent être présents ensemble ; la fin ne peut pas précéder le début. |
| Placement | L’étape doit être active et appartenir au même voyage. |
| Idée placée | Ses dates doivent rester dans les dates de l’étape. |
| Restaurant, activité ou visite dans la réserve | Aucune date. |
| Restaurant, activité ou visite sur une étape | Une seule journée : début et fin identiques. |
| Hébergement | Dates obligatoires, même dans la réserve. |
| Prix par nuit | Facultatif, réservé aux hébergements et supérieur ou égal à zéro. |

Choix d’un hébergement :
Seul un hébergement placé sur une étape active peut être choisi.

Deux hébergements choisis sur la même étape ne peuvent pas avoir de dates qui se chevauchent. Plusieurs hébergements restent possibles lorsque leurs périodes sont distinctes.

```
Même étape :

Hébergement A choisi : du 10 au 12
Hébergement B        : du 12 au 14 → choix refusé
Hébergement C        : du 13 au 15 → choix possible
```

Réactions :
Un participant peut réagir aux idées du voyage, puis retirer sa propre réaction.

- Un second ajout sur la même idée est refusé.
- Retirer sa réaction ne supprime jamais celle d’un autre participant.
- Répéter le retrait reste accepté, même si la réaction n’existe plus.

### 7.3 Tests des serializers :
Les tests vérifient que les serializers acceptent les données valides, refusent les données incorrectes et exposent les informations attendues par l’API.

| Serializer | Principaux contrôles |
|---|---|
| `IdeaSerializer` | Données renvoyées, création d’une idée, champs obligatoires, types autorisés, dates, prix et rattachement à une étape du même voyage. |
| `ReactionSerializer` | Données renvoyées, création d’une réaction et refus d’un doublon pour le même utilisateur et la même idée. |

Sérialisation des données :
Vérifier que les informations renvoyées correspondent aux objets enregistrés.

Création des objets :
Vérifier que des données valides permettent de créer une idée ou une réaction.

Champs obligatoires :
Vérifier le refus d’une idée sans titre ou sans type.

Valeurs des champs :
Vérifier les types d’idées autorisés, les coordonnées, les prix et les dates.

Champs facultatifs :
Vérifier l’acceptation des informations optionnelles et des valeurs nulles autorisées.

Relations entre les objets :
Vérifier le rattachement à une étape existante du même voyage, ainsi que l’absence d’étape.

Protection des champs en lecture seule :
Vérifier que le client ne peut pas imposer les identifiants, l’auteur, le statut ou les informations de choix et de suivi.

Unicité des réactions :
Vérifier qu’un utilisateur ne peut pas créer deux réactions sur la même idée et que le doublon produit une erreur de validation.

### 7.4 Routes API et traitement côté backend :

Toutes les routes suivantes commencent par : /api/travels/<travel_id>/ideas/

| Méthode | Suffixe | Action | Succès |
|---|---|---|---|
| `GET` | Aucun | Lister les idées du voyage, des plus récentes aux plus anciennes. | `200` |
| `POST` | Aucun | Créer une idée. | `201` |
| `GET` | `<idea_id>/` | Consulter une idée. | `200` |
| `PATCH` / `PUT` | `<idea_id>/` | Modifier une idée. | `200` |
| `DELETE` | `<idea_id>/` | Supprimer définitivement une idée. | `204` |
| `POST` | `<idea_id>/choice/` | Choisir un hébergement placé. | `200` |
| `POST` | `<idea_id>/reaction/` | Ajouter sa réaction. | `201` |
| `DELETE` | `<idea_id>/reaction/` | Retirer sa réaction. | `204` |

Validation et enregistrement :
```
Requête
    │
    ▼
Authentification et accès au voyage
    │
    ▼
Vue DRF
    │
    ▼
Serializer : contrôle des champs reçus
    │
    ▼
Idea.save() → full_clean() → règles métier du modèle
    │
    ├── Refus → erreur de validation → réponse HTTP 400
    │
    └── Succès → enregistrement → réponse JSON
```

Idea hérite de ValidatedModel, qui déclenche la validation avant l’enregistrement. IdeaSerializer transforme les erreurs Django en erreurs DRF pour les transmettre au frontend.

Les réponses contenant une idée exposent :

| Champ JSON | Signification |
|---|---|
| `voteCount` | Nombre de réactions sur l’idée. |
| `voted` | Indique si l’utilisateur connecté a réagi. |

Pour la liste, le backend calcule ces informations avec Count et Exists, afin d’éviter de rechercher séparément les réactions de chaque idée.

### 7.5 Affichage et interactions côté frontend :
La page /trip/:id/ideas charge les idées, les étapes et les informations du voyage.

```
IdeasPage
    │
    ├── Filtres par type et par étape
    ├── Cartes IdeaCard
    └── Fenêtres de création, modification et placement
                │
                ▼
             useIdeas
                │ Gère les données et les actions
                ▼
            api.ideas.ts
                │ Effectue les requêtes HTTP
                ▼
             API Django
```

ideaMapper.ts transforme les données de l’API pour les composants :

| API | Frontend |
|---|---|
| Types `r`, `l`, `a`, `s` | `restaurant`, `accommodation`, `activity`, `sightseeing` |
| Statuts `s`, `p`, `c` | `suggested`, `placed`, `chosen` |
| `startDate` et `endDate` | Une date pour une activité ; arrivée et départ pour un hébergement. |

Actions et erreurs :
Les créations, modifications, placements et choix mettent à jour l’état React après confirmation du backend.

useSubmitAction gère les actions en cours et les messages d’erreur. Les boutons concernés sont désactivés pendant le traitement.

L’option « Choisir cet hébergement » apparaît uniquement pour un hébergement au statut placed.

### 7.6 Exemple complet : du clic à l’enregistrement :
```
1. VoteButton déclenche l’action de la carte
                       │
                       ▼
2. useIdeas consulte l’état voted
                       │
           ┌───────────┴────────────┐
           ▼                        ▼
   Pas encore de réaction     Réaction existante
           │                        │
           ▼                        ▼
   POST …/reaction/           DELETE …/reaction/
           │                        │
           └───────────┬────────────┘
                       ▼
3. Backend : vérifie la session et l’accès à l’idée
                       │
                       ▼
4. PostgreSQL : ajoute ou supprime la réaction
                       │
                       ▼
5. Succès HTTP : le frontend actualise l’état du bouton
                       │
                       ▼
6. GET de l’idée pour récupérer voteCount et voted
                       │
                       ▼
7. Mise à jour du compteur et de l’affichage
```

### 7.7 API des idées et des réactions :
Les API permettent à l’interface React de demander au backend de consulter ou de modifier les idées d’un voyage.

Toutes ces requêtes passent par le préfixe : /api/travels/<travel_id>/ideas/

Chaque action nécessite un utilisateur connecté et une participation acceptée au voyage. Le backend vérifie également que l’idée appartient au voyage indiqué dans l’URL.

Consulter et créer des idées :
GET  /api/travels/<travel_id>/ideas/
POST /api/travels/<travel_id>/ideas/

- GET récupère les idées du voyage, des plus récentes aux plus anciennes. Chaque idée contient notamment son statut, son nombre de réactions et l’indication que l’utilisateur connecté a réagi ou non.
- POST crée une proposition à partir des informations du formulaire. Le backend attribue lui-même le voyage depuis l’URL et l’auteur depuis la session.

Une idée peut être créée dans la réserve ou directement sur une étape, à condition de respecter les règles de dates et de placement.

Consulter, modifier ou supprimer une idée :
GET    /api/travels/<travel_id>/ideas/<idea_id>/
PATCH  /api/travels/<travel_id>/ideas/<idea_id>/
PUT    /api/travels/<travel_id>/ideas/<idea_id>/
DELETE /api/travels/<travel_id>/ideas/<idea_id>/

- GET récupère les informations actualisées d’une idée.
- PATCH modifie certains champs. Le frontend l’utilise pour modifier les informations ou placer l’idée sur une étape.
- PUT permet une mise à jour avec les champs requis par le serializer.
- DELETE supprime définitivement l’idée et ses réactions.

Le placement n’a pas de route dédiée : il correspond à une modification de l’étape associée à l’idée, accompagnée des dates nécessaires.

Tous les participants acceptés peuvent modifier ou supprimer les idées du voyage, y compris celles proposées par un autre participant.

Choisir un hébergement :
POST /api/travels/<travel_id>/ideas/<idea_id>/choice/

Cette action marque un hébergement comme choisi parmi les propositions d’une étape.
Le backend vérifie que :
- l’idée est un hébergement ;
- elle appartient à une étape active ;
- aucun autre hébergement choisi sur cette étape ne chevauche ses dates.

Ajouter ou retirer une réaction :
POST   /api/travels/<travel_id>/ideas/<idea_id>/reaction/
DELETE /api/travels/<travel_id>/ideas/<idea_id>/reaction/

- POST ajoute la réaction de l’utilisateur connecté. Une seconde réaction du même utilisateur sur cette idée est refusée.
- DELETE retire uniquement sa propre réaction. Si elle est déjà absente, la demande reste acceptée.

Lien entre l’interface et le backend :
```
Action dans l’interface
    │
    ▼
Fonction API du frontend
    │ Requête HTTP avec la session
    │ et le jeton CSRF pour les modifications
    ▼
Vue Django REST Framework
    │ Vérification des accès
    │ Validation des données et des règles métier
    ▼
PostgreSQL
    │
    ▼
Réponse du backend
    │
    ├── Succès → mise à jour de l’affichage
    └── Refus  → affichage du message d’erreur
```

Ces API permettent au frontend d’effectuer les actions liées aux idées et aux réactions. Le backend contrôle les permissions et les règles métier avant de les exécuter.

### Vue générale :
```
                         POSTGRESQL
                  Données Idea et Reaction
                              ↕
┌────────────────────────── BACKEND ────────────────────────┐
│                                                           │
│  idea/models.py                                           │
│  Structure des données, relations et règles métier        │
│                              ↕                            │
│  idea/serializers.py                                      │
│  Validation des entrées et représentation des données     │
│                              ↕                            │
│  idea/views.py                                            │
│  Traitement des actions et contrôle de l’accès aux données│
│                              ▲                            │
│  idea/urls.py                                             │
│  Associe chaque route à une vue                           │
│                              ▲                            │
│  config/urls.py                                           │
│  Raccorde ces routes au préfixe /api/travels/             │
│                                                           │
└──────────────────────────────┬────────────────────────────┘
                               ↕
                   HTTP / JSON à travers Nginx
                               ↕
┌────────────────────────── FRONTEND ───────────────────────┐
│                                                           │
│  features/idea/api/api.ideas.ts                           │
│  Envoie les requêtes et traite les réponses               │
│                              ↕                            │
│  features/idea/hooks/useIdeas.ts                          │
│  Gère les actions et les données dans l’état React        │
│                              ↕                            │
│  pages/IdeasPage.tsx                                      │
│  Assemble les cartes, les filtres et les fenêtres         │
│                              ↕                            │
│  features/idea/components/                                │
│  Affichage et interactions utilisateur                    │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

#### Vue Backend :
```
config/urls.py
    │
    │ Inclut les routes sous /api/travels/
    ▼
idea/urls.py
    │
    │ Sélectionne la vue selon le chemin
    ▼
idea/views.py
    │
    ├── IdeaListView
    │     └── Lister et créer les idées
    │
    ├── IdeaDetailView
    │     └── Consulter, modifier et supprimer une idée
    │
    ├── IdeaChoiceView
    │     └── Choisir un hébergement placé
    │
    └── ReactionView
          └── Ajouter ou retirer sa réaction
```

Ces vues utilisent les fichiers suivants :

```
idea/views.py
    │
    ├── travel/permissions.py
    │     └── IsTravelParticipant
    │         Contrôle la participation pour la liste et la création
    │
    ├── travel/mixins.py
    │     └── ParticipantScopedMixin
    │         sert à empêcher un utilisateur d'accéder aux données d'un voyage
    │         dont il n'est pas un participant accepté.
    │
    ├── idea/serializers.py
    │     │
    │     ├── IdeaSerializer
    │     │     └── Champs de l’idée et informations sur les votes
    │     │
    │     └── ReactionSerializer
    │           └── Création d’une réaction et traitement des doublons
    │
    └── idea/models.py
          │
          ├── Idea
          │     ├── Liens avec Travel, Step et Traveler
          │     ├── Calcul du statut
          │     └── Validation des règles métier
          │
          └── Reaction
                └── Lien unique entre un utilisateur et une idée
```

#### Vue Frontend :

```
app/App.tsx
    │
    │ Route /trip/:id/ideas, sous ProtectedRoute
    ▼
pages/IdeasPage.tsx
    │
    ├── hooks/useIdeas.ts
    │     └── Idées, réactions et fonctions d’action
    │
    ├── useSteps.ts et useTravel.ts
    │     └── Étapes disponibles et informations du voyage
    │
    ├── utils/filterIdeas.ts
    │     └── Applique les filtres aux idées chargées
    │
    └── components/
          │
          ├── page/
          │     ├── PinIdeaButton.tsx ──► ouvre la création
          │     ├── IdeaTypeFilter.tsx
          │     └── IdeaStepFilter.tsx
          │
          ├── card/
          │     └── IdeaCard.tsx
          │           ├── VoteButton.tsx
          │           ├── StepButton.tsx
          │           ├── IdeaOptionsMenu.tsx
          │           ├── SecondaryInfo.tsx
          │           └── StepLabel.tsx
          │
          └── modal/
                ├── CreateIdeaModal.tsx
                ├── EditIdeaModal.tsx
                └── PlaceIdeaModal.tsx
```

Les fenêtres s’appuient sur les formulaires :

```
CreateIdeaModal.tsx ──┐
                     ├──► CreateIdeaForm.tsx
EditIdeaModal.tsx ────┘         │
                               ├── TypeSelector.tsx
                               ├── DateField.tsx
                               └── AccommodationFields.tsx

PlaceIdeaModal.tsx ───────► PlaceIdeaForm.tsx
                               │
                               └── DateField.tsx
```

La création et la modification réutilisent le même formulaire :

```
Création / modification
    │
    ├── validateIdeaForm.ts
    │     └── Vérifie le titre et les dates avant l’envoi
    │
    ├── ideaFormInput.ts
    │     └── Transforme les valeurs du formulaire en données d’entrée
    │
    └── formatDate.ts
          └── Formate les dates pour les échanges avec l’API
```

Les composants reçoivent leurs fonctions d’action depuis IdeasPage. Ils n’appellent pas directement le backend :

```
Composant ou fenêtre
    │
    │ Appelle une fonction reçue en propriété :
    │ onCreate, onEdit, onPlace, onChoose, onDelete ou onVote
    ▼
IdeasPage.tsx
    │
    │ Relie cette fonction au hook
    ▼
useIdeas.ts
    │
    │ Déclenche l’opération réseau
    ▼
api.ideas.ts
    │
    ├── ideaMapper.ts
    │     └── Adapte les données du formulaire et les réponses API
    │
    ├── shared/api/cookies.ts
    │     └── Lit le jeton CSRF
    │
    └── shared/api/errors.ts
          └── Traite la réponse et lève une erreur en cas de refus
    │
    ▼
fetch → Nginx → API Django
```

features/idea/types.ts définit les structures utilisées par les composants, le hook, les fonctions API et le mapper. Il fournit des types ; ce n’est pas une étape exécutée dans le parcours de la requête.

Correspondance entre les actions frontend et backend :
| Action | Fonction dans `useIdeas.ts` | Fonction réseau | Vue backend |
|---|---|---|---|
| Charger les idées | Effet de chargement | `fetchIdeas` | `IdeaListView` |
| Créer | `handleCreateIdea` | `postIdea` | `IdeaListView` |
| Modifier | `handleEditIdea` | `patchIdea` | `IdeaDetailView` |
| Placer | `handlePlaceIdea` | `patchIdeaPlacement` | `IdeaDetailView` |
| Supprimer | `handleDeleteIdea` | `removeIdea` | `IdeaDetailView` |
| Choisir | `handleChooseIdea` | `chooseIdea` | `IdeaChoiceView` |
| Ajouter une réaction | `handleVote` | `addIdeaReaction` | `ReactionView` |
| Retirer une réaction | `handleVote` | `removeIdeaReaction` | `ReactionView` |
| Relire le compteur après un vote | `handleVote` | `fetchIdea` | `IdeaDetailView` |

Après une action réussie sur une idée :

```
Backend : réponse JSON
    │
    ▼
api.ideas.ts
    │
    ├── parseResponse : vérifie la réponse
    └── ideaMapper.ts : adapte les données
    │
    ▼
useIdeas.ts : met à jour l’état React
    │
    ▼
IdeasPage.tsx : transmet les données actualisées
    │
    ▼
IdeaCard.tsx : affiche le résultat
```

Lorsqu’une action est refusée :

```
Backend : erreur de validation ou de permission
    │
    ▼
common/exceptions.py : prépare la réponse d’erreur DRF
    │
    ▼
shared/api/errors.ts : transforme la réponse en erreur JavaScript
    │
    ▼
L’erreur remonte à la fenêtre ou à la carte
    │
    ├── CreateIdeaModal / EditIdeaModal
    │     └── Gestion locale de l’erreur
    │
    └── PlaceIdeaModal / IdeaCard
          └── shared/hooks/useSubmitAction.ts
    │
    ▼
Message affiché à l’utilisateur
```

### 7.8 Scénarios de vérification et tests :

| Scénario | Résultat attendu |
|---|---|
| Créer une activité sans étape ni date. | Idée proposée dans la réserve. |
| Placer cette activité avec une date comprise dans l’étape. | Statut `placed`. |
| Envoyer des dates hors de l’étape. | Refus HTTP `400`. |
| Créer un hébergement sans dates. | Refus par le formulaire et par l’API. |
| Choisir un hébergement encore dans le pool via l’API. | Refus HTTP `400`. |
| Choisir un hébergement placé. | Statut `chosen`, auteur et date du choix renseignés. |
| Choisir un autre hébergement aux dates chevauchantes sur la même étape. | Refus HTTP `400`. |
| Modifier une idée avec un autre participant accepté. | Modification autorisée. |
| Ajouter une réaction, puis cliquer à nouveau. | Ajout puis retrait de sa réaction. |
| Envoyer deux ajouts de réaction successifs via l’API. | Première réponse `201`, seconde `400`. |
| Supprimer une idée. | L’idée et ses réactions disparaissent. |

Commande :

| Commande | Périmètre |
|---|---|
| `make test ARGS="idea"` | Ensemble des tests Idea et Reaction. |
| `make test ARGS="idea.tests.IdeaModelTest idea.tests.ReactionModelTest"` | Règles des modèles, relations et contraintes. |
| `make test ARGS="idea.tests.IdeaSerializerTest idea.tests.ReactionSerializerTest"` | Validation, représentation et champs protégés. |
| `make test ARGS="idea.tests.IdeaViewTest idea.tests.ReactionViewTest"` | Routes, permissions et actions de l’API. |

### Module Major - A public API :
Une API publique, c'est une API accessible depuis l'extérieur d'une application, une connexion est obligatoire. La documentation est visible par tous le monde.

Dans le projet deux conditions doivent être respectées :
- Être authentifié : l'utilisateur doit être connecté à son compte.
- Être autorisé : l'utilisateur doit être un participant accepté du voyage concerné.

Le module ajoute une nouvelle façon de s’authentifier. Il ne touche pas aux permissions : un utilisateur qui passe par la clé API ne voit que ses propres voyages, exactement comme sur le site.
Utilisation : Un client externe : curl, Postman, un script, une autre app

Ce que fait TokenAuthentication (la classe DRF) à chaque requête
- Elle lit le header Authorization.
- Elle vérifie que le premier mot est Token (c’est l’attribut keyword = "Token" dans le code DRF).
- Elle cherche la clé dans la table des tokens. Si la clé n’existe pas, elle répond « Invalid token. »
- Elle vérifie que l’utilisateur est actif (user.is_active). Un compte désactivé est refusé, même avec une clé valide.
- Elle remplit request.user (le Traveler) et request.auth (l’objet Token).

Cette classe n'est pas ajoute dans REST_FRAMEWORK["DEFAULT_AUTHENTICATION_CLASSES"],
sinon toutes les routes accepteraient la clé, y compris le changement de mot de passe, le profil ou les amis, question de sécurité

| Élément | Responsabilité |
|---|---|
| `rest_framework.authtoken` | Fournit le modèle qui stocke les tokens. |
| `TokenAuthentication` | Lit et vérifie le token envoyé dans la requête. |
| `request.user` | Représente l'utilisateur authentifié. |
| `permission_classes` | Vérifie ce que cet utilisateur a le droit de faire. |


#### Mise en place authtoken :
Ajout dans settings/APP rest_framework.authtoken, permet de créer le modèle Token

Le modèle Token, qui crée la table authtoken_token avec trois colonnes :
- key : la clé elle-même, clé primaire de 40 caractères hexadécimaux. Elle est générée par secrets.
- user : un OneToOneField vers AUTH_USER_MODEL, veut dire une seule clé par utilisateur. si un Traveler est supprimé, sa clé l’est aussi.
- created : la date de création de la clé.

#### Créer la vue qui donne la clé :
Il faut une route où un utilisateur externe envoie son username + mot de passe et reçoit sa clé API en retour. C’est l’équivalent de LoginView, sauf qu’au lieu d’ouvrir une session (cookie), elle renvoie une clé à mettre dans le header Authorization.

Le parcours d’un client externe :
1. POST /api/auth/token/  {"username": "...", "password": "..."}   → {"token": "abc123..."}
2. GET  /api/travels/     header  Authorization: Token abc123...    → ses voyages

L'ajout de la vue se fait dans Traveler/view.py car c’est là que se trouvent déjà toutes les vues d’authentification

Ajout du chemin dans Traveler/urls.py
- path("auth/token", ApiTokenView.as_view(), name="auth-token"),

Controle que la route soit brancher :
- curl -i http://localhost:8080/api/auth/token/

rend 405 car get pas n'est pas utiliser

#### Tests curl :

Test 1 : Test 1 : bons identifiants → on reçoit la clé
```
curl -i -X POST http://localhost:8080/api/auth/token/ \
  -H "Content-Type: application/json" \
  -d '{"username": "dub1", "password": "123456qw."}'
```

Test 2 : deuxième appel → la même clé
- La meme commande que le test 1 doit rendre 200, on récupère la clé existante

Test 3 : mauvais mot de passe → 401
- 401 veut dire « je ne sais pas qui tu es / tes identifiants sont faux

Test 4 : champ manquant → 400
```
curl -i -X POST http://localhost:8080/api/auth/token/ \
  -H "Content-Type: application/json" \
  -d '{"username": "dub1"}'
```

Test 6 : utiliser la clé sur une route
```
curl -i http://localhost:8080/api/travels/ \
  -H "Authorization: Token $TOKEN"
```
Remplacer $TOKEN par la clé api

Test 7 : Créer un voyage avec la clé, sans CSRF
```
curl -i -X POST http://localhost:8080/api/travels/ \
  -H "Authorization: Token $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Voyage API", "startDate": "2026-11-01", "endDate": "2026-11-10"}'
```

test depuis DRF
{"username": "dub1", "password": "123456qw."} et POST, la clé apparait

### Créer le PublicApiMixin :
Dans common/mixins.py
Fonction qui va procéder au deux authentification

SessionAuthentication : la classe via settings.py. Elle lit le cookie de session et vérifie le CSRF.
TokenAuthentication : la classe fournie par DRF qui lit Authorization: Token <clé> et cherche la clé dans la table authtoken_token

rest_framework.authentication
- contient les classes d’authentification

### appliquer le mixin aux vues travel :

Les vues rendus public :

TravelListView :
GET /api/travels/
POST /api/travels/

TravelDetailView :
GET /api/travels/{id}/
PUT /api/travels/{id}/
PATCH /api/travels/{id}/

StepListView :
GET /api/travels/{travel_id}/steps/
POST /api/travels/{travel_id}/steps/

StepDetailView :
GET /api/travels/{travel_id}/steps/{id}/
PUT /api/travels/{travel_id}/steps/{id}/
PATCH /api/travels/{travel_id}/steps/{id}/
DELETE /api/travels/{travel_id}/steps/{id}/

IdeaListView
IdeaDetailView


test pour creer une idee
```
   curl -i -X POST http://localhost:8080/api/travels/<TRAVEL_ID>/ideas/ \
     -H "Authorization: Token $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"title": "Musée des Beaux-Arts", "type": "s"}'
```
```
   curl -i http://localhost:8080/api/travels/<TRAVEL_ID>/ideas/ \
     -H "Authorization: Token $TOKEN"
```

```
curl -i -X DELETE http://localhost:8080/api/travels/<TRAVEL_ID>/ideas/<IDEA_ID>/ \
  -H "Authorization: Token $TOKEN"
```


recap des api public

POST	/api/auth/token/	200	400, 401
GET	/api/travels/	200	403
POST	/api/travels/	201	400, 403
GET	/api/travels/{id}/	200	403, 404
PUT	/api/travels/{id}/	200	400, 403, 404
PATCH	/api/travels/{id}/	200	400, 403, 404
GET	/api/travels/{travel_id}/steps/	200	403
POST	/api/travels/{travel_id}/steps/	201	400, 403
GET	/api/travels/{travel_id}/steps/{id}/	200	403, 404
PUT	/api/travels/{travel_id}/steps/{id}/	200	400, 403, 404
PATCH	/api/travels/{travel_id}/steps/{id}/	200	400, 403, 404
DELETE	/api/travels/{travel_id}/steps/{id}/	204 (soft delete)	403, 404
GET	/api/travels/{travel_id}/ideas/	200	403
POST	/api/travels/{travel_id}/ideas/	201	400, 403
GET	/api/travels/{travel_id}/ideas/{id}/	200	403, 404
PUT	/api/travels/{travel_id}/ideas/{id}/	200	400, 403, 404
PATCH	/api/travels/{travel_id}/ideas/{id}/	200	400, 403, 404
DELETE	/api/travels/{travel_id}/ideas/{id}/	204 (définitif)	403, 404




403 veut dire « je sais qui tu es, mais tu n’as pas le droit

Bons identifiants	200	{"token": "..."}
Mauvais identifiants ou compte désactivé	401	{"detail": "Identifiants invalides."}
Champ manquant	400	enveloppe {status, code, message, details}
Autre verbe que POST	405	enveloppe, avec le header Allow: POST, OPTIONS


#### rate limiting :
Limiter le nombre de requêtes qu’un client peut faire dans une période donnée, par exemple 100 requêtes par minute. Au-delà, le serveur refuse, sans même exécuter la vue, jusqu’à ce que la période soit passée.

Le rate limiting est indispensable et protège contre le brute-force, 
sans limite, un script peut tester des milliers de mots de passe par minute sur POST /api/auth/token/

toutes les vues publiques partagent un seul compteur

Ce que reçoit un client bloqué :
Un code 429 Too Many Requests, avec un header Retry-After qui donne le nombre de secondes à attendre

l’exception s’appelle Throttled, dépassement de limite

Sur ApiTokenView (AllowAny), chaque tentative est comptée, bonne ou mauvaise

Comment DRF reconnaît le client :
- Utilisateur connecté (session ou clé) → par son id. La limite suit donc la personne, quel que soit l’ordinateur ou le réseau.
- Anonyme → par son adresse IP. C’est le cas sur ApiTokenView, où personne n’est encore identifié.

Où sont stockés les compteurs : le cache:

DRF garde pour chaque client la liste des heures de ses dernières requêtes, sous une clé du type throttle_public_api_12

À chaque requête :$
- retire les heures plus vieilles que la période (par exemple plus d’une minute) ;
- compte ce qui reste : si on a atteint la limite, il répond 429 ;
- sinon, il ajoute l’heure actuelle et laisse passer.

Cette liste est rangée dans le cache Django

Les classes de DRF :
Classe	Principe
AnonRateThrottle	Une limite pour tous les anonymes (par IP)
UserRateThrottle	Une limite pour tous les utilisateurs connectés (par id)
ScopedRateThrottle	Une limite par « scope » (un nom qu’on donne à un groupe de vues)

#### Brancher le cache Django sur Redis :

Redis est fait pour :
- partagé : tous les workers lisent et écrivent au même endroit, donc il y a un seul compteur par client ;
- expiration automatique : chaque clé peut avoir une durée de vie, et les compteurs disparaissent tout seuls ;
- rapide : tout est en mémoire, la vérification ne ralentit pas les requêtes ;

Redis comme cache partagé
Ici, Redis sert de stockage temporaire partagé pour le compteur de limite
Evite que chaque worker a son propre cache donc 4 fois plus de limite


```
Worker 1 ──┐
Worker 2 ──┤
Worker 3 ──┼──> Redis (compteur = 8/10)
Worker 4 ──┘
```

Un worker ne correspond pas à un utilisateur.
Un worker est un processus capable de traiter les requêtes de plusieurs utilisateurs.
ils existent déjà et sont partagés entre tous les utilisateurs.

```
             Utilisateur 1
                  │
          Plusieurs requêtes
                  │
          ┌───────┴───────┐
          │               │
      GET /ideas      POST /ideas
          │               │
      Worker 1        Worker 3
          │               │
        Django          Django
```

"BACKEND": "django.core.cache.backends.redis.RedisCache"
Le moteur de cache, ici Redis, fourni par Django

ajout de redis dans requirement, pour separer redis_cache et redis_channel


Controler que le cache fonctionne :

make shell

from django.core.cache import cache
cache.set("test_cle", "bonjour", 100)
cache.get("test_cle")

voir la cle dans le cache
docker compose exec redis redis-cli -n 1 KEYS '*'

nombre de seconde restante avant expiration
docker compose exec redis redis-cli -n 1 TTL ":1:test_cle"

#### déclarer les limites dans settings.py :
DEFAULT_THROTTLE_RATES :
Déclare le nombre de requete autoriser pour les deux scope
scope public pour les vue public
scope auth token pour la génération de clé

ScopedRateThrottle viendra chercher la limite correspondante au scope

Pour limiter tout les vue du site : DEFAULT_THROTTLE_CLASSES serait utilisé

explication NUM_PROXIES :
Pour Django, la connexion vient de nginx

Pour transmettre la vraie IP, nginx.conf ajoute un header :
- proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

- Nginx : ajoute l'adresse IP de la connexion à X-Forwarded-For.
- DRF avec NUM_PROXIES = 1 : sélectionne la dernière adresse du header.
- Redis : stocke le compteur des tentatives dans cette adresse

#### appliquer les limites :
- toutes les vues publiques → scope public_api (100/minute), en passant par le PublicApiMixin ;
- la route de la clé → scope auth_token (5/minute), directement sur ApiTokenView.


Les deux attributs à poser sur une vue
Attribut	Rôle	Valeur
throttle_classes	Le mécanisme : comment compter	[ScopedRateThrottle]
throttle_scope	Le compteur : quel nom de limite utiliser dans settings.py	"public_api" ou "auth_token"


dans traveler/views : ApiTokenView
- ajout du rate limite pour les requete des cle api



test curl :



docker compose exec redis redis-cli -n 1 KEYS '*throttle*'
docker compose exec redis redis-cli -n 1 TTL ":1:throttle_auth_token_172.18.0.1"


test pour num_proxies :
curl -i -X POST http://localhost:8080/api/auth/token/ \
  -H "Content-Type: application/json" \
  -H "X-Forwarded-For: 10.0.0.$i" \                 autre adresse ip
  -d '{"username": "jean", "password": "mauvais"}'


  Récapitulatif de l’étape 3 (pour tes notes)
Ce qui a été ajouté
Fichier	Changement	Rôle
config/settings.py	CACHES → Redis base n°1	Compteurs partagés entre workers, expiration automatique
config/settings.py	DEFAULT_THROTTLE_RATES	public_api : 100/minute, auth_token : 5/minute
config/settings.py	NUM_PROXIES: 1	Vraie IP derrière nginx, header X-Forwarded-For non falsifiable
common/mixins.py	throttle_classes + throttle_scope = "public_api"	Limite toutes les vues publiques d’un coup
traveler/views.py	throttle_classes + throttle_scope = "auth_token"	Bloque le brute-force sur la route de la clé
Le comportement
Scope	Limite	Compté par	Appliqué à
auth_token	5 / minute	IP (client anonyme)	POST /api/auth/token/
public_api	100 / minute	id de l’utilisateur	les 17 routes travels, steps, ideas
(aucun)	pas de limite	—	le reste du site (profil, amis…)

### la documentation (drf-spectacular + Swagger) :
une doc est indispensable pour une API publique, car un client externe n'a pas accès au code

il ne peut donc pas savoir :
- quelles routes existent, et avec quels verbes (GET, POST…) ;
- quels champs envoyer, de quel type et lesquels sont obligatoires ;
- ce qu’il recevra en retour, et avec quels codes ;
- comment s’authentifier et quelles limites s’appliquent.

3 choses sont mises en place :

drf-spectacular :
drf-spectacular lit le code et GÉNÈRE :

OpenAPI : le « schéma » :
servi à /api/schema/   (fichier YAML/JSON, pour les machines)

Swagger UI : la page de doc :
servie à /api/docs/    (page web, pour les humains)


OpenApi :
OpenAPI est un format standard pour décrire une API REST
C’est un gros fichier JSON ou YAML qui liste toutes les routes, leurs paramètres, leurs bodies, leurs réponses et l’authentification

Swagger UI le lit pour afficher une page de doc ;
Postman peut l’importer pour créer toutes les requêtes d’un coup ;

Il sera servi à /api/schema/.


Swagger UI : la page de doc
Swagger UI est une page web qui lit le schéma OpenAPI et l’affiche de façon lisible : une section par route, les champs, des exemples, et surtout un bouton « Try it out » pour envoyer de vraies requêtes depuis le navigateur, ainsi qu’un bouton « Authorize » pour coller sa clé API. Elle sera servie à /api/docs/


drf-spectacular : le générateur :

drf-spectacular le génère automatiquement en inspectant ton code
Les urlpatterns
Les convertisseurs d’URL (<int:travel_id>)
Les vues génériques (ListCreateAPIView…)
serializer_class et ses champs
authentication_classes
Les docstrings des vues

Installation de drf-spectacular dans requirement

Installer drf_spectacular dansd APPS de setting
Pourquoi c’est une app Django : drf-spectacular contient des templates, notamment la page HTML de Swagger UI

Mise en place de SPECTACULAR_SETTINGS dans settings
titre
description de tous ce qui concerne l api
Version de notre API v1

### Brancher les routes /api/schema/ et /api/docs/ :

ajout de deux route :

Les views sont fournis par par drf-spectacular

/api/schema/
SpectacularAPIView
Le schéma OpenAPI (YAML ou JSON)
Les machines (Swagger UI, Postman, générateurs de client)

/api/docs/
SpectacularSwaggerView
La page Swagger UI (HTML)
Les humains

en plaçant la doc avant les include, on garantit qu’aucune route ajoutée plus tard dans une app ne pourra la masquer.

curl -i http://localhost:8080/api/schema/ | head -12


version json
curl -s "http://localhost:8080/api/schema/?format=json" | python3 -m json.tool | head -20



