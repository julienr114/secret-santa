# 113 — V3 : la bascule (publier la V3)

- **Dépend de** : 102, 106, 107, 108, 110, 111, 112, 114, 115, 116, 117, 120, 118, 119, 135, 136, 137 ; et 138 à 145, demandés avant la bascule le 23 novembre 2026
- **Migration** : oui, c'est elle qu'on publie
- **Maquettes** : aucune (c'est une marche à suivre)

## Objectif

La V3 remplace l'application en ligne, d'un coup, pendant que des gens s'en servent pour Noël 2026. Personne ne perd rien, ceux qui sont au milieu d'un Secret Santa retrouvent tout à sa place, et on sait revenir en arrière.

## À lire d'abord

- `docs/decisions/2026-11-21-la-v3-se-publie-des-qu-elle-est-prete.md`
- `docs/spec/v3/migration.md`
- Le compte rendu du ticket 101 (`pnpm v3:essai`, `pnpm v3:compare`)

## À faire

Avant :

- [x] Vérifier que tous les tickets dont celui-ci dépend sont dans `fait/`. Pas de publication à moitié.
- [x] **Refaire l'inventaire du ticket 114** (chaque page, son parent, son squelette, aucune adresse morte) : les tickets 115 à 119 sont passés après lui et ont ajouté ou retiré des pages.
- [x] Rejouer la migration sur une copie de la base du jour (`pnpm v3:essai`), et comparer (`pnpm v3:compare`) : autant d'événements que de groupes, chaque Secret Santa en cours avec ses participants et ses enveloppes, chaque liste avec ses idées et ses coches. **Fait par Julien le 24 novembre 2026** sur l'export de production : Les deux commandes sont prêtes pour `0034` à `0047` (`0043` du ticket 139, `0044` du 149, `0045` du 152, `0046` pour la place d'un « Hors liste », `0047` du 165) et passent sur une copie de forme V2 fabriquée (compte rendu). Résultat : les quatorze migrations passent, « ✓ Tout est là » ; 2 groupes → 2 événements, 2 Secret Santa ; 1 liste avant, 5 après (4 nées des pistes : 3 par `0038`, 1 par `0047`, un compte créé à une adresse qui avait écrit 3 idées). Personne sans adresse n'avait écrit de pistes. Les contrôles ② ③ ④ rendent ce qu'il faut ; ① ne rend aucune ligne (aucune enveloppe tirée et fermée sur la copie).
- [x] Sur cette copie, contrôler à la main trois comptes : quelqu'un qui a tiré et pas encore ouvert son enveloppe ; quelqu'un qui avait écrit des pistes (elles sont devenues sa liste, vue seulement par celui qui l'a tiré) ; quelqu'un dont la liste était partagée par lien (elle est publique, son lien marche encore, sans compte). Fait sur la copie fabriquée ; à refaire par Julien sur la copie du jour (requêtes : `docs/travail/bascule-v3.md`, partie 1).
- [x] Écrire le pas-à-pas du retour en arrière, et l'essayer une fois sur la copie : restaurer la sauvegarde, remettre la version d'avant. (`docs/travail/bascule-v3.md`, partie 3)
- [x] ~~Préparer le mot aux utilisateurs, dans les trois langues (plus bas).~~ Retiré, Q-034 : pas de mot.

Le jour même, par Julien (Claude Code ne publie pas et ne déploie pas) :

- [ ] Choisir une heure creuse, en dehors de l'heure des tâches planifiées (`server/plugins/reminders.ts`) : aucun email automatique ne doit partir pendant la bascule. L'interrupteur « Suspendre les emails » n'arrive qu'au ticket 129 ; le pas-à-pas dit comment on s'en passe.
- [ ] Sauvegarder la base de production.
- [ ] Publier : la migration, puis le code.
- [ ] Refaire les trois contrôles sur la production.

Après :

- ~~Le mot s'affiche en tête de « Quoi de neuf » (ticket 120, fait avant la bascule) et part par un email simple, le lendemain matin, une seule fois, à ceux qui ont un Secret Santa ou une liste en cours. (Le résumé du matin n'existe pas encore : ticket 121.)~~ Retiré, Q-034 : pas de mot.
- [ ] Surveiller une journée le tableau de bord (erreurs du serveur, emails rejetés).

## Le mot aux utilisateurs

**Retiré, Q-034 : pas de mot.** « Personne n'utilise pour le moment, pas besoin de mot. » Le texte ci-dessous n'est plus dans l'application.

« Under the Tree a changé. Tes groupes s'appellent maintenant des événements, et on y trouve au même endroit le Secret Santa et les listes de cadeaux. Tes pistes de cadeaux sont devenues ta liste : seul celui qui t'a tiré la voit, comme avant. Rien n'est perdu, et ton tirage n'a pas bougé. »

Une phrase de plus pour ceux qui tenaient une liste partagée par lien : « Ta liste est toujours ouverte à ceux qui ont son lien. »

## Hors périmètre

- Tout ce qui vient après la V3 (tickets 121 et suivants).
- Annoncer la V3 à d'autres que ceux qui s'en servent déjà.

## C'est fini quand

- [ ] `/controle` passe sur la version publiée.
- [ ] La comparaison sur la copie du jour ne montre aucun écart.
- [x] Le retour en arrière a été essayé une fois, et son pas-à-pas est dans le dépôt.
- [ ] Les trois contrôles passent sur la production.
- ~~Le mot est parti, une fois.~~ Retiré, Q-034 : pas de mot.

## Compte rendu

**Partiel, 22 novembre 2026 : la partie « Avant » est faite par Claude Code, sauf la copie du jour. Le ticket reste dans `en-cours/` : « Le jour même » et « Après » sont à Julien.** Q-034 répondue le même jour : la bascule se fait sans mot ; le mot de « Quoi de neuf » et l'email du lendemain, faits puis retirés (plus bas). Le pas-à-pas complet : `docs/travail/bascule-v3.md`.

### Fait

- **Les dépendances** : 102, 106, 107, 108, 110, 111, 112, 114 à 120, 135, 136, 137 sont toutes dans `fait/`.
- **L'inventaire du 114, refait** après les tickets 115 à 119 et 135 à 137 : chaque page de `app/pages` a sa ligne dans `ARBORESCENCE.md` et un parent qui existe ; les pages nouvelles (`…/editions/[id]/reprendre`, `nouvelle-personne`, `invitation`, `/listes/[id]/inviter` et ses deux pages) ont leur squelette, ou sont des formulaires qui s'affichent sans attendre. **Trois adresses mortes** de la V2 corrigées (`gonePathOf`, `app/middleware/redirects.global.ts`) : `/demande` mène à l'accueil, `/admin/demandes` et `/admin/demandes/[id]` à l'Administration, `/admin/[groupe]/reglages/mot` (devenu `/e/[fête]/reglages/mot`) aux Réglages de l'événement. `tests/routes.test.ts` rejoue les redirections sur chaque page de `main` : toutes mènent à une page.
- **`pnpm v3:essai`** applique chaque migration que l'export n'a pas (il refuse un export qui n'est pas à `0033`), une transaction chacune, et garde ses deux bases avec `--garder`. **`pnpm v3:compare`** (`server/database/v3Compare.ts`) vérifie en plus : autant d'événements que de groupes ; chaque participant, son lien et s'il a ouvert son enveloppe ; chaque enveloppe, scellée (jamais déchiffrée) ; chaque liste avec ceux qui la tiennent, ses idées, ses coches (y compris « pour quelqu'un ») et son lien ; les pistes devenues une liste réservée à celui qui a tiré, avec les mêmes idées ; une liste au partage coupé devenue brouillon ; chaque participant entré par son Secret Santa (0041). Testé par `migrations.test.ts` (toute la V3, et trois façons de casser).
- **La copie** : une base de forme V2 fabriquée dans le dossier de travail de la session, sans rien toucher à `sauvegardes/state-v2` ni à `.wrangler` : la base locale de `sauvegardes/state-v2` (copiée en lecture : 24 groupes, 26 éditions dont 12 tirées, des enveloppes pas ouvertes, des pistes, des portraits, 9 listes dont 7 partagées par lien, des coches, des exclusions, Devine qui, un groupe sans Secret Santa), montée à `0033` comme la production, plus des pistes et un portrait pour Camille dans « Famille Camille » (tiré) et une coche « pour quelqu'un ». Exportée par `wrangler d1 export --local`, comme le fera Julien. Résultat : 24 groupes, 26 éditions, 9 listes avant ; 30 événements (dont 6 nés d'une liste), 32 années, 26 Secret Santa, 11 listes (deux nées de pistes), 11 rattachements après ; **aucun écart, aucune clé étrangère cassée**.
- **Une treizième migration** (Julien, 24 novembre 2026) : `0046_v3_off_list_position`, la place d'un cadeau « Hors liste » parmi les idées de sa personne (vide jusqu'au premier glisser). `bascule-v3.md` dit maintenant treize migrations, `0034` à `0046`. `pnpm v3:essai` rejoué sur la même copie de forme V2 : les treize passent, mêmes nombres, aucun écart, aucune clé étrangère cassée. Même résultat par `wrangler d1 migrations apply --local`.
- **Puis 153 à 156** (« Lier à un Secret Santa » dans le menu de ma partie, un seul panneau à cocher pour lier et délier, la carte de création d'un Secret Santa qui dit que les participants s'ajoutent juste après, « Gérer l'événement » et « Tu l'organises » sur l'accueil) : dans `fait/`. **Aucune migration de plus** : la bascule publie toujours `0034` à `0046`. Une question ouverte, sans blocage : Q-037 (quand l'entrée « Lier à un Secret Santa » est dans le menu ; codé comme la spec).
- **Puis 157 à 159** (pas d'adresse dans la barre quand le lien ne fait entrer personne et un Secret Santa choisi à son nom ; « Ajouter quelqu'un » en une ligne sur la page des membres et, sous un prénom, seulement ce qui sort de l'ordinaire ; la roue dans l'en-tête de la carte d'un événement que j'organise et « Réglages de l'événement » en ligne sous les membres) : dans `fait/`. **Aucune migration de plus** : la bascule publie toujours `0034` à `0046`.
- **Puis 161, 162 et 164** (« Ajouter un organisateur » sur une page avec son prénom ; un texte court s'écrit sur sa ligne : « Mon compte », la fiche d'un membre sans bouton « Enregistrer », le nom d'un Secret Santa ; « Budget » ouvre une page de propositions) : dans `fait/`. **Aucune migration de plus** : la bascule publie toujours `0034` à `0046`. Le 160 (les dates) est pour après la bascule.
- **Puis 165** (les pistes de ceux qui n'ont pas de compte) : dans `fait/`. **Une quatorzième migration**, `0047_v3_hints_without_account` : une personne sans compte mais avec une adresse, qui a écrit des pistes ou un portrait, reçoit son compte, sa fiche « Moi » et sa liste réservée à celui qui l'a tirée. `bascule-v3.md` dit maintenant quatorze migrations, `0034` à `0047`, et un quatrième contrôle à la main ; `v3:compare` vérifie les comptes créés et ces listes. `pnpm v3:essai` rejoué sur la copie de forme V2 : les quatorze passent, 12 listes au lieu de 10 (les deux personnes de la copie qui avaient une adresse sans compte), aucun écart, aucune clé étrangère cassée. **Avant la bascule** : ajouter son adresse à la personne de la production qui n'en a pas, si elle a écrit des pistes (la requête est dans `bascule-v3.md`).
- **Les trois comptes**, sur la copie migrée, par requêtes et dans la V3 lancée dessus (`wrangler dev --persist-to` à part, aucun email possible, aucun super-admin, rien « Découvert ») :
  1. Hugo (`famille-camille`, tiré, enveloppe pas ouverte) : l'accueil montre « Noël 2026 » avec son point « enveloppe » ; sa page s'ouvre, `revealed` faux, `view_count` toujours à 0.
  2. Camille (pistes) : l'accueil montre « Ma liste · 2 idées · seul celui qui t'a tiré la voit » ; sa liste est au stade `giver` dans « Famille Camille » ; ses deux idées et son portrait (sur sa fiche « Moi ») sont là ; sans compte, son lien demande de se connecter ; avec un compte hors de l'événement, « pas partagée ».
  3. « L'anniversaire de Camille » (partagée par lien) : publique, même lien, la page s'ouvre sans compte, ses deux idées marquées prises (une coche, une coche pour quelqu'un).
  Julien les refait sur la copie du jour puis en production : `bascule-v3.md`, parties 1 et 2.
- **Le retour en arrière**, écrit (`bascule-v3.md`, partie 3) et essayé une fois sur la copie : sauvegarde (export complet, schéma, données), migration, restauration dans une base vide (le schéma, puis les données), comparaison table par table : **identique** ; puis le code de `main` (un `git worktree` du dossier de travail, retiré ensuite) démarre sur la base restaurée : la page d'un Secret Santa, une liste par son lien sans compte, l'ancienne adresse des pistes. Trouvé en chemin : **un export complet ne se recharge pas** (« no such table: main.persons ») ; le schéma puis les données, si. D'où les deux exports du pas-à-pas. Le retour principal est Time Travel (une commande), qui ne s'essaie pas en local.
- **L'heure creuse sans « Suspendre les emails »** : retirer les deux Cron Triggers dans le tableau de bord le temps de la bascule ; le déploiement de la V3 les remet depuis `wrangler.toml`.
- ~~**Le mot**, dans les trois langues, en tête de « Quoi de neuf »~~ et ~~**l'email du lendemain** (`buildSwitchEmail`, `pnpm v3:mot`)~~ : faits (`c505206`, `f0b0a7a`), puis **retirés, Q-034 : pas de mot**. Partis avec eux : leurs textes dans les trois langues (`news.note.*`), leurs tests, l'exception `keys` du contrôle des mots (`scripts/controle.exceptions.json`) et son mécanisme, la recherche d'un `index.ts` de dossier dans `scripts/ts-resolve-hooks.mjs` (plus aucun script n'en a besoin). Le mécanisme du mot de l'application (ticket 120) reste, sans mot.

### Repris le 23 novembre 2026, après les tickets 138 à 145

- **Les dépendances** : 138, 139, 140 et 141 sont dans `fait/`, avec toutes les autres.
- **Une migration de plus** : `0043_v3_giver_with_members` (ticket 139 : « Celui qui m'a tiré » et tous les membres d'un événement peuvent être là ensemble). `bascule-v3.md` dit maintenant dix migrations, `0034` à `0043`.
- **`pnpm v3:essai` rejoué** sur une copie de forme V2 refabriquée (la base locale de `sauvegardes/state-v2`, copiée dans le dossier de travail de la session, montée à `0033` avec `sqlite3`, puis `.dump`) : les dix migrations passent, 24 groupes, 26 éditions, 9 listes avant ; 30 événements, 32 années, 26 Secret Santa, 10 listes, 10 rattachements après ; **aucun écart, aucune clé étrangère cassée**. La liste née de pistes est au stade `giver`, avec `giver` à vrai ; les autres rattachements à faux. Rien touché à `sauvegardes/state-v2`. (Cette copie n'a pas les pistes et le portrait ajoutés le 22 novembre pour Camille : d'où 10 listes au lieu de 11.)
- **L'inventaire du 114, refait** : chaque page de `app/pages` a sa ligne dans `ARBORESCENCE.md` ; les pages retirées par le 139 (`/listes/[id]/inviter` et ses deux pages, `/listes/[id]/message`) mènent à la liste (`gonePathOf`), et `tests/routes.test.ts` rejoue toujours chaque adresse de `main`.
- **`pnpm controle --e2e`** : passé après chacun des tickets 139-141 et 140 (984 tests Vitest, 204 tests Playwright).
- La case de la copie du jour reste ouverte : elle attend l'export de Julien.
- **Puis 142 à 145** (le point rouge et sa ligne dans « Quoi de neuf », la tuile des événements, la carte de la ligne qu'on écrit, « cette personne ») : dans `fait/`. Aucune migration, aucune page ajoutée ni retirée : l'inventaire et `v3:essai` ne changent pas. À savoir pour la bascule : depuis le 142, une nouveauté pas vue ne s'efface plus ; la tâche du matin n'oublie que celles vues il y a plus de trente jours. `pnpm controle --e2e` passé après chacun (992 tests Vitest, 205 Playwright).

- **Puis 146 à 152** (« On t'invite », la liste plus légère, lier et délier une liste d'un Secret Santa, la visite d'une liste neuve, « Devine qui » mis en avant, « Créer un Secret Santa » sur la carte, la poignée et son menu, les étoiles, les titres) : dans `fait/`. **Deux migrations de plus** : `0044_v3_list_tours` (ce que le compte a vu de la visite, ticket 149) et `0045_v3_idea_stars_titles` (les étoiles et les titres d'une idée, ticket 152). `bascule-v3.md` dit maintenant douze migrations, `0034` à `0045`, et la comparaison vérifie en plus qu'aucune idée n'a d'étoiles ni n'est un titre après la migration.
- **`pnpm v3:essai` rejoué** sur la même copie de forme V2 : les douze migrations passent, mêmes nombres (24 groupes, 26 éditions, 9 listes avant ; 30 événements, 32 années, 26 Secret Santa, 10 listes, 10 rattachements après), **aucun écart, aucune clé étrangère cassée**.
- **L'inventaire** : aucune page ajoutée ni retirée (66 pages) ; `ARBORESCENCE.md` suit les noms (« Créer une liste de cadeaux », « Créer un Secret Santa » sur la carte, la page « Devine qui » du formulaire de création n'existe plus) et les adresses `?visite=`.
- À savoir pour la bascule : depuis le 148, « ma liste du Secret Santa » est la liste liée (`giver`), et seulement elle ; une liste faite pour l'événement ou partagée avec ses membres, sans lien, est proposée par « Quelle liste pour ton Secret Santa ? » au lieu de s'ouvrir directement. La migration `0043` lie déjà les listes gardées pour celui qui a tiré.
- `pnpm controle --e2e` passé après chacun (1 001 tests Vitest et 215 Playwright au dernier).

### Ce qui reste à Julien, dans l'ordre

1. La copie du jour : les deux exports, `pnpm v3:essai sauvegardes/prod.sql --garder`, les trois requêtes (`bascule-v3.md`, partie 1). Puis cocher la case restée ouverte.
2. Le jour même : `bascule-v3.md`, partie 2 (heure, build, version notée, tâches retirées, signet Time Travel, `pnpm db:migrate`, `pnpm -s wrangler deploy`, trois contrôles).
3. Après : surveiller une journée (`bascule-v3.md`, partie 4). Pas de mot (Q-034).

### Décidé seul

- **Les anciennes adresses sans remplaçant** mènent au plus proche (`/demande` à l'accueil, etc.) : `navigation.md` dit qu'une ancienne adresse ne donne jamais une page d'erreur, sans les nommer.

### Contrôle

`pnpm controle --e2e` passé : trois langues, mots interdits, textes en dur, lint, typecheck, 983 tests Vitest, 200 tests Playwright (dont `security.spec.ts`, sans échec). La case « `/controle` passe sur la version publiée » attend la publication.

Après le retrait du mot (Q-034), `pnpm controle --e2e` repassé : 970 tests Vitest, 200 tests Playwright (dont `security.spec.ts`). Un premier passage avait échoué sur `tests/news.test.ts:245` : l'identifiant aléatoire d'une nouvelle contenait « z1 », que le test cherche comme texte interdit ; étranger au retrait, il passe au second passage. Ce test est fragile (une chance sur quelques milliers).

### Écarts avec les maquettes

Aucune maquette.

### Questions

- Q-034 : à qui le mot et l'email de la bascule, et que dire à ceux qui n'ont pas de compte. Réponse de Julien : pas de mot ; le mot et l'email sont retirés.

### Migrations

Aucune par ce ticket. La bascule publie `0034` à `0047` (`0043` du ticket 139, `0044` du 149, `0045` du 152, `0046` pour la place d'un « Hors liste », `0047` du 165).

### Commits

- `bd8f766` docs: ticket 113 started
- `4f2ca7d` fix(navigation): every address of the V2 leads to a page
- `b1e2da6` chore(db): pnpm v3:essai plays every migration of the V3, compared whole
- `c505206` feat(news): the word of the switch to the V3, at the top of « Quoi de neuf »
- `f0b0a7a` chore(email): pnpm v3:mot, the email of the day after the switch
- `2760195` docs: the step-by-step of the switch to the V3, ticket 113 before
- `d582583` chore(email): no email the day after the switch, pnpm v3:mot removed
- `cfa2358` revert(news): no word of the switch at the top of « Quoi de neuf »
- puis docs: no word at the switch (Q-034), avec ce compte rendu.
- le 23 novembre : docs: ticket 113, the switch after tickets 138 to 141 ; puis docs: ticket 113, after tickets 142 to 145 ; puis docs: ticket 113, after tickets 146 to 152 (`bascule-v3.md` venant des commits des tickets 139, 149 et 152).
