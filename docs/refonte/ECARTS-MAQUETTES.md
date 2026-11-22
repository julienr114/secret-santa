# Écarts entre le code et les maquettes

Pour qui tient les maquettes à jour (`docs/refonte/maquettes/` et `docs/refonte/maquettes-sorbet/`). Chaque ligne dit ce que le code fait **autrement que la maquette**, ou un état que la maquette ne montre pas, avec qui l'a décidé et quand. Le README reste l'autorité ; ce fichier sert seulement à retrouver vite quoi redessiner.

Règle : une ligne s'ajoute ici dès qu'un écran codé s'écarte d'une maquette. Elle s'enlève quand la maquette est remise d'accord (ou quand le code revient à la maquette).

« Julien » : décidé par Julien. « Seul » : tranché par Claude Code en codant, à valider ; le détail est en section 6 du `PLAN.md`, sous le nom du lot.

## Les lignes, les points rouges et « Quoi de neuf » (V3, tickets 112 et 120)

| Maquette | Ce que fait le code | Décidé par |
|---|---|---|
| `V3Accueil`, `V3AccueilJeu`, `V3Fete` | Le point rouge est un rond de 9 px en `coral-500`, avant la flèche ; un lecteur d'écran lit « nouveau ». « Devine qui » a l'icône `circle-help` dans un rond de 40 px, comme les autres lignes. | Seul (le composant du design system) |
| `V3Accueil`, `V3Fete` | Le titre d'une liste d'un autre nomme ceux pour qui elle est faite (les prénoms de la liste), sans personne ceux qui la tiennent (le prénom de leur compte), et non le prénom donné dans l'événement (« Mamie Camille »). | Seul (`lignes.md`) |
| `V3FeteOrganisateur` | Un Secret Santa dévoilé dit « Dévoilé », puis « Terminé » une fois clôturé, avant les cas « Fait · … » : « Tiré » s'entend d'un tirage pas encore dévoilé. | Seul |
| `V3Accueil` | « Quelqu'un te demande des idées » et son point s'en vont quand j'ouvre ma page du Secret Santa, ou dès que j'écris une idée, même si je n'ai rien écrit pour celui qui demande (on ne sait pas qui c'est). | Seul (`lignes.md`, « Il s'éteint quand j'ouvre la chose ») |
| `V3Accueil` | « Ma liste » d'une liste pour plus de trois personnes, moi compris : « Léo, Zoé et 2 autres », où je compte parmi les autres. | Seul |
| `V3QuoiDeNeuf` | Pas de ligne « Choisir ce qui me prévient » avant le ticket 121 ; « Tout s'efface au bout de trente jours » est une phrase seule sous les sections. Sans aucune nouveauté, la page dit « Rien de neuf pour l'instant. » (la maquette ne montre pas cet état). | Seul (le ticket) |
| `V3QuoiDeNeuf` | Les textes ne connaissent pas le genre : « Camille t'invite à tenir sa liste » (sans « avec elle ») ; « Mamie se joint à ton cadeau à plusieurs : Vélo » (et non « au vélo ») ; « Camille a ajouté des idées à sa liste » nomme qui a écrit, et « 3 idées de plus sur la liste » quand on ne le sait pas (au lieu de « sur leur liste »). | Seul |
| `V3QuoiDeNeuf` | Les icônes sont les ronds de 40 px de `UiListItem` : une enveloppe pour un Secret Santa, une liste pour une liste, des personnes pour un événement. L'heure (« Aujourd'hui, 9 h 12 ») est lue dans le fuseau du téléphone, une fois la page affichée. | Seul |
| `V3QuoiDeNeuf` | « Le mot de l'application » (pas de maquette) : un bandeau lilas en tête, son texte, et une croix « Fermer » de 44 px. Aucun mot n'est posé avant la bascule (ticket 113). | Seul |
| `V3Accueil` | La pastille de « Quoi de neuf » (18 px, `coral-500`, cerclée de blanc) compte les lignes pas encore vues ; un lecteur d'écran lit « Quoi de neuf, 3 nouveautés ». | Seul |
| `NotifListe` | Le point dans la marge (7 px) marque, sur la liste d'un autre ouverte par son lien, les idées écrites depuis ma visite d'avant ; à la première visite, aucun point. La phrase « Un point marque ce qui a changé depuis ta dernière visite » n'est pas écrite (pas de note sur le fonctionnement de l'interface). Les autres pastilles de cette maquette (onglets « Tirages » et « Listes ») n'existent plus. | Seul (`CLAUDE.md`) |

