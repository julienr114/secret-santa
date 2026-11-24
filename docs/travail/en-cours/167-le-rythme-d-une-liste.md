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

- [ ] **Une idée** : 10 px au-dessus et au-dessous (20 px entre deux idées), au lieu de 13.
- [ ] **Un titre** : 26 px au-dessus, 0 au-dessous (36 px après ce qui précède, 10 px avant sa première idée). S'il est la première ligne d'une personne : 10 px au-dessus, comme une idée.
- [ ] **Entre deux personnes** : 48 px.
- [ ] Ces valeurs en un seul endroit (des variables ou des utilitaires dans `main.css`), pas recopiées dans chaque composant.
- [ ] Le même rythme dans les quatre vues : la liste qu'on tient (lecture et écriture), la liste par son lien, la liste filtrée de celui qui a tiré. Les lignes « hors liste » et « J'offre autre chose à… » suivent celui des idées.
- [ ] La ligne qu'on écrit (sa carte blanche) et la ligne qu'on déplace ne décalent pas leurs voisines : vérifier en passant d'une ligne à l'autre.
- [ ] Le trait qui descend de la personne, le point d'un titre et les cases restent alignés ; la cible d'une case (42 px) ne chevauche pas celle de la ligne voisine.
- [ ] Tests visuels ou e2e qui mesuraient des positions : les mettre à jour.

## C'est fini quand

- [ ] Dans une liste avec des titres, chaque titre se lit avec ses idées, et se détache de ce qui précède.
- [ ] `/controle` passe.
