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

- [ ] **L'inventaire d'abord** : pour chaque page de `app/pages` déjà passée à la V3, ce qu'elle montre pendant le chargement, et si ça a sa forme. Le mettre dans le compte rendu.
- [ ] **L'accueil** (`V3ChargementAccueil`) : aujourd'hui `['header', 'card', 'card']`, qui date de l'ancien accueil. Le bonjour, le titre de la saison, des cartes d'événement avec leur en-tête et leurs lignes.
- [ ] **La page d'un événement** (`V3ChargementFete`) : la catégorie, le nom, la date, la ligne des membres, puis les sections et leurs lignes.
- [ ] **Les autres pages déjà faites**, à la forme de chacune : « Membres » et la fiche d'une personne, les réglages d'un événement et d'un Secret Santa, « Pour quelle occasion ? », la page d'un Secret Santa pour l'organisateur et pour le participant, une liste (celui qui la tient, celui qui l'ouvre par son lien), « Qui verra ta liste ? », « Ce que j'offre ailleurs », l'administration.
- [ ] Ajouter à `UiSkeleton` les pièces qui manquent (une carte d'événement, une ligne à icône, une ligne de membres), plutôt que de dessiner un squelette à la main dans chaque page.
- [ ] Un écran déjà affiché qui se met à jour ne repasse pas par son squelette.
- [ ] Le guide de style montre les nouvelles pièces.
- [ ] `tests/e2e` : avec une réponse retardée, l'accueil et la page d'un événement montrent leur squelette, puis leur contenu, sans saut de mise en page visible.

## Hors périmètre

- Les écrans des tickets pas encore faits (les événements passés, « Quoi de neuf », « Qui reprendre ? », « Inviter quelqu'un ») : chaque ticket fait le squelette de ses écrans, la règle est dans `regles-d-ecran.md`. Le ticket 114 vérifie qu'il n'en manque aucun.
- Les états d'erreur et les écrans vides.

## C'est fini quand

- [ ] L'inventaire ne laisse aucune page déjà faite sans squelette à sa forme.
- [ ] Les deux maquettes sont reproduites.
- [ ] `/controle` passe.

## Compte rendu

À remplir par Claude Code à la fin : l'inventaire, ce qui a été fait, ce qui a été décidé seul (et pourquoi), les écarts avec les maquettes, les commits.
