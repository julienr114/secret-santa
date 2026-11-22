# 119 — V3 : le bandeau d'une liste d'une année passée, et « Repartir d'une liste »

- **Dépend de** : 108
- **Migration** : non
- **Maquettes** : `V3ListeAnneePassee`, `ListeNouvelleReprendre`

## Objectif

Le lien d'une liste de l'an dernier marche toujours. Celui qui l'ouvre doit voir tout de suite que c'est celle de l'an dernier, et trouver celle de cette année.

## À lire d'abord

- `docs/decisions/2026-11-22-une-liste-d-une-annee-passee-reste-ouverte.md`
- `docs/spec/v3/listes.md` (« Une liste d'une année passée », « La liste reprise de l'an dernier », « Repartir d'une liste »)
- `docs/travail/questions.md` (Q-020 et Q-021, dans « Réponses »)

## À faire

- [x] **Savoir qu'une liste est d'une année passée**, en fonction pure testée : son événement a quitté l'accueil pour l'année de sa date. La même règle que celle du ticket 108, pas une seconde.
- [x] **Le bandeau**, en haut de la liste, pour tout le monde (celui qui la tient, un membre, celui qui arrive par le lien) : « Liste de Noël 2025 » · « Une année passée ».
- [x] **Le bouton vers cette année** (« Noël 2026 ») quand une liste a été reprise de celle-ci et que j'ai le droit de l'ouvrir. Sinon, pas de bouton.
- [x] La liste reste modifiable : rien d'autre ne change.
- [x] **« Repartir d'une liste »** (`ListeNouvelleReprendre`), en fonction pure testée : seulement les listes que je tiens et qui ressemblent à la nouvelle (le même événement une autre année, puis la même catégorie, puis une personne en commun), trois au plus, jamais une liste sans rien de commun ; pas de section s'il n'y en a aucune. Sous chaque nom, les prénoms à la place de « 4 personnes ».
- [x] Trois langues, `tests/e2e`.

## Hors périmètre

- Figer une liste passée.
- Une année en base pour une liste (Q-020 : la date suffit).

## C'est fini quand

- [x] Le lien d'une liste de Noël 2025, ouvert en 2026, montre le bandeau et le bouton vers la liste de 2026 si j'y ai droit.
- [x] Une liste de cette année ne montre pas de bandeau.
- [x] Une liste neuve pour Noël, où figure Camille, ne propose pas de repartir de « Les 7 ans de Léo ».
- [x] Les deux maquettes sont reproduites.
- [x] `/controle` passe.

## Compte rendu

**Fait.**

- **Une liste d'une année passée** (`listIsPast`, `shared/utils/years.ts`, testé) : la règle du ticket 108, `yearIsOver` appliqué à l'année de sa date (Q-020), sur l'événement dont elle est l'occasion (`gift_lists.party_id`).
- **Le bandeau** (`ListsPastBand`, `pastBand` testé, `pastBandOf` dans `server/http/lists.ts`) : « Liste de Noël 2025 » · « Une année passée », dans le document de celui qui la tient et par son lien, pour tout le monde. Le bouton « Noël 2026 » mène à la liste de cette année reprise de celle-ci : son document si je la tiens, son lien si elle est publique ou partagée dans un événement dont je suis membre ; sinon, pas de bouton. Rien d'autre ne change : la liste s'écrit et se coche comme avant.
- **« Repartir d'une liste »** (`resumeChoices`, `shared/utils/resumeChoices.ts`, testé) : le même événement une autre année, puis un événement de la même catégorie (pour un anniversaire, le même proche), puis une personne en commun ; la plus récente d'abord, trois au plus, jamais une liste sans rien de commun. Sous chaque nom, les prénoms, « moi » en dernier (`peopleNames`, `shared/utils/lines.ts`, dont `forWhom` dérive désormais) : « Léo, Zoé et moi · 6 idées pas encore offertes ». La clé `lists.resume.people` est supprimée.
- Trois langues ; `tests/e2e/past-list.spec.ts` (le bandeau par le lien et dans le document, le bouton seulement une fois la liste de cette année partagée, pas de bandeau sur celle-ci, Noël ne propose pas « Les 7 ans de Léo »).

**Décidé seul, et pourquoi.**

- `gift_lists.carried_from` n'est plus effacé au premier partage (seules les marques des idées le sont) : sans lui, rien ne dit, une fois la liste de cette année partagée, qu'elle a été reprise de l'ancienne, et le bouton ne serait jamais montré qu'à celui qui la tient. La phrase « Reprise de … » ne se lit plus que tant que la liste est un brouillon. Pas de migration (Q-033).
- Deux événements « Autre » ne se ressemblent pas, ni deux anniversaires dont on ne sait pas pour qui ils sont faits.
- Le titre du bandeau suit la catégorie (« Liste d'anniversaire 2025 »), pour éviter « Liste de Anniversaire ».
- Celui qui a tiré l'auteur d'une liste réservée à lui n'a pas de bouton : son droit passe par le lien signé de sa page.
- Deux e2e existants adaptés, leurs listes n'ayant rien de commun : `lists-resume` (l'ancienne liste est un Noël, la nouvelle aussi, « Léo et Zoé » à la place de « 2 personnes »), `lists-single` (la liste neuve est un mariage).

**Écarts avec les maquettes** : section « Une liste d'une année passée, et « Repartir d'une liste » (ticket 119) » de `docs/refonte/ECARTS-MAQUETTES.md` (le bandeau dans le document de celui qui tient la liste, le titre par catégorie, où mène le bouton, le fond `warning-tint`, « Sans personne » et « Moi »).

**Questions posées** : Q-032 (le critère « une personne en commun » ne joue jamais, le bloc n'étant que dans une liste vide), Q-033 (la liste reprise garde d'où elle vient après son premier partage).

**Migrations** : aucune.

**Contrôle** : `pnpm controle --e2e` passe : langues, mots, textes en dur, lint, types, 957 tests Vitest, 193 tests Playwright (dont `security.spec.ts` « a participant learns their own result only », passé du premier coup).

**Commits** : `061dc66` docs: ticket 119 started ; `6b0132a` docs: two questions of ticket 119 ; `3b47532` feat(lists): a list of a past year says so, and only lists alike are offered to start from ; et celui qui range ce ticket.
