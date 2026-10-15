# WebSockets

Ce qu'il faut savoir avant de construire les fonctionnalités temps réel (chat, collaboration en direct, notifications).

## Ce qui est déjà en place

La tuyauterie est faite ; il ne manque que la couche applicative.

| Élément | Où |
|---|---|
| Serveur ASGI (Uvicorn) | `srcs/backend/entrypoint.sh` |
| Routage ASGI, contrôle de l'origine, auth par session | `srcs/backend/config/asgi.py` |
| Routes WebSocket | `srcs/backend/config/websocket_urls.py` |
| Channel layer Redis | `CHANNEL_LAYERS` dans `srcs/backend/config/settings.py` |
| Proxy nginx pour `/ws/` | `srcs/nginx/nginx.conf` |
| Consumer d'exemple (`PingConsumer`) | `srcs/backend/config/consumers.py` |
| Tests et smoke test | `srcs/backend/config/tests.py`, `scripts/smoke.sh` |
| `WebsocketCommunicator` pour les tests | `srcs/backend/common/testing.py` |
| Helpers de diffusion (`broadcast`, `travel_group`) | `srcs/backend/common/realtime.py` |

Reste à décider et à construire : qui peut se connecter, quels événements existent, et comment React les consomme.

## Le modèle mental

Un WebSocket est une requête HTTP normale qui est « upgradée » en une connexion qui reste ouverte, ce qui permet au serveur d'envoyer des données sans qu'on les lui demande. Dans Channels, quatre termes comptent :

- **Consumer** : comme une vue, mais une instance vit pendant toute la connexion (`connect`, `receive`, `disconnect`).
- **Channel** : la boîte aux lettres privée d'une connexion (`self.channel_name`).
- **Groupe** : un ensemble nommé de channels, par exemple `travel_42`. Une connexion y est ajoutée au connect et retirée au disconnect.
- **Channel layer (Redis)** : le bus qui transporte un `group_send` vers chaque membre, même dans un autre processus.

Redis est nécessaire parce que la prod tournera avec `--workers 4` (voir la note dans `srcs/backend/Dockerfile`) : deux voyageurs du même voyage peuvent donc tomber sur des processus différents, qui ne partagent aucune mémoire.

```
Navigateur A ──POST /api/travels/42/ideas/──> vue DRF ── save ──> Postgres
                                                 │
                                      group_send("travel_42", {...})
                                                 │
                                               Redis
                                       ┌─────────┴─────────┐
                                consumer (A)         consumer (B)
                                       │                   │
                                 Navigateur A        Navigateur B
```

Deux règles qui piègent tout le monde :

- **Nommage des handlers** : un `group_send` avec `{"type": "idea.created", ...}` appelle la méthode `idea_created` sur chaque consumer du groupe (les points deviennent des underscores).
- **ORM en code async** : les consumers sont async et l'ORM est sync, donc chaque requête passe par `database_sync_to_async`. La validation de `Message` interroge la base, donc cela vaut aussi pour l'enregistrement d'un message.

## Auth et sécurité

- **Le login fonctionne tel quel.** L'app utilise des cookies de session et le socket est same-origin via nginx, donc `AuthMiddlewareStack` lit le cookie et remplit `self.scope["user"]`. Aucun token n'est nécessaire.
- **Le CSRF ne s'applique pas aux WebSockets.** La protection équivalente est `AllowedHostsOriginValidator`, déjà présent dans `config/asgi.py`. À conserver.
- **Rien ne rejette encore les utilisateurs anonymes.** `PingConsumer` accepte tout le monde. Un vrai consumer doit vérifier `is_authenticated` et que l'utilisateur a une participation `ACCEPTED` au voyage.
- **Utiliser la même règle que `IsTravelParticipant`, pas `is_travel_member`.** Ce dernier autorise aussi `LEFT`, ce qui est correct pour les anciens messages mais pas pour l'accès en direct.
- **La permission n'est vérifiée qu'à la connexion.** Si quelqu'un quitte un voyage ou en est retiré, son socket ouvert reste dans le groupe tant qu'il n'est pas expulsé par un événement de groupe qui fait fermer ce consumer.
- **Codes de fermeture** : fermer avant `accept()` ne montre au navigateur qu'un échec générique 1006. Pour dire au frontend « ne réessaie pas, tu n'as pas le droit », il faut accepter puis fermer avec un code personnalisé, par exemple 4401 (non connecté) ou 4403 (pas participant).

## Choix de conception

1. **Écrire via REST, diffuser via WebSocket.** Les idées, étapes, votes et messages du chat continuent de passer par les vues DRF, qui gèrent déjà la validation, les permissions et l'enveloppe d'erreur. Après l'enregistrement, la vue diffuse dans un `transaction.on_commit`. Le socket sert surtout du serveur vers le client ; les indicateurs de saisie sont le genre de chose qui irait du client vers le serveur.

