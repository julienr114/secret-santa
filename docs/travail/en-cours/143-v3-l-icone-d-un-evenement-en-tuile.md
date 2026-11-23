# 143 — V3 : l'icône d'un événement est une tuile en couleur

- **Dépend de** : 112
- **Avant** : la bascule (ticket 113)
- **Migration** : non
- **Maquettes** : `V3Accueil`, `V3AccueilPlusOuvert`, `V3Fete`, `V3QuoiDeNeuf`, `V3FetesPassees`, `V3ListeQuiModifier` (les lignes d'événements de la barre du partage), `V3AccueilVide` (« Créer » ne change pas)

## Objectif

Julien, le 23 novembre 2026 : les icônes des événements sont fades, elles devraient passer devant celles des Secret Santa et des listes qui sont dessous. L'icône d'un événement devient une tuile en couleur ; les icônes des lignes dessous perdent leur fond.

## À lire d'abord

- `docs/spec/v3/categories.md` (« L'icône d'un événement est une tuile en couleur » : les tailles, les six dégradés)
- les maquettes ci-dessus, dans `docs/refonte/maquettes-sorbet/`

## À faire

- [ ] **Un seul composant pour la tuile d'un événement** (ou celui qui existe, s'il y en a un) : l'emoji de l'événement, le dégradé de sa catégorie (150°, du clair au soutenu), un liseré blanc, une ombre légère, des coins arrondis. Trois tailles : 44 px (carte de l'accueil, en-tête de la page d'un événement), 30 px (« Quoi de neuf », « Les événements passés »), 28 px (barre du partage, pastilles).
- [ ] Les six dégradés sont des couleurs du thème (`@theme`), pas des valeurs dans les composants.
- [ ] **La couleur vient de la catégorie**, pas de l'emoji : un événement dont l'icône a été choisie à la main garde le dégradé de sa catégorie.
- [ ] **Les lignes sous un événement** (Secret Santa, liste, « Devine qui ») : l'icône au trait seule, sans rond ni carré coloré, à la même place et à la même largeur qu'avant (le texte ne bouge pas).
- [ ] « Créer » et l'accueil d'un compte tout neuf : rien ne change (leurs icônes gardent le carré teinté).
- [ ] La tuile est décorative (`aria-hidden`) : le nom de l'événement est à côté.

## Hors périmètre

- Les icônes des personnes (les avatars).
- Le choix de l'icône d'un événement.

## C'est fini quand

- [ ] Partout où un événement est montré avec son icône, c'est la tuile en couleur, de la bonne taille.
- [ ] Aucune ligne de Secret Santa, de liste ou de jeu n'a de fond coloré derrière son icône sous un événement.
- [ ] `/controle` passe.

## Compte rendu

À remplir par Claude Code à la fin : ce qui a été fait, ce qui a été décidé seul (et pourquoi), les écarts avec les maquettes, les questions posées, les commits.
