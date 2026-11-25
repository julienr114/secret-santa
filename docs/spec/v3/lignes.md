# Les lignes : leur titre et leur texte

Réponse aux questions Q-010 et Q-012 (21 novembre 2026). Décision : `2026-11-21-le-nom-d-une-fete-dans-une-phrase.md`.
Maquettes : `V3Accueil`, `V3AccueilJeu`, `V3AccueilAnnee`, `V3Fete`, `V3FeteOrganisateur`, `V3FeteAnneePassee`, `V3FetesPassees`.

Sur l'accueil et sur la page d'un événement, chaque Secret Santa et chaque liste est une ligne : un titre, un texte dessous, parfois un point rouge. Ce fichier dit quoi écrire, et quand.

## Les règles communes

- **Le texte dit un état, jamais un mode d'emploi.** Un seul état, deux au plus, séparés par « · ».
- **Pour chaque ligne, les cas sont dans l'ordre : le premier qui s'applique est écrit.**
- **Le point rouge** accompagne les cas marqués ●. Il s'éteint quand j'ouvre la chose (`accueil-et-creation.md`, « Quoi de neuf »). Il n'est allumé que si une nouveauté pas encore vue vise cette chose : un point rouge a toujours sa ligne dans « Quoi de neuf ». Un cas marqué ● sans nouveauté (une donnée d'avant les nouveautés) garde son texte, sans point.
- **Aucun résultat de tirage**, ni sur l'accueil ni sur la page d'un événement. Seule exception : mon propre résultat, pour une année finie, dans les pages des événements passés.
- **Aucun prénom dans une demande d'idées** : elle est anonyme.
- Les nombres s'accordent (« 1 cadeau », « 2 cadeaux », « 1 nouvelle idée », « 3 nouvelles idées ») dans les trois langues.
- Une ligne sans rien à dire n'a que son titre.

## La ligne d'un Secret Santa

**Titre** : « Le Secret Santa » s'il est le seul de l'événement cette année ; sinon son nom (« Les enfants »).

**Qui voit quoi** :

- Sur l'accueil, la ligne me parle comme participant si je participe ; elle ouvre ma page.
- **Sur l'accueil, si je participe et que je l'organise, une deuxième ligne est accrochée dessous** (Julien, 24 novembre 2026 : « il faut qu'on distingue bien qu'il y en a une en tant que participant, et l'autre en tant qu'organisateur » ; maquettes `V3Accueil`, `V3AccueilJeu`). Titre : **« Tu l'organises »** ; dessous, le texte de l'organisateur ; elle ouvre le suivi. Elle est accrochée à la ligne du Secret Santa : pas de trait entre les deux, pas d'icône, son texte aligné sous « Le Secret Santa », sa propre flèche, et la hauteur d'une ligne (54 px) pour se toucher sans gêne. Elle vient juste après, donc avant « Devine qui ». Elle n'a jamais de point rouge.
- Sur l'accueil, si je l'organise sans participer, il n'y a qu'une ligne : elle parle à l'organisateur et ouvre le suivi.
- Sur la page d'un événement, un organisateur voit le texte de l'organisateur, et la ligne ouvre le suivi ; un membre voit le texte du participant, et la ligne ouvre sa page.
- Je ne participe pas et je ne l'organise pas : la ligne n'est pas montrée.

**Le texte du participant** :

| Cas | Texte |
|---|---|
| Le tirage n'a pas eu lieu | « Pas encore tiré » |
| Tiré, je n'ai pas ouvert mon enveloppe | « Ton enveloppe t'attend » ● |
| Dévoilé, je n'ai pas encore regardé | « Dévoilé · qui a offert à qui » ● |
| Quelqu'un m'a demandé des idées et je n'ai rien écrit depuis | « Quelqu'un te demande des idées » ● |
| La liste ou les goûts de la personne que j'ai tirée ont changé depuis ma dernière visite | « De nouvelles idées t'attendent » ● |
| Dévoilé, déjà regardé | « Dévoilé » |
| Sinon | « Tu sais à qui tu offres » |

**Le texte de l'organisateur** :

| Cas | Texte |
|---|---|
| Le tirage n'a pas eu lieu | « À préparer · 5 participants » (le nombre d'inscrits) |
| Tiré, tout le monde n'a pas ouvert | « Fait · 6 sur 8 ont découvert » |
| Tiré, tout le monde a ouvert | « Fait · tout le monde a découvert » |
| Dévoilé | « Dévoilé » |
| Clôturé | « Terminé » |

« Tu l'organises » n'est pas un état : on ne l'écrit pas dans un texte. C'est le titre de la ligne de l'organisateur, sur l'accueil et sur la page de l'événement, quand je participe aussi.

## L'en-tête d'une carte

Julien, le 24 novembre 2026 : on ne voit pas que l'en-tête d'une carte se touche ; une ligne « Gérer l'événement » en plus, « ça fait un peu trop ». Maquettes `V3Accueil`, `V3AccueilSansSecret`, `V3AccueilAnnee`.

- **La date est sous le titre**, en petit, dans toutes les cartes : le titre a toute la largeur. Un titre trop long passe sur deux lignes, puis il est coupé par « … ».
- **À droite, pour un membre** : la flèche, comme avant.
- **À droite, pour un organisateur de l'événement** : **une roue crantée dans un rond** (38 px) à la place de la flèche. Son nom pour les lecteurs d'écran : « Gérer l'événement ».
- Tout l'en-tête se touche et ouvre la page de l'événement, roue comprise : la roue ne mène nulle part ailleurs.
- Il n'y a pas de ligne « Gérer l'événement » dans la carte.

## La ligne « Devine qui »

