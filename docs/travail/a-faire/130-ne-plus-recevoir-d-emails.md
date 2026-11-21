# 130 — Ne plus recevoir d'emails, et les garde-fous contre les abus

- **Dépend de** : 113, 121
- **Migration** : oui (les adresses bloquées, les signalements d'envoi)
- **Maquettes** : `StopEmail`, `StopDemande`, `StopConfirme`, `StopSaisie`, `StopEnvoi`

## Objectif

N'importe qui peut refuser les emails d'Under the Tree d'un geste, depuis n'importe quel email, sans compte. Une adresse qui a refusé ne reçoit plus rien, quel que soit l'événement, la liste ou la personne qui l'ajoute. C'est ce qui permet d'ouvrir l'application à d'autres.

## À lire d'abord

- `README.md`, sections 13 et 22.25
- L'archive `docs/refonte/PLAN.md`, section 6, « Lots 35 et 36 » (les points relus avec Julien le 19 novembre 2026)

## À faire

- [ ] **Le cœur, en fonctions pures**, testé d'abord : une adresse est-elle bloquée ; quels emails partent quand même (la connexion demandée par la personne) ; ce qu'un envoi groupé fait d'une adresse bloquée.
- [ ] **Base** : les adresses bloquées, par empreinte (le poivre du serveur), avec la date et la cause (la personne, un rejet, une plainte) ; les signalements d'envoi (quel email, quel événement, quel compte).
- [ ] **Le lien en bas de chaque email**, signé, sans connexion (`StopEmail`). Il ouvre une page qui pose la question (`StopDemande`) : seul le bouton bloque, jamais l'ouverture du lien, que des messageries suivent toutes seules. Puis « C'est noté » et « Annuler » (`StopConfirme`). L'en-tête de désabonnement en un clic, lui, bloque directement.
- [ ] **Tous les envois passent par le contrôle** (`server/http/email.ts`) : aucun email vers une adresse bloquée, sauf la connexion.
- [ ] **L'avertissement à la saisie** d'une adresse bloquée, partout où une adresse se saisit (`StopSaisie`), et dans « Envoyer par email » (`StopEnvoi`). Il dit clairement que la personne l'a demandé ; une adresse bloquée parce qu'elle n'existe pas a sa propre phrase.
- [ ] **« Signaler cet envoi »**, dans le pied des emails, et la vue du super-admin ; couper l'envoi d'emails d'un événement.
- [ ] **Les retours du fournisseur** (rejets, plaintes) bloquent l'adresse.
- [ ] **Le premier email à une adresse** : qui l'a ajoutée, pourquoi, ce qu'on sait d'elle, comment refuser.
- [ ] **Lever son blocage** dans « Me prévenir ».
- [ ] **Un seul refus, pas deux réglages** : pour une adresse qui a un compte, « Ne plus recevoir d'emails » met aussi « Par email » sur « Aucun email » (ticket 121). Dans l'autre sens, choisir « Aucun email » ne bloque que les emails automatiques : ceux qu'un organisateur envoie à la main restent possibles tant que la personne n'a pas refusé par le lien. Dire la différence dans « Me prévenir ».
- [ ] Trois langues, `tests/e2e`, README 13 à jour.

## Hors périmètre

- Le pied d'email qui parle des données (ticket 131).
- Signaler un contenu, la file du super-admin (ticket 132) : même file, mais pas ce ticket.

## C'est fini quand

- [ ] Ouvrir le lien ne bloque rien ; toucher le bouton bloque ; « Annuler » débloque.
- [ ] Une adresse bloquée ne reçoit aucun email d'aucun événement (un test le vérifie), mais reçoit son lien de connexion si elle le demande.
- [ ] Un rejet du fournisseur bloque l'adresse.
- [ ] Les cinq maquettes sont reproduites.
- [ ] `/controle` passe.

## Compte rendu

À remplir par Claude Code à la fin : ce qui a été fait, ce qui a été décidé seul (et pourquoi), les écarts avec les maquettes, les questions posées, les commits.
