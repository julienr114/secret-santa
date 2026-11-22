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

- [ ] **`git merge main` dans `v3`** : un merge, pas un rebase (`v3` est poussée). Quinze fichiers ont changé des deux côtés, dont `server/database/schema.ts`, `server/database/lists.ts`, `server/http/lists.ts`, `server/utils/lists.ts`, `server/utils/listSchemas.ts`, `app/pages/listes/[id]/index.vue`, `app/composables/queries/useLists.ts`, les trois `shared/i18n/locales/*/lists.ts`, `tests/e2e/lists.spec.ts` et le journal des migrations.
- [ ] **Garder les deux côtés** : de `main`, le panneau « Qui l'offre ? », ses règles, ses routes et ses tests ; de `v3`, le partage par stades, « Celui qui m'a tiré », les pistes devenues la liste. Aucun test retiré pour faire passer le merge.
- [ ] **Les migrations** : celle de `main` garde son nom, `0033_claims_for_someone`. Celles de la V3 deviennent `0034` à `0038`, dans le même ordre ; `_journal.json` et les instantanés suivent. Aucune migration de la V3 ne recrée ni ne vide `gift_list_givers` et `gift_giver_claims`.
- [ ] **Rejouer la migration de bout en bout** : une base au format de `main` (jusqu'à `0033`), avec des données d'essai qui comprennent des coches notées pour quelqu'un (un prénom écrit, un prénom avec son adresse, un cadeau à plusieurs), puis les migrations de la V3, puis `pnpm v3:essai` et `pnpm v3:compare`. Ces coches sont toujours là, sur la même idée, au même nom.
- [ ] **La base locale** de Julien a reçu les migrations de la V3 sous leurs anciens noms. **Ne pas la supprimer** : la mettre de côté (`mv .wrangler/state .wrangler/state-avant-098`), en refaire une neuve (`pnpm db:migrate:local`, puis les scripts de données), et le dire dans le compte rendu.
- [ ] **Les mots de la V3** dans les textes venus de `main`, dans les trois langues (`docs/spec/v3/vocabulaire.md`).
- [ ] **Dans « Qui l'offre ? »**, « ceux que l'application connaît » comprend aussi, en V3, les membres des événements où la liste est partagée.
- [ ] Le panneau s'ouvre sur la page de liste de la V3, avec sa barre du haut : les six maquettes.
- [ ] `docs/refonte/ECARTS-MAQUETTES.md` et `docs/ARBORESCENCE.md` à jour.

## Hors périmètre

- Faire entrer dans l'événement celui dont on donne l'adresse en cochant pour lui : c'est « pour après » (`docs/spec/v3/listes.md`).
- Toucher à `main`, ou y reporter quoi que ce soit de la V3.

## C'est fini quand

- [ ] `git log v3..main` ne montre plus rien.
- [ ] Tous les tests de `main` sur « Cocher pour quelqu'un » passent sur `v3`, sans avoir été affaiblis.
- [ ] La migration rejouée garde chaque coche notée pour quelqu'un (un test sur des données d'essai).
- [ ] Sur une base neuve, `pnpm db:migrate:local` applique `0000` à `0038` sans erreur.
- [ ] `/controle` passe.

## Compte rendu

À remplir par Claude Code à la fin : ce qui a été fait, ce qui a été décidé seul (et pourquoi), les conflits qui demandaient un choix, le nouveau nom de chaque migration, ce qui a été fait de la base locale, les commits.
