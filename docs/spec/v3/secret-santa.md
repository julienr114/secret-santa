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
| Date | la date de l'événement cette année-là |
| Budget | celui du Secret Santa précédent |
| Devine qui | celui du Secret Santa précédent, sinon « Aucun pronostic » |
| Petit mot pour les participants | « Aucun » |
| Mot ajouté aux messages | celui du Secret Santa précédent, sinon « Aucun » |

Toucher une ligne ouvre sa page (`regles-d-ecran.md`). Sous les lignes : « 5 membres repris du Secret Santa 2026. », puis « Créer le Secret Santa ». On ajuste les participants sur l'écran suivant, comme aujourd'hui.

Il n'y a pas de réglage « Pistes de cadeaux » : voir plus bas.

## Ses réglages

Maquette : `V3TirageReglages`. Au-dessus du titre : « Famille Camille · Secret Santa 2026 ».

- **Le Secret Santa**, en premier : « Nom », « Date », « Budget », « Petit mot pour les participants ». Ce sont les lignes du formulaire de création, dans le même ordre : ce qui s'y règle se change ici, et nulle part ailleurs (Q-015).
- **Le tirage au sort** : « Éviter la même personne ».
- **Devine qui** : « Pronostics » (aucun pronostic, « Qui m'offre ? », toutes les paires).
- **Les messages** : « Mot ajouté aux messages ».
- **M'écrire par email** : « Quelqu'un s'inscrit par le lien » ; « Tout le monde a découvert son tirage » ; « Rappel 3 jours avant le jour J », avec la liste de ceux qui n'ont pas encore ouvert.
  - Ce que l'organisateur reçoit quand quelqu'un s'inscrit, en nouveauté comme en objet d'email : **« Hugo s'inscrit par le lien »**, au présent, avec le nom du Secret Santa entre parenthèses quand l'événement en a plusieurs cette année-là (« Hugo s'inscrit par le lien (Les adultes) »). Jamais « s'est inscrit » : l'application ne connaît pas le genre (Q-028).
  - De même, la nouveauté de celui qu'on ajoute dit **« Camille t'ajoute au Secret Santa »**, au présent, jamais « t'a ajouté » (Q-030). La règle vaut pour toute nouveauté : le présent, quand le passé demanderait un accord.

Ces réglages sont recopiés du Secret Santa précédent quand on prépare celui de l'année suivante.

## Choisir les participants

Maquettes : `AjouterParticipants`, `V3FeteMembresReprendre`. C'est par là, et par le lien, qu'on entre dans un événement du côté d'un Secret Santa (`fete.md`, « Les membres »).

- Les membres de l'événement, à cocher. Dans un événement tout neuf, il n'y a que moi.
- **« Créer une personne »** · « Elle rejoint l'événement et ce Secret Santa » : un prénom, une adresse facultative.
- **« Inviter par lien »** · « Chacun s'inscrit lui-même » (plus bas).
- **« Reprendre ceux d'un autre événement »** · « Tu coches qui » : la page « Qui reprendre ? », mes autres événements en pastilles, leurs membres à cocher, « Ajouter · 4 personnes ». Ceux que je coche deviennent participants, donc membres.

## Inviter par lien

Décision : `2026-11-21-le-lien-d-invitation-est-celui-d-un-secret-santa.md`. Maquettes : `V3FeteInviter`, `V3FeteRejoindre`, `RejoindreConnecte`, `RejoindreFait`, `RejoindreFerme` (les noms de fichiers sont restés).

- **Le lien d'invitation est celui d'un Secret Santa.** S'y inscrire, c'est participer à ce Secret Santa, et devenir membre de son événement si on ne l'était pas. Un événement n'a pas de lien d'invitation.
- Chaque Secret Santa a le sien, avec ses réglages : « Places restantes », « Date limite », « Ton mot sur la page », « Créer un nouveau lien », « Désactiver le lien ». Il se crée, se renouvelle et se désactive comme le lien d'un groupe aujourd'hui.
- On l'ouvre depuis le Secret Santa en préparation (« Inviter par lien », `PreparerVide`) et depuis « Choisir les participants ».
- Au-dessus du titre : « Famille Camille · Secret Santa 2026 ». Sous le titre, une phrase : « Ceux qui s'inscrivent participent au Secret Santa et deviennent membres de l'événement. »
- Le message à partager : « Salut ! Je t'invite au Secret Santa « Famille Camille » 🎁 » (c'est l'organisateur qui l'envoie, en son nom ; pas « Tu es invité » : `vocabulaire.md`). S'il y a plusieurs Secret Santa la même année, le sien suit entre parenthèses : « Famille Camille (Les adultes) ».
- **La page du lien** dit « On t'invite au Secret Santa », le nom de l'événement (et celui du Secret Santa, de la même façon), la catégorie, la date et le nombre d'inscrits. Le bouton d'un compte connecté : « Participer ».
- **Il vit tant que le tirage n'a pas eu lieu.** Ensuite, celui qui l'ouvre lit, sur la page de `RejoindreFerme` : « Le tirage a déjà eu lieu » · « Préviens l'organisateur de Famille Camille. »
- À 30 membres, les liens des Secret Santa de l'événement se mettent en pause (`fete.md`, « 30 membres au plus »). Quelqu'un qui est déjà membre peut toujours s'inscrire : il ne prend pas de place.

## La limite

3 Secret Santa par compte, 30 membres par événement (`modele.md`). Pas de demande.

Arrivé à la limite, « Créer › Un Secret Santa » montre (`V3TirageLimite`) : « Tu organises déjà 3 Secret Santa », « C'est le maximum pour un compte. », et les trois.

## Le résultat

Maquettes : `V3TirageVersListe`, `V3TirageNeutre`.

La carte « Tu offres un cadeau à Inès », puis « Pour t'aider à choisir » :

- une ligne **« La liste de cadeaux d'Inès »**, avec « Le mode anonyme y sera activé pour toi. ». On ne dit pas dans quel événement est la liste ;
- ses goûts : ce qu'elle préfère, « En ce moment », « Ce qui lui servirait », « À éviter ». Ils viennent de sa fiche « Moi » dans « Mes proches ».

Si la personne n'a rien écrit : « Lui demander des idées », anonyme, comme aujourd'hui (`PistesResultatVide`, `PistesDemander`, `PistesResultatDemande`). L'email qu'elle reçoit (`PistesEmail`) l'invite à écrire sa liste : « Aide-la : écris ta liste de cadeaux, ou quelques mots sur ce que tu aimes. » · « Écrire ma liste ». Partout où cette demande s'affiche (accueil, « Quoi de neuf », menu du compte), elle dit « Quelqu'un te demande des idées », jamais un prénom.

Quand sa liste a bougé depuis ma dernière visite, la ligne de sa liste le dit : « 2 nouvelles idées depuis ta dernière visite » (`V3TirageNouvelles`).

Plus bas, pour moi : une ligne **« Ma liste de cadeaux »**, avec son état (« Pas encore écrite », « Vue seulement par celui qui m'a tiré »…). Sans liste encore, la toucher la crée avec moi dedans, ou propose celles que je tiens déjà : « Quelle liste pour ton Secret Santa ? » (`V3TirageQuelleListe` ; `listes.md`, « Depuis mon Secret Santa »).

Hors d'un événement de catégorie Noël, la page ne dit jamais « Père Noël » (`vocabulaire.md`).

## Du résultat à la liste

Maquettes : `V3ListeSurligne` (le nom du fichier est resté ; il n'y a pas de surlignage), `V3ListeSurligneTout`.

Décision : `2026-11-22-le-secret-santa-et-ma-partie-d-une-liste.md`. Ce qui suit remplace « la page s'ouvre calée sur ma partie ».

Celui qui m'a tiré ouvre la liste **filtrée sur moi** : la liste avec son titre et son mot d'accueil, mais **une seule personne, moi**. Le mode anonyme est déjà activé.

- **En haut, deux choix**, dans le composant à deux choix de l'application (`UiSegmented`) : **mon prénom** (« Inès »), choisi d'avance, et **« Toute la liste »**. C'est ce qui dit qu'on ne regarde qu'une partie, et ce qui montre le reste.
- **« Toute la liste »** montre tout le monde, **moi en premier**, puis les autres dans leur ordre.
- C'est **un filtre** : « la liste filtrée » dans la spec, `filter` dans le code. L'écran n'écrit pas le mot ; les deux choix suffisent.
- Celui qui a le droit d'ouvrir la liste autrement (un membre de l'événement, par exemple) et qui y arrive depuis sa carte de résultat a le même filtre. Arrivé par un autre chemin, il voit la liste entière, sans les deux choix.
- La page ne dit jamais « tu as tiré Inès » : le résultat reste sur la page du Secret Santa.

## Les objets des emails

L'objet d'un email nomme l'événement : « Famille Camille : ton enveloppe t'attend ». Quand l'événement a plusieurs Secret Santa la même année, il ajoute le nom du Secret Santa entre parenthèses : « Famille Camille (les enfants) : ton enveloppe t'attend ». Le mot « Secret Santa » n'a pas besoin d'être dans l'objet.

L'invitation à tenir une liste n'est pas un email de Secret Santa : son objet reste « Camille t'invite à tenir la liste « Noël 2026 » », avec le titre de la liste. Ce titre est le nom de l'occasion tant qu'on ne l'a pas changé ; on ne met pas le nom de l'événement devant (Q-023).

## Ce qui disparaît

- La demande pour organiser, ses écrans, et la table `groupRequests` (`migration.md`).
- Le réglage « Pistes de cadeaux » de l'organisateur et la page « Mes pistes » du participant (`listes.md`).
