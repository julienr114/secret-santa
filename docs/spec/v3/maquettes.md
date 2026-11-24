# Les maquettes de la V3

Le canevas : https://claude.ai/artifact/6XYdmH9di9ctyAZxzLD9Ns, page « V3 · L'événement ». Dans le dépôt : la source dans `docs/refonte/maquettes/<Nom>.html`, la référence visuelle dans `docs/refonte/maquettes-sorbet/<Nom>.html`.

89 maquettes, dans l'ordre du canevas (une rangée par sujet). Depuis le 21 novembre 2026 elles disent « événement » ; leurs noms de fichiers gardent « Fete » (ils sont cités partout). Quinze d'entre elles datent du 20 novembre 2026 au soir (tickets de conception D01 à D12, `docs/travail/conception/`).

| Maquette | Ce qu’elle montre | Ticket |
|---|---|---|
| `V3Accueil` | Accueil · mes fêtes : leurs Secret Santa et les listes de leurs membres ; un anniversaire proposé ; ce que j’offre ailleurs ; l’onglet « Créer » dans la barre du bas ; ce que j’organise : « Gérer l’événement », et « Tu l’organises » sous « Le Secret Santa » | 103, 156 |
| `V3AccueilSansSecret` | Accueil · un événement que j’organise n’a pas de Secret Santa cette année : sa carte propose « Créer un Secret Santa », puis « Créer une liste de cadeaux » | 151 |
| `V3AccueilAvantNoel` | Accueil · une fête qui n’est pas Noël et qui vient avant : elle est au-dessus de la saison de Noël, sans titre ; l’accueil suit les dates | 112 |
| `V3ChargementAccueil` | Chargement · le nouvel accueil : le bonjour, le titre de la saison, des cartes d’événement avec leurs lignes | 099 |
| `V3ChargementFete` | Chargement · la page d’un événement : la catégorie, le nom, la date, les membres, puis les Secret Santa et les listes | 099 |
| `V3ChargementQuoiDeNeuf` | Chargement · « Quoi de neuf » : le titre, puis une section par événement avec ses lignes | 120 |
| `V3AccueilVide` | Accueil · un compte tout neuf : un Secret Santa ou une liste ; on ne parle pas de « événement », c’est leur première étape | 103 |
| `V3AccueilAnnee` | Accueil · l’année suivante (fin octobre 2027) : « Préparer Noël 2027 », « Reprendre ma liste de l’an dernier » | 108 |
| `V3AccueilPlusOuvert` | Accueil · l’onglet « Créer » touché : un Secret Santa ou une liste ; la fête est la première étape des deux | 103 |
| `V3FetesPassees` | Accueil · « Les événements passés » : par année, la plus récente en haut ; une fête qui revient y laisse une ligne par année | 108 |
| `V3AccueilJeu` | Accueil · le 22 décembre : « Devine qui » ouvert dans une fête, un Secret Santa dévoilé et son palmarès dans une autre ; aucun résultat de tirage sur l’accueil | 112 |
| `V3QuoiDeNeuf` | « Quoi de neuf » · regroupé par fête, la plus récente en haut ; une liste publique où j’ai coché a sa section | 120 |
| `V3TirageQuelleFete` | Secret Santa · première étape : « Pour quelle occasion ? », une fête que j’organise ou une autre occasion | 105 |
| `V3Fete` | Événement · vue par un membre : ses membres, son Secret Santa, les listes, les années passées, « Quitter » | 104 |
| `V3FeteOrganisateur` | Événement · vue par son organisateur : les réglages, « Un autre Secret Santa » ; la ligne des membres ouvre « Membres » | 104 |
| `V3FeteAnniversaire` | Événement · « pour quelqu’un » (un anniversaire) : sa liste d’abord ; un Secret Santa reste possible | 104 |
| `V3FeteNouvelle` | Première étape d’un Secret Santa ou d’une liste, quand l’occasion est nouvelle : « Pour quelle occasion ? », la catégorie d’abord, qui remplit le reste ; pas d’étape « membres » | 117 |
| `V3FeteMembresReprendre` | Secret Santa ou liste · « Reprendre ceux d’un autre événement » : on coche qui (le nom du fichier est resté) | 117 |
| `V3FeteQuitter` | Événement · quitter : ce qui sort, ce qui reste | 104 |
| `V3FeteAnneePassee` | Événement · une année passée (Noël 2025) : son Secret Santa et ses listes, en lecture seule ; rien à créer, rien à régler | 108 |
| `V3FeteReglages` | Événement · réglages : la catégorie, la date, la récurrence, les organisateurs ; ceux du Secret Santa sont sur le Secret Santa | 104 |
| `V3FeteMembres` | Événement · ses membres, et par où chacun est entré (un Secret Santa, une liste) ; « Ajouter quelqu’un » mène au Secret Santa ou à ma liste, jamais à l’événement lui-même | 117 |
| `V3FeteInviter` | Secret Santa · inviter par lien : on s’inscrit au Secret Santa, et l’on devient membre de son événement (le nom du fichier est resté) | 116 |
| `V3FeteRejoindre` | Secret Santa · son lien d’invitation, sans compte : « On t’invite au Secret Santa » (le nom du fichier est resté) | 116 |
| `V3FeteMembresComplet` | Événement · complet, vu par l’organisateur : 30 membres, le lien du Secret Santa en pause | 117 |
| `V3TirageNouveau` | Secret Santa · celui de l’année : cinq lignes, puis la carte « Devine qui » sur « Toutes les paires » | 105, 150 |
| `V3TirageNouveauQui` | Secret Santa · nouveau, « Devine qui » sur « Qui m’offre ? » : la phrase dit ce qui va se passer | 150 |
| `V3TirageNouveauSans` | Secret Santa · nouveau, « Devine qui » sur « Sans » : le jeu est éteint | 150 |
| `V3TirageNouveauSeul` | Secret Santa · nouveau, dans un événement où je suis seul : « Il n’y a que toi pour l’instant. Tu ajoutes les participants juste après. » | 154 |
| `V3TirageLimite` | Secret Santa · la limite : 3 par compte, sans demande à personne | 105 |
| `V3TirageVersListe` | Secret Santa · du résultat à la liste de cadeaux d’Inès, sans lien ; le mode anonyme s’active seul | 107 |
| `V3TirageNeutre` | Secret Santa · hors de Noël (catégorie « Autre ») : il garde son nom, « Secret Santa » ; aucun « Père Noël » | 105 |
| `V3TirageReglages` | Secret Santa · ses réglages : son nom, sa date, son budget et son petit mot d’abord ; puis éviter la même personne, Devine qui, le mot des messages, les emails du tirage | 105 |
| `V3ListeSurligne` | Secret Santa · la liste de la personne tirée, filtrée sur elle : sa partie seule, deux choix en haut (« Inès », « Toute la liste »), le mode anonyme déjà activé | 107, 136 |
| `V3ListeSurligneTout` | Secret Santa · la liste de la personne tirée, « Toute la liste » choisi : tout le monde, elle en premier | 136 |
| `V3TirageQuelleListe` | Secret Santa · « Ma liste de cadeaux » touché quand je tiens déjà une liste où je figure : celle-là, ou une nouvelle | 136 |
| `V3TirageNouvelles` | Secret Santa · le résultat quand la liste de la personne tirée a de nouvelles idées : la ligne de sa liste le dit | 107 |
| `V3TiragePause` | Secret Santa · en pause : ce que voit quelqu’un qui veut en créer un quand le super-admin a suspendu les nouveaux | 109 |
| `V3ListeQui` | Liste · « Partager » touché sur un brouillon : la barre se déroule par-dessus la liste ; personne ne la voit encore, « Ajouter » est ouvert sur mes événements | 106, 135, 138, 139 |
| `V3Liste` | Liste · la mienne, partagée dans deux événements : la barre dit qui la voit, « Modifier », et « Copier le lien » | 106 |
| `V3ListeNouvelle` | Liste · nouvelle : elle naît en brouillon, moi seul la vois ; le lien est déjà là | 106 |
| `V3ListePublique` | Liste · publique, le dernier stade : quiconque a le lien la voit et coche, sans compte | 106 |
| `V3ListeMembre` | Liste · celle d’un autre membre : on y arrive par la fête, sans lien ; la fête est rappelée en haut | 106 |
| `V3OffreAilleurs` | Liste · « Ce que j’offre ailleurs » : les listes publiques où j’ai coché, pas celles que j’ai seulement ouvertes | 106 |
| `V3ListeQuiSecret` | Liste · « Modifier » touché sur une liste montrée à celui qui m’a tiré : lui seul est dans « Qui je veux » | 107, 135, 139 |
| `V3ListeSecret` | Liste · la mienne, montrée seulement à celui qui m’a tiré ; sous mon prénom, le Secret Santa auquel ma partie est liée | 107, 135, 136 |
| `V3ListeCompteCree` | Liste · sans compte, par son lien : le compte se crée tout seul à la première chose écrite, et on le dit | 107 |
| `V3ListeAdresse` | Liste · arrivé par un lien copié, sans adresse email : on la demande au moment d’écrire sa liste ; pas de liste sans adresse | 107 |
| `V3ListeQuiLien` | Liste · « Tout le monde » choisi : plus personne à choisir, il reste « Changer de lien » | 106, 135, 139 |
| `V3ListeLienChanger` | Liste · « Changer de lien » touché : un niveau plus loin dans la barre, la conséquence, « Changer » ; le retour annule | 139, 141 |
| `V3ListeLienNouveau` | Liste · le lien vient de changer : la nouvelle adresse est dans la barre, « Nouveau lien créé » | 139 |
| `V3ListeQuiModifier` | Liste · « Modifier » touché : deux choix, « Qui je veux » ou « Tout le monde » ; dessous, seulement ceux qui la voient, chacun avec sa croix, « Ajouter », et « Changer de lien » | 106, 135, 138, 139 |
| `V3ListeQuiAjouter` | Liste · « Ajouter » touché : mes autres événements, « Celui qui m’a tiré » et « Quelqu’un d’autre », en pastilles ; en toucher une l’ajoute | 139 |
| `V3ListeQuiOuvrir` | Liste · « Tout le monde » touché : un niveau plus loin dans la barre, la conséquence, « Ouvrir » ; le retour annule | 139, 141 |
| `V3ListeQuiRetirer` | Liste · la croix touchée : un niveau plus loin dans la barre, la conséquence, « Retirer » ; le retour annule | 139, 141 |
| `V3ListeOccasion` | Liste · première étape : « Pour quelle occasion ? » ; la liste y naît en brouillon | 106 |
| `V3ListeFermee` | Liste · arriver par le lien sans être connecté, quand elle n’est pas publique | 106 |
| `V3ListeFermeeConnecte` | Liste · arriver par le lien, connecté, sans y avoir droit (un brouillon, une liste réservée à celui qui a tiré) | 106 |
| `V3ListeInviter` | Liste · « Quelqu’un d’autre » touché : on reste dans la barre, un niveau plus loin, avec un retour ; son prénom, son adresse, « Inviter », et « Reprendre ceux d’un autre événement » | 117, 139 |
| `V3ListeInviterEmail` | Liste · « Quelqu’un d’autre », le prénom et l’adresse écrits : « Inviter » | 117, 139 |
| `V3ListeInviteEnvoyee` | Liste · l’invitation est partie : la barre est revenue à « Qui voit ta liste ? », un membre de plus, « Invitation envoyée » | 139 |
| `V3ListeInviterReprendre` | Liste · « Reprendre ceux d’un autre événement », toujours dans la barre : l’événement, ceux qu’on coche, « Inviter · 3 personnes » | 139 |
| `V3ListePartageEmail` | Liste · l’email reçu par celui qu’on invite par son adresse | 117 |
| `V3ListeAnneePassee` | Liste · celle d’une année passée : elle reste ouverte ; un bandeau dit de quelle année elle est, et mène à celle de cette année | 119 |
| `V3ListeAideLien` | Liste · pour celui qui « aide à écrire » : « Le lien » déroule la barre, qui ne contient que le lien à copier | 135 |
| `V3ListeSecretNouvelle` | Liste · créée depuis mon Secret Santa : j’y suis déjà, en premier ; sous mon prénom, le Secret Santa | 136 |
| `V3ListeMotAccueil` | Liste · « Ajouter un mot d’accueil » touché : le mot de départ de la catégorie est proposé, prêt à être changé ; vidé, la liste n’a pas de mot | 147 |
| `V3ListeSecretLie` | Liste · la pastille « Secret Santa · Famille Camille » touchée : mes Secret Santa de l’année, à cocher ; décocher délie | 148, 155 |
| `V3ListeSecretLier` | Liste · j’y figure, et un de mes Secret Santa de l’année n’a pas de liste : « Lier à un Secret Santa », dans le menu « … » de ma partie | 148, 153 |
| `V3ListeSecretLierConfirmer` | Liste · « Lier à un Secret Santa » touché : mes Secret Santa de l’année, à cocher ; l’un est lié à une autre liste | 148, 153, 155 |
| `V3ListeVisiteSecret1` à `V3ListeVisiteSecret6` | Visite · liste créée depuis un Secret Santa : ma partie, une idée par ligne, qui la voit, le nom et la date, repartir d’une liste, ajouter quelqu’un | 149 |
| `V3ListeVisiteCreer1` à `V3ListeVisiteCreer3` | Visite · liste créée depuis « Créer » : le nom et la date, pour qui, personne ne la voit encore | 149 |
| `V3ListeVisiteIdee` | Visite · depuis « Créer », la première personne ajoutée : une note sur sa première ligne | 149 |
| `V3ListeLigneMenu` | Liste · la poignée de la ligne qu’on écrit, touchée : « Envie » et ses trois étoiles, « En faire un titre », « Monter », « Descendre », « Déplacer vers… », « Supprimer la ligne » | 152 |
| `V3ListeLigneEtoiles` | Liste · trois étoiles choisies : elles se posent au bout de la ligne, on continue d’écrire | 152 |
| `V3ListeLigneTitre` | Liste · « En faire un titre » touché : le point, le texte plus grand, plus de lien ; sa poignée propose « En refaire une idée » | 152 |
| `V3ListeLigneDeplacer` | Liste · « Déplacer vers… » touché : les autres personnes de la liste ; en toucher une y envoie la ligne | 152 |
| `V3ListeTitres` | Liste · ce que tout le monde lit : un titre sur la ligne de la personne, les étoiles au bout des idées | 152 |
| `V3ListeReprise` | Liste · reprise de l’an dernier : dans sa fête, les idées pas offertes marquées pour moi seul | 108 |
| `V3Admin` | Administration · le tableau de bord : des fêtes, plus de « Demandes » ; les limites atteintes se surveillent ; « Suspendre les nouveaux Secret Santa » | 109 |
| `V3AdminComptes` | Administration · les comptes : plus de demande à traiter ; un compte à sa limite de Secret Santa se voit | 109 |
| `V3AdminCompte` | Administration · un compte : sa limite de Secret Santa (3 au départ, le super-admin la change), ses fêtes | 109 |

