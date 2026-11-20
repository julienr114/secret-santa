# Les listes

Décisions : `2026-11-20-le-groupe-devient-la-fete.md`, `2026-11-20-pistes-et-listes-fusionnent.md`, `2026-11-20-on-cree-un-secret-santa-ou-une-liste.md`.
Maquettes : `V3ListeQui`, `V3ListeQuiSecret`, `V3Liste`, `V3ListeSecret`, `V3ListeNouvelle`, `V3ListePublique`, `V3ListeMembre`, `V3ListeCompteCree`, `V3ListeAdresse`, `V3OffreAilleurs`.

Le dessin d'une liste (les lignes, les coches, le mode anonyme, le fil, « ses goûts ») ne change pas : c'est celui de la Correction 30 de l'ancien plan et du README 22.19 à 22.21. Change où elle vit et qui la voit.

## « Qui verra ta liste ? »

Maquette : `V3ListeQui`. C'est la première étape d'une nouvelle liste, et l'écran que rouvre « Modifier » dans la barre du haut d'une liste.

- **Mes fêtes, à cocher**, une ou plusieurs. Au moins une.
- Sous une fête cochée **qui a un Secret Santa où je participe**, deux choix : **« Toute la fête »** ou **« Celui qui m'a tiré »**.
  - En arrivant depuis mon Secret Santa (`V3ListeQuiSecret`), « Celui qui m'a tiré » est choisi d'avance.
  - En arrivant de l'accueil ou de « Créer », « Toute la fête ».
- **« Une autre occasion »** : crée une fête (`accueil-et-creation.md`).
- **« Tout le monde, avec un lien »** : un interrupteur, en plus des fêtes. La liste devient publique.

Peut-on décocher une fête pour en retirer sa liste sans la supprimer : `docs/travail/questions.md`, Q-002.

## La barre du haut d'une liste

Elle ne dit plus « Partage par lien ». Elle dit où est la liste, avec « Modifier » :

| État | Texte |
|---|---|
| Dans des fêtes (`V3Liste`) | « Famille Camille, Chez Mamie » · « 21 membres la voient » |
| Réservée à celui qui m'a tiré (`V3ListeSecret`) | « Famille Camille » · « Seul celui qui m'a tiré la voit » |
| Publique (`V3ListePublique`) | « Publique, avec un lien » · « Et dans la fête … » ; dessous, le lien et « Partager » |

## Une nouvelle liste

Maquette : `V3ListeNouvelle`. Son nom, sa date et son icône viennent de la fête (et de sa catégorie) : on ne les redemande pas.

## La liste d'un autre membre

Maquette : `V3ListeMembre`. Elle s'ouvre depuis la fête, sans lien. Une pastille en haut porte l'emoji et le nom de la fête, et y ramène.

## La fin des « pistes de cadeaux »

« Mes pistes » n'est plus un objet. Il n'y a qu'un endroit où écrire ses goûts (sa fiche « Moi ») et ses idées (sa liste), et celui qui m'a tiré les voit (`secret-santa.md`).

- **Une liste réservée à celui qui m'a tiré** garde la confidentialité des pistes d'aujourd'hui : lui seul la voit. Elle n'apparaît pas dans les listes de la fête pour les autres membres ; il y arrive par sa carte de résultat, en mode anonyme.
- **L'organisateur n'a plus de réglage « Pistes de cadeaux »** : tout est disponible, chacun en fait ce qu'il veut. Son suivi dit « a écrit sa liste », sans jamais en montrer le contenu.

### Sans compte

Un participant arrivé par son lien personnel n'a pas forcément de compte.

- **Le compte se crée tout seul à la première chose écrite** (un goût, une idée), pas à l'ouverture du lien : celui qui ne fait que regarder son résultat n'a pas de compte. On le dit sur le moment, par un message (`V3ListeCompteCree`) : « C'est enregistré » · « Un compte a été créé avec ton adresse, pour retrouver ta liste. » · « Compris ».
- **Sans adresse email, pas de liste.** Celui dont on n'a pas l'adresse (un lien copié dans une messagerie) se la voit demander au moment où il veut écrire sa liste (`V3ListeAdresse`) : « Ton adresse email, pour écrire ta liste », un champ, « Valider », « Tu reçois un lien pour la confirmer. », « Tes données, en clair ». L'adresse se confirme par un lien, comme pour se connecter.

## « Ce que j'offre ailleurs »

Maquette : `V3OffreAilleurs`. Une ligne en bas de l'accueil.

- Elle ne montre que les listes publiques **où j'ai coché quelque chose** sans être membre d'une de leurs fêtes : l'invité d'un mariage retrouve ce qu'il offre.
- Ouvrir un lien sans rien cocher ne laisse aucune trace.
- Il n'y a pas de rubrique « Reçues par un lien ».
