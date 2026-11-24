# 142 — V3 : un point rouge a toujours sa ligne dans « Quoi de neuf »

- **Dépend de** : 120
- **Avant** : la bascule (ticket 113)
- **Migration** : non
- **Maquettes** : aucune (`V3Accueil`, `V3QuoiDeNeuf`)

## Objectif

Julien a vu, le 23 novembre 2026, un point rouge sur « Le Secret Santa · Ton enveloppe t'attend » alors que « Quoi de neuf » ne montrait rien. Les deux sont calculés chacun de leur côté : le point de l'enveloppe vient de l'état (`!facts.opened`, `shared/utils/lines.ts`), le compte de l'onglet vient des nouveautés. Ils se séparent quand le tirage date d'avant les nouveautés, ou quand la nouveauté a plus de trente jours.

La règle : un point rouge a toujours sa ligne dans « Quoi de neuf ».

## À lire d'abord

- `docs/spec/v3/accueil-et-creation.md` (« Quoi de neuf »)
- `docs/spec/v3/lignes.md` (« Le point rouge », les cas marqués ●)
- `shared/utils/lines.ts`, `server/database/lines.ts`, `server/database/news.ts`

## À faire

- [x] **Une seule source pour le point** : pour chaque cas marqué ● de `lignes.md` (l'enveloppe pas ouverte, le dévoilement pas regardé, la demande d'idées, « À toi de jouer », le palmarès, et ceux qui le font déjà), le point est allumé si une nouveauté pas encore vue vise cette chose, et seulement dans ce cas. Le texte de la ligne continue de dire l'état.
- [x] **Vérifier que chacun de ces cas crée bien sa nouveauté** au moment où il arrive (le tirage, le dévoilement, la demande, l'ouverture du jeu, le palmarès) ; ajouter celles qui manquent.
- [x] **Une nouveauté pas encore vue ne s'efface pas** : la tâche du matin n'oublie que celles qui ont été vues il y a plus de trente jours.
- [x] Le texte en bas de « Quoi de neuf » : « Ce que tu as vu s'efface au bout de trente jours », trois langues.
- [x] **Un test qui tient la règle** : pour chaque cas, un point sur l'accueil veut dire une ligne dans « Quoi de neuf » et un compte sur l'onglet ; ouvrir la chose éteint les trois.

## Hors périmètre

- Créer après coup les nouveautés de ce qui attendait déjà (Julien : pas la peine, ce sont des données de test). Ces lignes gardent leur texte, sans point.

## C'est fini quand

- [x] Aucun point rouge sans sa ligne dans « Quoi de neuf », et l'onglet compte autant de nouveautés qu'il y a de points.
- [x] Une enveloppe pas ouverte depuis quarante jours a toujours son point, sa ligne et son compte.
- [x] `/controle` passe.

## Compte rendu

**Fait.**

- **Une seule source pour le point** (`shared/utils/lines.ts`, `server/database/lines.ts`) : chaque cas marqué ● s'allume par une nouveauté pas vue qui vise la chose. Déjà le cas pour le dévoilement, la demande d'idées, « De nouvelles idées t'attendent » et les coches ; changés : l'enveloppe (`envelope`), le palmarès (`palmares`), « À toi de jouer » (`game_open`, nouveau), les nouvelles idées sur la liste de quelqu'un d'autre (`new_ideas`). Le texte dit toujours l'état : une enveloppe d'avant les nouveautés dit « Ton enveloppe t'attend », sans point.
- **Chaque cas crée sa nouveauté** : le tirage et la validation des réponses (`envelope`), le dévoilement, à la main ou par la tâche (`revealed`), la demande (`hint_request`), le palmarès (`palmares`), les idées (`new_ideas`, `receiver_ideas`), les coches (`ticked`) existaient. **Manquait « Devine qui » ouvert** : `game_open` (« Devine qui : à toi de jouer », trois langues, mène à `/p/…/devine`), écrit au tirage, à la validation des réponses, et quand l'organisateur allume le jeu après le tirage (`tellGameOpen`) ; effacé quand il l'éteint ; vu en ouvrant le jeu (`GET …/guess`). Le palmarès vu ne voit plus que `palmares`.
- **Celui qui a tiré quelqu'un qui tient une liste** ne recevait que « De nouvelles idées t'attendent », à la place de « … a ajouté des idées » (Q-026) : sa ligne de la liste n'aurait pas eu le point que les autres membres ont, ce qui la distinguait. Il reçoit aussi la nouveauté de la liste, **sans prénom** (« 1 idée de plus sur la liste »), comme tout membre.
- **Une nouveauté pas vue ne s'efface pas** : `unseenNews` et `countUnseen` ne regardent plus l'âge ; « Quoi de neuf » montre les pas vues et celles vues depuis moins de trente jours ; la tâche du matin n'oublie que celles vues il y a plus de trente jours (`isForgotten` prend la date où elle a été vue).
- **Le texte du bas** : « Ce que tu as vu s'efface au bout de trente jours », trois langues.
- **Tests** : Vitest (`lines.test.ts` : pas de point sans nouveauté ; `news.test.ts` : une enveloppe pas ouverte depuis quarante jours garde son point, sa ligne et son compte, et ouvrir la chose éteint les trois ; une enveloppe sans nouveauté n'a pas de point ; « À toi de jouer » et son effacement ; l'oubli à trente jours d'une nouveauté vue seulement). Playwright `news.spec.ts` (le point, la ligne et le compte de l'enveloppe, ouvrir l'éteint partout) mis à jour.

**Décidé seul, et pourquoi** :
- Le texte de la nouveauté « Devine qui : à toi de jouer » : la spec ne l'écrit pas ; il reprend le titre et le texte de la ligne (`lignes.md`).
- La nouveauté de la liste sans prénom pour celui qui a tiré sa personne : pour que sa ligne ait le même point que celle des autres membres, sans qu'une nouveauté de plus le nomme à côté de « De nouvelles idées t'attendent ».
- `game_open` est du « reste », pas de « ce qui presse ».

**Écarts avec les maquettes** : aucun.

**Questions posées** : aucune.

**Migration** : aucune (`news.kind` n'a pas de contrainte en base).

**Contrôle** : `pnpm controle --e2e` : trois langues, mots interdits, textes en dur, lint, typecheck, 992 tests Vitest passent ; Playwright 202 passés, un échec sur le texte du bas de « Quoi de neuf » que ce ticket change (`news.spec.ts`, corrigé, puis `news.spec.ts` repassé seul : 3 passés).

**Commits** : `docs: ticket 142 started` ; `99fadc5` fix(news): a red dot always has its line in « Quoi de neuf » ; et celui qui range ce ticket.
