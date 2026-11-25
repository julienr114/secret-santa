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

- [x] Sur la page d'un événement, sous « Les Secret Santa », pour un Secret Santa que j'organise **et** où je participe : la ligne « Le Secret Santa » avec mon texte de participant (« Tu sais à qui tu offres », « Ton enveloppe t'attend »…), qui ouvre mon résultat ; dessous, accrochée sans trait, « Tu l'organises » avec le texte de l'organisateur (« Fait · 6 sur 8 ont découvert »), qui ouvre le suivi.
- [x] Si je l'organise sans y participer : une seule ligne, comme aujourd'hui.
- [x] Plusieurs Secret Santa dans l'événement : la règle vaut pour chacun.
- [x] Les mêmes textes et la même hauteur que sur l'accueil (54 px, alignée sous le titre, sans icône). Tests, trois langues si un texte est nouveau.

## Hors périmètre

- L'accueil : il ne change pas.

## C'est fini quand

- [x] Depuis la page de l'événement, un organisateur qui participe ouvre son résultat par une ligne et le suivi par l'autre.
- [x] `/controle` passe.

## Compte rendu

- **Le serveur** (`server/database/parties.ts`) suit la règle de l'accueil : un Secret Santa où je participe me parle comme participant, même si je l'organise (`as: participant`), sa ligne ouvre mon résultat, et un champ `organiser` (le texte de l'organisateur, le suivi) s'ajoute quand je l'organise aussi. Les pages personnelles d'un organisateur sont maintenant lues (elles ne l'étaient que pour un membre) ; du coup, « Devine qui » paraît aussi sous un Secret Santa qu'il organise et où il joue, comme sur l'accueil.
- **Un seul composant** : la ligne « Tu l'organises » sort de `PartyCard` en `UiOrganiseRow` (54 px, alignée sous le titre, sans icône), utilisée par l'accueil et par la page de l'événement ; la ligne du dessus perd son trait (`border-b-0`). Plusieurs Secret Santa : chacun a sa paire. Pas de texte nouveau.
- **Tests** : `tests/e2e/home.spec.ts` ouvre aussi la page de l'événement : la ligne du Secret Santa mène à `/p/…`, « Tu l'organises » au suivi ; organisé sans y participer, une seule ligne vers le suivi.
- **Écarts avec les maquettes** : aucun. **Questions** : aucune. **Migration** : aucune.
- **Contrôle** : `pnpm controle --e2e` passé.
