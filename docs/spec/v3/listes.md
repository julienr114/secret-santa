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

**Le mot d'accueil est en option** (Julien, 23 novembre 2026 ; maquettes `V3ListeNouvelle`, `V3ListeMotAccueil`). Une liste neuve n'en a pas : plus de cadre en pointillés avec un texte de départ. Sous la date, une ligne discrète, **« Ajouter un mot d'accueil »** (un crayon, en italique, comme « Ajouter un lien »). La toucher ouvre le champ dans la carte blanche de l'écriture, **déjà rempli du mot de départ de la catégorie** (`categories.md`), le curseur au bout : on le garde, on le change ou on le vide. Vidé, la liste n'a pas de mot et la ligne « Ajouter un mot d'accueil » revient. Seuls ceux qui tiennent la liste voient cette ligne.

### Depuis mon Secret Santa

Décision : `2026-11-22-le-secret-santa-et-ma-partie-d-une-liste.md` (Julien, 22 novembre 2026). Ce qui est lié à un Secret Santa, ce n'est pas une liste : **c'est moi, dans une liste**. Celui qui m'a tiré a le droit d'ouvrir la liste entière ; ce qu'on lui montre d'abord, c'est ma partie (`secret-santa.md`, « Du résultat à la liste »).

En touchant « Ma liste de cadeaux » sur la page de mon Secret Santa, ou « Écrire ma liste » dans l'email d'une demande d'idées :

- **Je ne tiens aucune liste de cette année où je figure** : la liste se crée sans rien demander. **Elle s'appelle « Idées pour le Secret Santa »** (et « Idées pour le Secret Santa (Les adultes) » quand l'événement en a plusieurs cette année-là) : elle ne prend pas le nom de l'occasion, déjà écrit dans la barre du haut et sur l'accueil. Le nom se change en le touchant. L'occasion est connue, « Celui qui m'a tiré » est choisi d'avance, **et j'y suis déjà, en premier** (`V3ListeSecretNouvelle`). Ce que j'écris est lu dès que c'est écrit, comme les pistes d'avant.
- **J'en tiens une ou plusieurs** : « Quelle liste pour ton Secret Santa ? » (`V3TirageQuelleListe`) les propose, une par ligne, avec « Pour Léo, Zoé et moi » et ses événements dessous ; puis « Une nouvelle liste ». La première est choisie d'avance : celle du même événement, sinon de la même catégorie, sinon la plus récente. « Continuer ». La liste choisie garde son partage : celui qui m'a tiré la voit en plus (les stades se cumulent). Une liste que je tiens mais où je ne figure pas n'est pas proposée.
- **Sous mon prénom**, dans la liste, une petite pastille par Secret Santa (`V3ListeSecret`, `V3ListeSecretNouvelle`) : l'emoji de l'événement et « Secret Santa · Famille Camille », sur une ligne, coupé par « … ». **Elle est discrète** : 20 px de haut, un fond clair, un texte gris de 11,5 px, de la famille des pastilles de prénoms sous les idées ; **le prénom et la pastille ne dépassent pas la hauteur de l'icône de la personne** (52 px). La toucher ouvre le panneau du lien (« Lier et délier », plus bas). Seuls ceux qui tiennent la liste la voient (Julien, 23 novembre 2026).

### Lier et délier

Julien, le 23 novembre 2026 : « il y a un concept de liaison ». Maquettes `V3ListeSecretLie`, `V3ListeSecretLier`, `V3ListeSecretLierConfirmer`.

