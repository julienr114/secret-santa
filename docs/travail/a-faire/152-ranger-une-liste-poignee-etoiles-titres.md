# 152 — Ranger une liste : la poignée et son menu, les étoiles, les titres

- **Dépend de** : 144 (la carte blanche de l'écriture), 147
- **Avant** : la bascule (ticket 113) ; Julien, le 23 novembre 2026 : « j'aimerais bien l'inclure avant la V3 »
- **Migration** : oui (les étoiles d'une idée, et ce qui distingue un titre d'une idée) ; elle s'ajoute à celles de la bascule : mettre à jour le pas-à-pas `bascule-v3.md` et `pnpm v3:essai`
- **Maquettes** : `V3ListeLigneMenu`, `V3ListeLigneEtoiles`, `V3ListeLigneTitre`, `V3ListeLigneDeplacer`, `V3ListeTitres`

## Objectif

Julien, en écrivant la liste de son enfant : des boîtes de Playmobil à ranger sous un titre, et des étoiles pour dire lesquelles il préfère. La ligne qu'on écrit gagne une poignée qui ouvre un menu ; on y pose une à trois étoiles, on y fait d'une ligne un titre, on y supprime la ligne.

## À lire d'abord

- `docs/spec/v3/listes.md` (« Ranger une liste : la poignée, les étoiles, les titres »)
- `docs/decisions/2026-11-23-des-etoiles-et-des-titres-dans-une-liste.md` (ce qu'on a écarté, et pourquoi)
- `IdeaLine.vue` (la poignée au survol, `useListDragging`, la suppression d'une idée cochée), `DragGhost.vue`

## À faire

- [ ] **Une seule poignée, à droite** : dans la carte de l'écriture, au bout de la ligne ; sur ordinateur, au survol de n'importe quelle ligne, au même endroit. **La poignée de gauche (`drag-handle`, au survol) disparaît.**
- [ ] **Un geste pour deux usages** : un toucher ou un clic ouvre le menu ; rester appuyé (ou bouger, bouton enfoncé) passe en déplacement, avec le fantôme qui existe. Un déplacement commencé n'ouvre pas le menu au relâchement. L'appui long sur une ligne, sur un téléphone, continue de la soulever. Le clavier se replie tant que le menu est ouvert, et revient après les étoiles ou « En faire un titre ».
- [ ] Au clavier : la poignée prend le focus, Entrée et Espace ouvrent le menu ; « Monter » et « Descendre » remplacent le glisser (les raccourcis d'aujourd'hui, s'il y en a, restent).
- [ ] **Le menu** (un composant, pas un panneau du bas) : sous la poignée, au-dessus quand la place manque ; fermé par un toucher dehors et par Échap, navigable au clavier (`role="menu"`).
- [ ] **« Monter », « Descendre »** : d'un cran dans la partie de la personne (le `step` qui existe pour le glisser) ; absents en première et en dernière place.
- [ ] **« Déplacer vers… »** : un panneau du bas avec les autres personnes de la liste ; la ligne arrive à la fin de la partie choisie, avec sa coche si elle en a une ; message en bas, « Déplacée vers {name} ». Absent quand la liste n'a qu'une personne.
- [ ] **« Envie »** : trois étoiles, une valeur de 0 à 3 par idée. Toucher la n-ième en met n ; toucher la dernière allumée remet à 0. Pleines et pêche soutenu (une couleur du thème), en contour quand elles sont éteintes.
- [ ] **Les étoiles se lisent** au bout du texte de l'idée, pour tout le monde (ceux qui tiennent la liste, les membres, les visiteurs d'une liste publique), avec un texte pour les lecteurs d'écran (« Envie : 2 sur 3 »). Elles ne changent l'ordre de rien.
- [ ] **« En faire un titre »** / « En refaire une idée » : la ligne change sur place. Un titre n'a ni case, ni lien, ni étoile ; il ne se coche pas, ne compte pas dans le nombre d'idées, et n'est proposé nulle part où l'on choisit une idée. En faire un titre une idée déjà cochée par quelqu'un : refuser, avec un message (« Quelqu'un l'offre déjà. »).
- [ ] **Le titre à l'écran** : un point plein sur la ligne qui part de l'icône de la personne (la ligne ne s'interrompt pas), le texte en gras, 19 px, l'écriture des prénoms ; un vrai titre pour les lecteurs d'écran (`h3`).
- [ ] **« Supprimer la ligne »** : le chemin qui existe quand on vide une ligne, y compris la question posée quand quelqu'un l'a cochée.
- [ ] Les titres et les étoiles suivent la liste **reprise** d'une année sur l'autre et le temps réel, comme le texte et le lien.
- [ ] Trois langues ; tests (unitaires et Playwright : poser des étoiles, faire un titre, le défaire, supprimer).

## Hors périmètre

- Un prix indicatif, un détail sous l'idée : idées notées, pas décidées.
- Trier ou filtrer par étoiles.

## C'est fini quand

- [ ] J'écris « Playmobil », j'en fais un titre, j'écris trois boîtes dessous, je donne trois étoiles à l'une : tout le monde le lit ainsi.
- [ ] Rien ne change pour cocher ni pour compter les cadeaux.
- [ ] `/controle` passe.

## Compte rendu

À remplir par Claude Code à la fin : ce qui a été fait, ce qui a été décidé seul (et pourquoi), les écarts avec les maquettes, les questions posées, les commits.
