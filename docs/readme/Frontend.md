# Frontend — design system & structure

## Structure

```
src/
├── features/         # code organisé par domaine métier
│   └── <feature>/
│       ├── components/
│       ├── api/
│       ├── hooks/
│       └── types.ts
├── pages/            # pages/routes de l'app
├── shared/
│   ├── ui/           # composants du design system
│   ├── api/          # appels API génériques
│   ├── hooks/        # hooks réutilisables entre plusieurs features
│   └── types/        # types TS partagés entre plusieurs features
├── App.tsx
└── main.tsx
```
## Design system

Le design system vit dans `shared/ui/` : composants de base réutilisables partout dans l'app (boutons, inputs, cards, badges…).

Avant de créer un nouveau composant custom dans une feature, vérifier s'il existe déjà dans `shared/ui/` — objectif : une seule source de vérité pour les boutons, couleurs, textes, etc.

Composants disponibles actuellement : Avatar, Badge, Button, Card, Chip, Divider, Heading, Icon, IconButton, Input, Tag, Text.

Une page `/demo` (`pages/Demo.tsx`) affiche tous les composants avec leurs variantes — à consulter avant de coder une nouvelle UI.

| Page | URL |
|---|---|
| Démo du design system | http://localhost:8080/demo |

## Features

| Dossier | Contient |
|---|---|
| `auth/` | Connexion, inscription, session |
| `travel/` | Mes voyages, créer/rejoindre un voyage, gérer les voyageurs, changer les dates |
| `step/` | Itinéraire, ajouter/modifier une étape, détail d'étape |
| `idea/` | Épingler une idée, onglet Idées |
| `profile/` | Profil, modifier le profil, amis |
| `map/` | Recherche de lieu, géocodage, affichage carte |
| `notifications/` | Centre de notifications |
| `spending/` | Dépenses (etape + idee par personne) |
| `chat/` | Fil de discussion du voyage |
| `assistant/` | Assistant IA |

## Features vs Shared

**Règle simple** : si le code a une signification en dehors du domaine métier de l'application, sans modification, il relève de shared/. S'il dépend de structures ou de règles propres à notre modèle de données, il reste dans sa feature, indépendamment du nombre d'endroits où il est utilisé.

**`components/`** : les composants React propres à cette feature, ceux qui ne servent qu'ici et n'ont pas leur place dans le design system.

**`api/`** : les appels réseau vers le backend pour cette feature : une fonction par endpoint (GET, POST, DELETE,...). Ces fonctions ne peuvent réellement fonctionner qu'une fois les routes correspondantes disponibles côté Django.

**`hooks/`** : de la logique réutilisable, sans affichage : une fonction React préfixée par `use` qui renvoie des données et des fonctions, le composant s'occupe du rendu. Voir [Typer les hooks](https://react.dev/learn/typescript#example-hooks).

**`types.ts`** : la forme des données de la feature : ce que l'API renvoie, ce qu'on lui envoie, et les types partagés par plusieurs composants. Les props d'un seul composant restent dans son fichier.

## `pages/`

Un fichier par écran routé. Une page ne contient pas de logique métier : elle assemble des composants venus de `features/` et `shared/`, et gère la mise en page générale de l'écran.

Nommage : PascalCase avec le suffixe `Page` — `ItinerairePage.tsx`, `ProfilPage.tsx`, `ConnexionPage.tsx`. 

## Conventions

- **Dossiers de features** : minuscules, singulier, anglais (`step`, pas `Steps`)
- **Composants** : PascalCase, décrit ce que ça affiche (`StepCard.tsx`, pas `ItineraireCard.tsx`)
- **Extension** : `.tsx` si le fichier contient du JSX, `.ts` sinon
- **Champs de données** : camelCase côté frontend (`firstName`), même si Django utilise une autre casse, le nom change en traversant l'API

## Ressources

- [Thinking in React](https://react.dev/learn/thinking-in-react) : comment découper une maquette en composants. À lire avant de traduire un écran de la maquette en code.
- [Typer les hooks](https://react.dev/learn/typescript#example-hooks): ce que c'est et comment ça marche
- [TypeScript avec React](https://react.dev/learn/typescript) : bon site d'apprentissage général, doc officielle React
- [Everyday Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html) : bon site de référence pour les bases de TypeScript
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/) : bon site d'apprentissage général, communautaire
- [Tailwind CSS](https://tailwindcss.com/docs) : la référence des classes utilitaires