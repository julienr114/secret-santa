# 101 — V3 : le nouveau modèle, sans changer un seul écran

- **Dépend de** : aucun
- **Migration** : oui
- **Maquettes** : aucune

## Objectif

Faire tourner l'application d'aujourd'hui, à l'identique pour ses utilisateurs, sur le modèle de la V3 : des fêtes, leurs années, leurs Secret Santa, des listes rattachées à des fêtes. C'est le socle de tous les tickets suivants. **Sur une branche ; rien ne se publie avant que Julien le décide, et pas pendant la saison de Noël 2026.**

## À lire d'abord

- `docs/spec/v3/modele.md`
- `docs/spec/v3/categories.md`
- `docs/spec/v3/migration.md`
- `docs/decisions/2026-11-20-le-groupe-devient-la-fete.md`
- `docs/decisions/2026-11-20-on-cree-un-secret-santa-ou-une-liste.md`
- `README.md`, section 10 (le modèle d'aujourd'hui) et `server/database/schema.ts`

## À faire

- [ ] Proposer le schéma avant de l'écrire : les tables, ce qui est renommé, ce qui est nouveau (la catégorie, la date habituelle, la récurrence, l'année d'une fête, plusieurs Secret Santa par année, le rattachement d'une liste à une ou plusieurs fêtes avec sa visibilité par fête : toute la fête, ou celui qui m'a tiré). L'écrire dans le compte rendu de ce ticket et s'arrêter pour que Julien le lise.
- [ ] Les migrations Drizzle, dans l'ordre, appliquées en local.
- [ ] La reprise des données : chaque groupe devient une fête de catégorie Noël qui revient chaque année ; chaque édition, l'année et son Secret Santa ; chaque liste reliée à un tirage va dans sa fête ; chaque autre liste reçoit sa propre fête (`migration.md`).
- [ ] Les réglages qui ne concernent que le tirage descendent du groupe sur chaque Secret Santa.
- [ ] Le code serveur et les requêtes suivent le nouveau modèle ; les écrans, les adresses et les textes ne changent pas.
- [ ] Un essai de la migration sur une copie de la base de production, décrit pas à pas dans le compte rendu (c'est Julien qui fournit la copie).
- [ ] Les tests existants passent sans changer ce qu'ils vérifient.

## Hors périmètre

- Tout changement visible : écrans, textes, adresses, emails.
- La fusion des pistes et des listes (ticket 107).
- La fin des demandes de groupe (ticket 105).
- Pousser, déployer, appliquer une migration à distance.

## C'est fini quand

- [ ] Le schéma proposé a été lu par Julien.
- [ ] La base locale migrée contient les mêmes groupes, tirages et listes qu'avant, sous leur nouvelle forme ; un script ou un test le compare.
- [ ] `pnpm test:e2e` passe sans retouche des parcours.
- [ ] `/controle` passe.

## Compte rendu

À remplir par Claude Code à la fin : ce qui a été fait, ce qui a été décidé seul (et pourquoi), les écarts avec les maquettes, les questions posées, les commits.
