# Une liste d'une année passée reste ouverte, avec un bandeau

22 novembre 2026 · décidé par Julien, en réponse à Q-021 de Claude Code. Avec Q-020 : une liste n'a pas d'année à elle en base, sa date suffit.

## Contexte

Une année finie ne se modifie plus : ni ses Secret Santa, ni ses réglages. Pour ses listes, la spec disait « en lecture seule », sans dire où. Or une liste s'ouvre aussi par son lien, et celui de l'an dernier marche toujours.

## Décision

- **La page d'une année passée ne montre aucun geste**, pour les listes comme pour le reste.
- **Une liste d'une année passée s'ouvre et se modifie comme avant** : on y écrit, on y coche. C'est ce qu'il faut pour un mariage, où l'on offre après la date, et pour noter après coup ce qu'on a offert.
- **Un bandeau, en haut, dit de quelle année elle est** : « Liste de Noël 2025 » · « Une année passée ». Tout le monde le voit. Il mène à la liste de cette année, quand il y en a une et que j'ai le droit de l'ouvrir.
- **Une liste appartient à l'année de sa date** (Q-020). Pas de colonne, pas de migration.

## Écarté

- La liste figée partout : on ne pourrait plus cocher un cadeau de mariage offert après la fête.
- On coche mais on n'écrit plus : une règle de plus, pour un cas que personne n'a rencontré.
- Une année en base pour chaque liste : une valeur à tenir à chaque création et à chaque partage, pour rien de visible.

## Où ça s'applique

`docs/spec/v3/listes.md` (« Une liste d'une année passée »), `docs/spec/v3/fete.md` (« Une année passée »), `docs/spec/v3/modele.md` (« L'année »). Maquette : `V3ListeAnneePassee`. Ticket 119.
