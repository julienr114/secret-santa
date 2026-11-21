# Le Secret Santa

Décisions : `2026-11-20-secret-santa-garde-son-nom.md`, `2026-11-20-reglages-de-la-fete-et-du-secret-santa.md`, `2026-11-20-plus-de-demande-limite-de-trois.md`, `2026-11-20-pistes-et-listes-fusionnent.md`.
Maquettes : `V3TirageQuelleFete`, `V3TirageNouveau`, `V3TirageReglages`, `V3TirageLimite`, `V3TirageVersListe`, `V3TirageNeutre`, `V3ListeSurligne`.

C'est l'« édition » d'aujourd'hui : le tirage, ses règles, le suivi de l'organisateur, les envois, « Devine qui » et le journal ne changent pas (README, sections 5, 6, 9, 13). Change ce qui suit.

## Le créer

1. « Créer › Un Secret Santa », puis « Pour quelle occasion ? » (`accueil-et-creation.md`).
2. Le formulaire (`V3TirageNouveau`), **sans aucun champ écrit sur place** : six lignes de la même forme, la valeur à droite, un chevron.

| Ligne | Valeur de départ |
|---|---|
| Nom | « Noël 2027 » (la catégorie et l'année) |
| Date de la fête | la date de la fête cette année-là |
| Budget | celui du Secret Santa précédent |
| Devine qui | celui du Secret Santa précédent, sinon « Aucun pronostic » |
| Petit mot pour les participants | « Aucun » |
| Mot ajouté aux messages | celui du Secret Santa précédent, sinon « Aucun » |

Toucher une ligne ouvre sa page (`regles-d-ecran.md`). Sous les lignes : « 5 membres repris du Secret Santa 2026. », puis « Créer le Secret Santa ». On ajuste les participants sur l'écran suivant, comme aujourd'hui.

Il n'y a pas de réglage « Pistes de cadeaux » : voir plus bas.

## Ses réglages

Maquette : `V3TirageReglages`. Au-dessus du titre : « Famille Camille · Secret Santa 2026 ».

- **Le tirage au sort** : « Éviter la même personne ».
- **Devine qui** : « Pronostics » (aucun pronostic, « Qui m'offre ? », toutes les paires).
- **Les messages** : « Mot ajouté aux messages ».
- **M'écrire par email** : « Tout le monde a découvert son tirage » ; « Rappel 3 jours avant la fête », avec la liste de ceux qui n'ont pas encore ouvert.

Ces réglages sont recopiés du Secret Santa précédent quand on prépare celui de l'année suivante.

## La limite

3 Secret Santa par compte, 30 membres par fête (`modele.md`). Pas de demande.

Arrivé à la limite, « Créer › Un Secret Santa » montre (`V3TirageLimite`) : « Tu organises déjà 3 Secret Santa », « C'est le maximum pour un compte. », et les trois.

## Le résultat

Maquettes : `V3TirageVersListe`, `V3TirageNeutre`.

La carte « Tu offres un cadeau à Inès », puis « Pour t'aider à choisir » :

- une ligne **« La liste de cadeaux d'Inès »**, avec « Le mode anonyme y sera activé pour toi. ». On ne dit pas dans quelle fête est la liste ;
- ses goûts : ce qu'elle préfère, « En ce moment », « Ce qui lui servirait », « À éviter ». Ils viennent de sa fiche « Moi » dans « Mes proches ».

Si la personne n'a rien écrit : « Lui demander des idées », anonyme, comme aujourd'hui (`PistesResultatVide`, `PistesDemander`, `PistesResultatDemande`). L'email qu'elle reçoit (`PistesEmail`) l'invite à écrire sa liste : « Aide-la : écris ta liste de cadeaux, ou quelques mots sur ce que tu aimes. » · « Écrire ma liste ». Partout où cette demande s'affiche (accueil, « Quoi de neuf », menu du compte), elle dit « Quelqu'un te demande des idées », jamais un prénom.

Quand sa liste a bougé depuis ma dernière visite, la ligne de sa liste le dit : « 2 nouvelles idées depuis ta dernière visite » (`V3TirageNouvelles`).

Plus bas, pour moi : une ligne **« Ma liste de cadeaux »**, avec son état (« Vue seulement par celui qui m'a tiré »).

Hors d'une fête de catégorie Noël, la page ne dit jamais « Père Noël » (`vocabulaire.md`).

## Du résultat à la liste

Maquette : `V3ListeSurligne` (le nom du fichier est resté ; il n'y a pas de surlignage).

Celui qui m'a tiré arrive sur **la liste entière**, et **la page s'ouvre calée sur ma partie** : mon prénom en haut de l'écran, juste sous la barre du mode anonyme, déjà activé. Rien d'autre : ni fond, ni phrase.

## Les objets des emails

L'objet d'un email nomme la fête : « Famille Camille : ton enveloppe t'attend ». Quand la fête a plusieurs Secret Santa la même année, il ajoute le nom du Secret Santa entre parenthèses : « Famille Camille (les enfants) : ton enveloppe t'attend ». Le mot « Secret Santa » n'a pas besoin d'être dans l'objet.

## Ce qui disparaît

- La demande pour organiser, ses écrans, et la table `groupRequests` (`migration.md`).
- Le réglage « Pistes de cadeaux » de l'organisateur et la page « Mes pistes » du participant (`listes.md`).
