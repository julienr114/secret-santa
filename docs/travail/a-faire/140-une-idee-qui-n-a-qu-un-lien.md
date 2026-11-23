# 140 — Une idée qui n'a qu'un lien ne peut plus être modifiée

- **Dépend de** : rien
- **Migration** : non
- **Maquettes** : aucune (la ligne d'une idée, `ListeTeneur`)

## Objectif

Bogue trouvé par Julien le 22 novembre 2026. Dans une liste, on écrit une idée sans texte, avec seulement un lien. Ensuite on ne peut plus rien en faire : toucher la ligne ouvre le lien à chaque fois, on ne peut ni écrire un texte ni l'effacer.

## À lire d'abord

- `docs/spec/v3/listes.md` (« Une idée qui n'a qu'un lien »)
- `app/components/lists/IdeaLine.vue` (le bouton `idea-text` est vide quand `idea.text` l'est : il n'y a plus rien à toucher), `app/components/lists/IdeaLink.vue`, `server/utils/lists.ts` (`splitIdea`)

## À faire

- [ ] **Reproduire d'abord**, par un test qui échoue : une idée avec un lien et sans texte, puis toucher sa ligne pour l'écrire.
- [ ] **Une ligne a toujours un texte à toucher** : sans texte, elle affiche le nom du site à sa place, dans le style d'un texte d'idée ; le toucher ouvre l'écriture. Le lien reste dessous et lui seul ouvre le site.
- [ ] En écriture, le champ du texte est vide (rien n'est enregistré à la place de la personne), et vider aussi le lien efface l'idée, comme aujourd'hui.
- [ ] **Nommer l'idée par le nom de son site** partout où son texte sert : « Cocher … », « Décocher … », « Qui l'offre ? », la poignée pour la déplacer, les lecteurs d'écran.
- [ ] Vérifier le même cas pour celui qui ne tient pas la liste (il peut cocher), et pour « Hors liste ».
- [ ] Les idées déjà enregistrées ainsi redeviennent modifiables, sans rien changer en base.
- [ ] Trois langues si un texte s'ajoute, tests unitaires et `tests/e2e`.

## Hors périmètre

- Aller chercher le titre de la page derrière le lien.
- Obliger à écrire un texte.

## C'est fini quand

- [ ] Une idée qui n'a qu'un lien se modifie et s'efface comme les autres.
- [ ] Toucher son lien ouvre toujours le site.
- [ ] `/controle` passe.

## Compte rendu

À remplir par Claude Code à la fin : ce qui a été fait, ce qui a été décidé seul (et pourquoi), les écarts avec les maquettes, les questions posées, les commits.
