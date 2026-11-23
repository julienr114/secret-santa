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

- [ ] Dérouler la barre ne déplace plus rien dans la liste.
- [ ] Les sept maquettes sont reproduites.
- [ ] `/controle` passe.

## Compte rendu

À remplir par Claude Code à la fin : ce qui a été fait, ce qui a été décidé seul (et pourquoi), les écarts avec les maquettes, les questions posées, les commits.
