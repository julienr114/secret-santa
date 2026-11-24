# 101 — V3 : le nouveau modèle, sans changer un seul écran

- **Dépend de** : aucun
- **Migration** : oui
- **Maquettes** : aucune

## Objectif

Faire tourner l'application d'aujourd'hui, à l'identique pour ses utilisateurs, sur le modèle de la V3 : des fêtes, leurs années, leurs Secret Santa, des listes rattachées à des fêtes. C'est le socle de tous les tickets suivants. **Sur une branche ; rien ne se publie avant que Julien le décide, et pas pendant la saison de Noël 2026.**

## À lire d'abord

- `docs/spec/v3/modele.md`
- `docs/spec/v3/categories.md`
- `docs/spec/v3/migration.md`
- `docs/decisions/2026-11-20-le-groupe-devient-la-fete.md`
- `docs/decisions/2026-11-20-on-cree-un-secret-santa-ou-une-liste.md`
- `README.md`, section 10 (le modèle d'aujourd'hui) et `server/database/schema.ts`

## À faire

- [x] Proposer le schéma avant de l'écrire : les tables, ce qui est renommé, ce qui est nouveau (la catégorie, la date habituelle, la récurrence, l'année d'une fête, plusieurs Secret Santa par année, le rattachement d'une liste à une ou plusieurs fêtes avec sa visibilité par fête : toute la fête, ou celui qui m'a tiré). L'écrire dans le compte rendu de ce ticket et s'arrêter pour que Julien le lise.
- [x] Les migrations Drizzle, dans l'ordre, appliquées en local. J'ai migré une copie de la base locale, pas ta base elle-même : voir le compte rendu.
- [x] La reprise des données : chaque groupe devient une fête de catégorie Noël qui revient chaque année ; chaque édition, l'année et son Secret Santa ; chaque liste reliée à un tirage va dans sa fête ; chaque autre liste reçoit sa propre fête (`migration.md`).
- [x] Les réglages qui ne concernent que le tirage descendent du groupe sur chaque Secret Santa.
- [x] Le code serveur et les requêtes suivent le nouveau modèle ; les écrans, les adresses et les textes ne changent pas.
- [x] Un essai de la migration sur une copie de la base de production, décrit pas à pas dans le compte rendu (c'est Julien qui fournit la copie).
- [x] Les tests existants passent sans changer ce qu'ils vérifient.

## Hors périmètre

- Tout changement visible : écrans, textes, adresses, emails.
- La fusion des pistes et des listes (ticket 107).
- La fin des demandes de groupe (ticket 105).
- Pousser, déployer, appliquer une migration à distance.

## C'est fini quand

- [x] Le schéma proposé a été lu par Julien.
- [x] La base locale migrée contient les mêmes groupes, tirages et listes qu'avant, sous leur nouvelle forme ; un script ou un test le compare.
- [x] `pnpm test:e2e` passe sans retouche des parcours.
- [x] `/controle` passe.

## Compte rendu

### Le schéma proposé (à lire par Julien avant d'écrire une ligne)

Branche `v3/101-modele-et-migration`. Les noms du code sont en anglais : la fête est `party`, l'année `party_year`, le Secret Santa `secret_santa`. Le choix « fête » ou « événement » (Q-001) ne touche que les textes, pas ces noms.

**Renommé : les tables et les colonnes, pour de bon.** Pas un simple alias dans Drizzle, sinon le code dirait `party` et la base `groups` pendant des années.

| Aujourd'hui | Devient |
|---|---|
| `groups` | `parties` |
| `editions` | `secret_santas` |
| `group_members` (les organisateurs) | `party_organisers` : en V3, « membre » veut dire une ligne de `persons` ; garder `group_members` pour les organisateurs prêterait à confusion |
| la colonne `group_id` (`persons`, `manual_exclusions`, `audit_log`) | `party_id` |
| la colonne `edition_id` (`participations`, `assignments`, `hint_requests`, `guesses`, `draw_answers`, `audit_log`) | `secret_santa_id` |

`persons` garde son nom : ce sont les membres d'une fête, comme le dit `modele.md`. SQLite renomme aussi les clés étrangères qui pointent vers une table renommée.

**Nouveau sur `parties`.**
- `category`, parmi `christmas`, `birthday`, `birth`, `wedding`, `housewarming`, `other`. Non nul, `christmas` par défaut.
- `icon_emoji` et `icon_color` : l'icône de la fête et de ses listes. Pour Noël, 🎄 ; ailleurs, celle de la catégorie ; pour « Autre », au choix.
- `usual_date`, au format `MM-DD` (« 12-25 »), ou nul quand la date est « à saisir ».
- `recurring` : vrai si la fête revient chaque année.
- `rules` reste, mais ne garde que ce qui est à la fête : `notifyJoined`. Pendant la transition, il porte aussi les valeurs de départ du prochain Secret Santa (voir plus bas).

**Nouveau : `party_years`.** Une ligne par fête et par année.
- Colonnes : `id`, `party_id`, `year`, `date` (un jour ISO, la vraie date de cette année-là), `created_at`.
- Une seule ligne par couple fête et année (`unique(party_id, year)`).
- L'archivage des années passées attend le ticket 108, qui est encore à concevoir. Je n'ajoute pas de colonne pour lui maintenant.

**Changé sur `secret_santas`.**
- Il garde `party_id`, pour que chaque requête filtre toujours sur la fête (README 8.5).
- Il gagne `year_id`, qui pointe vers `party_years`.
- Sa colonne `year` disparaît : l'année se lit par `party_years`, pour n'avoir qu'une source.
- `rules_override` devient `rules` : l'ensemble complet des réglages du tirage, qui ne dépend plus de la fête.
- `rules_snapshot` et tout le reste ne changent pas.

**Nouveau : `gift_list_parties`.** Le rattachement d'une liste à une fête.
- Colonnes : `id`, `list_id`, `party_id`, `visibility`, `created_at`, avec `visibility` parmi `party` (toute la fête) et `giver` (celui qui m'a tiré).
- Une seule ligne par couple liste et fête (`unique(list_id, party_id)`).
- « Tout le monde, avec un lien » reste `gift_lists.share_token` : c'est un réglage de la liste, pas de la fête.
- `gift_lists` garde son titre, sa date et son icône jusqu'au ticket 106, puisque les écrans ne changent pas ici.

**Inchangé ici.** `giftPortraits`, `wishes` et `hintRequests` attendent le ticket 107. `groupRequests` et `accounts.group_quota` attendent le 105. `family_members` ne change pas.

### La reprise des données (une migration SQL, dans l'ordre)

1. Les renommages ci-dessus.
2. **Chaque groupe** devient une fête de catégorie `christmas`, avec l'icône 🎄, la date habituelle `12-25` et `recurring` à vrai.
3. **Chaque édition** :
   - elle donne une `party_years` par couple groupe et année ;
   - la date de cette année est `rules.eventDate` de l'édition s'il s'agit d'un jour ISO, sinon le 25 décembre de l'année ;
   - l'édition se rattache à cette année ;
   - le texte libre d'une vieille `eventDate` reste dans les réglages du Secret Santa, affiché comme aujourd'hui.
4. **Les réglages descendent.**
   - Chaque Secret Santa reçoit, dans `rules`, les réglages effectifs d'aujourd'hui : le défaut, puis le groupe, puis la surcharge de l'édition (`mergeRules`).
   - Cette fusion se fait dans un script en TypeScript plutôt qu'en SQL. Elle passe par `upgradeHintsRule` et ses valeurs par défaut, qu'il serait risqué de réécrire en SQL.
5. **Chaque liste reliée à un tirage** (`participations.gift_list_id`) va dans la fête de ce tirage, avec la visibilité `giver`. Une liste reliée dans deux groupes va dans les deux fêtes.
6. **Chaque autre liste** reçoit sa propre fête :
   - le nom est le titre de la liste, l'icône celle de la liste et la date sa date ;
   - la catégorie se déduit de l'icône quand c'est l'une des six (🎂 donne `birthday`, etc.), sinon c'est `other` ;
   - `recurring` est à faux ;
   - les membres sont le propriétaire et les co-teneurs : une ligne de `persons` chacun, avec son adresse et le prénom de son profil, ou à défaut celui de sa fiche « Moi » ;
   - l'organisateur est le propriétaire ;
   - la visibilité est `party`.

Les étapes 4 à 6 se font aussi en SQL (voir « Corrigé en codant »). La comparaison, avant et après, est un script à part.

### Pour que rien ne change à l'écran

- **Les fêtes créées pour une liste ne doivent apparaître nulle part dans les écrans de groupe d'aujourd'hui** : ni sur l'accueil, ni dans l'administration, ni dans le quota.
- Règle de transition, jusqu'au ticket 104 : un écran de groupe ne montre que les fêtes qui ont au moins un Secret Santa, ou aucune liste propre (créée à la migration ou après).
- Pour la reconnaître sans deviner, j'ajouterais une colonne temporaire `parties.from_list`, vraie pour une fête née d'une liste, que le ticket 104 supprimera.
- **Les réglages du groupe d'aujourd'hui** écrivent dans `parties.rules` (les valeurs de départ) **et** dans chaque Secret Santa de la fête encore en préparation. Un tirage fait ne change déjà plus ses règles, puisqu'elles sont figées dans `rules_snapshot`. Pour la personne, le résultat est donc le même qu'aujourd'hui.
- Les adresses ne changent pas : `/admin/[slug]`, `/editions/[id]` et les liens personnels restent tels quels, seule la requête derrière change.

### Tranché par Julien, le 20 novembre 2026

1. **Renommer les tables et les colonnes, pour de bon : oui.**
2. **Colonne temporaire `parties.from_list` : oui.**
3. **La catégorie se note par un code, pas par un emoji.**
   - C'est une constante `PARTY_CATEGORIES` (`shared/utils/categories.ts`), qui garde pour chaque code l'emoji et les réglages de départ.
   - Pas de table : les six catégories sont figées, et leurs libellés sont dans `shared/i18n`.
   - L'emoji ne sert qu'à deviner la catégorie d'une liste à la migration.
4. **La visibilité se règle fête par fête, comme le dit la spec.**
   - « Tout le monde, avec un lien » reste un troisième niveau, sur la liste, toujours possible en plus.
   - À la migration, une liste reliée à un tirage reçoit `party` si elle a un lien public, sinon `giver`.

### Corrigé en codant

- **Toute la reprise se fait en SQL, dans une seule migration**, au lieu d'un script TypeScript à lancer après. Ainsi, `wrangler d1 migrations apply` suffit, en local comme à distance, et il n'y a pas d'étape à oublier. La fusion des réglages se fait en JSON dans SQLite ; un test la compare à `mergeRules` sur des cas réels.
- **`rules_snapshot` ne sert pas à lire les réglages d'un tirage fait** : tout le code relit le groupe, puis la surcharge.
  - Les réglages du groupe d'aujourd'hui écrivent donc dans `parties.rules` **et dans chaque Secret Santa de la fête**, quel que soit son état.
  - Les deux écrans touchent des réglages différents : le groupe règle « Éviter la même personne », le mot ajouté aux messages, les emails et les pistes ; l'édition règle le budget, le petit mot et la date. Écrire partout donne donc le même résultat qu'aujourd'hui.

### Fait

- **Le schéma** est dans `server/database/schema.ts`, la migration écrite à la main dans `0033_v3_parties.sql`, avec son instantané Drizzle (`drizzle-kit generate` ne voit plus aucune différence). Les catégories sont dans `shared/utils/categories.ts`.
- **La reprise** est en SQL, dans la même migration.
  - Le Secret Santa est refait sous son propre nom, une fois l'ancienne table supprimée. Ainsi, les clés étrangères différées des lignes qui en dépendent sont réglées au moment de l'insertion.
  - La fusion des réglages suit `mergeRules` : les valeurs nulles sont retirées, l'ancien `wishlist` devient `giftHints`, puis la surcharge de l'édition s'applique par-dessus les réglages du groupe.
- **Les preuves.**
  - `server/database/migrations.test.ts` rejoue toutes les migrations sur SQLite en mémoire, clés étrangères actives, dans une transaction comme D1. Il vérifie le schéma contre l'instantané, chaque cas de `migration.md`, l'égalité des réglages et la comparaison ci-dessous.
  - `pnpm v3:compare avant.sqlite après.sqlite` (`server/database/v3Compare.ts`) compare les groupes, les organisateurs, les éditions (fête, année, état, réglages), les tables qui n'ont fait que changer de colonnes, et les listes.
  - Lancé sur une copie de la base locale migrée par `wrangler d1 migrations apply --local --persist-to <copie>` : 24 groupes, 26 éditions et 9 listes avant ; 30 fêtes, dont 6 nées d'une liste, 32 années, 26 Secret Santa et 9 listes rangées après. Aucune différence.
- **Le code serveur** lit et écrit le nouveau modèle. Les réponses d'API, et donc les écrans, gardent leurs noms d'avant.
  - Une édition se lit par `selectEditions` (`server/database/editions.ts`), qui joint l'année de la fête.
  - Le journal garde `groupId` et `editionId` dans sa logique pure. `auditInsert` et `loadJournal` font la conversion à l'entrée et à la sortie de la base.
- **Les fêtes nées d'une liste** sont cachées partout où le code connaît un groupe : rôle d'organisateur, listes de groupes, administration, quota, statistiques (`isGroup`).
- **Les réglages du groupe** s'écrivent aussi dans chaque Secret Santa de la fête (`rules.patch.ts`). Ceux d'une édition s'écrivent dans son Secret Santa.
- **Les listes après la migration** (`server/database/listParties.ts`) :
  - une liste créée reçoit sa fête, avec l'identifiant de la liste ;
  - un co-teneur qui accepte en devient membre ;
  - le titre et l'icône suivent ;
  - une liste reliée à un tirage entre dans la fête de ce tirage, et en sort quand plus personne de cette fête ne la relie ;
  - une liste supprimée sort de toutes ses fêtes et emporte la sienne.
- **Les tests** : `pnpm controle` passe (lint, types, 684 tests unitaires) et `pnpm test:e2e` aussi (141 parcours, sans retouche).

### Décidé seul

- **Toute la reprise en SQL**, plutôt qu'un script à lancer après, pour qu'il n'y ait qu'une étape (voir « Corrigé en codant »).
- **Les réponses d'API gardent leurs champs** (`groupId`, `year`, `rulesOverride`) jusqu'aux écrans de la V3. Le champ `rulesOverride` renvoie désormais tous les réglages du Secret Santa. L'écran les renvoie avec une valeur changée, et le serveur fusionne.
- **Le prénom d'un membre d'une fête née d'une liste.**
  - À la migration : celui du profil, sinon celui de la fiche « Moi », sinon vide.
  - Après la migration : la règle de toujours, `personFromProfile`, qui devine un prénom depuis l'adresse.
  - Ces fêtes sont cachées ; à revoir avec le ticket 104.
- **L'adresse d'une fête née d'une liste** est `liste-` suivi de 12 caractères au hasard. Elle n'est montrée nulle part pour l'instant.
- **Une nouvelle année** (création d'une édition) prend la date habituelle de la fête cette année-là : le 25 décembre pour les groupes d'aujourd'hui.
- **La date d'une liste** ne suit pas l'année de sa fête quand on la change. Elle n'est lue nulle part avant le ticket 106.
- **Corrigé en route** : `carriedGame` lisait la date de l'édition précédente dans `rulesOverride`, un champ facultatif que les types ne pouvaient pas signaler. Sans cette correction, « Devine qui » n'aurait plus été repris d'une année sur l'autre. Son test lit maintenant `rules`, et vérifie la même chose.

### Ce qui reste ouvert, ou à savoir

- **Ta base locale n'est pas migrée, exprès.** `pnpm dev` sur `main` ne marcherait plus avec elle. Sur cette branche, lance `pnpm db:migrate:local` ; pour revenir sur `main` ensuite, il faut repartir d'une base vide ou d'une sauvegarde de `.wrangler/state`.
- **Supprimer un groupe** (super-admin) retire ses listes de sa fête. Une liste qui n'était que dans cette fête n'est alors plus dans aucune. C'est rare, et ce sera à reprendre quand la suppression d'une fête sera conçue.
- **`README.md`, section 10**, décrit encore le modèle de la V2. Je ne l'ai pas touché, parce qu'il décrit l'application publiée.

### L'essai sur une copie de la base de production

Fait le 20 novembre 2026 sur l'export de Julien. **Avant** : 2 groupes, 2 éditions, 1 liste. **Après** : 3 fêtes (dont 1 née d'une liste), 3 années, 2 Secret Santa, 1 liste rangée. Aucune différence, aucune clé étrangère cassée.

Pour le refaire, juste avant de publier :

1. `pnpm wrangler d1 export secret-santa --remote --output=sauvegardes/prod.sql`
   - Cette commande ne fait que lire. Mais la base ne répond plus pendant l'export : viser une heure creuse.
   - Le dossier `sauvegardes/` doit exister. `.gitignore` l'exclut.
2. `pnpm v3:essai sauvegardes/prod.sql`
   - La commande charge l'export, applique `0033` comme D1 (une transaction, clés étrangères actives), compare les deux bases, puis supprime ce qu'elle a créé.
3. Supprimer `sauvegardes/prod.sql` : ce sont les données des gens.

**Corrigé à l'essai.** Les étapes écrites d'abord passaient par `wrangler d1 execute --local --file`. Cette commande refuse un export de D1, qui écrit des lignes vers `persons` avant de créer la table (« no such table: main.persons »). D'où `pnpm v3:essai`, qui charge l'export avec SQLite, clés étrangères coupées le temps du chargement seulement. La migration elle-même passe aussi avec `wrangler d1 migrations apply --local`, essayée sur une copie de la base locale.

### Commits

- `773303c` docs : la proposition de schéma.
- `b706ae0` feat(db) : le modèle, la migration 0033 et le code serveur.
- `f594dd3` chore(db) : `pnpm v3:compare`, avec ce compte rendu.
- Puis `pnpm v3:essai` et le résultat de l'essai, avec ce ticket rangé dans `fait/`.
