# 167 — Le rythme d'une liste : un titre va avec ses idées

- **Dépend de** : 152
- **Migration** : non
- **Maquettes** : `V3ListeTitres`

## Objectif

Julien, le 24 novembre 2026, en remplissant une vraie liste : les espaces ne sont pas harmonieux. Toutes les lignes ont la même marge (`py-[13px]`, les titres comme les idées), donc un titre flotte à égale distance de ce qui précède et de ce qui suit. Ce qui est sous un titre doit aller avec lui, et un nouveau titre doit se détacher de ce qui précède, comme le nom d'une personne.

## À lire d'abord

- `docs/spec/v3/listes.md`, « Le rythme d'une liste » : le tableau des quatre espaces
- `app/components/lists/VisitorLine.vue`, `IdeaLine.vue`, `OffListLine.vue`, `PersonSection.vue`, `main.css` (`person-lines`), `pages/listes/[id]/index.vue` et `pages/l/[token]/index.vue` (l'écart entre deux personnes, `gap-16` aujourd'hui)

## À faire

- [x] **Une idée** : 10 px au-dessus et au-dessous (20 px entre deux idées), au lieu de 13.
- [x] **Un titre** : 26 px au-dessus, 0 au-dessous (36 px après ce qui précède, 10 px avant sa première idée). S'il est la première ligne d'une personne : 10 px au-dessus, comme une idée.
- [x] **Entre deux personnes** : 48 px.
- [x] Ces valeurs en un seul endroit (des variables ou des utilitaires dans `main.css`), pas recopiées dans chaque composant.
- [x] Le même rythme dans les quatre vues : la liste qu'on tient (lecture et écriture), la liste par son lien, la liste filtrée de celui qui a tiré. Les lignes « hors liste » et « J'offre autre chose à… » suivent celui des idées.
- [x] La ligne qu'on écrit (sa carte blanche) et la ligne qu'on déplace ne décalent pas leurs voisines : vérifier en passant d'une ligne à l'autre.
- [x] Le trait qui descend de la personne, le point d'un titre et les cases restent alignés ; la cible d'une case (42 px) ne chevauche pas celle de la ligne voisine.
- [x] Tests visuels ou e2e qui mesuraient des positions : les mettre à jour.

## C'est fini quand

- [x] Dans une liste avec des titres, chaque titre se lit avec ses idées, et se détache de ce qui précède.
- [x] `/controle` passe.

## Compte rendu

- **Les valeurs en un seul endroit** (`main.css`) : `--rhythm-line` (10 px), `--rhythm-title` (26 px), `--rhythm-people` (48 px), et quatre utilitaires : `list-line` (les marges d'une ligne), `list-title` (26 px de plus au-dessus, rien dessous ; en première ligne d'une personne, 10 px comme une idée), `list-writing` (la carte blanche de la ligne qu'on écrit déborde de 4 px de chaque côté sans décaler ses voisines), `list-people` / `list-person` (48 px entre deux personnes, dans leur colonne, ou dans celle de l'écran qui garde déjà 24 px).
- **Les quatre vues** : la liste qu'on tient, en lecture et en écriture (`IdeaLine`, les « Hors liste » de `PersonSection`), la liste par son lien et celle, filtrée, de celui qui a tiré (`VisitorLine`, les « Hors liste » de la page du lien), et « J'offre autre chose à… » (`OffListLine`, au repos et pendant qu'on l'écrit). Plus aucun `py-[13px]` ni `gap-16` dans ces vues.
- **Mesuré dans le navigateur**, sur une liste avec deux titres : 10 px entre un titre et sa première idée, 20 px entre deux idées, 36 px avant un titre ; un titre en première ligne vient sous le nom comme une idée.
- **La ligne qu'on écrit** ne décale plus ses voisines : avant, sa carte prenait 13 px au-dessus mais 10 au-dessous ; maintenant les deux suivent la ligne au repos. Celle qu'on écrit sur « J'offre autre chose à… » aussi (8 px avant, au lieu de 13).
- **Les cases** : une idée fait 42 px de haut (10 + 22 + 10), la cible de sa case ne déborde pas sur la voisine. Le trait, le point d'un titre et les cases restent dans leur colonne.
- Aucun test ne mesurait ces positions : rien à mettre à jour. `pnpm controle --vite` avec les 98 parcours des listes, puis la suite entière.

- **La suite entière** : un premier passage a eu 2 échecs dans la troisième partie, que je n'ai pas pu lire (le script ne gardait pas la sortie des parties) ; les quatre passages suivants sont passés en entier, les 223 parcours chaque fois (229 à 234 s). Pour qu'un échec vu une fois se relise, `scripts/e2e.ts` garde maintenant la sortie de chaque partie (`test-results/e2e-<port>.log`).
