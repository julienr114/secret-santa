# Les questions

Mode d'emploi : `docs/travail/README.md` et le skill `/question`.

## Ouvertes

### Q-001 — « Fête » ou « événement », pour le nom commun ? (tickets 102, 104)

- **Pour** : Julien
- **Ce qui bloque** : le vocabulaire définitif (ticket 102). Les maquettes et la spec disent « fête » ; le ticket 104 écrit « fête » par des clés faciles à changer.
- **Ce qu'on a trouvé** : le mot ne s'écrit presque plus (« Quitter cette fête », « Les fêtes passées », « Réglages de la fête », « Toute la fête »). « Événement » colle à toutes les catégories mais reste froid, s'élide mal (« cet événement », « Nouvel événement ») et « membres de l'événement » sonne faux. Julien penchait pour « événement » avant qu'on décide de ne plus parler de fête à la création.
- **Les choix** : A, « fête » ; B, « événement ».
- **Ce que la conception ferait** : A. Le mot est devenu rare, et il garde le ton de l'application.

### Q-002 — Peut-on retirer sa liste d'une fête sans la supprimer ? (ticket 106)

- **Pour** : Julien
- **Ce qui bloque** : ce que fait « Qui verra ta liste ? » quand on décoche une fête.
- **Les choix** : A, oui, en décochant la fête (il doit en rester au moins une) ; B, non, il faut supprimer la liste.
- **Ce que la conception ferait** : A. C'est dessiné comme ça (`V3ListeQuiModifier`, `V3ListeQuiRetirer`) : une confirmation dit que les membres de la fête ne verront plus la liste et que les cadeaux qu'ils ont cochés restent prévus.

### Q-003 — Une liste publique où j'ai coché cesse d'être publique : reste-t-elle dans « Ce que j'offre ailleurs » ? (ticket 106)

