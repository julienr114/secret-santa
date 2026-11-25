# 176 — Un événement « Autre » a son emoji partout

- **Dépend de** : rien
- **Migration** : non
- **Maquettes** : `V3FeteNouvelle` (la tuile « ✨ Autre »), `V3Accueil` (le rond d'un événement)

## Objectif

Julien, le 25 novembre 2026, en production : il crée un événement de la catégorie « Autre ». Sur l'accueil, le rond de l'événement a son fond violet, mais il est vide : pas d'emoji. Un événement « Autre » doit montrer ✨, comme sa tuile à la création.

## À lire d'abord

- `shared/utils/categories.ts` (`CATEGORY_DEFAULTS`, `partyEmoji`) et son test
- Les endroits qui écrivent déjà `?? '✨'` à la main : `app/pages/e/nouvelle.vue`, `app/pages/e/[slug]/reglages/index.vue`, `app/components/TakeFromEvents.vue`, `app/components/lists/ShareTake.vue`

## Ce qu'on sait

La catégorie « Autre » n'a pas d'emoji par défaut. Quelques écrans le remplacent par ✨ chacun de leur côté ; l'accueil ne le fait pas. La règle est donc écrite à quatre endroits et oubliée ailleurs.

## À faire

- [x] **Une seule règle, au même endroit** : l'emoji d'un événement est le sien s'il en a un, sinon celui de sa catégorie, et ✨ pour « Autre ». Les `?? '✨'` écrits à la main disparaissent.
- [x] **Partout où un événement a son rond** : l'accueil, la page de l'événement, ses réglages, « Rejoindre », les événements passés, les panneaux où l'on choisit un événement, les emails s'ils en montrent un. Les passer en revue, ne pas corriger seulement l'accueil.
- [x] Un test de la règle (un événement « Autre » sans emoji donne ✨), et un parcours : créer un événement « Autre », le voir sur l'accueil avec son emoji.

## Hors périmètre

- Laisser choisir un emoji à la création d'un événement « Autre ».

## C'est fini quand

- [x] Un événement « Autre » montre ✨ sur l'accueil et partout ailleurs.
- [x] `/controle` passe.

## Compte rendu

- **Une seule règle** : ✨ devient l'emoji de la catégorie « Autre » dans `CATEGORY_DEFAULTS` (`shared/utils/categories.ts`) ; `partyEmoji` (le sien, sinon celui de sa catégorie) rend donc toujours un emoji, et son type n'est plus nullable. Les quatre `?? '✨'` écrits à la main ont disparu (`e/nouvelle`, les réglages, `TakeFromEvents`, `ShareTake` passent par `partyEmoji` ou par la catégorie), ainsi que les `v-if`, `?? ''` et `!` qui gardaient l'emoji absent (`CreateSheet`, la page de l'événement, une année passée).
- **Passés en revue** : l'accueil (`PartyCard`), la page de l'événement, ses réglages, une année passée, « Rejoindre », les événements passés, « Quoi de neuf », les panneaux où l'on choisit un événement (`CreateSheet`, `TakeFromEvents`, `ShareTake`), la liste d'un événement (le rond de sa barre) et le partage d'une liste à des événements (`listSharing`). Les emails ne montrent pas l'emoji d'un événement (pas d'image dans les emails).
- **Décidé seul** : la liste qu'un tirage crée pour un événement « Autre » prend ✨ (l'emoji de l'événement, s'il est parmi ceux d'une liste) au lieu d'un emoji tiré au hasard : c'est la même règle que pour les autres catégories.
- **Tests** : `categories.test.ts` (« Autre » sans emoji donne ✨, ✨ ramène à « Autre ») ; parcours `tests/e2e/other-emoji.spec.ts` (créer un événement « Autre », voir ✨ sur sa page et sur l'accueil).
- **Écarts avec les maquettes** : aucun. **Questions** : aucune. **Migration** : aucune.
- **Contrôle** : `pnpm controle` passé ; la suite e2e complète a passé, sauf le nouveau parcours dans sa première écriture (il cherchait le caractère, l'emoji est une image) : corrigé, relancé seul, passé.
