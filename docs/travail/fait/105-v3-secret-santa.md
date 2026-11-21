# 105 — V3 : le Secret Santa (le créer, ses réglages, la limite de 3, plus de demande)

- **Dépend de** : 101, 104
- **Migration** : oui
- **Maquettes** : `V3TirageQuelleFete`, `V3TirageNouveau`, `V3TirageReglages`, `V3TirageLimite`, `V3TirageNeutre`, `V3FeteMembresComplet`, `RejoindreFerme`, `ProcheNaissance`

## Objectif

Organiser un Secret Santa ne demande plus rien à personne. On le crée depuis « Créer », dans une fête qu'on organise ou dans une nouvelle. Son formulaire est tout en lignes, et il a ses propres réglages.

## À lire d'abord

- `docs/spec/v3/secret-santa.md`
- `docs/spec/v3/accueil-et-creation.md`
- `docs/spec/v3/regles-d-ecran.md`
- `docs/spec/v3/modele.md` (les limites)
- `docs/decisions/2026-11-20-plus-de-demande-limite-de-trois.md`
- `docs/decisions/2026-11-20-des-lignes-pas-des-champs.md`

## À faire

- [x] « Pour quelle occasion ? » d'un Secret Santa : mes fêtes que j'organise, « Une autre occasion ».
- [x] Le formulaire de création en six lignes, chacune avec sa page ; les valeurs reprises du Secret Santa précédent.
- [x] Plusieurs Secret Santa la même année dans une fête : « Un autre Secret Santa ».
- [x] Les réglages du Secret Santa (le tirage au sort, Devine qui, les messages, les emails).
- [x] La limite : 3 Secret Santa par compte, 30 membres par fête, vérifiée côté serveur ; l'écran de la limite.
- [x] Une fête complète (`docs/spec/v3/fete.md`, « 30 membres au plus ») : l'état à la place d'« Ajouter une personne », le lien d'invitation en pause tout seul, `RejoindreFerme` pour celui qui l'ouvre.
- [x] La fin des demandes : les écrans de demande et d'administration des demandes disparaissent ; les demandes en attente sont acceptées par la migration ; l'interrupteur d'urgence est au ticket 109 (pause ou demande : Q-007).
- [x] Le résultat hors d'une fête de catégorie Noël : sans « Père Noël ».
- [x] « Devine qui » hors d'une fête de catégorie Noël : les variantes sans « Père Noël » (`docs/spec/v3/vocabulaire.md`, « Devine qui hors de Noël »).

## Hors périmètre

- Le tirage lui-même et ses règles, le suivi, les envois, « Devine qui », le journal : inchangés.
- La carte du résultat et sa ligne vers la liste (ticket 107).
- Le réglage « Pistes de cadeaux » : il disparaît avec le ticket 107.

## C'est fini quand

- [x] Un compte sans aucun droit particulier crée un Secret Santa de bout en bout (`tests/e2e/signup.spec.ts`).
- [x] Le quatrième est refusé par le serveur et montre `V3TirageLimite` (même parcours).
- [x] Les maquettes du ticket sont reproduites, avec les écarts notés dans `ECARTS-MAQUETTES.md` (section « Le Secret Santa »).
- [x] Le trente et unième membre est refusé par le serveur ; l'organisateur voit `V3FeteMembresComplet` (`tests/e2e/edition-cases.spec.ts`).
- [x] `/controle` passe : trois langues, mots, textes en dur, lint, types, 697 tests unitaires, 143 parcours.

## Compte rendu

### Fait

- **Plus de demande.** Migration `0034_v3_secret_santa_limit.sql` (appliquée en local seulement) : la table `group_requests` part, une demande en attente est accordée par le changement même ; `accounts.group_quota` devient `secret_santa_limit`, 3 pour tout le monde. Les écrans, routes, emails et textes des demandes sont retirés ; l'administration n'a plus de carte « À traiter », et la fiche d'un compte règle sa limite (« Peut en organiser 3 · 2 en cours · il lui en reste 1 »), comme le confirme la réponse à Q-007.
- **La limite**, vérifiée par le serveur : 3 Secret Santa non clôturés dans les fêtes que j'organise (`server/utils/quota.ts`, `server/database/quota.ts`), le super-admin sans limite ; 30 membres par fête (ajout d'une personne, lien d'invitation : ses places ne dépassent jamais ce qui reste avant 30, `linkPlaces`). Une fête peut avoir plusieurs Secret Santa la même année.
- **« Créer › Un Secret Santa »** : le panneau devient « Pour quelle occasion ? » (mes fêtes, « Une autre occasion »), ou mène à `/secret-santa/limite` (`V3TirageLimite`). Route `GET /api/secret-santas/new`.
- **Le formulaire en six lignes** (`/admin/[fête]/editions/nouvelle`, chaque ligne sur `…/nouvelle/[ligne]`) : nom (catégorie et année), date (celle de la fête, `shared/utils/newSecretSanta.ts`), budget, Devine qui et mot ajouté repris du Secret Santa précédent ; ses réglages aussi viennent du précédent.
- **Les réglages du Secret Santa** (`…/editions/[id]/reglages`, `V3TirageReglages`) sont les siens : « Réglages de la fête » y mène pour le dernier de l'année. Les pages de réglages du tirage portées par la fête sont retirées ; le mot ajouté aux messages a sa page `…/editions/[id]/mot-messages`.
- **La fête complète** : « 30 sur 30 », l'état à la place d'« Ajouter une personne », le lien « En pause · la fête est complète », `RejoindreFerme` par le lien.
- **Hors de Noël** : la page du résultat ne disait déjà pas « Père Noël ». Devine qui (écrans, palmarès, panneau de l'organisateur, message au groupe, deux emails) lit une variante `…Neutral` écrite dans les trois langues (`santaKey`, `useT({ christmas })`), choisie par la catégorie de la fête.

### Décidé seul

Le détail des écarts est dans `ECARTS-MAQUETTES.md`. En bref : sans fête à moi, « Un Secret Santa » va droit à « Pour quelle occasion ? » ; un premier Secret Santa dit « 5 membres de la fête. » ; « Devine qui » choisi à la création finit à 18 h le jour de la fête ; les réglages gardent sous les quatre sections une section « La fête » (date, budget, petit mot) et « Pistes de cadeaux » jusqu'au 107 ; les exclusions restent à la fête (Membres, page du Secret Santa). L'interrupteur « Suspendre les nouveaux Secret Santa » est au ticket 109.

### Questions posées

Q-015 (où changer date, budget et petit mot d'un Secret Santa créé), Q-016 (« Joyeux Noël » à la fin du palmarès hors de Noël), Q-017 (quel Secret Santa rejoint celui qui s'inscrit par le lien quand il y en a plusieurs).

### Commits

- `d1581e9` docs : le travail de la conception des 20 et 21 novembre, commité tel quel avant de commencer.
- `c437520` feat(secret-santa) : plus de demande, la limite, les 30 membres, la migration 0034.
- `c58f5db` feat(secret-santa) : « Créer », le formulaire en lignes, les réglages, la fête complète, Devine qui hors de Noël.
- Puis ce compte rendu, avec le ticket rangé.
