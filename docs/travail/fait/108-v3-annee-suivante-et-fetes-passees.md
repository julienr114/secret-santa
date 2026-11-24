# 108 — V3 : l'année suivante, et les événements passés

- **Dépend de** : 103, 105, 106
- **Migration** : non, si l'année a déjà sa ligne en base depuis le ticket 101 ; sinon le dire dans `questions.md` avant de coder
- **Maquettes** : `V3AccueilAnnee`, `V3FetesPassees`, `V3FeteAnneePassee`, `V3ListeReprise`

## Objectif

Deux mois avant un événement qui revient, l'accueil propose de le préparer et de reprendre sa liste. Les événements finis se retrouvent dans « Les événements passés », et chaque année passée d'un événement garde sa page, en lecture seule.

## À lire d'abord

- `docs/spec/v3/accueil-et-creation.md` (« L'année suivante », « Les événements passés », et « Après la date » dans « Le jeu, sur l'accueil »)
- `docs/spec/v3/navigation.md` (où mènent « Retour » et `/tirages-passes`)
- `docs/spec/v3/fete.md` (« Une année passée »)
- `docs/spec/v3/listes.md` (« La liste reprise de l'an dernier »)
- `docs/spec/v3/modele.md` (« L'année »)

## À faire

- [x] « Préparer Noël 2027 » pour l'organisateur : autant de Secret Santa que l'an dernier, chacun avec ses participants et ses réglages, « à préparer ».
- [x] « Supprimer ce Secret Santa », tant qu'il n'est pas tiré : une ligne rouge en bas de ses réglages, confirmée par un panneau, comme la suppression d'un événement (pas de maquette à part).
- [x] Après sa date, un événement reste sur l'accueil jusqu'à la clôture de son Secret Santa, 14 jours au plus (3 jours sans Secret Santa), puis passe dans « Les événements passés » ou à l'année suivante.
- [x] « Reprendre ma liste de l'an dernier » : la liste de l'année, dans le même événement, en brouillon, avec les idées pas offertes marquées pour moi seul (la reprise existe déjà pour une liste, lot 27 de l'ancien plan).
- [x] La page « Les événements passés » : par année, une ligne par événement et par année.
- [x] La page d'une année passée d'un événement : ses Secret Santa, « Devine qui », ses listes, en lecture seule.
- [x] Les lignes « Les événements passés » (accueil) et « Les années passées » (événement) y mènent ; l'ancienne page « Tirages passés » disparaît, son adresse mène à « Les événements passés ».

## Hors périmètre

- Le dévoilement, le palmarès et la clôture d'un Secret Santa : inchangés.
- Ce que voit, après l'événement, celui pour qui une liste était faite : la règle d'aujourd'hui.

## C'est fini quand

- [x] Un événement qui revient montre « Préparer » deux mois avant sa date, à son organisateur seulement.
- [x] Une année passée ne se modifie par aucune route (un test le vérifie) : l'année et ses Secret Santa ; les listes de l'année gardent leurs règles en attendant Q-021.
- [x] « Préparer » recrée autant de Secret Santa que l'an dernier ; un Secret Santa tiré ne se supprime pas.
- [x] Un événement sans Secret Santa quitte l'accueil 3 jours après sa date ; avec un Secret Santa pas clôturé, 14 jours après (un test sur la fonction).
- [x] Les quatre maquettes sont reproduites (écarts notés dans `ECARTS-MAQUETTES.md`).
- [x] `/controle` passe.

## Compte rendu

**Fait.**

- **Les années d'un événement** (`shared/utils/years.ts`, testé) : l'année que montrent l'accueil et la page de l'événement est la dernière tant que l'accueil la garde, puis l'année suivante pour un événement qui revient ; un événement qui ne revient pas ne reste que dans « Les événements passés ». Après sa date, l'accueil garde un événement tant que son Secret Santa n'est pas clôturé, 14 jours au plus ; 3 jours sans Secret Santa (Q-009). Les jours se comptent côté serveur (UTC).
- **« Préparer Noël 2027 »** (`POST /api/admin/[fête]/prepare`) : à l'organisateur seul, 60 jours avant la date d'un événement qui revient, quand l'année n'a pas encore de Secret Santa et que la précédente en avait. Il recrée autant de Secret Santa que l'an dernier, chacun avec ses participants encore actifs, ses réglages, « Devine qui » reporté, sa date déplacée et son nom avancé d'un an (« Noël 2026 » → « Noël 2027 », « Les enfants » reste). Rien n'est tiré ni envoyé. La limite compte chacun d'eux. La création d'un Secret Santa passe désormais par une seule fonction (`createSecretSanta`).
- **« Supprimer ce Secret Santa »** : une ligne rouge en bas de ses réglages tant qu'il n'est pas tiré, un panneau de confirmation, puis la page de l'événement. Ses participations et leurs liens partent ; ses personnes restent membres. Un Secret Santa tiré répond 409.
- **« Reprendre ma liste de l'an dernier »** : sur la carte de l'accueil, à la place de « Nouvelle liste », 60 jours avant la date, quand je tenais une liste l'an dernier dans cet événement et n'en ai pas cette année. Elle crée la liste de l'année dans l'événement, en brouillon, avec les idées pas offertes marquées (la reprise du lot 27). Le document dit « Reprise de Noël 2026. » ; la phrase de la marque suit `V3ListeReprise` dans les trois langues.
- **« Les événements passés »** (`/evenements-passes`, `GET /api/past`) : par année, une ligne par événement et par année, avec sa date et ce que j'y ai fait (« tu offrais à Zoé », « tu as offert 3 cadeaux », « 8 cadeaux offerts »). Mon propre résultat n'est lu que pour moi et pour une année finie. La ligne du bas de l'accueil dit le plus récent et le compte des autres, et n'apparaît que s'il y en a un.
- **Une année passée** (`/e/[fête]/annees/[année]`) : la pastille de l'année, l'événement, sa date ; ses Secret Santa avec « Tu offrais à … », « Devine qui · Le palmarès » quand il a été joué ; ses listes. Aucun geste. « Retour » : « Les événements passés », ou l'événement avec `?depuis=evenement`. La page de l'événement a sa section « Les années passées ».
- **Une année passée ne se modifie par aucune route** : toute route qui écrit sur un Secret Santa, côté organisateur (`requireEdition`, `requireParticipation`, `PATCH` de l'édition) ou par un lien personnel (`requirePersonalLink`), répond 409 `year_over` pour une année finie ; on ne crée pas de Secret Santa dans une année finie ; changer la date de l'événement ne réécrit plus une année finie (une nouvelle année est créée). Restent ouverts, hors périmètre : clôturer, dévoiler, ouvrir son enveloppe, marquer vu, la langue. `tests/year-over.test.ts` vérifie chaque route qui écrit, et le garde sur une vraie base.
- **« Tirages passés » disparaît** (page, `/api/auth/home`, `server/utils/home.ts`, ses textes) ; `/tirages-passes` mène à `/evenements-passes` (`pastPathOf`).
- Les listes de la carte et de la page d'un événement sont celles de son année ; une liste faite pour un événement prend la date de son année en cours (celle à venir une fois la précédente finie) et lui crée sa ligne `party_years` s'il le faut. « Ma liste » d'un Secret Santa ne renvoie plus vers une liste d'une année finie.

**Décidé seul, et pourquoi.**

- Pas de migration : l'année a sa ligne depuis le ticket 101 ; une liste appartient à l'année de sa date (Q-020).
- Les listes d'une année passée gardent leurs règles d'aujourd'hui : seule la page de l'année est en lecture seule (Q-021). Une liste en lecture seule pour celui qui la tient n'a pas de maquette.
- Un Secret Santa clôturé fait partir l'événement de l'accueil le lendemain de sa date (lecture littérale de « tant que son Secret Santa n'est pas clôturé »). « 3 jours » et « 14 jours » : l'événement est encore là le 3ᵉ (14ᵉ) jour après sa date, plus le suivant.
- « Préparer » et « Reprendre » à 60 jours, comme « Bientôt » ; « Préparer » agit sur place. « Reprendre » prend la plus récente de mes listes des années d'avant dans cet événement.
- « Préparer » refuse (403, la limite) s'il ne peut pas recréer tous les Secret Santa, plutôt que d'en créer une partie.
- La suppression d'un Secret Santa efface aussi ses lignes du journal ; pas d'identifiant à recopier (voir les écarts).

**Écarts avec les maquettes** : section « L'année suivante et les événements passés » de `docs/refonte/ECARTS-MAQUETTES.md` (texte de la ligne du bas selon `lignes.md`, icônes de 40 px, « Ma liste » sans « Léo, Zoé et moi » avant le ticket 112, « Anniversaire 2025 » au lieu de « Ses 3 ans », nom de la liste reprise, panneau de suppression). Deux lignes de la section du ticket 103 sont retirées ou corrigées.

**Questions posées** : Q-020 (l'année d'une liste, sans colonne), Q-021 (les listes d'une année passée en lecture seule partout ?), Q-022 (« Ses 3 ans » : pour qui est fait un événement).

**Migrations** : aucune.

**Contrôle** : `pnpm controle --e2e` : langues, mots, textes en dur, lint, types, 790 tests Vitest passent ; Playwright : 161 passés, 1 échec étranger au ticket, `security.spec.ts` « a participant learns their own result only » : le tirage est au hasard, et quand le premier receveur est « Orga », qui a un compte, ses pistes d'avant la V3 ne sont plus lues (ticket 107). Il échoue aussi, une fois sur trois, sur la branche avant ce ticket (vérifié dans une copie de travail). Trois tests e2e ont été adaptés : `game-nudges` ne crée plus un Secret Santa dans une année finie (il le déplace par SQL), `signup`, `hints` et `lists-anonymous` ne lisent plus `/api/auth/home`, qui a disparu ; `home` : la ligne « Les événements passés » n'apparaît qu'avec un événement passé.

**Commits** : `cb8d4de` docs: ticket 108 started ; `7c94d56` docs: three questions of ticket 108 ; `3a1bf32` feat(years): the year after, the past events, and a year over read only ; et celui qui range ce ticket.
