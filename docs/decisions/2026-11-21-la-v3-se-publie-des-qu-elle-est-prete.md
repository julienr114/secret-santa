# La V3 se publie dès qu'elle est prête

21 novembre 2026 · décidé par Julien, en réponse à Q-005.

## Contexte

La migration de la V3 change toute la base et ne se défait qu'en restaurant une sauvegarde. Des gens utilisent l'application pour Noël 2026. La conception proposait d'attendre janvier 2027.

## Décision

On publie dès que la V3 est prête, sans attendre la fin des fêtes.

Garde-fous écrits par la conception, à défaire si Julien le veut :

- **« Prête » veut dire tout le lot** : les tickets 105 à 112, et ce que les réponses du 21 novembre changent (le partage des listes, « événement »).
- **Une sauvegarde de la base juste avant**, et la migration rejouée une dernière fois sur une copie du jour (`pnpm v3:essai`, `pnpm v3:compare`).
- **Un mot à ceux qui sont au milieu d'un Secret Santa** : leurs pistes de cadeaux deviennent une liste vue seulement par celui qui les a tirés. Une ligne dans « Quoi de neuf » et dans l'email du matin, le jour de la bascule.

## Écarté

- Attendre janvier 2027.
- Publier par morceaux.

## Où ça s'applique

`docs/spec/v3/migration.md`. Ticket 113.
