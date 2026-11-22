# 119 — V3 : le bandeau d'une liste d'une année passée, et « Repartir d'une liste »

- **Dépend de** : 108
- **Migration** : non
- **Maquettes** : `V3ListeAnneePassee`, `ListeNouvelleReprendre`

## Objectif

Le lien d'une liste de l'an dernier marche toujours. Celui qui l'ouvre doit voir tout de suite que c'est celle de l'an dernier, et trouver celle de cette année.

## À lire d'abord

- `docs/decisions/2026-11-22-une-liste-d-une-annee-passee-reste-ouverte.md`
- `docs/spec/v3/listes.md` (« Une liste d'une année passée », « La liste reprise de l'an dernier », « Repartir d'une liste »)
- `docs/travail/questions.md` (Q-020 et Q-021, dans « Réponses »)

## À faire

- [x] **Savoir qu'une liste est d'une année passée**, en fonction pure testée : son événement a quitté l'accueil pour l'année de sa date. La même règle que celle du ticket 108, pas une seconde.
- [x] **Le bandeau**, en haut de la liste, pour tout le monde (celui qui la tient, un membre, celui qui arrive par le lien) : « Liste de Noël 2025 » · « Une année passée ».
- [x] **Le bouton vers cette année** (« Noël 2026 ») quand une liste a été reprise de celle-ci et que j'ai le droit de l'ouvrir. Sinon, pas de bouton.
- [x] La liste reste modifiable : rien d'autre ne change.
- [x] **« Repartir d'une liste »** (`ListeNouvelleReprendre`), en fonction pure testée : seulement les listes que je tiens et qui ressemblent à la nouvelle (le même événement une autre année, puis la même catégorie, puis une personne en commun), trois au plus, jamais une liste sans rien de commun ; pas de section s'il n'y en a aucune. Sous chaque nom, les prénoms à la place de « 4 personnes ».
- [x] Trois langues, `tests/e2e`.

## Hors périmètre

- Figer une liste passée.
- Une année en base pour une liste (Q-020 : la date suffit).

## C'est fini quand

- [ ] Le lien d'une liste de Noël 2025, ouvert en 2026, montre le bandeau et le bouton vers la liste de 2026 si j'y ai droit.
- [ ] Une liste de cette année ne montre pas de bandeau.
- [ ] Une liste neuve pour Noël, où figure Camille, ne propose pas de repartir de « Les 7 ans de Léo ».
- [ ] Les deux maquettes sont reproduites.
- [ ] `/controle` passe.

## Compte rendu

À remplir par Claude Code à la fin : ce qui a été fait, ce qui a été décidé seul (et pourquoi), les écarts avec les maquettes, les questions posées, les commits.