- **Voir le lien** : toucher la pastille ouvre un panneau, en bas : la tuile de l'événement, « Secret Santa · Famille Camille », « Celui qui t'a tiré voit cette liste, en commençant par ta partie. », puis deux lignes, **« Voir mon Secret Santa »** et **« Délier »**.
- **Délier** ne supprime rien : la pastille s'en va, celui qui m'a tiré ne voit plus la liste par ce chemin (il la voit encore s'il est membre d'un événement avec qui elle est partagée), et ma page du Secret Santa propose de nouveau « Ma liste de cadeaux ». Un message en bas : « Liste déliée ». C'est le même geste que la croix de « Celui qui m'a tiré » dans « Qui voit ta liste ? ».
- **Lier une liste qui existe** : dans une liste que je tiens et où je figure, quand j'ai cette année un Secret Santa dont le tirage est fait et qui n'a pas de liste, une ligne discrète sous mon prénom, **« Lier à mon Secret Santa »** (en italique, comme « Ajouter un lien »). La toucher demande : **« Lier à ton Secret Santa ? »**, « Celui qui t'a tiré dans « Famille Camille » verra cette liste, en commençant par ta partie. », un seul bouton, « Lier » ; fermer le panneau annule. Avec plusieurs Secret Santa sans liste, le panneau les propose, un rond chacun.
- **Un Secret Santa n'a qu'une liste** : le lier ici quand il l'est déjà ailleurs le déplace, et le panneau le dit (« Il ne sera plus lié à « Noël 2026 ». »).
- L'autre chemin ne change pas : « Ma liste de cadeaux », sur la page de mon Secret Santa, propose « Quelle liste pour ton Secret Santa ? » dès que je tiens une liste de l'année où je figure.

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
| Pour celui qui « aide à écrire » (`ListeAidePartage`) | les mêmes textes | « Le lien » |

Le nom et la phrase tiennent **chacun sur une ligne**, jamais plus : trop longs, ils sont coupés par « … » (Julien, 23 novembre 2026). La barre ne dit plus « choisi par Camille » à celui qui aide à écrire : ça ne lui sert à rien.

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
- **« Quelqu'un d'autre »** fait glisser la barre vers un niveau plus loin, sans quitter la liste (« Inviter quelqu'un », plus bas). La pastille n'est là que si la liste est déjà partagée avec les membres de son événement, puisque celui qu'on invite en devient membre.
- **« Changer de lien »**, en dernière ligne, dès que le lien fait entrer quelqu'un (la liste est partagée avec son événement). Pas sur un brouillon, ni sur une liste que seul celui qui m'a tiré voit.

### « Tout le monde »

- Le toucher demande d'abord, un niveau plus loin dans la barre (`V3ListeQuiOuvrir`) : « ‹ Ouvrir à tout le monde ? » · « Toute personne qui a le lien pourra voir ta liste et cocher un cadeau, sans compte. » · « Ouvrir ». Le retour annule.
- Une fois publique, il n'y a plus personne à choisir : il reste **« Changer de lien »** (`V3ListeQuiLien`).
- Revenir à « Qui je veux » retrouve ceux qui y étaient ; c'est resserrer le partage, avec sa confirmation (plus bas).
- **« Le message qui accompagne le lien » disparaît** : « Copier le lien » ne copie que l'adresse, ce message n'accompagnait plus rien.

### Changer de lien

`V3ListeLienChanger`, puis `V3ListeLienNouveau`. Un niveau plus loin dans la barre : « ‹ Changer de lien ? » · « L'ancien lien ne marchera plus : il faudra renvoyer le nouveau. Ceux qui ont déjà coché un cadeau gardent la liste. » · « Changer ». Le retour annule. Ensuite la barre revient au premier niveau, la nouvelle adresse y est, et un message le dit : « Nouveau lien créé ».

### Resserrer le partage

Maquette : `V3ListeQuiRetirer`. Toucher la croix d'une ligne, revenir de « Tout le monde » à « Qui je veux » : chaque fois que des gens vont perdre l'accès, **une confirmation le dit avant**, et **compte ceux qui ont coché un cadeau**. Si personne ne perd rien (un événement sans autre membre que moi), la croix retire sans demander.

**La confirmation est un niveau de la barre** (Julien, 23 novembre 2026), comme « Quelqu'un d'autre » : elle arrive par la droite, son titre est précédé du retour, et **le retour annule**. Il n'y a qu'un bouton, celui qui fait le geste. Pas de bouton « Annuler ».

Pour un événement :

« ‹ Retirer « Chez Mamie » ? » · « Ses 9 membres ne verront plus ta liste. 2 d'entre eux ont coché un cadeau et ne pourront plus l'ouvrir. Leurs cadeaux restent prévus. » · « Retirer ».

Pour une liste publique : « 3 personnes ont coché un cadeau et ne pourront plus ouvrir la liste. Leurs cadeaux restent prévus. » Si personne n'a coché, la confirmation ne dit que la première phrase.

Pour ceux qui perdent l'accès, la liste disparaît, sans trace (Q-003). Leurs coches restent sur la liste : le cadeau est toujours prévu.

## Inviter quelqu'un

Maquettes : `V3ListeInviter`, `V3ListeInviterEmail`, `V3ListeInviterReprendre`, `V3ListeInviteEnvoyee`, `V3ListePartageEmail`. Décisions : `2026-11-21-on-entre-par-un-secret-santa-ou-par-une-liste.md`, `2026-11-22-qui-voit-ta-liste-deux-choix.md`.

On n'ajoute personne à un événement : du côté des listes, **c'est par une liste qu'on y entre**. Celui qui gère une liste partagée avec les membres de **son événement** (l'occasion choisie à sa création) peut y faire entrer quelqu'un, par la pastille « Quelqu'un d'autre » de « Qui voit ta liste ? ».

