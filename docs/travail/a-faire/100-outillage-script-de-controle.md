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

- [ ] `scripts/controle.ts` et le script `controle` dans `package.json` : enchaîne `pnpm lint`, `pnpm typecheck`, `pnpm test`, et s'arrête au premier échec avec un message clair.
- [ ] Parité des trois langues : toute clé de `shared/i18n/locales/fr` existe en `en` et en `de`, et inversement ; la liste des clés qui manquent s'affiche.
- [ ] Textes en dur : signaler une chaîne visible écrite dans un fichier de `app/` au lieu d'un dictionnaire (une heuristique simple suffit, avec une liste d'exceptions).
- [ ] Mots interdits : une liste dans un fichier à part (`scripts/controle.mots.json`), vide au départ pour la V2 ; chaque ticket de la V3 y ajoute les mots qu'il vient de faire disparaître (« groupe », « édition », « pistes »), pour qu'ils ne reviennent pas.
- [ ] Une option `--e2e` qui lance aussi `pnpm test:e2e`.
- [ ] Mettre `.claude/skills/controle/SKILL.md` d'accord avec ce que fait le script, et recopier le fichier dans `docs/travail/skills-claude-code/controle/SKILL.md` (`docs/travail/skills-claude-code/README.md`).

## Hors périmètre

- Un hook Git ou un hook de Claude Code : à voir une fois le script éprouvé.
- Comparer une page à sa maquette en image.

## C'est fini quand

- [ ] `pnpm controle` passe sur le code d'aujourd'hui.
- [ ] Une clé retirée d'une seule langue le fait échouer, avec le nom de la clé.
- [ ] `/controle` passe.

## Compte rendu

À remplir par Claude Code à la fin : ce qui a été fait, ce qui a été décidé seul (et pourquoi), les écarts avec les maquettes, les questions posées, les commits.
