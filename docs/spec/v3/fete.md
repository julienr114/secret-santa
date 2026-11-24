# L'événement

Décisions : `2026-11-20-le-groupe-devient-la-fete.md`, `2026-11-20-reglages-de-la-fete-et-du-secret-santa.md`.
Maquettes : `V3Fete`, `V3FeteOrganisateur`, `V3FeteAnniversaire`, `V3FeteReglages`, `V3FeteMembres`, `V3FeteInviter`, `V3FeteRejoindre`, `V3FeteQuitter`, `V3FeteMembresComplet`, `V3FeteAnneePassee`.

Ce sont les pages du groupe d'aujourd'hui, avec leurs règles (README, sections 4, 5, 11), plus ce qui suit.

## La page d'un événement

- En tête : la catégorie (« Noël · tous les ans »), le nom, la date de l'année et son décompte.
- Les membres (une ligne, qui ouvre « Membres »).
- Le ou les Secret Santa de l'année.
- Les listes de ses membres ; « Créer une liste de cadeaux », et « Créer un Secret Santa » quand l'événement n'en a pas cette année (pour ses organisateurs).
- Les années passées.
- Pour un membre : « Quitter cet événement ».
- Pour l'organisateur : les réglages (une roue), « Un autre Secret Santa ».

Un événement « pour quelqu'un » (un anniversaire) montre d'abord sa liste ; un Secret Santa reste possible (`V3FeteAnniversaire`).

Une liste réservée à celui qui m'a tiré n'apparaît pas ici pour les autres membres (`listes.md`).

Le titre et le texte de chaque ligne : `lignes.md`.

## Les réglages de l'événement

Maquette : `V3FeteReglages`. Seulement ce qui est à elle :

- **L'événement** : catégorie ; pour un anniversaire, « Pour » (le proche pour qui il est fait, ou « Personne ») ; date (« Le 25 décembre · proposée chaque année ») ; « Revient chaque année ».
- **Secret Santa** : une ligne « Réglages du Secret Santa 2026 », qui mène aux réglages du Secret Santa (`secret-santa.md`).
- **Organisateurs** : la liste, « Ajouter un organisateur ».
- « Supprimer l'événement », réservé au super-admin.

Ce qui ne concerne que le Secret Santa n'est pas ici.

## Les membres

Maquette : `V3FeteMembres`. Décision : `2026-11-21-on-entre-par-un-secret-santa-ou-par-une-liste.md`.

