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

- [x] **Un seul composant pour la tuile d'un événement** (ou celui qui existe, s'il y en a un) : l'emoji de l'événement, le dégradé de sa catégorie (150°, du clair au soutenu), un liseré blanc, une ombre légère, des coins arrondis. Trois tailles : 44 px (carte de l'accueil, en-tête de la page d'un événement), 30 px (« Quoi de neuf », « Les événements passés »), 28 px (barre du partage, pastilles).
- [x] Les six dégradés sont des couleurs du thème (`@theme`), pas des valeurs dans les composants.
- [x] **La couleur vient de la catégorie**, pas de l'emoji : un événement dont l'icône a été choisie à la main garde le dégradé de sa catégorie.
- [x] **Les lignes sous un événement** (Secret Santa, liste, « Devine qui ») : l'icône au trait seule, sans rond ni carré coloré, à la même place et à la même largeur qu'avant (le texte ne bouge pas).
- [x] « Créer » et l'accueil d'un compte tout neuf : rien ne change (leurs icônes gardent le carré teinté).
- [x] La tuile est décorative (`aria-hidden`) : le nom de l'événement est à côté.

## Hors périmètre

- Les icônes des personnes (les avatars).
- Le choix de l'icône d'un événement.

## C'est fini quand

- [x] Partout où un événement est montré avec son icône, c'est la tuile en couleur, de la bonne taille.
- [x] Aucune ligne de Secret Santa, de liste ou de jeu n'a de fond coloré derrière son icône sous un événement.
- [x] `/controle` passe.

## Compte rendu

**Fait.**

- **`UiEventTile`** (`app/components/ui/EventTile.vue`) : l'emoji dans une tuile carrée, le dégradé de la catégorie à 150°, du clair au soutenu (115 %, comme les maquettes), un liseré blanc et une ombre (`shadow-tile`, `shadow-tile-sm` sous 32 px), `aria-hidden`. Les six dégradés sont des couleurs du thème (`--color-tile-<catégorie>-from/to`, `main.css`, notées au `README.md` section 23). La couleur vient de la catégorie, jamais de l'emoji.
- **Où** : la carte d'un événement sur l'accueil (44 px) ; « Bientôt » (32 px, dégradé « Anniversaire ») ; « Quoi de neuf » (30 px) ; « Les événements passés » (36 px, comme la maquette) ; les lignes d'événements de la barre du partage (28 px).
- **Les lignes sous un événement** (accueil, page d'un événement, année passée) : `UiListItem` gagne `bare-icon`, l'icône au trait seule dans sa couleur, à la même place et à la même largeur (le texte ne bouge pas).
- « Créer » et l'accueil d'un compte tout neuf ne changent pas.

**Décidé seul, et pourquoi** (`ECARTS-MAQUETTES.md`, section du ticket 143) : 36 px dans « Les événements passés » et 32 px dans « Bientôt » d'après les maquettes (la spec dit 30 px pour les passés) ; l'en-tête de la page d'un événement garde sa pastille de catégorie, `V3Fete` n'y ayant pas de tuile ; la section d'une liste hors de mes événements prend la tuile « Autre ».

**Questions posées** : aucune.

**Migration** : aucune.

**Contrôle** : `pnpm controle --e2e` passe en entier (992 tests Vitest, 204 tests Playwright). Vérifié à l'écran : l'accueil et la barre du partage.

**Commits** : `docs: ticket 143 started` ; `e7e2536` feat(home): the icon of an event is a tile in colour ; et celui qui range ce ticket.
