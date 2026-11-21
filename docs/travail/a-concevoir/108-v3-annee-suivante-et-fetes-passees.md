# 108 — V3 : l'année suivante, et les fêtes passées

- **Dépend de** : 103, 105, 106
- **Migration** : à voir
- **Maquettes** : `V3AccueilAnnee`, `V3FetesPassees`, `V3FeteAnneePassee`, `V3ListeReprise`

## Objectif

Deux mois avant une fête qui revient, l'accueil propose de la préparer et de reprendre sa liste. Les fêtes finies se retrouvent dans « Les fêtes passées », et chaque année passée d'une fête garde sa page, en lecture seule.

## À lire d'abord

- `docs/spec/v3/accueil-et-creation.md` (« L'année suivante », « Les fêtes passées »)
- `docs/spec/v3/fete.md` (« Une année passée »)
- `docs/spec/v3/listes.md` (« La liste reprise de l'an dernier »)
- `docs/spec/v3/modele.md` (« L'année »)

## À faire

- [ ] « Préparer Noël 2027 » pour l'organisateur, membres repris.
- [ ] « Reprendre ma liste de l'an dernier » : la liste de l'année, dans la même fête, avec les idées pas offertes marquées pour moi seul (la reprise existe déjà pour une liste, lot 27 de l'ancien plan).
- [ ] La page « Les fêtes passées » : par année, une ligne par fête et par année.
- [ ] La page d'une année passée d'une fête : ses Secret Santa, « Devine qui », ses listes, en lecture seule.
- [ ] Les lignes « Les fêtes passées » (accueil) et « Les années passées » (fête) y mènent.

## Hors périmètre

- Le dévoilement, le palmarès et la clôture d'un Secret Santa : inchangés.
- Ce que voit, après la fête, celui pour qui une liste était faite : la règle d'aujourd'hui.

## C'est fini quand

- [ ] Une fête qui revient montre « Préparer » deux mois avant sa date, à son organisateur seulement.
- [ ] Une année passée ne se modifie par aucune route (un test le vérifie).
- [ ] Les quatre maquettes sont reproduites.
- [ ] `/controle` passe.

## Ce qui manque

- **Q-008** : ce que « Préparer Noël 2027 » reprend quand la fête avait plusieurs Secret Santa l'an dernier.
- **Q-009** : combien de temps une fête reste sur l'accueil après sa date, avant de passer dans « Les fêtes passées ».
- Les maquettes sont là (tickets de conception D01 et D06). Dès que Q-008 et Q-009 ont leur réponse, ce ticket passe dans `a-faire/`.

## Compte rendu

À remplir par Claude Code à la fin : ce qui a été fait, ce qui a été décidé seul (et pourquoi), les écarts avec les maquettes, les questions posées, les commits.
