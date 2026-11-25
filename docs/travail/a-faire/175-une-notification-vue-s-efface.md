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

- [ ] **Retrouver une notification par sa nouveauté** : chaque notification porte l'identifiant de l'endroit qu'elle signale (son `tag`), pour que le téléphone sache laquelle effacer.
- [ ] **Effacer dans l'application ouverte** : quand une nouveauté devient vue (ouvrir l'enveloppe, la liste, la page qu'elle signale), l'application demande au service worker d'effacer les notifications de cet endroit (`getNotifications({ tag })` puis `close()`), et remet la pastille de l'icône au nombre de nouveautés pas vues.
- [ ] **Effacer sans l'application ouverte** (à voir) : une nouveauté vue sur un autre appareil (l'ordinateur) laisse la notification sur le téléphone. Une notification silencieuse qui demande d'effacer n'est pas permise partout (iOS montre toujours une notification) : dire ce qui est possible, et sinon s'en tenir à l'application ouverte.
- [ ] Toucher la notification l'efface déjà (`notificationclick`) : vérifier que la pastille suit.
- [ ] Tests (Vitest pour la règle de l'effacement, Playwright pour l'appel au service worker) ; vérifié à la main sur l'iPhone de Julien.

## Hors périmètre

- Changer ce qui rend une nouveauté vue : « Ton enveloppe t'attend » ne s'éteint qu'en ouvrant l'enveloppe, pas en ouvrant la page (ticket 120).

## C'est fini quand

- [ ] Sur l'iPhone, ouvrir l'enveloppe dans l'application efface la notification « Ton enveloppe t'attend » du centre de notifications, et la pastille de l'icône baisse.
- [ ] `/controle` passe.

## Compte rendu

À remplir par Claude Code à la fin : ce qui a été fait, ce qui a été décidé seul (et pourquoi), les écarts avec les maquettes, les questions posées, les commits.
