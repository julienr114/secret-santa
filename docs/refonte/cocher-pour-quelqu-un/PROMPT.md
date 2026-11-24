# Cocher pour quelqu'un

Tu es sur `main`. Ce travail part en production **avant** la V3, qui se code sur la branche `v3`. Il n'a pas de ticket dans `docs/travail/` : tout ce qu'il faut savoir est dans ce fichier. Demandé par Julien le 21 novembre 2026.

## Le besoin

Mamie a dit au téléphone qu'elle prenait le vélo. Elle n'ouvrira jamais la liste. Aujourd'hui, celui qui tient la liste ne peut que cocher à son propre nom, et plus personne ne sait qui offre quoi.

Ceux qui tiennent une liste doivent pouvoir **dire qui offre une idée**, à la place de la personne : quelqu'un que l'application connaît, un prénom écrit, ou un prénom avec son adresse email. Ils doivent pouvoir ensuite **changer** la personne, et **en ajouter**. C'est le pendant de « Décocher pour quelqu'un », qui existe déjà.

## Ce qu'il ne faut pas toucher

- **Rester sur `main`.** Ne rien lire dans `docs/spec/v3/`, ne rien reprendre de la branche `v3`. La référence est le `README.md` (sections 22.19 et 22.20). Les mots restent ceux de `main`.
- **Une migration qui ne fait qu'ajouter** : des colonnes qui acceptent le vide, ou une table nouvelle. Aucune colonne retirée, renommée ou rendue obligatoire, aucune table recréée. Le code d'avant doit tourner sur la base d'après : c'est ce qui permet de revenir en arrière sans toucher à la base.
- **Aucun email, aucune notification**, pour personne, dans aucun cas.
- **Ne pas pousser, ne pas déployer.** Julien publie lui-même, après une sauvegarde de la base.

## À lire d'abord dans le code

