# 138 — V3 : la barre déroulée passe par-dessus la liste

- **Dépend de** : 135
- **Migration** : non
- **Maquettes** : `V3ListeQui`, `V3ListeQuiModifier`, `V3ListeQuiSecret`, `V3ListeQuiLien`, `V3ListeLienChanger`, `V3ListeQuiRetirer`, `V3ListeAideLien`

## Objectif

Retour de Julien, 22 novembre 2026, après avoir essayé le ticket 135 : quand la barre se déroule, elle fait descendre toute la liste. Elle doit venir par-dessus.

## À lire d'abord

- `docs/spec/v3/listes.md` (« La barre du haut d'une liste »)
- `app/components/lists/ShareBar.vue`

## À faire

- [x] **La barre déroulée flotte au-dessus de la liste** : la place de la barre repliée reste (une ligne), le reste se pose par-dessus la page, qui ne bouge pas. Une ombre plus marquée que repliée. Pas de voile.
- [x] **Toucher en dehors la replie**, sans rien changer, comme « Fermer » et Échap.
- [x] Elle reste collée en haut ; plus haute que l'écran, c'est son contenu qui défile (déjà fait au 135, à garder).
- [x] La liste dessous ne défile pas pendant qu'on fait défiler le contenu de la barre.
- [x] `tests/e2e` mis à jour.

## Hors périmètre

- Le contenu de la barre, qui ne change pas.

## C'est fini quand

- [x] Dérouler la barre ne déplace plus rien dans la liste.
- [x] Les sept maquettes sont reproduites (le contenu de la barre reste celui du 135 : voir les écarts).
- [x] `/controle` passe.

## Compte rendu

**Fait.**

- **La barre déroulée flotte** (`app/components/lists/ShareBar.vue`) : l'enveloppe collée garde la hauteur de la barre repliée, lue au moment où elle se déroule ; la carte se pose par-dessus (`absolute`), au-dessus de la page (`z-20`), la liste ne bouge pas. Une ombre nouvelle, `shadow-raised`, plus marquée que `shadow-card` (`app/assets/css/main.css`, notée au `README.md` section 23). Pas de voile.
- **Toucher en dehors la replie** et ne fait que cela : le `pointerdown` est pris avant la page, et le `click` qui suit est avalé ; si le doigt a fait défiler au lieu de cliquer, le toucher suivant n'est pas avalé. Le focus revient au bouton, comme avec « Fermer » et Échap.
- **Collée en haut, contenu qui défile** : gardé du 135 ; `overscroll-contain` empêche la liste dessous de défiler.
- **Tests** : Playwright `lists-share-bar.spec.ts`, « unrolled, the bar floats over the list; a touch outside folds it » (l'icône de la liste ne bouge pas, la barre garde la hauteur de sa ligne ; un toucher en dehors la replie sans ouvrir de fenêtre, rend le focus au bouton et laisse la liste en brouillon ; repliée, toucher l'icône l'ouvre) ; le test du 135 (dix événements sur un petit écran) passe toujours.

**Décidé seul, et pourquoi** : toucher en dehors n'agit pas sur ce qui était sous le doigt (la barre du haut et celle du bas comprises) ; le ticket dit « sans rien changer ». Noté dans `ECARTS-MAQUETTES.md`.

**Écarts avec les maquettes** : `docs/refonte/ECARTS-MAQUETTES.md`, « La barre déroulée passe par-dessus la liste (V3, ticket 138) » : le contenu de la barre reste celui du 135, les maquettes montrant déjà « Qui je veux » / « Tout le monde » (ticket 139).

**Questions posées** : aucune.

**Migration** : aucune.

**Contrôle** : `pnpm controle --e2e` passe en entier (trois langues, mots interdits, textes en dur, lint, typecheck, Vitest, Playwright 201 passés).

**Commits** : `faecc75` docs: ticket 138 started ; `87e1e31` feat(lists): the unrolled bar of a list floats over the list ; et celui qui range ce ticket.
