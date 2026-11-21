# 106 — V3 : le partage d'une liste, du brouillon à publique

- **Dépend de** : 101, 104
- **Migration** : oui (le stade du partage ; les listes d'aujourd'hui gardent ce qu'elles montrent)
- **Maquettes** : `V3ListeOccasion`, `V3ListeNouvelle`, `V3ListeQui`, `V3ListeQuiModifier`, `V3ListeQuiRetirer`, `V3ListeQuiLien`, `V3ListeLienChanger`, `V3Liste`, `V3ListePublique`, `V3ListeFermee`, `V3ListeFermeeConnecte`, `V3ListeMembre`, `V3OffreAilleurs`, `ListeAidePartage`, `ListeTeneurs`, `ListeGroupeFil`

## Objectif

Une liste naît en brouillon. Celui qui la tient choisit qui la voit : celui qui l'a tiré, les membres d'un ou plusieurs événements, tout le monde. Le lien existe toujours et se copie à tout moment ; c'est en arrivant dessus qu'on entre ou non.

## À lire d'abord

- `docs/spec/v3/listes.md` (tout sauf « La fin des pistes de cadeaux », qui est au ticket 107)
- `docs/decisions/2026-11-21-le-partage-d-une-liste-a-des-stades.md`
- `docs/spec/v3/lignes.md` (la ligne d'une liste)

## À faire

- [ ] Créer une liste : « Pour quelle occasion ? », puis la liste en brouillon, avec le nom, la date et l'icône de l'événement.
- [ ] La barre du haut, dans ses stades, avec « Copier le lien » toujours là ; « Partager » sur un brouillon, « Modifier » ensuite ; pas de bouton pour celui qui « aide à écrire ».
- [ ] « Qui verra ta liste ? » : mes événements à cocher, « Une autre occasion », « Tout le monde, avec le lien » ; pour une liste publique, « Le message qui accompagne le lien » et « Changer de lien ».
- [ ] Resserrer le partage : la confirmation, qui compte ceux qui ont coché et vont perdre l'accès ; leurs coches restent.
- [ ] L'accès décidé à l'arrivée sur l'adresse, côté serveur : qui tient la liste, les membres des événements où elle est partagée, tout le monde si elle est publique. Les deux pages de refus, qui ne disent rien de la liste.
- [ ] Un membre voit dans la carte de l'événement les listes qui y sont partagées, et les ouvre sans lien ; la pastille qui ramène à l'événement.
- [ ] Les mêmes coches partout où la liste est partagée.
- [ ] « Ce que j'offre ailleurs » : les listes publiques où j'ai coché sans être membre ; une liste qui n'est plus publique en disparaît.
- [ ] La migration : une liste partagée par lien aujourd'hui devient publique ; une liste dont le partage est éteint devient un brouillon ; les anciennes adresses mènent au même endroit.

## Hors périmètre

- Le dessin d'une liste : inchangé.
- « Celui qui m'a tiré » et tout ce qui touche aux pistes (ticket 107).
- La liste reprise de l'an dernier (ticket 108).

## C'est fini quand

- [ ] Un brouillon n'est lu par personne d'autre que ceux qui le tiennent, par aucune route (un test d'isolation le vérifie).
- [ ] Un compte hors de l'événement ne lit pas une liste qui n'y est partagée qu'aux membres ; un membre la lit.
- [ ] Une liste partagée dans deux événements montre les mêmes coches aux deux.
- [ ] Resserrer le partage d'une liste où deux personnes ont coché affiche « 2 », et leurs coches sont toujours là après.
- [ ] Les maquettes du ticket sont reproduites.
- [ ] `/controle` passe.

## Compte rendu

À remplir par Claude Code à la fin : ce qui a été fait, ce qui a été décidé seul (et pourquoi), les écarts avec les maquettes, les questions posées, les commits.
