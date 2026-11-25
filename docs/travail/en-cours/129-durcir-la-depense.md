# 129 — Durcir : la dépense

- **Dépend de** : 109, 113
- **Migration** : oui, finalement (`0050_v3_app_counters`, les compteurs du jour)

> **Reste à Julien, chez Cloudflare. Le ticket reste dans `en-cours/` jusque-là :**
>
> 1. **La limite de dépense** sur Workers et sur les objets durables (« Spend Management »), 5 $ par mois au-dessus de l'abonnement.
> 2. **L'alerte de budget** pour tout le compte.
> 3. **La règle de débit du pare-feu** : « Security » puis « WAF » puis « Rate limiting rules ». Si le chemin est `/api/auth/link` et la méthode `POST`, par adresse IP, 5 requêtes par 10 secondes, puis bloquer 10 secondes.
- **Maquettes** : `V3Admin` (« En cas d'urgence », « À traiter et à surveiller », « Les plafonds »), `EnvoiSuspendu`, `V3TiragePause`

## Objectif

Une attaque ou un emballement ne peut pas coûter plus qu'un montant fixé d'avance, et le super-admin le voit venir et peut couper. C'est ce qui rend l'abonnement payant de l'hébergeur sans danger.

## À lire d'abord

- `docs/spec/v3/administration.md`
- L'archive `docs/refonte/PLAN.md`, section 8.1 (la dépense) et « Lot 38 A » (le filet, déjà fait)

## À faire

- [ ] **Julien, le jour de l'abonnement** : une limite de dépense sur Workers et sur les objets durables (Cloudflare, « Spend Management » : au seuil, les requêtes sont refusées jusqu'au cycle suivant), et une alerte de budget pour tout le compte. Montant proposé : 5 $ par mois au-dessus de l'abonnement.
- [x] **Les interrupteurs d'urgence** : « Suspendre les emails » (plus aucun email ne part, sauf les liens de connexion) et « Suspendre les inscriptions » (ni nouveau compte, ni nouvel événement), à côté de « Suspendre les nouveaux Secret Santa », fait au ticket 109. Le premier se déclenche tout seul quand le plafond d'emails du mois est atteint, et l'organisateur qui veut envoyer voit `EnvoiSuspendu`.
- [x] **Savoir qu'on est attaqué** (« Adresses qui ont refusé les emails » et « Envois signalés » sont venus avec le ticket 130) : le tableau de bord compte les requêtes refusées pour débit, les connexions échouées, les erreurs du serveur, les adresses qui refusent les emails et les emails rejetés du jour. Ce qui attend une décision entre dans la pastille de l'onglet ; le reste est un chiffre.
- [x] (Q-039, B : les emails du jour et du mois ont leur jauge ; les requêtes du jour et la dépense du mois se lisent sur le tableau de bord de Cloudflare, par une ligne ; les lire ici vient avec le ticket 127) **Les plafonds**, avec leur jauge : emails du jour et du mois, requêtes du jour, dépense du mois ; un avertissement au super-admin à 70 %.
- [ ] (à Julien, dans le tableau de bord de Cloudflare : voir le compte rendu) **La règle de débit du pare-feu** (une seule sur l'offre gratuite) : sur la demande de lien de connexion, devant le Worker, pour que les requêtes refusées ne soient pas comptées.
- [x] **Les connexions en direct**, si elles existent au moment de ce ticket : la mise en sommeil, le nombre maximal de connexions par liste, la fermeture après inactivité.
- [x] Tests des interrupteurs et des plafonds.

## Hors périmètre

- Ouvrir l'application à tous et la financer (ticket 128).
- Le reste du tableau de bord (ticket 127).

## C'est fini quand

- [x] « Suspendre les emails » allumé, seul un lien de connexion part encore (un test le vérifie).
- [x] Le plafond d'emails du mois atteint allume l'interrupteur tout seul.
- [x] « Suspendre les inscriptions » refuse un nouveau compte et un nouvel événement, pas une connexion.
- [x] `/controle` passe.

## Compte rendu

**Fait.**

- **Le cœur, en fonctions pures** (`server/utils/spend.ts`, testé) :
  - les plafonds des emails : 100 par jour et 3 000 par mois, ceux de l'offre du service d'email ;
  - la jauge d'un plafond, qui avertit à 70 % (`gaugeOf`) ;
  - le moment où un envoi passe les 70 % (`crossesWarning`) ;
  - ce qui peut partir pendant que les emails sont suspendus (`emailMayLeave`) : un lien de connexion seulement.
- **La base** : migration `0050_v3_app_counters`, table `app_counters` (le jour, ce qui est compté, combien), avec `server/database/counters.ts`. Les deux nouveaux interrupteurs sont des lignes de `app_switches`.
- **« Suspendre les emails »** : `sendEmails` demande désormais la base, et ne laisse partir qu'un lien de connexion tant que l'interrupteur est allumé. Il compte ce qui part et ce que le service rejette. À 70 % du jour ou du mois, il avertit une fois les super-admins, par un email en français. Au plafond du mois, il allume l'interrupteur tout seul. L'organisateur qui veut envoyer voit `EnvoiSuspendu` à la place du formulaire, sur « Envoyer par email » et sur le rappel de Devine qui ; le serveur répond `emails_paused` (503).
- **« Suspendre les inscriptions »** (`refuseWhileSignupsPaused`) : pas de nouveau compte, que ce soit par la demande d'un lien de connexion, l'invitation à tenir une liste ou la première idée d'un participant, et pas de nouvel événement. Une connexion, et tout ce qui existe, continuent. Un super-admin n'est jamais refusé.
- **Savoir qu'on est attaqué** : le tableau de bord compte les requêtes refusées pour débit (dans `limitRate`), les connexions échouées (un lien de connexion refusé), les emails rejetés et les erreurs du serveur (un greffon compte toute réponse de 500 ou plus, sans rien garder de la requête). Ce sont des chiffres : rien n'attend.
- **Le tableau de bord** : les quatre chiffres du jour, « Les plafonds » des emails avec leur jauge, et les trois interrupteurs d'urgence, chacun enregistré dès qu'on le touche.
- **Les connexions en direct** : c'était déjà fait au lot 26 (`server/live/room.ts`). La mise en sommeil est là, avec un nombre maximal de connexions par liste (`canJoin`) et la fermeture après inactivité (`roomSweep`).
- **Tests** : Vitest (`server/utils/spend.test.ts`, et `tests/email.test.ts`, l'envoi face à un faux service : seul un lien de connexion part, le compte, l'avertissement donné une fois, le plafond du mois qui suspend tout seul) ; Playwright (`emergency.spec.ts` : le tableau de bord, les inscriptions suspendues, `EnvoiSuspendu`).

**Ce qui reste à Julien.**

- **Le jour de l'abonnement** : la limite de dépense et l'alerte de budget (la première case, laissée ouverte).
- **La règle de débit du pare-feu**, dans le tableau de bord de Cloudflare, « Security » puis « WAF » puis « Rate limiting rules », une règle :
  - si le chemin est `/api/auth/link` et la méthode `POST` ;
  - par adresse IP ;
  - 5 requêtes par 10 secondes, puis bloquer 10 secondes.

  L'application garde aussi ses propres limites ; celle-ci arrête les rafales avant le Worker, sans qu'elles soient comptées.

**Décidé seul, et pourquoi.**

- **Les plafonds des emails** sont ceux de l'offre gratuite du service d'email, et ce sont des constantes (`EMAIL_CAPS`) : on les changera le jour où l'offre change.
- **L'avertissement à 70 % est un email aux super-admins**, en français, une fois par jour et une fois par mois. Il passe par le même envoi et compte dans les plafonds.
- **Une liste reste possible** pendant que les inscriptions sont suspendues, même si elle crée son propre événement en coulisse : comme pour « Suspendre les nouveaux Secret Santa », on ne bloque que ce qu'on crée exprès.
- **La phrase du tableau de bord** suit le ticket : les emails se suspendent quand ceux du mois atteignent leur plafond (la maquette parlait de la dépense, que l'application ne voit pas).

**Écarts avec les maquettes** : section « Durcir la dépense » de `docs/refonte/ECARTS-MAQUETTES.md`.

**Questions posées** : Q-039 (les requêtes du jour et la dépense du mois), Q-040 (« Suspendre les inscriptions » dit qu'une adresse n'a pas de compte).

**Migrations** : `0050_v3_app_counters`, appliquée en local seulement, après `0048` et `0049` ; dans `docs/travail/migrations-a-publier.md`.

**Contrôle** : `pnpm controle --e2e`, tout est passé : 1 066 tests Vitest et 231 parcours.

**Rangé** : dans `en-cours/` : la case de Julien (l'abonnement, le pare-feu) et les deux jauges de Q-039 attendent. « Adresses qui refusent les emails » s'ajoute avec le ticket 130.

**Commit** : `feat(admin): hardening the spend, emergency switches, today's counts and the caps of the emails`.

**Suite, le 25 novembre 2026 (réponses à Q-039 et Q-040).**

- **Q-039, B** : « Les plafonds » finit par une ligne « Requêtes et dépense · Sur le tableau de bord de Cloudflare », qui l'ouvre. Il n'y a pas de jauge pour ces deux chiffres. Le jeton en lecture seule qui les lira (`NUXT_CLOUDFLARE_API_TOKEN`) vient avec le ticket 127. Le test `emergency.spec.ts` vérifie la ligne.
- **Q-040, A** : rien à changer.
- **Reste** : les trois gestes de Julien chez Cloudflare, en tête du ticket.
- **Contrôle** : `pnpm controle --e2e`, tout est passé : 1 089 tests Vitest et 239 parcours. Commit : `feat(admin): the requests and the spend, on Cloudflare's dashboard`.
