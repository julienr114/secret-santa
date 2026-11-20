# Un formulaire est tout en lignes, ou tout en champs

20 novembre 2026 · décidé par Julien, en séance de conception.

## Contexte

La création d'un Secret Santa avait des champs pleine largeur (le nom, le budget) au-dessus de lignes à chevron (le petit mot) : pas harmonieux.

## Décision

Dès qu'un écran a des lignes à chevron, tout y est en lignes : le nom à gauche, la valeur à droite, un chevron. Toucher une ligne ouvre sa page, sur le modèle de la fiche d'un proche (Correction 27 de l'ancien plan, README 23.3).

## Écarté

- Mélanger les deux.
- Écrire les champs sur place dans une fiche (déjà écarté pour la fiche d'un proche).

## Où ça s'applique

`docs/spec/v3/regles-d-ecran.md`. Maquette : `V3TirageNouveau`.
