# 173 — Sur la page de l'événement, « Le Secret Santa » puis « Tu l'organises »

- **Dépend de** : 156 (la même paire sur l'accueil, déjà faite)
- **Migration** : non
- **Maquettes** : `V3FeteOrganisateur` (redessinée le 25 novembre 2026), `V3Accueil` (la référence)

## Objectif

Sur l'accueil, quand j'organise un Secret Santa où je participe aussi, je vois deux lignes : ce que je vois comme participant, et ce que je fais comme organisateur. Sur la page de l'événement, il n'y en a qu'une, celle de l'organisateur : je ne peux pas y ouvrir mon propre résultat. Julien, le 25 novembre 2026 : le même dessin aux deux endroits.

## À lire d'abord

- `docs/spec/v3/fete.md`, « La page d'un événement » ; `docs/spec/v3/lignes.md` (« Tu l'organises »)
- Ce que le ticket 156 a codé pour l'accueil : reprendre le même composant, pas un second

## À faire

- [ ] Sur la page d'un événement, sous « Les Secret Santa », pour un Secret Santa que j'organise **et** où je participe : la ligne « Le Secret Santa » avec mon texte de participant (« Tu sais à qui tu offres », « Ton enveloppe t'attend »…), qui ouvre mon résultat ; dessous, accrochée sans trait, « Tu l'organises » avec le texte de l'organisateur (« Fait · 6 sur 8 ont découvert »), qui ouvre le suivi.
- [ ] Si je l'organise sans y participer : une seule ligne, comme aujourd'hui.
- [ ] Plusieurs Secret Santa dans l'événement : la règle vaut pour chacun.
- [ ] Les mêmes textes et la même hauteur que sur l'accueil (54 px, alignée sous le titre, sans icône). Tests, trois langues si un texte est nouveau.

## Hors périmètre

- L'accueil : il ne change pas.

## C'est fini quand

- [ ] Depuis la page de l'événement, un organisateur qui participe ouvre son résultat par une ligne et le suivi par l'autre.
- [ ] `/controle` passe.

## Compte rendu

À remplir par Claude Code à la fin : ce qui a été fait, ce qui a été décidé seul (et pourquoi), les écarts avec les maquettes, les questions posées, les commits.
