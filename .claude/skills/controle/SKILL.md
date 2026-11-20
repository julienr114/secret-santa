---
name: controle
description: Les vérifications à passer avant de dire qu'un ticket est fini (lint, types, tests, trois langues, mots interdits, maquettes). À utiliser à la fin d'un ticket ou quand on demande si tout est bon.
---

# Contrôler avant de dire « fini »

Tout lancer, tout lire, ne rien conclure d'une commande qu'on n'a pas lancée.

## 1. Le script

```
pnpm controle          si le ticket ne touche aucun parcours
pnpm controle --e2e    si le ticket touche un parcours
```

Il s'arrête au premier échec, avec ce qui manque. Dans l'ordre :

1. **Les trois langues** : toute clé de `shared/i18n/locales` existe en `fr`, `en` et `de` ; les clés manquantes sont listées.
2. **Les mots interdits** : aucun texte des trois langues ne dit un mot de `scripts/controle.mots.json` (au début d'un mot, sans tenir compte de la casse : « groupe » trouve « Groupes »).
3. **Les textes en dur** : aucun texte visible écrit dans un gabarit de `app/` (texte entre deux balises, ou valeur fixe de `label`, `placeholder`, `title`, `aria-label`, `alt`, `description`). Les exceptions sont dans `scripts/controle.exceptions.json`.
4. `pnpm lint`, `pnpm typecheck`, `pnpm test`, puis `pnpm test:e2e` avec `--e2e`.

Un test qui échoue pour une raison étrangère au ticket se dit dans le compte rendu : on ne le désactive pas. Une exception ne s'ajoute que pour un texte qui n'est pas à traduire (une marque, un exemple d'adresse), jamais pour aller plus vite.

## 2. Les mots

Quand un ticket de la V3 fait disparaître un mot des écrans (la liste est dans `docs/spec/v3/vocabulaire.md`), il l'ajoute à `scripts/controle.mots.json`, dans les trois langues (« groupe », « group », « Gruppe »), pour qu'il ne revienne pas. Tant qu'un écran n'a pas été migré, ses anciens mots restent : on n'ajoute un mot que quand plus aucun texte ne le dit.

## 3. Ce que le script ne voit pas

- **Les clés orphelines** : une clé qui ne sert plus est supprimée dans les trois langues.
- **Les textes en dur hors des gabarits** : dans le `<script>` d'un composant, dans `app/**/*.ts`, dans les emails du serveur.
- **Les mots interdits hors des dictionnaires**, et « tirage » employé pour la chose plutôt que pour le geste.

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
