# Les règles communes aux écrans

Décisions : `2026-11-20-le-moins-de-phrases-possible.md`, `2026-11-20-les-dates-en-trois-listes.md`, `2026-11-20-des-lignes-pas-des-champs.md`.
S'ajoutent au design system (README, section 23), sans le remplacer.

## Le moins de phrases possible

Aucune phrase écrite pour expliquer l'écran à celui qui l'a conçu. Ne reste que ce qui sert à la personne, là où elle est :

- **un état** : « Réservé au super-admin », « Seul celui qui m'a tiré la voit » ;
- **une conséquence, avant un geste qu'on ne rattrape pas** : ce qui sort et ce qui reste quand on quitte un événement, « L'ancien ne marchera plus » ;
- **une information sur ses données** : le compte qui vient d'être créé, « Tes données, en clair ».

Ce qui ne s'écrit pas : « Chaque réglage s'enregistre dès qu'il est validé », « Envoyé à chaque organisateur, dans sa langue », un sous-titre qui redit le titre d'une ligne, la raison d'une valeur déjà visible (« Repris de Noël 2026 »).

Dans un champ vide, c'est le placeholder qui fait le travail d'une phrase d'aide (README 23.3).

## Des lignes, pas des champs

Un formulaire ne mélange pas des champs pleine largeur et des lignes. Dès qu'un écran a des lignes à chevron, **tout y est en lignes** : le nom de la ligne à gauche, sa valeur à droite, un chevron. Toucher une ligne ouvre **sa page** (pas un panneau), sur le modèle de la fiche d'un proche (README 23.3) : au-dessus du titre, d'où l'on vient ; le titre ; le champ ; « Valider » dans la page, sous le champ ; « Retour » abandonne.

Exemple : la création d'un Secret Santa (`V3TirageNouveau`).

### Un texte court s'écrit sur sa ligne

Julien, le 24 novembre 2026 : pour un prénom ou un nom, ni panneau ni page, « on peut le taper direct ». Maquettes `V3TirageNouveau` (au repos), `V3TirageNouveauEcrire` (on écrit), `Compte`, `GroupePersonne` (la fiche d'un membre).

- **Quoi** : une ligne dont la valeur est **un texte d'une ligne** (un prénom, un nom, une adresse email). **Un choix, une date ou un texte long ouvre sa page**, comme avant.
- **Au repos** : la ligne n'a **pas de flèche**, et sa valeur est **à l'encre**, pas en gris. Une valeur vide garde son invite en gris (« Ajouter »).
- **On la touche** : on écrit là, le curseur au bout de la valeur, le clavier s'ouvre. **La ligne reste blanche et ne bouge pas** : seuls **son label et sa bordure passent au rouge** de l'application. La bordure suit les traits qui existent déjà, de la même épaisseur, et les coins de la carte quand c'est sa première ou sa dernière ligne. Pas de fond teinté, pas de carte qui flotte.
- **Enregistrer** : la touche « OK » ou Entrée, ou toucher ailleurs. Un message en bas, « Enregistré ». Rien n'est envoyé si la valeur n'a pas changé.
- **Annuler** : Échap. Une valeur obligatoire qu'on a vidée reprend l'ancienne.
- **Une erreur** : sous la ligne, dans la carte ; la ligne reste ouverte.
- **Pas de phrase d'aide** : sur place, il n'y a pas d'endroit pour elle. Si elle manque vraiment, elle passe en placeholder.
- **Ce que l'écriture déclenche se dit sous la ligne, pendant qu'on écrit** et seulement là : sous « Adresse email » d'un membre, « Cette personne recevra un email qui dit que c'est toi qui l'as ajoutée. Elle pourra refuser les emails de l'application. ».
- **Un écran dont tout s'écrit sur place n'a pas de bouton « Enregistrer »** : chaque ligne s'enregistre seule.
- **Où** : « Prénom » et « Nom de famille » dans « Mon compte » ; **« Prénom », « Adresse email » et « Nom de famille » sur la fiche d'un membre**, les trois de la même façon (Julien : « le même type d'input »), dans une seule carte avec « Langue de ses messages », qui garde sa flèche ; « Nom » d'un Secret Santa, dans ses réglages comme à sa création.
- **Le budget n'en fait pas partie** : il ouvre une page qui fait des propositions (`secret-santa.md`).

