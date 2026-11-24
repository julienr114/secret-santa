# 168 — Des contrôles plus rapides

- **Dépend de** : rien
- **Migration** : non
- **Maquettes** : aucune (c'est de l'outillage)

## Objectif

Julien, le 24 novembre 2026 : « les contrôles durent de plus en plus longtemps ». `pnpm controle --e2e` joue 224 tests de parcours (56 fichiers) un par un (`workers: 1` dans `playwright.config.ts`), sur une application reconstruite à chaque lancement, et tout est rejoué à chaque ticket. Deux changements : jouer les parcours en parallèle, et ne jouer pendant un ticket que ce qu'il touche.

**Aucune vérification n'est retirée.** À la fin d'un ticket, tout passe toujours.

## À lire d'abord

- `scripts/controle.ts`, `scripts/e2e-server.sh`, `playwright.config.ts`
- `.claude/skills/controle/SKILL.md` (la règle d'aujourd'hui)
- `.github/workflows/ci.yml`

## D'abord, mesurer

- [x] Chronométrer une fois `pnpm controle --e2e` étape par étape (les textes, le lint, les types, les tests unitaires, la construction, les migrations, les parcours), et noter les temps dans le compte rendu. Les refaire à la fin : le ticket se juge là-dessus.

## 1. Les parcours en parallèle

- [x] **Construire une seule fois** : séparer la construction (`pnpm build`) du démarrage du serveur dans `scripts/e2e-server.sh`.
- [x] **Plusieurs serveurs, chacun sa base** : N serveurs `wrangler dev` sur des ports voisins (3100, 3101…), chacun avec son dossier jetable (`--persist-to .wrangler/e2e-1`, `-2`…) et ses migrations. N = 4 par défaut, réglable par une variable d'environnement.
- [x] **Répartir les fichiers** entre les serveurs (`--shard=i/N` de Playwright, ou un projet par serveur avec son `baseURL`), lancés en même temps ; le script attend les N, rend un seul résultat, et montre les échecs de chacun.
- [x] Les tests qui dépendent d'un état commun (les comptes super-admin de `NUXT_SUPER_ADMIN_EMAILS`, les limites de débit, la tâche du matin `/__scheduled`, les fichiers en `mode: 'serial'`) restent justes : un fichier ne se partage jamais entre deux serveurs, et chaque serveur a sa base. Dire dans le compte rendu ce qui a dû être adapté.
- [x] Un test qui échoue en parallèle et passe seul est un vrai défaut d'isolement : le corriger, ne pas le mettre de côté.
- [x] `pnpm test:e2e` tout court marche toujours (un serveur, pour déboguer un fichier).

## 2. Pendant un ticket, seulement ce qu'il touche

- [x] **`pnpm controle --vite`** (ou un nom mieux trouvé) : les trois contrôles de textes, le lint, les types, puis seulement les tests unitaires liés aux fichiers modifiés depuis `main` ou depuis le dernier commit (`vitest related` ou `--changed`), et seulement les fichiers de parcours qu'on lui nomme (`pnpm controle --vite tests/e2e/lists-*.spec.ts`).
- [x] **La règle, dans le skill `/controle`** : pendant le ticket, `--vite` avec les parcours concernés ; **avant de dire « fini », la suite entière** (`pnpm controle --e2e`), une fois. Écrire comment choisir les parcours concernés (par le nom des pages et des composants touchés), et qu'un doute se règle en lançant tout.
- [x] Le compte rendu d'un ticket dit toujours ce qui a été lancé, et que la suite entière est passée.

## 3. Les petits gains, s'ils sont gratuits

- [x] Le cache d'ESLint (`--cache`, le fichier de cache ignoré par git).
- [x] Ne pas reconstruire l'application quand rien n'a changé hors de `tests/` depuis la dernière construction.
- [x] Laisser de côté tout ce qui demande plus d'une heure : le dire dans le compte rendu.

## Hors périmètre

- Supprimer ou alléger des tests.
- La CI (`ci.yml`) : dire seulement dans le compte rendu si elle peut reprendre le même découpage.

## C'est fini quand

- [x] `pnpm controle --e2e` passe, avec les mêmes 224 tests, en nettement moins de temps (les deux mesures dans le compte rendu).
- [x] Trois lancements de suite donnent le même résultat : pas de test devenu instable.
- [x] Le skill `/controle` dit la nouvelle règle.

## Compte rendu

