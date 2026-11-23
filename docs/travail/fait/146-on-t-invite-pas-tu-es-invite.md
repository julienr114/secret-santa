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

- [x] `auth.ts`, `invite.intro` : « On t'invite au Secret Santa ».
- [x] `adminEdition.ts`, le message prêt à envoyer : « Salut ! Je t'invite au Secret Santa « {group} » 🎁 » (« je » : c'est l'organisateur qui l'envoie, en son nom).
- [x] L'anglais et l'allemand ne changent pas, sauf s'ils disent autre chose que le français sur qui invite : dans ce cas, le message prêt à envoyer dit « je » dans les trois langues.
- [x] Les tests qui lisent ces deux textes.

## C'est fini quand

- [x] Plus aucun « Tu es invité » en français.
- [x] `/controle` passe.

## Compte rendu

- `auth.invite.intro` : « On t’invite au Secret Santa » ; le message prêt à envoyer : « Salut ! Je t’invite au Secret Santa « {group} » 🎁 ». Ce sont les textes des maquettes `V3FeteRejoindre`, `RejoindreConnecte` et `V3FeteInviter`.
- L'anglais (« You are invited ») et l'allemand (« Du bist … eingeladen ») ne changent pas : ils ne disent pas qui invite, donc rien de contraire au français.
- Tests mis à jour : `server/utils/invite.test.ts`, `tests/e2e/invite.spec.ts`. Plus aucun « Tu es invité » en français.
- Pas d'écart avec les maquettes, pas de question. Commit : `cec372d`.
