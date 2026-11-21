# Les questions

Mode d'emploi : `docs/travail/README.md` et le skill `/question`.

## Ouvertes

Aucune.

## Réponses

Les réponses d'avant le 20 novembre 2026 sont dans l'archive `docs/refonte/PLAN.md`, section 6.

### Q-007 — En cas d'abus : une pause, ou le retour des demandes ? Et la limite d'un compte se change-t-elle ? (tickets 105, 109)

- **Pour** : Julien
- **Ce qu'on a trouvé** : la décision du 20 novembre dit « un interrupteur permet de rallumer la demande ». Garder la demande, c'est garder en vie sa file, sa fiche, ses emails et ses réponses toutes faites, pour un cas qui n'arrivera peut-être jamais.
- **Les choix** : A, une pause : « Suspendre les nouveaux Secret Santa », à côté de « Suspendre les emails » et « Suspendre les inscriptions » (`V3Admin`, `V3TiragePause`) ; B, le retour des demandes, comme écrit.
- **Deuxième point** : le super-admin peut-il changer la limite de 3 pour un compte ? Le réglage existait pour les groupes ; `V3AdminCompte` le garde.
- **Ce que la conception ferait** : A, et oui pour le réglage par compte : c'est ce qui permet de dire oui à quelqu'un de la famille sans rouvrir une file de demandes.
- **Réponse de Julien (21 novembre 2026)** : A, une pause (« Suspendre les nouveaux Secret Santa »), pas le retour des demandes : la table et les écrans des demandes peuvent partir pour de bon. Et oui, le super-admin change la limite d'un compte, sur sa fiche. Décision : `docs/decisions/2026-11-21-une-pause-pas-des-demandes.md`. Spec : `docs/spec/v3/administration.md`, `docs/spec/v3/modele.md`.

### Q-006 — Une liste est-elle visible dès sa création ? (tickets 106, 108)

