# Une date se choisit avec les trois listes du téléphone

20 novembre 2026 · décidé par Julien, en séance de conception.

## Contexte

La date d'une fête s'ouvrait dans un calendrier dessiné (`UCalendar` dans un panneau du bas). Julien préfère les roulettes du téléphone.

## Décision

Trois `<select>` natifs côte à côte, « Jour », « Mois », « Année », comme la date de naissance d'un proche. Pour toutes les dates : fête, Secret Santa, liste.

## Écarté

- Le calendrier dessiné.
- `<input type="date">` : sur les téléphones d'aujourd'hui, il ouvre un calendrier, pas des roulettes. Un seul sélecteur à trois roulettes n'existe pas en natif sur le web : ce sont trois listes, ouvertes l'une après l'autre.

## Où ça s'applique

`docs/spec/v3/regles-d-ecran.md`. Maquettes : `V3FeteNouvelle`, `ProcheNaissance`.
