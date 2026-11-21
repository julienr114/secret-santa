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

- [ ] **L'inventaire d'abord** : chaque fichier de `app/pages` a sa ligne dans `docs/ARBORESCENCE.md`, avec son parent. Une page sans ligne, ou dont le parent n'existe plus, est un défaut à corriger ici.
- [ ] **Les pages des anciens onglets** : `/listes` et `/tirages-passes` n'existent plus, si les tickets 106 et 108 ne les ont pas déjà retirées ; leurs adresses, et celles des pistes, mènent où `navigation.md` le dit (`app/middleware/redirects.global.ts`).
- [ ] **Plus rien ne vise `/listes`** : ni `back`, ni `navigateTo`, ni `to`, ni fil au-dessus d'un titre. Le 21 novembre : `listes/[id]/index.vue`, `listes/[id]/teneurs.vue`, `listes/[id]/supprimer.vue`, `famille/index.vue`, `l/[token]/index.vue`.
- [ ] **« Retour » quand une page a plusieurs parents**, en fonction pure testée, à côté de `backMove` (`shared/utils/navigation.ts`) : le tableau de `navigation.md`, ligne par ligne. Que l'adresse ou l'historique porte le parent d'où je viens est un choix de code ; il doit tenir après un détour par une page fille, et ne jamais ouvrir une page que je n'ai pas le droit de voir.
- [ ] **Après un geste qui ferme la page** : supprimer une liste, cesser de la tenir, quitter ou supprimer un événement, supprimer un Secret Santa.
- [ ] **« Mes proches »** et la fiche d'un proche : elles remontent à la liste d'où je viens.
- [ ] **L'onglet allumé** de la barre du bas, sur chaque page.
- [ ] **Un test qui lit le code** : tout chemin écrit en dur dans `app/` (`to`, `back`, `navigateTo`) correspond à une page qui existe.
- [ ] `tests/e2e`, les parcours : accueil → liste → « Retour » (l'accueil) ; événement → liste → une idée → liste → « Retour » (l'événement) ; « Quoi de neuf » → liste → « Retour » (« Quoi de neuf ») ; le lien d'un email → liste → « Retour » (l'accueil) ; sans session, pas de « Retour » ; `/listes` tapé à la main (l'accueil).
- [ ] Retirer des trois langues les textes des pages supprimées.
- [ ] `docs/ARBORESCENCE.md` à jour : plus de ligne « Listes (l'onglet) », plus de parent « Listes ».

## Hors périmètre

- Le retour du navigateur : il garde son comportement.
- Les panneaux du bas : ils se ferment, ils ne remontent pas.
- Renommer les adresses qui marchent (`/admin/[événement]/editions/…`, `/famille`) : elles restent.

## C'est fini quand

- [ ] Chercher `/listes'`, `/listes"` et `tirages-passes` dans `app/` ne trouve plus rien, hors de la table des anciennes adresses.
- [ ] Chaque ligne du tableau de `navigation.md` a son test.
- [ ] Les six parcours passent.
- [ ] `/controle` passe.

## Compte rendu

À remplir par Claude Code à la fin : ce qui a été fait, ce qui a été décidé seul (et pourquoi), les écarts avec les maquettes, les questions posées, les commits.
