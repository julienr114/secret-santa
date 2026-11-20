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
- [ ] Les migrations Drizzle, dans l'ordre, appliquées en local.
- [ ] La reprise des données : chaque groupe devient une fête de catégorie Noël qui revient chaque année ; chaque édition, l'année et son Secret Santa ; chaque liste reliée à un tirage va dans sa fête ; chaque autre liste reçoit sa propre fête (`migration.md`).
- [ ] Les réglages qui ne concernent que le tirage descendent du groupe sur chaque Secret Santa.
- [ ] Le code serveur et les requêtes suivent le nouveau modèle ; les écrans, les adresses et les textes ne changent pas.
- [ ] Un essai de la migration sur une copie de la base de production, décrit pas à pas dans le compte rendu (c'est Julien qui fournit la copie).
- [ ] Les tests existants passent sans changer ce qu'ils vérifient.

## Hors périmètre

- Tout changement visible : écrans, textes, adresses, emails.
- La fusion des pistes et des listes (ticket 107).
- La fin des demandes de groupe (ticket 105).
- Pousser, déployer, appliquer une migration à distance.

## C'est fini quand

- [ ] Le schéma proposé a été lu par Julien.
- [ ] La base locale migrée contient les mêmes groupes, tirages et listes qu'avant, sous leur nouvelle forme ; un script ou un test le compare.
- [ ] `pnpm test:e2e` passe sans retouche des parcours.
- [ ] `/controle` passe.

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

Les étapes 4 à 6 demandent du code : un script `scripts/migrate-v3.ts`, lancé une fois après la migration SQL. Il est rejouable, parce qu'il n'écrit que ce qui manque. Le même script contrôle ensuite que les groupes, les tirages et les listes sont tous là (le critère « un script le compare »).

### Pour que rien ne change à l'écran

- **Les fêtes créées pour une liste ne doivent apparaître nulle part dans les écrans de groupe d'aujourd'hui** : ni sur l'accueil, ni dans l'administration, ni dans le quota.
- Règle de transition, jusqu'au ticket 104 : un écran de groupe ne montre que les fêtes qui ont au moins un Secret Santa, ou aucune liste propre (créée à la migration ou après).
- Pour la reconnaître sans deviner, j'ajouterais une colonne temporaire `parties.from_list`, vraie pour une fête née d'une liste, que le ticket 104 supprimera.
- **Les réglages du groupe d'aujourd'hui** écrivent dans `parties.rules` (les valeurs de départ) **et** dans chaque Secret Santa de la fête encore en préparation. Un tirage fait ne change déjà plus ses règles, puisqu'elles sont figées dans `rules_snapshot`. Pour la personne, le résultat est donc le même qu'aujourd'hui.
- Les adresses ne changent pas : `/admin/[slug]`, `/editions/[id]` et les liens personnels restent tels quels, seule la requête derrière change.

### Ce que je voudrais que tu tranches

1. Les renommages complets (tables et colonnes) : oui, ou seulement les nouvelles tables ? Le renommage complet touche une centaine de fichiers serveur, de façon mécanique.
2. La colonne temporaire `parties.from_list`, ou la règle « au moins un Secret Santa, ou aucune liste » sans colonne ?
3. La catégorie d'une fête née d'une liste, déduite de son icône : d'accord ?
4. La visibilité `giver` pour une liste reliée à un tirage. C'est ce qui garde le plus près d'aujourd'hui, où seul celui qui me tire voit le lien, en plus du lien public si la liste est partagée.

Je m'arrête ici, comme le demande le ticket.
