# Écarts entre le code et les maquettes

Pour qui tient les maquettes à jour (`docs/refonte/maquettes/` et `docs/refonte/maquettes-sorbet/`). Chaque ligne dit ce que le code fait **autrement que la maquette**, ou un état que la maquette ne montre pas, avec qui l'a décidé et quand. Le README reste l'autorité ; ce fichier sert seulement à retrouver vite quoi redessiner.

Règle : une ligne s'ajoute ici dès qu'un écran codé s'écarte d'une maquette. Elle s'enlève quand la maquette est remise d'accord (ou quand le code revient à la maquette).

« Julien » : décidé par Julien. « Seul » : tranché par Claude Code en codant, à valider ; le détail est en section 6 du `PLAN.md`, sous le nom du lot.

## « Cette personne », pas « il » (ticket 145)

| Maquette | Ce que fait le code | Décidé par |
|---|---|---|
| `ListeTeneurs` | Une invitation en attente dit « Invitation du 18 novembre · valable jusqu'au 25 » au lieu de « Invitée le 18 novembre… » (`vocabulaire.md`). | Ticket 145 |
| `PanneauOrganisateur` et ses pages | En plus des textes du ticket : « Cette personne se connecte avec son adresse, sans mot de passe », « Cette personne n'aura qu'à se connecter avec cette adresse », « Comme toi, cette personne ne verra pas les résultats du tirage ». | Seul (la règle de `vocabulaire.md`) |

## L'icône d'un événement est une tuile en couleur (V3, ticket 143)

