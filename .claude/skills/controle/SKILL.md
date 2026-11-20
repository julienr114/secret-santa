---
name: controle
description: Les vérifications à passer avant de dire qu'un ticket est fini (lint, types, tests, trois langues, mots interdits, maquettes). À utiliser à la fin d'un ticket ou quand on demande si tout est bon.
---

# Contrôler avant de dire « fini »

Tout lancer, tout lire, ne rien conclure d'une commande qu'on n'a pas lancée. Si `scripts/controle.ts` existe (ticket 100), `pnpm controle` fait les points 1 à 4 d'un coup.

## 1. Le code

```
pnpm lint
pnpm typecheck
pnpm test
```

Puis, si le ticket touche un parcours :

```
pnpm test:e2e
```

Un test qui échoue pour une raison étrangère au ticket se dit dans le compte rendu : on ne le désactive pas.

## 2. Les trois langues

- Chaque clé ajoutée dans `shared/i18n/locales/fr` existe en `en` et en `de`, et inversement.
- Aucune clé orpheline : une clé qui ne sert plus est supprimée dans les trois langues.
- Aucun texte en dur dans `app/` ni dans les emails.

## 3. Les mots

Dans les textes affichés (les trois langues), vérifier ce que la spec interdit. La liste à jour est dans `docs/spec/v3/vocabulaire.md`. Tant qu'un ticket de la V3 n'a pas migré un écran, ses anciens mots y restent : ne contrôler que ce que le ticket a touché.

## 4. Les maquettes

Pour chaque maquette citée par le ticket :

- l'écran a la même structure, les mêmes textes, le même ordre des actions ;
- les tailles, les espacements et les couleurs passent par les jetons du design system ;
- tout écart voulu est noté dans `docs/refonte/ECARTS-MAQUETTES.md`.

## 5. Ce qui ne se rattrape pas

- Une migration : relue, appliquée en local (`pnpm db:migrate:local`), jamais à distance. Son nom et son ordre sont dans le compte rendu.
- Aucun résultat de tirage dans un journal, une réponse d'API ou un texte.
- Rien de poussé, rien de déployé.

## 6. Dire le résultat

Une ligne par point : passé, ou ce qui manque. Ne pas écrire « tout est bon » si une étape n'a pas été lancée.