**Les temps**, sur l'ordinateur de Julien (16 Go, 8 cœurs), sur secteur, économie d'énergie coupée, avec les mêmes 223 tests de parcours. Une première série, faite en économie d'énergie sans le savoir, donnait des chiffres plus lents et instables (637 s avant ; 4 serveurs saturaient la mémoire) : elle a été refaite.

| `pnpm controle --e2e` | Total | Textes | Lint | Types | Unitaires | Construction | Parcours |
|---|---|---|---|---|---|---|---|
| **Avant** (un serveur, construction à chaque fois, lint sans cache) | **485 s** | 0,3 s | 8,0 s | 18,3 s | 4,5 s | 32 s | 453 s (construction comprise) |
| 2 serveurs | 260 s | 0,1 s | 2,1 s | 16,7 s | 3,4 s | 0 s (gardée) | 237 s |
| **3 serveurs (par défaut)** | **218 s** | 0,1 s | 1,6 s | 16,2 s | 3,5 s | 0 s (gardée) | 196 s |
| 4 serveurs | 210 s | 0,1 s | 1,8 s | 16,3 s | 3,4 s | 0 s (gardée) | 189 s |

Les migrations de chaque serveur (environ 18 s) se font en parallèle, au démarrage du serveur. **Pendant un ticket**, `pnpm controle --vite` avec quelques parcours : 129 s mesurées pour dix parcours, construction comprise (en économie d'énergie).

- **Les parcours en parallèle** (`scripts/e2e.ts`) : l'application est construite une fois (pas du tout si rien n'a changé hors de `tests/` et `docs/` depuis la dernière : une empreinte du commit et des changements, dans `.output/.e2e-stamp`) ; puis `E2E_SERVERS` copies de Playwright (3 par défaut), chacune avec `--shard=i/N` et son serveur (`scripts/e2e-server.sh` prend `E2E_PORT`, sa base `.wrangler/e2e-<port>`, son port d'inspection, et saute la construction avec `E2E_SKIP_BUILD=1`), son dossier de résultats (`test-results/e2e-<port>`). Un fichier n'est jamais coupé entre deux parties (les fichiers `serial` gardent leur ordre et leur serveur) ; chaque serveur a sa base, donc ses comptes super-admin, ses limites et sa tâche du matin. Le script attend toutes les parties, dit le compte de chacune et montre les échecs de chaque partie.
- **`pnpm test:e2e` tout court** marche toujours : un serveur, pour déboguer un fichier.
- **`pnpm controle --vite [parcours…]`** : les textes, le lint, les types, les tests unitaires liés aux fichiers changés depuis `main` (`vitest related`, commités ou non), et seulement les parcours nommés. `pnpm controle` dit le temps de chaque étape.
- **Le cache d'ESLint** (`node_modules/.cache/eslint/`, déjà ignoré) : 8 s → 2 s.
- **Le skill `/controle`** dit la règle : `--vite` pendant le ticket, avec les parcours concernés (comment les choisir ; un doute se règle en lançant tout) ; **la suite entière avant de dire « fini »** ; le compte rendu dit ce qui a été lancé.
- **Ce qui a dû être adapté** : `seedSql` (les tests qui écrivent en base) écrivait dans `.wrangler/e2e` : il suit maintenant le port de son serveur.
- **Les défauts que le parallèle a montrés**, corrigés (commit à part, `fix(lists)`), aucun mis de côté :
  - une idée tout juste écrite était refaite sous les doigts à la réponse du serveur (sa clé d'affichage changeait) : le champ perdait ce qu'on écrivait (`lists.spec.ts`) ; elle garde maintenant sa clé (`lineKey`) ;
  - le petit mouvement d'un texte changé jouait sur toutes les lignes, 0,4 s après l'ouverture d'une liste ; axe le prenait en plein (`lists-last-touches.spec.ts`) ; il ne joue plus que sur un texte qui a changé, et le test attend la fin des animations ;
  - le direct relisait la liste au milieu de coches en route, et montrait un état entre deux (`lists-tick-at-once.spec.ts`, déjà vu instable avant ce ticket) : il attend maintenant la fin des changements de la page.
- **Trois lancements de suite** (2, 3 et 4 serveurs, sur secteur) : les 223 passent les trois fois.
- **La CI** (`ci.yml`) peut reprendre le découpage : une matrice de N tâches, chacune `playwright test --shard=${{ matrix.i }}/N` avec son serveur (le `webServer` de la configuration). Pas fait ici (hors périmètre).
- Laissé de côté : `isolate: false` de Vitest (il annonce environ 3 s de moins, mais change l'isolement des tests unitaires).

