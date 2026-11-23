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

- [ ] **Le nom** : une liste créée depuis un Secret Santa s'appelle « Idées pour le Secret Santa », suivi du nom du Secret Santa entre parenthèses quand l'événement en a plusieurs cette année-là. Trois langues. Les listes déjà créées gardent leur nom.
- [ ] **Le panneau du lien** : toucher la pastille ouvre un panneau du bas (`UiSheet`) : la tuile de l'événement, « Secret Santa · {événement} », « Celui qui t'a tiré voit cette liste, en commençant par ta partie. », deux lignes : « Voir mon Secret Santa » (y mène) et « Délier ».
- [ ] **Délier** : retire le lien (le même effet que la croix de « Celui qui m'a tiré » dans « Qui voit ta liste ? » ; un seul chemin dans le code). La liste et ses idées ne changent pas ; message en bas, « Liste déliée ». La page de mon Secret Santa propose de nouveau « Ma liste de cadeaux ».
- [ ] **« Lier à mon Secret Santa »** : sous mon prénom, dans une liste que je tiens et où je figure, quand j'ai cette année un Secret Santa tiré qui n'a pas de liste. Le panneau de confirmation : « Lier à ton Secret Santa ? », « Celui qui t'a tiré dans « {événement} » verra cette liste, en commençant par ta partie. », « Lier ». Fermer annule.
- [ ] Plusieurs Secret Santa sans liste : le panneau les propose, un rond chacun (`UiChoiceSheet` ou ce qui existe), le premier choisi d'avance.
- [ ] **Un Secret Santa n'a qu'une liste** : lier ici un Secret Santa lié ailleurs le déplace ; le panneau ajoute « Il ne sera plus lié à « {liste} ». ».
- [ ] Rien de ce qui touche au tirage n'est exposé : ni la pastille ni les panneaux ne disent qui m'a tiré, et seuls ceux qui tiennent la liste voient la pastille et « Lier ».
- [ ] Tests : lier, délier, déplacer ; un membre qui ne tient pas la liste ne voit ni l'un ni l'autre.

## Hors périmètre

- « Quelle liste pour ton Secret Santa ? » (ticket 136) : ne change pas.

## C'est fini quand

- [ ] Depuis une liste, je peux voir le lien, le défaire et le refaire, sans passer par la page du Secret Santa.
- [ ] Une liste neuve créée depuis un Secret Santa s'appelle « Idées pour le Secret Santa ».
- [ ] `/controle` passe.

## Compte rendu

À remplir par Claude Code à la fin : ce qui a été fait, ce qui a été décidé seul (et pourquoi), les écarts avec les maquettes, les questions posées, les commits.
