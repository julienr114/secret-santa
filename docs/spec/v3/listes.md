# Les listes

Décisions : `2026-11-22-qui-voit-ta-liste-deux-choix.md`, `2026-11-22-le-secret-santa-et-ma-partie-d-une-liste.md`, `2026-11-21-le-partage-d-une-liste-a-des-stades.md`, `2026-11-20-le-groupe-devient-la-fete.md`, `2026-11-20-pistes-et-listes-fusionnent.md`, `2026-11-20-on-cree-un-secret-santa-ou-une-liste.md`.
Maquettes : `V3ListeOccasion`, `V3ListeNouvelle`, `V3ListeQui`, `V3ListeQuiSecret`, `V3ListeQuiModifier`, `V3ListeQuiAjouter`, `V3ListeQuiRetirer`, `V3ListeQuiOuvrir`, `V3ListeQuiLien`, `V3ListeLienChanger`, `V3ListeLienNouveau`, `V3ListeInviterEmail`, `V3ListeInviteEnvoyee`, `V3ListeAideLien`, `V3ListeSecretNouvelle`, `V3Liste`, `V3ListeSecret`, `V3ListePublique`, `V3ListeFermee`, `V3ListeFermeeConnecte`, `V3ListeMembre`, `V3ListeReprise`, `V3ListeCompteCree`, `V3ListeAdresse`, `V3OffreAilleurs`.

Le dessin d'une liste (les lignes, les coches, le mode anonyme, le fil, « ses goûts ») ne change pas : c'est celui de la Correction 30 de l'ancien plan et du README 22.19 à 22.21. Change où elle vit et qui la voit.

## Le partage d'une liste, par stades

Décision : `2026-11-21-le-partage-d-une-liste-a-des-stades.md` (Julien, 21 novembre 2026). Ce qui suit remplace ce que ce fichier disait le 20 novembre : une liste n'est plus visible du seul fait d'être dans un événement.

**Une liste a toujours son lien**, qu'on peut copier à tout moment. **C'est à l'arrivée sur l'adresse que l'accès se décide**, selon le stade du partage :

| Stade | Qui entre |
|---|---|
| **Brouillon** | ceux qui tiennent la liste. C'est l'état de départ de toute liste |
| **Celui qui m'a tiré** | lui en plus (dans un événement où je participe à un Secret Santa) |
| **Un ou plusieurs événements** | leurs membres en plus ; dans l'événement de la liste, ceux que j'invite et ceux qui ouvrent son lien en deviennent membres (« Inviter quelqu'un ») |
| **Publique** | quiconque a le lien, sans compte. C'est le dernier stade |

- Les stades se cumulent : une liste peut être réservée à celui qui m'a tiré dans un événement et ouverte à tous les membres d'un autre. **« Publique » s'écrit à part** : à l'écran, on choisit entre « Qui je veux » et « Tout le monde », pas les deux (« Qui voit ta liste ? », plus bas). Une liste publique garde en mémoire ceux qu'on avait choisis.
- **Le partage se change dans les deux sens**, à tout moment.
- Chaque événement où la liste est partagée la montre dans sa carte ; une liste réservée à celui qui m'a tiré n'apparaît pas pour les autres membres.

## Une nouvelle liste

Maquettes : `V3ListeOccasion`, `V3ListeNouvelle`.

1. **« Pour quelle occasion ? »** : un de mes événements, ou « Une autre occasion » (qui en crée un, `accueil-et-creation.md`). La liste en prend le nom, la date et l'icône : on ne les redemande pas.
2. La liste s'ouvre, **en brouillon** : moi seul la vois. J'écris.
3. **« Partager »**, dans la barre du haut, la déroule : « Qui voit ta liste ? » est dedans.

### Depuis mon Secret Santa

Décision : `2026-11-22-le-secret-santa-et-ma-partie-d-une-liste.md` (Julien, 22 novembre 2026). Ce qui est lié à un Secret Santa, ce n'est pas une liste : **c'est moi, dans une liste**. Celui qui m'a tiré a le droit d'ouvrir la liste entière ; ce qu'on lui montre d'abord, c'est ma partie (`secret-santa.md`, « Du résultat à la liste »).

En touchant « Ma liste de cadeaux » sur la page de mon Secret Santa, ou « Écrire ma liste » dans l'email d'une demande d'idées :

- **Je ne tiens aucune liste de cette année où je figure** : la liste se crée sans rien demander. L'occasion est connue, « Celui qui m'a tiré » est choisi d'avance, **et j'y suis déjà, en premier** (`V3ListeSecretNouvelle`). Ce que j'écris est lu dès que c'est écrit, comme les pistes d'avant.
- **J'en tiens une ou plusieurs** : « Quelle liste pour ton Secret Santa ? » (`V3TirageQuelleListe`) les propose, une par ligne, avec « Pour Léo, Zoé et moi » et ses événements dessous ; puis « Une nouvelle liste ». La première est choisie d'avance : celle du même événement, sinon de la même catégorie, sinon la plus récente. « Continuer ». La liste choisie garde son partage : celui qui m'a tiré la voit en plus (les stades se cumulent). Une liste que je tiens mais où je ne figure pas n'est pas proposée.
- **Sous mon prénom**, dans la liste, une ligne par Secret Santa : l'icône du Secret Santa, « Secret Santa · Famille Camille » (`V3ListeSecret`). Elle mène à mon Secret Santa. Seuls ceux qui tiennent la liste la voient.

« Modifier » déroule la barre pour changer qui voit la liste (`V3ListeQuiSecret`) : « Celui qui m'a tiré » y est une ligne comme les autres. Tant qu'elle n'a aucune idée, la liste propose aussi « Repartir d'une liste » (plus bas).

## La barre du haut d'une liste

Décision de Julien, 22 novembre 2026 : la barre est **repliée**, et **elle se déroule sur place**. Ce qui suit remplace les deux lignes d'avant (l'adresse toujours visible) et le panneau du bas « Qui verra ta liste ? ».

