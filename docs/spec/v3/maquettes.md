# Les maquettes de la V3

Le canevas : https://claude.ai/artifact/6XYdmH9di9ctyAZxzLD9Ns, page « V3 · La fête ». Dans le dépôt : la source dans `docs/refonte/maquettes/<Nom>.html`, la référence visuelle dans `docs/refonte/maquettes-sorbet/<Nom>.html`.

46 maquettes, dans l'ordre du canevas (une rangée par sujet). Quinze d'entre elles datent du 20 novembre 2026 au soir (tickets de conception D01 à D12, `docs/travail/conception/`).

| Maquette | Ce qu’elle montre | Ticket |
|---|---|---|
| `V3Accueil` | Accueil · mes fêtes : leurs Secret Santa et les listes de leurs membres ; un anniversaire proposé ; ce que j’offre ailleurs ; l’onglet « Créer » dans la barre du bas | 103 |
| `V3AccueilVide` | Accueil · un compte tout neuf : un Secret Santa ou une liste ; on ne parle pas de « fête », c’est leur première étape | 103 |
| `V3AccueilAnnee` | Accueil · l’année suivante (fin octobre 2027) : « Préparer Noël 2027 », « Reprendre ma liste de l’an dernier » | 108 |
| `V3AccueilPlusOuvert` | Accueil · l’onglet « Créer » touché : un Secret Santa ou une liste ; la fête est la première étape des deux | 103 |
| `V3FetesPassees` | Accueil · « Les fêtes passées » : par année, la plus récente en haut ; une fête qui revient y laisse une ligne par année | 108 |
| `V3AccueilJeu` | Accueil · le 22 décembre : « Devine qui » ouvert dans une fête, un Secret Santa dévoilé et son palmarès dans une autre ; aucun résultat de tirage sur l’accueil | 110 |
| `V3QuoiDeNeuf` | « Quoi de neuf » · regroupé par fête, la plus récente en haut ; une liste publique où j’ai coché a sa section | 110 |
| `V3TirageQuelleFete` | Secret Santa · première étape : « Pour quelle occasion ? », une fête que j’organise ou une autre occasion | 105 |
| `V3Fete` | Fête · vue par un membre : ses membres, son Secret Santa, les listes, les années passées, « Quitter » | 104 |
| `V3FeteOrganisateur` | Fête · vue par son organisateur : « Inviter », les réglages, « Un autre Secret Santa » | 104 |
| `V3FeteAnniversaire` | Fête · « pour quelqu’un » (un anniversaire) : sa liste d’abord ; un Secret Santa reste possible | 104 |
| `V3FeteNouvelle` | Première étape d’un Secret Santa ou d’une liste, quand l’occasion est nouvelle : « Pour quelle occasion ? », la catégorie d’abord, qui remplit le reste | 104 |
| `V3FeteMembresReprendre` | Fête · nouvelle, suite : « Reprendre les membres d’une autre fête », on coche qui | 104 |
| `V3FeteQuitter` | Fête · quitter : ce qui sort, ce qui reste | 104 |
| `V3FeteAnneePassee` | Fête · une année passée (Noël 2025) : son Secret Santa et ses listes, en lecture seule ; rien à créer, rien à régler | 108 |
| `V3FeteReglages` | Fête · réglages : la catégorie, la date, la récurrence, les organisateurs ; ceux du Secret Santa sont sur le Secret Santa | 104 |
| `V3FeteMembres` | Fête · ses membres (certains sans compte : ils participent au Secret Santa, ils ne voient pas les listes) | 104 |
| `V3FeteInviter` | Fête · inviter par lien | 104 |
| `V3FeteRejoindre` | Fête · le lien d’invitation, sans compte : on rejoint une fête, et son Secret Santa s’il y en a un | 104 |
| `V3FeteMembresComplet` | Fête · complète, vue par l’organisateur : 30 membres, plus d’« Ajouter une personne », le lien d’invitation en pause | 105 |
| `V3TirageNouveau` | Secret Santa · celui de l’année : la date de la fête est déjà là, et se change | 105 |
| `V3TirageLimite` | Secret Santa · la limite : 3 par compte, sans demande à personne | 105 |
| `V3TirageVersListe` | Secret Santa · du résultat à la liste de cadeaux d’Inès, sans lien ; le mode anonyme s’active seul | 107 |
| `V3TirageNeutre` | Secret Santa · hors de Noël (catégorie « Autre ») : il garde son nom, « Secret Santa » ; aucun « Père Noël » | 105 |
| `V3TirageReglages` | Secret Santa · ses réglages : éviter la même personne, les pistes de cadeaux, le mot des messages, les emails du tirage | 105 |
| `V3ListeSurligne` | Secret Santa · la liste de la personne tirée : la liste entière, la page s’ouvre calée sur sa partie (ici Inès, en bas), le mode anonyme déjà activé | 107 |
| `V3TirageNouvelles` | Secret Santa · le résultat quand la liste de la personne tirée a de nouvelles idées : la ligne de sa liste le dit | 107 |
| `V3TiragePause` | Secret Santa · en pause : ce que voit quelqu’un qui veut en créer un quand le super-admin a suspendu les nouveaux | 109 |
| `V3ListeQui` | Liste · première étape : « Qui verra ta liste ? », une ou plusieurs de mes fêtes ou une autre occasion ; en plus, tout le monde avec un lien | 106 |
| `V3Liste` | Liste · la mienne : la barre dit dans quelles fêtes elle est ; « Modifier » rouvre « Qui verra ta liste ? » | 106 |
| `V3ListeNouvelle` | Liste · nouvelle : le nom, la date et l’icône viennent de la fête | 106 |
| `V3ListePublique` | Liste · publique (un mariage) : dans sa fête, et ouverte à tous par un lien, sans compte pour cocher | 106 |
| `V3ListeMembre` | Liste · celle d’un autre membre : on y arrive par la fête, sans lien ; la fête est rappelée en haut | 106 |
| `V3OffreAilleurs` | Liste · « Ce que j’offre ailleurs » : les listes publiques où j’ai coché, pas celles que j’ai seulement ouvertes | 106 |
| `V3ListeQuiSecret` | Liste · depuis mon Secret Santa : « Celui qui m’a tiré » est choisi d’avance ; « Toute la fête » reste possible | 107 |
| `V3ListeSecret` | Liste · la mienne, montrée seulement à celui qui m’a tiré : les anciennes « pistes de cadeaux » | 107 |
| `V3ListeCompteCree` | Liste · sans compte, par son lien : le compte se crée tout seul à la première chose écrite, et on le dit | 107 |
| `V3ListeAdresse` | Liste · arrivé par un lien copié, sans adresse email : on la demande au moment d’écrire sa liste ; pas de liste sans adresse | 107 |
| `V3ListeQuiLien` | Liste · publique, « Modifier » touché : le lien, « Copier », le message qui l’accompagne, « Changer de lien » | 106 |
| `V3ListeLienChanger` | Liste · publique, changer de lien : la conséquence avant le geste | 106 |
| `V3ListeQuiModifier` | Liste · « Modifier » touché sur une liste dans deux fêtes : les mêmes cases, « Enregistrer » | 106 |
| `V3ListeQuiRetirer` | Liste · retirer sa liste d’une fête : la conséquence avant le geste ; les cadeaux cochés restent prévus | 106 |
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
| `ListeAidePartage` | La barre du haut pour celui qui aide à tenir la liste : sans « Modifier » | 106 |
| `RejoindreFerme` | Ce que voit celui qui ouvre le lien d’une fête complète | 105 |
| `PistesDemander`, `PistesResultatVide`, `PistesResultatDemande`, `PistesEmail` | « Lui demander des idées », anonyme : la question, le résultat sans rien d’écrit, la demande envoyée, l’email reçu (les noms de fichiers sont restés) | 107 |
| `ListeTeneurs`, `ListeTeneursNiveau`, `ListeInvitation` | « Aider à écrire » ou « Gérer la liste » : seul celui qui gère choisit qui la voit | 106 |
| `AdminSignalement`, `ListePartageSuspendu`, `ModerationEmail` | Un signalement arrête le lien public d’une liste, pas sa présence dans ses fêtes | 132 |
| `PersonnaliserMessage` | « Le message qui accompagne le lien » d’une liste publique | 106 |

