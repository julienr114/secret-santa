# Under the Tree

Secret Santa et listes de cadeaux. Projet personnel de Julien. Gratuit, sans publicité, sans traceur, exemplaire sur les données personnelles. Noël 2026 est une phase d'essai ; l'objectif est Noël 2027.

Le code de l'application n'est pas public : ne jamais écrire de lien vers ce dépôt dans l'application (un lien GitHub pointe vers le profil).

## Deux rôles, deux endroits

- **La conception** se fait dans une autre session de Claude (l'application Claude, avec les maquettes dans un artifact). Elle écrit `docs/spec/`, `docs/decisions/`, les maquettes et les tickets. Elle ne touche pas au code.
- **Toi, Claude Code, tu codes.** Tu prends un ticket prêt, tu le mènes au bout, tu le ranges. Tu ne modifies ni `docs/spec/` ni `docs/decisions/` : si la spec a tort ou se tait, tu poses une question (`/question`).

## Où tout se trouve

| Quoi | Où |
|---|---|
| Ce qu'il y a à faire | `docs/travail/` (mode d'emploi : `docs/travail/README.md`) |
| Pourquoi c'est comme ça | `docs/decisions/`, un fichier daté par décision |
| Ce que l'application doit être (V3) | `docs/spec/v3/` |
| Ce qu'est l'application aujourd'hui (V2) | `README.md` à la racine, tant qu'un fichier de `docs/spec/` ne dit pas autre chose |
| Maquettes (la référence visuelle) | `docs/refonte/maquettes-sorbet/<Nom>.html` |
| Source des maquettes | `docs/refonte/maquettes/<Nom>.html`, habillées par `docs/refonte/sorbet/habiller.py` : ne pas les modifier |
| L'arbre des pages, où mène « Retour » | `docs/ARBORESCENCE.md`, à tenir à jour à chaque écran |
| Écarts entre une maquette et le code | `docs/refonte/ECARTS-MAQUETTES.md` |
| L'ancien plan (archive, gelé le 20 novembre 2026) | `docs/refonte/PLAN.md` : on ne le lit que si un ticket y renvoie, on n'y écrit plus |

## Travailler

- `/santa-ticket` prend le prochain ticket prêt et le mène au bout. `/santa-ticket 103` en prend un précis.
- `/controle` lance les vérifications avant de dire « fini ».
- `/question` écrit une question pour Julien ou pour la conception, sans rien inventer.

Un ticket à la fois. À la fin : s'arrêter et résumer.

Si ces commandes n'existent pas, les skills ne sont pas installés : voir `docs/travail/skills-claude-code/README.md`.

## La stack

Nuxt 4, Vue 3 (`<script setup lang="ts">`, TypeScript strict), Nuxt UI 4 sur Tailwind 4, routes serveur Nitro sur Cloudflare Workers, D1 avec Drizzle, TanStack Query, Zod sur toutes les entrées d'API. Détail : `README.md`, section 7.

```
pnpm dev               le serveur local
pnpm lint              ESLint
pnpm typecheck         vue-tsc
pnpm test              Vitest
pnpm test:e2e          Playwright
pnpm db:generate       une migration Drizzle depuis le schéma
pnpm db:migrate:local  l'appliquer en local
pnpm seed:v3           les données d'essai de la V3, sur un serveur local sans clé d'email
                       (NUXT_DEV_LOGIN_LINKS=true NUXT_RESEND_API_KEY= NUXT_SUPER_ADMIN_EMAILS=admin@example.com pnpm dev)
```

## Les règles qui ne se discutent pas

- **Ne pas pousser, ne pas déployer, ne pas appliquer de migration à distance.** C'est Julien qui publie.
- **Ne pas se connecter en super-admin sur le serveur local** (un vrai email pourrait partir) ; ne pas cliquer « Découvrir » en démo.
- **Aucun résultat de tirage n'est jamais exposé** hors de la page de celui qui tire : ni dans un journal, ni dans une API, ni à un assistant.
- **Aucun texte en dur** : chaque libellé dans `shared/i18n/locales`, en français, anglais et allemand. Supprimer les clés qui ne servent plus.
- **Les maquettes se reproduisent fidèlement** : structure, textes, tailles, espacements, couleurs, ordre des actions, par les jetons et les composants du design system (`README.md`, section 23 ; `/admin/guide-de-style`).
- **Le moins de phrases possible à l'écran** : pas de note qui explique comment l'interface marche. Ne reste qu'un état, une conséquence avant un geste qu'on ne rattrape pas, ou une information sur les données de la personne.
- **Mobile seulement** : colonne `max-w-md`, cibles de 44 px. Pas de mode sombre. Pas d'image dans les emails.
- **Emoji** uniquement dans les icônes de personne et de catégorie ; ailleurs, icônes Lucide.
- **Les textes d'une liste** ne disent jamais « Père Noël » ni « famille ».
- **L'application ne connaît pas le genre** d'une personne : tournures neutres.
- **Fonctions pures** pour la logique d'affichage (`shared/utils`, `server/utils`), avec leur test à côté. `computed` plutôt que `watch`, pas de classe, pas de mutation.
- **Tests** : Vitest pour chaque fonction pure ; Playwright pour le parcours principal de chaque ticket.
- **Commits** : petits, Conventional Commits en anglais ; chacun passe `pnpm lint`, `pnpm typecheck` et `pnpm test`.
- **Tout écart avec une maquette** se note dans `docs/refonte/ECARTS-MAQUETTES.md`, dans le même commit que le code.
- **Ne rien inventer** : si une maquette montre une donnée que rien ne fournit, ou si deux textes se contredisent, laisser de côté et poser la question.
