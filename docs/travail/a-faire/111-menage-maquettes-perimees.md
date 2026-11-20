# 111 — Supprimer les maquettes périmées

- **Dépend de** : aucun
- **Migration** : non
- **Maquettes** : aucune

## Objectif

Ne garder dans le dépôt que les maquettes qui servent, pour que personne ne code d'après un dessin abandonné.

## À lire d'abord

- `docs/spec/v3/maquettes.md` (« Périmées »)

## À faire

- [ ] Supprimer de `docs/refonte/maquettes/` et de `docs/refonte/maquettes-sorbet/` les fichiers listés comme périmés, s'ils existent encore.
- [ ] Vérifier qu'aucun ticket de `a-faire/` ni aucun fichier de `docs/spec/` ne les cite.
- [ ] Relancer `python3 -B docs/refonte/sorbet/habiller.py` et vérifier que le nombre de maquettes habillées est celui de `docs/refonte/maquettes/`.

## Hors périmètre

- Les maquettes de la V2 : elles restent la référence de l'application en cours tant que la V3 n'est pas codée.

## C'est fini quand

- [ ] Les deux dossiers ont le même nombre de fichiers, et aucun des noms listés.
- [ ] `/controle` passe.

## Compte rendu

À remplir par Claude Code à la fin : ce qui a été fait, ce qui a été décidé seul (et pourquoi), les écarts avec les maquettes, les questions posées, les commits.
