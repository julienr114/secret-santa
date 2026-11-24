# 116 — V3 : le lien d'invitation est celui d'un Secret Santa

- **Dépend de** : 104, 105
- **Migration** : oui (le lien passe de l'événement au Secret Santa)
- **Maquettes** : `V3FeteInviter`, `V3FeteRejoindre`, `RejoindreConnecte`, `RejoindreFait`, `RejoindreFerme`, `V3FeteOrganisateur`, `V3FeteAnniversaire`, `V3FeteReglages`, `V3TirageReglages`, `PreparerVide`, `AjouterParticipants`, `PanneauNombre`, `PanneauDate`

## Objectif

On n'invite plus dans un événement : on invite à un Secret Santa. Celui qui ouvre le lien s'inscrit à ce Secret Santa, et devient du coup membre de son événement. Avec deux Secret Santa la même année, chacun a son lien, et personne ne se retrouve dans le mauvais.

## À lire d'abord

- `docs/decisions/2026-11-21-le-lien-d-invitation-est-celui-d-un-secret-santa.md`
- `docs/spec/v3/secret-santa.md` (« Inviter par lien », « Ses réglages »)
- `docs/spec/v3/fete.md` (« La page d'un événement », « Les membres », « Inviter, rejoindre »)
- `docs/spec/v3/migration.md` (« Les liens déjà envoyés »)
- `docs/travail/questions.md` (Q-017, dans « Réponses »)

## À faire

- [x] **Base** : le lien d'invitation, avec ses places, sa date limite et son mot, appartient à un Secret Santa. La migration donne le lien de chaque événement à son Secret Santa en préparation ; sans Secret Santa en préparation, le lien est fermé.
- [x] **S'inscrire** par le lien : participant de ce Secret Santa, et membre de son événement s'il ne l'était pas. Un membre qui s'inscrit ne prend pas de place dans l'événement.
- [x] **La page « Inviter par lien »** passe sous le Secret Santa (`V3FeteInviter`) : « Famille Camille · Secret Santa 2026 » au-dessus du titre, la phrase, le message à partager, les réglages du lien. Elle s'ouvre depuis le Secret Santa en préparation (`PreparerVide`, `AjouterParticipants`).
- [x] **La page du lien** (`V3FeteRejoindre`, `RejoindreConnecte`) : « Tu es invité au Secret Santa », le nombre d'inscrits, « Participer ». Le nom du Secret Santa entre parenthèses s'il y en a plusieurs la même année.
- [x] **Après le tirage** : le lien est fermé, « Le tirage a déjà eu lieu » · « Préviens l'organisateur de … » (la page de `RejoindreFerme`).
- [x] À 30 membres, les liens des Secret Santa de l'événement se mettent en pause.
- [x] **La page d'un événement** (`V3FeteOrganisateur`, `V3FeteAnniversaire`) : la ligne des membres ne dit plus « Inviter ».
- [x] **Les réglages** : « Quelqu'un s'inscrit par le lien » quitte ceux de l'événement (`V3FeteReglages`, qui perd sa section « M'écrire par email ») pour ceux du Secret Santa (`V3TirageReglages`). Le choix déjà fait par l'organisateur est gardé.
- [x] L'ancienne adresse `/e/[événement]/invitation` mène à « Membres » (`docs/spec/v3/navigation.md`). Les liens `/rejoindre/[code]` déjà envoyés marchent toujours.
- [x] **La nouveauté des organisateurs** (nature `joined`, ticket 120) suit : « Hugo s'est inscrit par le lien », rangée sous l'événement, avec le nom du Secret Santa s'il y en a plusieurs. Elle ne dit plus « a rejoint l'événement ».
- [x] Trois langues. `docs/refonte/ECARTS-MAQUETTES.md` et `docs/ARBORESCENCE.md` à jour.

## Hors périmètre

- La page « Membres », l'entrée par une liste et la fin de « Ajouter une personne » : ticket 117.
- Le lien d'une liste (ticket 106).

## C'est fini quand

- [x] Avec deux Secret Santa en préparation, s'inscrire par le lien de l'un ne m'ajoute pas à l'autre (un test le vérifie).
- [x] Après la migration, chaque lien déjà envoyé d'un événement qui prépare un Secret Santa inscrit toujours à ce Secret Santa (un test sur des données d'essai).
- [x] Un lien ouvert après le tirage n'inscrit personne.
- [x] Les maquettes du ticket sont reproduites.
- [x] `/controle` passe.

## Compte rendu

**Fait.**

