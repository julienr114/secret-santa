# 106 — V3 : les listes dans les fêtes

- **Dépend de** : 101, 104
- **Migration** : non (le rattachement des listes aux fêtes vient du ticket 101)
- **Maquettes** : `V3ListeQui`, `V3Liste`, `V3ListeNouvelle`, `V3ListePublique`, `V3ListeMembre`, `V3OffreAilleurs`, `ListeGroupeFil`

## Objectif

Une liste vit dans une ou plusieurs fêtes : leurs membres la voient sans lien. Elle peut en plus être publique. On retrouve ce qu'on offre sur les listes publiques des autres.

## À lire d'abord

- `docs/spec/v3/listes.md`
- `docs/spec/v3/modele.md` (« Qui voit une liste »)
- `docs/spec/v3/accueil-et-creation.md`
- `docs/decisions/2026-11-20-on-cree-un-secret-santa-ou-une-liste.md`
- `docs/travail/questions.md`, Q-002 et Q-003

## À faire

- [ ] « Qui verra ta liste ? » : mes fêtes à cocher, « Une autre occasion », « Tout le monde, avec un lien ».
- [ ] La barre du haut d'une liste, dans ses trois états, avec « Modifier ».
- [ ] Une nouvelle liste prend le nom, la date et l'icône de sa fête.
- [ ] La liste d'un autre membre, ouverte depuis la fête, avec la pastille qui y ramène.
- [ ] Les mêmes coches dans toutes les fêtes où est la liste.
- [ ] « Ce que j'offre ailleurs » : sa page, et la règle (seulement les listes publiques où j'ai coché).
- [ ] Les droits côté serveur : un membre d'une fête voit ses listes, personne d'autre, sauf lien public.
- [ ] Les anciennes adresses des listes partagées redirigent.

## Hors périmètre

- Le dessin d'une liste : inchangé.
- « Celui qui m'a tiré » dans « Qui verra ta liste ? », et tout ce qui touche aux pistes (ticket 107).
- Les points Q-002 et Q-003 tant qu'ils ne sont pas tranchés.

## C'est fini quand

- [ ] Une liste mise dans deux fêtes montre les mêmes coches aux deux.
- [ ] Un compte hors de la fête ne peut pas lire la liste (un test d'isolation le vérifie).
- [ ] Les six maquettes sont reproduites.
- [ ] `/controle` passe.

## Compte rendu

À remplir par Claude Code à la fin : ce qui a été fait, ce qui a été décidé seul (et pourquoi), les écarts avec les maquettes, les questions posées, les commits.
