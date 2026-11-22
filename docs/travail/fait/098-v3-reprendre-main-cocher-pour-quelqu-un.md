# 098 — V3 : reprendre `main` (« Cocher pour quelqu'un »)

- **Dépend de** : aucun. **À faire avant tout autre ticket** : plus on attend, plus les deux branches s'écartent.
- **Branche** : `v3`
- **Migration** : oui (celles de la V3 passent après celle de `main`)
- **Maquettes** : `ListeCocherPourMoi`, `ListeCocherPourDepart`, `ListeCocherPourChoix`, `ListeCocherPourLigne`, `ListeCocherPour`, `ListeCocherPourAutre`

## Objectif

« Cocher pour quelqu'un » a été codé sur `main` les 21 et 22 novembre 2026, et poussé. La V3 doit le contenir tel quel, sans rien perdre de ce qu'elle a changé dans les listes, et ses migrations doivent s'appliquer après celle de `main`.

## À lire d'abord

- `docs/decisions/2026-11-21-cocher-pour-quelqu-un.md`
- `docs/spec/v3/listes.md` (« Cocher pour quelqu'un », « Le partage d'une liste, par stades »)
- `docs/refonte/cocher-pour-quelqu-un/PROMPT.md` (ce qui a été demandé sur `main`)
- Les trois commits de `main` : `git log v3..main`

## À faire