Un écran sans aucune ligne garde ses champs sur place (« Pour quelle occasion ? », `V3FeteNouvelle`).

**Un panneau ne porte jamais de champ où écrire** (rappelé par Julien le 24 novembre 2026, devant « Nouvel organisateur »). Un panneau propose des choix ou demande une confirmation ; dès qu'il faut écrire, c'est sur la ligne (un texte court) ou sur une page. **Exception : dans une liste, les petites saisies restent dans leur panneau** (Julien : « c'est des petits trucs ») : le prénom de « Quelqu'un d'autre », « Qui l'offre ? » pour quelqu'un d'autre, la note quand on coche un cadeau. Les confirmations à recopier, les nombres, l'heure et la recherche restent aussi où ils sont. Le recensement : `docs/decisions/2026-11-24-ou-l-on-ecrit-ligne-page-panneau.md`.

## Les dates

Toute date se choisit avec **trois listes du téléphone**, côte à côte : « Jour », « Mois », « Année ». Trois `<select>` natifs, comme la date de naissance d'un proche (`app/pages/famille/[id]/naissance.vue`).

- Le mois en toutes lettres.
- Les années : de l'année en cours à dans deux ans.
- Les jours suivent le mois et l'année.
- Les trois listes arrivent déjà remplies par la catégorie (Noël : le 25 décembre) ou par la date de l'événement.

Pas de calendrier dessiné : `AdminDateField` et son `UCalendar` en panneau du bas sont remplacés, pour la date d'un événement, d'un Secret Santa et d'une liste. Pas de `<input type="date">` : sur les téléphones, il ouvre un calendrier.

## L'en-tête d'une carte se touche

Sur l'accueil, l'en-tête d'une carte d'événement ouvre l'événement : il porte la même flèche que les lignes du dessous, après la date.

## Un écran qui arrive

Maquettes : `V3ChargementAccueil`, `V3ChargementFete`, `V3ChargementQuoiDeNeuf` ; celles d'avant restent valables pour ce qui n'a pas changé (`ChargementListe`, `ChargementTirage`, `ChargementJournal`, `ChargementPanneau`, `ChargementBouton`, `ChargementReglage`).

- **Tout écran qui attend ses données montre un squelette** : des pièces grises à la place et à la taille de ce qui arrive, avec le composant qui existe (`UiSkeleton`). Jamais une page vide, jamais une roue seule au milieu.
- **Le squelette a la forme de l'écran d'aujourd'hui.** Un nouvel écran a le sien ; un écran redessiné change le sien. Trois blocs gris qui ne ressemblent à rien ne sont pas un squelette.
- La barre du haut et la barre du bas sont déjà là : seul le contenu est en squelette. Le titre de la page, quand on le connaît sans attendre (« Membres », « Réglages »), est écrit pour de bon.
- L'accueil : le bonjour, le titre de la saison, puis des cartes d'événement, chacune avec son en-tête et ses lignes. La page d'un événement : la catégorie, le nom, la date, la ligne des membres, puis les sections et leurs lignes. « Quoi de neuf » : le titre, puis une section par événement.
- Un panneau qui attend son contenu, un bouton qui travaille, un réglage qui s'enregistre : comme aujourd'hui.
- Pour un lecteur d'écran, la zone est occupée et dit « Chargement », comme `UiSkeleton` le fait déjà.
- Un écran déjà affiché qui se met à jour ne repasse pas par son squelette.

## Ce qui reste vrai

Mobile seulement, cibles de 44 px, pas de mode sombre, pas de lien rouge souligné pour une action (une action est une ligne ou un bouton), pas de texte « volant » hors d'une ligne ou d'une pastille, le moins de pastilles et de cadres possible.
