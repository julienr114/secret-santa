# 150 — « Devine qui » mis en avant à la création, la loupe, les deux mots expliqués

- **Dépend de** : 105
- **Avant** : la bascule (ticket 113)
- **Migration** : non (le réglage de départ change dans le code, pas dans les données)
- **Maquettes** : `V3TirageNouveau`, `V3TirageNouveauQui`, `V3TirageNouveauSans`, `DevinePalmares`, `V3AccueilJeu` (la loupe sur la ligne « Devine qui »), `EditionMot`, `GroupeMot`

## Objectif

Julien, le 23 novembre 2026 : à la création d'un Secret Santa, on ne comprend pas ce qu'est « Devine qui », alors que c'est ce que l'application a en plus. Le jeu sort des lignes du formulaire, s'explique, et s'allume au départ. Les deux mots disent où ils apparaissent.

## À lire d'abord

- `docs/spec/v3/secret-santa.md`, « Créer un Secret Santa » : « Devine qui » est mis en avant ; les deux mots disent où ils vont
- `docs/spec/v3/vocabulaire.md` (« Devine qui » hors de Noël : aucune des nouvelles phrases ne dit « Père Noël »)

## À faire

- [ ] **La carte « Devine qui »** dans le formulaire de création, à la place de sa ligne : fond vert clair, la loupe blanche dans un rond vert, le titre, « Le jeu qui pimente le Secret Santa. », puis `UiSegmented` à trois choix (« Sans », « Qui m'offre ? », « Toutes les paires »), puis la phrase qui change avec le choix (le tableau de la spec : des phrases qui donnent envie de jouer, à reprendre telles quelles en français et à rendre aussi vivantes en anglais et en allemand). Le choix s'applique sans ouvrir de page.
- [ ] Les couleurs du jeu (le vert clair, son liseré, la piste des choix) sont dans le thème (`@theme`), une fois.
- [ ] **Au départ : « Toutes les paires »** pour un premier Secret Santa ; le choix du précédent ensuite. Moins de quatre participants : comme aujourd'hui, et la carte dit « À partir de quatre participants. » à la place de la phrase.
- [ ] **La loupe, icône du jeu partout** : la ligne « Devine qui » d'un événement (accueil, page de l'événement), la carte de création, « Découvrir le palmarès ».
- [ ] **« Découvrir le palmarès »** : la carte prend le vert clair, le rond vert et la loupe (plus de vert plein, plus d'étoile) ; son texte ne change pas.
- [ ] **« Petit mot pour les participants »** : la phrase sous le titre, « Chaque participant le lit sous le résultat de son tirage, avec le titre « Le mot de l'organisateur ». », à la place de « Affiché avec le résultat de chacun. » sous le champ. Pas d'aperçu.
- [ ] **« Mot ajouté aux messages »** : la nouvelle phrase sous le titre, rien d'autre.
- [ ] Trois langues ; les tests qui lisaient l'ancien réglage de départ et les anciens textes.

## Hors périmètre

- Les réglages du jeu dans les réglages d'un Secret Santa (la page « Pronostics ») : ils ne changent pas.
- Les écrans du palmarès lui-même (les histoires) : leur vert plein reste.

## C'est fini quand

- [ ] Un premier Secret Santa se crée avec « Toutes les paires », et l'organisateur le voit et peut le changer d'un toucher.
- [ ] La même loupe se retrouve sur la carte, sur la ligne « Devine qui » et sur « Découvrir le palmarès ».
- [ ] Chacune des deux pages de mot dit où le mot apparaît.
- [ ] `/controle` passe.

## Compte rendu

À remplir par Claude Code à la fin : ce qui a été fait, ce qui a été décidé seul (et pourquoi), les écarts avec les maquettes, les questions posées, les commits.
