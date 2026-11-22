# 120 — « Quoi de neuf » et les points rouges

- **Dépend de** : 105, 106, 107
- **Avec** : 112
- **Migration** : oui (les nouveautés)
- **Maquettes** : `V3QuoiDeNeuf`, `V3ChargementQuoiDeNeuf`, `V3Accueil`, `V3AccueilJeu`, `NotifListe`

> **À faire d'un seul tenant avec le ticket 112** (Julien, 21 novembre 2026) : les points rouges des lignes et la page « Quoi de neuf » comptent la même chose, ce qui est nouveau depuis ma dernière visite. Un seul calcul, une seule table, deux tickets déplacés ensemble.

## Objectif

Je vois d'un coup d'œil ce qui a bougé depuis ma dernière visite : un compteur sur l'onglet « Quoi de neuf », un point rouge sur la ligne concernée, et une page qui range tout par événement. Aucun email ne change dans ce ticket.

## À lire d'abord

- `docs/spec/v3/accueil-et-creation.md` (« Quoi de neuf », « Le jeu, sur l'accueil »)
- `docs/spec/v3/lignes.md` (les cas marqués ●)
- `README.md`, section 22.22 (ce qui presse, ce qui est une nouveauté, l'oubli à trente jours)

## À faire

- [x] **L'inventaire d'abord** : la liste de tout ce que l'application envoie ou signale aujourd'hui (`server/utils/notifications.ts`, `server/plugins/reminders.ts`, `server/http/email.ts`, le journal), classé « ce qui presse » ou « le reste » d'après le README 22.22. Le poser dans `docs/travail/questions.md` pour relecture avant de coder.
- [x] **Le cœur, en fonctions pures**, testé d'abord : créer une nouveauté pour un compte ; regrouper celles de même nature au même endroit dans la journée ; ce qui la rend vue (ouvrir la chose, pas « Quoi de neuf ») ; les compteurs de l'onglet, d'une carte, d'une ligne ; l'oubli à trente jours.
- [x] **Base** : les nouveautés (compte, nature, niveau, l'endroit visé, l'événement, quand, vue ou non). Aucune ne contient ce que son destinataire n'a pas le droit de voir : jamais un résultat de tirage, jamais le prénom de qui demande des idées.
- [x] **Créer les nouveautés** aux endroits de l'inventaire, pour les seuls comptes. « De nouvelles idées sur une liste » ne donne ici que des points dans l'application : être prévenu hors de l'application est le ticket 122.
- [x] **Les points rouges** : ceux de `lignes.md` sur l'accueil et la page d'un événement, et le point dans la marge d'une ligne de liste changée depuis ma dernière visite (`NotifListe`). Lisibles par un lecteur d'écran.
- [x] **L'onglet « Quoi de neuf »** et son compteur ; la page, **une section par événement**, celui qui a la nouveauté la plus récente en haut ; une liste publique où j'ai coché a sa section ; une liste partagée dans deux événements n'apparaît qu'une fois ; en bas, « Tout s'efface au bout de trente jours » (la ligne « Choisir ce qui me prévient » attend le ticket 121, qui crée sa page).
- [x] **Le mot de l'application**, en tête de la page : un texte dans les trois langues, montré à ceux qu'il concerne, qui s'en va quand je l'ai fermé. Le ticket 113 s'en sert le jour de la bascule.
- [x] Mise à jour au retour sur la page.
- [x] Trois langues, guide de style, `tests/e2e`.

## Hors périmètre

- Les emails et le résumé du matin (ticket 121) : jusque-là, les emails partent comme aujourd'hui.
- Suivre une liste (ticket 122).
- Les notifications du téléphone (ticket 124).

## C'est fini quand

- [x] Ouvrir « Quoi de neuf » n'éteint aucun point ; ouvrir la chose l'éteint, partout.
- [x] Un test vérifie qu'aucune nouveauté ne porte un résultat de tirage ni le nom de qui demande des idées.
- [x] La maquette `V3QuoiDeNeuf` est reproduite.
- [x] `/controle` passe.

## Compte rendu

**Fait d'un seul tenant avec le ticket 112** (déplacés ensemble dans `en-cours/` puis dans `fait/`) : un seul calcul, une seule table, les points des lignes et la page lisent les mêmes nouveautés.

**Fait.**

- **L'inventaire** est posé dans `questions.md` (Q-026), classé « ce qui presse » ou « le reste » ; il est codé tel quel en attendant la relecture.
- **Le cœur, en fonctions pures** (`shared/utils/news.ts`, testé) : la forme de chaque nature (niveau, endroit visé), le regroupement de même nature au même endroit dans la journée (« 2 cadeaux ont été cochés sur ta liste »), l'oubli à trente jours, le jour dit comme « Quoi de neuf » le dit (« Aujourd'hui, 9 h 12 », « Hier », un jour de la semaine, une date), les sections par événement, l'événement d'une liste qui est dans deux (celui dont la date est la plus proche).
- **La base** : migration `0039_v3_news`, tables `news` (compte, nature, niveau, endroit visé, événement, un prénom que le texte dit, le cadeau pour « se joint à », combien, quand, vue) et `note_dismissals`. Aucune nouveauté ne porte un résultat de tirage ni le nom de qui demande des idées : celui qui a tiré quelqu'un reçoit « De nouvelles idées t'attendent » sur son propre Secret Santa (`tests/news.test.ts` le vérifie).
- **Les nouveautés s'écrivent** aux endroits de l'inventaire (`server/database/newsEvents.ts`), pour les seuls comptes : le tirage (et la validation d'un tirage fait ailleurs), le dévoilement (à la main ou tout seul), le palmarès, la demande d'idées, l'invitation à tenir une liste, de nouvelles idées sur une liste (aux membres des événements où elle est partagée avec tous et à ceux qui y ont coché ; jamais pour un brouillon), une coche, un cadeau à plusieurs rejoint, quelqu'un a rejoint l'événement, tout le monde a découvert, le rappel du jour J. Un nouveau tirage efface celles de l'ancien ; une liste ou un Secret Santa supprimé emporte les siennes ; la tâche du matin oublie celles de plus de trente jours. Aucun email ne change.
- **Vue en ouvrant la chose** : ma page du Secret Santa, l'enveloppe (« Ton enveloppe t'attend » s'éteint en l'ouvrant, comme la ligne), le palmarès regardé, une liste, le suivi de l'organisateur, la page de l'événement ; par un `POST` après l'affichage (lire n'écrit jamais, README 8.3 ; un aperçu de lien ne marque rien). Écrire une idée éteint « Quelqu'un te demande des idées ».
- **L'onglet « Quoi de neuf »** porte le compte des nouveautés pas vues (lu « 3 nouveautés » par un lecteur d'écran), relu à chaque page et au retour dans l'application. **La page** : une section par événement, celle de la nouveauté la plus récente en haut, une liste publique où j'ai coché a la sienne, une liste dans deux événements n'apparaît qu'une fois ; une ligne pas vue est en gras avec son point ; en bas « Tout s'efface au bout de trente jours ». Son squelette suit `V3ChargementQuoiDeNeuf`.
- **Le mot de l'application** (`shared/utils/appNote.ts`) : un bandeau en tête, montré aux comptes qu'il concerne (tous, ou ceux créés avant une date), fermé pour de bon par une croix. Aucun mot n'est posé : le ticket 113 l'écrira.
- **Le point dans la marge** (`NotifListe`) : sur la liste d'un autre ouverte par son lien, les idées écrites depuis ma visite d'avant.
- **Guide de style** : la ligne avec un point, et la nouveauté en gras.
- **Tests** : Vitest (`news.test.ts`, `appNote.test.ts`, `tests/news.test.ts` sur une vraie base) ; Playwright (`news.spec.ts`) : le tirage fait une nouveauté, un compte et un point ; ouvrir « Quoi de neuf » n'éteint rien ; ouvrir l'enveloppe, puis la liste, les éteint partout ; le point dans la marge.

