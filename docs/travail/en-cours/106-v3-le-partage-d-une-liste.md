# 106 — V3 : le partage d'une liste, du brouillon à publique

- **Dépend de** : 101, 104
- **Migration** : oui, `0036_v3_list_sharing` (le stade du partage ; les listes d'aujourd'hui gardent ce qu'elles montrent)
- **Maquettes** : `V3ListeOccasion`, `V3ListeNouvelle`, `V3ListeQui`, `V3ListeQuiModifier`, `V3ListeQuiRetirer`, `V3ListeQuiLien`, `V3ListeLienChanger`, `V3Liste`, `V3ListePublique`, `V3ListeFermee`, `V3ListeFermeeConnecte`, `V3ListeMembre`, `V3OffreAilleurs`, `ListeAidePartage`, `ListeTeneurs`, `ListeGroupeFil`

## Objectif

Une liste naît en brouillon. Celui qui la tient choisit qui la voit : celui qui l'a tiré, les membres d'un ou plusieurs événements, tout le monde. Le lien existe toujours et se copie à tout moment ; c'est en arrivant dessus qu'on entre ou non.

## À lire d'abord

- `docs/spec/v3/listes.md` (tout sauf « La fin des pistes de cadeaux », qui est au ticket 107)
- `docs/decisions/2026-11-21-le-partage-d-une-liste-a-des-stades.md`
- `docs/spec/v3/lignes.md` (la ligne d'une liste)

## À faire

- [x] Créer une liste : « Pour quelle occasion ? », puis la liste en brouillon, avec le nom, la date et l'icône de l'événement.
- [x] La barre du haut, dans ses stades, avec « Copier le lien » toujours là ; « Partager » sur un brouillon, « Modifier » ensuite ; pas de bouton pour celui qui « aide à écrire ».
- [x] « Qui verra ta liste ? » : mes événements à cocher, « Une autre occasion », « Tout le monde, avec le lien » ; pour une liste publique, « Le message qui accompagne le lien » et « Changer de lien ». (« Celui qui m'a tiré » sous un événement : ticket 107.)
- [x] Resserrer le partage : la confirmation, qui compte ceux qui ont coché et vont perdre l'accès ; leurs coches restent.
- [x] L'accès décidé à l'arrivée sur l'adresse, côté serveur : qui tient la liste, les membres des événements où elle est partagée, tout le monde si elle est publique. Les deux pages de refus, qui ne disent rien de la liste.
- [x] Un membre voit dans la carte de l'événement les listes qui y sont partagées, et les ouvre sans lien ; la pastille qui ramène à l'événement.
- [x] Les mêmes coches partout où la liste est partagée.
- [x] « Ce que j'offre ailleurs » : les listes publiques où j'ai coché sans être membre ; une liste qui n'est plus publique en disparaît.
- [x] La migration : une liste partagée par lien aujourd'hui devient publique ; une liste dont le partage est éteint devient un brouillon ; les anciennes adresses mènent au même endroit.

## Hors périmètre

- Le dessin d'une liste : inchangé.
- « Celui qui m'a tiré » et tout ce qui touche aux pistes (ticket 107).
- La liste reprise de l'an dernier (ticket 108).

## C'est fini quand

- [x] Un brouillon n'est lu par personne d'autre que ceux qui le tiennent, par aucune route (un test d'isolation le vérifie).
- [x] Un compte hors de l'événement ne lit pas une liste qui n'y est partagée qu'aux membres ; un membre la lit.
- [x] Une liste partagée dans deux événements montre les mêmes coches aux deux.
- [x] Resserrer le partage d'une liste où deux personnes ont coché affiche « 2 », et leurs coches sont toujours là après.
- [x] Les maquettes du ticket sont reproduites.
- [x] `/controle` passe.

## Compte rendu

**Fait.**

- **Le modèle** (migration `0036_v3_list_sharing`, appliquée en local seulement) :
  - toute liste a son lien dès sa création ;
  - `shared_at` dit « publique » ;
  - une colonne `party_id` garde l'occasion, l'événement pour lequel la liste a été faite ;
  - `gift_list_parties` dit où elle est partagée.
- **Ce que fait la migration** :
  - une liste partagée par lien reste publique ;
  - une liste au partage éteint, ou jamais partagée, devient un brouillon : ses rattachements « tous les membres » disparaissent ;
  - « celui qui m'a tiré » et l'événement propre d'une ancienne liste restent ;
  - les anciennes adresses `/l/…` mènent au même endroit.
- **L'accès se décide à l'arrivée sur `/l/…`, côté serveur**, pour la lecture comme pour les coches :
  - entrent ceux qui tiennent la liste, les membres et les organisateurs d'un événement où elle est partagée, et tout le monde si elle est publique ;
  - les autres reçoivent la même réponse que la liste existe ou non : 401 sans session (« Se connecter », qui ramène au lien), 403 avec ;
  - un brouillon n'est lu par personne d'autre, ni par `/api/lists`, ni par `/api/l`, ni dans la carte de l'événement.
- **La barre du haut** dit le stade (« Brouillon », les événements et combien de membres la voient, « Publique ») et a toujours « Copier le lien ». « Partager » sur un brouillon, « Modifier » ensuite. Celui qui aide à écrire lit « choisi par Camille » et n'a pas de bouton.
- **« Qui verra ta liste ? »** :
  - mes événements à cocher, avec leurs membres ;
  - « Une autre occasion », qui crée un événement et y partage la liste ;
  - « Tout le monde, avec le lien » ; publique, le lien, « Le message qui accompagne le lien » et « Changer de lien », confirmé avant ;
  - resserrer le partage demande d'abord, avec le nombre de membres qui perdent la liste et de ceux d'entre eux qui ont coché ; leurs coches restent.
- **« Créer › Une liste »** demande « Pour quelle occasion ? ». La liste prend le nom, la date et l'icône de l'événement et naît en brouillon. Les « Nouvelle liste » de l'accueil et de la page d'un événement font de même pour leur événement.
- **Une liste partagée dans un événement** est dans sa carte pour ses membres, qui l'ouvrent sans qu'on leur ait envoyé le lien, avec la pastille de l'événement qui y ramène. Celui qui la tient la voit dans la carte de son occasion, même en brouillon.
- **« Ce que j'offre ailleurs »** (`/offert-ailleurs`) liste les listes publiques où j'offre quelque chose sans être membre d'un de leurs événements. La ligne de l'accueil n'apparaît que s'il y en a.
- **Les tests** :
  - Vitest : l'arrivée sur une liste, le stade, qui perd l'accès, la migration, et sur une vraie base l'appartenance, « Qui verra ta liste ? » et « Ce que j'offre ailleurs » ;
  - Playwright (`lists-sharing.spec.ts`) : brouillon fermé par toutes les routes, deux événements et les mêmes coches, « 2 » avant de resserrer et les coches qui restent, « Ce que j'offre ailleurs » ;
  - les parcours des listes d'avant suivent la nouvelle barre.

**Décidé seul** : voir `ECARTS-MAQUETTES.md`, section « Le partage d'une liste ». En plus :
- une liste ne doit plus avoir un nom et quelqu'un dessus pour être partagée par « Qui verra ta liste ? » : son nom vient de l'événement, et une liste sans personne existe ;
- les organisateurs d'un événement entrent comme ses membres ;
- l'onglet « Listes » (`/listes`) reste en attendant la bascule (ticket 113).

**Questions** : aucune.
