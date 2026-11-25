# Les questions

Mode d'emploi : `docs/travail/README.md` et le skill `/question`.

## Ouvertes

Aucune.

## Réponses

### Q-041 — Les notifications du téléphone : chaque nouveauté, ou ce qui presse ? (ticket 124)

- **Pour** : Julien
- **Ce qui bloque** : rien. C'est codé comme B, et changer est petit (une condition dans `server/database/push.ts`).
- **Ce qu'on a trouvé** : le README 22.22 et la maquette `NotifReglage` disent de l'interrupteur « Notifications » : « Tout de suite, à chaque nouveauté ». Le ticket 124 dit « une notification du téléphone par nouveauté **qui presse** », et `NotifAutoriser` promet « Seulement ce qui te concerne : ton enveloppe, une invitation, une demande d'idées ».
- **Les choix** :
  - A. Chaque nouveauté (une coche, un cadeau rejoint, quelqu'un qui s'inscrit, de nouvelles idées sur une liste suivie…), comme le README.
  - B. Ce qui presse seulement (l'enveloppe, une invitation à tenir une liste, une demande d'idées, le rappel du jour J pour l'organisateur), comme le ticket et `NotifAutoriser` ; le reste reste dans l'application et le résumé.
- **Ce que je ferais** : B, codé ainsi : c'est ce que promet le panneau qui demande la permission, et le téléphone sonne moins. L'interrupteur dit « Tout de suite, quand quelque chose presse ».
- **Réponse de Julien (25 novembre 2026)** : B, ce qui presse seulement, comme c'est codé. L'interrupteur dit « Tout de suite, quand quelque chose presse ». La conception met la maquette `NotifReglage` au même texte ; le README 22.22 est à corriger par celui qui ferme le ticket 124.


### Q-040 — « Suspendre les inscriptions » dit qu'une adresse n'a pas de compte (ticket 129)

- **Pour** : Julien
- **Ce qui bloque** : rien. C'est codé comme A.
- **Ce qu'on a trouvé** : demander un lien de connexion ne dit jamais si l'adresse a un compte (README 22.5). Avec les inscriptions suspendues, une adresse inconnue reçoit « Les inscriptions sont en pause », et une adresse connue reçoit son lien : la réponse dit alors si l'adresse a un compte, le temps de la pause.
- **Les choix** :
  - A. Garder ainsi : c'est une pause d'urgence, courte, et la personne doit savoir pourquoi rien n'arrive.
  - B. La même réponse pour tous (« lien envoyé »), mais aucun email pour une adresse inconnue : rien ne se dit, et la personne attend un email qui ne vient pas.
- **Ce que je ferais** : A.
- **Réponse de Julien (25 novembre 2026)** : A, garder ce qui est codé. La pause est rare et courte, et la personne doit savoir pourquoi rien n'arrive.


### Q-039 — Les jauges « Requêtes, aujourd'hui » et « Dépense, ce mois » : d'où viennent les chiffres ? (ticket 129)

- **Pour** : Julien
- **Ce qui bloque** : deux jauges des plafonds de `V3Admin` ne sont pas là. Le reste du ticket est fait.
- **Ce qu'on a trouvé** : l'application ne voit ni le nombre de requêtes du jour ni la dépense du mois : ce sont des chiffres de Cloudflare. Les compter nous-mêmes voudrait dire une écriture en base à chaque requête, donc une dépense de plus. Ceux de Cloudflare se lisent par son API d'analyse (GraphQL), avec un jeton en lecture seule gardé en secret.
- **Les choix** :
  - A. Un jeton Cloudflare en lecture seule (`NUXT_CLOUDFLARE_API_TOKEN`), que Julien crée. Le tableau de bord lit les deux chiffres, au plus une fois par heure. À faire avec le ticket 127, le reste du tableau de bord.
  - B. Pas de jauge pour ces deux chiffres : la limite de dépense et l'alerte de budget de Cloudflare (la case de Julien) protègent déjà. Une ligne du tableau de bord mène au tableau de bord de Cloudflare.
  - C. Compter les requêtes en base : non recommandé (une écriture par requête).
- **Ce que je ferais** : B tout de suite, A avec le ticket 127.
- **Réponse de Julien (25 novembre 2026)** : B tout de suite, A avec le ticket 127. Les deux jauges restent de côté et une ligne du tableau de bord mène à celui de Cloudflare : le 129 peut se fermer là-dessus. Le jeton en lecture seule (`NUXT_CLOUDFLARE_API_TOKEN`), que Julien créera, vient avec le ticket 127 ; jamais de compte en base à chaque requête.



### Q-038 — Une date dans un seul champ : quelle piste ? (ticket 160)

- **Pour** : Julien (le choix), puis la conception (maquette et spec)
- **Ce qui bloque** : tout le ticket 160 après son premier temps. Les trois listes restent en place.
- **Ce qu'on a trouvé** : essayé sur une page d'essai, jamais commitée, avec Chrome (ordinateur et téléphone Android simulé) et WebKit, le moteur de Safari (iPhone simulé), en français, anglais et allemand. **Pas sur un vrai téléphone** : je n'en ai pas. La simulation ne montre ni le clavier qui s'ouvre, ni le calendrier ou les roulettes d'iOS et d'Android. Ce point reste à faire à la main : ouvrir les deux champs sur ton iPhone et sur un Android.
  - **`UInputDate`** (captures `captures/160-webkit-iphone-fr.jpg`, `160-chromium-android-en.jpg`, `160-chromium-ordi-de.jpg`) :
    - **l'ordre de la langue** : jour/mois/année en français, mois/jour/année en anglais, jour.mois.année en allemand ;
    - **le clavier** : chaque segment demande des chiffres (`inputmode="numeric"`), donc le pavé numérique sur un téléphone, en principe ;
    - **taper d'une traite** : au clavier seul, « 20122026 » donne le 20 décembre 2026, en passant seul d'un segment au suivant. Ça marche aussi avec des barres, « 20/12/2026 ». Une naissance, « 15071958 », marche aussi. Tab va au champ suivant, et Retour arrière vide les segments un à un ;
    - **un piège** : un mois qui commence par 1 attend un second chiffre (ce peut être 10, 11, 12). Pour janvier, « 5 1 2027 » donne donc le 5 décembre 127 ; il faut taper « 01 », une barre ou la flèche droite ;
    - **une date impossible** : le 31 février devient le 28 février, sans rien dire ;
    - **hors des bornes** : une date au-delà de `max-value` (2035 pour un événement) s'affiche, marquée invalide, et passe quand même dans la valeur. Il faudrait la refuser nous-mêmes ;
    - **pour un lecteur d'écran** : trois champs numériques nommés « jour », « mois », « année », traduits dans les trois langues par Nuxt UI. L'ensemble n'a pas de nom : on lui donnerait le nôtre.
  - **`<input type="date">`** : Chrome sur ordinateur se tape comme les segments (« 20122026 » suffit), avec une icône de calendrier au bout. Mais il suit la langue du navigateur, pas celle de l'application : en allemand, il dit 20/12/2026. Dans WebKit, ma frappe n'a rien rempli. Sur iPhone, d'après la décision du 20 novembre, il ouvre un calendrier.
- **Les choix** :
  - A. `UInputDate` partout, habillé comme nos champs : on tape sur un ordinateur, et au pavé numérique sur un téléphone. Pas de roulettes.
  - B. A sur un ordinateur, plus, sur un téléphone, une ligne « 20 décembre 2026 » qui ouvre notre panneau à trois roulettes. C'est un composant à écrire et à rendre accessible (clavier, lecteur d'écran, `prefers-reduced-motion`), plus deux façons de faire selon l'écran, à tester toutes les deux.
  - C. `<input type="date">` natif : rien à écrire, mais la langue du navigateur, un calendrier sur iPhone, et un comportement qui change d'un navigateur à l'autre.
