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

- [ ] Sur l'export de production (ou sa copie d'essai), compter les participations d'un Secret Santa pas clôturé qui ont des pistes ou un portrait et pas de compte : avec une adresse, sans adresse. Le noter dans le compte rendu.

## À faire

- [ ] **Une migration de plus** : pour chaque personne qui a une adresse, pas de compte, et des pistes ou un portrait, créer le compte (l'adresse en minuscules, son prénom, sa langue), puis faire ce que `0038` fait pour les autres : la fiche « Moi » avec son portrait, la liste dans l'événement du tirage avec ses idées, réservée à celui qui l'a tirée, liée à sa participation. Deux personnes de la même adresse : un seul compte.
- [ ] Celui qui n'a rien écrit n'a toujours pas de compte.
- [ ] **Le garde-fou** : dans `giverHelp`, tant qu'il reste d'anciennes pistes ou un ancien portrait pour la participation, les rendre à celui qui a tiré, que la personne ait un compte ou non (avec un compte : en plus de sa fiche « Moi » et de sa liste). Un test : une personne sans adresse a des pistes, puis un compte ; celui qui l'a tirée les lit toujours.
- [ ] **Pas de reprise automatique plus tard** : pour la personne sans adresse, Julien lui ajoute son adresse avant la bascule si elle a écrit quelque chose. Rien à coder.
- [ ] `pnpm v3:compare` vérifie en plus : autant d'idées après qu'avant pour ces personnes, aucune piste d'une personne avec adresse laissée derrière.
- [ ] Mettre à jour `docs/travail/bascule-v3.md` (la nouvelle migration, le contrôle à la main d'une de ces personnes) et le ticket 113.
- [ ] **La migration ne prévient personne** (Q-034 : la bascule se fait sans mot aux utilisateurs) : ni email, ni ligne dans « Quoi de neuf », ni point rouge pour celui qui a tiré. Les listes créées gardent la date des pistes (`hints_updated_at`), pas celle de la migration, pour ne pas se lire comme « de nouvelles idées ». Un test le dit.
- [ ] Rien de ce qui touche au tirage n'est exposé : la liste créée est réservée à celui qui a tiré la personne, comme les pistes l'étaient.

## C'est fini quand

- [ ] Sur la copie d'essai, une personne sans compte, avec une adresse et deux pistes, a après la migration un compte, sa liste avec ses deux idées, vue seulement par celui qui l'a tirée.
- [ ] Une personne sans adresse garde ses pistes, lues par celui qui l'a tirée, même si elle a un compte plus tard.
- [ ] `/controle` passe.
