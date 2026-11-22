# 116 — V3 : le lien d'invitation est celui d'un Secret Santa

- **Dépend de** : 104, 105
- **Migration** : oui (le lien passe de l'événement au Secret Santa)
- **Maquettes** : `V3FeteInviter`, `V3FeteRejoindre`, `RejoindreConnecte`, `RejoindreFait`, `RejoindreFerme`, `V3FeteOrganisateur`, `V3FeteAnniversaire`, `V3FeteReglages`, `V3TirageReglages`, `PreparerVide`, `AjouterParticipants`, `PanneauNombre`, `PanneauDate`

## Objectif

On n'invite plus dans un événement : on invite à un Secret Santa. Celui qui ouvre le lien s'inscrit à ce Secret Santa, et devient du coup membre de son événement. Avec deux Secret Santa la même année, chacun a son lien, et personne ne se retrouve dans le mauvais.

## À lire d'abord

- `docs/decisions/2026-11-21-le-lien-d-invitation-est-celui-d-un-secret-santa.md`
- `docs/spec/v3/secret-santa.md` (« Inviter par lien », « Ses réglages »)
- `docs/spec/v3/fete.md` (« La page d'un événement », « Les membres », « Inviter, rejoindre »)
- `docs/spec/v3/migration.md` (« Les liens déjà envoyés »)
- `docs/travail/questions.md` (Q-017, dans « Réponses »)

## À faire

- [x] **Base** : le lien d'invitation, avec ses places, sa date limite et son mot, appartient à un Secret Santa. La migration donne le lien de chaque événement à son Secret Santa en préparation ; sans Secret Santa en préparation, le lien est fermé.
- [x] **S'inscrire** par le lien : participant de ce Secret Santa, et membre de son événement s'il ne l'était pas. Un membre qui s'inscrit ne prend pas de place dans l'événement.
- [x] **La page « Inviter par lien »** passe sous le Secret Santa (`V3FeteInviter`) : « Famille Camille · Secret Santa 2026 » au-dessus du titre, la phrase, le message à partager, les réglages du lien. Elle s'ouvre depuis le Secret Santa en préparation (`PreparerVide`, `AjouterParticipants`).
- [x] **La page du lien** (`V3FeteRejoindre`, `RejoindreConnecte`) : « Tu es invité au Secret Santa », le nombre d'inscrits, « Participer ». Le nom du Secret Santa entre parenthèses s'il y en a plusieurs la même année.
- [x] **Après le tirage** : le lien est fermé, « Le tirage a déjà eu lieu » · « Préviens l'organisateur de … » (la page de `RejoindreFerme`).
- [x] À 30 membres, les liens des Secret Santa de l'événement se mettent en pause.
- [x] **La page d'un événement** (`V3FeteOrganisateur`, `V3FeteAnniversaire`) : la ligne des membres ne dit plus « Inviter ».
- [x] **Les réglages** : « Quelqu'un s'inscrit par le lien » quitte ceux de l'événement (`V3FeteReglages`, qui perd sa section « M'écrire par email ») pour ceux du Secret Santa (`V3TirageReglages`). Le choix déjà fait par l'organisateur est gardé.
- [x] L'ancienne adresse `/e/[événement]/invitation` mène à « Membres » (`docs/spec/v3/navigation.md`). Les liens `/rejoindre/[code]` déjà envoyés marchent toujours.
- [x] **La nouveauté des organisateurs** (nature `joined`, ticket 120) suit : « Hugo s'est inscrit par le lien », rangée sous l'événement, avec le nom du Secret Santa s'il y en a plusieurs. Elle ne dit plus « a rejoint l'événement ».
- [x] Trois langues. `docs/refonte/ECARTS-MAQUETTES.md` et `docs/ARBORESCENCE.md` à jour.

## Hors périmètre

- La page « Membres », l'entrée par une liste et la fin de « Ajouter une personne » : ticket 117.
- Le lien d'une liste (ticket 106).

## C'est fini quand

- [ ] Avec deux Secret Santa en préparation, s'inscrire par le lien de l'un ne m'ajoute pas à l'autre (un test le vérifie).
- [ ] Après la migration, chaque lien déjà envoyé d'un événement qui prépare un Secret Santa inscrit toujours à ce Secret Santa (un test sur des données d'essai).
- [ ] Un lien ouvert après le tirage n'inscrit personne.
- [ ] Les maquettes du ticket sont reproduites.
- [ ] `/controle` passe.

## Compte rendu

À remplir par Claude Code à la fin : ce qui a été fait, ce qui a été décidé seul (et pourquoi), les écarts avec les maquettes, les questions posées, les commits.