- **C'est la page des organisateurs** (Q-029) : un membre ne l'ouvre pas. Pour lui, la ligne des membres de la page de l'événement dit combien ils sont, sans mener nulle part (pas de chevron). Elle montre les exclusions du tirage et l'absence d'adresse, que les membres ne lisent nulle part ailleurs.
- **On n'ajoute personne à un événement.** On en devient membre en entrant dans un de ses Secret Santa ou dans une de ses listes (`modele.md`, « Deux sortes de personnes »).
- **Sous un prénom, seulement ce qui sort de l'ordinaire** (Julien, 24 novembre 2026 : « par où il est entré », répété sur chaque ligne, ne dit rien à quelqu'un qui crée son premier Secret Santa ; maquette `V3FeteMembres`). Quand tout est normal, la ligne n'a que le prénom. Sinon, dans cet ordre, séparés par « · », le premier avec une majuscule :
  1. **« Organise »** (pas « Organisateur » : l'application ne connaît pas le genre) ;
  2. **le Secret Santa, quand ça distingue quelqu'un** :
     - l'événement a un seul Secret Santa cette année : rien pour qui y participe, **« Hors du Secret Santa »** pour qui n'y est pas ;
     - il en a plusieurs : le nom de ceux où la personne participe (« Les enfants », « Les enfants, Les adultes »), **« Dans aucun Secret Santa »** sinon ;
     - il n'en a pas cette année : rien ;
  3. **« ne tire pas Hugo »** (les exclusions du tirage) ;
  4. **« pas d'adresse email »** ; l'adresse elle-même est sur la fiche de la personne.
  - Exemples : « Organise · ne tire pas Hugo », « Ne tire pas Camille », « Hors du Secret Santa », « Pas d'adresse email ».
  - **On ne dit plus par quelle liste quelqu'un est entré** (« La liste de Camille » disparaît).
- **Un organisateur est membre** dès qu'on l'ajoute dans les réglages de l'événement, sans passer par un Secret Santa ni par une liste (Q-031) : c'est la seule exception.
- Sous les membres, **une seule ligne, « Ajouter quelqu'un »** (Julien, 24 novembre 2026 : « on peut se demander pourquoi on a la liste des personnes et on ne peut pas en ajouter une directement là » ; maquettes `V3FeteMembres`, `V3FeteMembresAjouter`). La règle ne change pas, on entre par un Secret Santa ou par une liste, mais elle ne se montre que quand il faut choisir :
  - **les endroits où je peux ajouter quelqu'un** : chaque Secret Santa en préparation que j'organise, et chaque liste que je gère et qui est partagée avec les membres de cet événement ;
  - **un seul endroit** : la ligne le dit sous son titre (« Au Secret Santa », « À ma liste de cadeaux ») et y mène tout droit : « Choisir les participants » (`secret-santa.md`) ou « Inviter quelqu'un » (`listes.md`) ;
  - **plusieurs endroits** : la ligne n'a que son titre, et ouvre un panneau du bas, « Ajouter quelqu'un », une ligne par endroit : **« Au Secret Santa »** · « Pour participer au tirage » (son nom s'il y en a plusieurs : « Au Secret Santa « Les enfants » ») ; **« À ma liste de cadeaux »** · « Pour voir la liste et cocher un cadeau » (avec plusieurs listes, les prénoms de chacune à la place) ;
  - **aucun endroit** (pas de Secret Santa en préparation, pas de liste à moi) : à la place, les deux lignes qui en créent un, « Créer un Secret Santa » et « Créer une liste de cadeaux », comme sur la carte de l'accueil.
  - Un membre invite toujours depuis sa liste (« Qui voit ta liste ? », « Ajouter », « Quelqu'un d'autre »).
- L'organisateur retire quelqu'un depuis sa fiche : la personne sort des Secret Santa pas encore tirés, et ne voit plus les listes de l'événement.
- Certains membres n'ont pas de compte : ils participent au Secret Santa, ils ne voient pas les listes.

### 30 membres au plus

Maquette : `V3FeteMembresComplet`. À 30 membres, la page le dit (« 30 sur 30 »), un état le dit à la place de « Ajouter quelqu'un » (« L'événement est complet · 30 membres, c'est le maximum »), les liens d'invitation de ses Secret Santa se mettent en pause tout seuls (« En pause · l'événement est complet »), et le lien d'une liste ne fait plus entrer personne de nouveau. Retirer un membre libère une place et les liens reprennent. Les places restantes d'un lien ne dépassent jamais ce qui reste avant 30. Celui qui ouvre le lien d'un événement complet voit `RejoindreFerme`. Il n'y a rien à demander à personne.

## Inviter, rejoindre

Décisions : `2026-11-21-le-lien-d-invitation-est-celui-d-un-secret-santa.md`, `2026-11-21-on-entre-par-un-secret-santa-ou-par-une-liste.md`.

On n'invite pas dans un événement. On invite **à un Secret Santa** (`secret-santa.md`, « Choisir les participants », « Inviter par lien ») ou **à une liste** (`listes.md`, « Inviter quelqu'un »), et celui qui entre devient membre de l'événement.

## Quitter

Maquette : `V3FeteQuitter`. Avant de quitter, l'écran dit ce qui sort et ce qui reste :

- mes listes sortent de cet événement : « Ta liste sortira de cet événement. Elle reste dans tes autres événements. » Si elle n'était que dans celui-ci, elle reçoit un événement à elle, où je suis seul : « Ta liste sortira de cet événement. Toi seul la verras, tant que tu ne l'as pas mise ailleurs. » Si je n'ai pas de liste ici, la ligne n'est pas écrite ;
- les cadeaux que j'ai cochés restent prévus ;
- je ne participerai plus à son Secret Santa l'an prochain.

## Une année passée

Maquette : `V3FeteAnneePassee`. On y arrive par « Les années passées » de l'événement, ou par « Les événements passés » de l'accueil.

- En tête : une pastille avec l'année (« Noël 2025 »), le nom de l'événement, la date de cette année-là, sans décompte.
- Le ou les Secret Santa de l'année, avec ce que j'y ai fait (« Tu offrais à Zoé »), et « Devine qui » s'il y en avait un.
- Les listes de l'année, sans aucun geste sur cette page. Chacune s'ouvre, et reste modifiable (`listes.md`, « Une liste d'une année passée »).
- Rien à créer, rien à régler, pas de « Quitter » : on ne change pas une année finie.
