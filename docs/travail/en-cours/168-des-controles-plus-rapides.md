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

- [ ] Chronométrer une fois `pnpm controle --e2e` étape par étape (les textes, le lint, les types, les tests unitaires, la construction, les migrations, les parcours), et noter les temps dans le compte rendu. Les refaire à la fin : le ticket se juge là-dessus.

## 1. Les parcours en parallèle

- [ ] **Construire une seule fois** : séparer la construction (`pnpm build`) du démarrage du serveur dans `scripts/e2e-server.sh`.
- [ ] **Plusieurs serveurs, chacun sa base** : N serveurs `wrangler dev` sur des ports voisins (3100, 3101…), chacun avec son dossier jetable (`--persist-to .wrangler/e2e-1`, `-2`…) et ses migrations. N = 4 par défaut, réglable par une variable d'environnement.
- [ ] **Répartir les fichiers** entre les serveurs (`--shard=i/N` de Playwright, ou un projet par serveur avec son `baseURL`), lancés en même temps ; le script attend les N, rend un seul résultat, et montre les échecs de chacun.
- [ ] Les tests qui dépendent d'un état commun (les comptes super-admin de `NUXT_SUPER_ADMIN_EMAILS`, les limites de débit, la tâche du matin `/__scheduled`, les fichiers en `mode: 'serial'`) restent justes : un fichier ne se partage jamais entre deux serveurs, et chaque serveur a sa base. Dire dans le compte rendu ce qui a dû être adapté.
- [ ] Un test qui échoue en parallèle et passe seul est un vrai défaut d'isolement : le corriger, ne pas le mettre de côté.
- [ ] `pnpm test:e2e` tout court marche toujours (un serveur, pour déboguer un fichier).

## 2. Pendant un ticket, seulement ce qu'il touche

- [ ] **`pnpm controle --vite`** (ou un nom mieux trouvé) : les trois contrôles de textes, le lint, les types, puis seulement les tests unitaires liés aux fichiers modifiés depuis `main` ou depuis le dernier commit (`vitest related` ou `--changed`), et seulement les fichiers de parcours qu'on lui nomme (`pnpm controle --vite tests/e2e/lists-*.spec.ts`).
- [ ] **La règle, dans le skill `/controle`** : pendant le ticket, `--vite` avec les parcours concernés ; **avant de dire « fini », la suite entière** (`pnpm controle --e2e`), une fois. Écrire comment choisir les parcours concernés (par le nom des pages et des composants touchés), et qu'un doute se règle en lançant tout.
- [ ] Le compte rendu d'un ticket dit toujours ce qui a été lancé, et que la suite entière est passée.

## 3. Les petits gains, s'ils sont gratuits

- [ ] Le cache d'ESLint (`--cache`, le fichier de cache ignoré par git).
- [ ] Ne pas reconstruire l'application quand rien n'a changé hors de `tests/` depuis la dernière construction.
- [ ] Laisser de côté tout ce qui demande plus d'une heure : le dire dans le compte rendu.

## Hors périmètre

- Supprimer ou alléger des tests.
- La CI (`ci.yml`) : dire seulement dans le compte rendu si elle peut reprendre le même découpage.

## C'est fini quand

- [ ] `pnpm controle --e2e` passe, avec les mêmes 224 tests, en nettement moins de temps (les deux mesures dans le compte rendu).
- [ ] Trois lancements de suite donnent le même résultat : pas de test devenu instable.
- [ ] Le skill `/controle` dit la nouvelle règle.
