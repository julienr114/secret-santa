# 114 — V3 : la navigation, d'un bout à l'autre

- **Dépend de** : 106, 107, 108, 120
- **Migration** : non
- **Maquettes** : aucune nouvelle. Les liens des maquettes `V3Accueil`, `V3Fete`, `V3Liste`, `V3ListeMembre`, `V3QuoiDeNeuf`, `V3OffreAilleurs`, `V3FetesPassees`, `V3FeteAnneePassee` montrent d'où l'on ouvre quoi.

## Objectif

Depuis n'importe quelle page, « Retour » mène là où on l'attend. Aucun lien n'ouvre une page d'avant la V3, aucune ancienne adresse ne donne une erreur. C'est la revue que Julien a demandée avant la publication (21 novembre 2026) : aujourd'hui, « Retour » sur une liste ouvre encore la page de l'ancien onglet « Listes ».

## À lire d'abord

- `docs/spec/v3/navigation.md` (tout le ticket est là)
- `docs/decisions/2026-11-21-retour-la-d-ou-l-on-vient.md`
- `docs/ARBORESCENCE.md` (« La règle du bouton Retour »)

## À faire

- [x] **Les squelettes** : chaque page de l'inventaire montre, pendant qu'elle charge, un squelette à sa forme (`docs/spec/v3/regles-d-ecran.md`, « Un écran qui arrive »). C'est la dernière vérification avant la bascule.
- [x] **Les treize maquettes orphelines** (Q-024, Julien a dit oui) : les supprimer de `docs/refonte/maquettes/` et de `docs/refonte/maquettes-sorbet/`, si ce n'est pas déjà fait. La liste est dans `docs/spec/v3/maquettes.md`.
- [x] **L'inventaire d'abord** : chaque fichier de `app/pages` a sa ligne dans `docs/ARBORESCENCE.md`, avec son parent. Une page sans ligne, ou dont le parent n'existe plus, est un défaut à corriger ici.
- [x] **Les pages des anciens onglets** : `/listes` et `/tirages-passes` n'existent plus, si les tickets 106 et 108 ne les ont pas déjà retirées ; leurs adresses, et celles des pistes, mènent où `navigation.md` le dit (`app/middleware/redirects.global.ts`).
- [x] **Plus rien ne vise `/listes`** : ni `back`, ni `navigateTo`, ni `to`, ni fil au-dessus d'un titre. Le 21 novembre : `listes/[id]/index.vue`, `listes/[id]/teneurs.vue`, `listes/[id]/supprimer.vue`, `famille/index.vue`, `l/[token]/index.vue`.
- [x] **« Retour » quand une page a plusieurs parents**, en fonction pure testée, à côté de `backMove` (`shared/utils/navigation.ts`) : le tableau de `navigation.md`, ligne par ligne. Que l'adresse ou l'historique porte le parent d'où je viens est un choix de code ; il doit tenir après un détour par une page fille, et ne jamais ouvrir une page que je n'ai pas le droit de voir.
- [x] **Après un geste qui ferme la page** : supprimer une liste, cesser de la tenir, quitter ou supprimer un événement, supprimer un Secret Santa.
- [x] **« Mes proches »** et la fiche d'un proche : elles remontent à la liste d'où je viens.
- [x] **L'onglet allumé** de la barre du bas, sur chaque page.
- [x] **Un test qui lit le code** : tout chemin écrit en dur dans `app/` (`to`, `back`, `navigateTo`) correspond à une page qui existe.
- [x] `tests/e2e`, les parcours : accueil → liste → « Retour » (l'accueil) ; événement → liste → une idée → liste → « Retour » (l'événement) ; « Quoi de neuf » → liste → « Retour » (« Quoi de neuf ») ; le lien d'un email → liste → « Retour » (l'accueil) ; sans session, pas de « Retour » ; `/listes` tapé à la main (l'accueil).
- [x] Retirer des trois langues les textes des pages supprimées.
- [x] `docs/ARBORESCENCE.md` à jour : plus de ligne « Listes (l'onglet) », plus de parent « Listes ».

## Hors périmètre

- Le retour du navigateur : il garde son comportement.
- Les panneaux du bas : ils se ferment, ils ne remontent pas.
- Renommer les adresses qui marchent (`/admin/[événement]/editions/…`, `/famille`) : elles restent.

## C'est fini quand

- [x] Chercher `/listes'`, `/listes"` et `tirages-passes` dans `app/` ne trouve plus rien, hors de la table des anciennes adresses.
- [x] Chaque ligne du tableau de `navigation.md` a son test.
- [x] Les six parcours passent.
- [x] `/controle` passe.

## Compte rendu

**Fait.**

- **« Retour » quand une page a plusieurs parents** : `placeOf`, `PARENTS` et `parentOf` (`shared/utils/navigation.ts`, un test par ligne du tableau de `navigation.md`), lus par `useParent` (`app/composables/useParent.ts`) sur l'événement, la liste (celle que je tiens et celle d'un autre par son lien), ma page d'un Secret Santa, celle de l'organisateur, « Mes proches », la fiche d'un proche et une année passée. Le parent vient de **l'historique** (la page d'avant), jamais de l'adresse : « Retour » n'ouvre qu'une page que je viens de voir. Il est retenu pour la visite (`useState`), ce qui le fait tenir après un détour par une page fille ramenée par « Enregistrer » ; un rechargement l'oublie (le parent par défaut, comme le dit la spec).
- **Après un geste qui ferme la page** : supprimer une liste ou cesser de la tenir mène là où « Retour » aurait mené (`useParentOfPage`) ; quitter ou supprimer un événement (l'accueil) et supprimer un Secret Santa (son événement) le faisaient déjà.
- **Ma page d'un Secret Santa** : connecté, elle a toujours un « Retour » (l'accueil par défaut) ; sans session, aucun. `useDrawFromHome` est supprimé.
- **`/listes`** : la page est supprimée, l'adresse mène à l'accueil (`listsPathOf`, dans `redirects.global.ts`) ; `/tirages-passes` l'était déjà (108). Plus rien ne vise `/listes` : `back` de la liste, de « Nouvelle liste » (l'accueil) et de « Mes proches », fils « Listes » de « Ceux qui tiennent la liste » et de « Mes proches » retirés, `navigateTo` après suppression et départ. `/l/[jeton]` : `useParent`. 25 clés `lists.home.*` retirées des trois langues (restent `title`, `on`, `untitled`, encore lues ailleurs) ; `useListsQuery` retiré.
- **Un test qui lit le code** (`tests/routes.test.ts`) : chaque chemin écrit après `to`, `back` ou `navigateTo` dans `app/` est une page qui existe (pas une ancienne adresse) ; il trouve bien `back="/listes"` si on le remet. Le même fichier vérifie l'onglet allumé de chaque page (`tabOf`) : « Quoi de neuf » et les pages du super-admin seulement.
- **Les squelettes** : les pages relues une à une ; seule l'invitation à tenir une liste (`/invitation/[jeton]`) montrait une roue seule : elle a maintenant un squelette à sa forme.
- **Les treize maquettes orphelines** supprimées des deux dossiers (26 fichiers).
- **L'inventaire** : chaque page a sa ligne dans `ARBORESCENCE.md` ; la ligne `/l/[jeton]/gouts/[place]` (une page qui n'existe pas) est retirée ; plus de « Listes (l'onglet) » ni de parent « Listes » ; une section « Quand une page a plusieurs parents ».
- **Tests** : Vitest (`navigation.test.ts`, `routes.test.ts`) ; Playwright `tests/e2e/navigation.spec.ts`, les six parcours. Les tests qui passaient par `/listes` ouvrent la liste par son adresse (`openList`, d'après `/api/lists`) ; `email.spec.ts` attend désormais un « Retour » sur ma page rechargée.

**Décidé seul** :
- L'historique plutôt que l'adresse pour le parent d'où je viens : rien à valider côté serveur (une adresse fabriquée ne peut ouvrir une page interdite), et la spec veut le parent par défaut après un rechargement. Seule l'année passée garde son `?depuis=evenement` (ticket 108), comme parent par défaut.
- « Une idée » n'a pas de page à elle (un panneau) : le détour du parcours passe par la fiche de Léo, ouverte depuis la liste.
- `/api/home` règle désormais ce qui attendait le compte (`settleArrivals` : invitations à tenir une liste, personnes reliées à son adresse) : seule la page « Listes » le faisait en ouvrant ses listes, avec les liens et l'acceptation d'une invitation. Sans cela, une invitation par adresse n'aurait plus abouti qu'en ouvrant le lien. La route `GET /api/lists` reste (les tests e2e s'en servent pour retrouver une liste) ; l'application ne l'appelle plus.
- `/listes/[id]/supprimer` garde son petit « Listes » au-dessus du titre (un libellé, pas un lien).
- `/rejoindre/[code]` garde son bloc gris : la page est refaite par le ticket 117.

**Écarts avec les maquettes** (`ECARTS-MAQUETTES.md`, « La navigation ») : `ListeTeneurs` et `Famille` sans le fil « Listes » ; `ListeInvitation` avec un squelette.

**Questions** : aucune. **Migration** : aucune.

**Contrôle** : `pnpm controle --e2e` passé (trois langues, mots interdits, textes en dur, lint, typecheck, 884 tests Vitest, 175 tests Playwright, sans échec du test instable de `security.spec.ts`).

**Commits** : `8f07baf` docs: ticket 114 started ; `5a04f54` docs: remove the thirteen orphan mockups ; `b1e3a7e` feat(navigation): « Retour » leads back where one comes from ; `a58c3c1` feat(skeleton): the invitation to hold a list waits in its own shape ; `3825cc8` test(e2e): the six ways back of the navigation ; puis docs: ticket 114 done.