- **Pour** : Julien
- **Les choix** : A, elle y reste, fermée, avec ce que j'offre et « Cette liste n'est plus partagée » (c'est ce que montre `V3OffreAilleurs`) ; B, elle disparaît.
- **Ce que la conception ferait** : A : on ne perd pas la trace d'un cadeau qu'on a promis.

### Q-004 — Dans quel ordre, après la V3 ? (tickets 120 à 133)

- **Pour** : Julien
- **Ce qu'on a trouvé** : l'ancien plan disait seulement que la V3 passe avant la page de présentation (125, 126), le changement d'infrastructure (128, 129), le tableau de bord (127) et l'application installée (124). Rien sur l'ordre des autres.
- **Ce que la conception ferait** : d'abord ce qui protège (130, 131, 129), puis ce qui ouvre (128, 125, 126), puis le confort (120 à 124, 127), puis 132 et 133.

### Q-005 — Quand publier la migration de la V3 ? (ticket 101)

- **Pour** : Julien
- **Ce qu'on a trouvé** : la migration transforme tous les groupes en fêtes, et des gens utilisent l'application pour Noël 2026.
- **Ce que la conception ferait** : coder sur une branche dès maintenant, ne rien publier avant janvier 2027.

### Q-006 — Une liste est-elle visible dès sa création ? (tickets 106, 108)

- **Pour** : Julien
- **Ce qui bloque** : la V2 avait un brouillon (« Partage par lien » éteint), puis une liste publiée. La V3 commence par « Qui verra ta liste ? » : rien ne dit quand la liste devient visible.
- **Les choix** : A, tout de suite : la liste est dans sa fête dès sa création, ses membres la voient même vide (« pas encore d'idées ») ; B, un brouillon, et un bouton « Montrer ma liste ».
- **Ce que la conception ferait** : A. Un état de moins, un bouton de moins, et personne n'oublie de publier. Les maquettes sont dessinées comme ça ; les états « Brouillon » et « Partage arrêté » sont rangés dans les périmées.

### Q-007 — En cas d'abus : une pause, ou le retour des demandes ? Et la limite d'un compte se change-t-elle ? (tickets 105, 109)

- **Pour** : Julien
- **Ce qu'on a trouvé** : la décision du 20 novembre dit « un interrupteur permet de rallumer la demande ». Garder la demande, c'est garder en vie sa file, sa fiche, ses emails et ses réponses toutes faites, pour un cas qui n'arrivera peut-être jamais.
- **Les choix** : A, une pause : « Suspendre les nouveaux Secret Santa », à côté de « Suspendre les emails » et « Suspendre les inscriptions » (`V3Admin`, `V3TiragePause`) ; B, le retour des demandes, comme écrit.
- **Deuxième point** : le super-admin peut-il changer la limite de 3 pour un compte ? Le réglage existait pour les groupes ; `V3AdminCompte` le garde.
- **Ce que la conception ferait** : A, et oui pour le réglage par compte : c'est ce qui permet de dire oui à quelqu'un de la famille sans rouvrir une file de demandes.

### Q-008 — « Préparer Noël 2027 » : que reprend-on quand il y avait plusieurs Secret Santa ? (ticket 108)

- **Pour** : Julien
- **Les choix** : A, un seul Secret Santa est préparé, avec les réglages du premier de l'an dernier, et « Un autre Secret Santa » pour les suivants ; B, autant de Secret Santa que l'an dernier, chacun avec ses participants et ses réglages.
- **Ce que la conception ferait** : B. Celui qui a fait « les adultes » et « les enfants » l'an dernier veut retrouver les deux ; en supprimer un est plus simple que d'en refaire un.

### Q-009 — Combien de temps une fête reste-t-elle sur l'accueil après sa date ? (tickets 108, 110)

- **Pour** : Julien
- **Ce qui bloque** : le dévoilement et le palmarès arrivent après la fête (`V3AccueilJeu`). Si la fête quitte l'accueil le lendemain, personne ne les voit.
- **Les choix** : A, 14 jours après sa date ; B, jusqu'à ce que son Secret Santa soit clôturé, et 3 jours s'il n'y en a pas ; C, le lendemain.
- **Ce que la conception ferait** : A. Une règle que tout le monde comprend, qui laisse passer les fêtes de fin d'année.

### Q-006 — Les textes sous les lignes de l'accueil et de la page d'une fête (tickets 103, 104)

- **Pour** : la conception
- **Ce qui bloque** : les sous-titres d'état des lignes (Secret Santa : « Tu sais à qui tu offres · tu l'organises », « Fait · 6 sur 8 ont découvert » ; listes : « Tu offres 2 cadeaux · 1 nouvelle idée », « Léo, Zoé et moi · aussi chez Mamie » ; « Les fêtes passées » ; « Ce que j'offre ailleurs »). Pour chaque cas, il faut le texte, la règle qui le choisit et ce qui le remplit.
- **En attendant** : les lignes n'ont que leur titre (décidé par Julien le 20 novembre 2026).

### Q-007 — « Camille te demande ta liste » (tickets 103, 104)

- **Pour** : la conception
- **Ce qui bloque** : aujourd'hui, « Lui demander des pistes » est toujours anonyme : celui qui demande n'est jamais nommé. Cette ligne nomme Camille. Est-ce une autre chose (une relance de l'organisateur), ou faut-il l'enlever ?

### Q-008 — « chez Mamie » ou « dans Famille Camille » (tickets 103, 104)

- **Pour** : la conception
- **Ce qui bloque** : le nom d'une fête est libre ; « Elle reste chez Mamie » (`V3FeteQuitter`) et « aussi dans Famille Camille » (`V3Accueil`) ne disent pas quand écrire « chez » ou « dans », ni quoi écrire pour trois fêtes ou plus, ni en anglais et en allemand.
- **En attendant** : la phrase n'est pas écrite.

### Q-009 — L'ordre des tickets 103 et 104

- **Pour** : la conception
- **Réponse de Julien (20 novembre 2026)** : le 104 passe avant le 103 ; la barre du bas, le menu du compte et le panneau « Créer » du 103 sont gardés de côté et reprendront d'un seul tenant après le 104. « Quoi de neuf » mène à une page vide jusqu'au ticket 120. « Bientôt » propose un anniversaire 60 jours avant. Les dépendances des deux tickets sont à inverser.

## Réponses

Rien pour l'instant. Les réponses d'avant le 20 novembre 2026 sont dans l'archive `docs/refonte/PLAN.md`, section 6.
