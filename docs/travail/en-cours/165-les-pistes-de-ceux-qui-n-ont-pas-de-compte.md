# 165 — Les pistes de ceux qui n'ont pas de compte ne se perdent pas

- **Dépend de** : 107
- **Avant** : la bascule (ticket 113) : ce ticket change ce que fait la migration
- **Migration** : oui
- **Maquettes** : aucune

## Objectif

Julien, le 24 novembre 2026 : que deviennent, à la bascule, les idées de quelqu'un qui participe à un Secret Santa par son lien personnel, sans compte ? Aujourd'hui rien n'est créé pour lui, et il y a un trou : dès qu'il aura un compte (créé tout seul à sa première chose écrite), `giverHelp` (`server/database/hints.ts`) montre à celui qui l'a tiré sa fiche « Moi » et sa liste, et plus ses anciennes pistes, que rien ne recopie. Elles restent dans la base, plus personne ne les voit. Et entre-temps, lui-même ne retrouve pas ses idées.

En production, le 24 novembre 2026 : deux Secret Santa de huit personnes. Tous ont une adresse, sauf un. Le ticket reste donc petit : une migration, et un garde-fou de quelques lignes.

## À lire d'abord

- `docs/spec/v3/migration.md`, « Les pistes de cadeaux » (les trois derniers points)
- `docs/spec/v3/listes.md`, « Sans compte »
- `server/database/migrations/0038_v3_hints_to_lists.sql`, `server/database/hints.ts` (`giverHelp`), `server/database/v3Compare.ts`

## D'abord, compter

- [x] Sur la copie d'essai (l'export de production est à faire par Julien), compter les participations d'un Secret Santa pas clôturé qui ont des pistes ou un portrait et pas de compte : avec une adresse, sans adresse. Le noter dans le compte rendu.

## À faire

- [x] **Une migration de plus** : pour chaque personne qui a une adresse, pas de compte, et des pistes ou un portrait, créer le compte (l'adresse en minuscules, son prénom, sa langue), puis faire ce que `0038` fait pour les autres : la fiche « Moi » avec son portrait, la liste dans l'événement du tirage avec ses idées, réservée à celui qui l'a tirée, liée à sa participation. Deux personnes de la même adresse : un seul compte.
- [x] Celui qui n'a rien écrit n'a toujours pas de compte.
- [x] **Le garde-fou** : dans `giverHelp`, tant qu'il reste d'anciennes pistes ou un ancien portrait pour la participation, les rendre à celui qui a tiré, que la personne ait un compte ou non (avec un compte : en plus de sa fiche « Moi » et de sa liste). Un test : une personne sans adresse a des pistes, puis un compte ; celui qui l'a tirée les lit toujours.
- [x] **Pas de reprise automatique plus tard** : pour la personne sans adresse, Julien lui ajoute son adresse avant la bascule si elle a écrit quelque chose. Rien à coder.
- [x] `pnpm v3:compare` vérifie en plus : autant d'idées après qu'avant pour ces personnes, aucune piste d'une personne avec adresse laissée derrière.
- [x] Mettre à jour `docs/travail/bascule-v3.md` (la nouvelle migration, le contrôle à la main d'une de ces personnes) et le ticket 113.
- [x] **La migration ne prévient personne** (Q-034 : la bascule se fait sans mot aux utilisateurs) : ni email, ni ligne dans « Quoi de neuf », ni point rouge pour celui qui a tiré. Les listes créées gardent la date des pistes (`hints_updated_at`), pas celle de la migration, pour ne pas se lire comme « de nouvelles idées ». Un test le dit.
- [x] Rien de ce qui touche au tirage n'est exposé : la liste créée est réservée à celui qui a tiré la personne, comme les pistes l'étaient.

## C'est fini quand

- [x] Sur la copie d'essai, une personne sans compte, avec une adresse et deux pistes, a après la migration un compte, sa liste avec ses deux idées, vue seulement par celui qui l'a tirée.
- [x] Une personne sans adresse garde ses pistes, lues par celui qui l'a tirée, même si elle a un compte plus tard.
- [x] `/controle` passe.

## Compte rendu

- **Compté sur la copie d'essai** (la base de forme V2 fabriquée ; l'export de production reste à faire par Julien) : des participations avec des pistes ou un portrait et sans compte, **2 avec une adresse** (Secret Santa en cours), **7 sans adresse** (3 en cours, 4 clôturés). En production, d'après le ticket, une seule personne sans adresse : la requête pour la trouver est dans `bascule-v3.md`.
- **Migration `0047_v3_hints_without_account`** (appliquée en local seulement) : un compte par adresse (en minuscules) qui a écrit des pistes ou un portrait sans en avoir, avec le prénom, la langue et l'icône de sa première personne ; sa fiche « Moi » avec le dernier portrait ; pour un Secret Santa pas clôturé, sa liste dans l'événement du tirage, ses idées, réservée à celui qui l'a tirée (`visibility` `giver`, `giver` vrai), liée à sa participation. Comme `0038`, en suivant le schéma d'aujourd'hui. Qui n'a rien écrit, ou n'a pas d'adresse : rien.
- **Personne n'est prévenu** : la liste, ses gestionnaires et son rattachement gardent la date des pistes (`hints_updated_at`), pas celle de la migration ; aucune nouveauté n'est écrite. Le test le vérifie.
- **Le garde-fou** (`giverHelp`) : les anciennes pistes et l'ancien portrait sont rendus à celui qui a tiré, que la personne ait un compte ou non, **tant que la bascule n'en a pas fait une liste** (`participations.gift_list_id`, que seules les migrations remplissent). **Décidé seul** : sans cette condition, tous ceux que `0038` et `0047` ont repris liraient leurs idées deux fois, dans leur liste et dans leurs anciennes pistes. Avec un compte, le portrait de la fiche « Moi » passe d'abord, l'ancien complète ce qu'elle tait (`portraitWithOld`, pure et testée).
- **`v3:compare`** : `accounts` n'est plus comparé au nombre de lignes ; tous les comptes d'avant sont là, et autant de nouveaux que d'adresses qui ont écrit sans compte ; les pistes de toute personne qui a une adresse ont leur liste, à son compte, avec les mêmes idées.
- **`pnpm v3:essai`** rejoué : les quatorze migrations passent, 12 listes et 12 rattachements après (10 avant ce ticket), aucun écart, aucune clé étrangère cassée. Le quatrième contrôle à la main de `bascule-v3.md` trouve les deux personnes de la copie, chacune avec son compte, sa liste datée de ses pistes, réservée à celui qui l'a tirée.
- **Tests** : `migrations.test.ts` (le compte unique pour deux personnes de la même adresse, la fiche, la liste datée des pistes, rien pour un Secret Santa clôturé ni sans adresse, aucune nouveauté, aucune clé étrangère cassée ; la comparaison avec une telle personne, et quand sa liste manque), `server/database/hints.test.ts` (une personne sans adresse a des pistes, puis un compte : celle qui l'a tirée les lit toujours ; reprises par la bascule, elles ne sont pas lues deux fois), `shared/utils/hints.test.ts`.
- `bascule-v3.md` (quatorze migrations, la requête de ceux qui n'ont pas d'adresse, un quatrième contrôle) et le ticket 113 mis à jour.