## Les maquettes d'avant, passées à la V3

Le 20 novembre 2026, les 268 maquettes d'avant qui restent valables ont été passées aux mots et à l'habillage de la V3 ; 169 ont changé. Elles redeviennent la référence pour ce que la V3 ne redessine pas.

- **L'icône du compte** remplace le burger (96 maquettes).
- **La barre du bas** : « Accueil », « Créer », « Quoi de neuf », et « Admin » pour le super-admin.
- **Les mots** (`vocabulaire.md`) : « fête » pour « groupe », « Secret Santa » pour « édition » et pour « tirage » quand il désigne la chose, « liste » et « idées » pour « pistes ». « Tout le groupe » devient « tous les membres ».
- **Sur la page de celui qui tire**, la ligne « Mes pistes de cadeaux » devient « Ma liste de cadeaux », avec son état (« Vue seulement par celui qui m'a tiré », ou « À écrire »).
- Les liens vers une maquette périmée mènent à celle qui la remplace.

Ce passage ne change que des textes et l'en-tête : aucune structure d'écran. Trois phrases ont été réécrites parce que leur sens changeait : « Fige l'édition et les pistes de cadeaux » (« Fige le Secret Santa »), « Les pistes de cadeaux restent modifiables jusqu'à la clôture de l'édition » (« Les listes de cadeaux restent modifiables. »), « Ce n'est pas ton groupe : l'application a atteint sa limite » (« Ça ne vient pas de toi… »).

Le même soir, deux retouches de plus sur les maquettes d'avant (tickets de conception D04 et D07) : **la barre du haut des listes** dit où est la liste (15 maquettes `Liste*`, `MenuAvatarListe`, `ProcheSupprime`), et **« Tes données, en clair » et la page de présentation** disent qui voit une liste (`Confidentialite`, `Landing`, `LandingDesktop`).

Les titres des maquettes sur le canevas ont été repris le même soir, deux pages renommées (« Organisateur · Secret Santa », « Organisateur · fête ») et les rangées resserrées (ticket de conception D08).

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

**Neuf fichiers orphelins** sont encore dans le dépôt sans être sur le canevas, depuis avant la V3 : `AdminAcces`, `AdminAccesMenu`, `AdminPlusieursDemandes`, `AdminSansDemande`, `FeteAjouterListe`, `FetePartagee`, `FetePartageeAjoutee`, `Souhaits`, `SouhaitsVide`. Ils ne décrivent plus rien (des demandes, une exploration abandonnée, l'ancien écran des souhaits) et mènent à des maquettes supprimées. La conception ne les a pas supprimés parce qu'ils n'étaient pas dans la liste montrée à Julien : ticket 111.

## Pas encore dessinées

Plus rien d'ouvert au 20 novembre 2026 au soir : les douze tickets de conception sont dans `docs/travail/conception/dessine/`. Ce qui reste à trancher est dans `docs/travail/questions.md` (Q-001 à Q-013), et chaque ticket dessiné dit ce qui a été décidé seul.

Trois choses n'ont pas de maquette à elles, et c'est voulu :

- **« Devine qui » hors de Noël** : les écrans sont les mêmes, les mots changent (`vocabulaire.md`, « Devine qui hors de Noël »).
- **Les emails** : leurs textes ont été relus et retouchés dans leurs maquettes ; la règle de leurs objets est dans `secret-santa.md`.
- **La page de présentation** : sa phrase d'accroche et une ligne ont changé ; elle n'a pas de nouvelle illustration.
