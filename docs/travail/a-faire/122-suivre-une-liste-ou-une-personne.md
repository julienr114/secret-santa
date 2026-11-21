# 122 — Suivre une liste, ou une personne

- **Dépend de** : 106, 120, 121
- **Migration** : oui (ce qu'un compte suit)
- **Maquettes** : `ListeSuivre`

## Objectif

Sur une liste qui n'est pas la mienne, je peux demander à être prévenu des nouvelles idées : pour toute la liste, ou pour une seule personne (« Suivre Léo »).

## À lire d'abord

- `README.md`, section 22.22
- `docs/spec/v3/listes.md` (qui peut ouvrir une liste)
- L'archive `docs/refonte/PLAN.md`, section 6, « Lot 29 bis » (les points relus avec Julien le 19 novembre 2026)

## À faire

- [ ] **Le cœur, en fonctions pures**, testé d'abord : qui suit quoi (une liste entière, ou des personnes d'une liste) ; pour une idée ajoutée ou une personne ajoutée, quels comptes prévenir ; jamais ceux qui tiennent la liste, jamais une liste passée, **jamais quelqu'un qui n'a plus le droit de l'ouvrir** (le partage a été resserré, il a quitté l'événement).
- [ ] **Base** : ce qu'un compte suit (la liste, et la personne de la liste ou rien pour toute la liste).
- [ ] **La cloche** au bout du nom de chaque personne, sur toute liste que je peux ouvrir sans la tenir (par un événement ou par son lien) : `aria-pressed`, « Suivre Léo » ou « Ne plus suivre Léo », zone de 44 px. La ligne d'état sous le mot de la liste, avec « Suivre toute la liste » ou « Ne plus suivre ».
- [ ] **Sans compte**, sur une liste publique : la cloche mène à la connexion, puis le suivi est posé au retour.
- [ ] **Les nouveautés** (ticket 120) : « de nouvelles idées » n'est à prévenir hors de l'application que pour ceux qui suivent ; les points rouges restent pour toute liste que je peux ouvrir. Regroupement par personne et par jour.
- [ ] **« Me prévenir »** : la liste de ce que je suis, avec « Ne plus suivre ». Le lien d'arrêt dans le résumé et dans l'email immédiat.
- [ ] Trois langues, `tests/e2e`.

## Hors périmètre

- Suivre un événement entier, ou quelqu'un à travers toutes ses listes.

## C'est fini quand

- [ ] Suivre Léo me prévient d'une idée ajoutée pour Léo, pas d'une idée pour Zoé.
- [ ] Celui qui a perdu l'accès à la liste n'est plus prévenu (un test le vérifie).
- [ ] La maquette est reproduite.
- [ ] `/controle` passe.

## Compte rendu

À remplir par Claude Code à la fin : ce qui a été fait, ce qui a été décidé seul (et pourquoi), les écarts avec les maquettes, les questions posées, les commits.