## Un écran qui arrive (V3, ticket 099)

| Maquette | Ce que fait le code | Décidé par |
|---|---|---|
| `V3ChargementAccueil`, `V3ChargementFete` | Le squelette commence sous la barre du haut à la marge de toutes les pages (20 px), pas à 8 px : le contenu arrive ainsi à la place exacte du squelette. Les pièces battent doucement (`USkeleton`) et n'apparaissent qu'après 200 ms, comme les squelettes d'avant. | Seul (le cadre des écrans) |
| `V3ChargementAccueil`, `V3ChargementFete` | Les lignes du squelette prennent tour à tour quatre largeurs (55/38, 62/30, 45/44, 48/40 %) : la deuxième section d'un événement a 62/30 puis 45/44 au lieu de 62/30 puis 48/40. | Seul |
| Les écrans sans maquette de chargement | « Membres », la fiche d'une personne, les réglages d'un événement et d'un Secret Santa, « Qui est de la fête ? », une liste (celui qui la tient, celui qui l'ouvre par son lien), « Qui verra ta liste ? », « Ce que j'offre ailleurs », les événements passés et une année passée ont un squelette composé des pièces de `UiSkeleton` à leur forme (lignes à icône, réglages, pastilles, barre de partage, en-tête d'une liste). | Seul (la règle : `regles-d-ecran.md`) |

## Les emails et le journal (V3, ticket 110)

