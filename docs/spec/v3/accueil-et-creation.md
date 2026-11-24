# L'accueil, la barre du bas et « Créer »

Décisions : `2026-11-20-on-cree-un-secret-santa-ou-une-liste.md`, `2026-11-20-un-onglet-creer.md`.
Maquettes : `V3Accueil`, `V3AccueilAvantNoel`, `V3AccueilVide`, `V3AccueilAnnee`, `V3AccueilJeu`, `V3FetesPassees`, `V3QuoiDeNeuf`, `V3AccueilPlusOuvert`, `V3FeteNouvelle`, `V3FeteMembresReprendre`, `MenuAvatar`, `MenuAvatarOuvert`.

## La barre du bas

« Accueil », « Créer », « Quoi de neuf ». « Admin » en plus pour le super-admin.

- La pastille des nouveautés est sur « Quoi de neuf ».
- « Créer » est dessiné comme les deux autres onglets (une icône au trait, son nom dessous) : pas de rond rouge.
- Elle est sur toutes les pages qui l'ont aujourd'hui. Les onglets « Tirages » et « Listes » disparaissent, et leurs pages avec eux (`navigation.md`).

## Le menu du compte

L'icône de la personne connectée remplace le burger, en haut à droite. Le menu : « Mon compte » en tête, avec le prénom et l'adresse ; « Langue » ; « Se déconnecter ».

## « Créer »

L'onglet ouvre un panneau du bas, « Créer », de deux lignes sans sous-titre :

1. **Un Secret Santa**
2. **Une liste de cadeaux**

On ne propose pas « Un événement » : l'événement est la première étape des deux.

### Première étape d'un Secret Santa : « Pour quelle occasion ? »

Maquette : `V3TirageQuelleFete`. Un seul choix (un Secret Santa est dans un seul événement) :

- un des événements **que j'organise** ; un événement qui a déjà son Secret Santa de l'année reste proposé, ce sera un autre ;
- « Une autre occasion », qui crée un événement.

Les événements où je ne suis que membre ne sont pas proposées. Arrivé à la limite de 3 : `secret-santa.md`.

### Partager une liste : « Qui voit ta liste ? »

Maquette : `V3ListeQui`. Ce n'est plus la première étape d'une liste : elle naît en brouillon, et « Partager », dans sa barre du haut, ouvre « Qui voit ta liste ? » (`listes.md`). Un événement se crée depuis là par « Ajouter », « Quelqu'un d'autre », « Dans une autre occasion ».

### « Une autre occasion » : l'écran où un événement se crée

Maquette : `V3FeteNouvelle` (titre : « Pour quelle occasion ? »).

1. La catégorie, en six tuiles : elle remplit le reste (`categories.md`).
2. Le nom, la date (trois listes, `regles-d-ecran.md`), « Elle revient chaque année ».

Puis on arrive droit sur le Secret Santa ou sur la liste qu'on venait créer. **On ne demande pas qui en fait partie** : les gens entreront par le Secret Santa ou par la liste (`fete.md`, « Les membres »). Si on s'arrête là, l'événement existe, avec moi seul.

## L'accueil

Maquette : `V3Accueil`.

- « Bonjour Hugo ».
- **Une section par saison de Noël** : « Noël 2026 · dans 35 jours ». C'est la catégorie qui regroupe : tous mes événements de catégorie Noël de la même année vont sous ce titre, quel que soit leur nom. **Aucune autre catégorie n'est regroupée.**
  - Le décompte du titre ne dépend d'aucun événement : il compte jusqu'au **25 décembre à minuit**, toujours.
  - Dans la section, les événements sont dans l'ordre des dates, le plus proche en haut.
