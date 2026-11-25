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

- [ ] **Une seule règle, au même endroit** : l'emoji d'un événement est le sien s'il en a un, sinon celui de sa catégorie, et ✨ pour « Autre ». Les `?? '✨'` écrits à la main disparaissent.
- [ ] **Partout où un événement a son rond** : l'accueil, la page de l'événement, ses réglages, « Rejoindre », les événements passés, les panneaux où l'on choisit un événement, les emails s'ils en montrent un. Les passer en revue, ne pas corriger seulement l'accueil.
- [ ] Un test de la règle (un événement « Autre » sans emoji donne ✨), et un parcours : créer un événement « Autre », le voir sur l'accueil avec son emoji.

## Hors périmètre

- Laisser choisir un emoji à la création d'un événement « Autre ».

## C'est fini quand

- [ ] Un événement « Autre » montre ✨ sur l'accueil et partout ailleurs.
- [ ] `/controle` passe.

## Compte rendu

À remplir par Claude Code à la fin : ce qui a été fait, ce qui a été décidé seul (et pourquoi), les écarts avec les maquettes, les questions posées, les commits.
