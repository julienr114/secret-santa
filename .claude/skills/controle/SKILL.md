---
name: controle
description: Les vérifications à passer avant de dire qu'un ticket est fini (lint, types, tests, trois langues, mots interdits, maquettes). À utiliser à la fin d'un ticket ou quand on demande si tout est bon.
---

# Contrôler avant de dire « fini »

Tout lancer, tout lire, ne rien conclure d'une commande qu'on n'a pas lancée.

## 1. Le script, et quand le lancer

**Pendant le ticket : la variante rapide**, avec les parcours que le ticket touche.

```
pnpm controle --vite                                   sans parcours
pnpm controle --vite tests/e2e/lists-*.spec.ts         avec les parcours concernés
```

Elle fait les textes, le lint et les types, puis **seulement les tests unitaires liés aux fichiers changés depuis `main`** (commités ou non, `vitest related`), et **seulement les fichiers de parcours nommés**.

**Choisir les parcours concernés** : ceux qui passent par les pages et les composants touchés. Le nom du fichier le dit le plus souvent (`lists-*` pour une liste, `admin-edition`, `edition-cases` pour un Secret Santa, `home`, `party`, `members-*`…) ; sinon, chercher dans `tests/e2e/` le `data-testid` ou le texte de l'écran touché. **Un doute se règle en lançant tout.**

**Avant de dire « fini » : la suite entière, une fois.**

```
pnpm controle --e2e
```

Tous les parcours, sur plusieurs serveurs en parallèle (`scripts/e2e.ts`) : l'application est construite une fois (pas du tout si rien n'a changé hors de `tests/` et `docs/` depuis la dernière), puis `E2E_SERVERS` serveurs (3 par défaut) se partagent les fichiers, chacun avec sa base jetable (`.wrangler/e2e-<port>`). Un fichier n'est jamais coupé entre deux serveurs. Chaque étape dit son temps.

`pnpm test:e2e` tout court lance un seul serveur : c'est l'outil pour déboguer un fichier (`pnpm test:e2e tests/e2e/home.spec.ts`).

**Le compte rendu d'un ticket dit ce qui a été lancé, et que la suite entière est passée.** Un test qui échoue en parallèle et passe seul est un vrai défaut (d'isolement, ou de l'application sous la charge) : il se corrige, il ne se met pas de côté.

Le script s'arrête au premier échec, avec ce qui manque. Dans l'ordre :

1. **Les trois langues** : toute clé de `shared/i18n/locales` existe en `fr`, `en` et `de` ; les clés manquantes sont listées.
2. **Les mots interdits** : aucun texte des trois langues ne dit un mot de `scripts/controle.mots.json` (au début d'un mot, sans tenir compte de la casse : « groupe » trouve « Groupes »).
3. **Les textes en dur** : aucun texte visible écrit dans un gabarit de `app/` (texte entre deux balises, ou valeur fixe de `label`, `placeholder`, `title`, `aria-label`, `alt`, `description`). Les exceptions sont dans `scripts/controle.exceptions.json`.
4. `pnpm lint` (avec son cache), `pnpm typecheck`, `pnpm test` (ou les tests liés avec `--vite`), puis les parcours.

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