| Maquette | Ce que fait le code | Décidé par |
|---|---|---|
| `V3FetesPassees` | La tuile fait 36 px, comme la maquette ; `categories.md` dit 30 px. | Seul (la maquette) |
| `V3Accueil` | « Bientôt » (l'anniversaire d'un de mes proches, pas encore un événement) a la tuile de 32 px de la maquette, en dégradé « Anniversaire ». | Seul (la maquette) |
| `V3Accueil`, `V3AccueilSansSecret`, `V3AccueilJeu`, `V3AccueilAnnee` | La roue de l'en-tête (ticket 159) est la `settings` de Lucide dans un rond de 38 px au fond `muted` et à l'anneau `accented` (les jetons les plus proches de la maquette). « Tu l'organises » (ticket 156) aligne son texte à 68 px du bord, sous le titre du Secret Santa de l'application (72 dans la maquette, dont l'icône fait 44 px). | Seul |
| `V3Fete` | L'en-tête de la page d'un événement garde sa pastille de catégorie : la maquette n'y a pas de tuile (le ticket en annonçait une de 44 px). | Seul (la maquette) |
| `V3QuoiDeNeuf` | La section d'une liste hors de mes événements a la tuile de la catégorie « Autre ». | Seul |
| `CreateSheet` | « Créer » ne change pas : ses événements gardent leur carré teinté (ticket 143). | Ticket 143 |

## « Qui voit ta liste ? », deux choix, et la barre en plus petit (V3, tickets 139 et 141)

| Maquette | Ce que fait le code | Décidé par |
|---|---|---|
| `V3ListeQuiModifier`, `V3ListeQuiAjouter` | Les lignes des événements sont dans l'ordre de leurs noms ; la phrase de la barre repliée les nomme dans l'ordre où la liste y a été partagée. | Seul |
| `V3ListeQuiAjouter`, `V3ListeQuiSecret` | Une pastille « Secret Santa · … » par Secret Santa où je participe et qui n'est pas lié (ticket 157) ; son nom est celui de la pastille sous mon prénom et du panneau du lien (`invitePlace`). Ajouter ou retirer un Secret Santa ne demande jamais : personne ne perd l'accès qu'il avait par l'événement. Lié à plusieurs Secret Santa et à rien d'autre, la barre repliée nomme leurs événements dans l'ordre où ils ont été liés. | Seul |
| `V3ListeQuiRetirer`, `V3ListeQuiOuvrir`, `V3ListeLienChanger` | Revenir de « Tout le monde » à « Qui je veux » quand quelqu'un a coché pose la même question, un niveau plus loin, titrée « Retirer « Tout le monde » ? » (la spec ne donne que son texte). Une confirmation, comme « Quelqu'un d'autre », a son adresse (`?partage=confirmer`) ; ouverte directement, l'adresse mène au premier niveau. | Seul |
| `V3ListeInviter`, `V3ListeInviterEmail` | À 30 membres, le niveau dit « L'événement est complet » à la place des champs. Une erreur de l'envoi s'affiche sous le texte, avant « Inviter ». | Seul |
| `V3ListeInviterReprendre` | Ne sont proposés que les événements que j'organise, comme au ticket 117 ; une pastille choisie coche d'office ses membres qui ont une adresse. | Seul |
| `V3ListeInviteEnvoyee` | Après « Inviter », « Ajouter » est replié et le clavier se ferme, pour que le message reste en bas de l'écran. | Seul |
| `FeteMembres` (« À ma liste ») | Mène à la liste, la barre déroulée sur « Quelqu'un d'autre » (`?partage=inviter`). | Seul |

## La barre déroulée passe par-dessus la liste (V3, ticket 138)

| Maquette | Ce que fait le code | Décidé par |
|---|---|---|
| Toutes les déroulées | Toucher en dehors de la barre la replie et ne fait que cela : ce qui était sous le doigt n'est ni pressé ni sélectionné (la barre du haut et celle du bas comprises). Le focus revient au bouton, comme avec « Fermer ». | Seul |

## La barre d'une liste se déroule (V3, ticket 135)

| Maquette | Ce que fait le code | Décidé par |
|---|---|---|
| Toutes les déroulées | Échap replie la barre sans rien changer, comme « Fermer », d'où que l'on soit. Pendant le chargement de « Qui voit ta liste ? », un squelette sous son titre. | Seul |

## On entre par un Secret Santa ou par une liste (V3, ticket 117)

| Maquette | Ce que fait le code | Décidé par |
|---|---|---|
| `V3FeteMembres`, `V3FeteMembresAjouter` | La page reste celle des organisateurs (Q-029) : pour un membre, la ligne des membres de la page de l'événement n'est pas un lien (ticket 137). « Ajouter quelqu'un » (ticket 158) est un `UiListItem` avec l'icône `user-plus` dans son rond corail ; un seul endroit écrit son nom dessous et y mène ; plusieurs ouvrent le panneau, dont les lignes ont l'enveloppe (corail) et la liste (lilas) des lignes de l'application. Un Secret Santa parmi plusieurs en préparation s'écrit « Au Secret Santa « Les enfants » ». L'anglais lit « Organises », l'allemand « Organisiert » ; « hors du Secret Santa », « dans aucun Secret Santa » prennent la majuscule quand ils viennent en premier. | Seul |
| `V3FeteMembresComplet` | À 30 membres, l'état remplace la ligne « Ajouter quelqu'un » (ticket 158) : le lien du Secret Santa s'ouvre depuis sa page. | Seul |
| `V3FeteMembresReprendre` | Le contexte au-dessus du titre est le fil de l'écran (le nom de l'événement, sans emoji). Une pastille choisie a l'anneau rouge des pastilles de l'application, pas le fond vert. Ne sont proposés que les événements que j'organise (leurs adresses ne sont lues que par leurs organisateurs), jamais celui où l'on ajoute, ni quelqu'un qui y est déjà par son adresse ; sans personne de nouveau, « Personne de nouveau à ajouter ». | Seul |
| `V3FeteNouvelle` | « Continuer » crée l'événement et mène droit au Secret Santa ou à la liste : plus d'étape « Qui en fait partie ? ». | Julien (décision du 21 novembre 2026) |
| `V3ListeQui`, `V3ListeQuiModifier` | « Quelqu'un d'autre » n'est proposé qu'une fois la liste partagée avec les membres de son événement : ni sur un brouillon, ni sur une liste réservée à celui qui a tiré (`listes.md`). Une adresse déjà membre de l'événement est refusée : « la liste lui est ouverte ». | Seul (`listes.md`) |
| `V3ListePartageEmail` | Comme les autres emails : le lien est écrit en entier sous « Voir la liste : » (pas de bouton), et le pied n'a pas encore « Ne plus recevoir d'emails », « Signaler » ni « Ce que l'application fait de tes données » (tickets 130 et 132). | Seul (les autres emails) |
| `V3ListeFermee`, `V3ListeFermeeConnecte` | Connecté, quand le lien fait entrer dans l'événement de la liste, la page montre le squelette de la liste le temps d'y entrer, puis la liste. | Seul |
| `V3FeteRejoindre` | Pendant qu'elle charge, la page du lien d'un Secret Santa montre un squelette à sa forme (le titre, une carte) au lieu d'un bloc gris (noté par le ticket 114). | Seul (`regles-d-ecran.md`) |
| `V3QuoiDeNeuf` | « Camille t'ajoute au Secret Santa », au présent, et non « Camille t'a ajouté » : l'application ne connaît pas le genre (Q-030). « Camille a partagé sa liste avec toi » tel quel. | Seul (Q-028) |

## Le lien d'invitation d'un Secret Santa (V3, ticket 116)

