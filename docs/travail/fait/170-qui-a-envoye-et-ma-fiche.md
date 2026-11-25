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

- [x] **Qui a envoyé**, quand l'événement a plus d'un organisateur : « Dernier rappel le 20 décembre, par Hugo » ; si c'est moi, « Dernier rappel le 20 décembre, par toi ». Avec un seul organisateur, rien ne change. Dans le journal, la ligne d'un envoi dit le prénom de l'organisateur qui l'a fait, dans le même cas.
- [x] **Les envois seulement** : un rappel à une personne, un rappel à plusieurs, un lien partagé. Pas les autres gestes (un réglage changé, un participant ajouté).
- [x] Ce que l'application envoie elle-même (ticket 169) ne dit pas « par » quelqu'un.
- [x] **« Ma fiche et mes goûts »** : dans le menu « … » de ma partie d'une liste, la ligne qui ouvre ma fiche. Pour quelqu'un d'autre, « Sa fiche et ses goûts » ne change pas.
- [x] Trois langues, tournures neutres, tests.

## Hors périmètre

- « Hugo le reçoit aussi » dans les emails d'étape : non retenu.

## C'est fini quand

- [x] Dans un événement à deux organisateurs, chacun lit qui a envoyé le dernier rappel.
- [x] Le menu « … » de ma partie dit « Ma fiche et mes goûts ».
- [x] `/controle` passe.

## Compte rendu

- **Pas de migration** : le journal garde déjà un `meta` en JSON ; les envois y ajoutent `by`, le compte de l'organisateur qui envoie : un message envoyé par email ou partagé (`emails.post`, `message.post`), un lien copié (`link.post`), le rappel de « Devine qui » (`guess/reminder.post`). Les autres gestes n'en ont pas ; ce que l'application envoie elle-même (ticket 169, acteur `system`) non plus. `by` ne sort jamais du serveur : le journal ne transmet que ses phrases.
- **« Dernier rappel le 20 décembre, par Hugo »**, ou « par toi » : sur la carte de « Devine qui » et sur la page du rappel, seulement quand l'événement a plus d'un organisateur (`reminderSender`, `server/utils/senders.ts`, testé ; `guess.reminderBy` dans le `GET` de l'édition, lu dans le dernier `guess_reminder_sent`). Un rappel envoyé avant ce ticket n'a pas de `by` : la phrase reste sans « par ».
- **Le journal** : avec plus d'un organisateur, une ligne d'envoi dit son prénom (« Hugo a envoyé le rappel à Léa par email », « Hugo a copié le lien de Léa ») ; un organisateur sans prénom reste « L'organisateur ». Décidé seul : les lignes regroupées (« L'organisateur a envoyé … à 3 personnes ») gardent « L'organisateur », puisqu'elles peuvent mêler deux organisateurs.
- **« Ma fiche et mes goûts »** dans le menu « … » de ma partie d'une liste (`isSelf`) ; « Sa fiche et ses goûts » pour quelqu'un d'autre.
- **Tests** : `server/utils/senders.test.ts`, `server/utils/audit.test.ts` (la phrase avec le prénom, et un réglage qui ne le dit pas) ; `tests/e2e/lists.spec.ts` (le menu de ma partie). Pas de parcours à deux organisateurs : la règle est dans les deux fonctions testées.
- **Écarts avec les maquettes** : aucun. **Questions** : aucune. **Migration** : aucune.
- **Contrôle** : `pnpm controle --e2e` passé.
