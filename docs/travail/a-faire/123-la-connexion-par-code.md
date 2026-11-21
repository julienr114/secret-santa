# 123 — La connexion par code

- **Dépend de** : 113
- **Migration** : oui (les codes)
- **Maquettes** : `ConnexionCode`, `ConnexionCodeEmail`

## Objectif

Dans l'application installée sur le téléphone, un lien reçu par email s'ouvre dans le navigateur, pas dans l'application. Là, et seulement là, on se connecte avec un code à six chiffres recopié depuis l'email.

## À lire d'abord

- `README.md`, sections 8 (la sécurité des liens de connexion) et 22.22

## À faire

- [ ] **Le cœur, en fonctions pures** : créer et vérifier un code (six chiffres, 15 minutes, une fois, cinq essais, lié à l'appareil qui l'a demandé), jamais gardé en clair.
- [ ] **Base** : les codes, à côté des liens de connexion ; mêmes limites d'envoi.
- [ ] **Savoir si l'application tourne installée**, et seulement alors : l'écran du code après l'adresse, l'email du code sans lien. Dans un navigateur, rien ne change.
- [ ] Trois langues, tests, `tests/e2e`.

## Hors périmètre

- Rendre l'application installable (ticket 124).

## C'est fini quand

- [ ] Le sixième essai d'un code est refusé, même avec le bon code.
- [ ] Un code demandé sur un appareil ne connecte pas un autre appareil.
- [ ] Dans un navigateur, la connexion par lien est exactement celle d'aujourd'hui.
- [ ] `/controle` passe.

## Compte rendu

À remplir par Claude Code à la fin : ce qui a été fait, ce qui a été décidé seul (et pourquoi), les écarts avec les maquettes, les questions posées, les commits.