**Repliée**, c'est une ligne : le stade, et un bouton. Elle reste collée sous la barre du haut pendant que la liste défile.

| Stade | Texte | Bouton |
|---|---|---|
| Brouillon (`V3ListeNouvelle`, `V3ListeReprise`) | « Brouillon » · « Toi seul la vois » | « Partager » |
| Celui qui m'a tiré (`V3ListeSecret`) | le nom de l'événement · « Seul celui qui t'a tiré la voit » | « Modifier » |
| Des événements (`V3Liste`) | « Famille Camille, Chez Mamie » · « 21 membres la voient » | « Modifier » |
| Publique (`V3ListePublique`) | « Publique » · « Toute personne qui a le lien la voit » | « Modifier » |
| Pour celui qui « aide à écrire » (`ListeAidePartage`) | les mêmes textes, plus « choisi par Camille » | « Le lien » |

**Le bouton la déroule là où elle est** : pas de panneau du bas, pas de voile, pas d'autre page. **Elle passe par-dessus la liste, elle ne la pousse pas** (Julien, 22 novembre, après l'avoir essayée) : la liste ne bouge pas, la barre déroulée flotte au-dessus, avec une ombre plus marquée. Toucher en dehors la replie, comme « Fermer ». Déroulée, **elle reste collée en haut** ; si elle est plus haute que l'écran, c'est son contenu qui défile, pas la page. Son bouton devient **« Fermer »**, qui la replie sans rien changer.

Dedans, dans cet ordre :

1. **L'adresse de la liste et « Copier le lien »** (« Copié », un instant). C'est le seul endroit où l'adresse est écrite : repliée, la barre ne la montre pas.
2. Pour ceux qui gèrent la liste : **« Qui voit ta liste ? »** (plus bas). **Il n'y a pas de bouton pour enregistrer** : chaque geste s'applique tout de suite, et la phrase de la barre suit (« 21 membres la voient »).

Celui qui « aide à écrire » n'a que l'adresse et « Copier le lien » (`V3ListeAideLien`).

Celui qui « gère la liste » a les mêmes boutons que celui qui l'a créée (`ListeTeneurs`). Les maquettes de liste d'avant (`ListeTeneur`, `ListeGlisser`…) ont cette barre, repliée.

