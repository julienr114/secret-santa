# En cas d'abus, une pause ; et la limite d'un compte se règle

21 novembre 2026 · décidé par Julien, en réponse à Q-007. Remplace un point de `2026-11-20-plus-de-demande-limite-de-trois.md`.

## Contexte

La décision du 20 novembre supprimait la demande pour organiser et disait qu'« un interrupteur permet de rallumer la demande en cas d'abus ». La rallumer voulait dire garder la table des demandes, leur file, leur fiche, leurs emails et leurs réponses toutes faites, pour un cas qui n'arrivera peut-être jamais. Et sans demande, celui qui bute sur la limite de 3 n'a aucun recours.

## Décision

- **En cas d'abus, le super-admin suspend les nouveaux Secret Santa** : un interrupteur dans l'administration, avec « Suspendre les emails » et « Suspendre les inscriptions ». Ceux qui existent continuent ; créer une liste reste possible.
- **Les demandes disparaissent pour de bon** : leur table, leurs écrans, leurs emails.
- **Le super-admin change la limite de Secret Santa d'un compte**, sur sa fiche. Elle vaut 3 au départ pour tout le monde. C'est ce qui remplace la demande pour quelqu'un qu'on connaît.

## Écarté

- Le retour des demandes derrière un interrupteur.
- Une limite de 3 identique pour tous, sans réglage.

## Où ça s'applique

`docs/spec/v3/administration.md`, `docs/spec/v3/modele.md` (« Les limites »). Maquettes : `V3Admin`, `V3AdminCompte`, `V3TiragePause`. Tickets 105 (la limite) et 109 (l'administration, la pause).
