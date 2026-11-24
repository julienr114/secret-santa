# 137 — V3 : « Membres », deux retouches

- **Dépend de** : 117
- **Migration** : non
- **Maquettes** : `V3FeteMembres`, `V3FeteMembresComplet`

## Objectif

Deux réponses arrivées après le ticket 117 (Q-029 et Q-031).

## À lire d'abord

- `docs/spec/v3/fete.md` (« Les membres »)
- `docs/travail/questions.md` (Q-029 et Q-031, dans « Réponses »)

## À faire

- [x] **« Organise »** : dans « Membres », la ligne d'un organisateur commence par « Organise » (« Organise · Secret Santa · ne tire pas Hugo », ou « Organise » seul pour celui qui n'est entré ni par un Secret Santa ni par une liste). Trois langues, sans accord de genre.
- [x] **Pour un membre qui n’organise pas**, la ligne des membres de la page de l'événement dit combien ils sont et n'est pas un lien : pas de chevron, rien de touchable.
- [x] `tests/e2e`.

## Hors périmètre

- Ouvrir « Membres » aux membres (une idée pour plus tard).
- La règle elle-même : un organisateur ajouté reste membre, rien à changer.

## C'est fini quand

- [x] Un organisateur ajouté depuis les réglages se lit « Organise » dans « Membres ».
- [x] Un membre ne peut pas toucher la ligne des membres.
- [x] `/controle` passe (voir le compte rendu : un test étranger au ticket, instable, passé seul).

## Compte rendu

**Fait.**

- **« Organise »** : la réponse de `GET /api/admin/[fête]/persons` gagne `organising`, les membres qui organisent l'événement (`organisingIds`, `shared/utils/members.ts`, testée : un organisateur est membre par son adresse, quelle que soit la casse). Dans « Membres », leur ligne commence par « Organise » : « Organise · Secret Santa · ne tire pas Hugo », ou « Organise » seul. Anglais « Organises », allemand « Organisiert » (des verbes, sans genre).
- **La ligne des membres pour un membre** : déjà en place depuis le ticket 104 (`app/pages/e/[slug]/index.vue` : un `div`, sans chevron, quand on n'organise pas). Vérifiée par un test.
- **Tests** : Vitest (`members.test.ts`) ; Playwright `members-organise.spec.ts` : Inès, ajoutée depuis les réglages, lit « Organise » seul, Camille (qui a créé l'événement) « Organise », Hugo (par le Secret Santa) ne le lit pas ; pour Hugo, la ligne « 3 membres » n'est ni un lien ni chevronnée, la toucher ne mène nulle part, la route de « Membres » lui répond 403 ; pour Inès, elle a son chevron et ouvre « Membres ».

**Décidé seul, et pourquoi.**

- « Organise » vaut pour tout organisateur membre de l'événement (aussi celui qui l'a créé), pas seulement pour celui qu'on ajoute : la spec dit « Sa ligne commence par « Organise » » d'un organisateur, et la maquette le montre sur une ligne qui a aussi « Secret Santa ».
- Un organisateur est reconnu parmi les membres par son adresse, comme `addOrganizer` le fait déjà.
- Un organisateur qui ne participe plus lit « Ne participe plus », comme les autres.

**Écarts avec les maquettes** : la ligne `V3FeteMembres` de `docs/refonte/ECARTS-MAQUETTES.md` est mise à jour (Q-029 répondue, « Organise » comme la maquette, ses mots en anglais et en allemand).

**Questions posées** : aucune.

**Migration** : aucune.

**Contrôle** : `pnpm controle --e2e` : trois langues, mots interdits, textes en dur, lint, typecheck, Vitest (963 tests) passent ; Playwright 197 passés, 1 échec, 2 non lancés (la suite de l'échoué, en série) : `lists-drag.spec.ts` « on a phone, a long press lifts a line and drops it elsewhere » (la région aria-live lisait encore la notification « Circuit déplacé »), étranger au ticket ; relancé seul, `lists-drag.spec.ts` passe (3/3). `security.spec.ts` passe.

**Commits** : `9c6a3f2` docs: ticket 137 started ; `9643589` feat(members): an organiser's line begins with « Organise » ; et celui qui range ce ticket.
