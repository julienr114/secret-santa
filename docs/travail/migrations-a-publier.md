# Les migrations à publier

La production est à `0047_v3_hints_without_account` (la bascule, ticket 113). Les migrations ci-dessous sont faites et appliquées en local seulement. **C'est Julien qui les publie**, dans l'ordre, avec `pnpm db:migrate`, **puis** le code (`pnpm deploy:prod`) : la migration d'abord, comme à la bascule.

| Ordre | Migration | Ticket | Ce qu'elle change |
|---|---|---|---|
| 1 | `0048_v3_news_by_email` | 121 | Le réglage « Par email » de chaque compte (« Un résumé le matin » pour tous au départ), le jour de son dernier résumé ; pour chaque nouveauté, si elle peut partir par email et quand elle est partie. Les nouveautés d'avant sont marquées parties : personne ne reçoit d'un coup trente jours de nouveautés. |
| 2 | `0049_v3_list_follows` | 122 | La table `gift_list_follows` : ce qu'un compte suit sur une liste, toute la liste ou une personne. |
| 3 | `0050_v3_app_counters` | 129 | La table `app_counters` : ce que l'application compte par jour (emails envoyés et rejetés, requêtes refusées pour débit, connexions échouées, erreurs du serveur, avertissements donnés). Les deux nouveaux interrupteurs sont des lignes de `app_switches`, sans changement de table. |
| 4 | `0051_v3_email_blocks` | 130 | Les tables `email_blocks` (les adresses bloquées, par empreinte), `email_seen` (les adresses déjà écrites) et `email_reports` (« Signaler cet envoi ») ; la colonne `parties.emails_off`. |
| 5 | `0052_v3_login_codes` | 123 | La table `login_codes` : les codes de connexion de l'application installée, par leur empreinte liée à l'appareil, jamais en clair. |
| 6 | `0053_v3_push_subscriptions` | 124 | La table `push_subscriptions` (les téléphones qui ont demandé les notifications) et `news.pushed_at`. Les nouveautés d'avant sont marquées parties. |

Avec `0051`, deux réglages chez le fournisseur d'email, pour que les rejets et les plaintes bloquent l'adresse :

- dans Resend, un webhook vers `https://under-the-tree.party/api/email/events`, pour les événements `email.bounced` et `email.complained` ;
- son secret (« whsec_… ») dans le secret Cloudflare `NUXT_RESEND_WEBHOOK_SECRET` (`pnpm wrangler secret put NUXT_RESEND_WEBHOOK_SECRET`). Sans lui, le webhook est refusé et rien n'est bloqué par un rejet.