- **Une carte par événement** : l'emoji de sa catégorie dans une tuile en couleur (`categories.md`, « L'icône d'un événement est une tuile en couleur »), son nom, sa date dessous, et à droite une flèche, ou une roue crantée si je l'organise (l'en-tête ouvre l'événement ; `lignes.md`, « L'en-tête d'une carte ») ; dessous, ses Secret Santa et les listes de ses membres, au même niveau. Une liste dans deux événements apparaît dans les deux cartes (« aussi chez Mamie »).
  - **Dans un événement que j'organise** (Julien, 24 novembre 2026 ; `lignes.md`) : la roue dans l'en-tête ; et **« Tu l'organises »**, accrochée sous la ligne d'un Secret Santa où je participe aussi, qui ouvre le suivi.
  - **En bas de la carte, ce qu'on peut y créer** (Julien, 23 novembre 2026 ; maquette `V3AccueilSansSecret`) : **« Créer un Secret Santa »** quand l'événement n'en a pas cette année et que je l'organise ; **« Créer une liste de cadeaux »** quand je n'y tiens aucune liste. Une ligne chacun, un « + » devant, la même écriture. Le Secret Santa est en premier dans un événement de catégorie Noël (c'est ce que la catégorie propose en premier, `categories.md`), la liste en premier ailleurs. « Créer un Secret Santa » ouvre le formulaire, l'occasion déjà choisie.
- **L'ordre est celui des dates** (`2026-11-21-l-accueil-suit-les-dates.md`, maquette `V3AccueilAvantNoel`) : la section de Noël est posée à la place de son premier événement ; **un événement qui vient avant est au-dessus, sans titre** ; ce qui vient après est sous « Plus tard ». Sans section de Noël à venir : des cartes sans titre, puis « Bientôt ».
- **« Bientôt »**, après la section de Noël : avec la date de naissance d'un proche, l'accueil propose **60 jours avant** « L'anniversaire de Zoé · dans 24 jours · ses 4 ans », avec « Préparer ». Un toucher ouvre « Pour quelle occasion ? » déjà rempli. Il ne propose ni mon propre anniversaire, ni celui qu'une de mes événements couvre déjà.
- **« Plus tard »** : les événements qui viennent après la saison de Noël, par date.
- **Le titre et le texte de chaque ligne** : `lignes.md`.
- En bas, deux lignes : **« Les événements passés »** et **« Ce que j'offre ailleurs »** (`listes.md`).

L'accueil fait office de calendrier : pas d'écran à part. Pas de rubrique « Reçues par un lien ». Pas de bouton « Nouvelle liste » ni « Nouvel événement » en bas de page.

## L'accueil d'un compte tout neuf

Maquette : `V3AccueilVide`. Il ne parle pas de « événement ». Deux cartes :

- **Un Secret Santa** : « Chacun tire au sort la personne à qui il offre un cadeau. », bouton rouge « Créer un Secret Santa ».
- **Une liste de cadeaux** : « Tes idées, que tes proches cochent pour ne pas offrir deux fois la même chose. », bouton « Écrire ma liste ».

Les deux mènent à « Pour quelle occasion ? » (les catégories).

## L'année suivante

Maquette : `V3AccueilAnnee`. Deux mois avant la date d'un événement qui revient :

- l'organisateur voit « Préparer Noël 2027 » sur la carte de l'événement. Un toucher recrée **autant de Secret Santa que l'an dernier**, chacun avec ses participants, ses réglages et la mémoire de ses tirages passés (Q-008). Rien n'est tiré ni envoyé : ils sont « à préparer ». L'organisateur **supprime** celui qui ne sert plus (« Supprimer ce Secret Santa », dans ses réglages, tant qu'il n'est pas tiré) ; un nouveau membre de l'événement n'est ajouté d'office à aucun ;
- chacun voit « Reprendre ma liste de l'an dernier ».

Un événement qui ne revient pas passe dans « Les événements passés » après sa date.

La liste reprise : `listes.md`, « La liste reprise de l'an dernier ».

## Le jeu, sur l'accueil

Maquette : `V3AccueilJeu`. Il n'y a pas de grande carte en haut de l'accueil pour le jeu ou le dévoilement : tout tient dans la carte de l'événement, par une ligne et un point rouge.