- **Base** : le lien (code, places, date limite, mot) passe de `parties` à `secret_santas` (migration `0040_v3_secret_santa_invite`). La migration donne le lien de chaque événement au Secret Santa que ce lien remplissait déjà (le plus récent non clôturé, s'il est en préparation) ; sinon le lien est fermé. « Quelqu'un s'inscrit par le lien » est recopié des réglages de l'événement sur chacun de ses Secret Santa non clôturés, puis retiré de l'événement. Testée sur des données d'essai (`migrations.test.ts`, avec la comparaison de `pnpm v3:compare`, qui sait maintenant où le lien est allé), appliquée en local seulement.
- **S'inscrire** (`/api/invite/[code]`) : `canSignUp` (pure, testée) : pas après le tirage (`invite_drawn`), pas après la date limite, une place pour un nouveau venu, aucune pour un membre. On devient participant de ce Secret Santa, et membre de l'événement si on ne l'était pas. Déjà participant : rien ne change, rien n'est envoyé.
- **« Inviter par lien »** passe sous le Secret Santa : `/admin/[fête]/editions/[id]/invitation` (et `…/mot`), ouverte depuis « Préparer » sans participant et depuis « Choisir les participants ». Le message dit « Tu es invité au Secret Santa « Famille Camille » », avec le nom du Secret Santa entre parenthèses quand il y en a plusieurs la même année (`invitePlace`). Route `POST …/editions/[id]/invite`, gardée par l'année ouverte.
- **La page du lien** : « Tu es invité au Secret Santa », le nom (avec celui du Secret Santa s'il le faut), la catégorie, la date, « 5 inscrits », « Participer » ; après le tirage, « Le tirage a déjà eu lieu » · « Préviens l'organisateur de … ».
- **30 membres** : les places du lien ne dépassent jamais ce qui reste (`linkPlaces`) ; la page du lien dit « En pause · l'événement est complet ».
- **Page d'un événement** : la ligne des membres ne dit plus « Inviter ». **Réglages** : la section « M'écrire par email » quitte l'événement ; « Quelqu'un s'inscrit par le lien » est en tête de celle du Secret Santa. `useRuleSaver` (plus utilisé) est retiré.
- **Anciennes adresses** : `/e/[événement]/invitation` et `…/invitation/mot` (et `/admin/[groupe]/invitation…`) mènent à « Membres » (`invitationPathOf`). `/rejoindre/[code]` reste l'adresse des liens.
- **La nouveauté `joined`** porte le nom du Secret Santa quand l'événement en a plusieurs cette année-là ; l'email aux organisateurs aussi (objet « Famille Camille (Les adultes) : Zoé s'inscrit par le lien », et plus de « Pense à l'ajouter au Secret Santa en cours », devenu faux).
- **Tests** : Vitest (`canSignUp`, `invitePlace`, le message, l'email, `invitationPathOf`, la migration) ; Playwright `invite.spec.ts` réécrit (deux Secret Santa, le lien de l'un n'inscrit pas à l'autre, un membre ne prend pas de place, la nouveauté de l'organisateur, places, date limite, après le tirage) ; `notify`, `party`, `edition-cases`, `admin-edition` suivent.

**Décidé seul** :
- « Hugo s'inscrit par le lien » au présent, et non « s'est inscrit » : l'application ne connaît pas le genre (Q-028).
- « Membres » perd sa section « Ou laisse-les s'inscrire » (elle menait au lien de l'événement) ; « Au Secret Santa » vient avec le ticket 117. La création d'un événement perd « Inviter d'autres personnes » (l'événement neuf n'a pas de Secret Santa, donc pas de lien) ; l'étape entière part au ticket 117.
- La date limite vaut aussi pour un membre ; seules les places ne le concernent pas (« il ne prend pas de place »).
- Un nouveau Secret Santa, y compris ceux de « Préparer Noël 2027 », naît sans lien.
- L'email aux organisateurs garde son lien vers « Membres ».

**Écarts avec les maquettes** (`ECARTS-MAQUETTES.md`, « Le lien d'invitation d'un Secret Santa ») : les états non dessinés de `V3FeteInviter` (avant création, après le tirage, en pause) ; la ligne de `V3FeteRejoindre` gardée connecté (`RejoindreConnecte`) ; `RejoindreFerme` pour « Le tirage a déjà eu lieu » ; la nouveauté au présent ; « Membres » sans lien. La ligne « pas encore de « Quelqu'un s'inscrit par le lien » » de `V3TirageReglages` est retirée.

**Contrôle** : `pnpm controle --e2e` passé (trois langues, mots interdits, textes en dur, lint, typecheck, 900 tests Vitest, 176 tests Playwright, sans échec du test instable de `security.spec.ts`). Un premier passage avait trouvé `admin-edition.spec.ts`, qui comptait encore la ligne du lien sur « Membres » : corrigé.

**Questions** : Q-028 (« s'est inscrit » s'accorde au masculin).

**Migration** : `0040_v3_secret_santa_invite`, après `0039_v3_news`, appliquée en local (`pnpm db:migrate:local`), pas à distance.

**Commits** : `a963504` docs: ticket 116 started ; `2ad5dc7` feat(invite): the invitation link is that of a Secret Santa ; `3eec85e` test(e2e): signing up to one Secret Santa by its link, not to the other ; `d39107d` test(e2e): the members of an event no longer show an invitation link ; puis docs: ticket 116 done.
