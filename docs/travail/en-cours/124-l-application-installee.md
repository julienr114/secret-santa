# 124 — L'application installée et les notifications du téléphone

- **Dépend de** : 120, 121, 123
- **Migration** : oui (les abonnements des appareils)
- **Maquettes** : `Installer`, `NotifAutoriser`, `NotifReglage`

> **Reste à Julien. Le ticket reste dans `en-cours/` jusque-là :**
>
> 1. **Les clés VAPID** (une fois pour toutes). Les créer :
>    `node -e "crypto.subtle.generateKey({name:'ECDSA',namedCurve:'P-256'},true,['sign']).then(async k=>{console.log('NUXT_PUBLIC_VAPID_PUBLIC_KEY='+Buffer.from(await crypto.subtle.exportKey('raw',k.publicKey)).toString('base64url'));console.log('NUXT_VAPID_PRIVATE_KEY='+(await crypto.subtle.exportKey('jwk',k.privateKey)).d)})"`.
>    La clé publique va dans une variable Cloudflare (`NUXT_PUBLIC_VAPID_PUBLIC_KEY`), la privée dans un secret (`pnpm wrangler secret put NUXT_VAPID_PRIVATE_KEY`). Sans elles, l'interrupteur n'apparaît pas et rien ne part. Ne jamais les changer ensuite : les téléphones abonnés ne recevraient plus rien.
> 2. **La migration** `0053_v3_push_subscriptions` (`docs/travail/migrations-a-publier.md`).
> 3. **L'essai sur un iPhone et un Android** : installer depuis le navigateur, se connecter par le code, activer les notifications, recevoir « Ton enveloppe t'attend » (un tirage), toucher la notification, voir la pastille sur l'icône, désactiver.
> 4. **Q-041** : chaque nouveauté, ou ce qui presse (codé : ce qui presse).

## Objectif

Under the Tree s'installe sur l'écran d'accueil du téléphone, sur iPhone comme sur Android, et prévient par une notification quand quelque chose presse. À vérifier sur de vrais téléphones.

## À lire d'abord

