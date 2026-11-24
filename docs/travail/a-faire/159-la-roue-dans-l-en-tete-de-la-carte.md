# 159 — La carte d'un événement : la roue dans l'en-tête, la date sous le titre ; « Réglages de l'événement » en ligne

- **Dépend de** : 156
- **Avant** : la bascule (ticket 113)
- **Migration** : non
- **Maquettes** : `V3Accueil`, `V3AccueilSansSecret`, `V3AccueilAnnee` (les cartes), `V3FeteOrganisateur` (la page de l'événement)

## Objectif

Julien, le 24 novembre 2026, après avoir vu le ticket 156 : la ligne « Gérer l'événement » dans la carte, « ça fait un peu trop ». On la retire. L'en-tête de la carte dit lui-même qu'on gère : une roue crantée à la place de la flèche. Et sur la page de l'événement, la roue du haut devient une ligne.

## À lire d'abord

- `docs/spec/v3/lignes.md` : « L'en-tête d'une carte » (il remplace « La ligne « Gérer l'événement » »)
- `docs/spec/v3/fete.md` : « La page d'un événement » (les membres, « Réglages de l'événement »)
- ce que le ticket 156 a codé

## À faire

- [ ] **Retirer la ligne « Gérer l'événement »** de la carte (ticket 156) et ses textes. « Tu l'organises » ne change pas.
- [ ] **L'en-tête de toutes les cartes de l'accueil** : la date passe sous le titre, en petit. Le titre tient sur deux lignes au plus, puis « … ».
- [ ] **À droite de l'en-tête** : la flèche pour un membre ; pour un organisateur de l'événement, une roue crantée dans un rond de 38 px (`aria-label` « Gérer l'événement », trois langues). Tout l'en-tête reste un seul lien vers la page de l'événement.
- [ ] **La page de l'événement, pour un organisateur** : plus de roue en haut à droite. La carte des membres gagne une deuxième ligne, « Réglages de l'événement » (une roue, le titre, une flèche), qui ouvre les réglages. Pour un membre, rien ne change.
- [ ] Les tests qui passaient par la roue du haut ou par la ligne « Gérer l'événement ».

## C'est fini quand

- [ ] La carte d'un événement que j'organise n'a plus de ligne « Gérer l'événement » ; son en-tête a la roue.
- [ ] Sur la page de l'événement, « Réglages de l'événement » est une ligne sous les membres.
- [ ] `/controle` passe.