- **Ce que je ferais** : A. Un seul champ, le même partout, qui suit la langue de l'application. Sur un téléphone, le pavé numérique tape la date aussi vite que trois roulettes. Les deux défauts se règlent chez nous : les bornes, en refusant la date hors limites, et une ligne de date en toutes lettres sous le champ (« 20 décembre 2026 ») pour qu'on voie ce qu'on a tapé. B reste possible plus tard, par-dessus A. À vérifier d'abord sur ton iPhone : le pavé numérique s'ouvre-t-il bien ?
- **Réponse de Julien (24 novembre 2026)** : A. `UInputDate` partout. La conception a mis à jour la spec (`docs/spec/v3/regles-d-ecran.md`, « Les dates »), la décision (`docs/decisions/2026-11-24-une-date-dans-un-seul-champ.md`) et les deux maquettes (`V3FeteNouvelle`, `ProcheNaissance`). À retenir pour coder :
  - le champ est habillé comme les autres champs du formulaire ; dans un formulaire tout en lignes, c'est une ligne qui s'écrit sur place ;
  - **la date en toutes lettres sous le champ**, dès que les trois segments sont remplis (« lundi 14 décembre 2026 » pour un événement, « 14 mars 2020 » pour une naissance) ;
  - une date hors des bornes est refusée par nous ;
  - le groupe porte le nom du champ pour un lecteur d'écran ;
  - pas de roulettes dans ce ticket.
  - **Reste à Julien** : l'essai sur son iPhone (le pavé numérique s'ouvre-t-il ?). Il a choisi A sans l'avoir fait ; si le pavé ne s'ouvre pas, le dire ici avant de fermer le ticket.
  - **Julien, 25 novembre 2026** : « c'est bon ». La conception le lit comme : l'essai sur son iPhone est fait et le pavé numérique s'ouvre. Elle lui a demandé de le confirmer ; le ticket 160 peut se fermer s'il ne dit pas le contraire.



### Q-037 — Quand « Lier à un Secret Santa » est-il dans le menu ? (ticket 155)

- **Pour** : Julien, ou la conception
- **Ce qui bloque** : rien. Codé comme la spec, en attendant.
- **Ce qu'on a trouvé** : le ticket 155 dit que la condition de l'entrée du menu « ne change pas » (un de mes Secret Santa de l'année n'a **aucune** liste). La spec (`listes.md`, « Lier et délier ») dit : « quand j'ai cette année un Secret Santa tiré qui **n'est pas lié à cette liste** ». Avec la condition du ticket, un Secret Santa déjà lié à « Noël 2026 » ne peut pas être déplacé depuis une autre liste où je figure : il n'y a ni pastille (rien n'est lié ici) ni entrée de menu pour ouvrir le panneau, alors que le ticket demande de pouvoir le cocher là, « Lié à « Noël 2026 » » sous son nom.
- **Les choix** :
  - A. La spec : l'entrée est là dès qu'un de mes Secret Santa tirés de l'année n'est pas lié à cette liste, lié ailleurs ou non.
  - B. Le ticket : seulement quand l'un d'eux n'a aucune liste ; on ne déplace un lien que depuis la liste qui l'a déjà (par sa pastille) ou depuis la page du Secret Santa.
- **Ce que je ferais** : A, codé ainsi.
- **Réponse de la conception (24 novembre 2026)** : A. C'est la spec qui fait foi : le panneau sert à lier **et à déplacer**, donc l'entrée du menu est là dès qu'un de mes Secret Santa tirés de l'année n'est pas lié à cette liste, qu'il soit lié ailleurs ou non. Le ticket 155 disait « ne change pas » à tort : il reprenait la condition d'avant le panneau.


### Q-036 — « Tu es invité » : une tournure neutre ? (ticket 145)

- **Pour** : la conception
- **Ce qui bloque** : rien. Les deux textes restent tels quels.
- **Ce qu'on a trouvé** : en relisant le français pour le ticket 145, deux textes parlent au lecteur au masculin, ce que « cette personne » ne règle pas : `auth.ts`, `invite.intro`, « Tu es invité au Secret Santa » (la page du lien d'un Secret Santa, maquettes `V3FeteRejoindre`, `RejoindreConnecte`) ; `adminEdition.ts`, le message prêt à envoyer, « Salut ! Tu es invité au Secret Santa « {group} » 🎁 ». L'anglais dit « You are invited », l'allemand ne dit pas de genre.
- **Les choix** :
  - A. Les garder (le masculin d'usage, comme « Celui qui m'a tiré »).
  - B. « On t'invite au Secret Santa » et « Salut ! On t'invite au Secret Santa « {group} » 🎁 ».
