# 102 — V3 : les mots (fête, Secret Santa, plus de « pistes »)

- **Dépend de** : 101
- **Migration** : non
- **Maquettes** : toutes les `V3*`

## Objectif

Plus un seul « groupe », « édition » ni « tirage » pour désigner la chose, dans les écrans, les emails, les notifications, le journal et l'administration, en trois langues. « Père Noël » seulement dans une fête de catégorie Noël.

## À lire d'abord

- `docs/spec/v3/vocabulaire.md`
- `docs/decisions/2026-11-20-secret-santa-garde-son-nom.md`
- `docs/travail/questions.md`, Q-001

## À faire

- [ ] Passer les dictionnaires `shared/i18n/locales/{fr,en,de}` au vocabulaire de la V3.
- [ ] Une variante neutre de chaque texte qui dit « Père Noël », choisie par la catégorie de la fête.
- [ ] Ajouter les mots disparus à la liste du script de contrôle (ticket 100).

## Hors périmètre

- Changer la structure d'un écran : seuls les mots changent ici.

## C'est fini quand

- [ ] Aucun des mots de la colonne « On n'écrit plus » de `vocabulaire.md` dans les trois langues.
- [ ] Un Secret Santa dans une fête de catégorie « Autre » ne dit nulle part « Père Noël ».
- [ ] `/controle` passe.

## Ce qui manque

- La réponse à Q-001 : « fête » ou « événement » pour le nom commun.
- Une relecture des emails et des notifications avec les nouveaux mots (ticket 110), pour ne pas traduire deux fois.

## Compte rendu

À remplir par Claude Code à la fin : ce qui a été fait, ce qui a été décidé seul (et pourquoi), les écarts avec les maquettes, les questions posées, les commits.
