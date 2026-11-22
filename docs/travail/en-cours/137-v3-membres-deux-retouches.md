# 137 — V3 : « Membres », deux retouches

- **Dépend de** : 117
- **Migration** : non
- **Maquettes** : `V3FeteMembres`, `V3FeteMembresComplet`

## Objectif

Deux réponses arrivées après le ticket 117 (Q-029 et Q-031).

## À lire d'abord

- `docs/spec/v3/fete.md` (« Les membres »)
- `docs/travail/questions.md` (Q-029 et Q-031, dans « Réponses »)

## À faire

- [x] **« Organise »** : dans « Membres », la ligne d'un organisateur commence par « Organise » (« Organise · Secret Santa · ne tire pas Hugo », ou « Organise » seul pour celui qui n'est entré ni par un Secret Santa ni par une liste). Trois langues, sans accord de genre.
- [x] **Pour un membre qui n’organise pas**, la ligne des membres de la page de l'événement dit combien ils sont et n'est pas un lien : pas de chevron, rien de touchable.
- [x] `tests/e2e`.

## Hors périmètre

- Ouvrir « Membres » aux membres (une idée pour plus tard).
- La règle elle-même : un organisateur ajouté reste membre, rien à changer.

## C'est fini quand

- [ ] Un organisateur ajouté depuis les réglages se lit « Organise » dans « Membres ».
- [ ] Un membre ne peut pas toucher la ligne des membres.
- [ ] `/controle` passe.

## Compte rendu

À remplir par Claude Code à la fin : ce qui a été fait, ce qui a été décidé seul (et pourquoi), les écarts avec les maquettes, les questions posées, les commits.
