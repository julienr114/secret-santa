# 111 — Après la suppression des maquettes périmées

- **Dépend de** : aucun
- **Migration** : non
- **Maquettes** : aucune

## Objectif

Les maquettes périmées ont été supprimées par la conception le 20 novembre 2026 au soir (88 maquettes, 176 fichiers, dans `docs/refonte/maquettes/` et `docs/refonte/maquettes-sorbet/`). Reste à vérifier que rien, côté code, ne s'appuie encore dessus.

## À lire d'abord

- `docs/spec/v3/maquettes.md` (« Périmées » : la liste, et ce qui remplace chacune)

## À faire

- [ ] `docs/refonte/ECARTS-MAQUETTES.md` cite encore `PistesListe`, `PistesListeChoisir` et `ListeNouvelle` : dire ce qui les remplace, ou retirer la ligne.
- [ ] Supprimer, si Julien est d'accord, les neuf fichiers orphelins listés dans `docs/spec/v3/maquettes.md` (dans `maquettes/` et `maquettes-sorbet/`).
- [ ] Chercher dans `docs/ARBORESCENCE.md`, les commentaires du code et les tests un nom de la liste des périmées.
- [ ] Quatre fichiers ne sont que dans le dépôt, sans être sur le canevas ni dans l'index : `ListeIdeeBulle`, `ListeIdeeBulleGras`, `ListeSansPersonneA`, `ListeSansPersonneB`. Les supprimer avec les neuf, si Julien est d'accord.

## Hors périmètre

- Les maquettes gardées : elles restent la référence de tout ce que la V3 ne redessine pas.

## C'est fini quand

- [ ] Aucun fichier hors de `docs/spec/v3/maquettes.md` ne cite une maquette périmée.
- [ ] `docs/refonte/maquettes/` et `docs/refonte/maquettes-sorbet/` ont le même nombre de fichiers.
- [ ] `/controle` passe.

## Compte rendu

À remplir par Claude Code à la fin : ce qui a été fait, ce qui a été décidé seul (et pourquoi), les écarts avec les maquettes, les questions posées, les commits.
