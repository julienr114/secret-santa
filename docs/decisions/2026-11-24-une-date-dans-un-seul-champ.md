# Une date s'écrit dans un seul champ

24 novembre 2026 · décidé par Julien (Q-038, ticket 160). Remplace `2026-11-20-les-dates-en-trois-listes.md`.

## Contexte

Les trois listes « Jour », « Mois », « Année » marchent, mais font trois gestes. Julien voulait un seul champ : taper la date sur un ordinateur, et dans l'idéal des roulettes sur un téléphone. Claude Code a essayé trois pistes sur une page d'essai (`docs/travail/questions.md`, Q-038).

## Décision

La piste A : `UInputDate` de Nuxt UI partout, habillé comme nos champs, avec la date en toutes lettres dessous. Le détail est dans `docs/spec/v3/regles-d-ecran.md`, « Les dates ».

## Écarté

- B, nos propres roulettes sur téléphone en plus du champ : un composant à écrire et à rendre accessible, deux façons de faire à tester. Possible plus tard, par-dessus A.
- C, `<input type="date">` : il suit la langue du navigateur, pas celle de l'application, et ouvre un calendrier sur iPhone.

## Reste à vérifier

Sur un vrai iPhone et un vrai Android : le pavé numérique s'ouvre-t-il ? L'essai n'a été fait que sur des téléphones simulés.

## Où ça s'applique

`docs/spec/v3/regles-d-ecran.md`. Maquettes : `V3FeteNouvelle`, `ProcheNaissance`.