| Maquette | Ce que fait le code | Décidé par |
|---|---|---|
| Tous les emails | L'objet commence par le nom de l'événement, puis le nom du Secret Santa entre parenthèses tel qu'il est écrit (« Famille Camille (Les enfants) : … »), quand l'événement en a plusieurs la même année. « ton enveloppe t'attend » n'a pas de prénom, comme l'exemple de `secret-santa.md` ; les autres objets gardent le leur. Les maquettes montrent l'objet sans l'événement. | Seul (la règle : `secret-santa.md`) |
| `PistesEmail` | La signature est « Le Secret Santa de Famille Camille », pas « Under the Tree » : un email que personne n'envoie signe du Secret Santa de l'événement (Correction 17), comme celui du palmarès. Le pied (« Ne plus recevoir d'emails », « Ce que l'application fait de tes données ») attend les tickets 130 et 131. | Seul (la règle : Julien, Correction 17) |
| `DevineEmailRappelAuto`, `DevineEmailRappelEncore`, `DevineEmailPalmares`, `DevineEmailOrgaPoint`, `DevineEmailOrgaFin` | Le corps garde les textes de la Correction 17, plus récente que ces maquettes : « Devine qui » y est présenté (« Au Secret Santa de Famille Camille (Noël 2026), on joue à Devine qui : deviner qui offre à qui. »), les emails aux participants signent « Le Secret Santa de Famille Camille », ceux à l'organisateur « Under the Tree, l'application de votre Secret Santa ». Objets : « 2 personnes n'ont pas encore joué à Devine qui », « les pronostics de Devine qui sont fermés », après le nom de l'événement. Pas de pied avant les tickets 130 et 131. | Julien (Correction 17) |
| `ListeInvitationEmail` | « tenir à ses côtés » et non « tenir avec elle » : l'application ne connaît pas le genre. L'objet garde le titre de la liste (Q-023). Pas de pied (« Signaler cet envoi » : ticket 132 ; « Ne plus recevoir d'emails » : ticket 130). | Seul |
| `ModerationEmail` | Pas codé : l'arrêt du lien public d'une liste par l'administrateur n'existe pas encore. Le ticket 132 le fera, avec cette maquette. | Seul |
| `Journal` | Les lignes gardent le ton de la Correction 16 (« 5 personnes ont ouvert leur enveloppe », « Le tirage est fait, pour 5 participants ») ; le titre, la phrase du haut et « Le Secret Santa Noël 2026 a été créé » sont ceux de la maquette. | Julien (Correction 16) |

## L'accueil, la barre du bas et « Créer » (V3, ticket 103)

| Maquette | Ce que fait le code | Décidé par |
|---|---|---|
| `MenuAvatarOuvert` | Le menu n'a pas de ligne « Quoi de neuf » (c'est un onglet ; la spec ne la met pas dans le menu). « Langue » ouvre un panneau du bas avec les trois langues : un menu à côté du menu ne tient pas sur un téléphone. | Seul |
| `V3AccueilPlusOuvert` | Jusqu'au ticket 106, « Une liste » ouvre la création d'une fête, puis la nouvelle liste d'aujourd'hui. | Julien, 20 novembre 2026 |
| `V3Accueil` | Les icônes des lignes sont les ronds de 40 px de `UiListItem`, pas les carrés de 36 px de la maquette. Un Secret Santa s'appelle « Le Secret Santa », ou par son nom quand la fête en a plusieurs. | Seul |
| `V3Accueil` | « Nouvelle liste » apparaît dans la carte d'une fête où je n'ai pas de liste. Une ligne de liste sans lien public (celle d'un autre) ne s'ouvre pas, comme sur la page de la fête. | Seul |
| `V3Accueil` | Le décompte de Noël disparaît le 25 décembre. | Seul |
| `V3Accueil` | « Bientôt » ne propose pas mon propre anniversaire, ni celui pour lequel une de mes fêtes « Anniversaire » tombe le même jour. | Seul |
| `V3Accueil` | La carte du haut d'avant (« À faire maintenant »), le changement d'icône sur l'accueil, l'état de la demande de groupe et la ligne « Administration » disparaissent : l'icône se change dans « Mon compte », l'administration est un onglet, les demandes partent avec le ticket 105. | Seul |

## L'année suivante et les événements passés (V3, ticket 108)

| Maquette | Ce que fait le code | Décidé par |
|---|---|---|
| `V3AccueilAnnee` | Le texte sous « Les événements passés » suit `lignes.md` : le nom du plus récent, puis le compte des autres (« Famille Camille et 2 autres »), et non « Noël 2026, les 40 ans de Tonton et 3 autres ». La ligne n'est montrée que s'il y a un événement passé. | Seul |
| `V3AccueilAnnee` | « Préparer Noël 2027 » agit sur place : les Secret Santa apparaissent dans la carte, sans changer de page (la maquette ne dit pas où il mène). « Reprendre ma liste de l'an dernier » prend la place de « Nouvelle liste ». Les deux sont proposés 60 jours avant la date, comme « Bientôt ». | Seul |
| `V3AccueilAnnee` | Après sa date, un événement reste sur l'accueil jusqu'à la clôture de son Secret Santa, 14 jours au plus, 3 jours sans Secret Santa (un Secret Santa clôturé le fait partir le lendemain) ; puis il passe à sa date de l'année suivante s'il revient, sinon il ne reste que dans « Les événements passés ». Les jours se comptent en UTC sur le serveur. | Seul (la règle : Julien, Q-009) |
| `V3FetesPassees` | Une ligne sans rien à dire n'a que sa date. Sans aucun événement passé, la page dit « Aucun événement passé pour l'instant. » (la maquette ne montre pas cet état). | Seul |
| `V3FeteAnneePassee` | Les icônes des Secret Santa et de « Devine qui » (une coupe) sont les ronds de 40 px de `UiListItem`. Avec plusieurs Secret Santa, la section s'appelle « Les Secret Santa » et chaque ligne porte son nom ; l'organisateur qui n'y participait pas n'a pas de texte sous la ligne. | Seul |
| `V3FeteAnneePassee` | Sous « Ma liste » : pour qui elle était (« Léo, Zoé et moi »), ou le nombre d'idées si elle n'était que pour moi ; rien d'autre. Sous la liste d'un autre : « Tu as offert 2 cadeaux », sinon rien. Les lignes ouvrent les listes comme aujourd'hui, où l'on peut encore écrire et cocher (Q-021). | Seul |
| `V3Fete`, `V3FeteAnniversaire` | « Les années passées » : le titre est le nom de l'année (« Noël 2025 », « Anniversaire 2025 ») ; « Ses 3 ans » attend de savoir pour qui un événement est fait (Q-022). | Seul |
| `V3ListeReprise` | Le nom de la liste reprise est celui de l'événement (« Famille Camille »), comme toute liste faite pour un événement (`listes.md`), et non « Noël 2027 ». « Reprise de Noël 2026 » nomme l'année de l'ancienne liste quand elle était dans le même événement, sinon son nom, comme avant. | Seul |
| — | « Supprimer ce Secret Santa » (pas de maquette) : une ligne rouge en bas des réglages du Secret Santa tant qu'il n'est pas tiré ; le panneau dit « C'est définitif », que les liens personnels de ses participants ne marcheront plus et qu'ils restent membres de l'événement, puis « Garder le Secret Santa » et « Supprimer le Secret Santa ». Pas d'identifiant à recopier : c'est la suppression d'un événement, réservée au super-admin, qui le demande. Ensuite, la page de l'événement. | Seul |

## Les pistes deviennent la liste (V3, ticket 107)

| Maquette | Ce que fait le code | Décidé par |
|---|---|---|
| `V3ListeCompteCree` | Aucune maquette ne dessine où s'écrit la première idée sans compte : une page « Ma liste de cadeaux » avec deux champs, « Une idée de cadeau » et « En ce moment » (un goût, qui va sur la fiche « Moi »), « Ajouter », et « Un compte sera créé avec ton adresse… ». L'un ou l'autre suffit ; les autres goûts se complètent ensuite sur la fiche « Moi ». Le message « C'est enregistré » s'ouvre ensuite sur la liste. Une adresse qui a déjà un compte passe par le lien de connexion. | Seul (le principe : Julien, Q-018) |
| `V3ListeAdresse` | La phrase « Tes données, en clair » n'a pas de lien : la page n'existe pas encore (ticket 131). L'adresse donnée par l'organisateur est déjà remplie. | Seul |
| `V3TirageVersListe` | « Ma liste de cadeaux » est la tuile de la page du tirage d'avant, avec le stade de ma liste (« Vue seulement par celui qui m'a tiré », « Pas encore écrite »…), et non une ligne sous la carte ; elle disparaît une fois le Secret Santa clôturé. | Seul |
| `V3TirageVersListe` | La ligne de sa liste mène à une liste qu'elle tient et que je peux ouvrir : réservée à celui qui l'a tirée ou à tous les membres dans cet événement, ou publique ; la plus récemment modifiée. Sans compte, ses pistes d'avant la V3 restent, en lecture seule. | Seul |
| `V3TirageNouvelles` | « 2 nouvelles idées » compte les idées ajoutées depuis ma dernière ouverture de sa liste, seulement si je l'ai déjà ouverte avec mon compte. | Seul |
| `PistesResultatDemande` | Sans adresse, « Inès le verra en ouvrant son lien » : il n'y a plus de page de pistes. | Seul |
| — | Le panneau « Qui verra ta liste ? » propose « Celui qui m'a tiré » sous un événement où je participe à un Secret Santa pas clôturé ; le choisir pour un événement où les membres voyaient la liste demande d'abord, comme décocher. | Seul |

