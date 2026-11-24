# La migration vers la V3

Décisions : `2026-11-20-le-groupe-devient-la-fete.md`, `2026-11-20-pistes-et-listes-fusionnent.md`, `2026-11-20-plus-de-demande-limite-de-trois.md`.

**À essayer sur une copie de la base de production avant tout. À ne pas publier pendant une saison de Noël en cours** : des gens utilisent l'application avec leurs groupes.

## Les groupes

- Chaque groupe devient **un événement de catégorie Noël qui revient chaque année**, avec son nom, ses membres, ses organisateurs, ses exclusions et ses réglages.
- Chaque édition devient **l'année de l'événement et son Secret Santa**, avec sa date.
- Les réglages du groupe qui ne concernent que le tirage (éviter la même personne, le mot ajouté aux messages, les emails du tirage) descendent sur chaque Secret Santa (`secret-santa.md`).

## Les listes

- Une liste reliée à un tirage (`participations.giftListId`) va dans l'événement de ce tirage.
- **Chaque autre liste reçoit son propre événement**, créé à la migration avec son nom, sa date et son icône. Son seul membre est son propriétaire ; ses co-teneurs en deviennent membres.
- Une liste partagée par lien reste publique (« tout le monde avec un lien ») dans son événement.
- Les coches faites par lien restent : elles alimentent « Ce que j'offre ailleurs ».

## Les pistes de cadeaux

Aujourd'hui, la même chose existe trois fois : les goûts dans `giftPortraits` et dans `familyMembers.answers/texts` ; les idées dans `wishes` et dans `giftListIdeas`.

- `giftPortraits` va dans la fiche « Moi » (`familyMembers`, `isSelf`) du compte de la personne. Si les deux existent, la plus récente gagne.
- `wishes` va dans `giftListIdeas`, dans une liste de la personne placée dans l'événement du tirage et **réservée à celui qui l'a tirée** : personne ne voit après la migration ce qu'il ne voyait pas avant.
- **Une personne sans compte, mais dont on a l'adresse, et qui a écrit des pistes ou un portrait** (Julien, 24 novembre 2026) : **la migration lui crée son compte**, avec cette adresse et son prénom, puis fait comme pour les autres (la fiche « Moi », la liste réservée à celui qui l'a tirée). C'est la règle de la V3, « le compte se crée tout seul à la première chose écrite » (`listes.md`, « Sans compte »), appliquée à ce qu'elle a déjà écrit. Elle se connecte ensuite avec son adresse, sans mot de passe, comme tout le monde. Celui qui n'a rien écrit n'a pas de compte.
- **Une personne dont on n'a pas l'adresse** (une seule en production le 24 novembre 2026, sur deux Secret Santa de huit personnes) : rien n'est créé à sa place, ses pistes restent en lecture seule pour celui qui l'a tirée. Le plus simple est de lui ajouter son adresse avant la bascule : elle est alors traitée comme les autres. On n'écrit pas de code pour reprendre ses pistes plus tard.
- **Un garde-fou, en une règle** : tant qu'il reste d'anciennes pistes pour une participation, celui qui a tiré cette personne les lit, **qu'elle ait un compte ou non**. Aujourd'hui, elles cessent de s'afficher dès qu'un compte existe.
- Dans les deux cas : **personne ne voit après ce qu'il ne voyait pas avant, et aucune idée écrite ne disparaît**.

## Les demandes

Les demandes de groupe disparaissent (`groupRequests`). Celles qui attendent au moment de la migration sont acceptées d'office. Le quota devient la limite de 3 Secret Santa par compte.

## Les liens déjà envoyés

Ils continuent de marcher : les adresses des groupes (invitation, pages), des participants et des listes partagées sont redirigées vers leurs nouvelles adresses.

Le lien d'invitation d'un groupe devient celui de son Secret Santa en préparation, avec ses réglages (places, date limite, mot). Un groupe qui n'en a pas voit son lien fermé (`secret-santa.md`, « Inviter par lien »).

## L'ordre

Le modèle et la migration passent en premier, **sans changer aucun écran** : l'application d'aujourd'hui tourne sur le nouveau modèle avant qu'on touche à l'interface (ticket 101).

## La bascule

Décision : `2026-11-21-la-v3-se-publie-des-qu-elle-est-prete.md`. La V3 se publie dès qu'elle est prête, d'un coup, avec une sauvegarde juste avant, une répétition sur une copie du jour, un retour en arrière essayé, et un mot à ceux qui s'en servent. Le détail est le ticket 113.

Deux règles de migration ajoutées le 21 novembre 2026 avec le partage par stades (`listes.md`) : une liste partagée par lien aujourd'hui devient **publique** ; une liste dont le partage est éteint devient un **brouillon**. Les pistes de cadeaux deviennent une liste au stade « celui qui m'a tiré ».
