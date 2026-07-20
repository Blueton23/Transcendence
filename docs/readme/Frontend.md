# Frontend — design system & structure

## Design system

Le design system vit dans `shared/ui/` : composants de base réutilisables partout dans l'app (boutons, inputs, cards, badges...).

Avant de créer un nouveau composant custom dans une feature, vérifier s'il existe déjà dans `shared/ui/` — objectif : une seule source de vérité pour les boutons, couleurs, textes, etc.

Composants disponibles actuellement : `Avatar`, `Badge`, `Button`, `Card`, `Chip`, `Divider`, `Heading`, `Icon`, `IconButton`, `Input`, `Tag`, `Text`.

Une page `/demo` (`pages/Demo.tsx`) affiche tous les composants avec leurs variantes — à consulter avant de coder une nouvelle UI.

| Page | URL |
|---|---|
| Démo du design system | `http://localhost:8080/demo` |

## Structure proposée

```
src/
├── features/        # code organisé par domaine métier (voyage, chat, depense, idee...)
│   └── <feature>/
│       ├── components/
│       ├── hooks/
│       └── types.ts
├── pages/            # pages/routes de l'app
├── shared/
│   ├── ui/           # composants du design system (boutons, cards...)
│   ├── api/          # appels API génériques (fetch, config axios/fetch...)
│   ├── hooks/         # hooks réutilisables entre plusieurs features
│   └── types/         # types TS partagés entre plusieurs features
├── App.tsx
└── main.tsx
```

**Règle simple** : si un hook/type/composant est utilisé par une seule feature → il reste dans `features/<feature>/`. S'il est utilisé par plusieurs features → il monte dans `shared/`.