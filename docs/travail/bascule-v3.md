# La bascule vers la V3 : le pas-à-pas

Ticket 113. Décision : `docs/decisions/2026-11-21-la-v3-se-publie-des-qu-elle-est-prete.md`. Ce qui change dans la base : `docs/spec/v3/migration.md`.

Toutes ces commandes se lancent par Julien, depuis la racine du dépôt. Claude Code n'en lance aucune à distance.

## Ce qu'il faut savoir

- La production est à `0033_claims_for_someone`. La V3 publie **neuf migrations d'un coup**, de `0034_v3_parties` à `0042_v3_birthday_for`. Elles ne se défont pas : on ne revient en arrière qu'en restaurant la base.
- **L'ordre : la migration, puis le code.** Entre les deux, la V2 tourne sur la base de la V3 et peut afficher des erreurs : quelques dizaines de secondes, si le code est construit d'avance.
- **Les tâches planifiées** (`wrangler.toml`, `[triggers]`) :
  - `0 8 * * *`, chaque matin à 8 h UTC (9 h à Paris en hiver) : les rappels aux organisateurs (`server/plugins/reminders.ts`) ;
  - `*/15 * * * *`, toutes les quinze minutes : « Devine qui » (`server/plugins/guesses.ts`), qui peut envoyer des emails (le rappel automatique, le point de l'organisateur, la fin du jeu, le dévoilement automatique).
  - L'interrupteur « Suspendre les emails » n'existe pas avant le ticket 129. On s'en passe en **retirant les deux tâches** le temps de la bascule (plus bas) : le déploiement de la V3 les remet, depuis `wrangler.toml`.
- **La sauvegarde** : Time Travel de D1 (toujours actif ; sept jours sur l'offre gratuite) est le retour en arrière principal, en une commande. L'export en est la copie de secours, et sert à la répétition.
- Un export contient les données des gens : il reste dans `sauvegardes/` (exclu par `.gitignore`) et se supprime une fois la V3 confirmée.

## 1. La répétition sur la copie du jour

À faire le jour même, juste avant, ou la veille. La base ne répond plus pendant un export : viser une heure creuse.

```sh
mkdir -p sauvegardes
pnpm -s wrangler d1 export secret-santa --remote --no-data --output=sauvegardes/prod-schema.sql
pnpm -s wrangler d1 export secret-santa --remote --no-schema --output=sauvegardes/prod-donnees.sql
cat sauvegardes/prod-schema.sql sauvegardes/prod-donnees.sql > sauvegardes/prod.sql
pnpm v3:essai sauvegardes/prod.sql --garder
```

- `v3:essai` charge l'export, applique chaque migration qu'il n'a pas encore (de `0034` à `0042`, une transaction chacune, clés étrangères actives, comme D1), puis compare les deux bases.
- Il doit finir par « ✓ Tout est là, sous sa nouvelle forme, sans clé étrangère cassée. » La comparaison vérifie : autant d'événements que de groupes ; chaque Secret Santa avec ses participants, leur lien, s'ils ont ouvert leur enveloppe, et ses enveloppes (scellées, jamais lues) ; chaque liste avec ceux qui la tiennent, ses idées et ses coches ; une liste partagée par lien garde son lien ; les pistes devenues une liste réservée à celui qui a tiré ; une liste dont le partage était coupé devient un brouillon.
- Un écart, ou une erreur : **on ne publie pas**. On garde les fichiers et on demande à Claude Code.
- `--garder` laisse `sauvegardes/v3-essai-avant.sqlite` et `sauvegardes/v3-essai-apres.sqlite` pour les trois contrôles. On peut rejouer la comparaison seule : `pnpm v3:compare sauvegardes/v3-essai-avant.sqlite sauvegardes/v3-essai-apres.sqlite`.

### Les trois contrôles, sur la copie

Sur la base migrée (`sqlite3 -header sauvegardes/v3-essai-apres.sqlite`), chaque requête rend des lignes à regarder :

1. **Quelqu'un qui a tiré et n'a pas encore ouvert son enveloppe** : il est encore là, son Secret Santa toujours tiré, l'enveloppe toujours fermée.

   ```sql
   SELECT pa.slug AS evenement, s.label, ps.first_name, ps.email FROM participations p JOIN persons ps ON ps.id = p.person_id JOIN secret_santas s ON s.id = p.secret_santa_id JOIN parties pa ON pa.id = s.party_id WHERE s.status = 'drawn' AND p.view_count = 0;
   ```

2. **Quelqu'un qui avait écrit des pistes** : elles sont sa liste, dans l'événement du tirage, au stade `giver` (« celui qui m'a tiré »), avec autant d'idées.

   ```sql
   SELECT pa.slug AS evenement, ps.first_name, l.share_token AS lien, lp.visibility, (SELECT count(*) FROM gift_list_ideas i WHERE i.list_id = l.id) AS idees FROM participations p JOIN persons ps ON ps.id = p.person_id JOIN secret_santas s ON s.id = p.secret_santa_id JOIN parties pa ON pa.id = s.party_id JOIN gift_lists l ON l.id = p.gift_list_id JOIN gift_list_parties lp ON lp.list_id = l.id AND lp.party_id = s.party_id WHERE s.status <> 'closed' AND p.id IN (SELECT participation_id FROM wishes);
   ```

   Ceux qui n'ont pas de compte n'y sont pas : leurs pistes restent en lecture seule pour celui qui les a tirés (`migration.md`).

3. **Quelqu'un dont la liste était partagée par lien** : elle est publique (`shared_at` rempli), son lien n'a pas changé, ses idées et ses coches sont là.

   ```sql
   SELECT l.title, l.share_token AS lien, (SELECT count(*) FROM gift_list_ideas i WHERE i.list_id = l.id) AS idees, (SELECT count(*) FROM gift_claims c WHERE c.list_id = l.id) + (SELECT count(*) FROM gift_giver_claims g WHERE g.list_id = l.id) AS coches FROM gift_lists l WHERE l.shared_at IS NOT NULL;
   ```

Noter un cas de chaque (l'événement, le prénom, le lien) : on les revérifie en production.

## 2. Le jour même

1. **L'heure** : un soir de semaine, par exemple vers 22 h à Paris, loin de 9 h. Commencer juste après un quart d'heure (22 h 01) laisse quatorze minutes même si une tâche était oubliée.
2. **Construire la V3 d'avance**, sur la version à publier (la branche `v3`, ou `main` une fois `v3` fusionnée) :

   ```sh
   pnpm build
   ```

3. **Noter la version en ligne** (la V2), pour pouvoir y revenir : l'identifiant de la dernière ligne de

   ```sh
   pnpm -s wrangler deployments list
   ```

4. **Retirer les tâches planifiées** : tableau de bord Cloudflare → Workers & Pages → `secret-santa` → Settings → Trigger Events → supprimer les deux Cron Triggers (`0 8 * * *` et `*/15 * * * *`). Aucun email automatique ne part plus ; ceux que les gens déclenchent (lien de connexion, invitation) partent encore, c'est voulu.
5. **Sauvegarder** :
   - le signet de Time Travel, à noter quelque part hors de la base : `pnpm -s wrangler d1 time-travel info secret-santa` ;
   - si la répétition date de plus de quelques heures, refaire les deux exports de la partie 1 sous d'autres noms (`sauvegardes/avant-v3-schema.sql`, `sauvegardes/avant-v3-donnees.sql`).
6. **La migration** : `pnpm db:migrate` (c'est `wrangler d1 migrations apply secret-santa --remote`). Elle liste `0034` à `0042` et demande de confirmer. Si elle échoue en route : **ne pas déployer**, restaurer la base (partie 3, étape 2) et garder le message d'erreur.
7. **Le code, aussitôt** : `pnpm -s wrangler deploy` (le build de l'étape 2). Les deux tâches planifiées reviennent avec lui : le vérifier dans Trigger Events.
8. **Les trois contrôles en production**, avec les cas notés à la répétition :
   1. Dans le suivi d'un Secret Santa tiré que j'organise (`/admin/[événement]/editions/[id]`), ceux qui n'avaient pas ouvert leur enveloppe ne l'ont toujours pas ouverte. Ne rien « Découvrir » à la place de quelqu'un.
   2. Dans une fenêtre privée, `https://under-the-tree.party/l/<lien>` de la liste née de pistes demande de se connecter : elle n'est pas publique. Connecté avec un compte qui n'est pas dans ce Secret Santa, elle n'est « pas partagée avec toi ». (Seul celui qui a tiré cette personne la voit depuis sa page : on ne peut le vérifier qu'avec lui.)
   3. Dans une fenêtre privée, `https://under-the-tree.party/l/<lien>` d'une liste partagée par lien s'ouvre sans compte, avec ses idées, celles qui sont prises marquées.

   Les mêmes requêtes que sur la copie se lancent en lecture sur la production :

   ```sh
   pnpm -s wrangler d1 execute secret-santa --remote --command "SELECT …"
   ```

9. **Si tout va bien** : supprimer les exports (`rm sauvegardes/prod*.sql sauvegardes/avant-v3-*.sql sauvegardes/v3-essai-*.sqlite`) une fois la V3 confirmée, au plus tard quand le retour en arrière n'est plus envisagé.

## 3. Le retour en arrière

Si la V3 casse quelque chose qu'on ne répare pas dans l'heure. **Tout ce qui a été écrit sur la V3 depuis la migration est perdu** : le décider vite.

1. Retirer les tâches planifiées (partie 2, étape 4).
2. **La base** : la remettre au signet noté avant la migration.

   ```sh
   pnpm -s wrangler d1 time-travel restore secret-santa --bookmark=<le signet noté>
   ```

   La commande rend un nouveau signet : celui d'avant la restauration, pour la défaire si besoin.
3. **Le code d'avant, aussitôt** : la version notée à la partie 2, étape 3.

   ```sh
   pnpm -s wrangler rollback <l'identifiant de la version V2>
   ```

   Sinon, depuis `main` tel qu'il était (son dernier commit avant la fusion de `v3`) : `git switch --detach <ce commit> && pnpm deploy:prod`.
4. Vérifier que les deux tâches planifiées sont là (Trigger Events), sinon les remettre en redéployant `main`.
5. Vérifier la V2 : l'accueil, la page d'un Secret Santa par son lien, une liste par son lien.

**Sans Time Travel** (plus de sept jours, ou s'il refuse) : restaurer l'export dans une base neuve. Un export complet ne se recharge pas tel quel (« no such table: main.persons » : D1 écrit les tables dans un ordre qui casse les clés étrangères) ; le schéma puis les données, si.

```sh
pnpm -s wrangler d1 create secret-santa-retour
pnpm -s wrangler d1 execute secret-santa-retour --remote --file=sauvegardes/avant-v3-schema.sql
pnpm -s wrangler d1 execute secret-santa-retour --remote --file=sauvegardes/avant-v3-donnees.sql
```

Puis mettre le `database_id` de `secret-santa-retour` dans le `wrangler.toml` de `main`, et `pnpm deploy:prod` depuis `main`.

### Essayé le 22 novembre 2026, sur une copie

Une base de forme V2 (la base locale de `sauvegardes/state-v2`, montée à `0033`, avec en plus des pistes et un portrait sur un Secret Santa tiré et une coche « pour quelqu'un »), dans un dossier `--persist-to` à part :

1. sauvegarde : l'export complet, le schéma, les données (`wrangler d1 export --local`) ;
2. migration : `wrangler d1 migrations apply --local`, `0034` à `0042` ;
3. restauration dans une base vide : le schéma, puis les données (`wrangler d1 execute --local --file`) ; l'export complet, lui, est refusé (« no such table: main.persons ») ;
4. comparaison table par table avec la base d'avant : **identique** (72 tables et index), `d1_migrations` revenu à `0033` ;
5. le code de `main` (construit dans un `git worktree`) démarre sur la base restaurée : la page d'un Secret Santa par son lien (enveloppe toujours fermée), une liste par son lien sans compte, l'ancienne adresse des pistes.

Time Travel ne s'essaie pas en local : sa commande est celle de la documentation de Cloudflare.

## 4. Après

La bascule se fait sans mot aux utilisateurs : ni ligne en tête de « Quoi de neuf », ni email (Q-034).

- **Surveiller une journée** le tableau de bord (erreurs du serveur, emails rejetés).
