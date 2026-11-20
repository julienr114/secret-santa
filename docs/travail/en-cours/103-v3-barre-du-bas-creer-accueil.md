# 103 — V3 : la barre du bas, « Créer » et l'accueil

- **Dépend de** : 101
- **Migration** : non
- **Maquettes** : `V3Accueil`, `V3AccueilVide`, `V3AccueilPlusOuvert`, `MenuAvatar`, `MenuAvatarOuvert`

## Objectif

L'accueil montre mes fêtes, avec leurs Secret Santa et les listes de leurs membres au même niveau. « Créer » est un onglet. L'icône du compte remplace le burger.

## À lire d'abord

- `docs/spec/v3/accueil-et-creation.md`
- `docs/spec/v3/regles-d-ecran.md`
- `docs/spec/v3/categories.md`
- `docs/decisions/2026-11-20-un-onglet-creer.md`
- `docs/decisions/2026-11-20-on-cree-un-secret-santa-ou-une-liste.md`

## À faire

- [x] La barre du bas : « Accueil », « Créer », « Quoi de neuf » (et « Admin »). Les onglets « Tirages » et « Listes » disparaissent.
- [x] Le menu du compte par l'icône de la personne connectée.
- [x] Le panneau « Créer » : « Un Secret Santa », « Une liste ».
- [x] L'accueil : la section « Noël <année> » et son décompte jusqu'au 25 décembre, les cartes de fête dans l'ordre des dates, « Bientôt » (les anniversaires proposés), « Plus tard », « Les fêtes passées », « Ce que j'offre ailleurs ».
- [x] L'accueil d'un compte tout neuf : deux cartes.
- [x] Les fonctions pures (regroupement par saison, ordre, décompte, anniversaires proposés) dans `shared/utils`, avec leurs tests.
- [x] `docs/ARBORESCENCE.md` à jour.

## Hors périmètre

- Les pages vers lesquelles l'accueil mène : fête (104), Secret Santa (105), listes (106). En attendant, les lignes mènent aux pages d'aujourd'hui.
- La page « Les fêtes passées » et « l'année suivante » (ticket 108).
- « Ce que j'offre ailleurs » : la ligne est là, sa page vient avec le ticket 106.

## C'est fini quand

- [ ] Un compte avec trois fêtes de Noël et un anniversaire voit l'accueil de `V3Accueil`.
- [ ] Un compte tout neuf voit `V3AccueilVide`.
- [ ] Un parcours Playwright ouvre « Créer » et arrive sur « Pour quelle occasion ? ».
- [ ] `/controle` passe.

## Compte rendu

À remplir par Claude Code à la fin : ce qui a été fait, ce qui a été décidé seul (et pourquoi), les écarts avec les maquettes, les questions posées, les commits.
