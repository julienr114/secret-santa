# La navigation

Décision : `2026-11-21-retour-la-d-ou-l-on-vient.md`. La règle de départ est dans `docs/ARBORESCENCE.md` (« La règle du bouton Retour », 18 novembre 2026) : « Retour » remonte dans l'arbre des pages, ce n'est pas le retour du navigateur. Ce fichier dit ce que la V3 y change. `docs/ARBORESCENCE.md` reste la liste des pages, tenue par Claude Code.

## Trois onglets, et tout le reste sous l'accueil

La barre du bas : « Accueil », « Créer », « Quoi de neuf » (`accueil-et-creation.md`). « Quoi de neuf » et « Admin » allument leur onglet sur leurs pages ; toute autre page est sous « Accueil ».

Il n'y a plus de page « Listes », plus de page « Tirages passés », plus de page « Mes pistes ». Aucun lien, aucun « Retour », aucun fil au-dessus d'un titre n'y mène.

## « Retour », quand une page a plusieurs parents

Une liste ou un Secret Santa se montre à plusieurs endroits. « Retour » mène à **celui d'où je viens**, si c'est l'un de ses parents. Sinon (un email, un lien, une adresse tapée, la page rechargée), au parent par défaut.

| La page | Ses parents | Par défaut |
|---|---|---|
| Un événement | l'accueil, « Quoi de neuf » | l'accueil |
| Une liste que je tiens, ou celle d'un autre | l'accueil, la page d'un de ses événements, « Quoi de neuf », « Ce que j'offre ailleurs », une année passée | l'accueil |
| Ma page d'un Secret Santa (celle du participant) | l'accueil, la page de l'événement, « Quoi de neuf », une année passée | l'accueil |
| Le Secret Santa, pour son organisateur | l'accueil, la page de l'événement, « Quoi de neuf » | son événement |
| « Mes proches » | la liste d'où je viens | l'accueil |
| Un de mes proches, la fiche « Moi » | la liste d'où je viens, ma page d'un Secret Santa, « Mes proches » | « Mes proches » |
| Une année passée d'un événement | « Les événements passés », la page de l'événement | « Les événements passés » |
| « Les événements passés », « Ce que j'offre ailleurs », « Mon compte » | l'accueil | l'accueil |

- Le parent d'où je viens **tient après un détour** : événement → liste → une idée → liste → « Retour » ramène à l'événement.
- **Sans session**, une page ouverte par un lien (un Secret Santa, une liste publique) n'a pas de « Retour ».
- Les pages qui n'ont qu'un parent gardent celui d'`ARBORESCENCE.md`.

## Après un geste qui ferme la page

| Le geste | Où j'arrive |
|---|---|
| Supprimer une liste, ou cesser de la tenir | là où « Retour » m'aurait mené depuis la liste |
| Quitter un événement, ou le supprimer | l'accueil |
| Supprimer un Secret Santa pas encore tiré | la page de l'événement |
| Ouvrir une liste que je n'ai plus le droit de voir | `V3ListeFermeeConnecte`, dont la seule sortie est l'accueil |

## Les anciennes adresses

Une ancienne adresse ne donne jamais une page d'erreur : elle mène à ce qui la remplace.

| L'adresse d'avant | Elle mène à |
|---|---|
| `/listes` | l'accueil |
| `/tirages-passes` | « Les événements passés » (ticket 108) |
| `/p/[jeton]/pistes` et ses pages, `/p/[jeton]/souhaits` | la liste réservée à celui qui m'a tiré (ticket 107) |
| `/f/[nom]`, `/admin/[groupe]` et ses pages | l'événement (déjà fait, tickets 102 et 104) |
