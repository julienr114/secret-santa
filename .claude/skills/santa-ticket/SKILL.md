---
name: santa-ticket
description: Prendre un ticket de docs/travail/a-faire et le mener au bout (lire, coder, tester, ranger, résumer). À utiliser quand on demande d'avancer, de coder la suite, de prendre un ticket ou un numéro de ticket.
---

# Mener un ticket au bout

Le mode d'emploi complet est dans `docs/travail/README.md`. Un seul ticket à la fois.

## 1. Choisir

- Si un numéro est donné (`/santa-ticket 103`), prendre ce ticket dans `docs/travail/a-faire/`.
- Sinon, prendre dans `docs/travail/a-faire/` le plus petit numéro dont tous les tickets de la ligne « Dépend de » sont dans `docs/travail/fait/`.
- Si `docs/travail/en-cours/` contient déjà un ticket, le reprendre d'abord.
- Si le ticket demandé est dans `a-concevoir/`, ne pas le coder : dire ce qui lui manque (c'est écrit dedans) et s'arrêter.
- Si rien n'est prêt, le dire et s'arrêter.

Déplacer le ticket dans `docs/travail/en-cours/` avec `git mv`.

## 2. Lire avant d'écrire

Dans cet ordre :

1. Le ticket en entier.
2. Chaque fichier de sa partie « À lire d'abord » (`docs/spec/`, `docs/decisions/`).
3. Chaque maquette citée, dans `docs/refonte/maquettes-sorbet/`, **et** l'écran actuel qu'elle remplace.
4. `docs/travail/questions.md` : une réponse déjà donnée peut concerner ce ticket.

Si la spec et le ticket se contredisent, si une maquette montre une donnée que rien ne fournit, ou si une règle manque : ne rien inventer. Poser la question avec `/question`, laisser ce point de côté et avancer sur le reste.

## 3. Coder

- Suivre `CLAUDE.md` (les règles qui ne se discutent pas) et `README.md` section 7.1.
- Cocher chaque ligne de « À faire » dans le ticket au fur et à mesure.
- Petits commits, Conventional Commits en anglais. Le ticket, `docs/ARBORESCENCE.md` et `docs/refonte/ECARTS-MAQUETTES.md` se mettent à jour dans le commit du code qu'ils décrivent.
- Ne modifier ni `docs/spec/`, ni `docs/decisions/`, ni les maquettes.
- Ne pas pousser, ne pas déployer, ne pas appliquer de migration à distance.

## 4. Contrôler

Lancer `/controle`. Tant qu'il ne passe pas, le ticket n'est pas fini.

## 5. Ranger et résumer

1. Cocher « C'est fini quand » dans le ticket. Une case qui ne peut pas être cochée reste ouverte, avec la raison à côté.
2. Remplir « Compte rendu » : ce qui est fait, ce qui a été décidé seul et pourquoi, les écarts avec les maquettes, les questions posées, les commits.
3. Déplacer le ticket dans `docs/travail/fait/` avec `git mv`. S'il reste une case ouverte qui attend une réponse, le laisser dans `en-cours/` et le dire.
4. S'arrêter et résumer à Julien en quelques lignes : ce qui marche, ce qui attend une réponse, ce qu'il doit faire lui-même (publier, appliquer une migration).
