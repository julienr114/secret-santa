# Les maquettes de la V3

Le canevas : https://claude.ai/artifact/6XYdmH9di9ctyAZxzLD9Ns, page « V3 · La fête ». Dans le dépôt : la source dans `docs/refonte/maquettes/<Nom>.html`, la référence visuelle dans `docs/refonte/maquettes-sorbet/<Nom>.html`.

31 maquettes, dans l'ordre du canevas (une rangée par sujet).

| Maquette | Ce qu’elle montre | Ticket |
|---|---|---|
| `V3Accueil` | Accueil · mes fêtes : leurs Secret Santa et les listes de leurs membres ; un anniversaire proposé ; ce que j’offre ailleurs ; l’onglet « Créer » dans la barre du bas | 103 |
| `V3AccueilVide` | Accueil · un compte tout neuf : un Secret Santa ou une liste ; on ne parle pas de « fête », c’est leur première étape | 103 |
| `V3AccueilAnnee` | Accueil · l’année suivante (fin octobre 2027) : « Préparer Noël 2027 », « Reprendre ma liste de l’an dernier » | 108 |
| `V3AccueilPlusOuvert` | Accueil · l’onglet « Créer » touché : un Secret Santa ou une liste ; la fête est la première étape des deux | 103 |
| `V3TirageQuelleFete` | Secret Santa · première étape : « Pour quelle occasion ? », une fête que j’organise ou une autre occasion | 105 |
| `V3Fete` | Fête · vue par un membre : ses membres, son Secret Santa, les listes, les années passées, « Quitter » | 104 |
| `V3FeteOrganisateur` | Fête · vue par son organisateur : « Inviter », les réglages, « Un autre Secret Santa » | 104 |
| `V3FeteAnniversaire` | Fête · « pour quelqu’un » (un anniversaire) : sa liste d’abord ; un Secret Santa reste possible | 104 |
| `V3FeteNouvelle` | Première étape d’un Secret Santa ou d’une liste, quand l’occasion est nouvelle : « Pour quelle occasion ? », la catégorie d’abord, qui remplit le reste | 104 |
| `V3FeteMembresReprendre` | Fête · nouvelle, suite : « Reprendre les membres d’une autre fête », on coche qui | 104 |
| `V3FeteQuitter` | Fête · quitter : ce qui sort, ce qui reste | 104 |
| `V3FeteReglages` | Fête · réglages : la catégorie, la date, la récurrence, les organisateurs ; ceux du Secret Santa sont sur le Secret Santa | 104 |
| `V3FeteMembres` | Fête · ses membres (certains sans compte : ils participent au Secret Santa, ils ne voient pas les listes) | 104 |
| `V3FeteInviter` | Fête · inviter par lien | 104 |
| `V3FeteRejoindre` | Fête · le lien d’invitation, sans compte : on rejoint une fête, et son Secret Santa s’il y en a un | 104 |
| `V3TirageNouveau` | Secret Santa · celui de l’année : la date de la fête est déjà là, et se change | 105 |
| `V3TirageLimite` | Secret Santa · la limite : 3 par compte, sans demande à personne | 105 |
| `V3TirageVersListe` | Secret Santa · du résultat à la liste de cadeaux d’Inès, sans lien ; le mode anonyme s’active seul | 107 |
| `V3TirageNeutre` | Secret Santa · hors de Noël (catégorie « Autre ») : il garde son nom, « Secret Santa » ; aucun « Père Noël » | 105 |
| `V3TirageReglages` | Secret Santa · ses réglages : éviter la même personne, les pistes de cadeaux, le mot des messages, les emails du tirage | 105 |
| `V3ListeSurligne` | Secret Santa · la liste de la personne tirée : la liste entière, la page s’ouvre calée sur sa partie (ici Inès, en bas), le mode anonyme déjà activé | 107 |
| `V3ListeQui` | Liste · première étape : « Qui verra ta liste ? », une ou plusieurs de mes fêtes ou une autre occasion ; en plus, tout le monde avec un lien | 106 |
| `V3Liste` | Liste · la mienne : la barre dit dans quelles fêtes elle est ; « Modifier » rouvre « Qui verra ta liste ? » | 106 |
| `V3ListeNouvelle` | Liste · nouvelle : le nom, la date et l’icône viennent de la fête | 106 |
| `V3ListePublique` | Liste · publique (un mariage) : dans sa fête, et ouverte à tous par un lien, sans compte pour cocher | 106 |
| `V3ListeMembre` | Liste · celle d’un autre membre : on y arrive par la fête, sans lien ; la fête est rappelée en haut | 106 |
| `V3OffreAilleurs` | Liste · « Ce que j’offre ailleurs » : les listes publiques où j’ai coché, pas celles que j’ai seulement ouvertes | 106 |
| `V3ListeQuiSecret` | Liste · depuis mon Secret Santa : « Celui qui m’a tiré » est choisi d’avance ; « Toute la fête » reste possible | 107 |
| `V3ListeSecret` | Liste · la mienne, montrée seulement à celui qui m’a tiré : les anciennes « pistes de cadeaux » | 107 |
| `V3ListeCompteCree` | Liste · sans compte, par son lien : le compte se crée tout seul à la première chose écrite, et on le dit | 107 |
| `V3ListeAdresse` | Liste · arrivé par un lien copié, sans adresse email : on la demande au moment d’écrire sa liste ; pas de liste sans adresse | 107 |

## Maquettes qui servent aussi à la V3

| Maquette | Ce qu’elle montre | Ticket |
|---|---|---|
| `MenuAvatar`, `MenuAvatarOuvert` | L’icône du compte à la place du burger, et son menu | 103 |
| `ProcheNaissance` | Les trois listes d’une date | 105 |
| `ListeGroupeFil`, `ListeGroupeFilDeplie` | Le dessin d’une liste (Correction 30) | 106 |

## Périmées

Retirées du canevas. Leurs fichiers sont encore dans `docs/refonte/maquettes/` et `docs/refonte/maquettes-sorbet/` : le ticket 111 les supprime.

- Pistes écartées pour « Créer » : `V3AccueilPlus`, `V3AccueilPlusTitre`.
- La demande pendant la bêta : `V3TirageDemande`.
- L’exploration d’avant la V3 : `AccueilPisteA`, `AccueilPisteB`, `AccueilPisteC` et les autres `AccueilPiste*`, `AccueilFetes2`, `FeteChoisir`, `FeteNouvelle`, `FetePage`, `FetePartagee`, `FeteAjouterListe`, `FetePartageeAjoutee`, `FeteReglages`, `FeteMembres`, `FeteInviter`, `TirageNouveau`, `ListeV3`, `ListeV3Nouvelle`.
- `SouhaitsIdee` : remplacée par `PistesIdee` depuis la Correction 18, elle-même sans objet avec la V3.

## Pas encore dessinées

Voir les tickets de `docs/travail/a-concevoir/` : « Les fêtes passées », le suivi d'un Secret Santa par l'organisateur, l'administration sans les demandes, les emails et les notifications avec les mots de la V3, le journal, « Devine qui », la page de présentation.
