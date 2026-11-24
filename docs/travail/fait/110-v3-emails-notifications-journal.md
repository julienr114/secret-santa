# 110 — V3 : les emails, les notifications et le journal avec les mots et les règles de la V3

- **Dépend de** : 102, 106, 107
- **Migration** : non
- **Maquettes** : `PistesEmail`, `ModerationEmail`, `DevineEmailRappelAuto`, `DevineEmailRappelEncore`, `DevineEmailPalmares`, `DevineEmailOrgaPoint`, `DevineEmailOrgaFin`, `ListeInvitationEmail`, `Journal`

## Objectif

Tout ce qui s'écrit hors des écrans principaux suit la V3 : l'objet d'un email nomme l'événement, une demande d'idées ne nomme jamais personne, l'email qui la porte invite à écrire sa liste.

## À lire d'abord

- `docs/spec/v3/secret-santa.md` (« Le résultat », « Les objets des emails »)
- `docs/spec/v3/vocabulaire.md`
- `docs/spec/v3/accueil-et-creation.md` (« Hors de l'application » : ce qu'aucun texte envoyé ne dit)
- `docs/spec/v3/listes.md` (« Le partage d'une liste, par stades » : ce que l'email de modération arrête)
- `README.md`, sections 9 et 13

## À faire

- [x] Les objets : le nom de l'événement d'abord (« Famille Camille : ton enveloppe t'attend ») ; le nom du Secret Santa entre parenthèses seulement s'il y en a plusieurs la même année.
- [x] L'email de demande d'idées (`PistesEmail`) : « Aide-la : écris ta liste de cadeaux, ou quelques mots sur ce que tu aimes. » · « Écrire ma liste ». Le lien ouvre la liste réservée à celui qui a tiré (ticket 107).
- [x] La demande d'idées ne nomme personne, nulle part : notifications, journal (le résumé du matin suivra la même règle, ticket 121). « Quelqu'un te demande des idées de cadeaux ».
- [ ] L'email de modération (`ModerationEmail`) : c'est le lien public qui est arrêté ; la liste reste partagée dans ses événements. *Sans objet ici : l'arrêt du lien public n'existe pas encore, il vient avec le ticket 132, qui cite cette maquette.*
- [x] L'invitation à tenir une liste (`ListeInvitationEmail`) : les mots de la V3, l'objet au nom de l'occasion.
- [x] Le journal : « Journal de l'événement », et ses lignes sans « groupe », « édition » ni « pistes ».
- [x] Les emails de « Devine qui » hors d'un événement de catégorie Noël : les variantes sans « Père Noël ».

## Hors périmètre

- La page « Quoi de neuf » et les points rouges (ticket 120), le résumé du matin (121), les notifications du téléphone (124) : ils n'existent pas encore.
- Les lignes de l'accueil (ticket 112).
- Le mot envoyé le jour de la bascule (ticket 113).

## C'est fini quand

- [x] Un test sur chaque email vérifie son objet, avec un et avec deux Secret Santa dans l'événement.
- [x] Aucun email, aucune notification, aucune ligne de journal ne contient le prénom de celui qui demande des idées (un test le vérifie).
- [x] Les maquettes du ticket sont reproduites, dans les trois langues (écarts dans `ECARTS-MAQUETTES.md` ; `ModerationEmail` attend le ticket 132).
- [x] `/controle` passe.

## Compte rendu

**Fait.**

- **Les objets des emails** (`emailSubject`, `subjectSantaName` dans `server/utils/messages.ts`, `santaNameForSubject` dans `server/database/editions.ts`) : chaque email d'un Secret Santa commence par le nom de l'événement, puis le nom du Secret Santa entre parenthèses quand l'événement en a plusieurs la même année (« Famille Camille (Les enfants) : ton enveloppe t'attend »). « Secret Santa de … », « Wichteln … », « Devine qui, … » et « La fête approche dans « … » » disparaissent des objets. Valent pour les messages de l'organisateur envoyés par email, les quatre emails de « Devine qui », la demande d'idées et les trois emails aux organisateurs (arrivée d'un membre, toutes les enveloppes ouvertes, « le jour J approche »).
- **La demande d'idées** (`PistesEmail`) : « Bonjour Inès, » · « La personne qui t'offre un cadeau pour Noël 2026 (Famille Camille) ne sait pas quoi choisir. » · « Aide-la : … » · le bouton « Écrire ma liste » (vers `/p/…/liste`, la liste réservée à celui qui a tiré) · « On ne te dira pas qui demande… Tu ne recevras ce message qu'une fois. »
- **Elle ne nomme plus personne, même une fois le tirage dévoilé** : la variante nommée (« Hugo cherche une idée… », « Ton nom est donné ») est supprimée, dans l'email et dans le panneau, avec ses clés dans les trois langues. La route ne lit aucun prénom et n'écrit rien au journal (testé) ; il n'existe pas encore de notification à l'écran (ticket 120).
- **Le journal** était déjà aux mots de la V3 (ticket 102) : « Journal de l'événement », « Tous les membres voient ce journal… », aucune ligne avec « groupe », « édition » ou « pistes ».
- **« Devine qui » hors de Noël** : les variantes existaient (tickets 102, 105) ; un test vérifie qu'aucun des emails du jeu ne dit « Père Noël » hors de Noël.
- **L'invitation à tenir une liste** : déjà aux mots de la V3 ; l'objet reste celui de la maquette, en attendant Q-023.
- **Tests** : Vitest sur chaque objet, avec un et deux Secret Santa (`messages.test.ts`, `notifications.test.ts`, `hints.test.ts`), sur la base pour le compte des Secret Santa de l'année (`tests/email-subjects.test.ts`) ; Playwright : `revealed.spec.ts` vérifie que la demande reste anonyme après le dévoilement, `hints.spec.ts` (déjà là) qu'aucun écran ni le journal ne dit qui a demandé.

**Décidé seul, et pourquoi.**

- « ton enveloppe t'attend » sans prénom, comme l'exemple de la spec ; les autres objets gardent le leur. Le nom du Secret Santa est écrit tel quel (« Les enfants »), sans le passer en minuscule.
- Les corps des emails de « Devine qui » et leurs signatures restent ceux de la Correction 17 (Julien), plus récente que les maquettes ; la demande d'idées signe « Le Secret Santa de Famille Camille » selon la même règle, au lieu de « Under the Tree ».
- `ModerationEmail` n'est pas codé : la modération n'existe pas, elle vient avec le ticket 132, qui cite cette maquette. La case reste ouverte, sans bloquer le ticket.
- Les pieds des emails (« Ne plus recevoir d'emails », « Signaler cet envoi », « Ce que l'application fait de tes données ») attendent les tickets 130 à 132.

**Écarts avec les maquettes** : section « Les emails et le journal (V3, ticket 110) » de `docs/refonte/ECARTS-MAQUETTES.md`.

**Questions posées** : Q-023 (l'objet de l'invitation à tenir une liste : le titre de la liste ou le nom de l'événement devant).

**Migrations** : aucune.

**Contrôle** : `pnpm controle --e2e` : langues, mots, textes en dur, lint, types, 802 tests Vitest, 165 tests Playwright : tout passe (le test instable de `security.spec.ts` est passé cette fois).

**Commits** : `23cd54b` docs: ticket 110 started ; `4494374` feat(emails): subjects name the event, the request for ideas names nobody ; et celui qui range ce ticket.
