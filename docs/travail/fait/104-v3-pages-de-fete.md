# 104 — V3 : la fête (sa page, « Pour quelle occasion ? », membres, réglages, inviter, quitter)

- **Dépend de** : 101, 103
- **Migration** : non
- **Maquettes** : `V3Fete`, `V3FeteOrganisateur`, `V3FeteAnniversaire`, `V3FeteNouvelle`, `V3FeteMembresReprendre`, `V3FeteReglages`, `V3FeteMembres`, `V3FeteInviter`, `V3FeteRejoindre`, `V3FeteQuitter`

## Objectif

Les pages du groupe deviennent celles de la fête. Une fête se crée par « Pour quelle occasion ? », avec une catégorie qui remplit le reste. Un membre peut quitter une fête.

## À lire d'abord

- `docs/spec/v3/fete.md`
- `docs/spec/v3/accueil-et-creation.md` (« Une autre occasion »)
- `docs/spec/v3/categories.md`
- `docs/spec/v3/regles-d-ecran.md`
- `docs/decisions/2026-11-20-reglages-de-la-fete-et-du-secret-santa.md`
- `docs/decisions/2026-11-20-les-dates-en-trois-listes.md`

## À faire

- [x] La page d'une fête, vue par un membre et par un organisateur ; la variante « pour quelqu'un ».
- [x] « Pour quelle occasion ? » : les six catégories, « Pour qui ? » pour un anniversaire, le nom, la date en trois listes, « Elle revient chaque année ».
- [x] « Reprendre les membres d'une autre fête ».
- [x] Les réglages de la fête, réduits à ce qui est à elle, avec la ligne vers les réglages du Secret Santa.
- [x] Les membres, l'invitation par lien, la page du lien d'invitation.
- [x] Quitter une fête : l'écran qui dit ce qui sort et ce qui reste, et la règle (mes listes sortent, mes coches restent).
- [x] Le composant de date en trois listes, partagé avec la date de naissance d'un proche ; `AdminDateField` et son calendrier ne servent plus aux dates de fête.
- [x] Les anciennes adresses du groupe redirigent vers celles de la fête.

## Hors périmètre

- Les réglages du Secret Santa (ticket 105).
- Les listes dans la page de la fête : les lignes sont là, leurs règles viennent avec le ticket 106.
- Le choix du mot « fête » ou « événement » (Q-001) : écrire « fête », par des clés faciles à changer.

## C'est fini quand

- [x] Les dix maquettes sont reproduites, avec les écarts notés dans `docs/refonte/ECARTS-MAQUETTES.md` (section « La fête »).
- [x] Créer une fête d'anniversaire depuis « Bientôt » remplit le nom et la date. « Bientôt » vient avec le ticket 103 ; il ouvrira `/f/nouvelle?categorie=birthday&proche=<id>`, dont le remplissage est vérifié par `tests/e2e/party.spec.ts`.
- [x] Quitter une fête retire mes listes de cette fête et garde mes coches (un test le vérifie).
- [x] `/controle` passe.

## Compte rendu

Fait sur la branche `v3`, après le 101. **Le 104 est passé avant le 103**, décidé par Julien le 20 novembre 2026. Le travail commencé sur le 103 attend dans un stash.

### Ce qui est fait

- **Les adresses** : une fête vit à `/f/[nom]` (choisi par Julien) : sa page, `membres`, `invitation`, `reglages`, `exclusions`, `journal`.
  - Les anciennes adresses du groupe y mènent : `partyPathOf`, testé, et `app/middleware/redirects.global.ts`, avec une redirection 301.
  - Les éditions restent sous `/admin/[nom]/editions` jusqu'au 105.
- **Le serveur** :
  - `server/http/party.ts` (`requireParty`) : un organisateur ou le super-admin gère la fête ; un membre (une personne de la fête à mon adresse) la voit ; les autres reçoivent un refus (403).
  - `server/database/parties.ts` : la page, la création, le départ.
  - `server/utils/parties.ts`, pur et testé.
  - Les routes `/api/parties` (création), `/api/parties/candidates`, `/api/parties/[slug]` (page et réglages) et `/api/parties/[slug]/leave`.
