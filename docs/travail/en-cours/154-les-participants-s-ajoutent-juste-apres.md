# 154 — Créer un Secret Santa : dire que les participants s'ajoutent juste après

- **Dépend de** : 150
- **Avant** : la bascule (ticket 113)
- **Migration** : non
- **Maquettes** : `V3TirageNouveauSeul` (je suis seul), `V3TirageNouveau` (des membres repris)

## Objectif

Julien, le 24 novembre 2026 : dans un événement tout neuf, le formulaire de création affiche « 1 membre de l'événement. » au-dessus de « Créer le Secret Santa ». Ça ne dit rien, et on ne sait pas quand on ajoute les participants. La carte le dit.

## À lire d'abord

- `docs/spec/v3/secret-santa.md`, « Le créer » : le tableau de la carte de ceux qui participent déjà
- `app/pages/admin/[slug]/editions/nouvelle/index.vue` (`takenOver`), `adminEdition.newEdition.takenOverFrom` et `partyMembers`

## À faire

- [ ] La carte a deux lignes : la première en gras (ce qu'elle dit aujourd'hui), la seconde en texte discret, dans le même paragraphe (voir la maquette).
- [ ] Je suis le seul membre (avec ou sans Secret Santa précédent) : « Il n'y a que toi pour l'instant. » puis « Tu ajoutes les participants juste après. ». On n'écrit plus « 1 membre… ».
- [ ] Plusieurs membres : la phrase d'aujourd'hui (« 5 membres repris du Secret Santa 2026. » ou « 5 membres de l'événement. ») puis « Tu en ajoutes ou en retires juste après. ».
- [ ] Trois langues, tournures neutres (pas de « seul » accordé).
- [ ] Les tests qui lisaient « 1 membre de l'événement. ».

## C'est fini quand

- [ ] Dans un événement où je suis seul, le formulaire dit que j'ajoute les participants juste après.
- [ ] `/controle` passe.
