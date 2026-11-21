# On n'ajoute personne à un événement : on y entre par un Secret Santa ou par une liste

21 novembre 2026 · décidé par Julien : « on n'ajoute pas de personne à l'événement lui-même, on en ajoute à un Secret Santa ou à une liste, et ça découle dans l'événement. » Suite de `2026-11-21-le-lien-d-invitation-est-celui-d-un-secret-santa.md`. Remplace un point de `2026-11-20-le-groupe-devient-la-fete.md` (les membres s'ajoutaient à la fête, comme au groupe).

## Contexte

Le groupe d'avant avait ses membres, et on choisissait parmi eux les participants d'un tirage. La V3 avait gardé ça pour l'événement : une étape « Qui en fait partie ? » à sa création, « Ajouter une personne » sur sa page des membres. Mais on ne crée jamais « un événement » : on crée un Secret Santa ou une liste. Ajouter des gens à l'événement était la seule chose qu'on faisait encore sur lui.

## Décision

- **On devient membre d'un événement en entrant dans un de ses Secret Santa ou dans une de ses listes.** Rien d'autre n'y fait entrer.
- **Par un Secret Santa** : son organisateur m'y ajoute, ou je m'inscris par son lien.
- **Par une liste** (réponse de Julien, « les deux ») : celui qui la gère m'invite, ou j'ouvre son lien et je me connecte. J'entre dans l'événement de la liste.
- **La page « Membres » reste** (réponse de Julien) : on y voit qui est là et par où chacun est entré. **On peut y ajouter quelqu'un**, mais toujours à quelque chose : à un Secret Santa, ou à ma liste.
- **Créer un événement ne demande plus qui en fait partie.** « Reprendre ceux d'un autre événement » se fait en choisissant les participants d'un Secret Santa, ou en invitant à une liste.

## Écarté

- Garder « Ajouter une personne » sur l'événement, à côté : deux façons de faire entrer quelqu'un, dont une qui ne dit pas pourquoi il est là.
- Supprimer la page « Membres » : l'organisateur n'aurait plus d'endroit pour voir tout le monde, ni pour retirer quelqu'un.

## Ce que ça entraîne

- Le lien d'une liste partagée avec tous les membres de son événement fait entrer celui qui l'ouvre et se connecte : il voit alors les autres listes que les membres se partagent. C'est le pendant du lien d'un Secret Santa. Celui qui gère la liste peut changer de lien ; l'organisateur peut retirer quelqu'un ; l'événement s'arrête à 30 membres.
- Une liste est dans plusieurs événements : son lien ne fait entrer que dans le sien, celui de l'occasion choisie à sa création.

## Où ça s'applique

`docs/spec/v3/modele.md` (« Deux sortes de personnes »), `docs/spec/v3/fete.md` (« Les membres »), `docs/spec/v3/listes.md` (« Inviter quelqu'un », « Arriver par le lien »), `docs/spec/v3/secret-santa.md` (« Choisir les participants »), `docs/spec/v3/accueil-et-creation.md`. Maquettes : `V3FeteMembres`, `V3FeteMembresComplet`, `V3FeteMembresReprendre`, `V3ListeInviter`, `V3ListePartageEmail`, `V3ListeQui`, `AjouterParticipants`. Tickets 116 et 117.
