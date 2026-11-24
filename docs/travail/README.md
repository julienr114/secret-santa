# Le travail : mode d'emploi

Depuis le 20 novembre 2026, ce dossier remplace `docs/refonte/PLAN.md` (gelé, gardé comme archive). Pourquoi : `docs/decisions/2026-11-20-organisation-du-travail.md`.

## Un ticket = un fichier, son dossier = son état

| Dossier | Ce que ça veut dire | Qui y écrit |
|---|---|---|
| `a-concevoir/` | Une idée ou un chantier pas encore prêt : il manque une décision, une maquette ou une règle. Le ticket dit ce qui manque. | La conception |
| `a-faire/` | Prêt à coder : l'objectif, les règles, les maquettes et ce qui prouve que c'est fini sont là. | La conception |
| `en-cours/` | Claude Code y travaille. Un seul ticket à la fois. | Claude Code |
| `fait/` | Codé, contrôlé, avec son compte rendu en bas du fichier. | Claude Code |

Changer d'état, c'est déplacer le fichier (`git mv`). L'historique se lit dans `fait/` (quoi), dans `docs/decisions/` (pourquoi) et dans Git (quand).

## La conception a ses tickets aussi

`conception/` contient ce qui reste à dessiner (`a-dessiner/`) et ce qui l'a été (`dessine/`), avec ce qui a été décidé seul et ce qui a été contrôlé. C'est à la conception : Claude Code n'a rien à y lire pour coder. Mode d'emploi : `conception/README.md`.

## L'ordre

Les tickets portent un numéro. Dans `a-faire/`, on prend **le plus petit numéro dont les dépendances sont dans `fait/`**. La ligne « Dépend de » du ticket fait foi.

## Ce que contient un ticket

Le modèle est dans `MODELE-TICKET.md`. En bref :

- **Objectif** : ce qui change pour la personne qui utilise l'application, en deux ou trois phrases.
- **À lire d'abord** : les fichiers de `docs/spec/` et de `docs/decisions/` qui font foi, et les maquettes.
- **À faire** : la liste de ce qu'il faut coder.
- **Hors périmètre** : ce qu'on ne touche pas, même si une maquette le montre.
- **C'est fini quand** : ce qu'on peut vérifier.
- **Compte rendu** : rempli par Claude Code à la fin.

Un ticket ne recopie pas la spec : il y renvoie. Si le ticket et la spec se contredisent, la spec a raison et c'est une question.

## Qui écrit quoi

| | La conception (application Claude) | Claude Code |
|---|---|---|
| `docs/spec/`, `docs/decisions/` | écrit | lit |
| Maquettes (`docs/refonte/maquettes/`) | écrit | lit (`maquettes-sorbet/`) |
| Tickets dans `a-concevoir/` et `a-faire/` | écrit | lit |
| Tickets dans `en-cours/` et `fait/` | lit | déplace, coche, écrit le compte rendu |
| `questions.md` | répond | pose |
| Le code, les tests, `shared/i18n` | ne touche pas | écrit |
| `docs/ARBORESCENCE.md`, `docs/refonte/ECARTS-MAQUETTES.md` | lit | tient à jour |

Personne n'écrit dans le fichier de l'autre : plus de conflit sur un plan commun.

## Les questions

`questions.md` a deux parties : les questions ouvertes, les réponses données. Une question dit le ticket, ce qui bloque, les choix possibles et celui que l'on ferait. Une question ouverte ne bloque que ce qu'elle touche : le reste du ticket avance.

Quand Julien a répondu, la conception reporte la réponse dans la spec (et dans une décision si elle change une règle), puis déplace la question dans « Réponses ».

## Créer un ticket

1. La décision est écrite dans `docs/decisions/` si elle est nouvelle.
2. La spec est à jour.
3. Les maquettes sont dans `docs/refonte/maquettes/` et habillées.
4. Le ticket est écrit depuis `MODELE-TICKET.md`, numéroté à la suite, posé dans `a-faire/` s'il ne manque rien, sinon dans `a-concevoir/` avec ce qui manque.