- **Pour** : Julien
- **Ce qui bloque** : la V2 avait un brouillon (« Partage par lien » éteint), puis une liste publiée. La V3 commence par « Qui verra ta liste ? » : rien ne dit quand la liste devient visible.
- **Les choix** : A, tout de suite : la liste est dans sa fête dès sa création, ses membres la voient même vide (« pas encore d'idées ») ; B, un brouillon, et un bouton « Montrer ma liste ».
- **Ce que la conception ferait** : A. Un état de moins, un bouton de moins, et personne n'oublie de publier. Les maquettes sont dessinées comme ça ; les états « Brouillon » et « Partage arrêté » sont rangés dans les périmées.
- **Réponse de Julien (21 novembre 2026)** : ni A ni B tels quels. **Le brouillon est l'état de départ du partage**, pas un bouton à part. Une liste a toujours son lien, qu'on peut copier à tout moment ; **c'est à l'arrivée sur l'adresse que l'accès se décide**, selon le stade du partage : brouillon (ceux qui la tiennent), celui qui m'a tiré, une ou plusieurs fêtes (leurs membres), et en dernier stade publique (quiconque a le lien). La conception réécrit `docs/spec/v3/listes.md` et redessine les maquettes : **le ticket 106 ne se commence pas avant**.

### Q-002 — Peut-on retirer sa liste d'une fête sans la supprimer ? (ticket 106)

- **Pour** : Julien
- **Ce qui bloque** : ce que fait « Qui verra ta liste ? » quand on décoche une fête.
- **Les choix** : A, oui, en décochant la fête (il doit en rester au moins une) ; B, non, il faut supprimer la liste.
- **Ce que la conception ferait** : A. C'est dessiné comme ça (`V3ListeQuiModifier`, `V3ListeQuiRetirer`) : une confirmation dit que les membres de la fête ne verront plus la liste et que les cadeaux qu'ils ont cochés restent prévus.
- **Réponse de Julien (21 novembre 2026)**, donnée avec celle de Q-006 : oui. Le partage est un réglage qu'on change : décocher une fête en retire la liste, et tout décocher la ramène au brouillon. Les cadeaux déjà cochés restent prévus.

### Q-003 — Une liste publique où j'ai coché cesse d'être publique : reste-t-elle dans « Ce que j'offre ailleurs » ? (ticket 106)

- **Pour** : Julien
- **Les choix** : A, elle y reste, fermée, avec ce que j'offre et « Cette liste n'est plus partagée » (c'est ce que montre `V3OffreAilleurs`) ; B, elle disparaît.
- **Ce que la conception ferait** : A : on ne perd pas la trace d'un cadeau qu'on a promis.
- **Réponse de Julien (21 novembre 2026)** : B, elle disparaît, sans trace chez celui qui avait coché. Mais **celui qui tient la liste est prévenu avant de resserrer le partage** : une confirmation lui dit combien de personnes ont coché un cadeau et ne pourront plus ouvrir la liste. Leurs cadeaux restent prévus sur la liste (lecture de la conception, non contredite). Décision : `docs/decisions/2026-11-21-le-partage-d-une-liste-a-des-stades.md`.

### Q-008 — « Préparer Noël 2027 » : que reprend-on quand il y avait plusieurs Secret Santa ? (ticket 108)

- **Pour** : Julien
- **Les choix** : A, un seul Secret Santa est préparé, avec les réglages du premier de l'an dernier, et « Un autre Secret Santa » pour les suivants ; B, autant de Secret Santa que l'an dernier, chacun avec ses participants et ses réglages.
- **Ce que la conception ferait** : B. Celui qui a fait « les adultes » et « les enfants » l'an dernier veut retrouver les deux ; en supprimer un est plus simple que d'en refaire un.
- **Réponse de Julien (21 novembre 2026)** : B, autant de Secret Santa que l'an dernier, chacun avec ses participants et ses réglages. Et on doit pouvoir supprimer celui qui ne sert plus, tant qu'il n'est pas tiré. Spec : `docs/spec/v3/accueil-et-creation.md`, « L'année suivante ».

### Q-009 — Combien de temps une fête reste-t-elle sur l'accueil après sa date ? (tickets 108, 110)

- **Pour** : Julien
- **Ce qui bloque** : le dévoilement et le palmarès arrivent après la fête (`V3AccueilJeu`). Si la fête quitte l'accueil le lendemain, personne ne les voit.
- **Les choix** : A, 14 jours après sa date ; B, jusqu'à ce que son Secret Santa soit clôturé, et 3 jours s'il n'y en a pas ; C, le lendemain.
- **Ce que la conception ferait** : A. Une règle que tout le monde comprend, qui laisse passer les fêtes de fin d'année.
- **Réponse de Julien (21 novembre 2026)** : B, avec un garde-fou : la fête reste sur l'accueil tant que son Secret Santa n'est pas clôturé, **14 jours au plus** après sa date ; 3 jours s'il n'y a pas de Secret Santa. Spec : `docs/spec/v3/accueil-et-creation.md`, « Après la date ».

### Q-001 — « Fête » ou « événement », pour le nom commun ? (tickets 102, 104)

- **Pour** : Julien
- **Ce qui bloque** : le vocabulaire définitif (ticket 102). Les maquettes et la spec disent « fête » ; le ticket 104 écrit « fête » par des clés faciles à changer.
- **Ce qu'on a trouvé** : le mot ne s'écrit presque plus (« Quitter cette fête », « Les fêtes passées », « Réglages de la fête », « Toute la fête »). « Événement » colle à toutes les catégories mais reste froid, s'élide mal (« cet événement », « Nouvel événement ») et « membres de l'événement » sonne faux. Julien penchait pour « événement » avant qu'on décide de ne plus parler de fête à la création.
- **Les choix** : A, « fête » ; B, « événement ».
- **Ce que la conception ferait** : A. Le mot est devenu rare, et il garde le ton de l'application.
- **Réponse de Julien (21 novembre 2026)** : **« événement »**. Décision : `docs/decisions/2026-11-21-evenement-pas-fete.md`, avec ce que la conception en tire (« Tous les membres », le jour lui-même, l'adresse). La table des textes est dans `docs/spec/v3/vocabulaire.md`. Le reste de la spec et les maquettes disent encore « fête » : ticket de conception D15.

### Q-005 — Quand publier la migration de la V3 ? (ticket 101)

- **Pour** : Julien
- **Ce qu'on a trouvé** : la migration transforme tous les groupes en fêtes, et des gens utilisent l'application pour Noël 2026.
- **Ce que la conception ferait** : coder sur une branche dès maintenant, ne rien publier avant janvier 2027.
- **Réponse de Julien (21 novembre 2026)** : B, **dès qu'elle est prête**, sans attendre janvier. Garde-fous ajoutés par la conception, non contredits : tout le lot d'un coup (tickets 105 à 112 et ce que les réponses du 21 novembre changent), une sauvegarde et une répétition de la migration sur une copie du jour, un mot à ceux qui sont au milieu d'un Secret Santa. Décision : `docs/decisions/2026-11-21-la-v3-se-publie-des-qu-elle-est-prete.md`.

### Q-004 — Dans quel ordre, après la V3 ? (tickets 120 à 133)

- **Pour** : Julien
- **Ce qu'on a trouvé** : l'ancien plan disait seulement que la V3 passe avant la page de présentation (125, 126), le changement d'infrastructure (128, 129), le tableau de bord (127) et l'application installée (124). Rien sur l'ordre des autres.
- **Ce que la conception ferait** : d'abord ce qui protège (130, 131, 129), puis ce qui ouvre (128, 125, 126), puis le confort (120 à 124, 127), puis 132 et 133.
- **Réponse de Julien (21 novembre 2026)** : B, **le confort d'abord** : 120 à 124, puis ce qui protège (130, 131, 129, 132), puis ce qui ouvre (128, 125, 126), puis 127, 133, 134. La conception réécrit les souches dans cet ordre.

### Q-010 — Les textes sous les lignes de l'accueil et de la page d'une fête (tickets 103, 104)

- **Réponse de la conception (21 novembre 2026)** : `docs/spec/v3/lignes.md` donne, pour chaque ligne, son titre, ses cas dans l'ordre (le premier qui s'applique est écrit), le texte de chaque cas, ce qui le remplit, et le point rouge. En résumé : la ligne d'un Secret Santa me parle comme participant sur l'accueil et comme organisateur sur la page de la fête ; la ligne d'une liste dit pour qui elle est quand je la tiens, ce que j'y offre et ce qui est nouveau quand elle est à quelqu'un d'autre. « tu l'organises » ne s'écrit plus. À coder : ticket 112.

### Q-011 — « Camille te demande ta liste » (tickets 103, 104)

- **Réponse de la conception (21 novembre 2026)** : il faut enlever le prénom. Il n'y a pas de relance de l'organisateur : c'est la demande d'idées, et elle reste anonyme partout. Le texte est « Quelqu'un te demande des idées » (`docs/spec/v3/lignes.md`, `docs/spec/v3/secret-santa.md`). Les maquettes sont corrigées.

### Q-012 — « chez Mamie » ou « dans Famille Camille » (tickets 103, 104)

- **Réponse de la conception (21 novembre 2026)** : ni l'un ni l'autre, jamais de préposition devant le nom d'une fête (`docs/decisions/2026-11-21-le-nom-d-une-fete-dans-une-phrase.md`). Sous une ligne : « aussi : Chez Mamie » pour une autre fête, « aussi dans 2 autres fêtes » à partir de deux. Dans une phrase : le nom entre guillemets derrière un mot fixe (« Retirer ta liste de « Chez Mamie » ? »), ou pas de nom (« Elle reste dans tes autres fêtes. »). En anglais et en allemand, la même forme : « also: Chez Mamie », « auch: Chez Mamie ». Détail : `docs/spec/v3/lignes.md`, « Le nom d'une fête dans un texte ».

### Q-013 — L'ordre des tickets 103 et 104

- **Reporté par la conception (21 novembre 2026)** : les tickets 103 et 104 sont faits, il n'y a plus de dépendance à inverser. « Bientôt » à 60 jours est dans `docs/spec/v3/accueil-et-creation.md`. « Quoi de neuf » a sa maquette depuis (`V3QuoiDeNeuf`) et reste vide jusqu'aux tickets 110 et 120.

### Q-014 — Une fête qui n'est pas Noël et qui vient avant Noël, sur l'accueil (ticket 103)

- **Réponse de la conception (21 novembre 2026)** : au-dessus de la section de Noël, sans titre. L'accueil suit les dates : la section de Noël est posée à la place de sa première fête, ce qui vient avant est au-dessus, « Bientôt » puis « Plus tard » viennent après (`docs/decisions/2026-11-21-l-accueil-suit-les-dates.md`, maquette `V3AccueilAvantNoel`). Une saison de Noël d'une autre année garde sa propre section, à sa date : ton choix d'attente est le bon sur ce point. À coder : ticket 112.

### Q-015 — Où changer la date, le budget et le petit mot d'un Secret Santa déjà créé ? (ticket 105)

- **Pour** : la conception
- **Ce qui bloque** : `V3TirageReglages` montre quatre sections (le tirage au sort, Devine qui, les messages, les emails) et rien d'autre. Aucune maquette ne dit où se changent ensuite la date, le budget et le petit mot, que le formulaire de création règle.
- **En attendant** : une cinquième section, « La fête », sous les quatre de la maquette, garde ces trois lignes (et « Pistes de cadeaux » jusqu'au ticket 107). C'est noté dans `ECARTS-MAQUETTES.md`.
- **Les choix** : A, cette section en bas des réglages ; B, les trois lignes sur la page du Secret Santa elle-même ; C, une maquette à part.
- **Ce que je ferais** : A, déjà en place : un seul endroit pour tout ce qui se règle.
- **Réponse de la conception (21 novembre 2026)** : A, à deux détails près. La section vient **en premier**, pas en bas, et elle s'appelle **« Le Secret Santa »**, pas « La fête » (le mot ne s'écrit plus). Elle a quatre lignes, celles du formulaire de création et dans son ordre : « Nom », « Date », « Budget », « Petit mot pour les participants ». « Pistes de cadeaux » y reste jusqu'au ticket 107, comme tu l'as fait. La maquette `V3TirageReglages` est à jour ; spec : `docs/spec/v3/secret-santa.md` (« Ses réglages »). Au passage, la ligne du formulaire de création s'appelle « Date », comme sur `V3TirageNouveau` (la spec disait « Date de l'événement »). À coder : ticket 115.

### Q-016 — « Joyeux Noël » à la fin du palmarès, hors de Noël (ticket 105)

- **Pour** : la conception
- **Ce qui bloque** : la dernière image du palmarès de Devine qui dit « Joyeux Noël, Inès » (« Joyeux Noël ! » pour un organisateur). `vocabulaire.md` ne donne de variante que pour « Père Noël » : ce texte reste tel quel dans un week-end d'été.
- **Les choix** : A, « Bonne fête, Inès » ; B, le nom de la fête (« Les cousins, c'est fini ! ») ; C, rien qu'un prénom.
- **Ce que je ferais** : A, avec « Joyeux Noël » gardé pour une fête de Noël.
- **Réponse de la conception (21 novembre 2026)** : ni A, ni B, ni C. Hors de Noël : **« Merci d'avoir joué, Inès »**, et **« Merci à tous ! »** pour un organisateur. « Bonne fête » se lit comme un souhait de fête du prénom, ou d'anniversaire, et ne se traduit pas bien ; « merci d'avoir joué » vaut pour toutes les catégories et les trois langues. « Joyeux Noël » reste dans un événement de catégorie Noël. Sur la même image, « C'est tout pour cette année » devient « C'est tout » dans un événement qui ne revient pas chaque année. Spec : `docs/spec/v3/vocabulaire.md` (« Devine qui hors de Noël »). Julien peut dire non. À coder : ticket 115.

### Q-017 — Avec plusieurs Secret Santa en préparation la même année, lequel rejoint celui qui s'inscrit par le lien ? (ticket 105)

- **Pour** : la conception
- **Ce qui bloque** : `fete.md` dit « Ceux qui s'inscrivent rejoignent aussi le Secret Santa, tant que le tirage n'a pas eu lieu », au singulier. Une fête peut maintenant en avoir plusieurs la même année (« les adultes », « les enfants »).
- **En attendant** : rien ne change dans le code : il rejoint le plus récent qui n'est pas clôturé, s'il est encore en préparation.
- **Les choix** : A, aucun : l'organisateur l'ajoute lui-même là où il faut ; B, tous ceux en préparation ; C, le plus récent, comme aujourd'hui.
- **Ce que je ferais** : A dès qu'il y en a deux, C quand il n'y en a qu'un : on ne met personne chez « les enfants » sans le savoir.
- **Réponse de la conception (21 novembre 2026)** : ce que tu ferais. Un seul Secret Santa en préparation cette année : il le rejoint. Plusieurs : aucun, l'organisateur le coche dans « Choisir les participants ». Deux textes de plus : la page d'arrivée dit « Ton organisateur te dira à quel Secret Santa tu participes. », sans la ligne « Voir mon tirage » ; le message qui prévient l'organisateur finit par « À ajouter à un Secret Santa. » Décision : `docs/decisions/2026-11-21-rejoindre-avec-plusieurs-secret-santa.md`. Spec : `docs/spec/v3/fete.md` (« Inviter, rejoindre »). À coder : ticket 115.
