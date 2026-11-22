# 099 — V3 : un squelette pour chaque écran qui arrive

- **Dépend de** : aucun
- **Migration** : non
- **Maquettes** : `V3ChargementAccueil`, `V3ChargementFete` ; pour le reste, celles d'avant (`ChargementListe`, `ChargementTirage`, `ChargementJournal`, `ChargementPanneau`)

## Objectif

Aucun écran de la V3 ne s'ouvre sur du vide. Pendant que ses données arrivent, chacun montre un squelette qui a sa forme. Julien l'a vu en essayant : le nouvel accueil n'a pas le sien (22 novembre 2026).

## À lire d'abord

- `docs/spec/v3/regles-d-ecran.md` (« Un écran qui arrive »)
- `README.md`, section 23 : `UiSkeleton`, `AdminQueryState`, `ParticipantScreen`

## À faire

- [x] **L'inventaire d'abord** : pour chaque page de `app/pages` déjà passée à la V3, ce qu'elle montre pendant le chargement, et si ça a sa forme. Le mettre dans le compte rendu.
- [x] **L'accueil** (`V3ChargementAccueil`) : aujourd'hui `['header', 'card', 'card']`, qui date de l'ancien accueil. Le bonjour, le titre de la saison, des cartes d'événement avec leur en-tête et leurs lignes.
- [x] **La page d'un événement** (`V3ChargementFete`) : la catégorie, le nom, la date, la ligne des membres, puis les sections et leurs lignes.
- [x] **Les autres pages déjà faites**, à la forme de chacune : « Membres » et la fiche d'une personne, les réglages d'un événement et d'un Secret Santa, « Pour quelle occasion ? », la page d'un Secret Santa pour l'organisateur et pour le participant, une liste (celui qui la tient, celui qui l'ouvre par son lien), « Qui verra ta liste ? », « Ce que j'offre ailleurs », l'administration.
- [x] Ajouter à `UiSkeleton` les pièces qui manquent (une carte d'événement, une ligne à icône, une ligne de membres), plutôt que de dessiner un squelette à la main dans chaque page.
- [x] Un écran déjà affiché qui se met à jour ne repasse pas par son squelette.
- [x] Le guide de style montre les nouvelles pièces.
- [x] `tests/e2e` : avec une réponse retardée, l'accueil et la page d'un événement montrent leur squelette, puis leur contenu, sans saut de mise en page visible.

## Hors périmètre

- Les écrans des tickets pas encore faits (les événements passés, « Quoi de neuf », « Qui reprendre ? », « Inviter quelqu'un ») : chaque ticket fait le squelette de ses écrans, la règle est dans `regles-d-ecran.md`. Le ticket 114 vérifie qu'il n'en manque aucun.
- Les états d'erreur et les écrans vides.

## C'est fini quand

- [x] L’inventaire ne laisse aucune page déjà faite sans squelette à sa forme.
- [x] Les deux maquettes sont reproduites.
- [x] `/controle` passe.

## Compte rendu

**Fait.**

**L'inventaire** (ce que montrait chaque page pendant le chargement → ce qu'elle montre) :

| Page | Avant | Maintenant |
|---|---|---|
| L'accueil (`HomeDashboard`) | `header, card, card` (l'ancien accueil) | `greeting, parties` : le bonjour, la saison, trois cartes d'événement (1, 2, 3 lignes), comme `V3ChargementAccueil` |
| Un événement `/e/[slug]` | `list` | `head, members, sections` : la catégorie, le nom, la date, la ligne des membres, deux sections, comme `V3ChargementFete` |
| « Membres » | titre écrit, `list` × 6 | inchangé : des personnes avec leur icône, c'est sa forme |
| La fiche d'une personne | `header, list` | `header, settings, list` : l'en-tête, les champs, « Ne tire pas » |
| Réglages d'un événement | `list, list` (des icônes de personne) | `settings` × 3 : des lignes de réglage sans icône |
| Réglages d'un Secret Santa | `title, list` | `title, settings` × 3 |
| « Pour quelle occasion ? » | rien à attendre (la grille est fixe) | inchangé ; l'étape « Qui est de la fête ? » montrait du vide en attendant les personnes : `chips, list` |
| Secret Santa, organisateur | `title, stepper, card, list` | inchangé : a sa forme |
| Secret Santa, participant `/p/[token]` | `header, steps, envelope, list` | inchangé : a sa forme (`ChargementTirage`) |
| Une liste, celui qui la tient | `card, title, card` | `bar, doc, list` : la barre de partage, la pastille et le nom, les personnes |
| Une liste par son lien `/l/[token]` | `title, card, list` | `doc, list` |
| « Qui verra ta liste ? » (panneau) | `list` (ronds de personne) | `icons` : des lignes à icône carrée, comme les événements qu'il montre |
| « Ce que j'offre ailleurs » | `list` | `icons` |
| Les événements passés, une année passée (ticket 108) | `title, list` | `title, sections` et `head, sections` |
| L'administration (tableau de bord, comptes, fêtes, un compte) | `card, card, list` / `list` / `header, list, list` | inchangé : a sa forme |

- `UiSkeleton` gagne les pièces `greeting`, `parties` (la carte d'événement), `head`, `members` (la ligne des membres), `sections` et `icons` (la ligne à icône, dessinée par `UiSkeletonLines`), `settings`, `chips`, `bar`, `doc`, et un `gap` (14, 18 ou 24 px, `skeleton-gap` sur `AdminQueryState`). Les largeurs des lignes viennent de `skeletonLines` (`shared/utils/skeleton.ts`, avec son test). Les clés des pièces sont leur rang : deux `card` de suite ne se marchent plus dessus.
- Un écran déjà affiché ne repasse pas par son squelette : tous attendent sur `isPending` (vrai seulement sans données). Seule exception trouvée : `/p/[token]/liste` repassait par le squelette en écrivant la première idée ; c'est maintenant le bouton qui travaille.
- Le guide de style montre les nouvelles pièces ; README section 23 à jour.

**Décidé seul** (noté dans `ECARTS-MAQUETTES.md`, « Un écran qui arrive ») : la marge du haut reste celle des pages (20 px, pas 8) pour que le contenu arrive à la place du squelette ; les largeurs des lignes tournent sur quatre paires ; la forme des pages sans maquette de chargement, composée des pièces. Les prénoms proposés pour un anniversaire (« Pour qui ? ») arrivent sans squelette : la liste est déjà en cache le plus souvent, et le choix « Quelqu'un d'autre » est là.

**Questions** : aucune. **Migration** : aucune.

**Tests** : `skeletonLines` (Vitest) ; `tests/e2e/skeletons.spec.ts` retient la réponse de `/api/home` puis de `/api/parties/<slug>` : le squelette (3 cartes, puis 2 sections) s'affiche, le contenu arrive au même haut de page, la barre ne bouge pas, et le retour à l'accueil ne repasse pas par le squelette.

**Contrôle** : `pnpm controle --e2e` passé (trois langues, mots interdits, textes en dur, lint, typecheck, 806 tests Vitest, 166 tests Playwright, sans échec du test instable de `security.spec.ts`).

**Commits** : `482497b` docs: ticket 099 started ; `3ab7ca8` feat(skeleton): the pieces of the V3 screens on their way ; `d793f37` feat(skeleton): each V3 screen waits in its own shape ; puis docs: ticket 099 done.
