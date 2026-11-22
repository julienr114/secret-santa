# 117 — V3 : on entre dans un événement par un Secret Santa ou par une liste

- **Dépend de** : 106, 116
- **Migration** : oui (par où chaque membre est entré)
- **Maquettes** : `V3FeteMembres`, `V3FeteMembresComplet`, `V3FeteMembresReprendre`, `V3FeteNouvelle`, `AjouterParticipants`, `V3ListeQui`, `V3ListeQuiModifier`, `V3ListeInviter`, `V3ListePartageEmail`, `V3ListeFermee`, `V3ListeFermeeConnecte`

## Objectif

On n'ajoute plus personne à un événement. On y entre par un de ses Secret Santa (son organisateur m'y met, ou je m'inscris par son lien) ou par une de ses listes (on m'y invite, ou j'ouvre son lien). La page « Membres » montre qui est là et par où, et ce qu'on y ajoute va toujours à un Secret Santa ou à une liste.

## À lire d'abord

- `docs/decisions/2026-11-21-on-entre-par-un-secret-santa-ou-par-une-liste.md`
- `docs/spec/v3/modele.md` (« Deux sortes de personnes »)
- `docs/spec/v3/fete.md` (« Les membres », « 30 membres au plus », « Inviter, rejoindre »)
- `docs/spec/v3/secret-santa.md` (« Choisir les participants »)
- `docs/spec/v3/listes.md` (« Inviter quelqu'un », « Arriver par le lien »)
- `docs/spec/v3/accueil-et-creation.md` (« Une autre occasion »)

## À faire

- [x] **Le cœur, en fonctions pures**, testé d'abord : qui est membre d'un événement et par où ; ce que fait l'ouverture du lien d'une liste selon son stade, son événement, la place qui reste et qui je suis.
- [x] **Base** : par où chaque membre est entré (un Secret Santa, une liste, les deux). La migration garde tous les membres d'aujourd'hui : ceux d'un Secret Santa par lui ; les autres restent membres, sans rien sous leur prénom.
- [x] **Créer un événement** ne demande plus qui en fait partie (`V3FeteNouvelle` mène droit au Secret Santa ou à la liste). L'étape « membres » et sa page disparaissent.
- [x] **« Choisir les participants »** (`AjouterParticipants`) : « Reprendre ceux d'un autre événement », et sa page « Qui reprendre ? » (`V3FeteMembresReprendre`).
- [x] **« Membres »** (`V3FeteMembres`) : par où chacun est entré ; plus de « Ajouter une personne » ni de `/e/[événement]/membres/nouvelle` ; la section « Ajouter quelqu'un », avec « Au Secret Santa » et « À ma liste » selon ce que je peux faire. Complet : `V3FeteMembresComplet`.
- [x] **« Inviter quelqu'un »** sur une liste (`V3ListeQui`, `V3ListeInviter`) : copier le lien, par son adresse email, reprendre ceux d'un autre événement. Seulement pour celui qui gère la liste, et seulement si elle est partagée avec tous les membres de son événement.
- [x] **L'email** à celui qu'on invite par son adresse (`V3ListePartageEmail`), dans les trois langues, avec le pied des autres emails.
- [x] **Le lien d'une liste fait entrer** : connecté, pas membre, liste partagée avec tous les membres de son événement, il reste de la place → je deviens membre et elle s'ouvre. Sinon `V3ListeFermee` ou `V3ListeFermeeConnecte`.
- [x] **Les nouveautés** (ticket 120), dans « le reste » : celui qu'on invite à voir une liste par son adresse, ou qu'on reprend d'un autre événement, lit « Camille a partagé sa liste avec toi » ; celui qu'on ajoute à un Secret Santa lit « Camille t'a ajouté au Secret Santa ». L'événement apparaît sur son accueil avec son point.
- [x] « Changer de lien » pour toute liste, pas seulement une liste publique.
- [x] Trois langues. `docs/refonte/ECARTS-MAQUETTES.md` et `docs/ARBORESCENCE.md` à jour.

## Hors périmètre

- Le lien d'invitation d'un Secret Santa (ticket 116).
- Faire entrer quelqu'un dans un autre événement que celui de la liste.
- Dire à celui qui gère la liste qui est entré par son lien, ailleurs que sur « Membres ».

## C'est fini quand

- [x] Aucune route n'ajoute un membre à un événement sans passer par un Secret Santa ou une liste (un test le vérifie) : `server/database/members.test.ts`, avec une exception écrite, « Ajouter un organisateur » (Q-031).
- [x] Ouvrir le lien d'un brouillon, ou d'une liste réservée à celui qui a tiré, ne fait entrer personne ; ouvrir celui d'une liste partagée avec les membres de son événement fait entrer, jusqu'à 30.
- [x] Une liste partagée dans deux événements ne fait entrer que dans le sien.
- [x] Après la migration, personne n'a perdu l'accès à un événement (un test sur des données d'essai).
- [x] Les maquettes du ticket sont reproduites.
- [x] `/controle` passe.

## Compte rendu

**Fait.**

- **Le cœur, en fonctions pures** (`shared/utils/members.ts`, testé) : ce que « Membres » écrit de par où chacun est entré (`entryParts` : « Secret Santa », son nom quand l'événement en a plusieurs cette année, « La liste de Camille »), qui peut inviter à une liste (`canInviteToList`), quand le lien d'une liste fait entrer (`entersByListLink` : connecté, pas membre, liste partagée avec tous les membres de **son** événement, une place), qui « Qui reprendre ? » ajoute (`takenOnce`), les places prises (`placesTaken`). `listArrival` gagne le cas `join`.
- **Base** : table `member_entries` (migration `0041_v3_member_entries`) : une ligne par entrée, par un Secret Santa ou par une liste. La migration y met chaque participation ; les autres membres restent membres, sans rien sous leur prénom. Testée sur des données d'essai (`migrations.test.ts` : mêmes membres avant et après, personne n'a perdu l'accès, snapshot Drizzle, clés étrangères), appliquée en local seulement.
- **Plus aucune route n'ajoute à l'événement lui-même** : `POST /api/admin/[fête]/persons` est supprimée. Toute entrée passe par `enterParty` (`server/database/members.ts`), qui garde par où. Un test statique (`server/database/members.test.ts`) liste les seuls endroits qui écrivent un membre. S'inscrire par le lien d'un Secret Santa, en être fait participant, la création d'un Secret Santa et « Préparer Noël 2027 » gardent l'entrée par le Secret Santa ; tenir une liste dans l'événement fait pour elle, par la liste.
- **Créer un événement** : « Continuer » crée l'événement et mène au Secret Santa ou à la liste ; l'étape « Qui en fait partie ? » et `memberIds` disparaissent.
- **« Choisir les participants »** : « Créer une personne » ouvre `/admin/[fête]/editions/[id]/nouvelle-personne` (route `POST …/editions/[id]/persons` : la personne entre dans l'événement et ce Secret Santa ensemble) ; « Reprendre ceux d'un autre événement » ouvre « Qui reprendre ? » (`…/reprendre`, composant `TakeFromEvents`, route `…/participants/taken`).
- **« Membres »** : par où chacun est entré, « ne tire pas », « pas d'adresse email » (l'adresse n'est plus écrite) ; « Ajouter quelqu'un » avec « Au Secret Santa » (par Secret Santa en préparation, « 5 participants · lien actif ») et « À ma liste » (« Pour Léo, Zoé et moi ») ; complet : l'état et « Au Secret Santa · En pause · l'événement est complet ». `/e/[fête]/membres/nouvelle` mène à « Membres ».
- **« Inviter quelqu'un »** sur une liste (`/listes/[id]/inviter`, ouvert depuis « Qui verra ta liste ? » et « À ma liste ») : copier le lien, « Par son adresse email » (`…/inviter/email`, route `POST /api/lists/[id]/members`), « Reprendre ceux d'un autre événement » (`…/inviter/reprendre`). Seulement pour qui gère la liste, et seulement si elle est partagée avec tous les membres de son événement (sinon 409 `list_not_open`) ; à 30, l'état « complet ».
- **L'email** `V3ListePartageEmail` (`buildListSharedEmail`, trois langues, testé).
- **Le lien d'une liste fait entrer** : `GET /api/l/[jeton]` répond `list_join` quand le lien fait entrer ; la page demande `POST /api/l/[jeton]/join` (lire n'écrit jamais), le compte devient membre de l'événement de la liste, par elle, et la liste s'ouvre. Jamais d'un autre événement où elle est partagée, jamais d'un brouillon, d'une liste réservée à celui qui a tiré, d'un événement fait pour une liste seule, ni au-delà de 30.
- **Les nouveautés** `santa_added` (« Camille t'ajoute au Secret Santa », en ajoutant, créant ou reprenant quelqu'un) et `list_shared` (« Camille a partagé sa liste avec toi », par adresse ou reprise), pour les adresses qui ont un compte, jamais pour qui le fait. Ouvrir ma page du Secret Santa éteint la première, ouvrir la liste la seconde. L'événement est sur l'accueil de la personne (elle en est membre) ; la ligne de la liste a son point par ses idées nouvelles.
- **« Changer de lien »** pour toute liste (`shareChange`, `share.post.ts`).
- **`/rejoindre/[code]`** a son squelette (titre, carte) au lieu du bloc gris noté par le ticket 114.
- **Tests** : Vitest (`members.test.ts` ×2, `listAccess`, `listEmail`, `lists`, `navigation`, `parties`, migration) ; Playwright `membership.spec.ts` (adresse, lien, brouillon, réservée à celui qui a tiré, liste dans deux événements, 30, « Qui reprendre ? », plus de route `persons`), et les specs qui ajoutaient des membres à l'événement passent par le Secret Santa (`addPeople`) ou, quand un Secret Santa changerait ce qu'elles testent, écrivent des membres « d'avant » en base (`seedMembers`).

**Décidé seul, et pourquoi.**

- « Camille t'ajoute au Secret Santa », au présent, et non « t'a ajouté » (genre) : la règle de Q-028 ; Q-030.
- « Membres » reste aux organisateurs (Q-029). « Ajouter un organisateur » fait encore entrer dans l'événement, seule exception écrite au test (Q-031).
- « La liste de Camille » nomme celui qui a créé la liste. Celui qui crée une liste dans un événement où il est déjà n'y gagne pas d'entrée « par la liste » (il y était).
- « Qui reprendre ? » ne propose que les événements que j'organise (leurs adresses ne sont lues que par leurs organisateurs), jamais celui où l'on ajoute ni quelqu'un qui y est déjà par son adresse. Reprendre dans une liste n'envoie pas d'email, seulement la nouveauté (le ticket ne parle d'email que pour l'adresse).
- Inviter par une adresse déjà membre est refusé (`already_member`) : la liste lui est déjà ouverte.
- Pas de point sur la ligne d'un Secret Santa pour `santa_added` : `lignes.md` ne marque pas « Pas encore tiré » ● ; la nouveauté compte dans « Quoi de neuf ».
- L'événement fait pour une liste seule (ticket 101) garde sa ligne de partage quel que soit le partage : il ne compte jamais comme un partage, sinon le lien d'un brouillon ferait entrer (trouvé par `lists-link.spec.ts`).

**Écarts avec les maquettes** : section « On entre par un Secret Santa ou par une liste (V3, ticket 117) » de `docs/refonte/ECARTS-MAQUETTES.md` (`V3FeteMembres`, `V3FeteMembresComplet`, `V3FeteMembresReprendre`, `V3FeteNouvelle`, `V3ListeQui`/`V3ListeQuiModifier` (« Inviter quelqu'un » pas sur un brouillon, dans le panneau jusqu'au ticket 135 ; « Changer de lien » pour toute liste), `V3ListeInviter`, la page « Par son adresse email », `V3ListePartageEmail`, `V3ListeFermee`, `V3FeteRejoindre`, `V3QuoiDeNeuf`).

**Questions posées** : Q-029 (« Membres » pour les membres ?), Q-030 (« t'a ajouté » s'accorde), Q-031 (l'organisateur ajouté entre sans Secret Santa ni liste).

**Migration** : `0041_v3_member_entries`, après `0040_v3_secret_santa_invite`, appliquée en local (`pnpm db:migrate:local`), pas à distance.

**Contrôle** : `pnpm controle --e2e` : trois langues, mots interdits, textes en dur, lint, typecheck, 925 tests Vitest passent ; Playwright 180 sur 181, le seul échec étant le test instable connu `security.spec.ts` « a participant learns their own result only » (quand Orga est tiré en premier), passé en le relançant seul (6/6). Aux passages d'avant : `edition-cases` (le lien de « Au Secret Santa » est sur son `<a>`), `lists-link` (le brouillon d'une liste à son événement seul faisait entrer : corrigé dans le code), `membership` (Louis sans compte n'a pas de nouveauté ; Inès s'appelle « Ines » d'après son adresse).

**Commits** : `1cc717f` docs: ticket 117 started ; `3bb4a36` feat(members): who comes into an event, by a Secret Santa or a list ; `be6b867` feat(members): one comes into an event by a Secret Santa, never by itself ; `2ebc271` feat(lists): a list lets people into its event, by an address or its link (il a emporté par erreur `docs/travail/questions.md` tel que la conception l'avait sur le disque : les réponses déplacées sous « Réponses ») ; `868a816` fix(invite): the page of a link shows its shape while it loads ; `b3dfa5d` fix(lists): the event made for a list alone never lets anyone in ; `e43d64e` test(e2e): people come in by a Secret Santa or a list ; et celui qui range ce ticket.
