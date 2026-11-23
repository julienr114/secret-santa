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

- [ ] **Une seule source pour le point** : pour chaque cas marqué ● de `lignes.md` (l'enveloppe pas ouverte, le dévoilement pas regardé, la demande d'idées, « À toi de jouer », le palmarès, et ceux qui le font déjà), le point est allumé si une nouveauté pas encore vue vise cette chose, et seulement dans ce cas. Le texte de la ligne continue de dire l'état.
- [ ] **Vérifier que chacun de ces cas crée bien sa nouveauté** au moment où il arrive (le tirage, le dévoilement, la demande, l'ouverture du jeu, le palmarès) ; ajouter celles qui manquent.
- [ ] **Une nouveauté pas encore vue ne s'efface pas** : la tâche du matin n'oublie que celles qui ont été vues il y a plus de trente jours.
- [ ] Le texte en bas de « Quoi de neuf » : « Ce que tu as vu s'efface au bout de trente jours », trois langues.
- [ ] **Un test qui tient la règle** : pour chaque cas, un point sur l'accueil veut dire une ligne dans « Quoi de neuf » et un compte sur l'onglet ; ouvrir la chose éteint les trois.

## Hors périmètre

- Créer après coup les nouveautés de ce qui attendait déjà (Julien : pas la peine, ce sont des données de test). Ces lignes gardent leur texte, sans point.

## C'est fini quand

- [ ] Aucun point rouge sans sa ligne dans « Quoi de neuf », et l'onglet compte autant de nouveautés qu'il y a de points.
- [ ] Une enveloppe pas ouverte depuis quarante jours a toujours son point, sa ligne et son compte.
- [ ] `/controle` passe.

## Compte rendu

À remplir par Claude Code à la fin : ce qui a été fait, ce qui a été décidé seul (et pourquoi), les écarts avec les maquettes, les questions posées, les commits.
