# « Retour » mène là d'où l'on vient, quand une page a plusieurs parents

21 novembre 2026 · décidé par la conception, après une remarque de Julien : « Retour » sur une liste menait à l'ancienne page des listes. Julien peut dire non. Complète la règle du 18 novembre 2026 (`docs/ARBORESCENCE.md`, « La règle du bouton Retour »).

## Contexte

Avant la V3, chaque page avait un seul parent : une liste remontait à l'onglet « Listes », un tirage à l'onglet « Tirages ». Ces onglets ont disparu. Une liste se montre maintenant sur l'accueil, sur la page de ses événements, dans « Quoi de neuf » et dans « Ce que j'offre ailleurs ». Aucun ticket ne disait ce que devenaient les pages des anciens onglets, ni où « Retour » menait à leur place.

## Décision

- La règle du 18 novembre reste : « Retour » remonte dans l'arbre des pages, ce n'est pas le retour du navigateur.
- Une page qui a plusieurs parents remonte à **celui d'où je viens**.
- Ouverte d'ailleurs (un email, un lien, une adresse tapée), elle remonte à son parent par défaut : l'accueil pour une liste, son événement pour un Secret Santa.
- La page « Listes » et la page « Tirages passés » disparaissent. Leurs adresses mènent à l'accueil et aux événements passés.
- « Mes proches » n'a pas d'entrée à elle : on y va depuis une liste, on revient à cette liste.

## Écarté

- Toujours l'accueil : depuis la page d'un événement, on ouvre une liste, et « Retour » remonte un cran trop haut.
- Le retour du navigateur : une page ouverte depuis un email n'a rien derrière elle (c'est la raison de la règle du 18 novembre).
- Une ligne « Mes proches » dans le menu du compte : une ligne de plus pour une page qu'on n'ouvre qu'en écrivant une liste.

## Où ça s'applique

`docs/spec/v3/navigation.md`. Ticket 114, à finir avant la bascule (ticket 113).
