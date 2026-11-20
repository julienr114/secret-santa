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

- [x] Un compte avec trois fêtes de Noël et un anniversaire voit l'accueil de `V3Accueil`.
- [x] Un compte tout neuf voit `V3AccueilVide`.
- [x] Un parcours Playwright ouvre « Créer » et arrive sur « Pour quelle occasion ? ».
- [x] `/controle` passe.

## Compte rendu

**Fait.** La barre du bas (« Accueil », « Créer », « Quoi de neuf », « Admin » pour le super-admin), le menu du compte sur l'icône de la personne, le panneau « Créer » (ses deux lignes mènent à « Pour quelle occasion ? »), « Quoi de neuf » vide jusqu'au 120. L'accueil V3 : une section par saison de Noël avec son décompte jusqu'au 25 décembre, une carte par fête (Secret Santa et listes au même niveau), « Bientôt » (les anniversaires des proches à 60 jours, « Préparer » remplit « Pour quelle occasion ? »), « Plus tard », les deux lignes du bas ; l'accueil d'un compte tout neuf, deux cartes. Fonctions pures dans `shared/utils/homeParties.ts`, chargement en quelques requêtes dans `server/database/homeParties.ts` (`/api/home`), testé sur une vraie base. L'accueil d'avant est retiré (carte du haut, cartes de tirage et de groupe, état de la demande, changement d'icône), avec ses fonctions et ses textes ; `/api/auth/home` ne garde que ce que « Tirages passés » et « Nouveau groupe » lisent.

**Décidé seul (le détail est dans `ECARTS-MAQUETTES.md`).**
- « Langue » ouvre un panneau du bas : le sous-menu ne tient pas sur un écran de 390 px (il se déplaçait sans fin, un parcours le montrait).
- Une fête qui revient se montre à sa prochaine date une fois son année passée ; une fête qui ne revient pas quitte l'accueil le lendemain (en attendant Q-009).
- Toutes les fêtes qui ne sont pas Noël vont sous « Plus tard », même avant Noël (Q-014).
- « Bientôt » ne propose ni mon propre anniversaire ni celui qu'une de mes fêtes « Anniversaire » couvre déjà le même jour.
- Une ligne de Secret Santa ouvre ma page si j'y participe, sinon l'édition pour l'organisateur.
- « Les fêtes passées » ouvre « Tirages passés », « Ce que j'offre ailleurs » ouvre `/listes`, jusqu'aux tickets 108 et 106.
- Ce que l'accueil d'avant disait et qui ne se dit plus nulle part en attendant d'autres tickets : les nouvelles pistes et le dévoilement d'un tirage (ticket 110 ; le résultat dévoilé ne s'écrit plus jamais sur l'accueil, comme le veut la spec), l'état d'une demande de groupe et le mot du refus (les demandes partent au 105). Les parcours correspondants sont retirés.

**Questions.** Q-014 (une fête avant Noël qui n'est pas Noël). Les lignes attendent toujours leurs textes (Q-010). La spec `accueil-et-creation.md` de la conception renvoie à « Q-013 » pour la durée d'une fête sur l'accueil : c'est la Q-009.

**Commits.** 44e7ce3, f5189c6, ce6984f, 3b25630, 84fc518 (et c365ea6 pour les numéros des questions du 104).