Elle n'existe que si le jeu est activé, que le tirage est fait et que je participe. Titre : « Devine qui ».

| Cas | Texte |
|---|---|
| Le jeu est ouvert, je n'ai pas joué | « À toi de jouer · jusqu'au 25 décembre à 18 h » ● (la fin du jeu) |
| Le jeu est ouvert, j'ai joué | « Tu as joué · réponse le jour J » |
| Le jeu est fermé, le palmarès n'est pas sorti | « Réponse le jour J » |
| Le palmarès est sorti, je ne l'ai pas vu | « Le palmarès est là » ● |
| Je l'ai vu | « Le palmarès » |

## La ligne d'une liste

**Titre** :

- je tiens la liste (je l'ai créée, ou on m'a invité à la tenir) : **« Ma liste de cadeaux »** (pas « Ma liste » tout court : Julien, 22 novembre 2026) ;
- sinon **« La liste de »** suivi des prénoms de ceux pour qui elle est faite : un (« La liste de Mamie »), deux (« La liste de Léo et Zoé »), trois (« La liste de Léo, Zoé et Hugo »), au-delà « La liste de Léo, Zoé et 2 autres » ;
- une liste sans personne (un mariage) : les prénoms de ceux qui la tiennent (« La liste de Karim et Sofia »).

**Le texte, quand je la tiens**, en deux morceaux au plus :

0. Si elle est en brouillon : **« Pas encore partagée »**, et rien d'autre.
1. D'abord pour qui elle est, avec « Pour » devant : « Pour Léo, Zoé et moi », « Pour Léo » (les mêmes règles que le titre, « moi » en dernier). C'est ce qui dit que je la tiens pour eux. Si elle n'est que pour moi : « 9 idées ». Si elle est vide : « Pas encore d'idées », et rien d'autre.
2. Puis le premier de ces cas :
   - des cadeaux ont été cochés depuis ma dernière visite : « 2 cadeaux cochés » ● ;
   - elle est réservée à celui qui m'a tiré : « seul celui qui t'a tiré la voit » ;
   - elle est aussi partagée dans d'autres événements : « aussi : Chez Mamie », ou « aussi dans 2 autres événements » (voir plus bas).

**Le texte, quand elle est à quelqu'un d'autre** :

| Cas | Texte |
|---|---|
| Elle est vide | « Pas encore d'idées » |
| J'y offre quelque chose, et il y a du nouveau depuis ma dernière visite | « Tu offres 2 cadeaux · 1 nouvelle idée » ● |
| Il y a du nouveau | « 3 nouvelles idées » ● |
| J'y offre quelque chose | « Tu offres 2 cadeaux » |
| Sinon | « 9 idées » |

Une liste qui vient d'être créée n'a pas de texte à elle : ses idées sont nouvelles pour moi, c'est le cas « 4 nouvelles idées ». On n'écrit pas « Elle vient de la créer » : l'application ne connaît pas le genre.

« Depuis ma dernière visite » se compte comme aujourd'hui pour les listes (la date de ma dernière ouverture de cette liste).

## Le nom d'un événement dans un texte

Le nom d'un événement est libre : « Chez Mamie », « Famille Camille », « Les 40 ans de Tonton ». On ne peut pas savoir s'il faut « chez », « dans » ou « à ». Donc :

- **On ne colle jamais une préposition devant le nom d'un événement.**
- Dans un texte sous une ligne : deux-points. « aussi : Chez Mamie » pour un autre événement ; **à partir de deux autres, on compte** : « aussi dans 2 autres événements ».
- Dans une phrase : le nom entre guillemets, derrière un mot qui ne change pas. « Quitter « Famille Camille » ? », « Retirer ta liste de « Chez Mamie » ? », « Et dans l'événement « Notre mariage » ».
- Quand la phrase n'a pas besoin du nom, on ne le met pas : « Elle reste dans tes autres événements. »

Les trois langues suivent la même forme : « also: Chez Mamie », « also in 2 other events » ; « auch: Chez Mamie », « auch in 2 weiteren Events ». Le nom commun est « événement » (`vocabulaire.md`).

## Les deux lignes du bas de l'accueil

- **« Les événements passés »** : montrée dès qu'il y en a un. Texte : le nom du plus récent, puis le compte des autres : « Les 6 ans de Léo », « Les 6 ans de Léo et 1 autre », « Les 6 ans de Léo et 4 autres ». Un événement qui revient compte une fois par année passée.
- **« Ce que j'offre ailleurs »** : montrée dès qu'il y a une liste publique où j'ai coché sans être membre de son événement. Une liste : « Le mariage de Karim et Sofia · 1 cadeau ». Plusieurs : « 3 listes · 5 cadeaux ».

## Les lignes des événements passés

Sur la page d'un événement, « Les années passées » : le titre est le nom de l'année (« Noël 2025 » ; pour un événement fait pour un proche dont on connaît la naissance, « Ses 3 ans »).

Dans « Les événements passés » : le titre est le nom de l'événement, sous l'année ; le texte commence par la date (« 25 décembre »).

Le texte, le premier qui s'applique :

| Cas | Texte |
|---|---|
| J'y avais tiré quelqu'un | « Tu offrais à Zoé » (deux Secret Santa : « Tu offrais à Zoé et à Léo ») |
| J'y avais coché des cadeaux | « Tu as offert 3 cadeaux » |
| J'y tenais une liste | « 8 cadeaux offerts » |
| Sinon | rien |

## Les autres lignes de la page d'un événement

- **Les membres** : « 12 membres », rien d'autre. La ligne ouvre « Membres ».
- **« Quitter cet événement »** : pas de texte dessous. Ce que ça fait est dit dans le panneau, avant le geste.
