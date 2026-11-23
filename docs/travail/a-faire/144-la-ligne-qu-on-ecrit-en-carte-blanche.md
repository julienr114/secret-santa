# 144 — La ligne qu'on écrit et la ligne qu'on déplace : une carte blanche

- **Dépend de** : 140 (le même composant, `IdeaLine.vue`)
- **Avant** : la bascule (ticket 113)
- **Migration** : non
- **Maquettes** : `ListeIdee`, `ListeIdeeLien`, `ListeIdeeLienFait`, `ListeHorsListe`, `ListeGlisser`

## Objectif

Julien, le 23 novembre 2026 : quand on touche une idée pour l'écrire, le bandeau blanc bord à bord avec son trait rouge est trop dur. Il devient une carte blanche aux coins arrondis, avec une ombre légère. La ligne qu'on déplace prend la même carte.

## À lire d'abord

- `docs/spec/v3/listes.md` (« La ligne qu'on écrit, la ligne qu'on déplace »)
- `app/components/lists/IdeaLine.vue` (la classe posée quand `writing`), `app/components/lists/DragGhost.vue`, `app/components/lists/PersonSection.vue` (`drop-line`)

## À faire

- [ ] **La ligne qu'on écrit** (`IdeaLine.vue`, `writing`) : fond blanc, coins de 16 px, un liseré de 1 px de la couleur des traits fins, une ombre légère teintée de rouge (maquette : `0 6px 16px` à 10 %). Plus de `border-l` rouge, plus de marges négatives jusqu'aux bords de l'écran.
- [ ] La carte dépasse de 10 px à gauche, 8 px à droite, 4 px en haut et en bas, **sans déplacer la case ni le texte** (ni à l'entrée, ni à la sortie, ni pour une ligne en retrait, `--line-in`).
- [ ] La même carte pour « J'offre autre chose » écrit sur place, et pour toute autre ligne écrite sur place qui avait le bandeau.
- [ ] **La ligne soulevée** (`DragGhost.vue`) : la même carte, sans `ring-primary` ; l'ombre un peu plus marquée (maquette : `0 12px 26px` à 20 %), la légère rotation et la poignée restent. Pareil pour une personne qu'on déplace.
- [ ] **L'endroit où elle va tomber** (`drop-line`) : un trait arrondi de 4 px de la couleur du bord des cases, plus un trait rouge.
- [ ] Les couleurs et l'ombre sont dans le thème (`@theme`), une seule fois, pour les deux cartes.

## Hors périmètre

- Ce qu'on peut déplacer et comment (appui long, poignée, clavier) : rien ne change.
- La ligne qu'un autre est en train d'écrire (`lockedBy`) et la ligne du guide (`guided`).

## C'est fini quand

- [ ] Toucher une idée ne fait bouger ni sa case ni son texte, et aucun trait rouge n'apparaît.
- [ ] La ligne soulevée et la ligne qu'on écrit se ressemblent ; aucun contour rouge.
- [ ] `/controle` passe.

## Compte rendu

À remplir par Claude Code à la fin : ce qui a été fait, ce qui a été décidé seul (et pourquoi), les écarts avec les maquettes, les questions posées, les commits.
