# L'accueil, la barre du bas et « Créer »

Décisions : `2026-11-20-on-cree-un-secret-santa-ou-une-liste.md`, `2026-11-20-un-onglet-creer.md`.
Maquettes : `V3Accueil`, `V3AccueilVide`, `V3AccueilAnnee`, `V3AccueilPlusOuvert`, `V3FeteNouvelle`, `V3FeteMembresReprendre`, `MenuAvatar`, `MenuAvatarOuvert`.

## La barre du bas

« Accueil », « Créer », « Quoi de neuf ». « Admin » en plus pour le super-admin.

- La pastille des nouveautés est sur « Quoi de neuf ».
- « Créer » est dessiné comme les deux autres onglets (une icône au trait, son nom dessous) : pas de rond rouge.
- Elle est sur toutes les pages qui l'ont aujourd'hui. Les onglets « Tirages » et « Listes » disparaissent.

## Le menu du compte

L'icône de la personne connectée remplace le burger, en haut à droite. Le menu : « Mon compte » en tête, avec le prénom et l'adresse ; « Langue » ; « Se déconnecter ».

## « Créer »

L'onglet ouvre un panneau du bas, « Créer », de deux lignes sans sous-titre :

1. **Un Secret Santa**
2. **Une liste**

On ne propose pas « Une fête » : la fête est la première étape des deux.

### Première étape d'un Secret Santa : « Pour quelle occasion ? »

Maquette : `V3TirageQuelleFete`. Un seul choix (un Secret Santa est dans une seule fête) :

- une des fêtes **que j'organise** ; une fête qui a déjà son Secret Santa de l'année reste proposée, ce sera un autre ;
- « Une autre occasion », qui crée une fête.

Les fêtes où je ne suis que membre ne sont pas proposées. Arrivé à la limite de 3 : `secret-santa.md`.

### Première étape d'une liste : « Qui verra ta liste ? »

Maquette : `V3ListeQui`. Voir `listes.md`. La ligne « Une autre occasion » crée une fête.

### « Une autre occasion » : l'écran où une fête se crée

Maquettes : `V3FeteNouvelle` (titre : « Pour quelle occasion ? »), `V3FeteMembresReprendre`.

1. La catégorie, en six tuiles : elle remplit le reste (`categories.md`).
2. Le nom, la date (trois listes, `regles-d-ecran.md`), « Elle revient chaque année ».
3. Les membres : « Reprendre les membres d'une autre fête » (on coche qui), pour ne pas réinviter les mêmes personnes à chaque occasion. « Inviter d'autres personnes » se fait par un lien, une fois la fête créée.

Puis on arrive droit sur le Secret Santa ou sur la liste qu'on venait créer. Si on s'arrête après cette étape, la fête existe : on peut y inviter.

## L'accueil

Maquette : `V3Accueil`.

- « Bonjour Hugo ».
- **Une section par saison de Noël** : « Noël 2026 · dans 35 jours ». C'est la catégorie qui regroupe : toutes mes fêtes de catégorie Noël de la même année vont sous ce titre, quel que soit leur nom. **Aucune autre catégorie n'est regroupée.**
  - Le décompte du titre ne dépend d'aucune fête : il compte jusqu'au **25 décembre à minuit**, toujours.
  - Dans la section, les fêtes sont dans l'ordre des dates, la plus proche en haut.
- **Une carte par fête** : l'emoji de sa catégorie, son nom, sa date, une flèche (l'en-tête ouvre la fête) ; dessous, ses Secret Santa et les listes de ses membres, au même niveau. Une liste dans deux fêtes apparaît dans les deux cartes (« aussi chez Mamie »).
- **« Bientôt »** : avec la date de naissance d'un proche, l'accueil propose à l'avance « L'anniversaire de Zoé · dans 24 jours · ses 4 ans », avec « Préparer ». Un toucher ouvre « Pour quelle occasion ? » déjà rempli.
- **« Plus tard »** : les autres fêtes, par date.
- En bas, deux lignes : **« Les fêtes passées »** et **« Ce que j'offre ailleurs »** (`listes.md`).

L'accueil fait office de calendrier : pas d'écran à part. Pas de rubrique « Reçues par un lien ». Pas de bouton « Nouvelle liste » ni « Nouvelle fête » en bas de page.

## L'accueil d'un compte tout neuf

Maquette : `V3AccueilVide`. Il ne parle pas de « fête ». Deux cartes :

- **Un Secret Santa** : « Chacun tire au sort la personne à qui il offre un cadeau. », bouton rouge « Organiser un Secret Santa ».
- **Une liste de cadeaux** : « Tes idées, que tes proches cochent pour ne pas offrir deux fois la même chose. », bouton « Écrire ma liste ».

Les deux mènent à « Pour quelle occasion ? » (les catégories).

## L'année suivante

Maquette : `V3AccueilAnnee`. Deux mois avant la date d'une fête qui revient :

- l'organisateur voit « Préparer Noël 2027 » sur la carte de la fête ; les membres sont repris ;
- chacun voit « Reprendre ma liste de l'an dernier ».

Une fête qui ne revient pas passe dans « Les fêtes passées » après sa date.
