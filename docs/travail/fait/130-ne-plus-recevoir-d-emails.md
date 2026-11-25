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

- [x] **Le cœur, en fonctions pures**, testé d'abord : une adresse est-elle bloquée ; quels emails partent quand même (la connexion demandée par la personne) ; ce qu'un envoi groupé fait d'une adresse bloquée.
- [x] **Base** : les adresses bloquées, par empreinte (le poivre du serveur), avec la date et la cause (la personne, un rejet, une plainte) ; les signalements d'envoi (quel email, quel événement, quel compte).
- [x] **Le lien en bas de chaque email**, signé, sans connexion (`StopEmail`). Il ouvre une page qui pose la question (`StopDemande`) : seul le bouton bloque, jamais l'ouverture du lien, que des messageries suivent toutes seules. Puis « C'est noté » et « Annuler » (`StopConfirme`). L'en-tête de désabonnement en un clic, lui, bloque directement.
- [x] **Tous les envois passent par le contrôle** (`server/http/email.ts`) : aucun email vers une adresse bloquée, sauf la connexion.
- [x] **L'avertissement à la saisie** d'une adresse bloquée, partout où une adresse se saisit (`StopSaisie`), et dans « Envoyer par email » (`StopEnvoi`). Il dit clairement que la personne l'a demandé ; une adresse bloquée parce qu'elle n'existe pas a sa propre phrase.
- [x] **« Signaler cet envoi »**, dans le pied des emails, et la vue du super-admin ; couper l'envoi d'emails d'un événement.
- [x] **Les retours du fournisseur** (rejets, plaintes) bloquent l'adresse.
- [x] **Le premier email à une adresse** : qui l'a ajoutée, pourquoi, ce qu'on sait d'elle, comment refuser.
- [x] **Lever son blocage** dans « Me prévenir ».
- [x] **Un seul refus, pas deux réglages** : pour une adresse qui a un compte, « Ne plus recevoir d'emails » met aussi « Par email » sur « Aucun email » (ticket 121). Dans l'autre sens, choisir « Aucun email » ne bloque que les emails automatiques : ceux qu'un organisateur envoie à la main restent possibles tant que la personne n'a pas refusé par le lien. Dire la différence dans « Me prévenir ».
- [x] Trois langues, `tests/e2e`, README 13 à jour.

## Hors périmètre

- Le pied d'email qui parle des données (ticket 131).
- Signaler un contenu, la file du super-admin (ticket 132) : même file, mais pas ce ticket.

## C'est fini quand

- [x] Ouvrir le lien ne bloque rien ; toucher le bouton bloque ; « Annuler » débloque.
- [x] Une adresse bloquée ne reçoit aucun email d'aucun événement (un test le vérifie), mais reçoit son lien de connexion si elle le demande.
- [x] Un rejet du fournisseur bloque l'adresse.
- [x] Les cinq maquettes sont reproduites.
- [x] `/controle` passe.

## Compte rendu

**Fait.**