| Maquette | Ce que fait le code | Décidé par |
|---|---|---|
| `V3FeteInviter` | **Des états que la maquette ne montre pas** : avant d'être créé, la carte dit « Le lien est désactivé : personne ne peut s'inscrire. » et « Créer le lien » ; après le tirage, « Le tirage a déjà eu lieu : plus personne ne peut s'inscrire. », sans bouton ni réglages ; à 30 membres, « Places restantes » vaut « En pause · l'événement est complet ». | Seul |
| `V3FeteRejoindre`, `RejoindreConnecte` | Connecté, la page garde la ligne de `V3FeteRejoindre` (« 🎄 Noël · le 25 décembre 2026 · 5 inscrits ») plutôt que celle de `RejoindreConnecte` (« Noël 2026 · échange le 25 décembre · 5 personnes inscrites ») : une seule ligne pour les deux états. « 5 inscrits » compte les participants du Secret Santa. Le nom du Secret Santa suit celui de l'événement, entre parenthèses, quand il y en a plusieurs la même année. | Seul |
| `RejoindreFerme` | Après le tirage, la même page dit « Le tirage a déjà eu lieu » · « Préviens l'organisateur de Famille Camille. » (« les organisateurs » quand ils sont plusieurs). Quelqu'un qui participe déjà voit `RejoindreFait`, avec « Voir mon tirage ». | Julien (ticket) |
| `V3QuoiDeNeuf` | La nouveauté des organisateurs dit « Hugo s'inscrit par le lien » (au présent, sans accord : l'application ne connaît pas le genre) et non « Hugo s'est inscrit », suivi du nom du Secret Santa entre parenthèses quand l'événement en a plusieurs cette année-là (Q-028). | Seul |

## La navigation (V3, ticket 114)

| Maquette | Ce que fait le code | Décidé par |
|---|---|---|
| `ListeTeneurs` | Le fil au-dessus du titre ne dit plus « Listes · » : seulement le nom de la liste, qui y ramène. La page « Listes » n'existe plus (`navigation.md`). | Seul (`navigation.md`) |
| `Famille` | « Mes proches » n'a plus de fil « Listes » au-dessus de son titre : elle s'ouvre depuis une liste, et « Retour » y ramène. | Seul (`navigation.md`) |
| `ListeInvitation` | Pendant qu'elle charge, l'invitation à tenir une liste montre un squelette à sa forme (la tuile, la pastille, le nom, trois lignes, les deux boutons) au lieu d'une roue seule. | Seul (`regles-d-ecran.md`) |

## Les lignes, les points rouges et « Quoi de neuf » (V3, tickets 112 et 120)

| Maquette | Ce que fait le code | Décidé par |
|---|---|---|
| `V3Accueil`, `V3AccueilJeu`, `V3Fete` | Le point rouge est un rond de 9 px en `coral-500`, avant la flèche ; un lecteur d'écran lit « nouveau ». « Devine qui » a l'icône `circle-help` dans un rond de 40 px, comme les autres lignes. | Seul (le composant du design system) |
| `V3Accueil`, `V3Fete` | Le titre d'une liste d'un autre nomme ceux pour qui elle est faite (les prénoms de la liste), sans personne ceux qui la tiennent (le prénom de leur compte), et non le prénom donné dans l'événement (« Mamie Camille »). | Seul (`lignes.md`) |
| `V3FeteOrganisateur` | Un Secret Santa dévoilé dit « Dévoilé », puis « Terminé » une fois clôturé, avant les cas « Fait · … » : « Tiré » s'entend d'un tirage pas encore dévoilé. | Seul |
| `V3Accueil` | « Quelqu'un te demande des idées » et son point s'en vont quand j'ouvre ma page du Secret Santa, ou dès que j'écris une idée, même si je n'ai rien écrit pour celui qui demande (on ne sait pas qui c'est). | Seul (`lignes.md`, « Il s'éteint quand j'ouvre la chose ») |
| `V3Accueil` | « Ma liste de cadeaux » d'une liste pour plus de trois personnes, moi compris : « Pour Léo, Zoé et 2 autres », où je compte parmi les autres. | Seul |
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
| Les écrans sans maquette de chargement | « Membres », la fiche d'une personne, les réglages d'un événement et d'un Secret Santa, « Qui reprendre ? », une liste (celui qui la tient, celui qui l'ouvre par son lien), « Qui voit ta liste ? », « Ce que j'offre ailleurs », les événements passés et une année passée ont un squelette composé des pièces de `UiSkeleton` à leur forme (lignes à icône, réglages, pastilles, barre de partage, en-tête d'une liste). | Seul (la règle : `regles-d-ecran.md`) |

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
| `V3FeteAnneePassee` | Sous « Ma liste de cadeaux » : pour qui elle était (« Pour Léo, Zoé et moi »), ou le nombre d'idées si elle n'était que pour moi ; rien d'autre. Sous la liste d'un autre : « Tu as offert 2 cadeaux », sinon rien. Les lignes ouvrent les listes comme aujourd'hui, où l'on peut encore écrire et cocher (Q-021). | Seul |
| `V3Fete`, `V3FeteAnniversaire` | « Les années passées » : le titre est le nom de l'année (« Noël 2025 ») ; pour un anniversaire fait pour un proche dont on connaît la naissance, son âge (« Ses 3 ans », ticket 118). Sans proche ou sans naissance : « Anniversaire 2025 ». | Seul, puis la conception (Q-022) |
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

