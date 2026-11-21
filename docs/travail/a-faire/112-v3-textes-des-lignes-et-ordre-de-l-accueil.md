# 112 — V3 : le texte sous chaque ligne, et l'accueil dans l'ordre des dates

- **Dépend de** : 105
- **Migration** : non
- **Maquettes** : `V3Accueil`, `V3AccueilAvantNoel`, `V3AccueilJeu`, `V3AccueilAnnee`, `V3Fete`, `V3FeteOrganisateur`, `V3FeteQuitter`

## Objectif

Sur l'accueil et sur la page d'une fête, chaque ligne dit où en est la chose : « Ton enveloppe t'attend », « Tu offres 2 cadeaux · 1 nouvelle idée ». Et une fête qui vient avant Noël est au-dessus de Noël. Ce sont les réponses aux questions Q-010 à Q-014.

## À lire d'abord

- `docs/spec/v3/lignes.md` (tout le ticket est là)
- `docs/spec/v3/accueil-et-creation.md` (« L'accueil », « Le jeu, sur l'accueil »)
- `docs/spec/v3/fete.md` (« Quitter »)
- `docs/decisions/2026-11-21-l-accueil-suit-les-dates.md`
- `docs/decisions/2026-11-21-le-nom-d-une-fete-dans-une-phrase.md`

## À faire

- [ ] La ligne d'un Secret Santa : son titre (« Le Secret Santa », ou son nom s'il y en a plusieurs), le texte du participant, le texte de l'organisateur, ce que la ligne ouvre selon l'endroit.
- [ ] La ligne « Devine qui », quand le jeu est activé.
- [ ] La ligne d'une liste : son titre (« Ma liste », « La liste de … »), son texte quand je la tiens, son texte quand elle est à quelqu'un d'autre.
- [ ] Le point rouge sur les cas marqués ●, éteint quand j'ouvre la chose.
- [ ] « aussi : Chez Mamie », « aussi dans 2 autres événements » : jamais de préposition devant le nom d'une fête, dans les trois langues.
- [ ] Les textes de « Les événements passés » et de « Ce que j'offre ailleurs » ; les deux lignes ne se montrent que s'il y a quelque chose derrière.
- [ ] L'ordre de l'accueil : par date, la section de Noël à la place de sa première fête, ce qui vient avant au-dessus et sans titre, « Bientôt » après elle, « Plus tard » ensuite.
- [ ] « Quitter » : les deux phrases sur ma liste, selon qu'elle est dans d'autres fêtes ou non.
- [ ] Retirer de `docs/refonte/ECARTS-MAQUETTES.md` les lignes que ce ticket remet d'accord.

## Hors périmètre

- Les pages des fêtes passées (ticket 108) : `lignes.md` dit déjà leurs textes, ils se coderont là.
- « Quoi de neuf » (tickets 110 et 120).
- Combien de temps une fête reste sur l'accueil après sa date (Q-009).

## C'est fini quand

- [ ] Chaque cas des tableaux de `lignes.md` a son test sur la fonction qui choisit le texte.
- [ ] Aucun texte de l'accueil ni d'une page de fête ne contient le prénom de la personne que j'ai tirée, ni celui de quelqu'un qui me demande des idées (un test le vérifie).
- [ ] Une fête du 28 novembre s'affiche au-dessus de « Noël 2026 ».
- [ ] Les maquettes du ticket sont reproduites.
- [ ] `/controle` passe.

## Compte rendu

À remplir par Claude Code à la fin : ce qui a été fait, ce qui a été décidé seul (et pourquoi), les écarts avec les maquettes, les questions posées, les commits.
