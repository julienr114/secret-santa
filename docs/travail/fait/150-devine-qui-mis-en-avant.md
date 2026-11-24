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

- [x] **La carte « Devine qui »** dans le formulaire de création, à la place de sa ligne : fond vert clair, la loupe blanche dans un rond vert, le titre, « Le jeu qui pimente le Secret Santa. », puis `UiSegmented` à trois choix (« Sans », « Qui m'offre ? », « Toutes les paires »), puis la phrase qui change avec le choix (le tableau de la spec : des phrases qui donnent envie de jouer, à reprendre telles quelles en français et à rendre aussi vivantes en anglais et en allemand). Le choix s'applique sans ouvrir de page.
- [x] Les couleurs du jeu (le vert clair, son liseré, la piste des choix) sont dans le thème (`@theme`), une fois.
- [x] **Au départ : « Toutes les paires »** pour un premier Secret Santa ; le choix du précédent ensuite. Moins de quatre participants : comme aujourd'hui, et la carte dit « À partir de quatre participants. » à la place de la phrase.
- [x] **La loupe, icône du jeu partout** : la ligne « Devine qui » d'un événement (accueil, page de l'événement), la carte de création, « Découvrir le palmarès ».
- [x] **« Découvrir le palmarès »** : la carte prend le vert clair, le rond vert et la loupe (plus de vert plein, plus d'étoile) ; son texte ne change pas.
- [x] **« Petit mot pour les participants »** : la phrase sous le titre, « Chaque participant le lit sous le résultat de son tirage, avec le titre « Le mot de l'organisateur ». », à la place de « Affiché avec le résultat de chacun. » sous le champ. Pas d'aperçu.
- [x] **« Mot ajouté aux messages »** : la nouvelle phrase sous le titre, rien d'autre.
- [x] Trois langues ; les tests qui lisaient l'ancien réglage de départ et les anciens textes.

## Hors périmètre

- Les réglages du jeu dans les réglages d'un Secret Santa (la page « Pronostics ») : ils ne changent pas.
- Les écrans du palmarès lui-même (les histoires) : leur vert plein reste.

## C'est fini quand

- [x] Un premier Secret Santa se crée avec « Toutes les paires », et l'organisateur le voit et peut le changer d'un toucher.
- [x] La même loupe se retrouve sur la carte, sur la ligne « Devine qui » et sur « Découvrir le palmarès ».
- [x] Chacune des deux pages de mot dit où le mot apparaît.
- [x] `/controle` passe.

## Compte rendu

- **La carte** `AdminGuessChoice` remplace la ligne « Devine qui » du formulaire (cinq lignes, puis la carte) : vert clair, la loupe blanche dans un rond vert, « Le jeu qui pimente le Secret Santa. », trois choix (`UiSegmented`, nouvelle teinte `game`), la phrase du tableau de la spec, ou « À partir de quatre participants. » sous quatre participants repris. La page « Devine qui » du formulaire (`nouvelle/devine`) n'existe plus.
- **Les couleurs du jeu** sont dans `@theme` : `game-tint`, `game-ring`, `game-track`, `game-ink`, `game-strong` (le rond est `mint-500`).
- **Au départ** : « Toutes les paires » pour un premier Secret Santa (`useTakenOver`), le choix du précédent ensuite.
- **La loupe** (`i-lucide-search`) sur la ligne « Devine qui » de l'accueil et de la page d'un événement, sur la carte, et sur « Découvrir le palmarès », qui prend le vert clair et le rond vert (plus de vert plein ni d'étoile ; son texte ne change pas).
- **Les deux mots** : « Chaque participant le lit sous le résultat de son tirage… » sous le titre de « Petit mot » (la phrase sous le champ, `wordHelp`, est retirée) ; « Quand tu envoies son lien à quelqu'un… » remplace l'ancienne phrase de « Mot ajouté aux messages ». Les mêmes phrases se lisent sur les pages du formulaire de création.
- Anglais et allemand écrits dans le même ton ; la phrase du petit mot cite le titre tel que chaque langue l'affiche (« The organizer's note », « Die Nachricht des Organisators »).
- Tests : `admin-edition.spec.ts` (cinq lignes, « Toutes les paires » choisie d'avance, la phrase des quatre participants, le choix fait sur place).
- Écarts notés dans `ECARTS-MAQUETTES.md`.
