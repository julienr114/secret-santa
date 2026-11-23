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

- [x] `lists.inviteMembers.hint` : « Cette personne reçoit un email à ton nom, et devient membre de « {name} ». »
- [x] `shared/i18n/locales/fr/lists.ts`, les trois textes de l'invitation à tenir une liste : « Elle sert à envoyer l'invitation, qui dit que c'est toi qui invites. » ; « Ce que cette personne pourra faire » ; « Cette personne reçoit un email, et peut refuser. L'invitation vaut 7 jours. »
- [x] `shared/i18n/locales/fr/adminGroup.ts` : « Cette personne pourra gérer {name} comme toi : membres, Secret Santa, envois. »
- [x] **Relire le reste du français** pour les « il », « lui », « invité(e) » qui visent une personne précise (par exemple « Il lui suffira de se connecter avec cette adresse », « Comme toi, il ne verra pas les résultats », « Invitée le 18 novembre ») : les tourner de la même façon quand la phrase reste courte ; sinon poser une question avec la liste.
- [x] Vérifier l'anglais et l'allemand des mêmes clés : rien à changer s'ils disent déjà « they » et « die Person ».

## Hors périmètre

- « il » qui reprend un mot masculin (« l'organisateur : il peut… », « chacun… autant qu'il veut ») et « celui qui m'a tiré ».

## C'est fini quand

- [x] Aucun texte français ne dit « il » ou « elle » d'une personne qu'on invite ou qu'on ajoute.
- [x] `/controle` passe.

## Compte rendu

**Fait.**

- **Les textes du ticket** (français) : `lists.inviteMembers.hint` (« Cette personne reçoit un email à ton nom… ») ; l'invitation à tenir une liste (« Elle sert à envoyer l'invitation, qui dit que c'est toi qui invites. », « Ce que cette personne pourra faire », « Cette personne reçoit un email, et peut refuser… ») ; le nouvel organisateur (« Cette personne pourra gérer {name} comme toi… »).
- **Le reste du français relu**, tourné quand la phrase restait courte : « Cette personne se connecte avec son adresse, sans mot de passe » ; « … cette personne n'aura qu'à se connecter avec cette adresse » (deux textes) ; « Comme toi, cette personne ne verra pas les résultats du tirage » ; « … cette personne pourra la changer » (l'icône d'une nouvelle personne) ; « … pour que cette personne retrouve ses Secret Santa » ; « Cette personne rejoint tes proches… » ; « Invitation du 18 novembre · valable jusqu'au 25 » (au lieu de « Invitée le ») ; la réponse déduite d'un tirage fait ailleurs : « Sa réponse est remplie sans que tu la voies, et apparaît sur sa page. »
- **Restent**, comme le dit `vocabulaire.md` : « il » qui reprend « l'organisateur », « quelqu'un », « chacun », un lien ou un profil, et les tournures impersonnelles (« il faut », « il vaut mieux »).
- **Anglais et allemand** : l'anglais dit déjà « they ». L'allemand disait encore « Meldet sich mit seiner Adresse », « Seine E-Mail-Adresse », « sieht er » pour un nouvel organisateur : « Die Person… », « Die E-Mail-Adresse ».
- Test Playwright `membership.spec.ts` mis au nouveau texte.

**Décidé seul** : les tournures du reste du français (la règle de `vocabulaire.md`, phrases courtes) ; noté dans `ECARTS-MAQUETTES.md`.

**Questions posées** : **Q-036**, « Tu es invité au Secret Santa » (la page du lien et le message prêt à envoyer) parle au lecteur au masculin, ce que « cette personne » ne règle pas : laissé tel quel en attendant.

**Migration** : aucune.

**Contrôle** : `pnpm controle --e2e` passe en entier (992 tests Vitest, 205 tests Playwright).

**Commits** : `docs: ticket 145 started` ; `b68d8c9` fix(i18n): « cette personne », not « il », for whoever is invited or added ; et celui qui range ce ticket.