- **Ce que je ferais** : B, aussi court.
- **Réponse de la conception (23 novembre 2026)** : B, avec une nuance. La page du lien dit « On t'invite au Secret Santa ». Le message prêt à envoyer dit « Salut ! Je t'invite au Secret Santa « {group} » 🎁 » : c'est l'organisateur qui l'envoie lui-même, « je » est plus juste que « on ». La règle est dans `vocabulaire.md` (second tableau de « Cette personne », pas « il »), `secret-santa.md` et les maquettes sont à jour. À coder : ticket 146.

### Q-035 — « Il reçoit un email à ton nom » : une tournure neutre ? (tickets 139, 141)

- **Pour** : la conception
- **Ce qui bloque** : rien. Le texte de la spec est codé tel quel, dans les trois langues (`lists.inviteMembers.hint`).
- **Ce qu'on a trouvé** : `docs/spec/v3/listes.md`, « Quelqu'un d'autre », écrit « Il reçoit un email à ton nom, et devient membre de « Famille Camille ». » ; `CLAUDE.md` dit « L'application ne connaît pas le genre d'une personne : tournures neutres ». L'anglais dit « They get an email », l'allemand « Die Person bekommt ».
- **Les choix** :
  - A. Garder « Il reçoit… » (le masculin d'usage, comme « Celui qui m'a tiré »).
  - B. Une tournure neutre, par exemple « Un email à ton nom lui est envoyé, et cette personne devient membre de « Famille Camille ». »
- **Ce que je ferais** : B, si la conception trouve une phrase aussi courte.
- **Réponse de la conception (23 novembre 2026)** : B. « Cette personne reçoit un email à ton nom, et devient membre de « {name} ». » La règle est écrite dans `vocabulaire.md` (« Cette personne », pas « il ») : elle vaut pour toute personne précise qu'on invite ou qu'on ajoute, et quatre autres textes du français sont à tourner de même (l'invitation à tenir une liste, le nouvel organisateur). « il » reste quand il reprend un mot masculin (« l'organisateur : il peut… ») et dans « celui qui m'a tiré ». À coder : ticket 145. Spec (`listes.md`) et maquettes à jour.

### Q-034 — Le mot de la bascule : à qui, et que dire à ceux qui n'ont pas de compte ? (ticket 113)

- **Pour** : Julien
- **Ce qui bloque** : rien avant la bascule ; le choix de qui reçoit l'email du lendemain, le jour où Julien le lance. En attendant :
  - **le mot en tête de « Quoi de neuf »** va à tous les comptes créés avant la bascule (la règle du ticket 120, « les comptes créés avant une date »), qu'ils aient ou non un Secret Santa en cours ; la phrase sur le lien, à ceux qui tenaient une liste partagée par lien avant la bascule ;
  - **l'email** (`pnpm v3:mot`) part seulement aux **comptes** créés avant la bascule, non désactivés, qui ont un Secret Santa pas clôturé (y participent par leur adresse ou l'organisent) ou une liste dont le jour n'est pas passé.
- **Ce qu'on a trouvé** :
  - Le ticket 113 : « à ceux qui ont un Secret Santa ou une liste en cours » ; la décision du 21 novembre : « Un mot à ceux qui sont au milieu d'un Secret Santa ».
  - Le mot dit « Tes pistes de cadeaux sont devenues ta liste ». C'est vrai pour un participant **avec un compte** (0038). Pour un participant **sans compte**, `migration.md` dit que rien n'est créé à sa place : ses pistes restent en lecture seule, et il devra donner son adresse pour écrire une liste (`V3ListeAdresse`). La phrase serait fausse pour lui.
  - Un participant sans compte n'a pas de langue enregistrée, et l'email ne pourrait que pointer l'accueil (son lien personnel est chiffré).
- **Les choix** :
  - A. Comme en attendant : le mot à tous les comptes d'avant, l'email aux seuls comptes avec un Secret Santa ou une liste en cours ; les participants sans compte ne reçoivent rien (ils retrouvent leur page par leur lien, inchangé).
  - B. L'email aussi aux participants sans compte d'un Secret Santa en cours, avec un autre texte (sans « Tes pistes sont devenues ta liste »), qu'il faudrait écrire, et leur lien personnel, que seul le serveur peut déchiffrer (un envoi depuis l'application, pas un script).
  - C. Le mot de « Quoi de neuf » seulement aux comptes qui ont un Secret Santa ou une liste en cours, comme l'email.
- **Ce que je ferais** : A. Ceux qui n'ont pas de compte n'ont rien perdu, et leur lien marche encore ; leur écrire demanderait un texte et un envoi qui n'existent pas.
- **Réponse de Julien (22 novembre 2026)** : aucun des trois. « Personne n'utilise pour le moment, pas besoin de mot. » La bascule se fait sans mot : ni ligne en tête de « Quoi de neuf », ni email du lendemain. À retirer du ticket 113 et du code : le mot de « Quoi de neuf », `buildSwitchEmail`, `pnpm v3:mot`, leurs textes dans les trois langues et leurs tests ; l'étape « le lendemain » du pas-à-pas disparaît. La décision est notée dans `docs/decisions/2026-11-21-la-v3-se-publie-des-qu-elle-est-prete.md`.

### Q-032 — « Repartir d'une liste » : « une personne en commun » ne joue jamais, le bloc n'étant que dans une liste vide (ticket 119)

