# 136 — V3 : le Secret Santa et ma partie d'une liste

- **Dépend de** : 107
- **Migration** : à voir (retenir quelle personne d'une liste est « moi » pour un Secret Santa, si ce n'est pas déjà déductible du compte)
- **Maquettes** : `V3TirageQuelleListe`, `V3ListeSecretNouvelle`, `V3ListeSecret`, `V3ListeSurligne`, `V3ListeSurligneTout`

## Objectif

Retour de Julien, 22 novembre 2026, après avoir essayé : depuis un Secret Santa, on crée chaque fois une liste neuve et vide ; rien sur la liste ne dit qu'elle sert à un Secret Santa ; et celui qui m'a tiré tombe sur la liste entière. Ce qui est lié au Secret Santa, c'est moi dans une liste.

## À lire d'abord

- `docs/decisions/2026-11-22-le-secret-santa-et-ma-partie-d-une-liste.md`
- `docs/spec/v3/listes.md` (« Depuis mon Secret Santa »)
- `docs/spec/v3/secret-santa.md` (« Le résultat », « Du résultat à la liste »)

## À faire

- [x] **Une liste créée depuis mon Secret Santa m'a déjà dedans, en premier** (`V3ListeSecretNouvelle`) : la personne « Moi », avec sa ligne « Une idée pour … ». Pareil depuis « Écrire ma liste » de l'email d'une demande d'idées.
- [x] **« Repartir d'une liste » tant que la liste n'a aucune idée**, même avec des personnes (Q-032, `docs/spec/v3/listes.md`, « Repartir d'une liste ») : `canResumeInto` ne demande plus une liste sans personne. La reprise garde à leur place les personnes déjà là, ajoute les autres après, ne met personne deux fois ; les idées pas offertes d'une personne déjà là arrivent sous son prénom. Le troisième critère du tri (une personne en commun) sert enfin. Le bloc est sous les personnes, avant « Ajouter quelqu'un ».
- [x] **« Quelle liste pour ton Secret Santa ? »** (`V3TirageQuelleListe`), quand je tiens déjà une ou plusieurs listes de cette année où je figure : mes listes (le nom, « Pour Léo, Zoé et moi », ses événements), puis « Une nouvelle liste » ; la première choisie d'avance (le même événement, sinon la même catégorie, sinon la plus récente), en fonction pure testée ; « Continuer ». Le composant `UiChoiceSheet`, les radios natifs.
- [x] **Choisir une liste qui existe** lui ajoute le stade « Celui qui m'a tiré » pour cet événement, sans rien retirer de son partage.
- [x] **Sous mon prénom, dans la liste** : « Secret Santa · Famille Camille », avec l'icône du Secret Santa, une ligne par Secret Santa, qui mène à mon Secret Santa. Seuls ceux qui tiennent la liste la voient.
- [x] **La liste filtrée** (`V3ListeSurligne`) : arrivé depuis sa carte de résultat, celui qui m'a tiré voit la liste avec son titre et son mot d'accueil, mais une seule personne, moi ; en haut, `UiSegmented` avec mon prénom (choisi) et « Toute la liste ». Le mode anonyme reste activé d'office.
- [x] **« Toute la liste »** (`V3ListeSurligneTout`) : tout le monde, moi en premier.
- [x] Le filtre se demande par l'adresse (un paramètre), pour que « Retour » puis « Suivant » le retrouvent ; il ne change aucun droit d'accès.
- [x] La page ne dit jamais « tu as tiré … ».
- [x] Trois langues, `tests/e2e`.

## Hors périmètre

- Limiter le droit d'accès de celui qui m'a tiré à ma seule partie : écarté par la décision.
- Lier à un Secret Santa quelqu'un d'autre que moi (un enfant sans compte).
- La barre du haut de la liste (ticket 135).

## C'est fini quand

- [x] Sans aucune liste, « Ma liste de cadeaux » depuis mon Secret Santa ouvre une liste où je figure déjà.
- [x] Avec une liste de Noël où je figure, on me la propose, choisie d'avance ; la choisir ne crée rien.
- [x] Celui qui m'a tiré ne voit d'abord que ma partie, et le reste par « Toute la liste ».
- [x] Une liste créée depuis mon Secret Santa propose de repartir de « Noël 2025 » ; après la reprise, je n'y suis qu'une fois, en premier.
- [x] Les cinq maquettes sont reproduites.
- [x] `/controle` passe.

## Compte rendu

**Fait.**

- **Une liste créée depuis mon Secret Santa m'a déjà dedans, en premier** (`newListForDraw`, `server/database/drawLists.ts`) : depuis « Ma liste de cadeaux » comme depuis « Écrire ma liste » de l'email (les deux mènent à `/p/…/liste`), et depuis la première idée écrite sans compte (`first-idea`). « Moi » y entre sans les idées de ma dernière liste : c'est « Repartir d'une liste » qui les propose.
- **« Repartir d'une liste » tant que la liste n'a aucune idée** (Q-032) : `canResumeInto({ ideas, single })` ; `mergeResumed` (fonction pure, testée) garde à leur place les personnes déjà là, ajoute les autres après, ne met personne deux fois (même proche, ou même compte : « Moi » ici, proche relié là), et met les idées d'une personne déjà là sous son prénom. Le troisième critère du tri sert donc. Le bloc est sous les personnes, avant « Ajouter quelqu'un ».
- **« Quelle liste pour ton Secret Santa ? »** : `GET /api/p/[jeton]/list` dit ma liste pour l'événement, ou les listes que je gère de l'année où je figure, dans l'ordre de `drawListOrder` (fonction pure, testée : même événement, même catégorie, la plus récente) ; `UiChoiceSheet` avec « Pour Zoé et moi · Chez Mamie », puis « Une nouvelle liste » ; « Continuer ». La liste choisie reçoit le stade « Celui qui m'a tiré » pour l'événement, sans rien perdre de son partage (`giveListToDraw`).
- **Sous mon prénom**, dans le document : « Secret Santa · Famille Camille », l'enveloppe, une ligne par Secret Santa pas clôturé où je participe dans un événement où la liste est partagée, vers ma page (`/p/[jeton]`).
- **La liste filtrée** (`/l/[jeton]?…&personne=`) : moi seul, `UiSegmented` (mon prénom, « Toute la liste ») ; « Toute la liste » met `tout=1` dans l'adresse (« Retour » puis « Suivant » le retrouvent) et montre tout le monde, moi en premier. Aucun droit ne change. La carte du résultat choisit d'abord une liste où la personne tirée figure, et ne met `personne=` que dans ce cas.
- Textes en trois langues ; `lists.sharing.saved` supprimée (commit à part).
- **Tests** : Vitest (`mergeResumed`, `canResumeInto`, `drawListOrder`) ; Playwright, nouveau `lists-draw.spec.ts` (moi en premier, la reprise de « Noël 2025 », le choix d'une liste existante sans rien créer, la liste filtrée et « Toute la liste ») ; `lists-resume.spec.ts` ajusté. `tests/year-over.test.ts` reconnaît `requireMyDraw` (qui passe par `requirePersonalLink`) ; `scripts/e2e-server.sh` a l'adresse du nouveau test parmi les super-admins de test.

**Décidé seul, et pourquoi** (détail dans `ECARTS-MAQUETTES.md`, section « Le Secret Santa et ma partie d'une liste ») :

- « Moi dans une liste » se déduit du compte (mon « Moi », ou un proche relié à mon compte) : **pas de migration**.
- Ne sont proposées que les listes que je **gère** : changer le partage n'est pas à celui qui aide à écrire.
- Le panneau du choix s'ouvre sur `/p/…/liste`, pas par-dessus le résultat : c'est là que mènent la ligne du tirage, l'email et le retour de connexion. « Annuler » ramène à la page du tirage.
- La ligne du Secret Santa n'est que sous mon prénom, pour moi.
- Reprise dans une liste déjà partagée : pas de marque sur les idées ; un mot d'accueil déjà écrit n'est pas remplacé.
- Sans la personne de l'adresse sur la liste, pas de filtre : la liste entière.

**Questions posées** : aucune. Q-032 (réponse B de Julien) est codée ici.

**Migration** : aucune.

**Contrôle** : `pnpm controle --e2e` passe en entier : trois langues, mots interdits, textes en dur, lint, typecheck, 961 tests Vitest, 197 tests Playwright (`security.spec.ts` compris).

**Commits** : `6dd4910` docs: ticket 136 started ; `02b7d32` chore(i18n): drop the unused lists.sharing.saved ; `33f896f` feat(lists): start from a list while it has no idea, people kept in place ; `ba515cd` feat(santa): me in a list, for my Secret Santa ; et celui qui range ce ticket.
