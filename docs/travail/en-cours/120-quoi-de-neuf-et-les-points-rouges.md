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

- [ ] Ouvrir « Quoi de neuf » n'éteint aucun point ; ouvrir la chose l'éteint, partout.
- [ ] Un test vérifie qu'aucune nouveauté ne porte un résultat de tirage ni le nom de qui demande des idées.
- [ ] La maquette `V3QuoiDeNeuf` est reproduite.
- [ ] `/controle` passe.

## Compte rendu

À remplir par Claude Code à la fin : ce qui a été fait, ce qui a été décidé seul (et pourquoi), les écarts avec les maquettes, les questions posées, les commits.
