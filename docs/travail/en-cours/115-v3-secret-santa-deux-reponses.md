# 115 — V3 : le Secret Santa, deux réponses (Q-015 et Q-016)

- **Dépend de** : 105
- **Migration** : non
- **Maquettes** : `V3TirageReglages`, `V3TirageNouveau`, `DevineStory7`

## Objectif

Le nom, la date, le budget et le petit mot d'un Secret Santa se changent en tête de ses réglages. Hors de Noël, le palmarès ne souhaite plus « Joyeux Noël ».

## À lire d'abord

- `docs/travail/questions.md` (Q-015, Q-016, dans « Réponses »)
- `docs/spec/v3/secret-santa.md` (« Ses réglages »)
- `docs/spec/v3/vocabulaire.md` (« Devine qui hors de Noël »)

## À faire

- [x] **Les réglages** (`V3TirageReglages`) : la section « Le Secret Santa » en premier, avec « Nom », « Date », « Budget », « Petit mot pour les participants » ; plus de section « La fête » en bas. La ligne du formulaire de création s'appelle « Date ».
- [x] **Le palmarès** (`DevineStory7`) : hors d'un événement de catégorie Noël, « Merci d'avoir joué, Inès » et « Merci à tous ! » ; « C'est tout » au lieu de « C'est tout pour cette année » dans un événement qui ne revient pas. Dans les trois langues, écrit pour de bon.
- [ ] **« Liste de cadeaux », en toutes lettres** (Julien, 22 novembre 2026 ; `docs/spec/v3/vocabulaire.md`) : « Une liste de cadeaux » dans « Créer » ; « Ma liste de cadeaux » pour le titre de la ligne d'une liste que je tiens, et son texte commence par « Pour » (« Pour Léo, Zoé et moi », « Pour Léo »). Maquettes : `V3AccueilPlusOuvert`, `V3Accueil`, `V3Fete`. Dans les trois langues ; les tests de `lignes.md` suivent.
- [x] Retirer de `docs/refonte/ECARTS-MAQUETTES.md` la ligne de `V3TirageReglages` que ce ticket remet d'accord.

## Hors périmètre

- « Pistes de cadeaux » dans les réglages : il part au ticket 107.
- Le lien d'invitation et « Quelqu'un s'inscrit par le lien » dans les réglages : ticket 116.

## C'est fini quand

- [ ] Sur l'accueil, la ligne d'une liste que je tiens pour Léo dit « Ma liste de cadeaux » et « Pour Léo ».
- [ ] Aucun texte du palmarès ne dit « Noël » dans un événement d'une autre catégorie (un test le vérifie).
- [ ] La maquette `V3TirageReglages` est reproduite.
- [ ] `/controle` passe.

## Compte rendu

À remplir par Claude Code à la fin : ce qui a été fait, ce qui a été décidé seul (et pourquoi), les écarts avec les maquettes, les questions posées, les commits.
