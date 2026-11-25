# Les migrations à publier

La production est à `0053_v3_push_subscriptions` (publiées par Julien le 25 novembre 2026 : `0048` à `0053`). Les migrations faites ensuite s'ajoutent ici, dans l'ordre, et Julien les publie avec `pnpm db:migrate`, **puis** le code (`pnpm deploy:prod`).

| Ordre | Migration | Ticket | Ce qu'elle change |
|---|---|---|---|

Aucune pour l'instant.

À faire encore, depuis `0051` : deux réglages chez le fournisseur d'email, pour que les rejets et les plaintes bloquent l'adresse :

- dans Resend, un webhook vers `https://under-the-tree.party/api/email/events`, pour les événements `email.bounced` et `email.complained` ;
- son secret (« whsec_… ») dans le secret Cloudflare `NUXT_RESEND_WEBHOOK_SECRET` (`pnpm wrangler secret put NUXT_RESEND_WEBHOOK_SECRET`). Sans lui, le webhook est refusé et rien n'est bloqué par un rejet.
