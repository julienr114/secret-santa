# Les listes

Décisions : `2026-11-21-le-partage-d-une-liste-a-des-stades.md`, `2026-11-20-le-groupe-devient-la-fete.md`, `2026-11-20-pistes-et-listes-fusionnent.md`, `2026-11-20-on-cree-un-secret-santa-ou-une-liste.md`.
Maquettes : `V3ListeOccasion`, `V3ListeNouvelle`, `V3ListeQui`, `V3ListeQuiSecret`, `V3ListeQuiModifier`, `V3ListeQuiRetirer`, `V3ListeQuiLien`, `V3ListeLienChanger`, `V3Liste`, `V3ListeSecret`, `V3ListePublique`, `V3ListeFermee`, `V3ListeFermeeConnecte`, `V3ListeMembre`, `V3ListeReprise`, `V3ListeCompteCree`, `V3ListeAdresse`, `V3OffreAilleurs`.

Le dessin d'une liste (les lignes, les coches, le mode anonyme, le fil, « ses goûts ») ne change pas : c'est celui de la Correction 30 de l'ancien plan et du README 22.19 à 22.21. Change où elle vit et qui la voit.

## Le partage d'une liste, par stades

Décision : `2026-11-21-le-partage-d-une-liste-a-des-stades.md` (Julien, 21 novembre 2026). Ce qui suit remplace ce que ce fichier disait le 20 novembre : une liste n'est plus visible du seul fait d'être dans un événement.

**Une liste a toujours son lien**, qu'on peut copier à tout moment. **C'est à l'arrivée sur l'adresse que l'accès se décide**, selon le stade du partage :

| Stade | Qui entre |
|---|---|
| **Brouillon** | ceux qui tiennent la liste. C'est l'état de départ de toute liste |
| **Celui qui m'a tiré** | lui en plus (dans un événement où je participe à un Secret Santa) |
| **Un ou plusieurs événements** | leurs membres en plus |
| **Publique** | quiconque a le lien, sans compte. C'est le dernier stade |

- Les stades se cumulent : une liste peut être réservée à celui qui m'a tiré dans un événement, ouverte à tous les membres d'un autre, et publique.
- **Le partage se change dans les deux sens**, à tout moment.
- Chaque événement où la liste est partagée la montre dans sa carte ; une liste réservée à celui qui m'a tiré n'apparaît pas pour les autres membres.

## Une nouvelle liste

Maquettes : `V3ListeOccasion`, `V3ListeNouvelle`.

1. **« Pour quelle occasion ? »** : un de mes événements, ou « Une autre occasion » (qui en crée un, `accueil-et-creation.md`). La liste en prend le nom, la date et l'icône : on ne les redemande pas.
2. La liste s'ouvre, **en brouillon** : moi seul la vois. J'écris.
3. **« Partager »**, dans la barre du haut, ouvre « Qui verra ta liste ? ».

En arrivant depuis mon Secret Santa pour écrire ma liste, l'occasion est connue et « Celui qui m'a tiré » est choisi d'avance (`V3ListeQuiSecret`) : ce que j'écris est lu dès que c'est écrit, comme les pistes d'avant.

## La barre du haut d'une liste

Elle dit le stade, et elle a toujours le lien. Deux lignes : l'état avec son bouton, puis l'adresse avec **« Copier le lien »**.

| Stade | Texte | Bouton |
|---|---|---|
| Brouillon (`V3ListeNouvelle`, `V3ListeReprise`) | « Brouillon » · « Toi seul la vois » | « Partager » |
| Celui qui m'a tiré (`V3ListeSecret`) | le nom de l'événement · « Seul celui qui t'a tiré la voit » | « Modifier » |
| Des événements (`V3Liste`) | « Famille Camille, Chez Mamie » · « 21 membres la voient » | « Modifier » |
| Publique (`V3ListePublique`) | « Publique » · « Toute personne qui a le lien la voit » | « Modifier » |
| Pour celui qui « aide à écrire » (`ListeAidePartage`) | les mêmes textes, plus « choisi par Camille » | aucun |

Celui qui « gère la liste » a le bouton, comme celui qui l'a créée (`ListeTeneurs`). Les maquettes de liste d'avant (`ListeTeneur`, `ListeGlisser`…) ont cette barre.

## « Qui verra ta liste ? »

Maquettes : `V3ListeQui` (depuis un brouillon, bouton « Partager »), `V3ListeQuiModifier` (bouton « Enregistrer »), `V3ListeQuiSecret`, `V3ListeQuiLien`.

- **Mes événements, à cocher**, aucun, un ou plusieurs. Tout décoché, la liste est un brouillon.
- Sous un événement coché **où je participe à un Secret Santa**, deux choix : **« Tous les membres »** ou **« Celui qui m'a tiré »**.
- **« Une autre occasion »** : crée un événement.
- **« Tout le monde, avec le lien »** : un interrupteur. Allumé, la liste est publique.
- Pour une liste publique, deux lignes de plus : « Le message qui accompagne le lien » (la page `PersonnaliserMessage`) et « Changer de lien » (`V3ListeLienChanger`), qui dit d'abord que l'ancien lien ne marchera plus.