## Le partage d'une liste (V3, ticket 106)

| Maquette | Ce que fait le code | Décidé par |
|---|---|---|
| `V3ListeQui`, `V3ListeQuiModifier` | Pas de choix « Tous les membres » / « Celui qui m'a tiré » sous un événement coché : il vient avec le ticket 107 ; un événement coché l'est pour tous ses membres. Les événements sont rangés par nom. | Seul |
| `V3ListeQuiRetirer` | La confirmation compte les membres de l'événement retiré qui perdent vraiment la liste (ni ceux qui la tiennent, ni ceux qui la gardent par un autre événement), et ceux qui ont coché parmi tous ceux qui la perdent. Si personne ne la perd, pas de confirmation. Pour « Tout le monde », un titre (« Retirer « Tout le monde, avec le lien » ? ») que la spec ne donne pas, et pas de confirmation si personne n'a coché. | Seul |
| `V3ListeLienChanger` | « Changer de lien » se confirme dans un panneau par-dessus « Qui verra ta liste ? » ; le nouveau lien vaut tout de suite, sans « Enregistrer ». | Seul |
| `V3Liste` | Une liste partagée dans des événements où personne d'autre n'est membre dit « Personne d'autre ne la voit ». « Celui qui m'a tiré » (liste liée aux pistes avant la V3) dit le nom de l'événement et « Seul celui qui t'a tiré la voit ». | Seul |
| `V3ListeFermee`, `V3ListeFermeeConnecte` | Un lien inconnu ou remplacé reçoit la même page qu'une liste fermée : la page ne dit pas si la liste existe. | Seul |
| `V3OffreAilleurs` | La ligne « Ce que j'offre ailleurs » apparaît aussi sur l'accueil sans aucun événement (`V3AccueilVide`), dès qu'il y a une liste : l'invité d'un mariage n'est membre d'aucun événement. | Seul |
| `V3ListeOccasion` | La ligne d'un événement dit la catégorie et le jour de son année (« Noël · 25 décembre ») ; sans jour, la catégorie seule. | Seul |

