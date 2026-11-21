# 102 — V3 : les mots (« événement », « Secret Santa », plus de « pistes »)

- **Dépend de** : 105
- **Migration** : non
- **Maquettes** : toutes (elles disent « événement » depuis le 21 novembre 2026)

## Objectif

Plus un seul « groupe », « fête », « édition » ni « tirage » pour désigner la chose, dans les écrans, les emails, les notifications, le journal et l'administration, en trois langues. Le nom commun est « événement ». « Père Noël » seulement dans un événement de catégorie Noël.

## À lire d'abord

- `docs/spec/v3/vocabulaire.md` (tout le ticket est là : les mots, la table de « événement », le jour J, « Devine qui » hors de Noël)
- `docs/decisions/2026-11-21-evenement-pas-fete.md`
- `docs/decisions/2026-11-20-secret-santa-garde-son-nom.md`

## À faire

- [ ] Dans `shared/i18n`, « fête » devient « événement » (« event », « Event ») partout où le mot désigne la chose ; la table de `vocabulaire.md` donne les textes.
- [ ] « Toute la fête » devient « Tous les membres ».
- [ ] Là où « la fête » voulait dire le jour : la date seule, « Date », « le jour J » (« Réponse le jour J », « Jour J · dans 40 jours », « Dévoiler avant le jour J »).
- [ ] Les restes de « groupe », « édition », « tirage » (pour la chose) et « pistes » dans les emails, les notifications, le journal et l'administration.
- [ ] Les variantes sans « Père Noël » hors d'un événement de catégorie Noël, « Devine qui » compris, écrites dans les trois langues.
- [ ] L'adresse d'un événement devient `/e/nom` ; `/f/nom` et les anciennes adresses du groupe y mènent.
- [ ] Les noms dans le code (`party`, `parties`) peuvent rester : ce ticket ne renomme que ce qui se lit.

## Hors périmètre

- Les objets des emails et « Quoi de neuf » (ticket 110).
- Les noms de fichiers des maquettes.

## C'est fini quand

- [ ] Aucune des trois langues ne contient « fête », « party » ou « Fest » pour désigner la chose (une recherche le montre ; « fêter » et les noms propres ne comptent pas).
- [ ] Aucune ne contient « groupe », « édition » ou « pistes » dans un texte affiché.
- [ ] Un Secret Santa dans un événement de catégorie « Autre » n'affiche « Père Noël » nulle part, jeu compris.
- [ ] `/f/nom` redirige vers `/e/nom`.
- [ ] `/controle` passe.

## Compte rendu

À remplir par Claude Code à la fin : ce qui a été fait, ce qui a été décidé seul (et pourquoi), les écarts avec les maquettes, les questions posées, les commits.