### Resserrer le partage

Maquette : `V3ListeQuiRetirer`. Décocher un événement, éteindre « Tout le monde », revenir au brouillon : chaque fois que des gens vont perdre l'accès, **une confirmation le dit avant**, et **compte ceux qui ont coché un cadeau** :

« Retirer ta liste de « Chez Mamie » ? » · « Ses 9 membres ne la verront plus. 2 d'entre eux ont coché un cadeau et ne pourront plus ouvrir la liste. Leurs cadeaux restent prévus. » · « Annuler » · « Retirer ».

Pour une liste publique : « 3 personnes ont coché un cadeau et ne pourront plus ouvrir la liste. Leurs cadeaux restent prévus. » Si personne n'a coché, la confirmation ne dit que la première phrase.

Pour ceux qui perdent l'accès, la liste disparaît, sans trace (Q-003). Leurs coches restent sur la liste : le cadeau est toujours prévu.

## Arriver par le lien

Maquettes : `V3ListeFermee`, `V3ListeFermeeConnecte`.

- J'ai le droit d'entrer (je la tiens, je suis celui qui a tiré son auteur, je suis membre d'un événement où elle est partagée, ou elle est publique) : la liste s'ouvre.
- Je ne suis pas connecté et elle n'est pas publique : « Cette liste n'est pas ouverte à tout le monde » · « Si elle a été partagée avec toi, connecte-toi pour l'ouvrir. » · « Se connecter ». Une fois connecté, on revient sur le lien.
- Je suis connecté et je n'y ai pas droit : « Cette liste n'est pas partagée avec toi » · « Demande à la personne qui t'a envoyé le lien de te l'ouvrir. »
- La page ne dit ni le nom de la liste, ni à qui elle est : le lien d'un brouillon ne doit rien apprendre.

## La liste reprise de l'an dernier

Maquette : `V3ListeReprise`. « Reprendre ma liste de l'an dernier » (accueil, `V3AccueilAnnee`) crée la liste de l'année dans le même événement : le nom, la date et l'icône viennent de l'événement. **Elle naît en brouillon**, le temps du tri. Les idées qui n'avaient pas été offertes sont reprises et marquées, pour moi seul : « Reprise de Noël 2026. Les idées marquées n'avaient pas été offertes : garde-les ou efface-les. Toi seul vois cette marque. » Les idées offertes ne sont pas reprises.

## La liste d'un autre membre

Maquette : `V3ListeMembre`. Elle s'ouvre depuis l'événement, sans lien. Une pastille en haut porte l'emoji et le nom de l'événement, et y ramène.

## La fin des « pistes de cadeaux »

« Mes pistes » n'est plus un objet. Il n'y a qu'un endroit où écrire ses goûts (sa fiche « Moi ») et ses idées (sa liste), et celui qui m'a tiré les voit (`secret-santa.md`).

- **Une liste réservée à celui qui m'a tiré** garde la confidentialité des pistes d'aujourd'hui : lui seul la voit. Elle n'apparaît pas dans les listes de l'événement pour les autres membres ; il y arrive par sa carte de résultat, en mode anonyme.
- **L'organisateur n'a plus de réglage « Pistes de cadeaux »** : tout est disponible, chacun en fait ce qu'il veut. Son suivi dit « a écrit sa liste », sans jamais en montrer le contenu.

### Sans compte

Un participant arrivé par son lien personnel n'a pas forcément de compte.

- **Le compte se crée tout seul à la première chose écrite** (un goût, une idée), pas à l'ouverture du lien : celui qui ne fait que regarder son résultat n'a pas de compte. On le dit sur le moment, par un message (`V3ListeCompteCree`) : « C'est enregistré » · « Un compte a été créé avec ton adresse, pour retrouver ta liste. » · « Compris ».
- **Sans adresse email, pas de liste.** Celui dont on n'a pas l'adresse (un lien copié dans une messagerie) se la voit demander au moment où il veut écrire sa liste (`V3ListeAdresse`) : « Ton adresse email, pour écrire ta liste », un champ, « Valider », « Tu reçois un lien pour la confirmer. », « Tes données, en clair ». L'adresse se confirme par un lien, comme pour se connecter.

## « Ce que j'offre ailleurs »

Maquette : `V3OffreAilleurs`. Une ligne en bas de l'accueil.

- Elle ne montre que les listes publiques **où j'ai coché quelque chose** sans être membre d'un de leurs événements : l'invité d'un mariage retrouve ce qu'il offre.
- Une liste qui cesse d'être publique en disparaît (Q-003) : pas de liste fermée gardée pour mémoire.
- Ouvrir un lien sans rien cocher ne laisse aucune trace.
- Il n'y a pas de rubrique « Reçues par un lien ».