**Décidé seul, et pourquoi.**

- L'inventaire (Q-026) : les alertes du journal, le point de « Devine qui » et les messages de l'organisateur n'ont pas de nouveauté (ils ont déjà leur signal ou leur email) ; « Devine qui · À toi de jouer » a son point par la ligne seule. Les nouveautés de l'organisateur s'écrivent même quand son email est coupé.
- Celui qui a tiré une personne qui tient la liste reçoit « De nouvelles idées t'attendent » à la place de « Camille a ajouté des idées à sa liste », pour qu'aucune ligne de liste ne le distingue. On retrouve le donneur en déchiffrant le tirage sur le serveur, comme le ticket 107 ; seul son compte en sort.
- L'heure d'une nouveauté est celle de sa dernière occurrence regroupée ; elle se lit dans le fuseau du téléphone, une fois la page affichée.
- Les textes ne connaissent pas le genre (« Camille t'invite à tenir sa liste », « Mamie se joint à ton cadeau à plusieurs : Vélo »).
- La ligne « Choisir ce qui me prévient » attend le ticket 121 ; la phrase des trente jours est seule en bas.
- Le compteur d'une carte : aucune maquette de la V3 n'en montre (la carte a ses lignes et leurs points) ; il n'y en a pas.

**Écarts avec les maquettes** : section « Les lignes, les points rouges et « Quoi de neuf » » de `docs/refonte/ECARTS-MAQUETTES.md`.

**Questions posées** : Q-026 (l'inventaire des nouveautés, pour relecture).

**Migrations** : `0039_v3_news` (tables `news` et `note_dismissals`), appliquée en local seulement. À appliquer à distance par Julien, après `0034`–`0038`.

**Contrôle** : `pnpm controle --e2e` : langues, mots, textes en dur, lint, types, 868 tests Vitest, 169 tests Playwright : tout passe (dernier passage). Aux passages d'avant : `security.spec.ts` « a participant learns their own result only » a échoué une fois (le test instable connu, passé ensuite) ; `admin-edition.spec.ts` cherchait un lien « Nouveau » et trouvait les lignes marquées « nouveau » : il cherche désormais le nom exact ; `news.spec.ts` dépendait du tirage au sort (si Hugo tire Camille, son idée est dite sur son Secret Santa) : corrigé.

**Commits** : `cce063f` docs: tickets 112 and 120 started ; `53bfb8e` feat(news): the news of an account, grouped in the day, seen by opening the thing ; `474ab67` docs: the inventory of the news, for review (ticket 120) ; `7c6468b` feat(lines): every line says where things are, with its red dot; « Quoi de neuf » (le code commun aux deux tickets) ; `77450f9` fix(news): keep the guard of the year readable on the palmarès route ; `61a617b` test(news): a name used once in the parcours of the news ; `14d7ca5` test(e2e): look for the button « Nouveau » itself, not a line marked new ; `f524ec7` test(news): the idea of the one Hugo drew is told on his Secret Santa ; et celui qui range ce ticket.
