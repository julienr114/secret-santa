# Cocher pour quelqu'un

21 novembre 2026 · demandé par Julien après avoir essayé les listes : « celui qui tient la liste doit pouvoir cocher une idée et désigner n'importe quelle personne qui l'offre : quelqu'un de connu, ou juste un prénom écrit. On doit pouvoir changer la personne, et en ajouter une. » Les règles de détail ci-dessous sont proposées par la conception : Julien peut dire non à chacune.

## Contexte

Aujourd'hui, celui qui tient la liste coche à son propre nom, et peut décocher pour quelqu'un (22.19 du README). Il ne peut pas noter ce qu'on lui a dit de vive voix : Mamie, qui n'ouvrira jamais la liste, a annoncé au téléphone qu'elle prenait le vélo. Il coche alors à son nom, et plus personne ne sait qui offre quoi.

## Décision

- **Ceux qui tiennent une liste disent qui offre une idée**, à la place de la personne. C'est le pendant de « Décocher pour quelqu'un ».
- **Un seul panneau, « Qui l'offre ? »**, sert à désigner, à changer et à ajouter : des prénoms à cocher, et « Quelqu'un d'autre… » pour en écrire un.
- **Quelqu'un que l'application connaît** (il tient la liste, ou il y a déjà coché sans être anonyme) : la coche est la sienne. Il la voit chez lui comme « Tu l'offres », et peut la retirer.
- **Un prénom écrit** n'est relié à rien. Il est proposé ensuite sur cette liste, pour ne pas le réécrire.
- **Un prénom avec son adresse email**, si celui qui tient la liste le veut (Julien, le même soir : « il faudrait qu'il puisse le rattacher à un compte, avec une adresse ; les deux options ») : la coche est gardée pour cette adresse, et devient celle de la personne dès qu'elle se connecte avec. On ne dit jamais si l'adresse avait déjà un compte.
- **Personne n'est prévenu** : ni email, ni notification. Celui qui tient la liste note ce qu'on lui a dit ; il ne parle pas au nom des autres.
- **« Une personne » ou « Plusieurs »**, sous le titre, avec le composant de choix qui existe déjà (Julien : il faut le choisir pour cocher plus d'une personne). « Une personne » : des ronds, un seul à la fois, parce que désigner quelqu'un à sa place est le cas courant et doit se faire d'un geste. « Plusieurs » : des cases carrées, autant qu'on veut ; c'est le cadeau à plusieurs d'aujourd'hui, et « On est au complet » le ferme, avec les mots d'aujourd'hui.
- **Ceux qui tiennent la liste ont les mêmes droits que celui qui a proposé un cadeau à plusieurs** (Julien, le même soir) : l'ouvrir, le fermer, changer qui en fait partie.
- **Une coche anonyme ne se modifie pas** : on ne sait pas de qui elle est. Elle se décoche, comme aujourd'hui.
- **La trace reste** : le panneau dit qui a coché, ou qui a noté, et quand.

## Écarté

- Ne garder qu'un prénom, même pour quelqu'un de connu : Mamie, qui a un compte, ouvrirait la liste et lirait « C'est pris » sur son propre cadeau.
- Prévenir la personne désignée : un email de plus, envoyé au nom de quelqu'un qui n'a rien demandé.
- Cacher aux autres les prénoms d'un cadeau à plusieurs quand c'est celui qui tient la liste qui l'a noté (première proposition de la conception) : une règle de plus, que Julien ne veut pas. Un cadeau à plusieurs se montre comme aujourd'hui.
- Deux interrupteurs l'un sous l'autre, « À plusieurs » puis « Ouvert aux autres » : Julien les trouve bizarres, et le second disait à l'envers ce que « On est au complet » dit déjà.
- Des cases à cocher sans mode : pour mettre Mamie à ma place, il fallait me décocher puis la cocher, et l'oublier créait un cadeau à plusieurs.
- Ouvrir « Qui l'offre ? » dès qu'on touche une case libre : cocher à son propre nom reste un seul geste.

## Pour après

Dans la V3, donner l'adresse de quelqu'un en cochant pour lui le fait entrer dans l'événement de la liste, comme « Inviter quelqu'un » (`2026-11-21-on-entre-par-un-secret-santa-ou-par-une-liste.md`). Julien : « ça, c'est pour après ». Ce n'est dans aucun ticket.

## Où ça s'applique

À faire sur `main` avant la V3, **sans ticket** (Julien, le même soir) : tout est dans `docs/refonte/cocher-pour-quelqu-un/PROMPT.md`, avec l'image des six écrans. Maquettes : `ListeCocherPourMoi`, `ListeCocherPourDepart`, `ListeCocherPourChoix`, `ListeCocherPourLigne`, `ListeCocherPour`, `ListeCocherPourAutre`. README, section 22.19. `docs/spec/v3/listes.md` (« Cocher pour quelqu'un ») le garde pour la V3.
