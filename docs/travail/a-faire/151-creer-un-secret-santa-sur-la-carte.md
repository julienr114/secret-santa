# 151 — « Créer un Secret Santa » sur la carte d'un événement, « Créer une liste de cadeaux »

- **Dépend de** : 112
- **Avant** : la bascule (ticket 113)
- **Migration** : non
- **Maquettes** : `V3AccueilSansSecret`, `V3Accueil`, `V3FeteAnniversaire`, `V3Fete`, `V3AccueilVide`

## Objectif

Julien, le 23 novembre 2026 : sur l'accueil, la carte d'un événement de Noël sans Secret Santa ne propose que « Nouvelle liste ». Elle doit aussi proposer de créer un Secret Santa ; et ce qui crée dit « Créer », la liste en toutes lettres.

## À lire d'abord

- `docs/spec/v3/accueil-et-creation.md` (« Une carte par événement » : en bas de la carte, ce qu'on peut y créer)
- `docs/spec/v3/vocabulaire.md` (« Liste de cadeaux », en toutes lettres : ce qui crée dit « Créer »)
- `docs/spec/v3/fete.md` (la page d'un événement)

## À faire

- [ ] **La carte d'un événement, sur l'accueil** : « Créer un Secret Santa » quand l'événement n'a pas de Secret Santa cette année et que je l'organise ; « Créer une liste de cadeaux » quand je n'y tiens aucune liste (la règle d'aujourd'hui pour « Nouvelle liste »). Une ligne chacun, la même écriture ; le Secret Santa en premier dans un événement de catégorie Noël, la liste en premier ailleurs.
- [ ] « Créer un Secret Santa » ouvre le formulaire de création, l'occasion déjà choisie (pas de « Pour quelle occasion ? »).
- [ ] **Les textes** : « Nouvelle liste » devient « Créer une liste de cadeaux » partout (`party.ts`, et où qu'il soit) ; « Organiser un Secret Santa » devient « Créer un Secret Santa » partout (`home.ts`, `party.ts`). Trois langues.
- [ ] Quelqu'un qui n'organise pas l'événement ne voit pas « Créer un Secret Santa », ni sur la carte ni sur la page de l'événement (comme aujourd'hui pour « Organiser un Secret Santa »).
- [ ] Les tests qui lisaient les anciens textes.

## C'est fini quand

- [ ] La carte d'un Noël que j'organise, sans Secret Santa, propose d'en créer un, d'un toucher.
- [ ] Plus aucun « Nouvelle liste » ni « Organiser un Secret Santa » en français.
- [ ] `/controle` passe.

## Compte rendu

À remplir par Claude Code à la fin : ce qui a été fait, ce qui a été décidé seul (et pourquoi), les écarts avec les maquettes, les questions posées, les commits.
