# 146 — « On t'invite », pas « Tu es invité »

- **Dépend de** : 145
- **Avant** : la bascule (ticket 113)
- **Migration** : non
- **Maquettes** : `V3FeteRejoindre`, `RejoindreConnecte`, `V3FeteInviter` (le texte seulement)

## Objectif

Q-036 : deux textes français parlent au lecteur au masculin. Ils se tournent sans participe.

## À lire d'abord

- `docs/spec/v3/vocabulaire.md` (« Cette personne », pas « il » : le second tableau)
- `docs/spec/v3/secret-santa.md` (le message à partager, la page du lien)

## À faire

- [ ] `auth.ts`, `invite.intro` : « On t'invite au Secret Santa ».
- [ ] `adminEdition.ts`, le message prêt à envoyer : « Salut ! Je t'invite au Secret Santa « {group} » 🎁 » (« je » : c'est l'organisateur qui l'envoie, en son nom).
- [ ] L'anglais et l'allemand ne changent pas, sauf s'ils disent autre chose que le français sur qui invite : dans ce cas, le message prêt à envoyer dit « je » dans les trois langues.
- [ ] Les tests qui lisent ces deux textes.

## C'est fini quand

- [ ] Plus aucun « Tu es invité » en français.
- [ ] `/controle` passe.

## Compte rendu

À remplir par Claude Code à la fin : ce qui a été fait, ce qui a été décidé seul (et pourquoi), les écarts avec les maquettes, les questions posées, les commits.