## « Qui voit ta liste ? »

Décision : `2026-11-22-qui-voit-ta-liste-deux-choix.md` (Julien, 22 novembre 2026, après avoir essayé : « c'est incompréhensible »). Ce qui suit remplace la liste d'événements à cocher, le choix à deux sous un événement, l'interrupteur « Tout le monde, avec le lien » et le bouton « Enregistrer ».

Maquettes : `V3ListeQui` (un brouillon), `V3ListeQuiModifier`, `V3ListeQuiAjouter`, `V3ListeQuiSecret`, `V3ListeQuiRetirer`, `V3ListeQuiOuvrir`, `V3ListeQuiLien`, `V3ListeLienChanger`, `V3ListeLienNouveau`.

C'est ce que contient la barre du haut quand elle est déroulée, sous l'adresse. Le titre, « Qui voit ta liste ? », puis **deux choix qui s'excluent**, dans le composant à deux choix de l'application (`UiSegmented`) : **« Qui je veux »** et **« Tout le monde »**.

### « Qui je veux »

- **On ne voit que ceux qui voient la liste**, une ligne chacun, avec une croix pour le retirer :
  - un événement : son icône, son nom, « 12 membres » ;
  - **« Celui qui m'a tiré »** · « Secret Santa · Famille Camille », une ligne par Secret Santa auquel ma partie de la liste est liée (« Depuis mon Secret Santa »). Elle peut être là en même temps que l'événement : l'une dit que ma partie sert à mon Secret Santa, l'autre que tous les membres voient la liste.
- **« Ajouter »**, dessous, se déroule sur place en pastilles : mes autres événements, « Celui qui m'a tiré » (si je participe à un Secret Santa et que je figure dans la liste), et **« Quelqu'un d'autre »**. Toucher une pastille l'ajoute aux lignes du dessus, tout de suite. Toucher « Ajouter » une seconde fois le replie.
- **Personne encore** (un brouillon) : aucune ligne, et « Ajouter » est déjà ouvert.
- **« Quelqu'un d'autre »** ouvre la page « Inviter quelqu'un » (plus bas). La pastille n'est là que si la liste est déjà partagée avec les membres de son événement, puisque celui qu'on invite en devient membre.
- **« Changer de lien »**, en dernière ligne, dès que le lien fait entrer quelqu'un (la liste est partagée avec son événement). Pas sur un brouillon, ni sur une liste que seul celui qui m'a tiré voit.

### « Tout le monde »

- Le toucher demande d'abord : « Ouvrir ta liste à tout le monde ? » · « Toute personne qui a le lien pourra la voir et cocher un cadeau, sans compte. » · « Annuler » · « Ouvrir » (`V3ListeQuiOuvrir`).
- Une fois publique, il n'y a plus personne à choisir : il reste **« Changer de lien »** (`V3ListeQuiLien`).
- Revenir à « Qui je veux » retrouve ceux qui y étaient ; c'est resserrer le partage, avec sa confirmation (plus bas).
- **« Le message qui accompagne le lien » disparaît** : « Copier le lien » ne copie que l'adresse, ce message n'accompagnait plus rien.

### Changer de lien

`V3ListeLienChanger`, puis `V3ListeLienNouveau`. « Changer de lien ? » · « L'ancien lien ne marchera plus : il faudra renvoyer le nouveau. Ceux qui ont déjà coché un cadeau gardent la liste. » · « Annuler » · « Changer ». Ensuite la nouvelle adresse est dans la barre, et un message le dit : « Nouveau lien créé ».

### Resserrer le partage

Maquette : `V3ListeQuiRetirer`. Toucher la croix d'une ligne, revenir de « Tout le monde » à « Qui je veux » : chaque fois que des gens vont perdre l'accès, **une confirmation le dit avant**, dans la barre déroulée, et **compte ceux qui ont coché un cadeau**. Si personne ne perd rien (un événement sans autre membre que moi), la croix retire sans demander.

Pour un événement :

« Retirer ta liste de « Chez Mamie » ? » · « Ses 9 membres ne la verront plus. 2 d'entre eux ont coché un cadeau et ne pourront plus ouvrir la liste. Leurs cadeaux restent prévus. » · « Annuler » · « Retirer ».

Pour une liste publique : « 3 personnes ont coché un cadeau et ne pourront plus ouvrir la liste. Leurs cadeaux restent prévus. » Si personne n'a coché, la confirmation ne dit que la première phrase.

Pour ceux qui perdent l'accès, la liste disparaît, sans trace (Q-003). Leurs coches restent sur la liste : le cadeau est toujours prévu.

## Inviter quelqu'un

Maquettes : `V3ListeInviter`, `V3ListeInviterEmail`, `V3ListeInviteEnvoyee`, `V3ListePartageEmail`, `V3FeteMembresReprendre`. Décision : `2026-11-21-on-entre-par-un-secret-santa-ou-par-une-liste.md`.

On n'ajoute personne à un événement : du côté des listes, **c'est par une liste qu'on y entre**. Celui qui gère une liste partagée avec « Tous les membres » de **son événement** (l'occasion choisie à sa création) peut y faire entrer quelqu'un. On y arrive par la pastille « Quelqu'un d'autre » de « Qui voit ta liste ? ». La page dit : « Il verra ta liste et deviendra membre de l'événement. » Quatre lignes :