### On reste dans la barre

Demandé par Julien le 23 novembre 2026 : « Quelqu'un d'autre » n'ouvre pas une page. **La barre déroulée a une navigation à elle** : son contenu glisse vers un niveau plus loin, et un retour, en haut à gauche, ramène au précédent.

- **L'en-tête de la barre ne bouge pas** : le stade, sa phrase, « Fermer ». Seul ce qui est dessous change.
- **Un niveau plus loin a un titre précédé du retour** (« ‹ Quelqu'un d'autre »). L'adresse à copier n'est qu'au premier niveau.
- **Le mouvement** : le niveau où l'on va arrive par la droite pendant que l'autre part par la gauche ; le retour fait l'inverse ; la hauteur de la barre suit, dans le même temps. Un quart de seconde, pas plus. Pour qui a demandé moins d'animations (`prefers-reduced-motion`), le contenu change sans glisser.
- « Fermer », toucher en dehors et Échap replient la barre d'où que l'on soit ; rouverte, elle est au premier niveau, et ce qu'on avait commencé à écrire est oublié.
- Le retour du téléphone ou du navigateur recule d'un niveau avant de quitter la liste.

### Tout y est un peu plus petit

Demandé par Julien le 23 novembre 2026 : la barre est un espace restreint, tout ce qu'elle contient est d'une taille en dessous du reste de l'application, sans devenir difficile à toucher.

| Dans la barre | Ailleurs |
|---|---|
| un champ est **une ligne** de 48 px : le libellé à gauche, ce qu'on écrit à droite | un champ de 52 px sous son libellé |
| un bouton de 44 px | 48 px |
| une ligne de 48 px, son texte en 15 px, son icône de 28 px | 52 à 56 px, 16 px, 32 px |
| une pastille de 36 px, son texte en 14 px | 40 à 44 px, 15 px |
| les deux choix « Qui je veux » / « Tout le monde » : 34 px de haut | 40 px |
| un titre de niveau en 16 px | 18 px |

- **Ce qu'on touche garde 44 px**, quelle que soit sa taille à l'œil : une pastille, un des deux choix, la croix d'une ligne ont une zone à toucher de 44 px de haut, par une marge invisible. Deux zones ne se recouvrent pas.
- **Les champs sont des lignes**, comme le reste de la barre (un formulaire est tout en lignes ou tout en champs) : pas de cadre, le libellé à gauche en 15 px, ce qu'on écrit à droite. Toucher la ligne, n'importe où, met le curseur dans le champ.
- **Le texte d'un champ reste en 16 px** : en dessous, un iPhone zoome sur le champ.
- Ce sont des variantes des composants de l'application (`UiSegmented`, `UiTextField`, les lignes, les boutons), pas des composants à part.
- **Les coins s'emboîtent** (Julien, 23 novembre 2026) : quand une forme arrondie est posée dans une autre (le choix sélectionné dans son fond, « Copier le lien » dans le champ de l'adresse), son rayon est celui du fond moins la marge qui les sépare. C'est vrai pour `UiSegmented` partout, pas seulement dans la barre.
- **Un message de l'application reste en bas de l'écran** (« Invitation envoyée », « Nouveau lien créé »), comme partout ailleurs : jamais sous la barre.

### « Quelqu'un d'autre »

`V3ListeInviter` (vide), `V3ListeInviterEmail` (rempli). Un seul niveau :

