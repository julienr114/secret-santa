# 115 — V3 : le Secret Santa, deux réponses (Q-015 et Q-016)

- **Dépend de** : 105
- **Migration** : non
- **Maquettes** : `V3TirageReglages`, `V3TirageNouveau`, `DevineStory7`

## Objectif

Le nom, la date, le budget et le petit mot d'un Secret Santa se changent en tête de ses réglages. Hors de Noël, le palmarès ne souhaite plus « Joyeux Noël ».

## À lire d'abord

- `docs/travail/questions.md` (Q-015, Q-016, dans « Réponses »)
- `docs/spec/v3/secret-santa.md` (« Ses réglages »)
- `docs/spec/v3/vocabulaire.md` (« Devine qui hors de Noël »)

## À faire

- [x] **Les réglages** (`V3TirageReglages`) : la section « Le Secret Santa » en premier, avec « Nom », « Date », « Budget », « Petit mot pour les participants » ; plus de section « La fête » en bas. La ligne du formulaire de création s'appelle « Date ».
- [x] **Le palmarès** (`DevineStory7`) : hors d'un événement de catégorie Noël, « Merci d'avoir joué, Inès » et « Merci à tous ! » ; « C'est tout » au lieu de « C'est tout pour cette année » dans un événement qui ne revient pas. Dans les trois langues, écrit pour de bon.
- [x] **« Liste de cadeaux », en toutes lettres** (Julien, 22 novembre 2026 ; `docs/spec/v3/vocabulaire.md`) : « Une liste de cadeaux » dans « Créer » ; « Ma liste de cadeaux » pour le titre de la ligne d'une liste que je tiens, et son texte commence par « Pour » (« Pour Léo, Zoé et moi », « Pour Léo »). Maquettes : `V3AccueilPlusOuvert`, `V3Accueil`, `V3Fete`. Dans les trois langues ; les tests de `lignes.md` suivent.
- [x] Retirer de `docs/refonte/ECARTS-MAQUETTES.md` la ligne de `V3TirageReglages` que ce ticket remet d'accord.

## Hors périmètre

- « Pistes de cadeaux » dans les réglages : il part au ticket 107.
- Le lien d'invitation et « Quelqu'un s'inscrit par le lien » dans les réglages : ticket 116.

## C'est fini quand

- [x] Sur l'accueil, la ligne d'une liste que je tiens pour Léo dit « Ma liste de cadeaux » et « Pour Léo ».
- [x] Aucun texte du palmarès ne dit « Noël » dans un événement d'une autre catégorie (un test le vérifie).
- [x] La maquette `V3TirageReglages` est reproduite.
- [x] `/controle` passe.

## Compte rendu

**Fait.**

- **Les réglages d'un Secret Santa** (`V3TirageReglages`) : la section « Le Secret Santa » vient en premier, avec « Nom », « Date », « Budget », « Petit mot pour les participants », dans l'ordre du formulaire de création, sans icône, la valeur à droite (« Aucun », « À choisir » comme à la création). « Nom » s'ouvre dans un panneau de texte et s'enregistre aussitôt (route `PATCH` existante, `label`). La section « Le jour J » (ex-« La fête ») du bas a disparu ; ses clés `adminEdition.settings.party` et `dateTitle` sont supprimées dans les trois langues. La ligne du formulaire de création disait déjà « Date ».
- **Le palmarès** (`DevineStory7`) : `storyEnd` (`shared/utils/palmares.ts`) choisit les textes de la dernière image ; hors de Noël, les variantes `endTitleNeutral` (« Merci d'avoir joué, Inès ») et `endTitleAloneNeutral` (« Merci à tous ! ») sont écrites dans les trois langues ; « C'est tout » (`endEyebrowOnce`) dans un événement qui ne revient pas. Les deux routes du palmarès (organisateur et lien personnel) disent maintenant si l'événement revient (`recurring`).
- **« Liste de cadeaux », en toutes lettres** : « Une liste de cadeaux » dans « Créer » ; « Ma liste de cadeaux » pour le titre d'une liste que je tiens ; son texte commence par « Pour » (`lines.list.for`, qui remplace `lines.names`) : « Pour Léo, Zoé et moi », « Pour Léo ». Vaut aussi sur la page d'une année passée. En anglais « My gift list », « For Léo and me » ; en allemand « Meine Geschenkliste », « Für Léo und mich ».
- **Tests** : Vitest sur `storyEnd`, et un test qui parcourt tous les textes du palmarès (`participant.game.story`, `participant.game.awards`) dans les trois langues hors de Noël et vérifie qu'aucun ne dit « Noël », « Christmas » ni « Weihnacht » ; `lines.test.ts` suit les nouvelles clés. Playwright : les réglages (ordre des lignes, renommer, budget), le palmarès d'un anniversaire qui ne revient pas (`guess.spec.ts`), la ligne « Ma liste de cadeaux · Pour Léo » sur l'accueil (`lists-sharing.spec.ts`), « Une liste de cadeaux » dans « Créer » (`tabs.spec.ts`).
- **Contrôle** : `pnpm controle --e2e` passe en entier (trois langues, mots interdits, textes en dur, lint, types, 887 tests Vitest, 175 tests Playwright, sans relance).

**Décidé seul, et pourquoi.**

- « Nom » se change dans un panneau de texte, comme « Budget » sur la même page, et non sur une page à lui : aucune maquette ne le dessine, et c'est le geste voisin. Un nom vidé ne change rien.
- Dans les réglages, un budget ou un petit mot vide dit « Aucun » et une date absente « À choisir », comme le formulaire de création (la maquette montre « Aucun »).
- Sur l'image de fin, « Merci d'avoir joué, Inès » s'écrit pour tout participant hors de Noël, qu'il ait joué ou non, comme le dit la spec.

**Écarts avec les maquettes** : les deux lignes de `V3TirageReglages` sur la section du bas sont retirées de `ECARTS-MAQUETTES.md` ; il reste « Quelqu'un s'inscrit par le lien », absent jusqu'au ticket 116. Les lignes `V3Accueil` et `V3FeteAnneePassee` disent maintenant « Ma liste de cadeaux » et « Pour… ».

**Questions posées** : Q-027, « L'an prochain ? » sur l'image de mon Père Noël sans pronostic, dans un événement qui ne revient pas (laissé tel quel en attendant).

**Migrations** : aucune.

**Commits** : `328f235` docs: ticket 115 started ; `f95e52f` feat(secret-santa): its name, date, budget and word come first in its settings ; `4b71749` feat(guess): the palmarès thanks the players outside Christmas ; `7db90cb` feat(lines): « Ma liste de cadeaux », for whom it is ; puis le rangement du ticket.
