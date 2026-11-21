# La fête

Décisions : `2026-11-20-le-groupe-devient-la-fete.md`, `2026-11-20-reglages-de-la-fete-et-du-secret-santa.md`.
Maquettes : `V3Fete`, `V3FeteOrganisateur`, `V3FeteAnniversaire`, `V3FeteReglages`, `V3FeteMembres`, `V3FeteInviter`, `V3FeteRejoindre`, `V3FeteQuitter`, `V3FeteMembresComplet`, `V3FeteAnneePassee`.

Ce sont les pages du groupe d'aujourd'hui, avec leurs règles (README, sections 4, 5, 11), plus ce qui suit.

## La page d'une fête

- En tête : la catégorie (« Noël · tous les ans »), le nom, la date de l'année et son décompte.
- Les membres (une ligne, avec « Inviter » pour l'organisateur).
- Le ou les Secret Santa de l'année.
- Les listes de ses membres ; « Nouvelle liste ».
- Les années passées.
- Pour un membre : « Quitter cette fête ».
- Pour l'organisateur : les réglages (une roue), « Un autre Secret Santa ».

Une fête « pour quelqu'un » (un anniversaire) montre d'abord sa liste ; un Secret Santa reste possible (`V3FeteAnniversaire`).

Une liste réservée à celui qui m'a tiré n'apparaît pas ici pour les autres membres (`listes.md`).

## Les réglages de la fête

Maquette : `V3FeteReglages`. Seulement ce qui est à elle :

- **La fête** : catégorie ; date (« Le 25 décembre · proposée chaque année ») ; « Revient chaque année ».
- **Secret Santa** : une ligne « Réglages du Secret Santa 2026 », qui mène aux réglages du Secret Santa (`secret-santa.md`).
- **M'écrire par email** : « Quelqu'un rejoint la fête par le lien ».
- **Organisateurs** : la liste, « Ajouter un organisateur ».
- « Supprimer la fête », réservé au super-admin.

Ce qui ne concerne que le Secret Santa n'est pas ici.

## Les membres

Maquette : `V3FeteMembres`. La page des membres du groupe d'aujourd'hui. Certains membres n'ont pas de compte : ils participent au Secret Santa, ils ne voient pas les listes.

### 30 membres au plus

Maquette : `V3FeteMembresComplet`. À 30 membres, la page le dit (« 30 sur 30 »), « Ajouter une personne » laisse la place à un état (« La fête est complète · 30 membres, c'est le maximum »), et le lien d'invitation se met en pause tout seul (« En pause · la fête est complète »). Retirer un membre libère une place et le lien reprend. Les places restantes d'un lien ne dépassent jamais ce qui reste avant 30. Celui qui ouvre le lien d'une fête complète voit `RejoindreFerme`. Il n'y a rien à demander à personne.

## Inviter, rejoindre

Maquettes : `V3FeteInviter`, `V3FeteRejoindre`.

- Le lien d'invitation est celui de la fête. Ceux qui s'inscrivent rejoignent aussi le Secret Santa, tant que le tirage n'a pas eu lieu.
- La page du lien dit « Tu es invité à la fête », le nom, puis la catégorie, la date et le nombre de membres. On s'y connecte avec son adresse email ; le compte se crée tout seul.

## Quitter

Maquette : `V3FeteQuitter`. Avant de quitter, l'écran dit ce qui sort et ce qui reste :

- mes listes sortent de cette fête (et restent dans les autres) ;
- les cadeaux que j'ai cochés restent prévus ;
- je ne participerai plus à son Secret Santa l'an prochain.

## Une année passée

Maquette : `V3FeteAnneePassee`. On y arrive par « Les années passées » de la fête, ou par « Les fêtes passées » de l'accueil.

- En tête : une pastille avec l'année (« Noël 2025 »), le nom de la fête, la date de cette année-là, sans décompte.
- Le ou les Secret Santa de l'année, avec ce que j'y ai fait (« Tu offrais à Zoé »), et « Devine qui » s'il y en avait un.
- Les listes de l'année, en lecture seule.
- Rien à créer, rien à régler, pas de « Quitter » : on ne change pas une année finie.
