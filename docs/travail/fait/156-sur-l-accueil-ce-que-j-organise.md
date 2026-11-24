# 156 — Sur l'accueil, ce que j'organise : « Gérer l'événement », « Tu l'organises »

- **Dépend de** : 151
- **Avant** : la bascule (ticket 113)
- **Migration** : non
- **Maquettes** : `V3Accueil` (la carte « Bureau, 3e étage »), `V3AccueilSansSecret` (un événement sans Secret Santa), `V3AccueilJeu` (avec « Devine qui »)

## Objectif

Julien, le 24 novembre 2026 : sur l'accueil, la carte d'un événement ne me parle que comme participant. Quand j'organise aussi le Secret Santa, rien ne mène au suivi ; et on ne voit pas que l'en-tête de la carte se touche. La carte d'un événement que j'organise gagne deux lignes.

## À lire d'abord

- `docs/spec/v3/lignes.md` : « La ligne d'un Secret Santa » (« Qui voit quoi »), « La ligne « Gérer l'événement » »
- `docs/spec/v3/accueil-et-creation.md` : « Une carte par événement »

## À faire

- [x] **« Gérer l'événement »** : dans la carte d'un événement que j'organise, la première ligne sous l'en-tête. Icône au trait (réglettes), titre, le nombre de membres dessous (accordé), flèche. Elle ouvre la page de l'événement. L'en-tête ne change pas.
- [x] **« Tu l'organises »** : quand je participe à un Secret Santa et que je l'organise, une ligne accrochée sous la sienne : pas de trait entre les deux, pas d'icône, le texte aligné sous le titre du Secret Santa, 54 px de haut, sa flèche. Dessous, le texte de l'organisateur (le tableau de `lignes.md`, celui de la page de l'événement). Elle ouvre le suivi. Elle vient avant « Devine qui ».
- [x] La ligne du Secret Santa ne change pas : elle me parle comme participant et ouvre ma page. Si j'organise sans participer : une seule ligne, comme aujourd'hui.
- [x] Les données de l'accueil donnent ce qu'il faut (j'organise l'événement, le nombre de membres, l'état de l'organisateur) sans rien exposer du tirage.
- [x] Aucun point rouge sur ces deux lignes.
- [x] Trois langues, tests (un organisateur qui participe, un organisateur qui ne participe pas, un membre).

## Hors périmètre

- La page d'un événement : sa ligne du Secret Santa ne change pas (l'organisateur y voit le texte de l'organisateur, elle ouvre le suivi).

## C'est fini quand

- [x] Depuis l'accueil, j'ouvre le suivi du Secret Santa que j'organise d'un toucher, et ma page de participant d'un autre.
- [x] Un membre qui n'organise pas ne voit ni « Gérer l'événement » ni « Tu l'organises ».
- [x] `/controle` passe.

## Compte rendu

- **Les données** (`loadHome`) : `manage` (`{ members }`, les personnes de l'événement, comptées comme sur sa page) pour un événement que j'organise, `null` sinon ; et, pour chaque Secret Santa où je participe et que j'organise, `organiser` : le texte de l'organisateur (sans point) et le suivi. `loadLines` calcule le texte de l'organisateur de chaque Secret Santa en plus de celui demandé, avec les mêmes requêtes ; rien du tirage (ces nombres sont ceux de la page de l'événement pour l'organisateur).
- **« Gérer l'événement »** (`PartyCard`) : la première ligne sous l'en-tête, `i-lucide-sliders-horizontal`, « 8 membres », elle ouvre `/e/[fête]`.
- **« Tu l'organises »** : une ligne accrochée sous celle du Secret Santa (pas de filet entre les deux, pas d'icône, le texte aligné sous le titre, 54 px, sa flèche), avant « Devine qui » ; le texte de l'organisateur ; elle ouvre `/admin/[fête]/editions/[id]`. La ligne du Secret Santa ne change pas (ma page) ; sans participer, une seule ligne comme avant.
- Aucun point rouge sur ces deux lignes. Clés `home.manage`, `home.organise`, trois langues.
- **Tests** : `homeParties.test.ts` (`manage`, `organiser`) ; `home.spec.ts` : Hugo organise et participe au Secret Santa du Bureau (« Gérer l'événement » en premier, sa ligne vers sa page, « Tu l'organises » vers le suivi, aucun point), organise celui de Tonton sans y participer (une ligne, vers le suivi), est membre de Famille Camille (ni l'une ni l'autre).
- `ARBORESCENCE.md` (l'accueil) et `ECARTS-MAQUETTES.md` (les deux lignes) mis à jour.