- **Pour** : Julien, puis la conception
- **Ce qui bloque** : rien. Le tri est codé en entier (`shared/utils/resumeChoices.ts`, testé), le troisième critère compris. Mais le bloc n'apparaît, et la reprise ne se fait, que dans un brouillon où personne n'est encore (`canResumeInto`, lot 27 : « pour que rien d'écrit ne se mélange à ce qui vient »). Une liste qui a déjà des personnes n'a donc jamais le bloc, et le critère 3 ne sert à rien. Je n'ai rien changé à la reprise.
- **Ce qu'on a trouvé** : `docs/spec/v3/listes.md`, « Repartir d'une liste » : « 3. si la liste a déjà des personnes, celles où figure au moins une de ces personnes » ; la maquette `ListeNouvelleReprendre` montre une liste vide. Le ticket 136 (« j'y suis déjà, en premier ») fera naître des listes avec une personne.
- **Les choix** :
  - A. Garder le bloc aux listes vides : le critère 3 attend.
  - B. Montrer le bloc tant que la liste n'a aucune idée, même avec des personnes, et dire comment la reprise se mêle à elles (les personnes déjà là gardent leur place, celles de l'ancienne liste s'ajoutent après, sans doublon).
- **Ce que je ferais** : A pour la bascule ; B avec le ticket 136, qui en aura besoin.
- **Réponse de Julien (22 novembre 2026)** : B. « Repartir d'une liste » est proposé tant que la liste n'a aucune idée, même avec des personnes. Les personnes déjà là gardent leur place, celles de l'ancienne liste s'ajoutent après, personne n'est mis deux fois ; les idées pas offertes d'une personne déjà là arrivent sous son prénom. La spec le dit : `docs/spec/v3/listes.md`, « Repartir d'une liste ». Maquette : `V3ListeSecretNouvelle`. À coder dans le ticket 136, pas avant.

### Q-033 — Une liste reprise garde, après son premier partage, la liste dont elle vient (ticket 119)

- **Pour** : Julien
- **Ce qui bloque** : rien, c'est fait ainsi en attendant. Pour que le bandeau d'une liste de l'an dernier mène à celle de cette année, il faut savoir, une fois celle-ci partagée, de quelle liste elle a été reprise. Jusqu'ici, `gift_lists.carried_from` s'effaçait au premier partage (lot 27). Il reste maintenant sur la liste ; seules les marques des idées s'effacent au premier partage, et la phrase « Reprise de Noël 2025 » ne se lit que tant que la liste est un brouillon. Pas de migration. La liste qui a servi ne sait rien de plus, et rien n'est montré à personne d'autre que le bouton du bandeau.
- **Ce qu'on a trouvé** : `docs/spec/v3/listes.md`, « Une liste d'une année passée » : « Si une liste de cette année a été reprise de celle-ci […] le bandeau y mène » ; README 22.20 : `carried_from` « effacés à la modification d'une idée et au premier partage ».
- **Les choix** :
  - A. Garder le lien après le partage (ce qui est fait).
  - B. Ne plus chercher la liste reprise : le bandeau mène à la liste de cette année du même événement tenue par la même personne, reprise ou non.
- **Ce que je ferais** : A : il suit la spec à la lettre, et ne montre rien de plus.
- **Réponse de Julien (22 novembre 2026)** : A. La liste reprise garde, après son premier partage, la liste dont elle vient ; seules les marques des idées s'effacent. Rien de plus n'est montré à personne. Rien à changer dans le code.

### Q-031 — « Ajouter un organisateur » fait entrer quelqu'un dans l'événement sans Secret Santa ni liste (ticket 117)

- **Pour** : Julien
- **Ce qui bloque** : la case « Aucune route n'ajoute un membre à un événement sans passer par un Secret Santa ou une liste », prise au pied de la lettre. En attendant, rien ne change : un organisateur ajouté depuis les réglages devient aussi membre de l'événement (« un organisateur participe par défaut », depuis la V2), sans rien sous son prénom dans « Membres ». C'est la seule exception, écrite dans le test qui vérifie la règle (`server/database/members.test.ts`).
- **Ce qu'on a trouvé** : `docs/decisions/2026-11-21-on-entre-par-un-secret-santa-ou-par-une-liste.md` : « Rien d'autre n'y fait entrer » ; `docs/spec/v3/fete.md`, « Les réglages de l'événement » : « Organisateurs : la liste, « Ajouter un organisateur » » ; `server/database/groups.ts`, `addOrganizer`. Un organisateur voit déjà l'événement et ses listes sans être membre (`memberWhereShared`, l'accueil).
- **Les choix** :
  - A. Garder l'exception : l'organisateur est membre, sans « par où ».
  - B. Un organisateur ajouté n'est pas membre : il voit et règle l'événement, et n'en devient membre qu'en entrant dans un Secret Santa ou une liste, comme les autres. Il n'est plus proposé d'office parmi les participants.
- **Ce que je ferais** : B, qui suit la décision sans exception ; mais c'est un changement pour les organisateurs d'aujourd'hui, d'où la question.
- **Réponse de Julien (22 novembre 2026)** : A. Un organisateur ajouté est membre de l'événement, comme aujourd'hui : c'est la seule exception à « on entre par un Secret Santa ou par une liste », et elle est écrite dans la décision. Dans « Membres », sa ligne commence par « Organise » (pas « Organisateur » : pas de genre) : `docs/spec/v3/fete.md`, « Les membres ». À coder : ticket 137.

### Q-029 — « Membres » est-elle ouverte aux membres, ou reste-t-elle aux organisateurs ? (ticket 117)

- **Pour** : la conception
- **Ce qui bloque** : rien. En attendant, « Membres » reste la page des organisateurs, comme avant : un membre ne l'ouvre pas, et la ligne des membres de la page de l'événement ne mène nulle part pour lui. « À ma liste » n'apparaît donc que pour un organisateur qui gère aussi une liste ; un membre qui gère une liste invite depuis la liste elle-même (« Qui verra ta liste ? › Inviter quelqu'un »).
- **Ce qu'on a trouvé** : `docs/spec/v3/fete.md`, « Les membres » : « L'organisateur lit à la suite « ne tire pas Hugo » et « pas d'adresse email » » (ce qui suppose que d'autres lisent la page) et « « À ma liste », une ligne par liste que je gère » ; le ticket : « selon ce que je peux faire ». Mais `docs/ARBORESCENCE.md` et le code (`requireGroupAccess`) la réservent aux organisateurs, et la page montre les exclusions du tirage et l'absence d'adresse, que les membres ne voient nulle part ailleurs.
- **Les choix** :
  - A. La garder aux organisateurs (comme aujourd'hui).
  - B. L'ouvrir aux membres : les prénoms et par où chacun est entré, « À ma liste » ; sans « ne tire pas », sans « pas d'adresse email », sans fiche de personne. Une route de lecture de plus pour les membres.
- **Ce que je ferais** : A tant que personne ne le demande : moins de données montrées, et inviter reste possible depuis la liste.
- **Réponse de la conception (22 novembre 2026)** : A, pour la bascule. « Membres » reste la page des organisateurs : elle montre les exclusions du tirage et l'absence d'adresse, que les membres ne lisent nulle part ailleurs. Pour un membre, la ligne des membres de la page de l'événement dit combien ils sont et ne mène nulle part : pas de chevron, pas un lien mort. « À ma liste » n'y apparaît que pour un organisateur qui gère aussi une liste ; un membre invite depuis sa liste. La spec le dit maintenant : `docs/spec/v3/fete.md`, « Les membres ». À vérifier dans le code : que la ligne ne soit pas un lien pour un membre. Ouvrir la page aux membres (les prénoms seuls) est signalé à Julien comme une idée pour plus tard.

### Q-030 — « Camille t'a ajouté au Secret Santa » s'accorde au masculin (ticket 117)

- **Pour** : la conception
- **Ce qui bloque** : rien. En attendant, la nouveauté dit « Camille t'ajoute au Secret Santa », au présent, comme Q-028 l'a décidé pour « Hugo s'inscrit par le lien ». En anglais « Camille added you to the Secret Santa », en allemand « Camille hat dich zum Wichteln hinzugefügt » (sans accord).
- **Ce qu'on a trouvé** : le ticket 117 (« Les nouveautés ») et Q-026 écrivent « Camille t'a ajouté au Secret Santa » ; `CLAUDE.md` : « L'application ne connaît pas le genre d'une personne : tournures neutres ». « t'a ajouté » devient faux pour Inès (« t'a ajoutée »).
- **Les choix** : A, « Camille t'ajoute au Secret Santa » ; B, « Camille t'a mis dans le Secret Santa » (même problème) ; C, « Tu participes au Secret Santa de Camille ».
- **Ce que je ferais** : A, déjà en place : la règle de Q-028.
- **Réponse de la conception (22 novembre 2026)** : A. « Camille t'ajoute au Secret Santa », au présent : la règle de Q-028, étendue à toute nouveauté (le présent, quand le passé demanderait un accord). Le ticket 117 et la réponse à Q-026 avaient tort d'écrire « t'a ajouté ». La spec le dit : `docs/spec/v3/secret-santa.md`, « Ses réglages ». Rien à changer dans le code.

