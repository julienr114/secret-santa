# Compte rendu de la nuit du 24 au 25 novembre 2026

Rien n'est poussé, rien n'est déployé, aucune migration n'est appliquée à distance.

## Les tickets

| Ticket | Où | Commit |
|---|---|---|
| 121, « Me prévenir » : le résumé par email, et ce qui presse | `fait/` | `9ddfdfe` |
| 122, Suivre une liste, ou une personne | `fait/` | `7ce6d11` |
| 129, Durcir la dépense | **`en-cours/`** : voir plus bas | `2c166ba` |
| 130, Ne plus recevoir d'emails, et les garde-fous | `fait/` | `3aabcf3` |
| 123, La connexion par code | `fait/` | `7337dc0` |

Chaque ticket a son compte rendu : ce qui est fait, ce qui a été décidé seul, les écarts avec les maquettes. Après chacun, `pnpm controle --e2e` est passé en entier ; au dernier, 1 089 tests Vitest et 239 parcours Playwright. Pendant le 121, un premier passage a eu un échec, sans lien avec le ticket : « Mes proches : quelqu'un supprimé » (`lists.spec.ts`). Il est passé seul, puis dans la suite entière.

Les règles du 24 novembre sont appliquées, et chaque écart est noté dans son compte rendu. Il n'y a pas de phrase qui explique l'écran, les tournures sont neutres (« Tu suis… », « un email te prévient »), et une action est un bouton, pas un lien rouge souligné.

## Pourquoi le 129 reste dans `en-cours/`

- **Ta case, le jour de l'abonnement** : la limite de dépense et l'alerte de budget de Cloudflare.
- **La règle de débit du pare-feu**, à créer dans Cloudflare. Elle est décrite dans le compte rendu du ticket : `/api/auth/link`, en `POST`, par adresse IP, 5 requêtes par 10 secondes.
- **Deux jauges** (« Requêtes, aujourd'hui » et « Dépense, ce mois ») attendent **Q-039** : l'application ne voit pas ces chiffres de Cloudflare.

Le reste est fait : les trois interrupteurs d'urgence, les chiffres du jour, les plafonds des emails avec leur jauge, l'avertissement à 70 %, et les emails qui se suspendent tout seuls au plafond du mois.

## Les questions ouvertes

- **Q-039** (ticket 129) : d'où viennent les chiffres des requêtes du jour et de la dépense du mois ? Ma proposition : B tout de suite, A avec le ticket 127.
- **Q-040** (ticket 129) : pendant que les inscriptions sont suspendues, la réponse dit si une adresse a un compte. C'est codé comme A, garder ainsi.

La réponse de la conception à Q-038 (le 160, `UInputDate`) est dans `questions.md`, avec la décision et les maquettes de la conception : je n'y ai pas touché et ne l'ai pas commitée. Le 160 attend toujours ton essai sur l'iPhone. La page d'essai `app/pages/essai-date.vue` est là pour ça : en développement seulement, hors de git (`.git/info/exclude`).

## Les migrations à publier, dans l'ordre

Le détail est dans `docs/travail/migrations-a-publier.md`. La production est à `0047`.

1. `0048_v3_news_by_email` (121)
2. `0049_v3_list_follows` (122)
3. `0050_v3_app_counters` (129)
4. `0051_v3_email_blocks` (130)
5. `0052_v3_login_codes` (123)

D'abord `pnpm db:migrate`, puis `pnpm deploy:prod`.

## Ce qui te revient, à part publier

- **Resend** : un webhook vers `https://under-the-tree.party/api/email/events`, pour `email.bounced` et `email.complained`. Son secret va dans `NUXT_RESEND_WEBHOOK_SECRET` (`pnpm wrangler secret put NUXT_RESEND_WEBHOOK_SECRET`). Sans lui, un rejet ne bloque pas l'adresse.
- **Cloudflare** : la règle de débit du pare-feu, la limite de dépense et l'alerte de budget (le 129).
- **À savoir après la publication** :
  - le premier résumé du matin part le lendemain à 9 h, heure de Paris (8 h UTC), avec ce qui arrive après la migration. Les nouveautés d'avant ne partent jamais ;
  - « Ton enveloppe t'attend » part désormais par email aux comptes après un tirage, en plus de ce que l'organisateur envoie lui-même (le compte rendu du 121).

## Les fichiers de la conception

`questions.md` (la réponse à Q-038), `docs/spec/v3/`, `docs/decisions/2026-11-24-une-date-dans-un-seul-champ.md`, les maquettes `ProcheNaissance` et `V3FeteNouvelle`, `generateurs.tar.gz`, `a-concevoir/` (125 à 128, 134) et `a-faire/` (131, 132) sont modifiés dans l'arbre de travail par la conception. Aucun n'est commité.
