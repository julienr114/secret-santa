# 113 — V3 : la bascule (publier la V3)

- **Dépend de** : 102, 106, 107, 108, 110, 111, 112, 114, 115, 116, 117, 120
- **Migration** : oui, c'est elle qu'on publie
- **Maquettes** : aucune (c'est une marche à suivre)

## Objectif

La V3 remplace l'application en ligne, d'un coup, pendant que des gens s'en servent pour Noël 2026. Personne ne perd rien, ceux qui sont au milieu d'un Secret Santa retrouvent tout à sa place, et on sait revenir en arrière.

## À lire d'abord

- `docs/decisions/2026-11-21-la-v3-se-publie-des-qu-elle-est-prete.md`
- `docs/spec/v3/migration.md`
- Le compte rendu du ticket 101 (`pnpm v3:essai`, `pnpm v3:compare`)

## À faire

Avant :

- [ ] Vérifier que tous les tickets dont celui-ci dépend sont dans `fait/`. Pas de publication à moitié.
- [ ] Rejouer la migration sur une copie de la base du jour (`pnpm v3:essai`), et comparer (`pnpm v3:compare`) : autant d'événements que de groupes, chaque Secret Santa en cours avec ses participants et ses enveloppes, chaque liste avec ses idées et ses coches.
- [ ] Sur cette copie, contrôler à la main trois comptes : quelqu'un qui a tiré et pas encore ouvert son enveloppe ; quelqu'un qui avait écrit des pistes (elles sont devenues sa liste, vue seulement par celui qui l'a tiré) ; quelqu'un dont la liste était partagée par lien (elle est publique, son lien marche encore, sans compte).
- [ ] Écrire le pas-à-pas du retour en arrière, et l'essayer une fois sur la copie : restaurer la sauvegarde, remettre la version d'avant.
- [ ] Préparer le mot aux utilisateurs, dans les trois langues (plus bas).

Le jour même, par Julien (Claude Code ne publie pas et ne déploie pas) :

- [ ] Choisir une heure creuse, en dehors de l'heure des tâches planifiées (`server/plugins/reminders.ts`) : aucun email automatique ne doit partir pendant la bascule. L'interrupteur « Suspendre les emails » n'arrive qu'au ticket 129 ; le pas-à-pas dit comment on s'en passe.
- [ ] Sauvegarder la base de production.
- [ ] Publier : la migration, puis le code.
- [ ] Refaire les trois contrôles sur la production.

Après :

- [ ] Le mot s'affiche en tête de « Quoi de neuf » (ticket 120, fait avant la bascule) et part par un email simple, le lendemain matin, une seule fois, à ceux qui ont un Secret Santa ou une liste en cours. (Le résumé du matin n'existe pas encore : ticket 121.)
- [ ] Surveiller une journée le tableau de bord (erreurs du serveur, emails rejetés).

## Le mot aux utilisateurs

« Under the Tree a changé. Tes groupes s'appellent maintenant des événements, et on y trouve au même endroit le Secret Santa et les listes de cadeaux. Tes pistes de cadeaux sont devenues ta liste : seul celui qui t'a tiré la voit, comme avant. Rien n'est perdu, et ton tirage n'a pas bougé. »

Une phrase de plus pour ceux qui tenaient une liste partagée par lien : « Ta liste est toujours ouverte à ceux qui ont son lien. »

## Hors périmètre

- Tout ce qui vient après la V3 (tickets 121 et suivants).
- Annoncer la V3 à d'autres que ceux qui s'en servent déjà.

## C'est fini quand

- [ ] `/controle` passe sur la version publiée.
- [ ] La comparaison sur la copie du jour ne montre aucun écart.
- [ ] Le retour en arrière a été essayé une fois, et son pas-à-pas est dans le dépôt.
- [ ] Les trois contrôles passent sur la production.
- [ ] Le mot est parti, une fois.

## Compte rendu

À remplir par Claude Code à la fin : ce qui a été fait, ce qui a été décidé seul (et pourquoi), les écarts avec les maquettes, les questions posées, les commits.