- Deux lignes, **« Prénom »** et **« Adresse email »** (le libellé à gauche, ce qu'on écrit à droite ; « prenom@exemple.fr » en texte d'attente), et dessous : « Cette personne reçoit un email à ton nom, et devient membre de « Famille Camille ». » (pas « Il reçoit » : `vocabulaire.md`)
- **« Inviter »**, éteint tant que le prénom ou l'adresse manque.
- Dessous, une ligne : **« Reprendre ceux d'un autre événement »**.

« Inviter » ramène au premier niveau : l'événement compte un membre de plus, et un message le dit, « Invitation envoyée » (`V3ListeInviteEnvoyee`). La personne est membre tout de suite et reçoit un email à mon nom (`V3ListePartageEmail`) : « Camille a partagé sa liste « Noël 2026 » avec toi » · « Coche ce que tu offres, et personne n'aura la même idée. » · « Voir la liste ».

### « Reprendre ceux d'un autre événement »

`V3ListeInviterReprendre`. Un niveau de plus, titre « ‹ Reprendre ceux de » : mes autres événements en pastilles (un seul choisi), ses membres à cocher (ceux qui ne sont pas déjà dans l'événement de la liste ; sans adresse email, la case reste vide et ne se coche pas), puis « Inviter · 3 personnes ». Même retour au premier niveau, « 3 invitations envoyées ».

### Ce qui n'y est plus

- **« Copier le lien »** n'est plus une ligne ici : l'adresse est au premier niveau de la barre.
- **« Une autre occasion »** quitte le partage d'une liste : on crée un événement par « Créer », et il apparaît ensuite dans « Ajouter ». Un événement créé d'ici n'avait que moi dedans.
- La page « Inviter quelqu'un » et ses sous-pages (`/listes/…/inviter`) disparaissent.

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

## La ligne qu'on écrit, la ligne qu'on déplace

Julien, le 23 novembre 2026 : le bandeau blanc bord à bord, avec son trait rouge à gauche, était trop dur. Maquettes `ListeIdee`, `ListeIdeeLien`, `ListeIdeeLienFait`, `ListeHorsListe`, `ListeGlisser`.

- **La ligne qu'on écrit est une carte blanche** : des coins arrondis de 16 px, un liseré très clair (la couleur des traits fins), une ombre légère teintée de rouge. **Plus de trait rouge**, plus de blanc jusqu'aux bords de l'écran.
- La carte dépasse de 10 px à gauche et de 8 px à droite de la ligne, et de 4 px au-dessus et au-dessous : **la case et le texte ne bougent pas** quand on entre dans la ligne ou qu'on en sort.
- C'est la même carte pour « J'offre autre chose », écrit sur place : pas de trait vert non plus.
- **La ligne qu'on déplace est la même carte**, soulevée : l'ombre plus marquée, à peine penchée, la poignée à droite. **Plus de contour rouge.** La personne qu'on déplace, repliée sur une ligne, a la même carte.
- **L'endroit où elle va tomber** : un trait arrondi de 4 px, de la couleur du bord des cases (pêche), plus un trait rouge.

## La visite d'une liste neuve

Décision : `2026-11-23-la-visite-d-une-liste-neuve.md`. Maquettes `V3ListeVisiteSecret1` à `6`, `V3ListeVisiteCreer1` à `3`, `V3ListeVisiteIdee`.

La première fois que j'arrive sur une liste que je viens de créer, une visite montre ce qu'on peut y faire, **avec le voile et la note de la première coche** (`ListeCocheGuide`) : le voile violet sur toute l'application, un seul élément dans la lumière, une note accrochée à lui.

- **La note** : un titre, une phrase, et en haut à droite « 2 sur 6 ». En bas, **« Passer »** à gauche (il arrête la visite) et **« Suivant »** à droite ; à la dernière étape, « Compris » seul. La note est sous l'élément, ou au-dessus quand il est en bas de l'écran ; la page défile pour le montrer.
- **Une seule fois par compte**, vue ou passée : elle ne revient ni sur une autre liste, ni sur un autre appareil. Celui qui a vu l'une des deux visites ne voit pas l'autre.
- Elle ne s'ouvre que sur une liste **que je viens de créer** : jamais sur la liste d'un autre, ni sur une liste que je rouvre.
- **Elle remplace « Touche un texte pour le modifier. »**, qui disparaît de la phrase de celui qui tient la liste.

**Depuis un Secret Santa** (six étapes ; cinq sans « Repartir d'une liste ») :

| | Dans la lumière | Titre | Phrase |
|---|---|---|---|
| 1 | mon prénom et la pastille du Secret Santa | Ta partie | Elle est liée à ton Secret Santa : celui qui t'a tiré la lit dès que tu écris. |
| 2 | ma première ligne, vide | Une idée par ligne | Ajoute un lien si tu as trouvé l'objet. |
| 3 | la barre du haut | Qui la voit | Pour l'instant, celui qui t'a tiré, et lui seul. « Modifier » l'ouvre à d'autres. |
| 4 | le nom et la date | Le nom et la date | Touche un texte pour le changer. |
| 5 | « Repartir d'une liste », s'il est là | Tes idées d'avant | Reprends celles qui n'ont pas été offertes. |
| 6 | « Ajouter quelqu'un » | Une liste pour plusieurs | Ajoute tes enfants ou un proche : chacun a sa partie. |

**Depuis « Créer »** (trois étapes : la liste n'a encore personne) :

| | Dans la lumière | Titre | Phrase |
|---|---|---|---|
| 1 | le nom et la date | Le nom et la date | Ils viennent de l'occasion. Touche un texte pour le changer. |
| 2 | « Ajouter quelqu'un » | Pour qui ? | Une partie par personne : toi, tes enfants, un proche. |
| 3 | la barre du haut | Personne ne la voit encore | « Partager » choisit qui, quand tu veux. |

Puis, **quand la première personne est ajoutée**, une note seule sur sa première ligne, sans compte d'étapes : « Une idée par ligne », « Ajoute un lien si tu as trouvé l'objet. », « Compris » (`V3ListeVisiteIdee`). Une seule fois par compte elle aussi ; celui qui a vu la visite du Secret Santa ne la voit pas.

## Une idée qui n'a qu'un lien

Bogue trouvé par Julien le 22 novembre 2026 : une idée écrite sans texte, avec seulement un lien, ne pouvait plus être modifiée ni effacée. Toucher la ligne ouvrait le lien, et rien d'autre ne se touchait.

- **Une ligne a toujours un texte à toucher.** Quand l'idée n'a pas de texte, la ligne affiche **le nom du site** à sa place (« lutin-jouets.fr »), dans le style d'un texte d'idée ; le toucher ouvre l'écriture, comme pour n'importe quelle idée. Le lien reste dessous, à sa place, et lui seul ouvre le site.
- Rien n'est enregistré à la place de la personne : en écriture, le champ du texte est vide, avec son texte d'attente.
- Partout où le texte d'une idée sert à la nommer (« Cocher … », « Qui l'offre ? », les lecteurs d'écran), une idée sans texte se nomme par le nom de son site.
- Celui qui ne tient pas la liste voit la même ligne, sans pouvoir l'écrire.

## Ma partie d'une liste

Julien, le 23 novembre 2026.

- **« Camille (moi) »** : là où je figure, « (moi) » est écrit entre parenthèses à côté de mon prénom, plus petit et en gris. Il remplace la ligne « Moi » sous le prénom (dans une liste que je tiens) et « C'est toi » (dans la liste d'un autre où je figure). Je suis seul à le lire : les autres lisent « Camille ».
- **« Une idée pour toi… »** : dans ma partie, la ligne vide ne dit pas mon prénom. « Une autre idée pour toi… » quand il y en a déjà. Pour les autres personnes, « Une idée pour Léo… » ne change pas.

## La liste d'un autre membre

Maquette : `V3ListeMembre`. Elle s'ouvre depuis l'événement, sans lien. Une pastille en haut porte l'emoji et le nom de l'événement, et y ramène.

**Plus de phrase sous le mot d'accueil** (Julien, 23 novembre 2026). « La liste de Lou. Tu offres 1 cadeau : personne d'autre que Lou ne sait que c'est toi. », « La liste de Camille et Hugo. Camille seule voit qui a coché quoi. », « Tu y figures : tu peux écrire tes propres idées. » et « Un point marque ce qui a changé depuis ta dernière visite. » disparaissent : ce que j'offre se lit sur les lignes (« Tu l'offres ›  ») et sur l'accueil, ma partie se reconnaît à « (moi) » et à « Une idée pour toi… ». Une liste sans personne garde « la liste de Camille et Hugo » à côté de sa date. La phrase de celui qui tient la liste (« 9 cadeaux déjà prévus… ») n'est pas touchée.

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
