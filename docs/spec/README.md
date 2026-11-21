# La spec

Ce que l'application doit être. Un fichier par domaine, pas d'historique ici : le pourquoi est dans `docs/decisions/`, le travail dans `docs/travail/`.

## Deux étages, le temps de la V3

- **`README.md`, à la racine**, décrit l'application d'aujourd'hui (la V2) : le tirage, la sécurité, le modèle de données, les écrans, le design system (section 23). Il reste la référence pour tout ce que la V3 ne change pas.
- **`docs/spec/v3/`** décrit la V3 : le groupe devient l'événement, tout est dans un événement. **Là où un fichier de `v3/` parle, il a raison contre le README.**

À chaque ticket de la V3 terminé, la partie du README qu'il remplace est retirée ou renvoyée ici. Quand la V3 est finie, le README ne garde que la présentation du projet et l'installation, et `v3/` perd son nom de version.

## Les fichiers

| Fichier | Ce qu'il dit |
|---|---|
| `v3/README.md` | L'idée en dix lignes, et l'index |
| `v3/modele.md` | L'événement, l'année, le Secret Santa, les listes, les membres, qui voit quoi, les limites |
| `v3/categories.md` | Les six catégories et ce que chacune remplit |
| `v3/vocabulaire.md` | Les mots qu'on écrit, ceux qu'on n'écrit plus |
| `v3/accueil-et-creation.md` | L'accueil, la barre du bas, « Créer », « Pour quelle occasion ? », le jeu sur l'accueil, les événements passés |
| `v3/lignes.md` | Le titre et le texte de chaque ligne de l'accueil et d'un événement, le point rouge, le nom d'un événement dans une phrase |
| `v3/fete.md` | La page d'un événement, ses membres (30 au plus), ses réglages, inviter, rejoindre, quitter, une année passée |
| `v3/secret-santa.md` | Créer un Secret Santa, ses réglages, la limite, le résultat |
| `v3/listes.md` | Les listes dans les événements, qui les voit, la fin des « pistes de cadeaux » |
| `v3/regles-d-ecran.md` | Les règles communes à tous les écrans (dates, lignes, phrases) |
| `v3/administration.md` | L'administration sans les demandes, les limites, « Suspendre les nouveaux Secret Santa » |
| `v3/migration.md` | Ce que deviennent les données d'aujourd'hui |
| `v3/maquettes.md` | L'index des maquettes de la V3, et celles qui sont périmées |

## Écrire dans la spec

- Au présent, sans date ni « désormais » : la spec dit ce qui est vrai, pas ce qui a changé.
- Une règle à un seul endroit ; ailleurs, un renvoi.
- Une règle qui vient d'un choix de Julien renvoie à sa décision (`docs/decisions/...`).
- Ce qui n'est pas tranché ne va pas dans la spec : c'est une question dans `docs/travail/questions.md`.