## Le partage d'une liste (V3, ticket 106)

| Maquette | Ce que fait le code | Décidé par |
|---|---|---|
| `V3ListeQui`, `V3ListeQuiModifier` | Les événements sont rangés par nom. | Seul |
| `V3ListeQuiRetirer` | La confirmation compte les membres de l'événement retiré qui perdent vraiment la liste (ni ceux qui la tiennent, ni ceux qui la gardent par un autre événement), et ceux qui ont coché parmi tous ceux qui la perdent. Si personne ne la perd, pas de confirmation. Pour « Tout le monde », un titre (« Retirer « Tout le monde, avec le lien » ? ») que la spec ne donne pas, et pas de confirmation si personne n'a coché. | Seul |
| `V3ListeLienChanger` | Le nouveau lien vaut tout de suite, sans « Enregistrer ». | Seul |
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

## L'administration (V3, ticket 109)

| Maquette | Ce que fait le code | Décidé par |
|---|---|---|
| `V3Admin` | Seules les parties du ticket 109 sont là : « À traiter et à surveiller » n'a que « Comptes à leur limite de Secret Santa » et « Fêtes à 30 membres » (sans « Signalements » ni les autres chiffres), « En cas d'urgence » que « Suspendre les nouveaux Secret Santa ». Le haut reste celui d'avant (la carte « Capacité », puis « Tout voir » : Comptes, Fêtes, Guide de style) jusqu'au ticket 127 ; pas de section « Outils » ni de note sous les interrupteurs. L'onglet « Admin » n'a pas de pastille : il n'y a pas encore de signalements. | Seul |
| `V3Admin` | « Comptes à leur limite » mène aux comptes, « Fêtes à 30 membres » aux fêtes, sans filtre : la maquette ne dit pas où ils mènent. Un compte désactivé ne compte pas parmi ceux à leur limite. | Seul |
| `V3TiragePause` | Pendant la pause, un super-admin ne peut pas non plus créer de Secret Santa : l'interrupteur dit « les nouveaux ». Le formulaire d'un nouveau Secret Santa mène aussi à cet écran. | Seul |
| `V3TirageNouveauEcrire`, `Compte`, `GroupePersonne` | Une ligne qui s'écrit (ticket 162, `UiInlineTextRow`) garde la valeur dans un vrai champ, aligné à droite, à l'encre au repos ; pendant qu'on écrit, la bordure est une ombre intérieure de 1,5 px en `primary` et le label passe en `primary-ink`. Sur téléphone, les listes vont d'un bord à l'autre : la bordure n'a de coins qu'à partir de la largeur où la carte en a. Un toucher met le curseur au bout ; au clavier, le navigateur garde sa sélection. Dans « Mon compte » et la fiche d'un membre, la langue garde sa flèche et son panneau. L'icône d'un membre s'enregistre dès qu'on la choisit (plus de bouton « Enregistrer »). | Seul |
| `V3TirageBudget`, `V3TirageBudgetLibre` | Les tuiles, l'« ou » et les idées passent par les jetons les plus proches : le trait fin en `accented`, le choisi en `primary` (1,5 px) et `primary-ink`, les idées en `muted`. Le titre et le fil au-dessus sont ceux des autres pages de l'application (`UiPageContext`, `UiPageTitle`) ; « Valider » est en bas, fixé comme sur les autres pages de champ. Une idée reprise est un bouton `aria-pressed`. | Seul |
| `V3AdminCompte` | Le rôle dit « Organise » et non « Organisatrice » (l'application ne connaît pas le genre). | Seul |

## Le Secret Santa (V3, ticket 105)

| Maquette | Ce que fait le code | Décidé par |
|---|---|---|
| `V3TirageQuelleFete` | Sans aucune fête que j'organise, « Un Secret Santa » mène droit à « Pour quelle occasion ? » (les catégories) : il n'y a rien à choisir. La première fête est cochée d'avance. Le rond de choix est celui du téléphone. | Seul |
| `V3TirageNouveau` | Au-dessus du titre, le nom de la fête seul. Pour un premier Secret Santa, la carte dit « 5 membres de la fête. » au lieu de « repris du Secret Santa 2026 ». Le nom proposé est la catégorie et l'année (« Noël 2027 », « Anniversaire 2027 »). Le budget vide dit « Aucun ». Un « Devine qui » choisi finit à 18 h le jour de la fête, comme le panneau des réglages. | Seul |
| `V3TirageLimite` | Chaque ligne ouvre le Secret Santa. Un super-admin n'a pas de limite. | Seul |
| `V3FeteMembresComplet` | « 30 sur 30 » ne s'écrit qu'une fois la fête complète. Les membres comptés sont ceux qui participent (« Ne participe plus » ne compte pas). | Seul |

## La fête (V3, ticket 104)

| Maquette | Ce que fait le code | Décidé par |
|---|---|---|
| `V3Fete`, `V3FeteOrganisateur`, `V3FeteAnniversaire` | Pas de section « Les années passées » avant le ticket 108. | Julien, 20 novembre 2026 |
| `V3Fete` | Pour un simple membre, la ligne des membres n'ouvre rien (la page des membres est à l'organisateur). | Seul |
| `V3FeteOrganisateur` | Le titre de section est au pluriel pour l'organisateur ou dès deux Secret Santa. | Seul |
| `V3Fete` | Une ligne de liste s'ouvre sur la page d'aujourd'hui : la mienne dans son document, celle d'un autre par son lien public ; sans lien public, elle ne s'ouvre pas (règles du ticket 106). | Seul |
| `V3FeteQuitter` | Avec deux listes à moi dans l'événement, la phrase est au pluriel ; si l'une d'elles n'est dans aucun autre événement, c'est « Toi seul les verras… ». « Tu ne participeras plus à son Secret Santa l'an prochain » ne s'écrit que si la fête a un Secret Santa. Un organisateur ne peut pas quitter la fête. | Seul |
| `V3FeteNouvelle` | Le nom est proposé pour Noël (« Noël ») et pour un anniversaire (« L'anniversaire de Zoé », « Mon anniversaire » pour soi) ; vide pour les autres catégories. La date est remplie pour Noël et pour l'anniversaire d'un proche dont on connaît la date de naissance. | Seul |
| `V3FeteMembresReprendre` | Les pastilles des fêtes se cochent : cocher une fête montre et coche ses membres. Le nombre du bouton me compte. Plus de ligne « Inviter d'autres personnes » : un événement n'a plus de lien d'invitation (ticket 116), et l'étape disparaît avec le ticket 117. Seules les fêtes que j'organise sont proposées. | Seul |
| `V3FeteNouvelle`, `V3FeteMembresReprendre` | Après « Créer la fête », on arrive sur l'écran d'aujourd'hui de ce qu'on venait créer (création d'une édition, nouvelle liste), sinon sur la fête. | Julien, 20 novembre 2026 |
| `V3FeteReglages` | La catégorie et la date se changent dans un panneau du bas (comme les autres réglages), pas sur une page. Plus de section « Secret Santa » (ticket 159) : ses réglages s'ouvrent depuis son suivi. | Seul |
| `V3FeteInviter` | « Désactiver le lien » garde sa ligne d'aide (« Plus personne ne pourra s'inscrire »). | Seul |

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

## Un anniversaire sait pour qui il est fait (ticket 118)

| Maquette | Ce que fait le code | Décidé par |
|---|---|---|
| `V3FeteAnneePassee` | Pour un anniversaire dont on connaît l'âge, la pastille dit « 🎂 Ses 3 ans » au lieu de « Anniversaire 2025 » ; l'année reste dans la date dessous (« 14 décembre 2025 »). Pour moi : « Tes 40 ans ». | Seul (le ticket : « sa page de 2025 s'appelle Ses 3 ans ») |
| `V3FeteReglages` | Pour un anniversaire, une ligne « Pour » sous « Catégorie », de la même forme : l'icône du proche, son prénom (« Moi » pour moi), ou « Personne ». Elle ouvre un panneau de choix comme la catégorie : mes proches, puis « Personne ». Aucune maquette ne montre ces deux écrans. Le proche choisi par un autre organisateur se lit, sans icône ; « Valider » sans rien changer le garde. | Seul |
| `V3FeteAnniversaire` | « 7 cadeaux offerts à Zoé » ne nomme pas le proche quand c'est moi (« 7 cadeaux offerts ») ; il se lit aussi dans « Les événements passés ». Passer l'événement à une autre catégorie lui fait oublier pour qui il était fait. | Seul |

## Une liste d'une année passée, et « Repartir d'une liste » (ticket 119)

| Maquette | Ce que fait le code | Décidé par |
|---|---|---|
| `V3ListeAnneePassee` | Le bandeau se lit aussi dans le document de celui qui tient la liste, sous la barre du partage et au-dessus de l'icône : aucune maquette ne le montre là. | Seul (la spec : « à tout le monde, celui qui la tient compris ») |
| `V3ListeAnneePassee` | Le titre suit la catégorie de l'événement : « Liste de Noël 2025 », « Liste d'anniversaire 2025 », « Liste de mariage 2025 »… ; « Liste de 2025 » pour un événement « Autre ». Le bouton dit l'année comme ailleurs (« Noël 2026 », « Anniversaire 2026 »). | Seul |
| `V3ListeAnneePassee` | Le bouton mène au document de la liste de cette année pour qui la tient, à son lien pour les autres. Celui qui a tiré son auteur, quand elle lui est réservée, n'a pas de bouton : son droit passe par le lien de sa page de Secret Santa. | Seul |
| `V3ListeAnneePassee` | Le fond du bandeau est `warning-tint` (lilas 100, `#f1e8fc`) au lieu de `#efe7fb`. | Seul (le jeton le plus proche) |
| `ListeNouvelleReprendre` | Sous une liste sans personne : « Sans personne », comme avant ; sous une liste faite pour moi seul : « Moi ». | Seul |

## Le Secret Santa et ma partie d'une liste (ticket 136)

| Maquette | Ce que fait le code | Décidé par |
|---|---|---|
| `V3TirageQuelleListe` | Le panneau s'ouvre sur la page « Ma liste de cadeaux » (`/p/[jeton]/liste`), pas par-dessus le résultat : c'est là que mènent la ligne du tirage, « Écrire ma liste » de l'email et le retour de la connexion. Derrière lui, « Famille Camille · Noël 2026 » et « Ma liste de cadeaux ». | Seul |
| `V3TirageQuelleListe` | C'est `UiChoiceSheet` tel qu'il est (le ticket le demande) : le rond à gauche, la ligne choisie teintée, pas d'icône de liste à gauche, et « Annuler » sous « Continuer » (qui ramène à la page du tirage). | Seul (le composant du design system) |
| `V3TirageQuelleListe` | Les événements d'une liste sont son occasion et ceux où elle est partagée ; une liste faite sans événement (son événement à elle) n'en dit aucun : « Pour Zoé et moi » seul. Une liste faite pour moi seul ne dit que ses événements. | Seul |
| `V3TirageQuelleListe` | Ne sont proposées que les listes que je gère (pas celles où j'« aide à écrire » : leur partage n'est pas à moi), de l'année de l'événement, où je figure (mon « Moi », ou un proche d'un autre relié à mon compte). Le tri : même événement, même catégorie, puis la plus récemment modifiée. | Seul |
| `V3ListeSecretNouvelle` | Je suis mis sur la liste sans les idées pas offertes de ma dernière liste (que « Ajouter quelqu'un » reprendrait) : c'est « Repartir d'une liste » qui les propose. | Seul (le ticket : « propose de repartir de Noël 2025 ») |
| `V3ListeSecretNouvelle`, `V3ListeSecret` | « Secret Santa · Famille Camille » n'est que sous mon prénom, pour moi : un autre qui tient la liste ne le voit pas sous le sien ni sous le mien. Il y a une ligne par Secret Santa pas clôturé où je participe, dans un événement où la liste est partagée (tous les membres ou celui qui m'a tiré). Le nom du Secret Santa suit entre parenthèses quand l'événement en a plusieurs la même année. La zone qu'on touche fait 44 px, le texte garde sa hauteur. | Seul |
| `V3ListeSecretNouvelle` | « Repartir d'une liste » dans une liste déjà partagée (celui qui m'a tiré la lit) : les idées reprises n'ont pas de marque, et la phrase « Reprise de … » ne se lit pas ; elles ne servent que le temps d'un brouillon. Le mot d'accueil que j'ai déjà écrit n'est pas remplacé par celui de l'ancienne liste. | Seul |
| `V3ListeSurligne`, `V3ListeSurligneTout` | Le filtre ne se montre que si la personne de l'adresse est sur la liste ; sinon, la liste entière, sans les deux choix. La carte du résultat préfère, parmi les listes de la personne tirée, une où elle figure. | Seul |

## La liste, plus légère (ticket 147)

| Maquette | Ce que fait le code | Décidé par |
|---|---|---|
| `V3ListeSecret`, `V3ListeSecretNouvelle` | L'icône de la personne reste le rond de 40 px de la liste (prénom de 24 px), pas 52 px (prénom de 26 px) : le prénom et la pastille, centrés sur elle, la dépassent de quelques pixels. La pastille garde sa zone à toucher de 44 px, sans changer sa hauteur de 20 px. | Seul (la taille de toutes les personnes d'une liste) |
| `V3ListeMotAccueil` | Le mot proposé est le même pour toutes les catégories (« Quelques idées pour t'éviter de chercher… ») : aucun texte par catégorie n'est écrit dans la spec. | Seul |
| `V3ListeNouvelle` | Le crayon d'« Ajouter un mot d'accueil » est l'icône Lucide `pencil` de 12 px. | Seul |

## Lier et délier une liste d'un Secret Santa (ticket 148)

| Maquette | Ce que fait le code | Décidé par |
|---|---|---|
| `V3ListeSecretLie` | Le panneau (ticket 155) n'est que pour ceux qui gèrent la liste, comme son partage : pour celui qui aide à l'écrire, la pastille ne s'ouvre pas. Ses lignes sont `UiCheckRow` (60 px de haut, la case de l'application à droite) avec la tuile de l'événement en tête, au lieu de 56 px et d'une case native. | Seul |
| `V3ListeSecretLier` | « Lier à un Secret Santa » est dans le menu « … » de ma partie (ticket 153), avec l'enveloppe du tirage (`mail` de Lucide) ; il suit la fiche, avant « Monter », « Descendre » et « Retirer de cette liste ». La fiche garde le libellé du code, pas « Ma fiche et mes goûts ». L'entrée est là quand l'un de mes Secret Santa de l'année, tiré, n'est pas lié à cette liste (la spec ; le ticket 155 disait « n'a pas de liste », Q-037). | Seul |
| `V3ListeSecretLierConfirmer` | Le même panneau que `V3ListeSecretLie` (ticket 155) : les écarts sont les siens. | Seul |