2. **Un socket par voyage, avec des événements typés.** `ws/travels/<travel_id>/` rejoint `travel_<id>` et transporte `chat.message`, `idea.created`, `step.updated`, etc. Un groupe par utilisateur (`user_<id>`) viendra plus tard, quand les notifications et les amis devront atteindre quelqu'un en dehors d'une page de voyage.

3. **Une seule enveloppe d'événement, en camelCase.** Par exemple `{ "type": "idea.created", "payload": {...} }`. Les consumers ne passent pas par le renderer DRF, donc rien n'est converti en camelCase automatiquement. Construire les payloads avec les serializers existants et les passer à `broadcast` de `common.realtime`, qui les camelize (sinon le frontend recevrait du snake_case sur le socket et du camelCase sur REST) et n'envoie qu'après le commit :

   ```python
   from common.realtime import broadcast, travel_group

   broadcast(travel_group(idea.travel_id), "idea.created", IdeaSerializer(idea).data)
   ```

4. **La base de données fait foi ; le socket n'est qu'un signal.** Channels ne rejoue pas les messages manqués pendant une déconnexion. À chaque connexion ou reconnexion, le frontend recharge via REST puis applique les événements en direct. Les compteurs de non-lus restent dérivés de `Participation.last_read_at`.

5. **Frontend : `WebSocket` natif, sans librairie.**
   - Construire l'URL à partir de `location` (`ws:` ou `wss:` selon le protocole de la page, plus `/ws/...`) pour passer par nginx.
   - L'encapsuler dans un hook comme `useTravelSocket(travelId)` qui se reconnecte avec backoff et ferme le socket dans le cleanup du `useEffect`.
   - React StrictMode monte deux fois en dev, donc une séquence connexion, fermeture, connexion est normale.
   - Fermer le socket au logout.

## Points d'attention dans ce repo

- **Note prod de nginx** : le commentaire en haut de `srcs/nginx/nginx.conf` dit de supprimer « les deux lignes Upgrade/Connection » pour la prod. Ce n'est vrai que pour `location /` (rechargement à chaud de Vite). Celles de `location /ws/` doivent rester, sinon les WebSockets cassent en prod.
- **Tester des consumers authentifiés** : le `WebsocketCommunicator` de `common.testing` accepte un argument `scope` fusionné dans le scope. Tester le consumer directement (`TravelConsumer.as_asgi()`, sans passer par `config.asgi.application` dont le `URLRouter` remplit lui-même `url_route` et dont la pile d'auth résout l'utilisateur depuis la session) avec par exemple `scope={"user": traveler, "url_route": {"args": (), "kwargs": {"travel_id": travel.id}}}`. Pour tester toute la pile, passer un vrai cookie de session dans les headers.
- **HTTPS en prod** : une page HTTPS ne peut ouvrir que du `wss://`, d'où la nécessité de dériver l'URL du protocole de la page.

## Ce que demande le sujet

| Module | Exigence | Comment c'est couvert |
|---|---|---|
| Real-time features (majeur) | Mises à jour en temps réel entre clients | Diffusion sur le groupe du voyage |
| | Gérer proprement connexion et déconnexion | Reconnexion avec backoff, rechargement à la reconnexion, retrait du groupe |
| | Diffusion efficace des messages | Groupes via Redis, pas de boucle sur les utilisateurs |
| Collaborative features (mineur) | Espace partagé, édition en direct | Événements idées, étapes et votes sur le socket du voyage |
| Notification system (mineur) | Actions de création, modification et suppression | Groupe par utilisateur, plus tard |
| Multi-utilisateur (obligatoire) | Pas de race conditions | Écritures REST avec contraintes en base, diffusion après commit |

## Découpage en commits proposé

1. ~~Déplacer le communicator de test dans `common` et ajouter un helper de diffusion qui camelize l'enveloppe.~~ Fait.
2. Ajouter `TravelConsumer` avec les contrôles d'auth et de participation, l'entrée et la sortie du groupe, et les tests.
3. Ajouter les endpoints REST du chat (liste, envoi, marquer comme lu) avec la diffusion de `chat.message`.
4. Ajouter le hook frontend `useTravelSocket` et l'interface du chat.
5. Diffuser les événements idées, étapes et votes depuis les vues existantes, et les appliquer côté frontend.
6. Ajouter l'événement d'expulsion au départ d'un voyage, puis le socket de notifications par utilisateur.
7. Ajouter le catalogue des événements à ce fichier une fois les événements créés.
