# 115 — V3 : le Secret Santa, trois réponses (Q-015 à Q-017)

- **Dépend de** : 105
- **Migration** : non
- **Maquettes** : `V3TirageReglages`, `V3TirageNouveau`, `DevineStory7`, `RejoindreFait`

## Objectif

Le nom, la date, le budget et le petit mot d'un Secret Santa se changent en tête de ses réglages. Hors de Noël, le palmarès ne souhaite plus « Joyeux Noël ». Et celui qui rejoint un événement où plusieurs Secret Santa se préparent n'est mis dans aucun sans que l'organisateur l'ait choisi.

## À lire d'abord

- `docs/travail/questions.md` (Q-015, Q-016, Q-017, dans « Réponses »)
- `docs/spec/v3/secret-santa.md` (« Ses réglages »)
- `docs/spec/v3/vocabulaire.md` (« Devine qui hors de Noël »)
- `docs/spec/v3/fete.md` (« Inviter, rejoindre »)
- `docs/decisions/2026-11-21-rejoindre-avec-plusieurs-secret-santa.md`

## À faire

- [ ] **Les réglages** (`V3TirageReglages`) : la section « Le Secret Santa » en premier, avec « Nom », « Date », « Budget », « Petit mot pour les participants » ; plus de section « La fête » en bas. La ligne du formulaire de création s'appelle « Date ».
- [ ] **Le palmarès** (`DevineStory7`) : hors d'un événement de catégorie Noël, « Merci d'avoir joué, Inès » et « Merci à tous ! » ; « C'est tout » au lieu de « C'est tout pour cette année » dans un événement qui ne revient pas. Dans les trois langues, écrit pour de bon.
- [ ] **Rejoindre** : un seul Secret Santa en préparation cette année, on le rejoint ; plusieurs, aucun. La page d'arrivée (`RejoindreFait`) dit alors « Ton organisateur te dira à quel Secret Santa tu participes. », sans « Voir mon tirage » ; le message qui prévient l'organisateur finit par « À ajouter à un Secret Santa. »
- [ ] Retirer de `docs/refonte/ECARTS-MAQUETTES.md` la ligne de `V3TirageReglages` que ce ticket remet d'accord.

## Hors périmètre

- « Pistes de cadeaux » dans les réglages : il part au ticket 107.
- Laisser celui qui s'inscrit choisir son Secret Santa.

## C'est fini quand

- [ ] Avec deux Secret Santa en préparation, une inscription par le lien n'ajoute de participant à aucun (un test le vérifie) ; avec un seul, elle l'ajoute.
- [ ] Aucun texte du palmarès ne dit « Noël » dans un événement d'une autre catégorie (un test le vérifie).
- [ ] La maquette `V3TirageReglages` est reproduite.
- [ ] `/controle` passe.

## Compte rendu

À remplir par Claude Code à la fin : ce qui a été fait, ce qui a été décidé seul (et pourquoi), les écarts avec les maquettes, les questions posées, les commits.
