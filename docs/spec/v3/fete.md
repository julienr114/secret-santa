# La fête

Décisions : `2026-11-20-le-groupe-devient-la-fete.md`, `2026-11-20-reglages-de-la-fete-et-du-secret-santa.md`.
Maquettes : `V3Fete`, `V3FeteOrganisateur`, `V3FeteAnniversaire`, `V3FeteReglages`, `V3FeteMembres`, `V3FeteInviter`, `V3FeteRejoindre`, `V3FeteQuitter`.

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

## Inviter, rejoindre

Maquettes : `V3FeteInviter`, `V3FeteRejoindre`.

- Le lien d'invitation est celui de la fête. Ceux qui s'inscrivent rejoignent aussi le Secret Santa, tant que le tirage n'a pas eu lieu.
- La page du lien dit « Tu es invité à la fête », le nom, puis la catégorie, la date et le nombre de membres. On s'y connecte avec son adresse email ; le compte se crée tout seul.

## Quitter

Maquette : `V3FeteQuitter`. Avant de quitter, l'écran dit ce qui sort et ce qui reste :

- mes listes sortent de cette fête (et restent dans les autres) ;
- les cadeaux que j'ai cochés restent prévus ;
- je ne participerai plus à son Secret Santa l'an prochain.