### Q-028 — « Hugo s'est inscrit par le lien » s'accorde au masculin (ticket 116)

- **Pour** : la conception
- **Ce qui bloque** : rien. En attendant, la nouveauté des organisateurs dit « Hugo s'inscrit par le lien » (« Hugo s'inscrit par le lien (Les adultes) » quand l'événement a plusieurs Secret Santa cette année-là), et l'email « Hugo s'inscrit par le lien » en objet.
- **Ce qu'on a trouvé** : le ticket 116 écrit « Hugo s'est inscrit par le lien » ; `CLAUDE.md` : « L'application ne connaît pas le genre d'une personne : tournures neutres ». « s'est inscrit » devient faux pour Inès. Le réglage, lui, dit « Quelqu'un s'inscrit par le lien » (`V3TirageReglages`).
- **Les choix** : A, « Hugo s'inscrit par le lien » (le présent, comme le réglage) ; B, « Inscription de Hugo par le lien » ; C, « Hugo s'est inscrit » tel quel.
- **Ce que je ferais** : A, déjà en place : neutre, court, et le même verbe que le réglage.
- **Réponse de la conception (22 novembre 2026)** : A. « Hugo s'inscrit par le lien », au présent, en nouveauté comme en objet d'email, avec le nom du Secret Santa entre parenthèses quand l'événement en a plusieurs cette année-là. Le ticket 116 avait tort d'écrire « s'est inscrit » : l'application ne connaît pas le genre. La spec le dit maintenant : `docs/spec/v3/secret-santa.md`, « Ses réglages ». Rien à changer dans le code.

### Q-027 — « L'an prochain ? » dans le palmarès d'un événement qui ne revient pas (ticket 115)

- **Pour** : la conception
- **Ce qui bloque** : rien. Dans un événement qui ne revient pas chaque année, la dernière image dit maintenant « C'est tout » (Q-016) ; mais l'image de mon Père Noël dit encore, si je n'avais pas fait de pronostic, « Tu n'avais pas fait de pronostic. L'an prochain ? ». En attendant, je n'y ai pas touché.
- **Ce qu'on a trouvé** : `participant.game.story.noGuessBody` (`shared/i18n/locales/*/participant.ts`) ; `docs/spec/v3/vocabulaire.md`, « Devine qui hors de Noël », ne parle que de la dernière image.
- **Les choix** : A, « Tu n'avais pas fait de pronostic. » seul, dans un événement qui ne revient pas ; B, « La prochaine fois ? » partout ; C, laisser tel quel.
- **Ce que je ferais** : A, comme « C'est tout » : on ne promet pas une année suivante qui ne viendra pas.
- **Réponse de la conception (22 novembre 2026)** : A. Dans un événement qui ne revient pas chaque année, la phrase est « Tu n'avais pas fait de pronostic. », sans « L'an prochain ? ». Dans un événement qui revient, elle ne change pas. C'est la règle de « C'est tout » (Q-016), étendue à toute phrase du palmarès qui promet une année suivante : `docs/spec/v3/vocabulaire.md`, « Devine qui hors de Noël ». À faire dans le ticket 115, trois langues.

### Q-018 — Le compte créé « à la première chose écrite » depuis un lien personnel : peut-on ouvrir une session sur la foi du lien, et si un compte existe déjà ? (ticket 107)

- **Pour** : Julien
- **Ce qui bloque** : le parcours d'un participant sans compte qui écrit sa liste depuis sa page `/p/…`. En attendant, je code tout le reste du ticket 107 (« Celui qui m'a tiré », la carte du résultat, la migration, la fin des pistes) ; ce parcours-là attend la réponse.
- **Ce qu'on a trouvé** : `docs/spec/v3/listes.md`, « Sans compte » : « Le compte se crée tout seul à la première chose écrite […] On le dit sur le moment (`V3ListeCompteCree`) : « Un compte a été créé avec ton adresse, pour retrouver ta liste. » ». Rien ne dit comment la personne reste connectée ensuite. Or le lien personnel se transfère (« un lien copié dans une messagerie », dit la même section) : il ne prouve pas que celui qui l'ouvre possède l'adresse. Aujourd'hui, se connecter passe toujours par un lien reçu à l'adresse (`server/api/auth/link.post.ts`).
- **Les choix** :
  - A. La première idée écrite crée le compte **et ouvre une session** sur ce compte neuf, sans rien d'autre à faire. Si un compte existe déjà pour l'adresse, pas de session : « Connecte-toi pour écrire ta liste » et un lien envoyé à l'adresse. Simple pour la personne ; quelqu'un à qui on a transféré le lien entre dans un compte neuf qui ne contient que ce que le lien montrait déjà.
  - B. La première idée crée le compte, mais la session ne s'ouvre qu'en confirmant l'adresse par le lien reçu (comme `V3ListeAdresse` le fait pour qui n'a pas d'adresse). Plus sûr, une étape de plus, et l'idée attend la confirmation.
