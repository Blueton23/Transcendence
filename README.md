_This project has been created as part of the 42 curriculum by chpasqui, dle-fur, scuthber, sydubois._

# Peripl

Plan a road trip with friends, all in one place.

## Table of contents

1. [Description](#description)
2. [Instructions](#instructions)
3. [Team Information](#team-information)
4. [Project Management](#project-management)
5. [Technical Stack](#technical-stack)
6. [Database Schema](#database-schema)
7. [Features List](#features-list)
8. [Modules](#modules): [points summary](#points-summary), then one section per module:
   - [Framework for frontend and backend](#framework-for-frontend-and-backend)
   - [ORM for the database](#orm-for-the-database)
   - [Real-time features (WebSockets)](#real-time-features-websockets)
   - [Real-time collaborative features](#real-time-collaborative-features)
   - [Notification system](#notification-system)
   - [Standard user management and authentication](#standard-user-management-and-authentication)
   - [Remote authentication (OAuth 2.0, Google)](#remote-authentication-oauth-20-google)
   - [Allow users to interact (chat, profile, friends)](#allow-users-to-interact-chat-profile-friends)
   - [Public API](#public-api)
   - [Progressive Web App](#progressive-web-app)
   - [Custom-made design system](#custom-made-design-system)
   - [Multiple languages support](#multiple-languages-support)
   - [Support for additional browsers](#support-for-additional-browsers)
   - [Module of choice: map and itinerary routing](#module-of-choice-map-and-itinerary-routing)
   - [Module of choice: shared expenses](#module-of-choice-shared-expenses)
9. [Individual Contributions](#individual-contributions): [Charlotte](#charlotte-chpasqui), [David](#david-dle-fur), [Sébastien](#sébastien-scuthber), [Sylvain](#sylvain-sydubois)
10. [Resources](#resources) and [Use of AI](#use-of-ai)
11. [Known limitations](#known-limitations)

---

## Description

**Peripl** is a web application to plan a **road trip with friends**. Usually, either one person organises everything and carries all the responsibility, or everyone keeps their own notes, screenshots and saved Instagram posts. Peripl puts the whole trip in one place: everybody contributes, decides together and sees the same thing.

**Key features**

- **Trips**: create a trip with its dates, invite friends with a link, see upcoming and finished trips.
- **Itinerary**: steps ordered by date, the driving route drawn on a map, travel time between steps, and the nights that still have no step.
- **Ideas**: everyone pins ideas (restaurant, accommodation, activity, sightseeing) on a step or in a common pool, votes with a ❤️, and the group chooses the accommodation for each night.
- **Expenses**: who paid what, how each expense is shared, each person's balance and the transfers needed to settle up.
- **Chat**: one real-time chat per trip, with unread messages and system messages (someone joined or left).
- **Social**: profile, friends with online status, notifications ("while you were away").
- **Available in French, English and Spanish**, installable as an app (PWA), usable on desktop and mobile.

---

## Instructions

### Prerequisites

- Docker with Docker Compose, and `make`.
- The `kit.tgz` file (HTTPS certificates and secrets), placed at the root of the repository.

### Run

```bash
make
```

This single command installs the certificates, generates and fills the `.env`, then builds and starts every service.

Only on the first launch:

```bash
make seed             # (optional) fills the database with test data
make createsuperuser  # (optional) creates an admin account for /admin/
```

### Access

The application is then available at **https://peripl.app:8443**.

| URL | What you get |
|---|---|
| https://peripl.app:8443/api/ | Backend health check: `{"status": "ok"}` |
| https://peripl.app:8443/admin/ | Django administration |
| https://peripl.app:8443/api/docs/ | Public API documentation (Swagger) |

---

## Team Information

<!-- TODO(each member): one row each. Roles from the subject: PO, PM, Tech Lead, Developers. -->

| Member | Login | Role(s) | Responsibilities |
|---|---|---|---|
| Charlotte | `chpasqui` | Product Owner, Developer | **Product Owner**: defines and prioritises the features and the modules, writes and orders the GitHub issues, checks that deliveries match the mockups and the subject. **Developer**: design and frontend lead, full-stack on trips, itinerary, map and expenses. |
| David | `dle-fur` | Technical Lead / Architect, Developer | **Co-Technical Lead**: infrastructure choices, Docker Compose stack, Nginx, HTTPS and production deployment. **Developer**: ideas and votes (API and frontend), public API, Google sign-in. |
| Sébastien | `scuthber` | Technical Lead, Developer | **Co-Technical Lead**: data model and backend architecture, real-time layer (WebSockets), CI (GitHub Actions). **Developer: seeds**, notifications, expense split and settlement services. |
| Sylvain | `sydubois` | Project Manager, Developer | **Project Manager**: followed where everyone stood and set up team meetings. **Developer**: authentication and user management, profile and friends, chat (API and frontend), consistent error handling across the app. |

---

## Project Management

<!-- TODO(team): check and complete together. -->

- **Organisation**: one in-person meeting per week at 42 to review progress, agree on priorities and split the next tasks. Each member owns one or more domains (see Features List); the Product Owner writes and orders the issues.
- **Tasks**: GitHub Issues, one branch per issue (`<name>/<issue>-<title>`), pull requests reviewed by at least one other member before merging into `main`.
- **Design**: mockups made before coding (`docs/mockups/`), then a shared design system (`/design-system`).
- **Communication**: Discord for day-to-day questions, reviews and decisions, plus the weekly meeting at 42.

---

## Technical Stack

| Layer | Technologies | Why |
|---|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS 4, React Router, i18next, Mapbox GL | Typed, component-based UI with instant reload; Tailwind tokens for a consistent design system |
| **Backend** | Python 3.13, Django 5.2, Django REST Framework, Django Channels, Uvicorn (ASGI) | ORM, migrations, auth, CSRF and admin out of the box; DRF for the REST API; ASGI to serve HTTP and WebSockets in one server |
| **Database** | PostgreSQL 17 | Strongly related data (trips, participants, steps, ideas, expenses) that must stay consistent: constraints, transactions, row locking |
| **Real time / cache** | Redis 7.4 | Channels layer for WebSockets, cache for API rate limiting |
| **Infrastructure** | Docker Compose, Nginx | One command to run everything; Nginx as single entry point (one origin, no CORS, static files, WebSocket upgrade) |
| **External services** | Mapbox (Geocoding and Directions APIs), Google OAuth 2.0 | Place search and driving routes for the itinerary; sign-in without creating a password |
| **Other** | Authlib (Google OAuth), drf-spectacular (OpenAPI), vite-plugin-pwa (Workbox) | Proven libraries for the OAuth protocol, an API documentation generated from the code, and the service worker of the installable app |

More details: [docs/readme/Architecture.md](docs/readme/Architecture.md), [Backend-DRF.md](docs/readme/Backend-DRF.md), [Frontend.md](docs/readme/Frontend.md), [Websockets.md](docs/readme/Websockets.md).

---

## Database Schema

![Data model](docs/data-model/model_v5.svg)

Full description of every table, field, constraint and deletion rule: [docs/data-model/model_v5.md](docs/data-model/model_v5.md).

Main tables: `Traveler` (account), `Travel` (trip), `Participation` (who is in which trip), `Step`, `Idea`, `Reaction` (❤️), `Friendship`, `Message`, `Spending` and `SpendingShare` (who owes what).

---

## Features List

<!-- TODO(each member): add your features and your name. Keep one line per feature. -->

| Feature | Description | Member(s) |
|---|---|---|
| Trips | Create, edit, leave a trip; upcoming / finished; invitation link and join flow | chpasqui (serializers, views, frontend), scuthber (models, seeds); tests: both |
| Itinerary | Steps ordered by date, step detail day by day, nights without a step, add / edit step with a calendar limited to the trip dates | chpasqui (serializers, views, frontend), scuthber (models, seeds); tests: both |
| Map and routing | Interactive map, place search, driving route leg by leg | chpasqui |
| Ideas and votes | Pin ideas, vote, place on a step, choose the accommodation | dle-fur (serializers, views, frontend), scuthber (models, seeds); tests: both |
| Expenses | Expenses, shares, balances and settlements | chpasqui (serializers, views, frontend), scuthber (models, split and settlement services, seeds); tests: both |
| Chat | Real-time chat per trip, unread messages | sydubois (serializers, views, frontend), scuthber (models, WebSockets, seeds); tests: both |
| Notifications | "While you were away": unread messages, new ideas, invitations, friend requests | scuthber |
| Profile and friends | Profile, avatar upload, friends, online status | sydubois (serializers, views, frontend), scuthber (models, seeds); tests: both |
| Authentication | Sign up, log in, Google OAuth | dle-fur |
| Public API | Secured, rate-limited, documented API | dle-fur |
| Design system | Mockups, shared UI components and tokens, every page redesigned for desktop and mobile | chpasqui |
| i18n | French, English, Spanish | chpasqui |
| PWA | Installable, usable offline in read-only mode | chpasqui |
| Error handling | Translated error messages, global error banner | sydubois |

---

## Modules

### Points summary

| Module | Type | Points | Member(s) |
|---|---|---|---|
| Framework for frontend and backend (React, Django) | Major | 2 | dle-fur |
| ORM for the database (Django ORM) | Minor | 1 | scuthber |
| Real-time features (WebSockets) | Major | 2 | scuthber |
| Real-time collaborative features | Minor | 1 | scuthber |
| Notification system | Minor | 1 | scuthber |
| Standard user management and authentication | Major | 2 | sydubois |
| Remote authentication (OAuth 2.0, Google) | Minor | 1 | dle-fur |
| Allow users to interact (chat, profile, friends) | Major | 2 | sydubois, scuthber |
| Public API | Major | 2 | dle-fur |
| Progressive Web App | Minor | 1 | chpasqui |
| Custom-made design system | Minor | 1 | chpasqui |
| Multiple languages support (i18n) | Minor | 1 | chpasqui |
| Support for additional browsers (Firefox, Safari) | Minor | 1 | chpasqui |
| **Module of choice: map and itinerary routing** | Major | 2 | chpasqui |
| **Module of choice: shared expenses** | Minor | 1 | chpasqui, scuthber |
| **Total** | | **21** | |

---

### Framework for frontend and backend

| | |
|---|---|
| **Type** | Major · 2 pts |
| **Members** | dle-fur (technical foundation: Docker Compose, the 5 services, Nginx, Makefile); the framework itself is used by everyone |
| **Why this module** | A trip planner has many screens sharing the same data and an API with authentication and validation. React and Django give a proven structure for both, instead of rebuilding routing, forms, database access and security by hand. |
| **What it does** | Backend in **Django + Django REST Framework**, frontend in **React + TypeScript + Vite**; the whole application starts with a single command (`make`) and runs the same way on every machine. |
| **How it is implemented** | • **Backend**: Django 5.2, DRF for the REST API, Channels for WebSockets, served by Uvicorn (ASGI).<br>• **Frontend**: React 19, TypeScript and Tailwind, built for production inside its image.<br>• **Docker Compose**: 5 services (PostgreSQL, Redis, backend, frontend, Nginx), started in the right order thanks to health checks.<br>• **Nginx**: single entry point over HTTPS; routes `/api/`, `/admin/`, `/ws/` to the backend and the rest to the frontend, so everything shares one origin (no CORS).<br>Details: [docs/readme/Infrastructure.md](docs/readme/Infrastructure.md). |
| **Limits** | The source code is not mounted in the containers: every change requires rebuilding the images (`make up` runs `--build`). |
| **How to test** | `make ps`: `db`, `redis`, `backend`, `frontend` are **healthy** and `nginx` is **running**, so the 5 services started in the right order. |

---

### ORM for the database

| | |
|---|---|
| **Type** | Minor · 1 pt |
| **Members** | scuthber (most models, migrations and constraints); each member then used it in the serializers and views of their features |
| **Why this module** | Trips, steps, ideas and expenses are tightly related. An ORM keeps relations, constraints and migrations in Python code reviewed in Git, and protects every query against SQL injection. |
| **What it does** | Every table is described in Python and created by migrations: no handwritten SQL, and the business rules are enforced as close to the data as possible. |
| **How it is implemented** | • Django ORM on PostgreSQL 17: one `models.py` per app (`traveler`, `travel`, `idea`, `spending`, `chat`), migrations versioned in Git.<br>• Rules in the database: `CheckConstraint` (an idea ends after it starts, a system message has no author…), `UniqueConstraint` (one vote per person and per idea), deliberate `on_delete` choices (`CASCADE`, `SET_NULL`, `PROTECT` for the payer of an expense).<br>• Rules in the models: `clean()` methods (two chosen accommodations of a step cannot overlap…), run on every save by a shared `ValidatedModel`.<br>• Queries: `annotate` + `Exists` (vote counts in one query), `select_for_update` inside transactions, custom querysets (`Message.objects.unread_for(…)`). |
| **How to test** | `docker compose exec backend python manage.py showmigrations`: every migration is applied. `/admin/` shows the tables. `make test` runs the model tests (constraints and validation). |

---

### Real-time features (WebSockets)

<!-- TODO(scuthber): check and complete -->

| | |
|---|---|
| **Type** | Major · 2 pts |
| **Members** | scuthber (consumers, events, frontend socket layer), dle-fur (Channels, Uvicorn and Redis set-up) |
| **Why this module** | Planning together only works if everyone sees changes as they happen; without it, friends would plan on outdated data. |
| **What it does** | Changes made by one traveller appear instantly for everyone else on the trip, without reloading the page. |
| **How it is implemented** | • Django Channels served by Uvicorn (ASGI), with a Redis channel layer so that events reach every worker (set up by dle-fur).<br>• Two consumers: one per trip (`ws/travels/<id>/`) and one per user for notifications (`ws/notifications/`); access checked on connect.<br>• Events are sent only after the database commit (`transaction.on_commit`), so nobody receives a change that was rolled back.<br>• Frontend: a socket provider with automatic reconnection and `useTravelEvent` / `useNotificationEvent` hooks; on every (re)connection the data is reloaded over REST, then live events are applied.<br>• A traveller who leaves a trip has their sockets closed (`travel.kick`, code 4403). |
| **How to test** | Open the same trip in two browsers with two accounts, then send a message or add an idea: it appears in the other window immediately. |

---

### Real-time collaborative features

<!-- TODO(scuthber): check and complete -->

| | |
|---|---|
| **Type** | Minor · 1 pt |
| **Members** | scuthber |
| **Why this module** | Several friends edit the same trip at the same time: votes, chosen accommodations and expenses must stay consistent for all of them. |
| **What it does** | Several travellers can work on the same trip at the same time: steps, ideas, votes, chosen accommodations, expenses and participants stay in sync on every open page. |
| **How it is implemented** | • Each change in the API sends a trip event (`step.created`, `idea.updated`, `reaction.created`, `participant.joined`…) through the WebSocket layer.<br>• The pages listen to these events and reload only the data concerned.<br>• Conflicting actions are resolved on the server (transactions and row locking), so two people choosing an accommodation at the same time cannot break the rules. |
| **How to test** | Two accounts on the same trip: one votes for an idea or adds an expense, the other sees the counter or the balances change without reloading. |

---

### Notification system

<!-- TODO(scuthber): check and complete -->

| | |
|---|---|
| **Type** | Minor · 1 pt |
| **Members** | scuthber |
| **Why this module** | Friends do not plan at the same time. When someone comes back, they need to see at a glance what changed while they were away. |
| **What it does** | Every creation, update and deletion in a trip is announced as a system message in the trip chat ("Alice added the step Lausanne"). The most important ones are also gathered in a "while you were away" card on the trips page (unread messages, new ideas, trip invitations, friend requests), and badges on the navigation show the unread counts. |
| **How it is implemented** | • Unread messages and unseen ideas are computed from the last time each participant opened the chat or the ideas page.<br>• A per-user WebSocket (`ws/notifications/`) refreshes the card and the badges live.<br>• Each line links to the right page (chat, ideas, profile, invitation). |
| **How to test** | With a second account, send a message and add an idea on a shared trip: the first account sees the card and the badges update. |

---

### Standard user management and authentication

<!-- TODO(sydubois): check and complete -->

| | |
|---|---|
| **Type** | Major · 2 pts |
| **Members** | sydubois |
| **Why this module** | Every trip is shared between real people: accounts, profiles and friends are the base for inviting someone and knowing who proposed or paid what. |
| **What it does** | Sign up, log in and log out; edit the profile and the password; upload an avatar (a default one otherwise); add friends and see whether they are online; a profile page for each user. |
| **How it is implemented** | • Django session authentication with CSRF protection (`auth/login/`, `auth/logout/`, `auth/me/`); passwords hashed by Django.<br>• Profile endpoints: `travelers/update/`, `travelers/update-password/`, `travelers/update-profile-picture/` (image stored in the media volume, served by Nginx).<br>• Friendship endpoints: search, request, accept, remove; online status shown on friends' avatars. |
| **How to test** | Create an account, change the avatar and the username, add a second account as a friend and log it in elsewhere: it appears online. |

---

### Remote authentication (OAuth 2.0, Google)

| | |
|---|---|
| **Type** | Minor · 1 pt |
| **Members** | dle-fur |
| **Why this module** | Friends often join from an invitation link: signing in with an account they already have removes the step of creating a new password. |
| **What it does** | A "Continue with Google" button on the login and sign-up pages. The user signs in with Google (the site never sees their Google password) and comes back logged in; their account is created on the first login, then found again on the next ones. |
| **How it is implemented** | • **Authlib** handles the OAuth 2.0 / OpenID Connect protocol: `state` against CSRF, `nonce` against replay, verification of Google's signature.<br>• **Our code** (`traveler/views.py`) finds the account by email or creates it **without a password**, and requires an email verified by Google.<br>• A **classic account with the same email is refused**: classic sign-up does not verify the email, so this blocks an attacker who would have pre-created an account with someone else's email.<br>Details and step-by-step checks: [docs/readme/OAuth.md](docs/readme/OAuth.md). |
| **Limits** | The account is found by email, not by Google's stable identifier (`sub`), which would allow an extra check. |
| **How to test** | • In a private window, click **Continue with Google** and choose an account: you arrive logged in.<br>• In `/admin/` → Travelers, the new account has no usable password.<br>• Try again with the email of an existing classic account: the login is refused with a message. |

---

### Allow users to interact (chat, profile, friends)

<!-- TODO(sydubois, scuthber): check and complete -->

| | |
|---|---|
| **Type** | Major · 2 pts |
| **Members** | sydubois (API, frontend), scuthber (models, WebSockets) |
| **Why this module** | A road trip is decided together: discussing in the trip chat and finding friends to invite are part of planning it. |
| **What it does** | A real-time chat for each trip, a profile page for each user and a friends system (requests, list, removal). |
| **How it is implemented** | • Chat: `Message` model (user and system messages, e.g. someone joined or left), API to list and send messages and to mark them as read, live delivery over the trip WebSocket, an unread separator.<br>• Profile and friends: see "Standard user management and authentication". |
| **How to test** | Two accounts on the same trip: send messages both ways, leave the chat and come back to see the unread separator; send a friend request and accept it from the other account. |

---

### Public API

| | |
|---|---|
| **Type** | Major · 2 pts |
| **Members** | dle-fur |
| **Why this module** | Lets the trip data be used outside the website (scripts, other tools), and made us secure and document our API properly. |
| **What it does** | An external program (script, Postman…) can read and modify **trips**, **steps**, **ideas** and **expenses** with an **API key** (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`), with rate limiting and public Swagger documentation. |
| **How it is implemented** | • **API key**: `POST /api/auth/token/` exchanges username and password for a key (`rest_framework.authtoken`), then sent as `Authorization: Token <key>`.<br>• **Only some routes are public**: a shared `PublicApiMixin` (`common/mixins.py`) enables the key and the rate limiting on them; the others stay reserved for the website.<br>• **Rate limiting**: 1000 requests per minute per user, and 5 key requests per minute per IP against brute force.<br>• **Documentation**: Swagger generated from the code (drf-spectacular) at `/api/docs/`, showing only the public routes.<br>Details: [docs/readme/Public-API.md](docs/readme/Public-API.md). |
| **Limits** | Keys are stored in plain text and never expire (how `authtoken` works); they are revoked by deleting them in the admin. |
| **How to test** | Open `https://peripl.app:8443/api/docs/`, get a key with an existing account (`POST /api/auth/token/`), click **Authorize** and enter `Token <key>`. Then check the limits with the commands below. |

```bash
# Brute force: 5 wrong passwords answer 400, the 6th answers 429
for i in $(seq 1 6); do
  curl -s -o /dev/null -w "%{http_code}\n" -X POST https://peripl.app:8443/api/auth/token/ \
    -H "Content-Type: application/json" -d '{"username": "<username>", "password": "wrong"}'
done

# Rate limiting: 1000 requests answer 200, the 1001st answers 429
TOKEN=<key>
for i in $(seq 1 1001); do
  curl -s -o /dev/null -w "%{http_code}\n" https://peripl.app:8443/api/travels/ \
    -H "Authorization: Token $TOKEN"
done | sort | uniq -c
```

---

### Progressive Web App

| | |
|---|---|
| **Type** | Minor · 1 pt |
| **Members** | chpasqui |
| **Why this module** | A road trip happens on the road, often with a poor connection: the trips and the itinerary must stay readable on a phone without network, and the app should open like a native one. |
| **What it does** | Peripl can be installed as an app and stays usable offline in read-only mode: the user stays logged in, finds the trips already visited and sees a clear message when a feature needs the network. |
| **How it is implemented** | • Caching (`vite.config.ts`): `vite-plugin-pwa` (Workbox) generates the manifest and the service worker; app files are precached, `GET /api/travels…` is network-first.<br>• Session (`features/auth/context/AuthProvider.tsx`): a lost network (`TypeError`) keeps the user logged in, an expired session (401) logs them out.<br>• Online status (`shared/hooks/useOnlineNetworkStatus.ts`): drives the "Offline" banner (`app/OfflineBanner.tsx`) and the placeholders for the map and the place search. |
| **Limits** | Read-only offline. Map unavailable offline. Production needs HTTPS. Firefox desktop cannot install PWAs. |
| **How to test** | • Open `https://peripl.app:8443` (not `localhost`: the service worker needs a valid certificate), log in and open a trip.<br>• Developer tools → **Application**: the manifest and its icons, the service worker *activated and running*, the `api-travels` cache filling up.<br>• **Network** → tick **Offline** and reload: the user stays logged in, the trips stay readable and the "Offline" banner appears; a vote or an expense shows a network error message. |

---

### Custom-made design system

| | |
|---|---|
| **Type** | Minor · 1 pt |
| **Members** | chpasqui |
| **Why this module** | Four people built different pages. Shared components and tokens keep the app consistent and make every new page faster to build. |
| **What it does** | One consistent look on every page, desktop and mobile, built from reusable components. |
| **How it is implemented** | • Mockups first (`docs/mockups/`), then palette, typography, radii and shadows as Tailwind tokens, with colours per trip, idea type and expense category, checked for contrast.<br>• Components in `shared/ui`: `Button`, `IconButton`, `Card` (with a colour band), `Tag`, `Chip`, `Dot`, `Avatar`, `OnlineStatus`, `Text`, `Heading`, `Input`, `Select`, `Modal`, `OptionsMenu`, `DropdownMenu`, `DatePicker`, `Banner`…<br>• A rounded icon sprite used through `<Icon name="…" />`, and a living catalogue at `/design-system`. |
| **Limits** | No dark mode. |
| **How to test** | Open `/design-system`, then any page in the browser's responsive mode. |

---

### Multiple languages support

| | |
|---|---|
| **Type** | Minor · 1 pt |
| **Members** | chpasqui |
| **Why this module** | Road trips cross borders, and a group of friends does not always share the same language. |
| **What it does** | The whole app in French, English and Spanish, with a language switcher remembered between visits. |
| **How it is implemented** | • i18next with one `common.json` per language; every text goes through `t()`, with plurals and interpolation.<br>• Language read from `localStorage`, then the browser, then French; dates, calendar and map labels follow it.<br>• The backend returns error codes, translated by the frontend, so API errors appear in the user's language. |
| **How to test** | Switch the language in the sidebar (desktop) or the account menu (mobile). |

---

### Support for additional browsers

| | |
|---|---|
| **Type** | Minor · 1 pt |
| **Members** | chpasqui |
| **Why this module** | Friends use different devices and browsers (Safari on iPhone, Firefox, Chrome): the app must work the same for everyone in the group. |
| **What it does** | Every feature works with the same look on Chrome (required), **Firefox** and **Safari**, on desktop and mobile. |
| **How it is implemented** | • Every page and feature tested in the three browsers, desktop and mobile (responsive mode). <!-- TODO(chpasqui): mention real phones if you tested on them --><br>• Only standard web APIs; Tailwind adds vendor prefixes where needed.<br>• Dates formatted through `Intl` / i18next rather than browser-specific parsing. |
| **Limits** | Firefox desktop cannot install PWAs (the app still works in the browser). <!-- TODO(chpasqui): add any other browser-specific difference found while testing --> |
| **How to test** | Open the app in Firefox and Safari and go through the main flows: create a trip, add steps, pin and vote for an idea, add an expense, send a chat message. |

---

### Module of choice: map and itinerary routing

| | |
|---|---|
| **Type** | Module of choice · Major · 2 pts |
| **Members** | chpasqui |
| **What it does** | An interactive map of the trip with a marker per step, a place search to add a step, and the driving route between steps with its duration and distance. |
| **Why this module** | A road trip is first a route, and no module of the subject covers maps or routing. It is worth a Major because it combines an external API and its limits, asynchronous computation with caching, a map rendering library and backend validation, and the whole itinerary is built on it. |
| **How it is implemented** | • Place search: Mapbox Geocoding, with a short delay while the user types (`features/map/api/mapboxApi.ts`, `hooks/usePlaceSuggestions.ts`).<br>• Route: one Directions request per pair of consecutive steps, all in parallel, with a cache per pair so unchanged legs are never requested again (`api/routingApi.ts`, `hooks/useRoute.ts`). A result that arrives after the steps changed is ignored.<br>• A place that cannot be reached by road gives "no route" for its leg only; the rest of the route is still drawn.<br>• Map: Mapbox GL JS, framing all the steps automatically, labels in the app language (`components/ItineraryMap.tsx`, `hooks/useMapFraming.ts`).<br>• Steps store mandatory coordinates, validated by the backend (`travel/models.py`). |
| **Limits** | Driving only. Needs a Mapbox token. Not available offline. |
| **How to test** | Create a trip with steps in several cities, then add one that cannot be reached by car: only that leg is missing. |

---

### Module of choice: shared expenses

| | |
|---|---|
| **Type** | Module of choice · Minor · 1 pt |
| **Members** | scuthber (models, services, seeds), chpasqui (API, frontend); tests: both |
| **What it does** | Each participant records what they paid and who it is for; the page shows the total, each person's share, the totals by category, everyone's balance and the transfers to settle up. |
| **Why this module** | Money is the classic source of tension on a trip with friends and no module of the subject covers it. It is a Minor because it is one well-delimited feature, with real logic behind it: exact shares, balances, minimal transfers. |
| **How it is implemented** | • `Spending` and `SpendingShare` models: shares stored in exact cents, so their sum always equals the amount.<br>• `split_equally` gives the remaining cents to the first travellers; `compute_balances` is paid minus owed; `compute_settlements` matches the biggest debtor with the biggest creditor until every balance is zero.<br>• A traveller who leaves keeps their balance, and a payer cannot be deleted (`PROTECT`).<br>• API: serializers, views, summary endpoint, model rules returned as translated error codes, WebSocket events so every open page updates.<br>• Frontend: expenses page, add / edit modal, filters. |
| **Limits** | One currency (CHF). A settlement is shown but not recorded as paid. |
| **How to test** | Add an expense shared with others and watch the balances update, also in a second window. |

---

## Individual Contributions

### Charlotte (`chpasqui`)

**Product Owner:** defined the product and its scope: which features, which modules, in which order. Wrote and prioritised most of the GitHub issues, reviewed teammates' pull requests, and checked each delivery against the mockups and the subject.

**Core of the application (not counted as modules):** trips, itinerary, steps and expenses, full-stack.
- **Backend:** `Travel`, `Step` and `Spending` API: serializers, views, permissions, business rules (dates, overlaps, lodging), real-time events, tests (with Sébastien, who wrote the models, seeds and expense services).
- **Frontend:** trips and invitations, itinerary and day-by-day step detail, step form with its calendar, expenses page, app navigation (desktop and mobile), 404 page.

**Design:** mockups of every screen on desktop and mobile, the colour palette and tokens (checked for contrast), the icon set, and the shared components. Then the redesign of **every page** with them, including the features built by teammates (ideas, profile, friends, chat), without breaking their logic.

**Modules:** map and itinerary routing, shared expenses (with Sébastien), design system, i18n, PWA.

**Challenges:**
- *Routing:* Mapbox answers "no route" for a place that cannot be reached by road, and one such step used to erase the whole route. Each leg is now requested, cached and drawn separately, so only the unreachable leg is missing.
- *Dates:* the same rules (stay inside the trip, no overlap, a stay may end the day the next one starts) had to hold in three places: the calendar, the API and the models. The models are the reference, and the calendar only offers the dates the API will accept, so the user is stopped before sending an invalid step.
- *Offline session:* when the network is lost, every request fails and the app used to log the user out. The app now tells a lost network (`TypeError`) from an expired session (401), so the user stays logged in and keeps reading their trips offline.
- *Design system on a shared codebase:* moving every page to shared components and tokens while teammates kept working on the same files, keeping desktop and mobile consistent and each feature working.

---

### David (`dle-fur`)

**Infrastructure:** technical foundation of the project: Docker Compose with the 5 services, health checks and startup order, Nginx as single entry point (routing, static files, WebSockets, HTTPS with Let's Encrypt certificates), the `Makefile`, and the move to production.

**Backend:** `Idea` and `Reaction` (votes) API: ideas, votes and the choice of an accommodation, with vote counts in a single query, a choice protected against simultaneous requests, and one vote per person guaranteed by the database. Public API and Google sign-in.

**Frontend:** ideas feature (`src/features/idea/`) in separated layers, where a component never calls `fetch`: API mapper, `useIdeas` hook (loading, errors, late responses), client-side form validation, translated backend errors, and `useSubmitAction` to prevent double submissions.

**Modules:** framework for frontend and backend (technical foundation), public API, remote authentication (OAuth 2.0, Google).

**Challenges:**
- *Concurrent choices:* two travellers choosing an accommodation at the same time could break the rules (overlapping nights); a transaction with row locking (`select_for_update`) makes the second request see the first one.
- *Performance:* counting votes per idea one by one (N+1 queries) was replaced by a single annotated query.
- *Account takeover with Google:* since classic sign-up does not verify the email, signing in with Google is refused when a classic account already uses the same email.
- *Rate limiting behind Nginx:* the client IP is read from `X-Forwarded-For` with `NUM_PROXIES: 1`, so it cannot be spoofed to bypass the limits.

---

### Sébastien (`scuthber`)

**Backend:** data model of every app: `Traveler` and friendships, `Travel` / `Participation` / `Step`, `Idea` and votes, `Spending` and shares, chat `Message` with unread tracking. Split and settlement services for expenses, keeping cents exact. The `common` app: base models, error format, permissions and a Faker `seed` command.

**Real-time:** Django Channels with a Redis channel layer: a per-trip consumer and a per-user notification consumer, events sent only after the database commit; live chat, ideas, votes, steps, participants and friend requests. On the frontend, a socket provider with reconnection and `useTravelEvent` / `useNotificationEvent` hooks.

**Notifications:** travel and idea notifications, the global notification dashboard and its live "while you were away" summary.

**CI:** GitHub Actions for backend and frontend: Ruff lint, tests against a real Redis, missing-migration check, whole-stack smoke test.

**Modules:** real-time features, real-time collaboration, notification system, user interaction (with Sylvain), shared expenses (with Charlotte).

**Challenges:**
- *Several workers:* two travelers of the same trip can be on different processes; a Redis channel layer makes events reach all of them.
- *Missed events:* Channels does not replay what was sent while a client was offline, so the frontend reloads over REST on every (re)connection, then applies live events.
- *Leaving a trip:* permissions are only checked on connect; a `travel.kick` event now closes the sockets of a traveler who left (code 4403).
- *Async tests:* consumer tests failed with "the connection is closed"; fixed with `TransactionTestCase` and a custom communicator, documented in `Websockets.md`.

---

### Sylvain (`sydubois`)

<!-- TODO(sydubois): check and complete -->

**Project Manager:** followed where each member stood and organised team meetings.

**Backend:** authentication and user management API, following Django and DRF standards whenever possible:
- sign up, log in, log out, current user and CSRF token (`auth/…`), passwords hashed by Django;
- profile update, password change and avatar upload (`travelers/update/`, `update-password/`, `update-profile-picture/`);
- friendships: search, send, accept and remove (`friendships/…`);
- chat: list and send messages, mark them as read, unread count.

**Frontend:** login and sign-up pages, profile page and its edit form, friends (search, requests, list), chat page. Sébastien handled the WebSocket layer.

**Error handling:** made errors consistent across the whole app: `drf-standardized-errors` on the backend, the `Accept-Language` header so the API answers in the user's language, and a shared parsing of API errors on the frontend (`parseResponse.ts`, `errors.ts`).

**Modules:** standard user management and authentication; user interaction (with Sébastien).

**Challenges:**
- *Error handling:* each feature returned and displayed errors its own way; one format on the backend and one parser on the frontend now give the same translated messages everywhere.
- *Consistency:* reusing framework standards instead of custom implementations, to keep the code maintainable.

---

## Resources
https://docs.djangoproject.com/fr/6.1/
https://developers.google.com/identity/protocols/oauth2?hl=fr
https://drlee.io/how-to-setup-google-authentication-step-by-step-3707d0dffc77
https://swagger.io/docs/
https://coddy.tech/docs/typescript

<!-- TODO(team): add the references you actually used. -->

### References

- [Django](https://docs.djangoproject.com/en/5.2/), [Django REST Framework](https://www.django-rest-framework.org/), [Django Channels](https://channels.readthedocs.io/)
- [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/docs/), [Vite](https://vite.dev/), [Tailwind CSS](https://tailwindcss.com/docs)
- [Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js/), [Mapbox Directions API](https://docs.mapbox.com/api/navigation/directions/)
- [i18next](https://www.i18next.com/), [vite-plugin-pwa](https://vite-pwa-org.netlify.app/)
- [PostgreSQL](https://www.postgresql.org/docs/17/), [Redis](https://redis.io/docs/), [Nginx](https://nginx.org/en/docs/)

### Use of AI

AI assistants were used by the team as a learning and support tool: to get concepts and error messages explained, to compare approaches before choosing one, and to review code. The code was written by the team members themselves; the few parts where AI produced code are listed below, and they went through the same tests and pull request reviews as the rest.

More specifically:

- **Charlotte (chpasqui):** used Claude to explore design directions and build the mockups, to get explanations of concepts (React, Tailwind, Django), and to review code. At the very end of the project, it also generated the landing page for visitors, helped update the `/design-system` catalogue page to the final components, and sped up a few repetitive changes (translations, renaming, style harmonisation).
- **David (dle-fur):** used AI to understand technical concepts and research information. Wrote and understood the first tests himself, then used AI to write the remaining tests following the same pattern. Also used AI to assist with code reviews.
- **Documentation:** AI helped write and structure the documentation, including this README and the files in `docs/readme/`, starting from the team's notes and the code. Each member is responsible for checking the parts that describe their own work.

---

## Known limitations

<!-- TODO(team) -->

- **Itinerary**: two steps on the same dates are ordered by creation; the API supports a manual order (`priority`) but the interface does not offer it yet.
- **Itinerary**: a step must stay within the trip dates; to add a step outside them, the trip dates have to be changed first (the trip is not extended automatically).
- **Routing**: driving routes only, no walking, cycling or public transport.
- **Ideas**: choosing an accommodation cannot be undone yet (the idea can be deleted instead).
- **Steps**: a deleted step goes to the trash, but there is no screen to restore it yet.
- **Expenses**: one currency (CHF), and a settlement is shown but cannot be marked as paid.
- **Offline**: read-only, and the map is not available offline (Mapbox tiles cannot be cached).