## La visite d'une liste neuve (ticket 149)

| Maquette | Ce que fait le code | Décidé par |
|---|---|---|
| `V3ListeVisiteSecret1` | Dans la lumière : tout l'en-tête de ma partie (l'icône, « Camille (moi) », la pastille et « ⋯ »). | Seul |
| `V3ListeVisiteSecret4`, `V3ListeVisiteCreer1` | Dans la lumière : l'icône de la liste avec son nom et sa date (le bloc d'en-tête entier). | Seul |
| `V3ListeVisite*` | La note va au-dessus quand l'élément, une fois amené à l'écran, finit sous les deux tiers de sa hauteur ; sinon dessous. Le voile et la note sont ceux de la première coche (`ListsVeilNote`), ici avec « n sur N », « Passer » et « Suivant ». | Seul |
| `V3ListeVisiteIdee` | La note de la première ligne va sur la ligne vide de la première personne ajoutée, moi compris. | Seul |

## « Devine qui » mis en avant (ticket 150)

| Maquette | Ce que fait le code | Décidé par |
|---|---|---|
| `V3TirageNouveau`, `V3TirageNouveauQui`, `V3TirageNouveauSans` | Les trois choix sont `UiSegmented` à sa taille habituelle (40 px de haut, texte de 14 px) au lieu de 36 px et 13,5 px ; les couleurs du jeu passent par une teinte `game` du composant. La loupe est l'icône Lucide `search`. | Seul (le composant du design system) |
| `EditionMot`, `GroupeMot` | Les deux phrases se lisent aussi sous le titre des pages du formulaire de création (« Petit mot pour les participants », « Mot ajouté aux messages »), pas seulement dans les réglages d'un Secret Santa. | Seul |