- `README.md`, 22.19 et 22.20 : cocher dans le document, « Décocher pour quelqu'un », un cadeau à plusieurs, qui voit quoi, les pastilles sous une idée.
- `server/utils/claims.ts` (`canTick`, `canChange`, `mayRemoveClaim`, `removableClaims`, `leaderAfterLeaving`) : les règles vont là, en fonctions pures, testées d'abord.
- `app/components/lists/` : `IdeaLine`, `MineChip` (« Tu l'offres › »), `ClaimSheet` (le panneau d'aujourd'hui, « seul, à plusieurs »), `JoinSheet`.
- `app/components/ui/` : `Segmented`, `CheckRow`, `ChoiceList`, `Sheet`. **Se servir de ces composants**, ne pas en dessiner de nouveaux.

## Les maquettes

Six écrans, dans l'ordre du parcours. L'image `docs/refonte/cocher-pour-quelqu-un/ecrans.png` les montre côte à côte ; regarde-la d'abord.

Les fichiers HTML sont dans `docs/refonte/maquettes-sorbet/` s'ils sont encore là (ils ne sont pas dans Git) : `ListeCocherPourMoi`, `ListeCocherPourDepart`, `ListeCocherPourChoix`, `ListeCocherPourLigne`, `ListeCocherPour`, `ListeCocherPourAutre`. S'ils n'y sont plus, l'image et ce fichier suffisent.

**La barre du haut de ces maquettes est celle de la V3. Sur `main`, la barre du haut de la liste ne change pas.**

## Le parcours

1. **Je coche une idée libre.** Rien ne change : elle est à mon nom, d'un seul geste, la case passe au vert et la pastille « Tu l'offres › » apparaît dessous.
2. **Je touche « Tu l'offres › ».** Le panneau « Qui l'offre ? » s'ouvre. Pour ceux qui tiennent la liste, **il remplace le panneau d'aujourd'hui** (« seul, à plusieurs »). Un visiteur garde le panneau d'aujourd'hui.
3. **Je touche « Mamie ».** Elle prend ma place : un seul rond à la fois.
4. **« Enregistrer ».** La ligne dit « Mamie », comme si elle avait coché elle-même.
5. **Ensuite, les prénoms se touchent.** Pour ceux qui tiennent la liste seulement, la rangée des prénoms sous une idée cochée porte un filet, et une flèche sur le dernier prénom ; la toucher rouvre « Qui l'offre ? ». « Anonyme » et un cadeau hors liste ne se touchent pas.

## Le panneau « Qui l'offre ? »

De haut en bas :

- **Le titre**, « Qui l'offre ? ». Dessous, l'idée et pour qui (« Vélo 16 pouces · pour Léo »), puis la trace : « Coché par toi, aujourd'hui », « Coché par Mamie, le 12 novembre », « Noté par toi, le 21 novembre », ou « Proposé par Mamie, le 12 novembre » pour un cadeau à plusieurs.
- **« Une personne » ou « Plusieurs »**, avec `UiSegmented`. « Une personne » au départ ; « Plusieurs » si c'est déjà un cadeau à plusieurs.
- **Les prénoms**, dans cet ordre : « Moi » ; ceux qui offrent déjà cette idée ; ceux qui tiennent la liste avec moi (dessous : « Tient la liste avec toi ») ; ceux qui ont déjà coché sur cette liste sans être anonymes ; les prénoms déjà écrits sur cette liste (dessous : leur adresse, ou « Pas d'adresse email »).
  - Avec « Une personne » : un **bouton radio**, un seul choix à la fois.
  - Avec « Plusieurs » : une **case à cocher** carrée, autant qu'on veut.
  - Le radio et la case sont ceux de l'application, à la couleur du thème. Pas de case verte : le vert reste à ce que j'offre, dans la liste.
- **« Quelqu'un d'autre… »**, une ligne en fin de liste (voir plus bas).
- **« On est au complet »**, un interrupteur, **seulement avec « Plusieurs »**. Éteint au départ, avec dessous « D'autres peuvent encore se joindre ». Allumé : « Plus personne ne peut se joindre ». Ce sont les mots et la règle du cadeau à plusieurs d'aujourd'hui.
- **« Enregistrer »**.

Ce que fait « Enregistrer » :

- Une personne : elle l'offre seule.
- Plusieurs : ils l'offrent ensemble. C'est **le cadeau à plusieurs d'aujourd'hui**, avec ses règles et ce que chacun en voit. Moi seul avec « Plusieurs », c'est proposer le cadeau à plusieurs, comme aujourd'hui.
- Aucune case cochée : l'idée est décochée, avec « Annuler », comme pour « Décocher pour quelqu'un ».
- Revenir à « Une personne » alors que plusieurs cases sont cochées ne garde que la première.

## « Quelqu'un d'autre »

Un petit panneau, deux champs et un bouton :

- « Son prénom » (40 caractères).
- « Son adresse email (facultatif) ». Dessous : « Avec son adresse, il retrouvera ce cadeau en se connectant. Aucun email ne lui est envoyé. »
- « Ajouter ».

Les deux façons de faire restent possibles :

- **Un prénom seul** n'est relié à rien. Il est proposé ensuite dans le panneau, sur cette liste, pour ne pas le réécrire.
- **Un prénom avec son adresse** : la coche est gardée pour cette adresse. Elle devient celle de la personne dès qu'elle se connecte avec, qu'elle ait déjà un compte ou non. **Rien ne dit à celui qui écrit si l'adresse a déjà un compte**, et le prénom affiché reste celui qu'il a écrit.

## Les règles

- **Qui peut** : ceux qui tiennent la liste, aux deux niveaux (« Gère la liste », « Aide à écrire »), comme pour décocher pour quelqu'un. Un visiteur ne voit rien de tout ça.
- **Quelqu'un que l'application connaît** (il tient la liste, ou il y a déjà coché sans être anonyme) : la coche est la sienne. Il la voit chez lui comme « Tu l'offres » et peut la retirer.
- **Ceux qui tiennent la liste ont, sur un cadeau à plusieurs, les mêmes droits que celui qui l'a proposé** : changer qui en fait partie, le fermer (« On est au complet »), le rouvrir. Pour un visiteur, rien ne change : seul celui qui a proposé ferme.
- **Une coche anonyme ne se modifie pas** : on ne sait pas de qui elle est. Elle se décoche, comme aujourd'hui. Aucune réponse du serveur ne doit dire de qui elle est.
- **Un cadeau hors liste** ne se modifie pas par ce panneau.
- **Ce que voient les autres** ne change pas de règle : « C'est pris » pour un cadeau offert seul, les prénoms pour un cadeau à plusieurs.
- **La trace** : une coche garde qui l'a notée, et quand.
- Le compteur du haut (« 9 cadeaux déjà prévus ») compte ces coches comme les autres.

## Base

- Une coche peut être au nom d'un prénom écrit, sans compte, avec ou sans adresse.
- Elle garde qui l'a notée, et quand.
- L'adresse se garde comme les autres adresses de l'application ; une coche gardée pour une adresse se rattache au compte à la première connexion avec cette adresse.
- La migration prendra le numéro `0033`. La branche `v3` a déjà des migrations `0033` à `0037` : **dis-le dans ton compte rendu**, avec le nom des colonnes ajoutées, pour que Julien les reporte.

## Trois langues

Les textes français sont ceux de ce fichier. Écris l'anglais et l'allemand au ton de `docs/refonte/TEXTES.md`.

## C'est fini quand

- [ ] Je tiens la liste, je coche « Vélo » : il est à mon nom, d'un geste, comme avant.
- [ ] Je touche « Tu l'offres › », puis « Mamie » : « Moi » n'est plus choisi. J'enregistre : la ligne dit « Mamie ».
- [ ] Mamie avait déjà coché ailleurs sur la liste : elle voit « Tu l'offres » sur le vélo en ouvrant la liste, et peut décocher.
- [ ] J'écris « Tata », sans adresse. Un visiteur lit « C'est pris », sans prénom ; celui qui tient la liste avec moi lit « Tata ».
- [ ] J'écris « Parrain » avec son adresse. Il se connecte plus tard avec cette adresse et voit « Tu l'offres ». La réponse du serveur est la même que l'adresse ait déjà un compte ou non (un test le vérifie).
- [ ] Je choisis « Plusieurs » et je coche Mamie et Tonton : un visiteur peut se joindre. J'allume « On est au complet » : il lit « Offert à plusieurs · au complet » et ne peut plus.
- [ ] Je ferme un cadeau à plusieurs que Mamie avait proposé elle-même.
- [ ] Une coche anonyme n'ouvre pas le panneau, et aucune réponse du serveur ne dit de qui elle est (un test le vérifie).
- [ ] Aucun email ne part (un test le vérifie).
- [ ] La migration ne fait qu'ajouter ; les tests d'avant passent sans être modifiés, sauf ceux du panneau remplacé.
- [ ] Les règles ont leurs tests sur les fonctions pures ; un parcours dans `tests/e2e`.
- [ ] Le `README.md`, section 22.19, dit la nouvelle règle.
- [ ] `pnpm controle` passe.

## À la fin

Un compte rendu court : ce qui est fait, ce que tu as décidé seul et pourquoi, les écarts avec les maquettes, le numéro et le contenu de la migration, les commits. Si une règle te manque, pose la question à Julien plutôt que de la deviner.
