# 169 — Au tirage, l'application prévient chacun ; l'organisateur garde les rappels

- **Dépend de** : 121 (« Ton enveloppe t'attend »), 129 (les plafonds), 130 (les adresses qui refusent)
- **Migration** : à voir (sans doute non)
- **Maquettes** : `ConfirmerTirage`, `Suivi`, `Envoi` (redessinées le 25 novembre 2026) ; `Renvoi`, `EnvoiSuspendu` (inchangées) ; `SelectionEmail` (pas redessinée : les changements sont écrits plus bas)

## Objectif

Aujourd'hui, après un tirage, l'organisateur doit prévenir chacun lui-même (« Prévenir par email »), et depuis le ticket 121 un compte reçoit en plus « Ton enveloppe t'attend » : deux emails pour le même tirage. Julien, le 25 novembre 2026 : l'application prévient tout le monde au tirage. L'organisateur sait avant qu'un email partira, voit après qu'il est parti, et n'a plus ce geste à faire. **Il garde les rappels.**

## À lire d'abord

- `docs/spec/v3/secret-santa.md`, « Au tirage, l'application prévient chacun » : tous les textes y sont
- README, section 13 (les messages, l'envoi groupé)
- Le compte rendu du ticket 121 (« Ton enveloppe t'attend », ce qui part tout de suite)
- `server/api/admin/[slug]/editions/[id]/draw.post.ts`, `redraw.post.ts`, `emails.post.ts` ; `server/utils/messages.ts` (`messageTypesFor`, `buildEmail`, `emailTargets`) ; `server/utils/newsEmail.ts`
- `app/pages/admin/[slug]/editions/[id]/index.vue`, `emails.vue`, `message.vue`, `rappel.vue`

## À faire

- [x] **Au tirage, l'application envoie** le message « le tirage est fait » à chaque participant qui a une adresse, avec ou sans compte : prénom, lien, budget et date, le mot de l'organisateur des réglages, dans la langue de la personne, signé « Le Secret Santa de {événement} ». Pose « envoyé », et journalise l'envoi comme fait par l'application.
- [x] **Un seul email** : pour un tirage, « Ton enveloppe t'attend » ne part plus par email en plus. La nouveauté reste dans l'application.
- [x] **Qui ne le reçoit pas** : pas d'adresse, adresse qui a refusé (ticket 130), compte réglé sur « Aucun email ». Ils restent à prévenir à la main.
- [x] **Un nouveau tirage** : l'application envoie de même « un nouveau tirage a eu lieu ».
- [x] **`ConfirmerTirage`** : la ligne « Chacun reçoit son lien par email », « Dès que le tirage est fait », et ses variantes quand des adresses manquent (spec).
- [x] **`Suivi`** : le bloc du haut dans ses deux états (quelqu'un à prévenir à la main ; tout le monde a reçu), les mentions sous un prénom, ceux qui n'ont pas d'adresse en premier. « Prévenir par email » disparaît.
- [x] **`Envoi`** devient « Le lien de Rose », pour quelqu'un sans adresse seulement : « Partager », « Copier », « Ajouter son adresse email ». Ajouter une adresse à quelqu'un qui reste à prévenir fait partir son email aussitôt.
- [x] **L'envoi à plusieurs** (`emails.vue`, `SelectionEmail`) ne propose plus que le rappel après un tirage : titre « Envoyer un rappel », l'aperçu du rappel, cochés d'avance ceux qui ont une adresse et n'ont pas ouvert, « Envoyer N rappels ». L'API refuse à l'organisateur l'annonce du tirage et celle d'un nouveau tirage par email ; elles restent pour le partage par téléphone d'une personne.
- [x] **Si l'envoi ne part pas** : le tirage est fait quand même ; « Les emails ne sont pas partis », « Renvoyer les emails » ; emails suspendus pour tous : `EnvoiSuspendu`.
- [x] **Réglages**, « Mot ajouté aux messages » : le texte devient « Ton mot part avec l'email du tirage et avec tes rappels. »
- [x] Trois langues, tournures neutres ; README 13 à jour ; tests (qui reçoit, qui ne reçoit pas, un seul email pour un compte, l'adresse ajoutée après coup, l'envoi qui échoue) et un parcours de bout en bout.

## Hors périmètre

- **Les rappels** : à une personne ou à plusieurs, ils restent des gestes de l'organisateur, tels quels.
- L'invitation d'avant le tirage, facultative : inchangée.
- Un tirage fait ailleurs (les demandes de réponse) : inchangé.
- « M'écrire par email », les emails que reçoit l'organisateur : inchangé.
- Les autres maquettes du suivi (`Suivi100`, `SuiviSansDate`, celles de « Devine qui ») montrent encore « Pas encore envoyé » : c'est `Suivi` qui fait foi.

## C'est fini quand

- [x] Après un tirage, chaque participant qui a une adresse a reçu un email, et un seul, sans que l'organisateur ait rien fait. (Le serveur d'essai n'a pas de clé d'email : vérifié jusqu'à l'appel du fournisseur et par l'échec qu'il rend ; le premier vrai tirage le montrera.)
- [x] L'organisateur lit avant le tirage qu'un email partira, et après, qui l'a reçu et qui reste à prévenir à la main.
- [x] Aucun écran ne lui propose plus d'envoyer l'annonce du tirage par email ; les rappels marchent comme avant.
- [x] Quelqu'un sans adresse reçoit son lien par le partage du téléphone ; si on lui ajoute une adresse, son email part.
- [x] `/controle` passe.

## Compte rendu

- **L'envoi** : `sendDrawEmails` (`server/http/drawEmails.ts`) écrit « Le tirage est fait », ou « Un nouveau tirage » quand le tirage avait été annulé, à chaque participant qu'il peut joindre et qui n'a pas encore *envoyé* : par lots de 50, signé « Le Secret Santa de {événement} » (`sender: null`), avec le mot et sa place des réglages, dans la langue de la personne, le pied « Signaler cet envoi » au nom de l'organisateur qui a tiré. Il pose *envoyé* et journalise `message_sent` avec l'acteur `system`. `POST …/draw` l'appelle après le tirage et rend `emails: { sent, failed }` (jamais une paire) ; le tirage est fait quoi qu'il arrive.
- **Qui ne le reçoit pas** (`reachOf`, `server/utils/drawEmails.ts`, testé) : sans adresse (`noAddress`), adresse qui a refusé nos emails ou compte réglé sur « Aucun email » (`noEmails`). Le suivi reçoit ce `reach` de chaque participant (`GET` de l'édition).
- **Un seul email** : « Ton enveloppe t'attend » est écrite `mailable: false` au tirage (`tellParticipants`), testé dans `tests/news.test.ts`. Un tirage fait ailleurs (`answers/validate`) n'est pas touché.
- **L'échec** sans colonne ni migration : quelqu'un qu'on peut joindre, sans *envoyé* et qui n'a pas ouvert, veut dire que l'envoi n'est pas parti (`drawEmailsState`). `POST …/draw-emails` (« Renvoyer les emails », et l'adresse ajoutée après coup) renvoie à ceux-là, ou à ceux qu'on lui nomme.
- **`ConfirmerTirage`** : la ligne « Chacun reçoit son lien par email » et ses trois variantes. **`Suivi`** : le bloc dans ses trois états (à partager à la main, avec « Partager le lien de Rose » quand il n'y en a qu'un et « Les 4 autres ont reçu leur lien par email. » ; « Chacun a reçu son lien par email », sans « À faire maintenant », deux chiffres, sans bouton ; « Les emails ne sont pas partis », « Renvoyer les emails », ou l'avis d'`EnvoiSuspendu`), les mentions sous un prénom (« Pas d'adresse email », « Ne reçoit pas d'emails », « Envoyé, pas encore consulté », « Résultat consulté · 2× », « Pas encore envoyé » seulement après un échec). « Prévenir par email » a disparu. **`Envoi`** : « Le lien de Rose », « Partager » et « Copier » côte à côte, la ligne « Ajouter son adresse email · Son lien partira par email » ; l'adresse enregistrée fait partir l'email aussitôt. Pour quelqu'un dont l'envoi a échoué, « Envoyer par email » passe par l'envoi de l'application.
- **L'envoi à plusieurs** : après un tirage, `emailTypesFor` ne garde que le rappel (l'écran, « Personnaliser le message » à plusieurs, et l'API, qui répond 409 à « Le tirage est fait » et « Un nouveau tirage ») ; titre « Envoyer un rappel », « Envoyer N rappels », cochés d'avance ceux qui ont une adresse et n'ont pas ouvert. Le partage par téléphone d'une personne garde tous les messages.
- **Réglages** : « Ton mot part avec l'email du tirage et avec tes rappels. » README 13.3 à jour.
- **Clés supprimées** : `follow.title`, `titleDone`, `help`, `actionReminder`, `screen.notifyCount`.
- **Décidé seul** : ceux qui ne reçoivent pas d'emails comptent dans « sans adresse email » ; le bloc d'un envoi échoué n'a pas de maquette ; « Ajouter son adresse email » ouvre le champ dans le panneau, comme avant (question Q-042, écarts notés dans `ECARTS-MAQUETTES.md`).
- **Tests** : `server/utils/drawEmails.test.ts` (qui reçoit, qui ne reçoit pas, une seule fois, l'état du suivi), `tests/news.test.ts` (l'enveloppe sans email) ; parcours `tests/e2e/draw-emails.spec.ts` (la ligne avant le tirage, l'API qui refuse l'annonce, l'échec et « Renvoyer les emails », « Le lien de Rose », « Envoyer un rappel ») ; `admin-edition`, `edition-cases` et `security` suivent les nouveaux textes et la réponse du tirage.
- **Réponse à Q-042** (la conception, le même jour) : A et C, comme codé ; le premier chiffre dit « à prévenir à la main » dès que l'un de ceux qu'il compte a une adresse mais ne reçoit pas d'emails. Fait dans un second commit.
- **Migration** : aucune. **Contrôle** : `pnpm controle --e2e` passé (252 parcours).
