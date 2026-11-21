# 109 — V3 : l'administration sans les demandes, avec les fêtes

- **Dépend de** : 101, 105
- **Migration** : oui, `0035_v3_switches` (la table `app_switches`)
- **Maquettes** : `V3Admin`, `V3AdminComptes`, `V3AdminCompte`, `V3TiragePause`, `AdminGroupes`, `AdminOnglet`

## Objectif

Le super-admin n'a plus de demande à traiter. Il voit des fêtes et des comptes, surveille les limites, change celle d'un compte, et peut suspendre les nouveaux Secret Santa en cas d'abus.

## À lire d'abord

- `docs/spec/v3/administration.md`
- `docs/spec/v3/modele.md` (« Les limites »)
- `docs/decisions/2026-11-20-plus-de-demande-limite-de-trois.md`
- `docs/decisions/2026-11-21-une-pause-pas-des-demandes.md`
- L'ancien lot 37 (ticket 127), pour le tableau de bord

## À faire

- [x] Le tableau de bord : « fêtes », plus de ligne « Demandes », les deux chiffres des limites, la pastille de l'onglet qui ne compte plus que les signalements (l'onglet n'a pas de pastille : les signalements n'existent pas encore).
- [x] « Suspendre les nouveaux Secret Santa », avec les deux autres interrupteurs ; l'écran `V3TiragePause` pour celui qui veut en organiser un.
- [x] La liste des comptes sans « À traiter » ; un compte à sa limite le dit.
- [x] La fiche d'un compte : sa limite de Secret Santa, qui se change, et ses fêtes.
- [x] Les écrans et les routes des demandes disparaissent (avec le ticket 105).

## Hors périmètre

- Les signalements : inchangés.
- Le reste du tableau de bord (les plafonds, ce qui tourne tout seul) : ticket 127. Ce ticket ne l'attend pas.

## C'est fini quand

- [x] Interrupteur allumé, créer un Secret Santa est refusé par le serveur et montre `V3TiragePause` ; créer une liste marche toujours.
- [x] Changer la limite d'un compte à 4 lui permet un quatrième Secret Santa.
- [x] Les quatre maquettes `V3*` sont reproduites.
- [x] `/controle` passe.

## Compte rendu

**Fait.**

- Une table `app_switches` (migration `0035_v3_switches`, appliquée en local seulement) garde les interrupteurs d'urgence : éteint tant qu'il n'a pas de ligne. Le ticket 127 y ajoutera « Suspendre les emails » et « Suspendre les inscriptions ».
- « Suspendre les nouveaux Secret Santa » sur le tableau de bord (`PATCH /api/admin/switches`). Allumé, le serveur refuse la création d'un Secret Santa (`secret_santa_paused`, 403). « Créer › Un Secret Santa » et le formulaire mènent à `/secret-santa/pause` (V3TiragePause). Créer une liste marche toujours.
- Le tableau de bord : « À traiter et à surveiller » avec « Comptes à leur limite de Secret Santa » et « Fêtes à 30 membres », des chiffres sans pastille ; « En cas d'urgence ».
- Dans l'administration, « groupes » devient « fêtes » (tableau de bord, liste des fêtes, comptes) ; « tirages en cours » devient « Secret Santa en cours », et compte les Secret Santa, plus les fêtes qui en ont un.
- La fiche d'un compte : une section « Secret Santa » (la limite, avec le moins et le plus), puis « Fêtes » (« Organise · 5 membres · Secret Santa tiré », ou « Membre »).
- La limite par compte, la liste sans « À traiter » et la disparition des demandes étaient déjà faites au ticket 105.

**Décidé seul** (noté dans `ECARTS-MAQUETTES.md`, section « L'administration ») :

- Pendant la pause, un super-admin non plus ne crée pas de Secret Santa : l'interrupteur dit « les nouveaux », sans exception.
- Du tableau de bord V3Admin, seul ce qui revient à ce ticket est fait ; le reste (« Qui s'en sert », plafonds, ce qui tourne tout seul, les deux autres interrupteurs, les signalements) attend les tickets 127 et 132. Le haut d'avant (« Capacité », « Tout voir ») reste en attendant.
- Les deux chiffres mènent aux comptes et aux fêtes, sans filtre.
- « Organise » plutôt qu'« Organisatrice » : l'application ne connaît pas le genre.
- La page « Nouveau groupe » garde ses mots (« Nom du groupe », « Créer le groupe ») : elle appartient au vocabulaire (ticket 102).

**Questions** : aucune.

**Tests** : la pause et la limite (Vitest), les interrupteurs et les chiffres du tableau de bord sur une vraie base, et le parcours Playwright (la pause refusée au serveur et montrée, une liste créée quand même ; la limite passée à 4 permet un quatrième Secret Santa et refuse le cinquième).