- `README.md`, section 22.22
- `docs/spec/v3/lignes.md` (ce qu'un texte ne doit jamais dire)

## À faire

- [x] **Installable** : le manifeste, les icônes, les couleurs ; un service worker réduit à ce qu'il faut pour les notifications. Pas de mode hors connexion.
- [x] **Proposer l'installation** : le panneau des trois gestes sur iPhone, le bouton « Installer » sur Android ; dans « Me prévenir » et une fois sur l'accueil ; jamais dans l'application installée.
- [x] **S'abonner** : le panneau `NotifAutoriser` puis la question du téléphone, après un geste ; un abonnement par appareil, retiré quand il ne répond plus ; l'interrupteur « Notifications » de « Me prévenir ».
- [x] **Envoyer** : une notification du téléphone par nouveauté qui presse, depuis le Worker, sans service tiers ; la toucher ouvre l'écran concerné ; **rien dans son texte que le verrouillage du téléphone ne devrait pas montrer** : jamais à qui j'offre, jamais qui demande des idées.
- [x] **La pastille sur l'icône** : le nombre de nouveautés pas encore vues.
- [x] L'attente de dix minutes du ticket 121 s'applique dès qu'un appareil est abonné.
- [ ] (les trois langues et les tests, faits ; le README 22.22 se marque fait après l'essai sur les téléphones) Trois langues, tests. README 22.22 marqué fait.

## Hors périmètre

- Le mode hors connexion.

## C'est fini quand

- [ ] (à Julien : voir en tête) Vérifié à la main sur un iPhone et un Android : installer, s'abonner, recevoir, toucher, se désabonner.
- [x] Les trois maquettes sont reproduites.
- [x] Un test vérifie qu'aucun texte de notification ne contient un prénom tiré ni celui de qui demande des idées.
- [x] `/controle` passe.

## Compte rendu

**Préparé (25 novembre 2026) : tout ce qui se fait sans un vrai téléphone.**

- **Installable** : `public/manifest.webmanifest` (le nom, `standalone`, les couleurs de Sorbet) et ses icônes de 192 et 512 px, dont une « maskable », tirées de `favicon.svg`. Le service worker `public/sw.js` est réduit aux notifications et à la pastille. Il n'a pas de gestionnaire `fetch`, donc pas de mode hors connexion.
- **Proposer l'installation** (`usePhone`, `PhoneInstallSheet`, `Installer`) :
  - sur iPhone, le panneau des trois gestes de Safari ; sur Android, l'offre du téléphone (`beforeinstallprompt`, gardée par `plugins/install.client.ts`) derrière « Installer » ;
  - une fois sur l'accueil, sur un téléphone, dans un navigateur (`PhoneOffers`), et dans « Me prévenir », « Installer l'application » ;
  - jamais dans l'application installée, ni sur un ordinateur.
- **S'abonner** (`PhoneNotifySheet`, `NotifAutoriser`) :
  - après un geste, notre panneau, puis la question du téléphone ; l'abonnement de l'appareil est envoyé à `POST /api/push/subscriptions` ;
  - dans l'application installée, le panneau est proposé une fois sur l'accueil ;
  - dans « Me prévenir », « Sur ce téléphone » a l'interrupteur « Notifications » ;
  - un appareil que son service ne connaît plus (404, 410) est oublié.
- **Envoyer, depuis le Worker, sans service tiers** (`server/utils/webPush.ts`) :
  - la signature VAPID (ES256) et le chiffrement RFC 8291 (aes128gcm), testés en déchiffrant comme le fait un téléphone ;
  - `server/database/push.ts` envoie, à chaque passage de la tâche planifiée et avant les emails, ce qui presse, une fois, à chaque appareil du compte ;
  - la notification dit le lieu (l'événement ou la liste) et la nouveauté comme « Quoi de neuf », rien de plus, et la toucher ouvre son écran.
- **La pastille** : le nombre de nouveautés pas vues, posé par la notification (`setAppBadge`) et par l'application ouverte (la barre du bas).
- **L'attente de dix minutes** (ticket 121) : un compte qui a un appareil reçoit l'email de ce qui presse dix minutes après la notification. Si aucune notification n'est partie (des clés absentes, un service en panne), l'email part au plus tard trente minutes après la nouveauté.
- **La base** : migration `0053_v3_push_subscriptions`, table `push_subscriptions` et `news.pushed_at`. Les nouveautés d'avant ne partent jamais sur un téléphone.
- **Tests** :
  - Vitest : `webPush.test.ts` (le chiffrement, la signature, et aucun texte de notification qui nomme qui demande des idées ou la personne tirée), `tests/push.test.ts` (ce qui presse part une fois, le reste ne part pas, un appareil disparu est oublié) et l'attente dans `newsEmail.test.ts` ;
  - Playwright : `phone.spec.ts` (le manifeste, les icônes, le service worker sans mode hors connexion, l'offre d'installer une fois puis depuis « Me prévenir »). Les autres parcours partent avec les offres déjà faites (`playwright.config.ts`), pour qu'elles ne couvrent pas leurs écrans.

**Décidé seul, et pourquoi.**

- **Ce qui presse seulement**, comme le ticket et `NotifAutoriser`, plutôt que chaque nouveauté comme le README : Q-041.
- **Les tournures neutres** : « savoir tout de suite quand ton enveloppe t'attend » et « Des notifications sur ce téléphone ? », plutôt que « être prévenu ».
- **Les emails à soi** (l'invitation à tenir une liste, la demande d'idées, le rappel du jour J) partent tout de suite, sans attendre dix minutes : ils portent ce que la notification n'a pas (un lien d'invitation, un lien personnel).

**Écarts avec les maquettes** : section « L'application installée » de `docs/refonte/ECARTS-MAQUETTES.md`.

**Questions posées** : Q-041.

**Migrations** : `0053_v3_push_subscriptions`, appliquée en local seulement, après `0048` à `0052`.

**Contrôle** : `pnpm controle --e2e`, tout est passé : 1 101 tests Vitest et 244 parcours.

**Commit** : `feat(phone): the installed app and the notifications of the phone, ready for a real phone`.
