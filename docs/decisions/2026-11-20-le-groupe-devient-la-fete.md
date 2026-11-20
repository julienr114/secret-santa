# Le groupe devient la fête, et tout est dans une fête

20 novembre 2026 · décidé par Julien, en séance de conception.

## Contexte

L'application avait deux mondes séparés : les groupes et leurs tirages d'un côté, les listes de cadeaux de l'autre, avec deux onglets. Une liste se partageait par un lien, sans rapport avec le groupe où l'on fait son Secret Santa. En cherchant un nouvel accueil, l'idée d'un « événement » qui relie les deux est venue ; puis qu'il n'y avait pas besoin d'un objet de plus : c'est le groupe qui doit changer.

## Décision

- Le groupe devient la fête : **une fête = une occasion** et ses membres. Pas de niveau « famille » au-dessus.
- Une fête a un nom libre, une catégorie, une date habituelle, « revient chaque année », des membres, des organisateurs.
- Entre la fête et ce qu'elle contient, **l'année** (« Noël 2026 »), avec sa vraie date.
- Dans une année : des Secret Santa (plusieurs possibles) et des listes, au même niveau.
- Une liste peut être dans plusieurs fêtes, avec les mêmes coches partout.
- Les membres d'une fête et « Mes proches » restent deux notions : pas de fusion des tables.
- « Tout le monde, avec un lien » rend une liste publique. Pas de lien d'invité sur la fête.
- La surprise, c'est le mode anonyme et rien d'autre (« confiance en l'intelligence de Tonton »).
- Quitter une fête : mes listes en sortent, mes coches restent.
- « Reprendre les membres d'une autre fête » à la création.
- Les anniversaires sont proposés tout seuls ; l'accueil fait office de calendrier.

## Écarté

- Une fête sans personnes, partagée par un lien.
- Une rubrique « Reçues par un lien » sur l'accueil.
- Un écran « Après la fête » ; un calendrier de la famille à part.
- Afficher « Anonyme » d'office sur les idées de la liste qu'on tient soi-même.
- Un lien souligné « Les fêtes passées » : c'est une ligne.

## Où ça s'applique

`docs/spec/v3/modele.md`, `fete.md`, `accueil-et-creation.md`, `migration.md`.
