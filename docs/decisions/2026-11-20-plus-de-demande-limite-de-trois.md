# Plus de demande pour organiser ; une limite de 3 Secret Santa par compte

20 novembre 2026 · décidé par Julien, en séance de conception.

## Contexte

Aujourd'hui, créer un groupe passe par une demande au super-admin. Elle protégeait deux choses : un Secret Santa envoie des emails à des adresses saisies par l'organisateur, et l'infrastructure n'est pas dimensionnée.

## Décision

- Plus de demande. Organiser un Secret Santa est libre.
- Restent des limites automatiques : 3 Secret Santa par compte, 30 membres par fête, les garde-fous des emails.
- Un interrupteur côté serveur permet de rallumer la demande en cas d'abus.

## Écarté

- Garder la demande pendant la bêta, portée sur les tirages plutôt que sur les groupes.

## Où ça s'applique

`docs/spec/v3/modele.md`, `secret-santa.md`, `migration.md`. Maquette : `V3TirageLimite`.