## Les mots (V3, ticket 102)

| Maquette | Ce que fait le code | Décidé par |
|---|---|---|
| Toutes | « Pistes » devient « idées » (« Mes idées de cadeaux », « Lui demander des idées », « Aucune idée ») et non « Ma liste de cadeaux » : tant que le ticket 107 n'a pas réuni pistes et listes, « liste » désignerait aussi les vraies listes. | Seul |
| Toutes | En anglais « the big day », en allemand « der große Tag » pour « le jour J ». « Event » dans les deux langues, comme le dit la décision. | Seul |
| Toutes | Les objets des emails gardent leurs mots (« La fête approche… », « des pistes de cadeaux t'attendent ») : ticket 110. | Julien (ticket) |
| Toutes | Quelques adresses gardent l'ancien mot, qui ne se lit qu'en haut du navigateur : `/admin/groupes` (la liste des événements du super-admin), `?vers=groupe` (« À tous » dans le rappel du jeu), `/p/…/pistes`. | Seul |
| `V3TirageReglages` | La section qui garde la date, le budget et le petit mot d'un Secret Santa (Q-015) s'appelle « Le jour J ». | Seul |

## L'administration (V3, ticket 109)

| Maquette | Ce que fait le code | Décidé par |
|---|---|---|
| `V3Admin` | Seules les parties du ticket 109 sont là : « À traiter et à surveiller » n'a que « Comptes à leur limite de Secret Santa » et « Fêtes à 30 membres » (sans « Signalements » ni les autres chiffres), « En cas d'urgence » que « Suspendre les nouveaux Secret Santa ». Le haut reste celui d'avant (la carte « Capacité », puis « Tout voir » : Comptes, Fêtes, Guide de style) jusqu'au ticket 127 ; pas de section « Outils » ni de note sous les interrupteurs. L'onglet « Admin » n'a pas de pastille : il n'y a pas encore de signalements. | Seul |
| `V3Admin` | « Comptes à leur limite » mène aux comptes, « Fêtes à 30 membres » aux fêtes, sans filtre : la maquette ne dit pas où ils mènent. Un compte désactivé ne compte pas parmi ceux à leur limite. | Seul |
| `V3TiragePause` | Pendant la pause, un super-admin ne peut pas non plus créer de Secret Santa : l'interrupteur dit « les nouveaux ». Le formulaire d'un nouveau Secret Santa mène aussi à cet écran. | Seul |
| `V3AdminCompte` | Le rôle dit « Organise » et non « Organisatrice » (l'application ne connaît pas le genre). | Seul |

## Le Secret Santa (V3, ticket 105)

| Maquette | Ce que fait le code | Décidé par |
|---|---|---|
| `V3TirageQuelleFete` | Sans aucune fête que j'organise, « Un Secret Santa » mène droit à « Pour quelle occasion ? » (les catégories) : il n'y a rien à choisir. La première fête est cochée d'avance. Le rond de choix est celui du téléphone. | Seul |
| `V3TirageNouveau` | Au-dessus du titre, le nom de la fête seul. Pour un premier Secret Santa, la carte dit « 5 membres de la fête. » au lieu de « repris du Secret Santa 2026 ». Le nom proposé est la catégorie et l'année (« Noël 2027 », « Anniversaire 2027 »). Le budget vide dit « Aucun ». Un « Devine qui » choisi finit à 18 h le jour de la fête, comme le panneau des réglages. | Seul |
| `V3TirageReglages` | Sous les quatre sections de la maquette, une section « La fête » garde la date, le budget et le petit mot d'un Secret Santa déjà créé (aucune maquette ne dit où ils se changent), et « Pistes de cadeaux » jusqu'au ticket 107. Les exclusions ne sont plus dans ces réglages : elles restent à la fête (Membres, et la page du Secret Santa). Les lignes n'ont pas d'icône. | Seul |
| `V3TirageLimite` | Chaque ligne ouvre le Secret Santa. Un super-admin n'a pas de limite. | Seul |
| `V3FeteMembresComplet` | « 30 sur 30 » ne s'écrit qu'une fois la fête complète. Les membres comptés sont ceux qui participent (« Ne participe plus » ne compte pas). | Seul |

## La fête (V3, ticket 104)

| Maquette | Ce que fait le code | Décidé par |
|---|---|---|
| `V3Fete`, `V3FeteOrganisateur`, `V3FeteAnniversaire` | Pas de section « Les années passées » avant le ticket 108. | Julien, 20 novembre 2026 |
| `V3FeteAnniversaire` | Pas de « · ses 4 ans » après la date : la fête ne sait pas pour quel proche elle est. | Seul |
| `V3Fete` | Pour un simple membre, la ligne des membres n'ouvre rien (la page des membres est à l'organisateur). | Seul |
| `V3FeteOrganisateur` | Le titre de section est au pluriel pour l'organisateur ou dès deux Secret Santa. | Seul |
| `V3Fete` | Une ligne de liste s'ouvre sur la page d'aujourd'hui : la mienne dans son document, celle d'un autre par son lien public ; sans lien public, elle ne s'ouvre pas (règles du ticket 106). | Seul |
| `V3FeteQuitter` | Avec deux listes à moi dans l'événement, la phrase est au pluriel ; si l'une d'elles n'est dans aucun autre événement, c'est « Toi seul les verras… ». « Tu ne participeras plus à son Secret Santa l'an prochain » ne s'écrit que si la fête a un Secret Santa. Un organisateur ne peut pas quitter la fête. | Seul |
| `V3FeteNouvelle` | Le nom est proposé pour Noël (« Noël ») et pour un anniversaire (« L'anniversaire de Zoé », « Mon anniversaire » pour soi) ; vide pour les autres catégories. La date est remplie pour Noël et pour l'anniversaire d'un proche dont on connaît la date de naissance. | Seul |
| `V3FeteMembresReprendre` | Les pastilles des fêtes se cochent : cocher une fête montre et coche ses membres. Le nombre du bouton me compte. « Inviter d'autres personnes » crée la fête et ouvre « Inviter par lien ». Seules les fêtes que j'organise sont proposées. | Seul |
| `V3FeteNouvelle`, `V3FeteMembresReprendre` | Après « Créer la fête », on arrive sur l'écran d'aujourd'hui de ce qu'on venait créer (création d'une édition, nouvelle liste), sinon sur la fête. | Julien, 20 novembre 2026 |
| `V3FeteReglages` | La catégorie et la date se changent dans un panneau du bas (comme les autres réglages), pas sur une page. « Réglages du Secret Santa » mène aux réglages du dernier Secret Santa de l'année ; sans Secret Santa cette année, la section n'est pas là. | Seul |
| `V3FeteInviter` | « Désactiver le lien » garde sa ligne d'aide (« Plus personne ne pourra s'inscrire »). | Seul |
| `V3FeteRejoindre` | Les états qui suivent (inscrit, lien fermé) gardent leurs écrans d'aujourd'hui, avec « fête » au lieu de « groupe ». | Seul |

## Les dernières retouches de la liste (Correction 30)

| Maquette | Ce que fait le code | Décidé par |
|---|---|---|
| `ListeDecocherCase` | Un cadeau à plusieurs **encore ouvert** garde sa case « + » : la case grise ne décoche qu'une coche seule ou un groupe au complet. | Seul (comme la maquette, mais à confirmer) |
| `ListeDecocherCase` | Le message d'un groupe nomme tout le monde : « Coche de Mamie et Hugo retirée ». | Seul |
| `ListeGroupeFil`, `ListeGroupeFilDeplie` | La phrase « Il commence à lire tout seul. » n'existe pas (aucun champ ne la porte). « Côté cadeaux, il préfère … » se lit « Côté cadeaux, Léo préfère … plutôt que … » (les phrases déjà écrites pour celui qui offre), puis « Léo aime la surprise. » | Seul |
| `ListeGroupeFil` | Dans le document de celui qui tient la liste, 64 px entre deux personnes (Correction 29), pas 44. | Seul |
| `ListeGroupeFil` | Le crayon sur l'icône de 40 px (document) fait 20 px. La case de l'idée qu'un autre écrit n'est plus pâlie, pour couvrir le fil. | Seul |
| `ListeReserverSimple` | Dans le document de celui qui tient la liste, deux choix seulement (pas « en anonyme »), et « Je l'offre seul » dit « Les autres voient seulement que c'est pris. » | Seul |
| `ListeRejoindre` | **Un état que la maquette ne montre pas** : en mode anonyme, le panneau « Se joindre » dit « Mode anonyme activé : te joindre montrerait ton prénom. Désactive-le en haut de la liste pour participer. », en aubergine avec le masque, et « Je participe » est grisé. | Seul |
| `ListeCocheGuide` | La note s'accroche sous la ligne cochée, à 32 px du bord. Elle vient aussi dans le document de celui qui tient la liste, une fois par appareil en tout. | Seul |
| `ListeJOffreAgir` | Le filet de « Tu l'offres en anonyme › » est un aubergine clair (`#a5809c`). | Seul |

## Le mode anonyme (lot 27 ter)

| Maquette | Ce que fait le code | Décidé par |
|---|---|---|
| `ListeVisiteurTirage` | Le voile laisse passer les touchers : la liste reste utilisable dessous. Seuls « Compris » ou l'interrupteur le retirent. | Seul |
| `ListeVisiteurAnonyme` | **L'explication dépliée, mode activé, perd sa dernière phrase** « Le réglage vaut pour toute cette liste. » Elle dit : « Activé : quand tu coches un cadeau, personne ne voit ton prénom, pas même ceux qui tiennent la liste. Ils voient « Anonyme ». » | Julien, 20 novembre 2026 (« assez évident et bien visible ») |
| `ListeVisiteurTirage`, `ListeVisiteurAnonyme`, `ListeVisiteurMes` | La phrase sous le mot d'accueil reste « La liste de Camille. … » : un seul prénom, celui du premier qui tient la liste, pas « La liste de Camille et Hugo ». | Seul |
| `ListeConnexion` | Sous le champ du prénom, une ligne : « Sans prénom, tu coches en anonyme. » | Plan, lot 27 ter |

## Une liste sans personne (lot 27 bis)

| Maquette | Ce que fait le code | Décidé par |
|---|---|---|
| `ListeSansPersonne` | **La maquette montre une liste partagée avec le bloc « Ajouter quelqu'un » : dans le code, le bloc disparaît dès que la liste est partagée** (sa forme ne change plus). Il revient si le partage est arrêté. À redessiner sur un brouillon, ou sans le bloc. | Plan (section 6, « Lots 24 bis et 27 bis », point 9) |
| `ListeSansPersonne` | **Un état que la maquette ne montre pas** : toucher « Une personne » ne mène pas à la saisie d'un prénom, il déplie sur place les pastilles habituelles (mes proches, puis « Quelqu'un d'autre »), avec la phrase « La liste sera alors rangée par personne… » toujours dessous. | Seul |
| `V3ListeNouvelle` | Sous les pastilles d'une liste encore vide, une phrase que la maquette n'a pas : « Pour un mariage ou une crémaillère, « Une liste sans personne » : les idées, l'une sous l'autre. » (celle de `ListeNouvelleReprendre` et `ProcheSupprime`, sans leur première phrase « Touche un prénom… »). | Julien, 19 novembre 2026 (la première phrase retirée), puis seul |
| `ListeSansPersonneVisiteur` | À côté de la date, pas de « · la liste de Camille et Hugo » ; la phrase dessous reste « La liste de Camille. Tu offres 1 cadeau : personne d'autre que Camille ne sait que c'est toi. » | Seul |
| `ListeNouvelleReprendre` | Une liste sans personne s'y lit « Sans personne · 3 idées pas encore offertes », au lieu de « 1 personne · … ». | Seul |

## Les retouches de la liste (Corrections 28 et 29)

| Maquette | Ce que fait le code | Décidé par |
|---|---|---|
| `ListeVisiteurToucher`, `ListeTeneur` | **La case verte d'une idée que je donne décoche tout de suite, sans panneau**, par le lien comme dans le document, seul ou à plusieurs. Par le lien, le reste de la ligne ouvre le panneau ; dans le document, c'est la pastille de mon état (« Tu l'offres », « Tu participes »), puisque toucher le texte l'écrit. | Julien, 20 novembre 2026 (la case), seul (la pastille, et le cas à plusieurs) |
| `ListeTeneur` | Dans le document, mon état sous une idée est la même pastille que par le lien (« Tu l'offres », « Tu participes »). | Seul |
| `ListeIdee`, `ListeIdeeLienFait` | L'adresse se lit sans « https:// ». Le champ du lien n'est pas atteint par la touche Tab (elle va d'une ligne à l'autre). Une adresse fausse est marquée en rouge (filet, icône, texte). | Seul |
| `ListeAidePartage` | « Activé par Camille » nomme celui qui gère la liste, le premier s'ils sont plusieurs : la base ne retient pas qui a activé le partage. | Seul |
| `ListeAidePartage` | Sur un ordinateur (pas de feuille de partage), le bouton « Partager » copie le lien et dit « Copié » un instant. | Seul |

## En direct (lot 26)

| Maquette | Ce que fait le code | Décidé par |
|---|---|---|
| `ListeLiveTeneur` | On voit l'autre écrire **lettre par lettre**, avec son curseur fin et clignotant à sa couleur, à sa place dans le texte. | Julien, 20 novembre 2026 |
| `ListeLiveTeneur` | Une idée **nouvelle** en cours d'écriture apparaît chez les autres juste au-dessus de « Une autre idée… », teintée, avec « Hugo écrit… ». | Julien, 20 novembre 2026 |
| `ListeLiveTeneur` | Le verrou vaut aussi pour **le nom de la liste, le mot d'accueil et un prénom** écrit sur place, pas seulement pour une idée. | Julien, 20 novembre 2026 |
| `ListeLiveTeneur` | Une ligne verrouillée **n'offre plus aucune action** : ni case active, ni pastille de prénom, ni « Se joindre », ni « Changer ». | Julien, 20 novembre 2026 |
| `ListeLiveTeneur`, `ListeVueReliee` | Une personne reliée qui écrit ses idées par le lien verrouille sa ligne chez ceux qui tiennent la liste (« Papi écrit… »), et voit verrouillée une ligne de sa partie que l'un d'eux écrit. Elle n'apprend rien d'autre (ni qui est là, ni combien). | Julien, 20 novembre 2026, puis seul pour ce qu'elle n'apprend pas |
| `ListeLiveVisiteur` | Un visiteur ne voit jamais qui écrit ni qui est là : seulement la liste qui change. | README |

## Cocher pour quelqu'un (21 novembre 2026)

| Maquette | Ce que fait le code | Décidé par |
|---|---|---|
| Toutes les six | Sur `main`, la barre du haut est restée celle de `main`. Sur `v3` (ticket 098), c'est celle de la V3, comme les maquettes. | Julien (`PROMPT.md`), puis le ticket 098 |
| `ListeCocherPour` | En V3, les membres des événements où la liste est partagée avec tous les membres (et qui ont un compte) sont proposés après ceux qui ont coché, sans ligne dessous. Ceux d'un événement où la liste est réservée à celui qui m'a tiré ne le sont pas. | Spec (`listes.md`), seul pour la place et le partage réservé |
| `ListeCocherPourDepart`, `ListeCocherPourChoix`, `ListeCocherPour` | Les lignes des prénoms sont celles de `UiCheckRow` : icône de 40 px et ligne de 60 px, au lieu de 36 px et 56 px. Le rond et la case sont ceux de l'application, à la couleur du thème. | Seul (le composant du design system) |
| `ListeCocherPourLigne` | Au-delà de trois prénoms, c'est la pastille « 7 personnes » qui porte le filet et la flèche. | Seul |
| `ListeCocherPourMoi` | « Tu participes › » ouvre aussi « Qui l'offre ? » pour ceux qui tiennent la liste ; « Se joindre » garde son panneau. Par le lien, celui qui tient la liste garde le panneau d'aujourd'hui : seul le document a « Qui l'offre ? ». | Seul |
| `ListeCocherPour` | Personne de coché alors que seule ma coche était là : l'idée est décochée tout de suite, sans « Annuler », comme la case verte (aucun texte prévu pour « ta coche retirée »). Avec la coche d'un autre, « Coche de Mamie retirée · Annuler ». | Seul |
| `ListeCocherPour` | Un cadeau à plusieurs noté par celui qui tient la liste dit « Noté par toi » plutôt que « Proposé par » : la trace dit qui l'a écrit. | Seul |
| `ListeCocherPourAutre` | Une adresse qui n'en est pas une marque le champ en rouge, sans phrase ; « Ajouter » reste grisé tant que le prénom est vide. Un prénom écrit à nouveau, avec la même adresse ou sans, est celui déjà écrit. | Seul |
| `ListeCocherPourAutre` | « Avec son adresse, cette personne retrouvera ce cadeau en se connectant. » au lieu de « il retrouvera » : l'application ne connaît pas le genre. | Julien, 22 novembre 2026 |