## Ranger une liste : la poignée, les étoiles, les titres (ticket 152)

| Maquette | Ce que fait le code | Décidé par |
|---|---|---|
| `V3ListeLigneMenu`, `V3ListeLigneEtoiles` | L'étoile est dessinée en SVG (le contour de l'étoile Lucide), pleine en `rating` (`#f08a6c`), en contour `rating-off` (pêche 300) ; 14 px au bout du texte, 22 px dans le menu. Les icônes du menu sont Lucide : `heading`, `arrow-up`, `arrow-down`, `corner-down-right`, `trash-2`. | Seul |
| `V3ListeLigneMenu` | Sur ordinateur, la poignée qui apparaît au survol d'une ligne se pose à droite, sur la ligne, par-dessus la fin d'un texte long. | Seul |
| `V3ListeLigneDeplacer` | Aucun message après un déplacement, ni « Déplacée vers Zoé » ni « {name} déplacé » après un glisser (Julien, 24 novembre 2026) : seul un lecteur d'écran entend où la ligne est arrivée. Après « Monter » ou « Descendre », la ligne reste ouverte à l'écriture, comme avec `Alt` + une flèche. | Seul |
| `V3ListeTitres` | Un titre garde la ligne ouverte à l'écriture après « En faire un titre » (le clavier revient), comme après les étoiles. | Seul (la spec : « revient après un choix qui laisse dans la ligne ») |