- [x] **`git merge main` dans `v3`** : un merge, pas un rebase (`v3` est poussée). Quinze fichiers ont changé des deux côtés, dont `server/database/schema.ts`, `server/database/lists.ts`, `server/http/lists.ts`, `server/utils/lists.ts`, `server/utils/listSchemas.ts`, `app/pages/listes/[id]/index.vue`, `app/composables/queries/useLists.ts`, les trois `shared/i18n/locales/*/lists.ts`, `tests/e2e/lists.spec.ts` et le journal des migrations.
- [x] **Garder les deux côtés** : de `main`, le panneau « Qui l'offre ? », ses règles, ses routes et ses tests ; de `v3`, le partage par stades, « Celui qui m'a tiré », les pistes devenues la liste. Aucun test retiré pour faire passer le merge. Fait : seuls les deux fichiers du journal des migrations étaient en conflit. Une assertion de `lists-untick.spec.ts` (« le prénom n'est pas un bouton ») contredisait la décision : elle dit maintenant que le prénom ouvre « Qui l'offre ? ».
- [x] **Les migrations** : celle de `main` garde son nom, `0033_claims_for_someone`. Celles de la V3 deviennent `0034` à `0038`, dans le même ordre ; `_journal.json` et les instantanés suivent. Aucune migration de la V3 ne recrée ni ne vide `gift_list_givers` et `gift_giver_claims`.
- [x] **Rejouer la migration de bout en bout** : une base au format de `main` (jusqu'à `0033`), avec des données d'essai qui comprennent des coches notées pour quelqu'un (un prénom écrit, un prénom avec son adresse, un cadeau à plusieurs), puis les migrations de la V3, puis `pnpm v3:essai` et `pnpm v3:compare`. Ces coches sont toujours là, sur la même idée, au même nom. Fait dans `server/database/migrations.test.ts` (des coches notées pour un prénom écrit, un prénom avec adresse, un cadeau à plusieurs, à travers 0034 à 0038). `pnpm v3:essai` et `pnpm v3:compare` demandent un export de la base de production, que je n'ai pas : à lancer par Julien.
- [x] **La base locale** de Julien a reçu les migrations de la V3 sous leurs anciens noms. **Ne pas la supprimer** : la mettre de côté (`mv .wrangler/state .wrangler/state-avant-098`), en refaire une neuve (`pnpm db:migrate:local`, puis les scripts de données), et le dire dans le compte rendu. Mise de côté dans `.wrangler/state-avant-098`, base neuve migrée de 0000 à 0038. Les scripts de données **pas lancés** : ils se connectent en super-admin avec une vraie adresse, ce que `CLAUDE.md` interdit.
- [x] **Les mots de la V3** dans les textes venus de `main`, dans les trois langues (`docs/spec/v3/vocabulaire.md`). Rien à changer : les textes venus de `main` ne disent ni groupe, ni édition, ni pistes, ni fête.
- [x] **Dans « Qui l'offre ? »**, « ceux que l'application connaît » comprend aussi, en V3, les membres des événements où la liste est partagée.
- [x] Le panneau s'ouvre sur la page de liste de la V3, avec sa barre du haut : les six maquettes.
- [x] `docs/refonte/ECARTS-MAQUETTES.md` et `docs/ARBORESCENCE.md` à jour.

## Hors périmètre

- Faire entrer dans l'événement celui dont on donne l'adresse en cochant pour lui : c'est « pour après » (`docs/spec/v3/listes.md`).
- Toucher à `main`, ou y reporter quoi que ce soit de la V3.

## C'est fini quand

- [x] `git log v3..main` ne montre plus rien.
- [x] Tous les tests de `main` sur « Cocher pour quelqu'un » passent sur `v3`, sans avoir été affaiblis.
- [x] La migration rejouée garde chaque coche notée pour quelqu'un (un test sur des données d'essai).
- [x] Sur une base neuve, `pnpm db:migrate:local` applique `0000` à `0038` sans erreur.
- [x] `/controle` passe.

## Compte rendu

À remplir par Claude Code à la fin : ce qui a été fait, ce qui a été décidé seul (et pourquoi), les conflits qui demandaient un choix, le nouveau nom de chaque migration, ce qui a été fait de la base locale, les commits.

**Fait le 22 novembre 2026.**

- **Le merge** : `git merge main` dans `v3`. Tout le code s'est fusionné seul ; seuls `meta/_journal.json` et `meta/0033_snapshot.json` étaient en conflit. `git log v3..main` est vide.
- **Les migrations** : `0033_claims_for_someone` (de `main`) garde son nom. La V3 devient `0034_v3_parties`, `0035_v3_secret_santa_limit`, `0036_v3_switches`, `0037_v3_list_sharing`, `0038_v3_hints_to_lists`. Leurs instantanés portent les tables `gift_list_givers` et `gift_giver_claims` et les colonnes `gift_claims.noted_by` et `giver_name`. L'instantané `0034` suit `0033`. `drizzle-kit generate` ne trouve aucun changement. Aucune migration de la V3 ne touche `gift_claims` ni les deux tables nouvelles. Le test des migrations et `scripts/v3-essai.ts` citent les nouveaux noms.
- **Le rejeu** : un test (`migrations.test.ts`) part d'une base de `main` jusqu'à 0033, avec un prénom écrit, un prénom avec adresse et un cadeau à plusieurs fermé (un compte noté et un prénom). Après 0034 à 0038, chaque coche est toujours sur la même idée, au même nom, et aucune clé étrangère n'est cassée.
- **Une base neuve** reçoit 0000 à 0038 sans erreur (`wrangler d1 migrations apply --local` sur une base jetable, et dans le serveur des tests Playwright).
- **La base locale de Julien** : mise de côté dans `.wrangler/state-avant-098`, rien de supprimé. `.wrangler/state` est neuve, migrée de 0000 à 0038, **sans données d'essai** : les scripts `seed:demo` et `seed:lists` passent par `pnpm dev` et se connectent en super-admin avec une vraie adresse, ce que `CLAUDE.md` interdit. À lancer par Julien.
- **En V3, « ceux que l'application connaît »** comprend les membres des événements où la liste est partagée avec tous les membres : ceux qui ont un compte (par leur adresse) et les organisateurs (`accountsWhereShared`, `server/database/listSharing.ts`). Le panneau les propose après ceux qui ont coché (`listCandidates`, testé), et le serveur les accepte.
- **Les tests** : les 8 étapes du parcours de `main` (`lists-for-someone.spec.ts`) passent sur `v3` sans changement, comme toutes les specs des listes. `/controle` passe.

**Décidé seul** :
- La place des membres des événements : après ceux qui ont coché, avant les prénoms écrits, sans ligne dessous.
- Seuls les événements où la liste est partagée avec **tous** les membres comptent : un événement où elle est réservée à « celui qui m'a tiré » ne fait pas connaître ses autres membres.
- Les dates `when` des migrations de la V3 dans `_journal.json` passent après celle de 0033, pour que l'ordre soit lisible (wrangler applique par nom de fichier).

**Conflits qui demandaient un choix** : `lists-untick.spec.ts` disait que le prénom d'une coche n'est pas un bouton (Correction 30). « Cocher pour quelqu'un » en fait un bouton : l'assertion vérifie maintenant ce bouton. **Ce test échoue aussi sur `main`**, poussée le 22 novembre : j'avais changé le nom de ce bouton sans relancer cette spec. La CI de `main` sera rouge tant que la même correction n'y est pas reportée (une ligne de test, aucun code).

**À faire par Julien** : lancer les scripts de données sur la base neuve ; `pnpm v3:essai` sur un export de production (le script ne rejoue que `0034_v3_parties`, comme avant) ; reporter sur `main` la correction de `lists-untick.spec.ts` s'il le souhaite. Rien n'est poussé.

**Commits** : `docs: ticket 098 started`, `3d9ebe3 merge: main into v3, « Cocher pour quelqu'un » (ticket 098)`, puis `feat(lists): the members of the events are known in « Qui l'offre ? »`.
