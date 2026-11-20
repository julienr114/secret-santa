# 104 — V3 : la fête (sa page, « Pour quelle occasion ? », membres, réglages, inviter, quitter)

- **Dépend de** : 101, 103
- **Migration** : non
- **Maquettes** : `V3Fete`, `V3FeteOrganisateur`, `V3FeteAnniversaire`, `V3FeteNouvelle`, `V3FeteMembresReprendre`, `V3FeteReglages`, `V3FeteMembres`, `V3FeteInviter`, `V3FeteRejoindre`, `V3FeteQuitter`

## Objectif

Les pages du groupe deviennent celles de la fête. Une fête se crée par « Pour quelle occasion ? », avec une catégorie qui remplit le reste. Un membre peut quitter une fête.

## À lire d'abord

- `docs/spec/v3/fete.md`
- `docs/spec/v3/accueil-et-creation.md` (« Une autre occasion »)
- `docs/spec/v3/categories.md`
- `docs/spec/v3/regles-d-ecran.md`
- `docs/decisions/2026-11-20-reglages-de-la-fete-et-du-secret-santa.md`
- `docs/decisions/2026-11-20-les-dates-en-trois-listes.md`

## À faire

- [ ] La page d'une fête, vue par un membre et par un organisateur ; la variante « pour quelqu'un ».
- [ ] « Pour quelle occasion ? » : les six catégories, « Pour qui ? » pour un anniversaire, le nom, la date en trois listes, « Elle revient chaque année ».
- [ ] « Reprendre les membres d'une autre fête ».
- [ ] Les réglages de la fête, réduits à ce qui est à elle, avec la ligne vers les réglages du Secret Santa.
- [ ] Les membres, l'invitation par lien, la page du lien d'invitation.
- [ ] Quitter une fête : l'écran qui dit ce qui sort et ce qui reste, et la règle (mes listes sortent, mes coches restent).
- [ ] Le composant de date en trois listes, partagé avec la date de naissance d'un proche ; `AdminDateField` et son calendrier ne servent plus aux dates de fête.
- [ ] Les anciennes adresses du groupe redirigent vers celles de la fête.

## Hors périmètre

- Les réglages du Secret Santa (ticket 105).
- Les listes dans la page de la fête : les lignes sont là, leurs règles viennent avec le ticket 106.
- Le choix du mot « fête » ou « événement » (Q-001) : écrire « fête », par des clés faciles à changer.

## C'est fini quand

- [ ] Les dix maquettes sont reproduites.
- [ ] Créer une fête d'anniversaire depuis « Bientôt » remplit le nom et la date.
- [ ] Quitter une fête retire mes listes de cette fête et garde mes coches (un test le vérifie).
- [ ] `/controle` passe.

## Compte rendu

À remplir par Claude Code à la fin : ce qui a été fait, ce qui a été décidé seul (et pourquoi), les écarts avec les maquettes, les questions posées, les commits.
