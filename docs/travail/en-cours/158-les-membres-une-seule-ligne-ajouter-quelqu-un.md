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

- [x] La section (son titre et ses lignes) devient **une ligne « Ajouter quelqu'un »**, sous les membres : une icône de personne avec un « + », le titre, une flèche.
- [x] **Les endroits** sont ceux d'aujourd'hui : chaque Secret Santa en préparation que j'organise, chaque liste que je gère et qui est partagée avec les membres de l'événement.
- [x] **Un seul endroit** : son nom sous le titre (« Au Secret Santa », « À ma liste de cadeaux »), et la ligne y mène tout droit (« Choisir les participants », « Inviter quelqu'un »).
- [x] **Plusieurs** : pas de texte sous le titre ; la ligne ouvre un panneau du bas (`UiSheet`), « Ajouter quelqu'un », une ligne par endroit : « Au Secret Santa » · « Pour participer au tirage » (son nom s'il y en a plusieurs) ; « À ma liste de cadeaux » · « Pour voir la liste et cocher un cadeau » (les prénoms de la liste à la place, s'il y en a plusieurs).
- [x] **Aucun** : à la place de la ligne, « Créer un Secret Santa » et « Créer une liste de cadeaux » (les lignes de la carte de l'accueil, ticket 151, avec leurs conditions).
- [x] L'événement complet (30 membres) : rien ne change, l'état remplace la ligne.
- [x] **Le texte sous un prénom** (`fete.md`, « Sous un prénom, seulement ce qui sort de l'ordinaire ») : plus de « par où il est entré ». Rien quand tout est normal ; sinon, dans l'ordre : « Organise », le Secret Santa quand ça distingue (« Hors du Secret Santa » avec un seul Secret Santa cette année ; les noms, ou « Dans aucun Secret Santa », avec plusieurs ; rien sans Secret Santa), « ne tire pas Hugo », « pas d'adresse email ». Le premier morceau prend une majuscule. « La liste de Camille » disparaît. « Ne participe plus » ne change pas.
- [x] Trois langues, tournures neutres, tests (un endroit, plusieurs, aucun).

## C'est fini quand

- [x] Depuis la page des membres, « Ajouter quelqu'un » mène au Secret Santa en préparation d'un toucher quand c'est le seul endroit.
- [x] `/controle` passe.

## Compte rendu

- **« Ajouter quelqu'un »** (`e/[slug]/membres/index.vue`) : une seule ligne sous les membres, `i-lucide-user-plus`, le titre, une flèche. Les endroits sont ceux du ticket 117 (chaque Secret Santa en préparation de l'événement, chaque liste que je gère et qui est partagée avec ses membres).
  - **Un seul** : son nom dessous (« Au Secret Santa », « À ma liste de cadeaux ») ; la ligne mène à « Choisir les participants » (`/admin/[fête]/editions/[id]/ajouter`) ou à « Inviter quelqu'un » (`/listes/[id]?partage=inviter`).
  - **Plusieurs** : rien dessous ; un `UiSheet` « Ajouter quelqu'un », une ligne par endroit : « Au Secret Santa » · « Pour participer au tirage » (« Au Secret Santa « Les enfants » » quand plusieurs sont en préparation) ; « À ma liste de cadeaux » · « Pour voir la liste et cocher un cadeau » (les prénoms de la liste à la place, quand j'en ai plusieurs).
  - **Aucun** : « Créer un Secret Santa » (l'événement n'en a pas dans son année en cours) et « Créer une liste de cadeaux » (je n'y tiens aucune liste), le Secret Santa d'abord à Noël, comme sur la carte de l'accueil.
  - **Complet** : l'état remplace la ligne (avant, « Au Secret Santa » restait, vers son lien en pause).
- **Sous un prénom** : `memberNotes` (`shared/utils/members.ts`, testée) dit dans l'ordre « Organise », le Secret Santa quand ça distingue (un seul cette année : « hors du Secret Santa » pour qui n'y est pas ; plusieurs : leurs noms, ou « dans aucun Secret Santa » ; aucun : rien), « ne tire pas Hugo », « pas d'adresse email » ; le premier mot prend une majuscule ; rien quand tout est normal. « Ne participe plus » ne change pas.
- **Les données** (`membersExtras`) : `santas` (ceux de l'année en cours de l'événement, `currentYearOf`, comme l'accueil), `takingPart` (qui participe à quoi), `create` (ce qu'on peut créer, et l'ordre). Plus de « par où il est entré » : `entries`, `entryParts`, `EntryPart`, `MemberEntry` et `entriesOfParty` sont supprimés (les entrées restent enregistrées, rien ne les lit plus). Clés supprimées : `adminGroup.people.bySanta`, `linkActive` ; ajoutées : `toSantaWhy`, `toListWhy`, `outside`, `noSanta` ; `toSantaNamed` et `toList` changent de texte. Trois langues.
- **Tests** : `shared/utils/members.test.ts` ; Playwright : `members-add.spec.ts` (aucun endroit, un, puis deux avec le panneau), `admin-edition.spec.ts` (un endroit, « Pas d'adresse email »), `members-organise.spec.ts` (« Organise · hors du Secret Santa », rien sous un participant), `edition-cases.spec.ts` (complet), `membership.spec.ts` (plus de « La liste de Camille »).
- `ARBORESCENCE.md` et `ECARTS-MAQUETTES.md` mis à jour.

