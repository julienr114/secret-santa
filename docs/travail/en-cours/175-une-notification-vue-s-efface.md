# 175 — Une notification vue s'efface du téléphone

- **Dépend de** : 124
- **Migration** : non
- **Maquettes** : aucune (rien ne change à l'écran de l'application)

## Objectif

Julien, le 25 novembre 2026, à l'essai sur son iPhone : « Ton enveloppe t'attend » est arrivée en notification, et la pastille sur l'icône s'est allumée. Une fois l'enveloppe ouverte, la nouveauté est vue partout dans l'application, mais la notification reste dans le centre de notifications du téléphone tant qu'on ne la balaie pas. Une notification dont la nouveauté est vue doit s'effacer toute seule, et la pastille de l'icône suivre.

## À lire d'abord

- `README.md`, section 22.22 (« Une nouveauté est vue quand la personne ouvre ce qu'elle signale »)
- `docs/travail/en-cours/124-l-application-installee.md` (compte rendu : `public/sw.js`, `server/database/push.ts`)
- `server/database/news.ts` (`markSeen`, `markKindSeen`)

## À faire

- [x] **Retrouver une notification par sa nouveauté** : chaque notification porte l'identifiant de l'endroit qu'elle signale (son `tag`), pour que le téléphone sache laquelle effacer.
- [x] **Effacer dans l'application ouverte** : quand une nouveauté devient vue (ouvrir l'enveloppe, la liste, la page qu'elle signale), l'application demande au service worker d'effacer les notifications de cet endroit (`getNotifications({ tag })` puis `close()`), et remet la pastille de l'icône au nombre de nouveautés pas vues.
- [x] **Effacer sans l'application ouverte** (à voir) : une nouveauté vue sur un autre appareil (l'ordinateur) laisse la notification sur le téléphone. Une notification silencieuse qui demande d'effacer n'est pas permise partout (iOS montre toujours une notification) : dire ce qui est possible, et sinon s'en tenir à l'application ouverte.
- [x] Toucher la notification l'efface déjà (`notificationclick`) : vérifier que la pastille suit.
- [x] Tests (Vitest pour la règle de l'effacement, Playwright pour l'appel au service worker) ; vérifié à la main sur l'iPhone de Julien.

## Hors périmètre

- Changer ce qui rend une nouveauté vue : « Ton enveloppe t'attend » ne s'éteint qu'en ouvrant l'enveloppe, pas en ouvrant la page (ticket 120).

## C'est fini quand

- [ ] (attend l'essai de Julien sur l'iPhone, après publication) Sur l'iPhone, ouvrir l'enveloppe dans l'application efface la notification « Ton enveloppe t'attend » du centre de notifications, et la pastille de l'icône baisse.
- [x] `/controle` passe.

## Compte rendu

- **Le tag d'une notification est sa nouveauté** (`news-<id>`, `newsTag` dans `shared/utils/notifications.ts`), et non plus l'adresse qu'elle ouvre. Une nouveauté qui grossit (une deuxième demande d'idées) garde son identifiant : sa notification remplace la précédente au lieu de s'empiler.
- **La règle** (`staleNotifications`, testée) : sur le téléphone, toute notification dont la nouveauté n'attend plus s'en va ; une notification à l'ancien tag (une adresse, avant ce ticket) aussi.
- **Dans l'application ouverte** : `GET /api/news/count` rend, en plus du nombre, les nouveautés envoyées au téléphone et pas encore vues (`pushedUnseen`, 30 au plus). La barre du bas (`TabBar`), à chaque lecture de ce compte (à l'ouverture, à chaque page, au retour dans l'application), lit les notifications du service worker (`getNotifications()`) et ferme les autres. La page appelle `registration.getNotifications()` elle-même : pas besoin de message au service worker.
- **Sans l'application ouverte** : une notification silencieuse n'est pas permise (iOS montre chaque push, sinon il retire l'abonnement). Ce qui est possible, et fait : chaque push porte la liste des nouveautés qui attendent encore (`keep`), et le service worker, en montrant la nouvelle, ferme celles de nouveautés vues entre-temps, sur ce téléphone ou ailleurs. Une nouveauté vue sur l'ordinateur laisse donc la notification jusqu'à la prochaine notification ou la prochaine ouverture de l'application.
- **La pastille** : elle suivait le compte seulement quand il changeait ; à l'ouverture de l'application, le compte venu du serveur ne « changeait » pas et la pastille gardait l'ancien nombre. Elle se pose maintenant dès l'ouverture (`immediate`), et donc aussi après avoir touché une notification (qui ouvre l'application). Même correction pour l'effacement.
- **Tests** : `shared/utils/notifications.test.ts`, `server/utils/webPush.test.ts` (le message porte son tag et ce qui reste) ; parcours `tests/e2e/notifications-seen.spec.ts` (une notification montrée par le service worker, dont la nouveauté n'attend pas, est fermée à l'ouverture de l'application).
- **Décidé seul** : la liste `keep` va dans le message chiffré (30 identifiants au plus, sous la limite de 4 Ko d'un push) ; ce sont des identifiants, sans texte.
- **Écarts avec les maquettes** : aucun (rien ne change à l'écran). **Questions** : aucune. **Migration** : aucune.
- **Reste** : l'essai sur l'iPhone, après publication. Le service worker change : le téléphone prend la nouvelle version à la prochaine ouverture de l'application.
- **Contrôle** : `pnpm controle --e2e` passé (3 parties, 245 parcours).