## Maquettes qui servent aussi à la V3

| Maquette | Ce qu’elle montre | Ticket |
|---|---|---|
| `MenuAvatar`, `MenuAvatarOuvert` | L’icône du compte à la place du burger, et son menu | 103 |
| `ProcheNaissance` | Les trois listes d’une date | 105 |
| `ListeGroupeFil`, `ListeGroupeFilDeplie` | Le dessin d’une liste (Correction 30) | 106 |
| `ListeAidePartage` | La barre du haut pour celui qui aide à tenir la liste : repliée, avec « Le lien » à la place de « Modifier » | 106, 135 |
| `RejoindreFerme` | Ce que voit celui qui ouvre le lien d’une fête complète | 105 |
| `PistesDemander`, `PistesResultatVide`, `PistesResultatDemande`, `PistesEmail` | « Lui demander des idées », anonyme : la question, le résultat sans rien d’écrit, la demande envoyée, l’email reçu (les noms de fichiers sont restés) | 107 |
| `ListeTeneurs`, `ListeTeneursNiveau`, `ListeInvitation` | « Aider à écrire » ou « Gérer la liste » : seul celui qui gère choisit qui la voit | 106 |
| `AdminSignalement`, `ListePartageSuspendu`, `ModerationEmail` | Un signalement arrête le lien public d’une liste, pas sa présence dans ses fêtes | 132 |
| `ListeCocherPourMoi`, `ListeCocherPourDepart`, `ListeCocherPourChoix`, `ListeCocherPourLigne`, `ListeCocherPour`, `ListeCocherPourAutre` | Cocher pour quelqu’un, dans l’ordre du parcours : je coche (à mon nom), « Tu l’offres › » ouvre « Qui l’offre ? », je touche Mamie, enregistré, à plusieurs, quelqu’un d’autre ; fait sur `main`, sans ticket | — |
| `PersonnaliserMessage` | Personnaliser le message d’un envoi de Secret Santa. Ne sert plus aux listes : « Le message qui accompagne le lien » disparaît (ticket 139) | 106 |

