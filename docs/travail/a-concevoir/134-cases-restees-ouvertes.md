# 134 — Les cases restées ouvertes dans l'ancien plan

- **État** : triées le 24 novembre 2026, décidées par Julien le 25 novembre. Il reste une chose, datée : la politique de contenu (ticket 172, à partir du 2 décembre). Ce fichier se ferme avec elle.
- **Vient de** : `docs/refonte/PLAN.md`, des lots et des corrections par ailleurs terminés
- **Dépend de** : rien

| Où (ancien plan) | Ce qui reste | Ce que la conception en fait |
|---|---|---|
| « Publier les listes » (migrations 0028 à 0032) | Rien | **Fermé** : la production était à 0033 avant la bascule, et la V3 est en ligne. |
| Lot 27 bis | « Suivre » une liste sans personne : une seule cloche | **Rangé dans le ticket 122** (une case ajoutée). |
| Lot 6, journal | `JournalPersonne` : le filtre « Moi » | **Fermé** (Claude Code, 25 novembre 2026) : les lignes du journal portent déjà la personne concernée (`audit_log.person_id`, rempli pour un message envoyé, un lien copié ou régénéré, un participant ajouté ou retiré, un résultat découvert, l'icône ou la langue changée, une réponse d'un tirage fait ailleurs). **Le filtre existe déjà** : `JournalView` propose « Moi » au participant, dit à la deuxième personne, et n'importe qui à l'organisateur. Rien à faire. |
| Correction 23 | La double authentification sur Cloudflare, GitHub, Resend et la boîte email du super-admin | **Fermé** : déjà fait (Julien, 24 novembre 2026). Rien à coder. |
| Lot 38 A | La politique de contenu (CSP) est en mode rapport | **Décidé** : lire une semaine de rapports sur la V3, puis la passer pour de bon. Souche : ticket 172, à partir du 2 décembre 2026. |
| Correction 29 | axe (`@axe-core/playwright`) sur une liste tenue et une liste visitée | **Fermé** : axe est déjà installé (`@axe-core/playwright` dans `package.json`) et un test le lance sur une liste tenue et une liste visitée (`tests/e2e/lists-last-touches.spec.ts`). |
| Correction 17 | Dire qui a fait quoi entre organisateurs (« Dernier rappel le 20 décembre, par Hugo ») | **Décidé** : oui, pour les envois seulement. Ticket 170. |
| Lot 38 A | Changer `NUXT_DATA_KEY` demande un script de re-chiffrement | **Décidé** : un ticket, le 171, avant le 128. |