## « Me prévenir » et le résumé par email (ticket 121)

| Maquette | Ce que fait le code | Décidé par |
|---|---|---|
| `NotifReglage` | Pas de phrase sous le titre (« Dans l'appli, une pastille signale toujours… ») : elle explique l'écran (`regles-d-ecran.md`, « Le moins de phrases possible »). | Seul (la règle du 24 novembre) |
| `NotifReglage` | La section « Sur ce téléphone » et « Installer l'application sur un autre téléphone » ne sont pas là : elles viennent avec le ticket 124. | Le ticket |
| `NotifReglage` | « Ce qui presse » et sa phrase ne se montrent qu'avec « Un résumé le matin » : la phrase ne parle que de ce choix. Les trois choix sont la carte de `UiChoiceList`, la ligne choisie teintée. | Seul |
| `Compte` | La maquette n'a pas de ligne vers « Me prévenir » : une carte d'une ligne, « Me prévenir », le choix à droite, entre « Mon profil » et « Mes appareils ». | Seul |
| `V3QuoiDeNeuf` | « Choisir ce qui me prévient » avec la cloche, « Ce que tu as vu s'efface au bout de trente jours » dessous, sur la ligne, comme la maquette. | — |
| `NotifEmailResume` | Un bloc par événement, au nom de l'événement (« Famille Camille ») et non « Secret Santa de Famille Camille » (`accueil-et-creation.md`) ; son lien ouvre l'événement (« Ouvrir l'événement »), ou la liste pour une liste publique (« Ouvrir la liste »). Les liens « Ne plus recevoir d'emails » et « Ce que l'application fait de tes données » attendent les tickets 130 et 131. | Seul (la spec) |

## Suivre une liste, ou une personne (ticket 122)

| Maquette | Ce que fait le code | Décidé par |
|---|---|---|
| `ListeSuivre` | « Tu suis les nouvelles idées pour Léo. » et « Tu suis les nouvelles idées de toute la liste. » plutôt que « Tu es prévenu… » : une tournure neutre (`CLAUDE.md`). | Seul |
| `ListeSuivre` | « Suivre toute la liste » et « Ne plus suivre » sont un petit bouton à contour, avec sa cloche, pas un lien rouge souligné : une action est une ligne ou un bouton (`regles-d-ecran.md`, « Ce qui reste vrai »). Sans rien suivre, le bouton est seul, sans phrase. | Seul |
| `ListeSuivre` | La cloche se pose au bout de l'en-tête de chaque personne de la liste d'aujourd'hui (son icône de 40 px, son nom, ses tailles), pas sur la ligne de la maquette d'avant la V3. Ma propre partie (« C'est toi ») n'en a pas. Une liste sans personne n'a que le bouton de toute la liste. | Seul |
| — | Sans compte, la cloche mène à la page de l'adresse de la liste (`ListeConnexion`), dite « Ton adresse email, pour suivre », sans le prénom : personne ne voit qui suit. | Seul |
| `NotifReglage` | « Ce que je suis » : une carte, une ligne par liste (son nom, les personnes ou « Toute la liste »), et « Ne plus suivre » au bout ; aucune maquette ne la dessine. | Seul |

## Durcir la dépense (ticket 129)

| Maquette | Ce que fait le code | Décidé par |
|---|---|---|
| `V3Admin` | « Les plafonds » n'a que les emails du jour (sur 100) et du mois (sur 3 000), avec leur jauge, l'écriture en lilas à 70 %. Les requêtes du jour et la dépense du mois attendent Q-039. « À 70 % d'un plafond, un email te prévient. » plutôt que « tu es prévenu » : une tournure neutre. | Seul (Q-039) |
| `V3Admin` | « À traiter et à surveiller » : quatre chiffres du jour de plus (les requêtes refusées pour débit, les connexions échouées, les emails rejetés, les erreurs du serveur). « Adresses qui ont refusé les emails » vient avec le ticket 130. Pas de phrase « Une pastille : … Un chiffre : … » : elle explique l'écran. | Seul (la règle du 24 novembre) |
| `V3Admin` | La phrase sous « En cas d'urgence » dit que les emails se suspendent tout seuls quand **ceux du mois** atteignent leur plafond, comme le ticket, et non quand la dépense l'atteint : l'application ne voit pas la dépense (Q-039). | Le ticket |
| `V3Admin` | Les chiffres de tête, « Ce qui tourne tout seul » et la version en ligne attendent le ticket 127. | Le ticket |
| `EnvoiSuspendu` | Sur « Envoyer par email » et sur le rappel de Devine qui. « Partager les liens » ouvre le suivi du Secret Santa, d'où chaque lien se partage depuis le téléphone. | Seul |

## Ne plus recevoir d'emails (ticket 130)

| Maquette | Ce que fait le code | Décidé par |
|---|---|---|
| `StopEmail` | Le pied se pose sous chaque email, hors connexion : la phrase du premier email (« Ce que l'application sait de toi : ton prénom et cette adresse, donnés par Camille. Rien d'autre. ») seulement au premier email à l'adresse, et sans « donnés par » quand l'application ne sait pas qui l'a donnée ; « Signaler cet envoi » seulement sous ce qu'un organisateur envoie lui-même. « Ce que l'application fait de tes données » attend le ticket 131. | Seul |
| `StopDemande`, `StopConfirme` | Sans le sélecteur de langue ni le lien des données (ticket 131). « Non, je garde les emails » mène à l'accueil. Après « Annuler », la page repose la question. | Seul |
| `StopSaisie` | L'avis est une carte lilas sous le champ, sans le bouton « Partager son lien » : la fiche a déjà ses façons de partager. Aussi sous l'ajout d'une personne, l'invitation à tenir une liste et le partage d'une liste par adresse. | Seul |
| `StopEnvoi` | « Envoyer par email » garde sa liste d'une seule pièce : la personne bloquée y est décochée, « A demandé à ne plus recevoir d'emails » sous son nom, sans « Ajouter ». Les deux titres « Recevront l'email » et « À prévenir autrement » ne sont pas là. | Seul |
| — | `/admin/envois-signales` n'a pas de maquette : une carte par événement, le nombre de signalements et la date du dernier, qui a envoyé, et « Couper ses emails ». | Seul |
