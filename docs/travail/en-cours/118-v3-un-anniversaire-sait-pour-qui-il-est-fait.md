# 118 — V3 : un anniversaire sait pour qui il est fait

- **Dépend de** : 108
- **Migration** : oui (une colonne qui accepte le vide)
- **Maquettes** : `V3FeteAnniversaire`, `V3FeteNouvelle`, `V3FeteAnneePassee`

## Objectif

L'anniversaire de Zoé sait que c'est celui de Zoé. Il peut donc dire « ses 4 ans » à côté de sa date, « Ses 3 ans » pour une année passée, et « 7 cadeaux offerts à Zoé ».

## À lire d'abord

- `docs/decisions/2026-11-22-un-anniversaire-sait-pour-qui-il-est-fait.md`
- `docs/spec/v3/categories.md` (« Pour un anniversaire »)
- `docs/spec/v3/fete.md` (« Les réglages de l'événement », « Une année passée »)
- `docs/spec/v3/lignes.md` (le titre d'une année passée)
- `docs/travail/questions.md` (Q-022, dans « Réponses »)

## À faire

- [x] **Base** : un événement peut retenir un proche (`family_members`). Vide pour tous ceux qui existent.
- [x] **À la création** : « Pour qui ? » le remplit ; « Quelqu'un d'autre » le laisse vide. « Préparer », dans « Bientôt », le remplit aussi.
- [x] **Les réglages de l'événement** : pour la catégorie Anniversaire, une ligne « Pour », sous « Catégorie », de la même forme que les autres ; sa page propose mes proches et « Personne ».
- [x] **L'âge**, en fonction pure testée : avec une date de naissance, « ses 4 ans » à côté de la date de l'événement, « Ses 3 ans » en titre d'une année passée ; « tes 40 ans » quand c'est moi. Sans date de naissance, ou sans proche, rien.
- [x] **« 7 cadeaux offerts à Zoé »** : le prénom du proche, sur la ligne d'une année passée.
- [x] Un proche supprimé : l'événement garde son nom, perd l'âge et le prénom.
- [x] « Bientôt » ne propose pas l'anniversaire d'un proche qui a déjà le sien, même si on en a changé la date.
- [x] Trois langues. `docs/refonte/ECARTS-MAQUETTES.md` à jour.

## Hors périmètre

- Les autres catégories (un mariage a deux personnes, une naissance n'a pas encore de date).
- Remplir d'office les anniversaires déjà créés : leur organisateur choisit dans les réglages.

## C'est fini quand

- [ ] Un anniversaire créé pour Zoé, née le 14 décembre 2022, dit « ses 4 ans » en 2026 ; sa page de 2025 s'appelle « Ses 3 ans ».
- [ ] Un anniversaire créé pour « Quelqu'un d'autre » ne dit pas d'âge.
- [ ] Les maquettes du ticket sont reproduites.
- [ ] `/controle` passe.

## Compte rendu

À remplir par Claude Code à la fin : ce qui a été fait, ce qui a été décidé seul (et pourquoi), les écarts avec les maquettes, les questions posées, les commits.
