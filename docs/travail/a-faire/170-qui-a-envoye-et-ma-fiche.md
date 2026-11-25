# 170 — Deux textes : qui a envoyé le rappel, et « Ma fiche et mes goûts »

- **Dépend de** : 169 (après lui, pour ne pas toucher deux fois au suivi)
- **Migration** : non, sauf si le journal ne garde pas qui a envoyé (alors le dire dans `questions.md` avant)
- **Maquettes** : `V3ListeSecretLier` (le menu « … » de ma partie)

## Objectif

Deux retouches décidées par Julien le 25 novembre 2026. Quand un événement a plusieurs organisateurs, on lit qui a envoyé le dernier rappel, pour ne pas relancer deux fois. Et dans une liste, la ligne qui ouvre ma propre fiche parle de moi.

## À lire d'abord

- `docs/refonte/PLAN.md`, « Correction 17 », le point 4
- `shared/i18n/locales/fr/adminEdition.ts` (`lastReminder`, `lastOn`), `shared/i18n/locales/fr/lists.ts` (`personPage`)

## À faire

- [ ] **Qui a envoyé**, quand l'événement a plus d'un organisateur : « Dernier rappel le 20 décembre, par Hugo » ; si c'est moi, « Dernier rappel le 20 décembre, par toi ». Avec un seul organisateur, rien ne change. Dans le journal, la ligne d'un envoi dit le prénom de l'organisateur qui l'a fait, dans le même cas.
- [ ] **Les envois seulement** : un rappel à une personne, un rappel à plusieurs, un lien partagé. Pas les autres gestes (un réglage changé, un participant ajouté).
- [ ] Ce que l'application envoie elle-même (ticket 169) ne dit pas « par » quelqu'un.
- [ ] **« Ma fiche et mes goûts »** : dans le menu « … » de ma partie d'une liste, la ligne qui ouvre ma fiche. Pour quelqu'un d'autre, « Sa fiche et ses goûts » ne change pas.
- [ ] Trois langues, tournures neutres, tests.

## Hors périmètre

- « Hugo le reçoit aussi » dans les emails d'étape : non retenu.

## C'est fini quand

- [ ] Dans un événement à deux organisateurs, chacun lit qui a envoyé le dernier rappel.
- [ ] Le menu « … » de ma partie dit « Ma fiche et mes goûts ».
- [ ] `/controle` passe.

## Compte rendu

À remplir par Claude Code à la fin : ce qui a été fait, ce qui a été décidé seul (et pourquoi), les écarts avec les maquettes, les questions posées, les commits.