- **Ce que je ferais** : A. Le compte neuf ne donne accès à rien de plus que le lien lui-même, et le message de `V3ListeCompteCree` ne dit pas « confirme ton adresse ». Un compte qui existe déjà n'est jamais ouvert par un lien personnel.
- **Réponse de Julien (21 novembre 2026)** : A. La première idée écrite depuis un lien personnel crée le compte et ouvre sa session, avec le message de `V3ListeCompteCree`. Un compte qui existe déjà pour l'adresse n'est jamais ouvert par le lien : on lui envoie un lien de connexion.

### Q-019 — Les goûts d'un Secret Santa vont dans la fiche « Moi » : ils seront lus plus largement qu'avant (ticket 107)

- **Pour** : Julien
- **Ce qui bloque** : rien dans le code ; la migration `0037_v3_hints_to_lists` est écrite comme la spec le dit, appliquée en local seulement. La réponse compte avant de la publier.
- **Ce qu'on a trouvé** : `docs/spec/v3/migration.md`, « Les pistes de cadeaux » : « `giftPortraits` va dans la fiche « Moi » ». Or les goûts de la fiche « Moi » s'affichent sur chaque liste où la personne figure (« ses goûts », `PersonTastes`), y compris une liste publique. Aujourd'hui, ce portrait n'est lu que par celui qui a tiré la personne. Le critère du ticket (« personne ne voit une idée qu'il ne voyait pas avant ») parle des idées, pas des goûts.
- **Les choix** :
  - A. Comme la spec : le portrait remplit la fiche « Moi » (seulement si elle est vide), et se lit partout où sont lus ses goûts.
  - B. Ne rien migrer des goûts : celui qui a tiré lit encore l'ancien portrait de cette année, en lecture seule ; la fiche « Moi » se remplit à la main.
  - C. Migrer, mais prévenir la personne à sa prochaine visite (« Tes goûts de Secret Santa sont maintenant sur ta fiche »).
- **Ce que je ferais** : B, l'application se veut exemplaire sur les données : on ne publie pas plus largement ce que quelqu'un a écrit pour une seule personne. La migration ne déplacerait alors que les idées, qui restent réservées à celui qui a tiré.
- **Réponse de Julien (21 novembre 2026)** : A. « Les goûts devraient être cross-list » : ils sont ceux de la personne, les mêmes sur toutes les listes où elle figure. Le portrait des pistes va dans la fiche « Moi », comme la migration `0037` le fait.

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
- **Réponse de Julien (21 novembre 2026)**, contre celle de la conception : la question ne se pose plus, parce que **le lien d'invitation est celui d'un Secret Santa, pas celui d'un événement**. On s'inscrit à un Secret Santa, et du coup à son événement ; chaque Secret Santa a son lien. Décision : `docs/decisions/2026-11-21-le-lien-d-invitation-est-celui-d-un-secret-santa.md`. Spec : `docs/spec/v3/secret-santa.md` (« Inviter par lien »), `docs/spec/v3/fete.md` (« Inviter, rejoindre »). Maquettes à jour : `V3FeteInviter`, `V3FeteRejoindre`, `RejoindreConnecte`, `V3FeteMembres`, `V3FeteReglages`, `V3TirageReglages`. À coder : ticket 116. D'ici là, ton choix d'attente tient.

### Q-020 — Une liste n'a pas d'année en base : je la range dans l'année de sa date. Faut-il une colonne ? (ticket 108)

- **Pour** : Julien
- **Ce qui bloque** : rien. L'année d'un événement a bien sa ligne en base depuis le ticket 101 (`party_years`), et ses Secret Santa y sont rattachés (`secret_santas.year_id`). Une liste, elle, n'est rattachée qu'à ses événements (`gift_lists.party_id`, `gift_list_parties`), pas à une année. En attendant, **pas de migration** : une liste appartient à l'année de sa date (`gift_lists.event_date`, sinon sa date de création). Toute liste faite pour un événement prend la date de son année ; je l'ai corrigé pour qu'une liste faite en janvier pour un événement qui revient prenne la date de l'année qui vient, et non celle de l'année finie.
- **Ce qu'on a trouvé** : `docs/spec/v3/modele.md`, « L'année » : « Événement (permanent) → l'année de l'événement → ses Secret Santa et ses listes ». Le compte rendu du ticket 101 : « L'archivage des années passées attend le ticket 108 […] Je n'ajoute pas de colonne pour lui maintenant. » En local, toutes les listes ont une date.
- **Les choix** :
  - A. Garder la date de la liste (rien à migrer). Une liste dont on change la date à la main change d'année.
  - B. Une colonne `gift_lists.year_id` (migration 0039), remplie depuis la date. Plus juste pour une liste partagée dans deux événements aux dates différentes, mais une table de plus à tenir à chaque création et à chaque partage.
- **Ce que je ferais** : A tant qu'aucun cas réel ne la contredit.
- **Réponse de Julien (22 novembre 2026)** : A, la date suffit. Pas de colonne, pas de migration : une liste appartient à l'année de sa date. Spec : `docs/spec/v3/modele.md` (« L'année »). Ton choix d'attente devient la règle.

### Q-021 — Une liste d'une année passée devient-elle en lecture seule partout ? (ticket 108)

- **Pour** : Julien, puis la conception s'il faut une maquette
- **Ce qui bloque** : rien. « Une année passée ne se modifie par aucune route » est fait pour l'année et ses Secret Santa : tout ce qui écrit (côté organisateur et côté participant) répond « Cette année est finie », sauf clôturer et dévoiler, que le ticket laisse inchangés. Les listes de l'année, elles, gardent leurs règles d'aujourd'hui : la page de l'année passée ne montre aucun geste, mais la ligne d'une liste ouvre la liste comme avant, où l'on peut encore écrire et cocher.
- **Ce qu'on a trouvé** : `docs/spec/v3/fete.md`, « Une année passée » : « Les listes de l'année, en lecture seule. » Aucune maquette ne montre une liste en lecture seule pour celui qui la tient, et une liste peut être dans plusieurs événements. Cocher après coup ce qu'on a offert compte dans « Tu as offert 3 cadeaux ».
- **Les choix** :
  - A. La liste d'une année passée ne se modifie plus nulle part : ni idée, ni coche, ni partage (une maquette du document en lecture seule, pour celui qui la tient et pour les autres).
  - B. Comme aujourd'hui : seule la page de l'année passée est en lecture seule.
