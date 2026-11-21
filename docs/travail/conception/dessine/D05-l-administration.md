# D05 — L'administration sans demandes

- **Débloque** : ticket 109
- **Maquettes** : `V3Admin`, `V3AdminComptes`, `V3AdminCompte`, `V3TiragePause`
- **Dessiné le** : 20 novembre 2026

## Pourquoi

`Admin`, `AdminComptes` et `AdminCompte` montraient des demandes à traiter et des groupes à accorder.

## Ce qui est dessiné

- `V3Admin` : le même tableau de bord. « fêtes » à la place de « groupes » ; plus de ligne « Demandes » (la pastille de l'onglet ne compte plus que les signalements) ; deux chiffres à surveiller, « Comptes à leur limite de Secret Santa » et « Fêtes à 30 membres » ; un troisième interrupteur d'urgence, « Suspendre les nouveaux Secret Santa ».
- `V3AdminComptes` : plus de « À traiter » ; un compte à sa limite le dit.
- `V3AdminCompte` : « Secret Santa · Peut en organiser 3 · 2 en cours », avec le moins et le plus ; puis ses fêtes.
- `V3TiragePause` : ce que voit quelqu'un qui veut organiser un Secret Santa quand ils sont suspendus.

## Décidé seul

- **L'interrupteur est une pause, pas le retour des demandes** (Q-007). La décision disait « un interrupteur permet de rallumer la demande » ; une pause évite de garder en vie tous les écrans de demande pour un cas qui n'arrivera peut-être jamais.
- **Le super-admin peut changer la limite d'un compte** (Q-007) : le réglage existait pour les groupes, il sert maintenant aux Secret Santa. La limite de départ reste 3.
- « Demandes refusées pour débit » devient « Requêtes refusées pour débit » : le mot « demande » n'a plus qu'un sens.

## Contrôlé

Les quatre maquettes, en image.
