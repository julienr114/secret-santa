# Les migrations à publier

La production est à `0047_v3_hints_without_account` (la bascule, ticket 113). Les migrations ci-dessous sont faites et appliquées en local seulement. **C'est Julien qui les publie**, dans l'ordre, avec `pnpm db:migrate`, **puis** le code (`pnpm deploy:prod`) : la migration d'abord, comme à la bascule.

| Ordre | Migration | Ticket | Ce qu'elle change |
|---|---|---|---|
| 1 | `0048_v3_news_by_email` | 121 | Le réglage « Par email » de chaque compte (« Un résumé le matin » pour tous au départ), le jour de son dernier résumé ; pour chaque nouveauté, si elle peut partir par email et quand elle est partie. Les nouveautés d'avant sont marquées parties : personne ne reçoit d'un coup trente jours de nouveautés. |
