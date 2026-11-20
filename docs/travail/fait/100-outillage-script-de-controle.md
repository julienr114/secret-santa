# 100 — Un script de contrôle unique, `pnpm controle`

- **Dépend de** : aucun
- **Migration** : non
- **Maquettes** : aucune

## Objectif

Avoir une seule commande qui dit si un ticket peut être déclaré fini, pour que `/controle` ne dépende pas de la mémoire de celui qui le lance.

## À lire d'abord

- `.claude/skills/controle/SKILL.md`
- `docs/spec/v3/vocabulaire.md`

## À faire

- [x] `scripts/controle.ts` et le script `controle` dans `package.json` : enchaîne `pnpm lint`, `pnpm typecheck`, `pnpm test`, et s'arrête au premier échec avec un message clair.
- [x] Parité des trois langues : toute clé de `shared/i18n/locales/fr` existe en `en` et en `de`, et inversement ; la liste des clés qui manquent s'affiche.
- [x] Textes en dur : signaler une chaîne visible écrite dans un fichier de `app/` au lieu d'un dictionnaire (une heuristique simple suffit, avec une liste d'exceptions).
- [x] Mots interdits : une liste dans un fichier à part (`scripts/controle.mots.json`), vide au départ pour la V2 ; chaque ticket de la V3 y ajoute les mots qu'il vient de faire disparaître (« groupe », « édition », « pistes »), pour qu'ils ne reviennent pas.
- [x] Une option `--e2e` qui lance aussi `pnpm test:e2e`.
- [x] Mettre `.claude/skills/controle/SKILL.md` d'accord avec ce que fait le script, et recopier le fichier dans `docs/travail/skills-claude-code/controle/SKILL.md` (`docs/travail/skills-claude-code/README.md`).

## Hors périmètre

- Un hook Git ou un hook de Claude Code : à voir une fois le script éprouvé.
- Comparer une page à sa maquette en image.

## C'est fini quand

- [x] `pnpm controle` passe sur le code d'aujourd'hui.
- [x] Une clé retirée d'une seule langue le fait échouer, avec le nom de la clé.
- [x] `/controle` passe.

## Compte rendu

**Fait.** `pnpm controle` (`scripts/controle.ts`) lance d'abord les contrôles de texte, qui prennent quelques secondes : les trois langues, les mots interdits, les textes en dur. Ensuite viennent `lint`, `typecheck` et `test`, puis `test:e2e` avec `--e2e`. Il s'arrête au premier échec et dit ce qui manque. La logique tient dans des fonctions pures (`scripts/controle-checks.ts`), testées à côté. `vitest.config.ts` inclut désormais `scripts/**/*.test.ts`. Sur le code d'aujourd'hui, tout passe. Une clé retirée de `de/common.ts` le fait échouer (code 1), avec `de : common.actions.logout`.

**Décidé seul.**
- Les contrôles de texte passent avant `lint`, `typecheck` et `test`, parce qu'ils sont rapides et que leur message est le plus précis.
- Les dictionnaires se lisent fichier par fichier : `index.ts` importe sans extension, ce que Node ne sait pas résoudre. Le nom du fichier sert de nom d'espace (`common.ts` donne `common`). La parité se contrôle dans les deux sens : le français n'est pas la seule référence.
- Les textes en dur ne se cherchent que dans les gabarits des `.vue` : texte entre balises, et valeur fixe de `label`, `placeholder`, `title`, `aria-label`, `alt`, `description`. Le `<script>`, `app/**/*.ts` et les emails n'y sont pas. Le skill le dit.
- Les exceptions sont rangées dans `scripts/controle.exceptions.json` : le guide de style en entier (une page interne, écrite en français exprès) et le texte d'exemple « https://… ».
- `scripts/controle.mots.json` est une simple liste, vide pour l'instant. Un mot se reconnaît au début d'un mot, sans tenir compte de la casse : « groupe » trouve « Groupes », mais pas « regroupé ». Les mots valent pour les trois langues, donc chaque ticket ajoute aussi « group » et « Gruppe ».
- `pnpm typecheck` échouait déjà sur `main` : `nuxt.config.ts` importe `node:fs`, `node:path` et `node:url` depuis le 17 novembre, et `@types/node` n'était pas installé. J'ai ajouté `@types/node@^22` (le moteur est Node 22) dans un commit séparé.

**Non lancé.** `pnpm controle --e2e` : le ticket ne touche aucun parcours. L'option ne fait qu'ajouter `pnpm test:e2e` à la suite.

**Écarts avec les maquettes, questions.** Aucun.

**Commits.** `2413bc9` fix(types) ; puis le commit du script, avec ce ticket.