- **« Copier le lien »** : le lien de la liste. Celui qui l'ouvre et se connecte devient membre de l'événement, et la liste s'ouvre.
- **« Par son adresse email »** (`V3ListeInviterEmail`) : un prénom, une adresse, « Inviter », et dessous « Il reçoit un email à ton nom, et devient membre de « Famille Camille ». ». De retour sur la liste, un message : « Invitation envoyée » (`V3ListeInviteEnvoyee`). La personne est membre tout de suite et reçoit un email à mon nom (`V3ListePartageEmail`) : « Camille a partagé sa liste « Noël 2026 » avec toi » · « Coche ce que tu offres, et personne n'aura la même idée. » · « Voir la liste ».
- **« Reprendre ceux d'un autre événement »** : la page « Qui reprendre ? », la même que pour un Secret Santa (`secret-santa.md`, « Choisir les participants »).
- **« Dans une autre occasion »** · « Un nouvel événement, où partager ta liste » : crée un événement (`accueil-et-creation.md`). C'était la ligne « Une autre occasion » de « Qui verra ta liste ? ».

Règles :

- Le lien d'une liste ne fait entrer **que dans son événement**. Dans les autres événements où elle est partagée, seuls ceux qui en sont déjà membres la voient.
- Tant que la liste est un brouillon, ou réservée à celui qui m'a tiré, « Quelqu'un d'autre » n'est pas proposé et le lien ne fait entrer personne.
- À 30 membres, on n'invite plus et le lien ne fait plus entrer personne de nouveau (`fete.md`).
- « Changer de lien » vaut pour toute liste, pas seulement pour une liste publique : l'ancien lien ne fait plus entrer personne.
- Sur « Membres », celui qui est entré ainsi porte « La liste de Camille ».

## Arriver par le lien

Maquettes : `V3ListeFermee`, `V3ListeFermeeConnecte`.

