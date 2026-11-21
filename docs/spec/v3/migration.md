# La migration vers la V3

Décisions : `2026-11-20-le-groupe-devient-la-fete.md`, `2026-11-20-pistes-et-listes-fusionnent.md`, `2026-11-20-plus-de-demande-limite-de-trois.md`.

**À essayer sur une copie de la base de production avant tout. À ne pas publier pendant une saison de Noël en cours** : des gens utilisent l'application avec leurs groupes.

## Les groupes

- Chaque groupe devient **une fête de catégorie Noël qui revient chaque année**, avec son nom, ses membres, ses organisateurs, ses exclusions et ses réglages.
- Chaque édition devient **l'année de la fête et son Secret Santa**, avec sa date.
- Les réglages du groupe qui ne concernent que le tirage (éviter la même personne, le mot ajouté aux messages, les emails du tirage) descendent sur chaque Secret Santa (`secret-santa.md`).

## Les listes

- Une liste reliée à un tirage (`participations.giftListId`) va dans la fête de ce tirage.
- **Chaque autre liste reçoit sa propre fête**, créée à la migration avec son nom, sa date et son icône. Son seul membre est son propriétaire ; ses co-teneurs en deviennent membres.
- Une liste partagée par lien reste publique (« tout le monde avec un lien ») dans sa fête.
- Les coches faites par lien restent : elles alimentent « Ce que j'offre ailleurs ».

## Les pistes de cadeaux

Aujourd'hui, la même chose existe trois fois : les goûts dans `giftPortraits` et dans `familyMembers.answers/texts` ; les idées dans `wishes` et dans `giftListIdeas`.

- `giftPortraits` va dans la fiche « Moi » (`familyMembers`, `isSelf`) du compte de la personne. Si les deux existent, la plus récente gagne.
- `wishes` va dans `giftListIdeas`, dans une liste de la personne placée dans la fête du tirage et **réservée à celui qui l'a tirée** : personne ne voit après la migration ce qu'il ne voyait pas avant.
- Pour une personne sans compte, les pistes des années passées restent en lecture seule pour celui qui l'avait tirée ; rien n'est créé à sa place.

## Les demandes

Les demandes de groupe disparaissent (`groupRequests`). Celles qui attendent au moment de la migration sont acceptées d'office. Le quota devient la limite de 3 Secret Santa par compte.

## Les liens déjà envoyés

Ils continuent de marcher : les adresses des groupes (invitation, pages), des participants et des listes partagées sont redirigées vers leurs nouvelles adresses.

## L'ordre

Le modèle et la migration passent en premier, **sans changer aucun écran** : l'application d'aujourd'hui tourne sur le nouveau modèle avant qu'on touche à l'interface (ticket 101).

## La bascule

Décision : `2026-11-21-la-v3-se-publie-des-qu-elle-est-prete.md`. La V3 se publie dès qu'elle est prête, d'un coup, avec une sauvegarde juste avant, une répétition sur une copie du jour, un retour en arrière essayé, et un mot à ceux qui s'en servent. Le détail est le ticket 113.

Deux règles de migration ajoutées le 21 novembre 2026 avec le partage par stades (`listes.md`) : une liste partagée par lien aujourd'hui devient **publique** ; une liste dont le partage est éteint devient un **brouillon**. Les pistes de cadeaux deviennent une liste au stade « celui qui m'a tiré ».