- **La page d'une fête** :
  - Elle montre la catégorie et « tous les ans », le nom, la date de son année et son décompte, les membres (« Inviter » pour l'organisateur), les Secret Santa de l'année et les listes des membres que je peux voir.
  - Un membre a « Quitter cette fête », avec son panneau.
  - Une fête « pour quelqu'un » montre sa liste d'abord.
- **« Pour quelle occasion ? »** (`/f/nouvelle`) :
  - les six catégories, qui remplissent le nom, la date et la récurrence (`newPartyDefaults`, testé) ;
  - « Pour qui ? » parmi mes proches pour un anniversaire ;
  - la date en trois listes ;
  - puis « Qui est de la fête ? », avec les membres des fêtes que j'organise.
  - Avec `?categorie=birthday&proche=<id>`, l'écran arrive rempli.
- **Le composant de date** `UiDateSelects`, partagé avec la date de naissance d'un proche.
- **Les réglages de la fête** : la catégorie, la date, « revient chaque année », l'email « Quelqu'un rejoint la fête par le lien », les organisateurs, et la suppression pour le super-admin.
- **Les membres, l'invitation et la page du lien** parlent de la fête. La page du lien dit « 🎄 Noël · le 25 décembre 2026 · 5 membres ».
- **Le départ** :
  - mes listes sortent de la fête, et une liste qui ne serait plus dans aucune fête reçoit la sienne ;
  - mes coches restent ;
  - ma personne perd son adresse et ne participe plus. Elle reste pour les tirages déjà faits.
- **Les tests** :
  - Vitest : `server/utils/parties.test.ts`, `shared/utils/categories.test.ts`, `memberFields.test.ts`, `navigation.test.ts`, et `server/database/parties.test.ts`, qui tourne sur une vraie base grâce à `tests/d1.ts`, une imitation de D1 posée sur `node:sqlite`.
  - Playwright : `tests/e2e/party.spec.ts`, et les parcours existants mis aux nouvelles adresses et aux nouveaux mots.

### Décidé avec Julien (20 novembre 2026)

- L'adresse `/f/[nom]`.
- Les lignes n'ont que leur titre, en attendant les textes (Q-010).
- Pas de « Les années passées » avant le ticket 108.
- Après « Créer la fête », l'écran d'aujourd'hui de ce qu'on venait créer : une édition (`?pour=secret-santa`), une liste (`?pour=liste`), sinon la fête.

### Décidé seul

- **Les réglages du tirage du groupe** (éviter la même personne, pistes, mot ajouté aux messages, emails du tirage, et les exclusions) vivent sur `/f/[nom]/reglages/secret-santa` jusqu'au 105. C'est la cible de la ligne « Réglages du Secret Santa ». Sans cette page, ils n'auraient plus été accessibles.
- **Quitter une fête**, faute de colonne (le ticket ne prévoit pas de migration) : ma personne garde sa ligne, sans adresse et sans participer. Un organisateur ne quitte pas. Une liste qui ne serait plus dans aucune fête reçoit la sienne, pour que toute liste reste dans au moins une fête.
- **Le journal du groupe** n'a plus de ligne sur la page de la fête, puisque la maquette n'en montre pas. On y arrive depuis l'édition et depuis le lien personnel, comme avant.
- **Créer une fête est libre pour tout compte**, comme le dit la spec. Jusqu'au 105 (la limite de 3 Secret Santa), son organisateur peut aussi y créer des éditions sans quota.
- **Les autres choix** sont dans `docs/refonte/ECARTS-MAQUETTES.md` : le nom proposé selon la catégorie, la catégorie et la date dans un panneau, les fêtes à reprendre, « Un autre Secret Santa » seulement quand aucun n'est en cours.

### Questions posées

Q-010 (les textes sous les lignes), Q-011 (« Camille te demande ta liste »), Q-012 (« chez » ou « dans »), Q-013 (l'ordre 103 et 104, avec les réponses de Julien à reporter).

### Commits

- `52bb7b9` feat(ui) : la date en trois listes.
- `3575d7f` feat(parties) : la page, la création, les réglages, le départ.
- Puis les parcours mis à jour, les écarts, les questions et ce compte rendu.
