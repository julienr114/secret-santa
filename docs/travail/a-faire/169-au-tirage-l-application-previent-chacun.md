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

- [ ] **Au tirage, l'application envoie** le message « le tirage est fait » à chaque participant qui a une adresse, avec ou sans compte : prénom, lien, budget et date, le mot de l'organisateur des réglages, dans la langue de la personne, signé « Le Secret Santa de {événement} ». Pose « envoyé », et journalise l'envoi comme fait par l'application.
- [ ] **Un seul email** : pour un tirage, « Ton enveloppe t'attend » ne part plus par email en plus. La nouveauté reste dans l'application.
- [ ] **Qui ne le reçoit pas** : pas d'adresse, adresse qui a refusé (ticket 130), compte réglé sur « Aucun email ». Ils restent à prévenir à la main.
- [ ] **Un nouveau tirage** : l'application envoie de même « un nouveau tirage a eu lieu ».
- [ ] **`ConfirmerTirage`** : la ligne « Chacun reçoit son lien par email », « Dès que le tirage est fait », et ses variantes quand des adresses manquent (spec).
- [ ] **`Suivi`** : le bloc du haut dans ses deux états (quelqu'un à prévenir à la main ; tout le monde a reçu), les mentions sous un prénom, ceux qui n'ont pas d'adresse en premier. « Prévenir par email » disparaît.
- [ ] **`Envoi`** devient « Le lien de Rose », pour quelqu'un sans adresse seulement : « Partager », « Copier », « Ajouter son adresse email ». Ajouter une adresse à quelqu'un qui reste à prévenir fait partir son email aussitôt.
- [ ] **L'envoi à plusieurs** (`emails.vue`, `SelectionEmail`) ne propose plus que le rappel après un tirage : titre « Envoyer un rappel », l'aperçu du rappel, cochés d'avance ceux qui ont une adresse et n'ont pas ouvert, « Envoyer N rappels ». L'API refuse à l'organisateur l'annonce du tirage et celle d'un nouveau tirage par email ; elles restent pour le partage par téléphone d'une personne.
- [ ] **Si l'envoi ne part pas** : le tirage est fait quand même ; « Les emails ne sont pas partis », « Renvoyer les emails » ; emails suspendus pour tous : `EnvoiSuspendu`.
- [ ] **Réglages**, « Mot ajouté aux messages » : le texte devient « Ton mot part avec l'email du tirage et avec tes rappels. »
- [ ] Trois langues, tournures neutres ; README 13 à jour ; tests (qui reçoit, qui ne reçoit pas, un seul email pour un compte, l'adresse ajoutée après coup, l'envoi qui échoue) et un parcours de bout en bout.

## Hors périmètre

- **Les rappels** : à une personne ou à plusieurs, ils restent des gestes de l'organisateur, tels quels.
- L'invitation d'avant le tirage, facultative : inchangée.
- Un tirage fait ailleurs (les demandes de réponse) : inchangé.
- « M'écrire par email », les emails que reçoit l'organisateur : inchangé.
- Les autres maquettes du suivi (`Suivi100`, `SuiviSansDate`, celles de « Devine qui ») montrent encore « Pas encore envoyé » : c'est `Suivi` qui fait foi.

## C'est fini quand

- [ ] Après un tirage, chaque participant qui a une adresse a reçu un email, et un seul, sans que l'organisateur ait rien fait.
- [ ] L'organisateur lit avant le tirage qu'un email partira, et après, qui l'a reçu et qui reste à prévenir à la main.
- [ ] Aucun écran ne lui propose plus d'envoyer l'annonce du tirage par email ; les rappels marchent comme avant.
- [ ] Quelqu'un sans adresse reçoit son lien par le partage du téléphone ; si on lui ajoute une adresse, son email part.
- [ ] `/controle` passe.

## Compte rendu

À remplir par Claude Code à la fin : ce qui a été fait, ce qui a été décidé seul (et pourquoi), les écarts avec les maquettes, les questions posées, les commits.