- **Le cœur, en fonctions pures** (`server/utils/stopEmail.ts`, `server/utils/providerEvents.ts`, testés) :
  - l'empreinte d'une adresse, un HMAC avec le secret du serveur (`emailPrint`) ;
  - les liens signés « Ne plus recevoir d'emails » (l'adresse) et « Signaler cet envoi » (l'événement et le compte) ;
  - ce qui part vers une adresse bloquée (`mayReceive`) : le lien de connexion seulement ;
  - l'avis à la saisie, que la personne l'a demandé ou que l'adresse ne semble pas exister (`blockWarning`) ;
  - le pied d'un email (`withFoot`) ;
  - la signature des événements du fournisseur, et ce qu'ils bloquent (`verifyProviderEvent`, `blocksOf`).
- **La base** : migration `0051_v3_email_blocks`. Elle crée `email_blocks` (l'empreinte, la cause, la date), `email_seen` (les adresses déjà écrites, par empreinte) et `email_reports` (l'événement, le compte, la date), et ajoute `parties.emails_off`. Aucune adresse en clair.
- **Tous les envois passent par le contrôle** (`sendEmails`, avec `server/database/emailBlocks.ts`) :
  - rien vers une adresse bloquée, sauf la connexion ;
  - rien de ce qu'un organisateur envoie depuis un événement que le super-admin a coupé ;
  - sous chaque email, sauf la connexion, le lien d'arrêt et l'en-tête `List-Unsubscribe` en un clic (RFC 8058) ; au premier email à une adresse, ce que l'application sait d'elle et qui l'a donnée ; sous ce qu'un organisateur envoie lui-même, « Signaler cet envoi ».

  L'envoi groupé range une adresse bloquée avec celles qu'on n'a pas : elle n'est pas marquée « envoyé ».
- **Les pages sans session** :
  - `/arreter/[jeton]` (`StopDemande`, puis `StopConfirme` et « Annuler »). L'ouvrir ne bloque rien ; le bouton bloque, et met « Par email » sur « Aucun email » pour un compte ;
  - `/signaler/[jeton]`.

  Les routes `/api/stop/…` et `/api/report-send/…` sont limitées en débit.
- **L'avis à la saisie** (`UiEmailBlockNote`, `StopSaisie`) : sur la fiche d'un membre, à l'ajout d'une personne (`PersonFields`), à l'invitation à tenir une liste et au partage d'une liste par adresse. Dans « Envoyer par email » (`StopEnvoi`), la ligne dit « A demandé à ne plus recevoir d'emails ».
- **« Me prévenir »** : « Tu as demandé à ne plus recevoir d'emails… » avec « Recevoir à nouveau les emails » ; avec « Aucun email », la phrase qui dit la différence avec le lien.
- **Le super-admin** : « Adresses qui ont refusé les emails » et « Envois signalés » sur le tableau de bord, et `/admin/envois-signales` avec « Couper ses emails » par événement.
- **Les retours du fournisseur** : `POST /api/email/events`, le webhook signé de Resend. Un rejet définitif ou une plainte bloque l'adresse.
- **README 13.4**, les tests Vitest (`stopEmail`, `providerEvents`, et `tests/email.test.ts` : une adresse bloquée ne reçoit rien d'aucun envoi mais reçoit son lien de connexion, le premier email, le signalement, l'événement coupé) et Playwright (`stop-emails.spec.ts`).

**Ce qui reste à Julien** : dans Resend, le webhook vers `/api/email/events` (rejets et plaintes), et son secret dans `NUXT_RESEND_WEBHOOK_SECRET`. Sans lui, un rejet ne bloque rien (voir `docs/travail/migrations-a-publier.md`).

**Décidé seul, et pourquoi.**

- **Le jeton du lien d'arrêt porte l'adresse**, signée : la page l'affiche, comme la maquette, et seul celui qui a reçu l'email l'a.
- **Le secret des empreintes** est celui des liens personnels (`NUXT_DATA_KEY`), avec un domaine à part pour chaque usage : pas de nouveau secret à gérer.
- **Le premier email** ne sait pas toujours qui a donné l'adresse : quand on le sait, on le dit (ce qu'envoie un organisateur, l'invitation à tenir une liste, le partage d'une liste) ; sinon la phrase dit seulement ce que l'application sait.
- **Couper les emails d'un événement** n'arrête que ce que ses organisateurs envoient eux-mêmes, pas les nouveautés de ses membres : c'est l'envoi signalé qu'on arrête.
- **Les plafonds par événement et par compte** du 22.25 (« lot 34 ») ne sont pas dans ce ticket : ils sont à ouvrir l'application à tous (ticket 128).

**Écarts avec les maquettes** : section « Ne plus recevoir d'emails » de `docs/refonte/ECARTS-MAQUETTES.md`.

**Questions posées** : aucune.

**Migrations** : `0051_v3_email_blocks`, appliquée en local seulement, après `0048` à `0050`.

**Contrôle** : `pnpm controle --e2e`, tout est passé : 1 083 tests Vitest et 235 parcours.

**Commit** : un seul, `feat(emails): stop receiving emails, by a link at the foot of each one, and the guards against abuse`. Il coche aussi, dans le ticket 129, « Savoir qu'on est attaqué » : les deux chiffres qui manquaient sont venus ici.
