# 112 — V3 : le texte sous chaque ligne, et l'accueil dans l'ordre des dates

- **Dépend de** : 105, 106, 107
- **Avec** : 120
- **Migration** : non
- **Maquettes** : `V3Accueil`, `V3AccueilAvantNoel`, `V3AccueilJeu`, `V3AccueilAnnee`, `V3Fete`, `V3FeteOrganisateur`, `V3FeteQuitter`

> **À faire d'un seul tenant avec le ticket 120** (Julien, 21 novembre 2026) : les points rouges des lignes et la page « Quoi de neuf » comptent la même chose, ce qui est nouveau depuis ma dernière visite. Un seul calcul, une seule table, deux tickets déplacés ensemble.

## Objectif

Sur l'accueil et sur la page d'un événement, chaque ligne dit où en est la chose : « Ton enveloppe t'attend », « Tu offres 2 cadeaux · 1 nouvelle idée ». Et un événement qui vient avant Noël est au-dessus de Noël. Ce sont les réponses aux questions Q-010 à Q-014.

## À lire d'abord

- `docs/spec/v3/lignes.md` (tout le ticket est là)
- `docs/spec/v3/accueil-et-creation.md` (« L'accueil », « Le jeu, sur l'accueil »)
- `docs/spec/v3/fete.md` (« Quitter »)
- `docs/decisions/2026-11-21-l-accueil-suit-les-dates.md`
- `docs/decisions/2026-11-21-le-nom-d-une-fete-dans-une-phrase.md`

## À faire

- [x] La ligne d'un Secret Santa : son titre (« Le Secret Santa », ou son nom s'il y en a plusieurs), le texte du participant, le texte de l'organisateur, ce que la ligne ouvre selon l'endroit.
- [x] La ligne « Devine qui », quand le jeu est activé.
- [x] La ligne d'une liste : son titre (« Ma liste », « La liste de … »), son texte quand je la tiens, son texte quand elle est à quelqu'un d'autre.
- [x] Le point rouge sur les cas marqués ●, éteint quand j'ouvre la chose.
- [x] « aussi : Chez Mamie », « aussi dans 2 autres événements » : jamais de préposition devant le nom d'un événement, dans les trois langues.
- [x] Les textes de « Les événements passés » et de « Ce que j'offre ailleurs » ; les deux lignes ne se montrent que s'il y a quelque chose derrière.
- [x] L'ordre de l'accueil : par date, la section de Noël à la place de son premier événement, ce qui vient avant au-dessus et sans titre, « Bientôt » après elle, « Plus tard » ensuite.
- [x] « Quitter » : les deux phrases sur ma liste, selon qu'elle est dans d'autres événements ou non.
- [x] Retirer de `docs/refonte/ECARTS-MAQUETTES.md` les lignes que ce ticket remet d'accord.

## Hors périmètre

- Les pages des événements passés (ticket 108) : `lignes.md` dit déjà leurs textes, ils se coderont là.
- La page « Quoi de neuf » : c'est le ticket 120, fait avec celui-ci.
- Combien de temps un événement reste sur l'accueil après sa date : la règle est décidée (`accueil-et-creation.md`, « Après la date »), elle se code au ticket 108.

## C'est fini quand

- [x] Chaque cas des tableaux de `lignes.md` a son test sur la fonction qui choisit le texte.
- [x] Aucun texte de l'accueil ni d'une page d'événement ne contient le prénom de la personne que j'ai tirée, ni celui de quelqu'un qui me demande des idées (un test le vérifie).
- [x] Un événement du 28 novembre s'affiche au-dessus de « Noël 2026 ».
- [x] Les maquettes du ticket sont reproduites.
- [x] `/controle` passe.

## Compte rendu

**Fait d'un seul tenant avec le ticket 120** (déplacés ensemble dans `en-cours/` puis dans `fait/`) : les points rouges des lignes et « Quoi de neuf » lisent la même table des nouveautés.

**Fait.**