- **« Devine qui » ouvert** : une ligne « Devine qui · À toi de jouer · jusqu'au 25 décembre à 18 h », avec le point rouge tant que je n'ai pas joué. Elle mène au pronostic.
- **Le Secret Santa dévoilé** : sa ligne dit « Dévoilé · qui a offert à qui », avec le point rouge tant que je ne l'ai pas ouvert.
- **Le palmarès** : « Devine qui · Le palmarès est là », pareil.
- **Jamais un résultat de tirage sur l'accueil** : la ligne d'un Secret Santa tiré dit « Tu sais à qui tu offres », sans prénom.
- **Après la date** (Q-009) : un événement reste sur l'accueil tant que son Secret Santa n'est pas clôturé, **14 jours au plus** après sa date ; 3 jours s'il n'a pas de Secret Santa. Il garde sa place dans l'ordre des dates, donc en haut. Ensuite il part dans « Les événements passés », ou passe à sa date de l'année suivante s'il revient.

## « Quoi de neuf »

Maquette : `V3QuoiDeNeuf` (remplace `NotifCentre`).

- **Une section par événement**, avec l'emoji de sa catégorie ; l'événement qui a la nouveauté la plus récente est en haut. Dans une section, du plus récent au plus ancien.
- Une liste publique où j'ai coché, sans être membre de son événement, a sa section à elle, au nom de l'occasion.
- Une ligne est en gras, avec un point rouge, tant que je n'ai pas ouvert ce qu'elle signale. C'est le même point que sur l'accueil : **il s'éteint quand j'ouvre la chose**, pas quand j'ouvre « Quoi de neuf ».
- **Un point rouge a toujours sa ligne ici** (Julien, 23 novembre 2026). Le point d'une ligne de l'accueil ou d'un événement n'est pas calculé de son côté : il s'allume parce qu'une nouveauté pas encore vue vise cette chose. Pas de nouveauté, pas de point ; le texte de la ligne, lui, dit toujours l'état (« Ton enveloppe t'attend »).
- **Une nouveauté pas encore vue ne s'efface pas.** Seules celles que j'ai vues partent au bout de trente jours.
- Les nouveautés d'une liste qui est dans deux événements n'apparaissent qu'une fois, sous celui dont la date est la plus proche.
- Une demande d'idées est anonyme ici aussi : « Quelqu'un te demande des idées de cadeaux », jamais un prénom.
- En bas, une ligne « Choisir ce qui me prévient » (elle n'apparaît qu'avec la page « Me prévenir », ticket 121) ; dessous, « Ce que tu as vu s'efface au bout de trente jours ». Pas de phrase d'introduction.
- **Un mot de l'application** peut être posé en tête, au-dessus des sections : un texte court, dans la langue du compte, montré à ceux qu'il concerne, qui s'en va quand je l'ai fermé. Il sert le jour de la bascule (`migration.md`, « La bascule »).

### Hors de l'application

Les règles de ce qui prévient hors de l'application restent celles du README 22.22. La V3 y change trois choses :

- **le résumé du matin** range ses nouveautés comme « Quoi de neuf » : un bloc par événement, au nom de l'événement ;
- **suivre une liste** est possible sur toute liste que je peux ouvrir sans la tenir ; je ne suis plus prévenu dès que je n'ai plus le droit de l'ouvrir ;
- **aucun texte envoyé** (email, résumé, notification du téléphone) ne dit à qui j'offre ni qui me demande des idées.

## Les événements passés

Maquette : `V3FetesPassees`. La ligne du bas de l'accueil dit la plus récente et le compte (« Les 6 ans de Léo et 4 autres »).

- Une section par année, la plus récente en haut.
- Une ligne par événement : l'emoji de sa catégorie, son nom, sa date, et ce que j'y ai fait (« tu offrais à Zoé », « tu as offert 3 cadeaux », « 8 cadeaux offerts » si c'était pour quelqu'un de mes proches).
- Un événement qui revient y laisse une ligne par année ; la ligne ouvre cette année-là (`fete.md`, « Une année passée »).
- « Tu offrais à Zoé » est mon propre résultat, pour un événement fini : il peut s'écrire ici, pas sur l'accueil.