- **Ce que je ferais** : A, avec sa maquette ; B en attendant, déjà en place.
- **Réponse de Julien (22 novembre 2026)** : ni tout à fait A, ni tout à fait B. La liste d'une année passée **reste ouverte** (on y écrit, on y coche : c'est ce qu'il faut pour un mariage, où l'on offre après la date), mais **un bandeau en haut dit de quelle année elle est** et mène à celle de cette année. La page de l'année passée, elle, reste sans aucun geste, comme tu l'as faite. Décision : `docs/decisions/2026-11-22-une-liste-d-une-annee-passee-reste-ouverte.md`. Spec : `docs/spec/v3/listes.md` (« Une liste d'une année passée »). Maquette : `V3ListeAnneePassee`. À coder : ticket 119.

### Q-022 — « Ses 3 ans » : rien ne dit pour qui un événement est fait (ticket 108)

- **Pour** : la conception
- **Ce qui bloque** : le titre d'une année passée d'un anniversaire. `docs/spec/v3/lignes.md` : « pour un événement fait pour un proche dont on connaît la naissance, « Ses 3 ans » » ; `V3FeteAnniversaire` montre « Ses 3 ans » et « 7 cadeaux offerts à Zoé ». Or un événement ne garde pas pour qui il est fait (la catégorie remplit la date depuis la naissance, puis le lien se perd). En attendant, le titre est le nom de l'année, comme pour Noël : « Anniversaire 2025 ».
- **Les choix** : A, garder le nom de l'année ; B, retenir sur l'événement le proche pour qui il est fait (une colonne, une migration, et le choix du proche à la création).
- **Ce que je ferais** : A pour la V3 ; B se décide avec « Bientôt », qui crée déjà l'anniversaire d'un proche.
- **Réponse de la conception (22 novembre 2026)** : B, et pas plus tard. Trois maquettes en dépendent (« ses 4 ans », « Ses 3 ans », « 7 cadeaux offerts à Zoé »), et « Pour qui ? » existe déjà à la création : il suffit de ne plus jeter la réponse. Un anniversaire retient le proche pour qui il est fait ; les réglages ont une ligne « Pour » qui sert aussi aux anniversaires déjà créés. Décision : `docs/decisions/2026-11-22-un-anniversaire-sait-pour-qui-il-est-fait.md`. Spec : `docs/spec/v3/categories.md` (« Pour un anniversaire »). À coder : ticket 118. D'ici là, « Anniversaire 2025 » reste. Julien peut dire non.

### Q-023 — L'objet de l'invitation à tenir une liste, « au nom de l'occasion » : le nom de l'événement devant, ou le titre de la liste ? (ticket 110)

- **Pour** : la conception
- **Ce qui bloque** : rien. En attendant, l'objet reste celui de la maquette `ListeInvitationEmail` : « Camille t'invite à tenir la liste « Noël 2026 » ». Dans la V3, une liste faite pour un événement porte son nom, donc l'objet nomme déjà l'occasion.
- **Ce qu'on a trouvé** : le ticket 110 : « L'invitation à tenir une liste (`ListeInvitationEmail`) : les mots de la V3, l'objet au nom de l'occasion. » `secret-santa.md` (« Les objets des emails ») ne parle que des emails d'un Secret Santa. Une liste n'a pas toujours d'événement (`gift_lists.party_id` peut être vide), et son titre peut avoir été changé.
- **Les choix** :
  - A. Garder l'objet de la maquette : le titre de la liste, qui est le nom de l'occasion tant qu'on ne l'a pas changé.
  - B. Mettre le nom de l'événement devant, comme les emails d'un Secret Santa : « Famille Camille : Camille t'invite à tenir la liste « Famille Camille » », quitte à le dire deux fois ; sans événement, l'objet d'aujourd'hui.
- **Ce que je ferais** : A, qui ne répète rien.
- **Réponse de la conception (22 novembre 2026)** : A. L'objet reste celui de la maquette, avec le titre de la liste : il nomme déjà l'occasion, et mettre le nom de l'événement devant le dirait deux fois. « L'objet au nom de l'occasion », dans le ticket 110, ne voulait rien dire de plus : c'était mal écrit. Spec : `docs/spec/v3/secret-santa.md` (« Les objets des emails », dernier paragraphe).

### Q-025 — Le README, `habiller.py` et `generateurs/README.md` citent encore des maquettes périmées : les laisser ? (ticket 111)

- **Pour** : la conception
- **Ce qui bloque** : la case « Aucun fichier hors de `docs/spec/v3/maquettes.md` ne cite une maquette périmée », prise au pied de la lettre. En attendant, le code, les tests, `ARBORESCENCE.md` et `ECARTS-MAQUETTES.md` n'en citent plus aucune ; le reste n'a pas été touché.
- **Ce qu'on a trouvé** : `README.md` en cite une trentaine (`AccueilDevoileAvant`, `PistesListe`, `NotifCentre`, `ListeNouvelle`…), dans des paragraphes datés qui racontent ce qui a été décidé et codé en V2. `docs/refonte/sorbet/habiller.py` a des retouches pour `AccueilVide`, `AccueilDemandeAcceptee`, `ListesVide`, `PistesVide`, `Rejoindre` (sans effet : les fichiers n'existent plus). `docs/refonte/generateurs/README.md` cite `GroupeMembres` et `Rejoindre`. Les citations de `PLAN.md`, `docs/decisions/`, `docs/spec/` et des tickets faits ne se touchent pas.
- **Les choix** :
  - A. Les laisser : ce sont des récits datés (le README décrit la V2 jusqu'à la bascule) ou des outils de la conception ; la case vaut pour ce que Claude Code tient.
  - B. Que la conception nettoie `habiller.py` et `generateurs/README.md`, et que le README renvoie à `maquettes.md` pour ce qui remplace chaque nom.
- **Ce que je ferais** : A pour le README ; B pour `habiller.py`, s'il doit encore servir.
- **Réponse de la conception (22 novembre 2026)** : A, partout. Le `README.md` raconte la V2 dans des paragraphes datés, et il perd ces parties à mesure que la V3 les remplace : on ne le réécrit pas pour des noms de maquettes. `habiller.py` et `generateurs/README.md` sont des outils de la conception : leurs quatre retouches pour des fichiers qui n'existent plus ne font rien, je les retirerai quand je retoucherai l'outil. La case « Aucun fichier hors de `maquettes.md` ne cite une maquette périmée » vaut pour ce que tu tiens (le code, les tests, `ARBORESCENCE.md`, `ECARTS-MAQUETTES.md`) : elle est remplie.

### Q-024 — Supprimer les treize maquettes orphelines ? (ticket 111)

- **Pour** : Julien
- **Ce qui bloque** : rien. Le ticket dit « si Julien est d'accord » et ce n'est pas écrit : les fichiers restent en attendant (`maquettes/` et `maquettes-sorbet/` ont toujours le même nombre de fichiers, 349).
- **Ce qu'on a trouvé** : `docs/spec/v3/maquettes.md` (« Neuf fichiers orphelins ») : `AdminAcces`, `AdminAccesMenu`, `AdminPlusieursDemandes`, `AdminSansDemande`, `FeteAjouterListe`, `FetePartagee`, `FetePartageeAjoutee`, `Souhaits`, `SouhaitsVide` ; et les quatre du ticket, hors du canevas et de l'index : `ListeIdeeBulle`, `ListeIdeeBulleGras`, `ListeSansPersonneA`, `ListeSansPersonneB`. Aucun code, aucun test, ni `ARBORESCENCE.md` ni `ECARTS-MAQUETTES.md` ne les cite ; seuls `PLAN.md` (archive) et `maquettes.md` le font.
- **Les choix** :
  - A. Les supprimer des deux dossiers (26 fichiers) ; l'historique Git les garde.
  - B. Les garder.
- **Ce que je ferais** : A. Un mot suffit, et Claude Code le fait dans un petit commit (les maquettes sont à la conception, d'où l'attente).
- **Réponse de Julien (22 novembre 2026)** : A, oui. Supprime les treize maquettes des deux dossiers (26 fichiers), dans un petit commit ; l'historique Git les garde. La conception a retiré leur paragraphe de `docs/spec/v3/maquettes.md`. C'est aussi une ligne du ticket 114, au cas où.

### Q-026 — L'inventaire des nouveautés, pour relecture (ticket 120)

- **Pour** : Julien
- **Ce qui bloque** : rien. Le ticket demande de poser l'inventaire ici avant de coder ; en attendant la relecture, il est codé tel quel (une ligne de « Quoi de neuf » et, quand la spec le marque ●, un point sur la ligne). Changer le niveau ou retirer une nature est un petit changement.
- **Ce qu'on a trouvé** : ce que l'application envoie ou signale aujourd'hui (`server/utils/notifications.ts`, `server/plugins/reminders.ts`, `server/plugins/guesses.ts`, `server/http/hints.ts`, `server/http/guesses.ts`, `server/http/nudges.ts`, `server/http/listInvite.ts`, `server/api/invite/[code]/join.post.ts`, le journal), classé d'après le README 22.22 :
  - **Ce qui presse** :
    - le tirage est fait, « ton enveloppe t'attend » (aujourd'hui : l'email que l'organisateur envoie) → nouveauté `envelope`, pour chaque participant qui a un compte ;
    - quelqu'un te demande des idées (email `PistesEmail`) → `hint_request`, pour celui à qui on demande, sans dire qui ;
    - une invitation à tenir une liste (email `ListeInvitationEmail`) → `list_invite`, si l'adresse a un compte ;
    - pour l'organisateur, le jour J approche et certains n'ont pas découvert (email du matin) → `reminder` ;
    - « une invitation à rejoindre un groupe », « la réponse à une demande de groupe » : n'existent plus en V3 (on entre par un Secret Santa ou une liste), rien.
  - **Le reste** :
    - de nouvelles idées sur une liste que je peux ouvrir sans la tenir (aujourd'hui : rien, ou l'email « des pistes sont arrivées » à celui qui avait demandé) → `new_ideas` pour les membres des événements où elle est partagée avec tous et ceux qui y ont coché ; et `receiver_ideas` (« De nouvelles idées t'attendent ») pour celui qui a tiré quelqu'un qui la tient, sur son propre Secret Santa, à la place de `new_ideas` ;
    - quelqu'un a coché sur une liste que je tiens → `ticked`, regroupé dans la journée (« 2 cadeaux ont été cochés sur ta liste ») ;
    - quelqu'un se joint à mon cadeau à plusieurs → `joined_gift`, pour celui qui le mène ;
    - le tirage est dévoilé → `revealed` ; le palmarès est arrivé (email) → `palmares` ;
    - quelqu'un a rejoint l'événement par le lien (email) → `joined`, pour les organisateurs ;
    - toutes les enveloppes sont ouvertes (email) → `all_viewed`, pour les organisateurs ;
    - **pas de nouveauté pour l'instant** : les alertes du journal (elles ont déjà leur signal sur l'accueil et la page du participant), le point de « Devine qui » et le rappel du jeu (emails aux organisateurs et aux joueurs ; la ligne « Devine qui » dit déjà « À toi de jouer » avec son point), les messages de l'organisateur (emails qu'il écrit lui-même).
  - Pour les organisateurs, les nouveautés `reminder`, `all_viewed` et `joined` s'écrivent même quand leur email est coupé dans les réglages : le réglage reste celui de l'email.
  - Aucun email ne change (ticket 121).
- **Les choix** :
  - A. Garder cet inventaire.
  - B. Changer un niveau, ajouter les alertes du journal ou « Devine qui », ou retirer une nature.
- **Ce que je ferais** : A.
- **Réponse de Julien (22 novembre 2026)** : A, « c'est très bien » : l'inventaire reste tel quel. Deux natures de plus arriveront avec les tickets 116 et 117, où la conception les a écrites : « Camille a partagé sa liste avec toi » et « Camille t'a ajouté au Secret Santa » ; et la nouveauté `joined` dira « s'est inscrit par le lien », puisque le lien est celui d'un Secret Santa.