- **Les textes de `lignes.md`**, choisis par des fonctions pures (`shared/utils/lines.ts`, un test par cas de chaque tableau) : la ligne d'un Secret Santa pour son participant et pour son organisateur, la ligne « Devine qui » (elle mène au pronostic, puis au palmarès), le titre d'une liste (« Ma liste », « La liste de Léo et Zoé », « … et 2 autres », sans personne ceux qui la tiennent) et son texte, quand je la tiens (« Pas encore partagée », « Léo, Zoé et moi · aussi : Chez Mamie », « 2 cadeaux cochés », « seul celui qui t'a tiré la voit ») ou quand elle est à un autre (« Tu offres 2 cadeaux · 1 nouvelle idée »). Les faits sont lus en une fois pour toute la page (`server/database/lines.ts`) ; seuls les mots sortent du serveur.
- **Qui voit quoi** : sur l'accueil, la ligne me parle comme participant si je participe, sinon comme organisateur ; sur la page d'un événement, l'organisateur lit le texte de l'organisateur. Le titre est « Le Secret Santa », ou son nom s'il y en a plusieurs.
- **Le point rouge** accompagne les cas marqués ● ; ce qui est « nouveau depuis ma dernière visite » vient des nouveautés du ticket 120 (une demande d'idées, de nouvelles idées pour celui que j'ai tiré, un dévoilement pas encore regardé, des coches sur ma liste), ou des visites d'aujourd'hui pour la liste d'un autre. Lu « nouveau » par un lecteur d'écran.
- **Jamais de préposition devant le nom d'un événement**, dans les trois langues (« aussi : Chez Mamie », « aussi dans 2 autres événements »).
- **L'ordre de l'accueil** (`homeBlocks`) : par date, la section de Noël à la place de son premier événement, ce qui vient avant au-dessus sans titre, « Bientôt » après elle, « Plus tard » ensuite ; une saison d'une autre année garde sa section à sa date.
- **« Quitter »** : « Ta liste sortira de cet événement. Elle reste dans tes autres événements. », ou « … Toi seul la verras, tant que tu ne l'as pas mise ailleurs. » ; la ligne « Quitter cet événement » n'a plus de texte dessous.
- **La page d'une année passée** : sous « Ma liste », « Léo, Zoé et moi » (ce que le ticket 108 avait laissé) ; les titres des listes suivent la même règle.
- « Les événements passés » et « Ce que j'offre ailleurs » étaient déjà faits (tickets 106, 108).
- **Tests** : Vitest sur chaque cas (`lines.test.ts`), sur l'ordre de l'accueil (`homeParties.test.ts`), sur une vraie base (`tests/news.test.ts` : les lignes d'un Secret Santa ne disent ni qui j'ai tiré ni qui me demande des idées, et la liste de celle que j'ai tirée me dit la même chose qu'à un autre membre) ; Playwright (`news.spec.ts`) : une crémaillère du 28 novembre au-dessus de « Noël », les textes, les points.

**Décidé seul, et pourquoi.**

- Pour l'organisateur, un Secret Santa dévoilé dit « Dévoilé » (puis « Terminé ») avant les cas « Fait · … » : lu à la lettre, « Tiré, tout le monde n'a pas ouvert » passerait devant et « Dévoilé » ne s'écrirait jamais.
- « Quelqu'un te demande des idées » s'en va quand j'ouvre ma page du Secret Santa ou quand j'écris une idée : on ne sait pas pour qui écrire (la demande est anonyme), et la règle du point est « il s'éteint quand j'ouvre la chose ».
- « Ma liste » pour plus de trois personnes, moi compris : « Léo, Zoé et 2 autres », où je compte parmi les autres.
- Le titre d'une liste d'un autre nomme les prénoms de la liste (et non plus le prénom donné dans l'événement, « Mamie Camille »), comme le dit `lignes.md`.
- Avec deux listes à moi dans l'événement, la phrase de « Quitter » est au pluriel ; dès que l'une n'est dans aucun autre événement, c'est « Toi seul les verras… ».

**Écarts avec les maquettes** : section « Les lignes, les points rouges et « Quoi de neuf » » de `docs/refonte/ECARTS-MAQUETTES.md`. Lignes retirées : la page vide de « Quoi de neuf », les lignes sans texte (accueil et page d'un événement), « tout ce qui n'est pas Noël sous « Plus tard » », « Elle reste chez Mamie » ; ligne corrigée : « Ma liste » d'une année passée.

**Questions posées** : aucune pour ce ticket (l'inventaire Q-026 est celui du ticket 120).

**Migrations** : aucune pour ce ticket (celle du ticket 120 : `0039_v3_news`).

**Contrôle** : `pnpm controle --e2e` : langues, mots, textes en dur, lint, types, 868 tests Vitest, 169 tests Playwright : tout passe (dernier passage). Aux passages d'avant : `security.spec.ts` « a participant learns their own result only » a échoué une fois (le test instable connu, passé ensuite) ; `admin-edition.spec.ts` cherchait un lien « Nouveau » et trouvait les lignes marquées « nouveau » : il cherche désormais le nom exact ; `news.spec.ts` dépendait du tirage au sort (si Hugo tire Camille, son idée est dite sur son Secret Santa) : corrigé.

**Commits** : `cce063f` docs: tickets 112 and 120 started ; `7c6468b` feat(lines): every line says where things are, with its red dot; « Quoi de neuf » (le code commun aux deux tickets) ; `77450f9` fix(news): keep the guard of the year readable on the palmarès route ; `61a617b` test(news): a name used once in the parcours of the news ; `14d7ca5` test(e2e): look for the button « Nouveau » itself, not a line marked new ; `f524ec7` test(news): the idea of the one Hugo drew is told on his Secret Santa ; et celui qui range ce ticket.
