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

- [x] Un anniversaire créé pour Zoé, née le 14 décembre 2022, dit « ses 4 ans » en 2026 ; sa page de 2025 s'appelle « Ses 3 ans ».
- [x] Un anniversaire créé pour « Quelqu'un d'autre » ne dit pas d'âge.
- [x] Les maquettes du ticket sont reproduites.
- [x] `/controle` passe.

## Compte rendu

**Fait.**

- **Base** : migration `0042_v3_birthday_for` (après `0041_v3_member_entries`), une colonne `parties.for_member_id` qui accepte le vide, sans clé étrangère (l'événement survit au proche). Vide pour tous les événements existants. Appliquée en local seulement ; test de migration dans `server/database/migrations.test.ts`.
- **Création** : « Pour qui ? » envoie le proche (`forMemberId`), « Quelqu'un d'autre » rien ; « Préparer » de « Bientôt » passe par le même écran, donc le remplit aussi. Le serveur refuse (404) un proche qui n'est pas à moi ; une autre catégorie n'en retient aucun.
- **Réglages** : ligne « Pour » sous « Catégorie » pour un anniversaire (icône et prénom du proche, « Moi », ou « Personne »), panneau de choix avec mes proches puis « Personne ».
- **L'âge** : fonctions pures `ageIn` et `forWhomOf` (`shared/utils/forWhom.ts`, testées). Le serveur n'envoie que le prénom et l'âge, jamais la date de naissance. « ses 4 ans » après la date, « Ses 3 ans » en titre d'une année passée (ligne de « Les années passées » et pastille de la page de l'année), « tes 40 ans »/« Tes 40 ans » quand c'est moi (mon « Moi », ou le proche relié à mon compte).
- **« 7 cadeaux offerts à Zoé »** sur la ligne d'une année passée (et dans « Les événements passés »).
- **Proche supprimé** : `deleteMember` vide `for_member_id` ; l'événement garde son nom, perd âge et prénom.
- **« Bientôt »** : `comingBirthdays` écarte aussi un proche pour qui un de mes anniversaires est fait, quelle que soit sa date.
- Trois langues ; e2e `tests/e2e/birthday-for.spec.ts` (création, Bientôt, réglages, année passée, « Quelqu'un d'autre », proche supprimé).

**Décidé seul** (noté dans `ECARTS-MAQUETTES.md`, section ticket 118) : la pastille de la page d'une année passée dit « Ses 3 ans » (l'année reste dans la date) ; la forme de la ligne « Pour » et de son panneau (aucune maquette) ; pas de prénom dans « N cadeaux offerts » quand c'est mon anniversaire ; passer l'événement à une autre catégorie efface le proche ; le proche choisi par un autre organisateur se lit sans icône et « Valider » sans changement le garde ; pas d'âge l'année de naissance (âge < 1). Textes anglais et allemands : « turning 4 / Turned 3 », « wird 4 / Wurde 3 ».

**Écarts maquettes** : lignes 099/104 sur « Ses 3 ans » et « ses 4 ans » mises à jour (résolues), nouvelle section ticket 118.

**Questions posées** : aucune.

**Contrôle** : `pnpm controle --e2e` passé (trois langues, mots interdits, textes en dur, lint, typecheck, 937 tests Vitest, 190 tests Playwright). `security.spec.ts` « a participant learns their own result only » : passé du premier coup (0 échec).

**Commits** : `1c40e9a` docs: ticket 118 started ; `bc7efbc` feat(parties): a birthday remembers whom it is for ; `d0c015f` feat(parties): a birthday says the age of whom it is for ; puis docs: ticket 118 done.

**À faire par Julien** : appliquer la migration `0042_v3_birthday_for` à distance au moment de publier la V3.
