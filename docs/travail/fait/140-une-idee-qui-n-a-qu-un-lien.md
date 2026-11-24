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

- [x] **Reproduire d'abord**, par un test qui échoue : une idée avec un lien et sans texte, puis toucher sa ligne pour l'écrire.
- [x] **Une ligne a toujours un texte à toucher** : sans texte, elle affiche le nom du site à sa place, dans le style d'un texte d'idée ; le toucher ouvre l'écriture. Le lien reste dessous et lui seul ouvre le site.
- [x] En écriture, le champ du texte est vide (rien n'est enregistré à la place de la personne), et vider aussi le lien efface l'idée, comme aujourd'hui.
- [x] **Nommer l'idée par le nom de son site** partout où son texte sert : « Cocher … », « Décocher … », « Qui l'offre ? », la poignée pour la déplacer, les lecteurs d'écran.
- [x] Vérifier le même cas pour celui qui ne tient pas la liste (il peut cocher), et pour « Hors liste ».
- [x] Les idées déjà enregistrées ainsi redeviennent modifiables, sans rien changer en base.
- [x] Trois langues si un texte s'ajoute, tests unitaires et `tests/e2e`.

## Hors périmètre

- Aller chercher le titre de la page derrière le lien.
- Obliger à écrire un texte.

## C'est fini quand

- [x] Une idée qui n'a qu'un lien se modifie et s'efface comme les autres.
- [x] Toucher son lien ouvre toujours le site.
- [x] `/controle` passe.

## Compte rendu

**Fait.**

- **Reproduit d'abord** : `tests/e2e/lists-link-only.spec.ts` échouait (la ligne n'avait aucun texte à toucher), il passe.
- **Une ligne a toujours un texte à toucher** : sans texte, `idea-text` affiche le nom du site (`lutin-jouets.fr`, sans « www. »), dans le style d'un texte d'idée ; le toucher ouvre l'écriture, le champ du texte est vide ; le lien reste dessous et lui seul ouvre le site. Vider aussi le lien efface l'idée, comme avant.
- **Nommer l'idée par son site** : `ideaName` (`app/utils/ideaLink.ts`, fonction pure, testée) dans « Je l'offre : … » et « Je ne l'offre plus : … », « Se joindre … », « Qui l'offre ? », la fenêtre de ce que j'offre et celle du cadeau à plusieurs, la poignée pour déplacer, l'annonce d'un déplacement, l'attente de connexion d'un visiteur (`connexion.vue`).
- **Celui qui ne tient pas la liste** (`VisitorLine`) voit la même ligne, nommée de même ; vérifié par le test, sur la liste ouverte par son lien sans compte.
- **« Hors liste »** : un cadeau hors liste a toujours un texte (la route le refuse vide) : rien à faire.
- Les idées déjà enregistrées ainsi redeviennent modifiables : tout se fait à l'affichage, rien ne change en base. Aucun texte ajouté.

**Décidé seul** : rien.

**Écarts avec les maquettes** : aucun (pas de maquette).

**Questions posées** : aucune.

**Migration** : aucune.

**Contrôle** : `pnpm controle --e2e` passe en entier (984 tests Vitest, 204 tests Playwright).

**Commits** : `docs: ticket 140 started` ; `1b5ec94` fix(lists): an idea with only a link is written and erased like the others ; et celui qui range ce ticket.
