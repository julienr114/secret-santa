# 145 — « Cette personne », pas « il » : les textes des invitations

- **Dépend de** : 141
- **Avant** : la bascule (ticket 113)
- **Migration** : non
- **Maquettes** : `V3ListeInviter`, `V3ListeInviterEmail`, `ListeTeneurs`, `ListeTeneursAdresse`, `PanneauOrganisateur` (le texte seulement)

## Objectif

Q-035 : « Il reçoit un email à ton nom » suppose un genre que l'application ne connaît pas. Quand un texte parle d'une personne précise qu'on invite ou qu'on ajoute, il dit « cette personne ». Seul le français change : l'anglais et l'allemand le font déjà.

## À lire d'abord

- `docs/spec/v3/vocabulaire.md` (« Cette personne », pas « il » : le tableau et ce qui reste)

## À faire

- [ ] `lists.inviteMembers.hint` : « Cette personne reçoit un email à ton nom, et devient membre de « {name} ». »
- [ ] `shared/i18n/locales/fr/lists.ts`, les trois textes de l'invitation à tenir une liste : « Elle sert à envoyer l'invitation, qui dit que c'est toi qui invites. » ; « Ce que cette personne pourra faire » ; « Cette personne reçoit un email, et peut refuser. L'invitation vaut 7 jours. »
- [ ] `shared/i18n/locales/fr/adminGroup.ts` : « Cette personne pourra gérer {name} comme toi : membres, Secret Santa, envois. »
- [ ] **Relire le reste du français** pour les « il », « lui », « invité(e) » qui visent une personne précise (par exemple « Il lui suffira de se connecter avec cette adresse », « Comme toi, il ne verra pas les résultats », « Invitée le 18 novembre ») : les tourner de la même façon quand la phrase reste courte ; sinon poser une question avec la liste.
- [ ] Vérifier l'anglais et l'allemand des mêmes clés : rien à changer s'ils disent déjà « they » et « die Person ».

## Hors périmètre

- « il » qui reprend un mot masculin (« l'organisateur : il peut… », « chacun… autant qu'il veut ») et « celui qui m'a tiré ».

## C'est fini quand

- [ ] Aucun texte français ne dit « il » ou « elle » d'une personne qu'on invite ou qu'on ajoute.
- [ ] `/controle` passe.

## Compte rendu

À remplir par Claude Code à la fin : ce qui a été fait, ce qui a été décidé seul (et pourquoi), les écarts avec les maquettes, les questions posées, les commits.
