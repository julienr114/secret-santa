# Les catégories

Décision : `2026-11-20-les-categories.md`.

## Le principe

Une catégorie ne donne que des **réglages de départ**. Elle n'interdit rien (tout événement peut avoir un Secret Santa et des listes), tout reste modifiable, et on peut en changer ensuite.

## Ce qu'elle remplit

- l'icône de l'événement et **celle de ses listes** ;
- le nom proposé ;
- la date ;
- « revient chaque année » ;
- ce que l'événement propose en premier ;
- la forme de la liste (par personne, ou sans personne) ;
- « tout le monde avec un lien » suggéré ou non ;
- le mot d'accueil de départ d'une liste (un texte par catégorie) ;
- le regroupement « Noël <année> » sur l'accueil ;
- « Père Noël » ou non dans les textes du Secret Santa (`vocabulaire.md`).

## Les six

| Catégorie | Icône | Forme | Date | Revient | Proposé en premier |
|---|---|---|---|---|---|
| Noël | 🎄 | On s'offre tous | 25 décembre | Oui | Le Secret Santa |
| Anniversaire | 🎂 | Pour quelqu'un | La date de naissance du proche | Oui | Sa liste |
| Naissance | 🍼 | Pour un foyer | À saisir | Non | Une liste sans personne, lien public suggéré |
| Mariage | 💍 | Pour un foyer | À saisir | Non | Une liste sans personne, lien public suggéré |
| Crémaillère | 🏡 | Pour un foyer | À saisir | Non | Une liste sans personne |
| Autre | ✨ | Aucune | À saisir | Au choix | Rien de rempli ; icône au choix |

Trois formes derrière les catégories : « on s'offre tous » (un Secret Santa, chacun sa liste) ; « pour quelqu'un » (une liste pour une personne) ; « pour un foyer » (une liste sans personne, souvent publique, une seule fois).

## Pour un anniversaire

L'écran « Pour quelle occasion ? » propose « Pour qui ? » parmi mes proches. Le nom devient « L'anniversaire de Zoé », la date sa date de naissance cette année.

**L'événement retient ce proche** (`docs/decisions/2026-11-22-un-anniversaire-sait-pour-qui-il-est-fait.md`). Avec sa date de naissance, il dit son âge : « ses 4 ans » à côté de la date, « Ses 3 ans » pour une année passée, et « 7 cadeaux offerts à Zoé ». Pour moi-même, je lis « tes 40 ans » ; les autres lisent « ses 40 ans ». « Quelqu'un d'autre » ne retient personne, et l'événement ne dit pas d'âge. Si le proche est supprimé, l'événement garde son nom et perd l'âge.

## L'emoji et l'icône au trait

L'emoji d'une catégorie est réservé à **un événement précise**. Quand on parle d'un Secret Santa ou d'une liste en général (le panneau « Créer », l'accueil d'un compte tout neuf), on montre une icône au trait dans un carré teinté.

## L'icône d'un événement est une tuile en couleur

Julien, le 23 novembre 2026 : les icônes des événements étaient fades, au même niveau que celles des lignes dessous. Maquettes `V3Accueil`, `V3Fete`, `V3QuoiDeNeuf`, `V3FetesPassees`.

- **L'événement** : son emoji dans une tuile carrée aux coins arrondis, en **dégradé de la couleur de sa catégorie**, avec un liseré blanc et une ombre légère. 44 px dans une carte de l'accueil, 30 px dans « Quoi de neuf » et « Les événements passés », 28 px dans la barre du partage.
- **Les lignes dessous** (un Secret Santa, une liste, « Devine qui ») : l'icône au trait seule, **sans rond ni carré coloré**. C'est ce qui met l'événement en avant.
- **« Créer »** et l'accueil d'un compte tout neuf gardent leurs deux icônes dans un carré teinté : là, il n'y a pas d'événement au-dessus.

| Catégorie | Du clair | Au soutenu |
|---|---|---|
| Noël | `#d9f5df` | `#58c07a` |
| Anniversaire | `#fff0b8` | `#f4b82e` |
| Naissance | `#dcefff` | `#6eb0f2` |
| Mariage | `#f7dcec` | `#d977ae` |
| Crémaillère | `#ffe1d6` | `#f08a6c` |
| Autre | `#efe6fb` | `#a98be0` |

Le dégradé va du coin haut gauche au coin bas droit (150°), le soutenu juste après le bord. C'est la **catégorie** qui donne la couleur, même quand l'icône de l'événement a été choisie à la main.
