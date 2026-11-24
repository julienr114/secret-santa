# D15 — « Événement » partout

- **Débloque** : tickets 102 et 110
- **Décision** : `docs/decisions/2026-11-21-evenement-pas-fete.md`
- **Fait le** : 21 novembre 2026

## Ce qui est fait

- **Les maquettes** : 131 reprises. Partout où « fête » désignait la chose, « événement » ; « Toute la fête » en « Tous les membres » ; le jour lui-même en date seule ou en « jour J » (« Jour J · dans 40 jours », « Réponse le jour J », « Dévoiler avant le jour J », « Passé » à la place de « Fêté »).
- **Le canevas** : 37 titres, 7 titres de rangée, deux pages (« V3 · L'événement », « Organisateur · événement »).
- **La spec et les tickets** : tous les textes d'écran cités entre guillemets. Le ticket 102 est réécrit et prêt.

## Ce qui n'est pas fait, et c'est dit

- Le texte courant de la spec et des tickets à faire a été repris le soir même, phrase par phrase pour les accords. Restent des noms : le fichier `fete.md`, les maquettes `V3Fete…`, `party` dans le code.
- Les balises `<title>` des maquettes (invisibles à l'écran) et leurs noms de fichiers gardent « fête ».
- « Anniversaires et fêtes », le nom d'une famille d'icônes dans `ListeIcone`, reste : ce n'est pas la chose.

## Décidé seul

- Le jour : « jour J » dans une phrase, la date seule ailleurs. « Fêter » et « Fêté », les étapes de l'organisateur, deviennent « Jour J » et « Passé ».
- « Qui est de la fête ? » devient « Qui en fait partie ? ».
- « Qui offre à qui, pour toute la fête » devient « pour tout le monde ».
- Les titres plus longs passent sur deux lignes (« Réglages de l'événement », « Les événements passés »).

## Contrôlé

`V3Fete`, `V3FeteQuitter`, `V3FeteReglages`, `TirageResultat`, `V3FeteMembresReprendre`, `V3FeteRejoindre`, `V3FeteMembresComplet` et `V3FetesPassees`, en image. Par le calcul : il ne reste aucun « fête » affiché dans les maquettes gardées, hors « Anniversaires et fêtes » ; le dépôt et l'artifact ont les mêmes maquettes.

## Remarqué en passant

Trois maquettes du dépôt ne sont pas celles du canevas (`Famille`, `ListeGroupeFil`, `ListePartager`), et quatre n'existent que dans le dépôt (`ListeIdeeBulle`, `ListeIdeeBulleGras`, `ListeSansPersonneA`, `ListeSansPersonneB`), en plus des neuf orphelines déjà listées. Ça date d'avant la V3 ; à trier avec le ticket 111.
