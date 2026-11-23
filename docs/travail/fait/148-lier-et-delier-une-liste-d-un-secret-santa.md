# 148 — Lier et délier une liste d'un Secret Santa, et le nom « Idées pour le Secret Santa »

- **Dépend de** : 147
- **Avant** : la bascule (ticket 113)
- **Migration** : non (le lien existe depuis le ticket 136 ; le dire dans le compte rendu si ce n'est pas le cas)
- **Maquettes** : `V3ListeSecretLie`, `V3ListeSecretLier`, `V3ListeSecretLierConfirmer`, `V3ListeSecretNouvelle` (le nom)

## Objectif

Julien, le 23 novembre 2026 : le lien entre ma partie d'une liste et mon Secret Santa doit se voir, se faire depuis la liste et se défaire. Et la liste créée depuis un Secret Santa prend un nom qui le dit.

## À lire d'abord

- `docs/spec/v3/listes.md` : « Depuis mon Secret Santa » (le nom, la pastille) et « Lier et délier »
- `docs/decisions/2026-11-22-le-secret-santa-et-ma-partie-d-une-liste.md` (la fin)
- ce que le ticket 136 a codé : `/p/[token]/liste.vue`, « Celui qui m'a tiré » dans « Qui voit ta liste ? »

## À faire

- [x] **Le nom** : une liste créée depuis un Secret Santa s'appelle « Idées pour le Secret Santa », suivi du nom du Secret Santa entre parenthèses quand l'événement en a plusieurs cette année-là. Trois langues. Les listes déjà créées gardent leur nom.
- [x] **Le panneau du lien** : toucher la pastille ouvre un panneau du bas (`UiSheet`) : la tuile de l'événement, « Secret Santa · {événement} », « Celui qui t'a tiré voit cette liste, en commençant par ta partie. », deux lignes : « Voir mon Secret Santa » (y mène) et « Délier ».
- [x] **Délier** : retire le lien (le même effet que la croix de « Celui qui m'a tiré » dans « Qui voit ta liste ? » ; un seul chemin dans le code). La liste et ses idées ne changent pas ; message en bas, « Liste déliée ». La page de mon Secret Santa propose de nouveau « Ma liste de cadeaux ».
- [x] **« Lier à mon Secret Santa »** : sous mon prénom, dans une liste que je tiens et où je figure, quand j'ai cette année un Secret Santa tiré qui n'a pas de liste. Le panneau de confirmation : « Lier à ton Secret Santa ? », « Celui qui t'a tiré dans « {événement} » verra cette liste, en commençant par ta partie. », « Lier ». Fermer annule.
- [x] Plusieurs Secret Santa sans liste : le panneau les propose, un rond chacun (`UiChoiceSheet` ou ce qui existe), le premier choisi d'avance.
- [x] **Un Secret Santa n'a qu'une liste** : lier ici un Secret Santa lié ailleurs le déplace ; le panneau ajoute « Il ne sera plus lié à « {liste} ». ».
- [x] Rien de ce qui touche au tirage n'est exposé : ni la pastille ni les panneaux ne disent qui m'a tiré, et seuls ceux qui tiennent la liste voient la pastille et « Lier ».
- [x] Tests : lier, délier, déplacer ; un membre qui ne tient pas la liste ne voit ni l'un ni l'autre.

## Hors périmètre

- « Quelle liste pour ton Secret Santa ? » (ticket 136) : ne change pas.

## C'est fini quand

- [x] Depuis une liste, je peux voir le lien, le défaire et le refaire, sans passer par la page du Secret Santa.
- [x] Une liste neuve créée depuis un Secret Santa s'appelle « Idées pour le Secret Santa ».
- [x] `/controle` passe.

## Compte rendu

- **Pas de migration** : le lien existe depuis les tickets 136 et 139, c'est la colonne `giver` de `gift_list_parties` (« Celui qui m'a tiré » pour l'événement du Secret Santa).
- **Le nom** : `drawListTitle` (`server/utils/lists.ts`, testé), « Idées pour le Secret Santa », « (Les adultes) » quand l'événement en a plusieurs cette année-là, dans la langue de la personne du Secret Santa. Les listes déjà créées gardent leur nom.
- **Le lien** (`server/database/drawLists.ts`) : `linkDraw` (déplace d'abord : `unlinkElsewhere`), `unlinkDraw` (la ligne de l'événement part si elle ne servait qu'au lien ; partagée avec tous les membres, elle reste, sans le lien), `linkChoicesOf`. Deux routes : `PUT` et `DELETE /api/lists/[id]/draw/[partyId]`, réservées à ceux qui gèrent la liste ; lier demande aussi d'y figurer et que le Secret Santa soit l'un des miens, tiré, de l'année.
- **Un seul chemin** : la croix de « Celui qui m'a tiré » dans « Qui voit ta liste ? » appelle la même route que « Délier ». Ajouter « Celui qui m'a tiré » depuis la barre déplace aussi le lien.
- **La pastille** ouvre le panneau (`ListsDrawLink`, `UiSheet`) : la tuile de l'événement, le texte, « Voir mon Secret Santa », « Délier » (« Liste déliée » en bas). « Lier à mon Secret Santa » ouvre la question, « Lier » ; fermer annule.
- **Décidé seul, à valider** : « ma liste du Secret Santa » est maintenant la liste liée, et seulement elle (`findMyListFor`). Avant, c'était toute liste que je tiens faite pour l'événement ou partagée avec lui. Sans cela, une liste déliée mais encore partagée avec tous les membres serait restée « ma liste » et la page du Secret Santa n'aurait pas proposé de nouveau « Ma liste de cadeaux ». Conséquence : une liste faite pour l'événement ou partagée avec ses membres, sans lien, est proposée en premier par « Quelle liste pour ton Secret Santa ? » au lieu de s'ouvrir directement.
- Ni la pastille, ni les panneaux, ni les réponses ne disent qui m'a tiré ; celui qui m'a tiré, par le lien de la liste, ne voit ni la pastille ni « Lier ».
- Écarts notés dans `ECARTS-MAQUETTES.md`.
- Tests : `tests/e2e/lists-draw.spec.ts` (le nom, le panneau, délier, lier, déplacer, un autre refusé, rien pour celui qui m'a tiré), `participant.spec.ts` (le nom), `server/utils/lists.test.ts`.
