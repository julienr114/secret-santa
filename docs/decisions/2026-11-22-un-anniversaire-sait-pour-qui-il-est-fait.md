# Un anniversaire sait pour qui il est fait

22 novembre 2026 · décidé par la conception, en réponse à Q-022 de Claude Code. Julien peut dire non.

## Contexte

En créant un anniversaire, on choisit « Pour qui ? » parmi ses proches : le nom devient « L'anniversaire de Zoé », la date sa date de naissance. Puis le lien se perd : l'événement ne sait plus que c'est celui de Zoé. Or trois maquettes en dépendent : « ses 4 ans » à côté de la date, « Ses 3 ans » pour une année passée, « 7 cadeaux offerts à Zoé ».

## Décision

- **Un événement de catégorie Anniversaire retient le proche pour qui il est fait.** C'est facultatif : « Quelqu'un d'autre » n'en donne pas.
- Avec sa date de naissance, l'événement dit son âge : « ses 4 ans » cette année, « Ses 3 ans » pour une année passée. Sans elle, il ne dit rien.
- Les réglages de l'événement ont une ligne « Pour », qui permet de le choisir après coup, de le changer ou de l'enlever. C'est par là que les anniversaires déjà créés le reçoivent.
- Si ce proche est supprimé, l'événement garde son nom et perd seulement l'âge.

## Écarté

- Garder le nom de l'année (« Anniversaire 2025 ») : c'est ce que fait le code en attendant ; il ne dit pas de qui.
- Deviner le proche d'après la date ou le nom : faux dès qu'il y a des jumeaux, ou qu'on renomme l'événement.

## Où ça s'applique

`docs/spec/v3/modele.md` (« L'événement »), `docs/spec/v3/categories.md` (« Pour un anniversaire »), `docs/spec/v3/fete.md` (« Les réglages de l'événement »), `docs/spec/v3/lignes.md`. Maquettes : `V3FeteAnniversaire`, `V3FeteNouvelle`. Ticket 118.
