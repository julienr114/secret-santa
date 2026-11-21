# 108 — V3 : l'année suivante, et les événements passés

- **Dépend de** : 103, 105, 106
- **Migration** : à voir
- **Maquettes** : `V3AccueilAnnee`, `V3FetesPassees`, `V3FeteAnneePassee`, `V3ListeReprise`

## Objectif

Deux mois avant un événement qui revient, l'accueil propose de le préparer et de reprendre sa liste. Les événements finis se retrouvent dans « Les événements passés », et chaque année passée d'un événement garde sa page, en lecture seule.

## À lire d'abord

- `docs/spec/v3/accueil-et-creation.md` (« L'année suivante », « Les événements passés »)
- `docs/spec/v3/fete.md` (« Une année passée »)
- `docs/spec/v3/listes.md` (« La liste reprise de l'an dernier »)
- `docs/spec/v3/modele.md` (« L'année »)

## À faire

- [ ] « Préparer Noël 2027 » pour l'organisateur : autant de Secret Santa que l'an dernier, chacun avec ses participants et ses réglages, « à préparer ».
- [ ] « Supprimer ce Secret Santa », tant qu'il n'est pas tiré.
- [ ] Après sa date, un événement reste sur l'accueil jusqu'à la clôture de son Secret Santa, 14 jours au plus (3 jours sans Secret Santa), puis passe dans « Les événements passés » ou à l'année suivante.
- [ ] « Reprendre ma liste de l'an dernier » : la liste de l'année, dans le même événement, avec les idées pas offertes marquées pour moi seul (la reprise existe déjà pour une liste, lot 27 de l'ancien plan).
- [ ] La page « Les événements passés » : par année, une ligne par événement et par année.
- [ ] La page d'une année passée d'un événement : ses Secret Santa, « Devine qui », ses listes, en lecture seule.
- [ ] Les lignes « Les événements passés » (accueil) et « Les années passées » (événement) y mènent.

## Hors périmètre

- Le dévoilement, le palmarès et la clôture d'un Secret Santa : inchangés.
- Ce que voit, après l'événement, celui pour qui une liste était faite : la règle d'aujourd'hui.

## C'est fini quand

- [ ] Un événement qui revient montre « Préparer » deux mois avant sa date, à son organisateur seulement.
- [ ] Une année passée ne se modifie par aucune route (un test le vérifie).
- [ ] Les quatre maquettes sont reproduites.
- [ ] `/controle` passe.

## Compte rendu

À remplir par Claude Code à la fin : ce qui a été fait, ce qui a été décidé seul (et pourquoi), les écarts avec les maquettes, les questions posées, les commits.
