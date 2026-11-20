# Le travail se suit par tickets, la spec et les décisions à part

20 novembre 2026 · décidé par Julien, en séance de conception.

## Contexte

Tout vivait dans `docs/refonte/PLAN.md` : 2 465 lignes, 556 cases faites, 190 ouvertes, les décisions et les questions mélangées. Le `README.md` servait de spec, sur 2 385 lignes. La conception et Claude Code écrivaient dans le même fichier en même temps. Le dépôt n'avait ni `CLAUDE.md` ni skill : chaque lot se lançait par un prompt collé à la main.

## Décision

- Trois sortes de documents, chacune dans son dossier : `docs/spec/` (ce que l'application doit être), `docs/decisions/` (pourquoi), `docs/travail/` (ce qu'il y a à faire, un ticket par fichier, un dossier par état).
- `CLAUDE.md` à la racine et trois skills pour Claude Code : `/ticket`, `/controle`, `/question`.
- La conception reste dans l'application Claude, avec les maquettes dans l'artifact ; Claude Code code. Personne n'écrit dans les fichiers de l'autre.
- `PLAN.md` est gelé et gardé comme archive. Les lots encore ouverts deviennent des tickets qui y renvoient.
- Les tickets sont des fichiers dans le dépôt.

## Écarté

- Les tickets en issues GitHub : meilleur suivi sur un téléphone, mais il faudrait brancher la conception sur GitHub ; les fichiers se lisent des deux côtés sans rien connecter.
- Réécrire tout l'ancien plan et tout le README dans la nouvelle forme : trop long pour ce que ça apporte. Le README se découpe au fil des tickets.

## Où ça s'applique

`CLAUDE.md`, `.claude/skills/`, `docs/travail/README.md`, `docs/spec/README.md`.