- J'ai le droit d'entrer (je la tiens, je suis celui qui a tiré son auteur, je suis membre d'un événement où elle est partagée, ou elle est publique) : la liste s'ouvre.
- Je ne suis pas connecté et elle n'est pas publique : « Cette liste n'est pas ouverte à tout le monde » · « Si elle a été partagée avec toi, connecte-toi pour l'ouvrir. » · « Se connecter ». Une fois connecté, on revient sur le lien.
- Je suis connecté, je ne suis pas membre, et **elle est partagée avec tous les membres de son événement** : j'en deviens membre et la liste s'ouvre (« Inviter quelqu'un », plus haut). Sans compte, « Se connecter » en crée un, puis même chose.
- Je suis connecté et je n'y ai pas droit (un brouillon, une liste réservée à celui qui a tiré, un événement complet) : « Cette liste n'est pas partagée avec toi » · « Demande à la personne qui t'a envoyé le lien de te l'ouvrir. »
- La page ne dit ni le nom de la liste, ni à qui elle est : le lien d'un brouillon ne doit rien apprendre.

## La liste reprise de l'an dernier

Maquette : `V3ListeReprise`. « Reprendre ma liste de l'an dernier » (accueil, `V3AccueilAnnee`) crée la liste de l'année dans le même événement : le nom, la date et l'icône viennent de l'événement. **Elle naît en brouillon**, le temps du tri. Les idées qui n'avaient pas été offertes sont reprises et marquées, pour moi seul : « Reprise de Noël 2026. Les idées marquées n'avaient pas été offertes : garde-les ou efface-les. Toi seul vois cette marque. » Les idées offertes ne sont pas reprises.

La liste reprise **garde le souvenir de celle dont elle vient**, même après son premier partage (Q-033) : c'est ce qui permet au bandeau d'une liste de l'an dernier de mener à celle de cette année. Seules les marques des idées s'effacent au partage, et rien de plus n'est montré à personne.

### « Repartir d'une liste »

Maquette : `ListeNouvelleReprendre`. Demandé par Julien le 22 novembre 2026 : une liste pour Camille proposait de repartir de « Les 7 ans de Léo », où Camille n'est pas.

« Repartir d'une liste » est proposé **tant que la liste n'a aucune idée**, même si elle a déjà des personnes (Julien, Q-032) : une liste créée depuis mon Secret Santa m'a déjà dedans (`V3ListeSecretNouvelle`), et c'est là qu'on veut repartir de celle de l'an dernier. Le bloc est sous les personnes déjà là, avant « Ajouter quelqu'un ». Dès qu'une idée est écrite, il disparaît.

Il ne propose que des listes que je tiens et **qui lui ressemblent**. Dans cet ordre, trois au plus :

1. celles du **même événement**, une autre année, la plus récente d'abord ;
2. celles d'un événement de la **même catégorie** (un Noël pour un Noël ; pour un anniversaire, celui du même proche) ;
3. si la liste a déjà des personnes, celles où figure **au moins une de ces personnes**.

- Une liste qui n'a rien de commun n'est jamais proposée. S'il n'y en a aucune, la section n'apparaît pas.
- **Quand la liste a déjà des personnes**, la reprise ne les déplace pas : elles gardent leur place, celles de l'ancienne liste s'ajoutent après, et **personne n'est mis deux fois**. Les idées pas offertes d'une personne déjà là arrivent sous son prénom.
- Sous le nom de chaque liste, **les prénoms** de ceux pour qui elle est faite (les règles du titre d'une ligne, `lignes.md`), pas « 4 personnes » : « Léo, Zoé et moi · 6 idées pas encore offertes ».

## Une idée qui n'a qu'un lien

Bogue trouvé par Julien le 22 novembre 2026 : une idée écrite sans texte, avec seulement un lien, ne pouvait plus être modifiée ni effacée. Toucher la ligne ouvrait le lien, et rien d'autre ne se touchait.

- **Une ligne a toujours un texte à toucher.** Quand l'idée n'a pas de texte, la ligne affiche **le nom du site** à sa place (« lutin-jouets.fr »), dans le style d'un texte d'idée ; le toucher ouvre l'écriture, comme pour n'importe quelle idée. Le lien reste dessous, à sa place, et lui seul ouvre le site.
- Rien n'est enregistré à la place de la personne : en écriture, le champ du texte est vide, avec son texte d'attente.
- Partout où le texte d'une idée sert à la nommer (« Cocher … », « Qui l'offre ? », les lecteurs d'écran), une idée sans texte se nomme par le nom de son site.
- Celui qui ne tient pas la liste voit la même ligne, sans pouvoir l'écrire.

## La liste d'un autre membre

Maquette : `V3ListeMembre`. Elle s'ouvre depuis l'événement, sans lien. Une pastille en haut porte l'emoji et le nom de l'événement, et y ramène.

## La fin des « pistes de cadeaux »

« Mes pistes » n'est plus un objet. Il n'y a qu'un endroit où écrire ses goûts (sa fiche « Moi ») et ses idées (sa liste), et celui qui m'a tiré les voit (`secret-santa.md`).

- **Une liste réservée à celui qui m'a tiré** garde la confidentialité des pistes d'aujourd'hui : lui seul la voit. Elle n'apparaît pas dans les listes de l'événement pour les autres membres ; il y arrive par sa carte de résultat, en mode anonyme.
- **L'organisateur n'a plus de réglage « Pistes de cadeaux »** : tout est disponible, chacun en fait ce qu'il veut. Son suivi dit « a écrit sa liste », sans jamais en montrer le contenu.

### Sans compte

Un participant arrivé par son lien personnel n'a pas forcément de compte.

- **Le compte se crée tout seul à la première chose écrite** (un goût, une idée), pas à l'ouverture du lien : celui qui ne fait que regarder son résultat n'a pas de compte. On le dit sur le moment, par un message (`V3ListeCompteCree`) : « C'est enregistré » · « Un compte a été créé avec ton adresse, pour retrouver ta liste. » · « Compris ».
- **Sans adresse email, pas de liste.** Celui dont on n'a pas l'adresse (un lien copié dans une messagerie) se la voit demander au moment où il veut écrire sa liste (`V3ListeAdresse`) : « Ton adresse email, pour écrire ta liste », un champ, « Valider », « Tu reçois un lien pour la confirmer. », « Tes données, en clair ». L'adresse se confirme par un lien, comme pour se connecter.

## Une liste d'une année passée

Maquette : `V3ListeAnneePassee`. Décision : `2026-11-22-une-liste-d-une-annee-passee-reste-ouverte.md` (Julien, Q-021).

- Une liste est d'une année passée quand son événement a quitté l'accueil pour l'année de sa date (`accueil-et-creation.md`, « Après la date »). Une liste appartient à l'année de sa date.
- **Elle reste ouverte** : on y écrit, on y coche, on en change le partage, comme avant.
- **Un bandeau en haut le dit**, à tout le monde, celui qui la tient compris : « Liste de Noël 2025 » · « Une année passée ».
- Si une liste de cette année a été reprise de celle-ci (« Reprendre ma liste de l'an dernier »), et que j'ai le droit de l'ouvrir, le bandeau y mène : un bouton au nom de l'année, « Noël 2026 ».
- Sur la page de l'année passée de l'événement, les listes n'ont aucun geste : on les ouvre, c'est tout.

## Cocher pour quelqu'un

Décision : `2026-11-21-cocher-pour-quelqu-un.md`. Maquettes : `ListeCocherPourMoi`, `ListeCocherPourDepart`, `ListeCocherPourChoix`, `ListeCocherPourLigne`, `ListeCocherPour`, `ListeCocherPourAutre`. Fait sur `main` avant la V3, sans ticket (`docs/refonte/cocher-pour-quelqu-un/PROMPT.md`) ; la V3 le garde tel quel.

Ceux qui tiennent une liste disent qui offre une idée : sous une idée cochée, les prénoms se touchent et ouvrent « Qui l'offre ? ». On y coche des prénoms connus, ou on en écrit un, avec son adresse email si on veut le relier à un compte. « Une personne » (des ronds, un seul à la fois) ou « Plusieurs » (des cases, autant qu'on veut) ; à plusieurs, « On est au complet » ferme le groupe. Ceux qui tiennent la liste ont les mêmes droits que celui qui a proposé. Personne n'est prévenu. Une coche anonyme ne se modifie pas.

Dans la V3, « ceux que l'application connaît » comprend aussi les membres des événements où la liste est partagée.

**Pour après, pas encore dans un ticket** : celui dont on donne l'adresse en cochant pour lui entre dans l'événement de la liste, comme par « Inviter quelqu'un ».

## « Ce que j'offre ailleurs »

Maquette : `V3OffreAilleurs`. Une ligne en bas de l'accueil.

- Elle ne montre que les listes publiques **où j'ai coché quelque chose** sans être membre d'un de leurs événements : l'invité d'un mariage retrouve ce qu'il offre.
- Une liste qui cesse d'être publique en disparaît (Q-003) : pas de liste fermée gardée pour mémoire.
- Ouvrir un lien sans rien cocher ne laisse aucune trace.
- Il n'y a pas de rubrique « Reçues par un lien ».
