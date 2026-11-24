# 160 — Une date dans un seul champ

- **Dépend de** : 113 (après la bascule)
- **Migration** : non
- **Maquettes** : aucune encore (voir « D'abord, regarder »)

## Objectif

Julien, le 24 novembre 2026 : une date se choisit aujourd'hui avec trois listes côte à côte (« Jour », « Mois », « Année », `UiDateSelects`). Il voudrait **un seul champ** pour le jour, le mois et l'année, et dans l'idéal :

- **sur un téléphone**, les roulettes ;
- **sur un ordinateur**, taper la date directement au clavier (« c'est toujours le plus rapide »).

Ce qu'on sait déjà (`docs/decisions/2026-11-20-les-dates-en-trois-listes.md`) : `<input type="date">` ouvre un calendrier sur iPhone depuis iOS 14, pas des roulettes ; un sélecteur natif à trois roulettes n'existe pas sur le web. Les trois listes marchent : rien ne presse, d'où « après la bascule ».

## À lire d'abord

- `docs/spec/v3/regles-d-ecran.md`, « Les dates »
- `docs/decisions/2026-11-20-les-dates-en-trois-listes.md`
- `app/components/ui/DateSelects.vue` et ses quatre usages : `e/nouvelle.vue`, `e/[slug]/reglages/index.vue`, `admin/[slug]/editions/nouvelle/[champ].vue`, `famille/[id]/naissance.vue`

## D'abord, regarder (avant de coder)

Julien demande de voir si Nuxt UI n'a pas déjà quelque chose. Le projet est en `@nuxt/ui` 4.12, qui a :

- **`UInputDate`** : un seul champ, trois segments (jour, mois, année) qu'on remplit au clavier, dans l'ordre de la langue, avec `min-value` et `max-value`. C'est « un seul champ », sans roulettes.
- **`UCalendar`** : le calendrier dessiné, écarté le 20 novembre.
- **`UDrawer`** : un panneau du bas, qui pourrait porter nos propres roulettes.
- Pas de composant à roulettes.

À faire dans cette étape :

- [ ] Essayer `UInputDate` sur un vrai téléphone (iPhone et Android), dans les trois langues : le clavier qui s'ouvre (chiffres ?), l'ordre des segments, le passage d'un segment à l'autre, la lecture par un lecteur d'écran, une date de naissance (une année lointaine) et une date proche.
- [ ] Essayer `<input type="date">` sur les mêmes téléphones, pour dire ce que chacun ouvre aujourd'hui (calendrier ou roulettes).
- [ ] Essayer les deux **sur un ordinateur, au clavier seul** : taper « 20 12 2026 » d'une traite, sans souris, doit suffire (le passage d'un segment au suivant, la touche Tab, une date impossible).
- [ ] Écrire ce que ça donne dans `docs/travail/questions.md`, avec une capture de chaque, et **attendre la réponse** : c'est Julien qui choisit entre les trois pistes ci-dessous. La conception fera la maquette et mettra la spec à jour.

## Les trois pistes

1. **`UInputDate`** : un champ à trois segments, déjà là, à habiller comme nos champs. On y tape la date, sur un ordinateur comme sur un téléphone. Pas de roulettes.
2. **Une ligne qui ouvre notre panneau à trois roulettes** : la ligne dit « 20 décembre 2026 », un toucher ouvre un panneau du bas (`UiSheet` ou `UDrawer`) avec le jour, le mois et l'année qui défilent côte à côte (colonnes en `scroll-snap`). C'est ce que Julien décrit pour le téléphone ; c'est un composant à écrire et à rendre accessible (clavier, lecteur d'écran, `prefers-reduced-motion`). **Sur un ordinateur, il faudrait quand même un champ où taper** : cette piste se combine alors avec la 1 (les segments sur ordinateur, les roulettes sur téléphone).
3. **`<input type="date">` natif** : un champ, zéro code ; on y tape la date sur un ordinateur ; un calendrier sur iPhone.

## À faire (une fois la piste choisie)

- [ ] Un seul composant de date, à la place de `UiDateSelects`, dans ses quatre usages. Les mêmes règles qu'aujourd'hui : le mois en toutes lettres, les années proposées (de l'année en cours à dans deux ans pour un événement ; les années de naissance pour un proche), les jours qui suivent le mois et l'année, la valeur de départ donnée par la catégorie ou par l'événement.
- [ ] Trois langues, tests (unitaires pour les jours d'un mois, e2e pour chaque usage).
- [ ] Mettre à jour les tests qui passent par les trois listes.

## Hors périmètre

- Les heures (la fin de « Devine qui ») : pas concernées.

## C'est fini quand

- [ ] Chaque date de l'application se choisit dans un seul champ, de la même façon partout.
- [ ] Sur un ordinateur, une date se tape au clavier, sans souris.
- [ ] `/controle` passe.