## Les maquettes d'avant, passées à la V3

Le 20 novembre 2026, les 268 maquettes d'avant qui restent valables ont été passées aux mots et à l'habillage de la V3 ; 169 ont changé. Elles redeviennent la référence pour ce que la V3 ne redessine pas.

- **L'icône du compte** remplace le burger (96 maquettes).
- **La barre du bas** : « Accueil », « Créer », « Quoi de neuf », et « Admin » pour le super-admin.
- **Les mots** (`vocabulaire.md`) : « événement » pour « groupe », « Secret Santa » pour « édition » et pour « tirage » quand il désigne la chose, « liste » et « idées » pour « pistes ». « Tout le groupe » devient « tous les membres ».
- **Sur la page de celui qui tire**, la ligne « Mes pistes de cadeaux » devient « Ma liste de cadeaux », avec son état (« Vue seulement par celui qui m'a tiré », ou « À écrire »).
- Les liens vers une maquette périmée mènent à celle qui la remplace.

Ce passage ne change que des textes et l'en-tête : aucune structure d'écran. Trois phrases ont été réécrites parce que leur sens changeait : « Fige l'édition et les pistes de cadeaux » (« Fige le Secret Santa »), « Les pistes de cadeaux restent modifiables jusqu'à la clôture de l'édition » (« Les listes de cadeaux restent modifiables. »), « Ce n'est pas ton groupe : l'application a atteint sa limite » (« Ça ne vient pas de toi… »).

Le même soir, deux retouches de plus sur les maquettes d'avant (tickets de conception D04 et D07) : **la barre du haut des listes** dit où est la liste (15 maquettes `Liste*`, `MenuAvatarListe`, `ProcheSupprime`), et **« Tes données, en clair » et la page de présentation** disent qui voit une liste (`Confidentialite`, `Landing`, `LandingDesktop`).

Les titres des maquettes sur le canevas ont été repris le même soir, deux pages renommées (« Organisateur · Secret Santa », « Organisateur · événement ») et les rangées resserrées (ticket de conception D08).

## Périmées

Elles ne décrivent plus rien de la V3. **Elles ne sont plus sur le canevas** depuis le 20 novembre 2026 au soir (85 maquettes retirées ; plus aucune maquette gardée n'y mène). **Leurs fichiers ont été supprimés du dépôt le même soir** (88 maquettes, 176 fichiers, à la demande de Julien) : il reste 333 maquettes dans `docs/refonte/maquettes/` et autant dans `docs/refonte/maquettes-sorbet/`. Pour en revoir une : l'historique Git, ou celui de l'artifact. La liste ci-dessous reste comme mémoire de ce qui a existé et de ce qui le remplace.

- **L’accueil d’avant (remplacé par `V3Accueil`, `V3AccueilVide`, `V3AccueilAnnee`)** : `Accueil`, `AccueilDemandeAcceptee`, `AccueilDemandeAttente`, `AccueilDemandeRefusee`, `AccueilDevoileAvant`, `AccueilFetes2`, `AccueilMenu`, `AccueilOrganisateur`, `AccueilPisteFetes`, `AccueilPisteFil`, `AccueilPisteFilSansCarte`, `AccueilPisteSaison`, `AccueilPisteSwitchListes`, `AccueilPisteSwitchSansCarte`, `AccueilPisteSwitchSansCarteListes`, `AccueilPisteSwitchTirages`, `AccueilPistesNouvelles`, `AccueilPlusieurs`, `AccueilVide`, `DevineAccueil`, `DevineAccueilFin`, `DevineAccueilPalmares`, `ListesAccueil`, `ListesVide`, `NavListe`, `NavRedaction`, `NavTirage`, `NotifAccueil`, `NotifMenu`, `TiragesPasses`.
- **Les demandes et les quotas (plus de demande)** : `AdminDemande`, `AdminDemandeParticipants`, `AdminDemandes`, `DemandeGroupe`, `DemandePlus`, `LimiteGroupes`, `LimiteParticipants`, `PanneauDemandeGroupe`.
- **Les pages du groupe (remplacées par les `V3Fete*`)** : `FeteChoisir`, `FeteInviter`, `FeteMembres`, `FeteNouvelle`, `FetePage`, `FeteReglages`, `Groupe`, `GroupeInvitation`, `GroupeMembres`, `GroupeNouveau`, `GroupeNouveauAdmin`, `GroupeReglages`, `GroupeSansEdition`, `Rejoindre`.
- **La création et les réglages d’une édition (remplacés par `V3TirageNouveau`, `V3TirageReglages`)** : `EditionNouvelle`, `EditionReglages`, `PropEditionReglages`, `TirageNouveau`.
- **La page « Mes pistes » et ses pages (remplacées par la liste et la fiche « Moi »)** : `Pistes`, `PistesDemande`, `PistesIdee`, `PistesListe`, `PistesListeChoisir`, `PistesQuestion`, `PistesQuestionModifier`, `PistesReglage`, `PistesRubrique`, `PistesTexteEviter`, `PistesTexteMoment`, `PistesTexteServirait`, `PistesVide`, `SouhaitsIdee`.
- **L’administration avec les demandes (remplacée par `V3Admin`, `V3AdminComptes`, `V3AdminCompte`)** : `Admin`, `AdminCompte`, `AdminComptes`.
- **Les états d’une liste qui n’existent plus (remplacés par `V3ListeNouvelle`, `V3ListePublique`, `V3ListeQuiLien`, `V3ListeLienChanger`)** : `ListeAideSansPartage`, `ListeChangerLien`, `ListeEtatBrouillon`, `ListeEtatPubliee`, `ListeNouvelle`, `ListePartageArrete`.
- **« Quoi de neuf » à plat et le résultat avec ses pistes (remplacés par `V3QuoiDeNeuf`, `V3TirageVersListe`, `V3TirageNouvelles`)** : `NotifCentre`, `PistesResultat`, `PistesResultatListe`, `PistesResultatNouvelles`.
- **L’exploration d’avant la V3** : `ListeV3`, `ListeV3Nouvelle`.
- **Les pistes écartées de la V3** : `V3AccueilPlus`, `V3AccueilPlusTitre`, `V3TirageDemande`.

Les maquettes `Futur*` (des idées jamais planifiées) n'ont pas été touchées.

**Treize fichiers orphelins** (ni sur le canevas, ni cités par le code) sont à supprimer des deux dossiers, à la demande de Julien (Q-024, 22 novembre 2026) : `AdminAcces`, `AdminAccesMenu`, `AdminPlusieursDemandes`, `AdminSansDemande`, `FeteAjouterListe`, `FetePartagee`, `FetePartageeAjoutee`, `Souhaits`, `SouhaitsVide`, `ListeIdeeBulle`, `ListeIdeeBulleGras`, `ListeSansPersonneA`, `ListeSansPersonneB`. C'est Claude Code qui le fait, dans un commit ; l'historique Git les garde.

## Pas encore dessinées

Plus rien d'ouvert au 20 novembre 2026 au soir : les douze tickets de conception sont dans `docs/travail/conception/dessine/`. Ce qui reste à trancher est dans `docs/travail/questions.md` (Q-001 à Q-013), et chaque ticket dessiné dit ce qui a été décidé seul.

Trois choses n'ont pas de maquette à elles, et c'est voulu :

- **« Devine qui » hors de Noël** : les écrans sont les mêmes, les mots changent (`vocabulaire.md`, « Devine qui hors de Noël »).
- **Les emails** : leurs textes ont été relus et retouchés dans leurs maquettes ; la règle de leurs objets est dans `secret-santa.md`.
- **La page de présentation** : sa phrase d'accroche et une ligne ont changé ; elle n'a pas de nouvelle illustration.
