# 109 — V3 : l'administration sans les demandes, avec les fêtes

- **Dépend de** : 101, 105
- **Migration** : à voir
- **Maquettes** : `V3Admin`, `V3AdminComptes`, `V3AdminCompte`, `V3TiragePause`, `AdminGroupes`, `AdminOnglet`

## Objectif

Le super-admin n'a plus de demande à traiter. Il voit des fêtes et des comptes, surveille les limites, change celle d'un compte, et peut suspendre les nouveaux Secret Santa en cas d'abus.

## À lire d'abord

- `docs/spec/v3/administration.md`
- `docs/spec/v3/modele.md` (« Les limites »)
- `docs/decisions/2026-11-20-plus-de-demande-limite-de-trois.md`
- L'ancien lot 37 (ticket 127), pour le tableau de bord

## À faire

- [ ] Le tableau de bord : « fêtes », plus de ligne « Demandes », les deux chiffres des limites, la pastille de l'onglet qui ne compte plus que les signalements.
- [ ] « Suspendre les nouveaux Secret Santa », avec les deux autres interrupteurs ; l'écran `V3TiragePause` pour celui qui veut en organiser un.
- [ ] La liste des comptes sans « À traiter » ; un compte à sa limite le dit.
- [ ] La fiche d'un compte : sa limite de Secret Santa, qui se change, et ses fêtes.
- [ ] Les écrans et les routes des demandes disparaissent (avec le ticket 105).

## Hors périmètre

- Les signalements : inchangés.
- Le reste du tableau de bord (les plafonds, ce qui tourne tout seul) : ticket 127.

## C'est fini quand

- [ ] Interrupteur allumé, créer un Secret Santa est refusé par le serveur et montre `V3TiragePause` ; créer une liste marche toujours.
- [ ] Changer la limite d'un compte à 4 lui permet un quatrième Secret Santa.
- [ ] Les quatre maquettes `V3*` sont reproduites.
- [ ] `/controle` passe.

## Ce qui manque

- **Q-007** : une pause plutôt que le retour des demandes, et le réglage de la limite par compte. Les maquettes montrent ce que la conception propose ; la décision du 20 novembre disait « rallumer la demande ».
- À fondre avec le tableau de bord du super-admin (ticket 127) ou à faire avant : à voir avec Q-004.
- Dès que Q-007 a sa réponse, ce ticket passe dans `a-faire/`.

## Compte rendu

À remplir par Claude Code à la fin : ce qui a été fait, ce qui a été décidé seul (et pourquoi), les écarts avec les maquettes, les questions posées, les commits.
