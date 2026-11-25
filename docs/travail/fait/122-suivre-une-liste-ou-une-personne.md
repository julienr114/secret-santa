# 122 — Suivre une liste, ou une personne

- **Dépend de** : 106, 120, 121
- **Migration** : oui (ce qu'un compte suit)
- **Maquettes** : `ListeSuivre`

## Objectif

Sur une liste qui n'est pas la mienne, je peux demander à être prévenu des nouvelles idées : pour toute la liste, ou pour une seule personne (« Suivre Léo »).

## À lire d'abord

- `README.md`, section 22.22
- `docs/spec/v3/listes.md` (qui peut ouvrir une liste)
- L'archive `docs/refonte/PLAN.md`, section 6, « Lot 29 bis » (les points relus avec Julien le 19 novembre 2026)

## À faire

- [x] **Le cœur, en fonctions pures**, testé d'abord : qui suit quoi (une liste entière, ou des personnes d'une liste) ; pour une idée ajoutée ou une personne ajoutée, quels comptes prévenir ; jamais ceux qui tiennent la liste, jamais une liste passée, **jamais quelqu'un qui n'a plus le droit de l'ouvrir** (le partage a été resserré, il a quitté l'événement).
- [x] **Base** : ce qu'un compte suit (la liste, et la personne de la liste ou rien pour toute la liste).
- [x] **La cloche** au bout du nom de chaque personne, sur toute liste que je peux ouvrir sans la tenir (par un événement ou par son lien) : `aria-pressed`, « Suivre Léo » ou « Ne plus suivre Léo », zone de 44 px. La ligne d'état sous le mot de la liste, avec « Suivre toute la liste » ou « Ne plus suivre ».
- [x] **Sans compte**, sur une liste publique : la cloche mène à la connexion, puis le suivi est posé au retour.
- [x] **Les nouveautés** (ticket 120) : « de nouvelles idées » n'est à prévenir hors de l'application que pour ceux qui suivent ; les points rouges restent pour toute liste que je peux ouvrir. Regroupement par personne et par jour.
- [x] **« Me prévenir »** : la liste de ce que je suis, avec « Ne plus suivre ». Le lien d'arrêt dans le résumé et dans l'email immédiat.
- [x] Trois langues, `tests/e2e`.

- [x] **Une liste sans personne** (un mariage) : une seule cloche, pour toute la liste ; pas de « Suivre » par personne (case reprise de l'ancien plan, Lot 27 bis, le 24 novembre 2026).

## Hors périmètre

- Suivre un événement entier, ou quelqu'un à travers toutes ses listes.

## C'est fini quand

- [x] Suivre Léo me prévient d'une idée ajoutée pour Léo, pas d'une idée pour Zoé.
- [x] Celui qui a perdu l'accès à la liste n'est plus prévenu (un test le vérifie).
- [x] La maquette est reproduite.
- [x] `/controle` passe.

## Compte rendu

**Fait.**

- **Le cœur, en fonctions pures** (`server/utils/follows.ts`, testé) :
  - `followersToTell` : qui prévenir d'une idée (ceux qui suivent toute la liste, et ceux qui suivent sa personne) ou d'une personne ajoutée (toute la liste seulement). Jamais ceux qui la tiennent, ni l'auteur, ni sur une liste d'une année passée, ni qui ne peut plus l'ouvrir ;
  - `followState` : où j'en suis ;
  - `toggledFollow` : ce que je suis une fois une cloche touchée. Quitter une personne en suivant toute la liste garde les autres.
- **La base** : migration `0049_v3_list_follows`, table `gift_list_follows` (le compte, la liste, la personne ou rien pour toute la liste), avec `server/database/follows.ts`. Ce qu'un compte suit part avec la liste, avec la personne retirée de la liste, et avec un proche supprimé.
- **Qui peut encore l'ouvrir** : une liste publique s'ouvre à tous. Une autre s'ouvre aux membres actifs et aux organisateurs des événements où elle est partagée avec tout le monde (`accountsWhereShared`). Les tests le vérifient : quelqu'un qui quitte l'événement n'est plus prévenu, et personne ne l'est plus une fois la liste réservée à celui qui a tiré.
- **Les nouveautés** : deux natures de plus, du niveau « le reste », qui partent par email selon « Me prévenir » :
  - `followed_ideas`, « 3 nouvelles idées pour Léo », regroupée par personne et par jour, ou « sur la liste » pour une liste sans personne ;
  - `followed_person`, « Zoé est sur la liste ».

  Qui suit reçoit celle-là à la place de « Camille a ajouté des idées à sa liste », qui reste le point dans l'application pour les autres lecteurs, sans email. Une idée pour une personne que je ne suis pas reste ce point-là.
- **La cloche** (`ListsFollowBell`) au bout du nom de chaque personne, sur la liste ouverte par son lien, pour qui ne la tient pas. Elle porte `aria-pressed` et se lit « Suivre Léo » ou « Ne plus suivre Léo » ; on la touche sur 44 px. Sous le mot de la liste, une ligne dit où j'en suis, avec « Suivre toute la liste » ou « Ne plus suivre ». Le choix se montre tout de suite et revient en arrière si l'envoi échoue (`useFollowMutation`).
- **Sans compte**, sur une liste publique : la cloche mène à `/l/[jeton]/connexion?suivre=`, « Ton adresse email, pour suivre », sans prénom. Le lien reçu ramène à la liste, et le suivi est posé.
- **« Me prévenir »** : « Ce que je suis », une ligne par liste (les personnes, ou « Toute la liste ») avec « Ne plus suivre ». Les emails qui disent une liste suivie, seuls ou dans le résumé, finissent par « Ne plus suivre une liste », qui y mène (`#suivis`).
- **Tests** : Vitest (`server/utils/follows.test.ts`, `tests/follows.test.ts` sur une vraie base, `newsEmail.test.ts`) ; Playwright (`follow.spec.ts`).

**Décidé seul, et pourquoi.**

- **Le lien d'arrêt** mène à « Me prévenir » plutôt que d'arrêter d'un clic : un lien qui agit sans session demanderait un jeton à lui. « Ne plus recevoir d'emails » est le ticket 130.
- **Celui qui ne voit la liste que parce qu'il a tiré quelqu'un qui la tient** (le partage « réservé à celui qui m'a tiré ») n'est pas prévenu par un suivi. Il a déjà « De nouvelles idées t'attendent » sur son Secret Santa. Le suivre aurait demandé de déchiffrer le tirage à chaque idée.
- **Les règles du 24 novembre** : les tournures neutres (« Tu suis… »), et un bouton plutôt qu'un lien rouge souligné.
- **Le fichier de ce ticket** porte une ligne que la conception a ajoutée le 24 novembre (« Une liste sans personne ») : elle part avec lui dans ce commit.

**Écarts avec les maquettes** : section « Suivre une liste, ou une personne » de `docs/refonte/ECARTS-MAQUETTES.md`.

**Questions posées** : aucune.

**Migrations** : `0049_v3_list_follows`, appliquée en local seulement, après `0048` ; dans `docs/travail/migrations-a-publier.md`.

**Contrôle** : `pnpm controle --e2e`, tout est passé : 1 058 tests Vitest et 228 parcours.

**Commit** : un seul, `feat(lists): follow a list, or one person of it`.

