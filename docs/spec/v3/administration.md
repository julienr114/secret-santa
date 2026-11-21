# L'administration

Décision : `2026-11-20-plus-de-demande-limite-de-trois.md`.
Maquettes : `V3Admin`, `V3AdminComptes`, `V3AdminCompte`, `V3TiragePause`, et celles d'avant qui restent : `AdminGroupes` (les fêtes), `AdminSignalements`, `AdminSignalement`, `AdminOnglet`.

C'est l'administration d'aujourd'hui (README, section 12), moins les demandes.

## Ce qui disparaît

- La file des demandes, la fiche d'une demande, les réponses toutes faites, le quota de groupes et de participants.
- La pastille de l'onglet « Admin » ne compte plus que ce qui attend une décision : les signalements.

## Le tableau de bord

Maquette : `V3Admin`.

- « fêtes » à la place de « groupes », avec les Secret Santa en cours.
- Deux chiffres à surveiller en plus : **« Comptes à leur limite de Secret Santa »** et **« Fêtes à 30 membres »**. Ce sont des chiffres, pas des pastilles : rien n'attend.
- « Requêtes refusées pour débit » (et plus « Demandes ») : le mot « demande » ne sert plus.
- **En cas d'urgence**, un troisième interrupteur à côté de « Suspendre les emails » et « Suspendre les inscriptions » : **« Suspendre les nouveaux Secret Santa »** · « Ceux qui existent continuent ». Allumé, quelqu'un qui veut en organiser un voit `V3TiragePause` : « Les nouveaux Secret Santa sont en pause » · « Ceux qui existent continuent. Reviens dans quelques jours. » Créer une liste reste possible.

## Les comptes

Maquettes : `V3AdminComptes`, `V3AdminCompte`.

- La liste ne met plus rien « à traiter ». Un compte à sa limite le dit (« à sa limite de Secret Santa »).
- La fiche d'un compte : **« Secret Santa · Peut en organiser 3 · 2 en cours · il lui en reste 1 »**, avec le moins et le plus (c'est le réglage qui servait aux groupes) ; puis ses fêtes, avec son rôle. « Désactiver le compte » ne change pas.

Pause ou demande, et le réglage par compte : `docs/travail/questions.md`, Q-007.
