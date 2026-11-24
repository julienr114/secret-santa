# 158 — Les membres : une seule ligne « Ajouter quelqu'un », et sous un prénom seulement ce qui sort de l'ordinaire

- **Dépend de** : 117
- **Avant** : la bascule (ticket 113)
- **Migration** : non
- **Maquettes** : `V3FeteMembres` (la ligne), `V3FeteMembresAjouter` (plusieurs endroits : on demande où)

## Objectif

Julien, le 24 novembre 2026 : sur la page des membres, la section « Ajouter quelqu'un » liste des endroits (« Au Secret Santa · 4 participants ») au lieu de proposer le geste. On voit la liste des gens, on veut en ajouter un là. La section devient une seule ligne, qui mène au bon endroit.

## À lire d'abord

- `docs/spec/v3/fete.md`, « Les membres » : le point « une seule ligne, « Ajouter quelqu'un » »
- la page des membres d'aujourd'hui et sa section « Ajouter quelqu'un » (ticket 117)

## À faire

- [ ] La section (son titre et ses lignes) devient **une ligne « Ajouter quelqu'un »**, sous les membres : une icône de personne avec un « + », le titre, une flèche.
- [ ] **Les endroits** sont ceux d'aujourd'hui : chaque Secret Santa en préparation que j'organise, chaque liste que je gère et qui est partagée avec les membres de l'événement.
- [ ] **Un seul endroit** : son nom sous le titre (« Au Secret Santa », « À ma liste de cadeaux »), et la ligne y mène tout droit (« Choisir les participants », « Inviter quelqu'un »).
- [ ] **Plusieurs** : pas de texte sous le titre ; la ligne ouvre un panneau du bas (`UiSheet`), « Ajouter quelqu'un », une ligne par endroit : « Au Secret Santa » · « Pour participer au tirage » (son nom s'il y en a plusieurs) ; « À ma liste de cadeaux » · « Pour voir la liste et cocher un cadeau » (les prénoms de la liste à la place, s'il y en a plusieurs).
- [ ] **Aucun** : à la place de la ligne, « Créer un Secret Santa » et « Créer une liste de cadeaux » (les lignes de la carte de l'accueil, ticket 151, avec leurs conditions).
- [ ] L'événement complet (30 membres) : rien ne change, l'état remplace la ligne.
- [ ] **Le texte sous un prénom** (`fete.md`, « Sous un prénom, seulement ce qui sort de l'ordinaire ») : plus de « par où il est entré ». Rien quand tout est normal ; sinon, dans l'ordre : « Organise », le Secret Santa quand ça distingue (« Hors du Secret Santa » avec un seul Secret Santa cette année ; les noms, ou « Dans aucun Secret Santa », avec plusieurs ; rien sans Secret Santa), « ne tire pas Hugo », « pas d'adresse email ». Le premier morceau prend une majuscule. « La liste de Camille » disparaît. « Ne participe plus » ne change pas.
- [ ] Trois langues, tournures neutres, tests (un endroit, plusieurs, aucun).

## C'est fini quand

- [ ] Depuis la page des membres, « Ajouter quelqu'un » mène au Secret Santa en préparation d'un toucher quand c'est le seul endroit.
- [ ] `/controle` passe.
