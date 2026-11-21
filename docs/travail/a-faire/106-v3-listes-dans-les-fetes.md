# 106 — V3 : les listes dans les fêtes

- **Dépend de** : 101, 104
- **Migration** : non (le rattachement des listes aux fêtes vient du ticket 101)
- **Maquettes** : `V3ListeQui`, `V3Liste`, `V3ListeNouvelle`, `V3ListePublique`, `V3ListeMembre`, `V3OffreAilleurs`, `V3ListeQuiLien`, `V3ListeLienChanger`, `ListeAidePartage`, `ListeGroupeFil`, `V3ListeQuiModifier`, `V3ListeQuiRetirer`, `ListeTeneurs`

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
- [ ] La barre du haut d'une liste, dans ses trois états, avec « Modifier » ; sans « Modifier » pour celui qui aide à la tenir (`ListeAidePartage`).
- [ ] Le lien d'une liste publique, derrière « Modifier » : « Copier », « Le message qui accompagne le lien », « Changer de lien » et sa confirmation (`docs/spec/v3/listes.md`, « Le lien d'une liste publique »).
- [ ] Plus de brouillon ni de « partage arrêté » : les écrans et les états correspondants disparaissent (sous réserve de Q-006).
- [ ] Une nouvelle liste prend le nom, la date et l'icône de sa fête.
- [ ] La liste d'un autre membre, ouverte depuis la fête, avec la pastille qui y ramène.
- [ ] Les mêmes coches dans toutes les fêtes où est la liste.
- [ ] « Ce que j'offre ailleurs » : sa page, et la règle (seulement les listes publiques où j'ai coché).
- [ ] Les droits côté serveur : un membre d'une fête voit ses listes, personne d'autre, sauf lien public.
- [ ] Les anciennes adresses des listes partagées redirigent.
- [ ] « Modifier » sur une liste dans plusieurs fêtes : les mêmes cases, « Enregistrer » ; retirer la liste d'une fête, avec sa confirmation (`docs/spec/v3/listes.md`, « Rouvert par « Modifier » » ; choix A de Q-002).
- [ ] Celui qui « aide à écrire » n'a pas « Modifier » ; celui qui « gère la liste » l'a.

## Hors périmètre

- Le dessin d'une liste : inchangé.
- « Celui qui m'a tiré » dans « Qui verra ta liste ? », et tout ce qui touche aux pistes (ticket 107).
- Les points Q-002 et Q-003 tant qu'ils ne sont pas tranchés.

## C'est fini quand

- [ ] Une liste mise dans deux fêtes montre les mêmes coches aux deux.
- [ ] Un compte hors de la fête ne peut pas lire la liste (un test d'isolation le vérifie).
- [ ] Les maquettes du ticket sont reproduites.
- [ ] `/controle` passe.

## Compte rendu

À remplir par Claude Code à la fin : ce qui a été fait, ce qui a été décidé seul (et pourquoi), les écarts avec les maquettes, les questions posées, les commits.
