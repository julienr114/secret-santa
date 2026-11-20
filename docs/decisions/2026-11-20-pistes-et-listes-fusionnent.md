# Les pistes de cadeaux et les listes fusionnent

20 novembre 2026 · décidé par Julien, en séance de conception.

## Contexte

Donner ses pistes à son Secret Santa, c'est déjà remplir une liste sans cadeau. Le code a la même chose trois fois : les goûts dans `giftPortraits` et dans `familyMembers.answers/texts`, les idées dans `wishes` et dans `giftListIdeas`, et `participations.giftListId` relie déjà une liste aux pistes.

## Décision

- « Mes pistes » n'est plus un objet : celui qui m'a tiré voit mes goûts (ma fiche « Moi ») et ma liste.
- Une liste dans une fête qui a un Secret Santa peut n'être montrée qu'à celui qui m'a tiré. En arrivant depuis mon Secret Santa, c'est le choix par défaut ; depuis l'accueil, « Toute la fête ».
- Une liste réservée à celui qui m'a tiré n'apparaît pas dans les listes de la fête.
- Le compte se crée tout seul **à la première chose écrite**, pas à l'ouverture du lien, et on le dit.
- Sans adresse email, pas de liste : on demande l'adresse au moment d'écrire.
- Celui qui m'a tiré arrive sur la liste entière, la page calée sur ma partie.
- L'organisateur n'a plus de réglage « Pistes de cadeaux ».
- Le suivi dit « a écrit sa liste », sans en montrer le contenu.

## Écarté

- Créer le compte dès l'ouverture du lien : un compte pour quelqu'un qui ne fait que regarder son résultat, c'est une donnée de trop.
- Une liste tenue par un proche pour celui qui n'a pas d'adresse.
- Surligner la partie de la personne tirée (un fond, une phrase) : jugé de trop, le calage de la page suffit.
- N'ouvrir que la partie de la personne tirée.

## Où ça s'applique

`docs/spec/v3/listes.md`, `secret-santa.md`, `migration.md`. Maquettes : `V3TirageVersListe`, `V3ListeQuiSecret`, `V3ListeSecret`, `V3ListeCompteCree`, `V3ListeAdresse`, `V3ListeSurligne`.
