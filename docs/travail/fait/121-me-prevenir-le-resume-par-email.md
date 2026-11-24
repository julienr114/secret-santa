# 121 — « Me prévenir » : le résumé par email, et ce qui presse

- **Dépend de** : 120
- **Migration** : oui (le réglage du compte)
- **Maquettes** : `NotifReglage`, `NotifEmailResume`

## Objectif

Je ne reçois plus un email à chaque geste des autres : un résumé le matin, s'il y a du nouveau que je n'ai pas vu. Ce qui presse (mon enveloppe, une invitation, une demande d'idées) part tout de suite. Je choisis dans « Mon compte ».

## À lire d'abord

- `README.md`, section 22.22
- `docs/spec/v3/secret-santa.md` (« Les objets des emails »)
- `docs/spec/v3/accueil-et-creation.md` (« Quoi de neuf » : le résumé suit le même rangement)

## À faire

- [x] **Le cœur, en fonctions pures** : pour une nouveauté et un compte, faut-il un email, lequel, quand (résumé, tout de suite, aucun ; ce qui presse ; déjà vue ; l'attente de dix minutes quand un téléphone est prévenu).
- [x] La ligne « Choisir ce qui me prévient », en bas de « Quoi de neuf », apparaît et ouvre ce réglage.
- [x] **Le réglage** « Par email » dans « Mon compte », trois choix, « Un résumé le matin » par défaut pour tous les comptes existants.
- [x] **Les emails automatiques des comptes passent par cette règle** : ils ne partent plus un par un. Les participants sans compte gardent les emails d'aujourd'hui. Aucun email pour de nouvelles idées sur une liste tant que le ticket 122 n'est pas fait.
- [x] **Le résumé** : la tâche planifiée du matin, un email par compte qui a du nouveau pas encore vu, **un bloc par événement** au nom de l'événement (et un bloc par liste publique où j'ai coché), en texte seul, dans la langue du compte, avec le lien pour changer le réglage.
- [x] Une demande d'idées y reste anonyme ; un résultat de tirage n'y figure jamais.
- [x] Les emails que l'organisateur envoie à la main (liens, rappels) ne changent pas.
- [x] Trois langues, textes au ton de `docs/refonte/TEXTES.md`, tests.

## Hors périmètre

- Les notifications du téléphone (ticket 124).

## C'est fini quand

- [x] Trois nouveautés dans la journée donnent un seul email le lendemain matin, et aucun si je les ai vues entre-temps.
- [x] « Ton enveloppe t'attend » part tout de suite, quel que soit le réglage, sauf « aucun email ».
- [x] Les deux maquettes sont reproduites.
- [x] `/controle` passe.

## Compte rendu

**Fait.**

- **Le cœur, en fonctions pures** (`server/utils/newsEmail.ts`, testé) :
  - `emailWhen` : pour une nouveauté et un compte, `now`, `wait` (les dix minutes quand un téléphone est prévenu, prêt pour le ticket 124), `summary` ou `none` ; ce qui presse part tout de suite avec le résumé, tout part tout de suite avec « Tout de suite », rien avec « Aucun email », rien de vu ni de déjà parti ;
  - `planNewsEmails` : ce qu'un passage de la tâche envoie, au plus 40 emails ;
  - `summaryDue` et `morningOf` : un résumé par jour, à partir de 8 h UTC, avec ce qui est arrivé avant ce matin-là ;
  - `ownEmailGoes` : un email à part ne part jamais à un compte qui ne veut aucun email ;
  - les deux emails, une nouveauté (`buildNewsEmail`) et le résumé (`buildSummaryEmail`), en texte, sans image.
- **Le réglage** : « Me prévenir » (`/compte/me-prevenir`), trois choix enregistrés dès qu'on choisit. On y arrive par une ligne de « Mon compte » et par « Choisir ce qui me prévient », en bas de « Quoi de neuf », avec « Ce que tu as vu s'efface au bout de trente jours » dessous.
- **La base** : migration `0048_v3_news_by_email`. Elle ajoute `accounts.email_news` (« summary » pour tous) et `accounts.summary_sent_on`, ainsi que `news.mailable` et `news.emailed_at`. Les nouveautés d'avant sont marquées parties. Une nouveauté comptée à nouveau (« 2 cadeaux… ») peut repartir.
- **L'envoi** : `server/plugins/newsEmails.ts` tourne à chaque passage de la tâche planifiée (tous les quarts d'heure, et le matin), avec `server/database/newsMail.ts`. Chaque nouveauté est marquée partie avant son email, chaque résumé une fois par jour : deux passages n'envoient jamais deux fois. Il n'y a pas d'envoi sans clé d'email. Le résumé range ses nouveautés comme « Quoi de neuf » : `loadNewsPage` repose maintenant sur `newsSectionsOf`, qui sert plusieurs comptes avec les mêmes requêtes. Les mots d'une nouveauté sont les mêmes dans la page et dans l'email (`newsText`).
- **Les emails automatiques des comptes passent par la règle** :
  - « s'inscrit par le lien » et « tout le monde a découvert » ne partent plus un par un aux organisateurs. Ce sont leurs nouveautés, envoyées selon le choix de chacun, et seulement si le Secret Santa le veut (`notifyJoined`, `notifyAllViewed` donnent `mailable`). `buildJoinedEmail` et `buildAllViewedEmail` sont supprimés, avec leurs textes ;
  - le palmarès de Devine qui : un compte le reçoit par sa nouveauté, une adresse sans compte par l'email d'avant ;
  - « a partagé sa liste avec toi » : même partage, la nouveauté pour un compte, l'email à son nom pour une adresse sans compte ;
  - les emails qui portent plus qu'une nouveauté gardent leur email à eux, qui part tout de suite comme ce qui presse, jamais à un compte qui ne veut aucun email. Ce sont l'invitation à tenir une liste (son lien d'invitation), la demande d'idées et ce qui suit (le lien personnel), le rappel du jour J (qui n'a pas découvert), et Devine qui : le rappel aux joueurs, le point et la fin aux organisateurs ;
  - les participants sans compte gardent les emails d'aujourd'hui. Les nouvelles idées sur une liste ne partent pas par email (`NEWS_EMAIL`, `never`) : le ticket 122 s'en charge ;
  - les emails que l'organisateur envoie à la main ne changent pas.
- **Rien d'anonyme ne se perd** : les emails disent les nouveautés, qui ne portent ni résultat de tirage ni le prénom de qui demande des idées.
- **Tests** :
  - Vitest : `server/utils/newsEmail.test.ts`, et `tests/newsMail.test.ts` sur une vraie base. Trois nouveautés de la journée donnent un seul résumé le lendemain matin, aucun si elles ont été vues ; l'enveloppe part tout de suite, mais pas à « Aucun email » ; un passage rejoué n'envoie rien ; une nouveauté refusée par l'organisateur ne part pas ; une nouveauté comptée à nouveau repart ;
  - Playwright : `notify-settings.spec.ts`.

**Décidé seul, et pourquoi.**

- **« Tout de suite » veut dire dans le quart d'heure** : l'email part au passage suivant de la tâche planifiée. Ainsi une requête n'envoie jamais d'email elle-même, une nouveauté vue entre-temps ne part pas, et le plan gratuit n'est pas dépassé. Les dix minutes d'attente pour un téléphone y trouveront leur place (ticket 124).
- **Le résumé** part à partir de 8 h UTC, à chaque passage, pour les comptes pas encore servis ce jour-là : un seul passage ne pourrait pas servir tout le monde. Il garde ce qui arrive après 8 h pour le lendemain.
- **Les emails qui ont plus à dire** (une invitation, un lien personnel, des prénoms) restent les leurs plutôt que de devenir le texte court d'une nouveauté. Ce sont tous des cas de « ce qui presse », ou des emails de Devine qui sans nouveauté (Q-026).
- **« Ton enveloppe t'attend »** part désormais à un compte après le tirage. L'email que l'organisateur envoie à la main reste : quelqu'un qui a un compte peut donc recevoir les deux.
- **L'objet** d'un email nomme l'événement, sans le nom du Secret Santa : la nouveauté ne le porte pas.
- **Les règles du 24 novembre** : la phrase d'introduction de `NotifReglage` n'est pas là, elle explique l'écran.

**Écarts avec les maquettes** : section « « Me prévenir » et le résumé par email » de `docs/refonte/ECARTS-MAQUETTES.md`.

**Questions posées** : aucune.

**Migrations** : `0048_v3_news_by_email`, appliquée en local seulement ; ajoutée à `docs/travail/migrations-a-publier.md`.


**Contrôle** : `pnpm controle --e2e`, tout est passé. Les trois langues, les mots, les textes en dur, le lint et les types sont bons ; 1 041 tests Vitest et 224 parcours Playwright passent. Au passage d'avant, un parcours a échoué : « Mes proches : quelqu'un supprimé » (`lists.spec.ts`), où Mamie était encore là juste après qu'on a quitté la liste. Ce parcours n'a rien à voir avec ce ticket, et il est passé seul puis dans la suite entière.

**Commit** : un seul, `feat(news): « Me prévenir », the morning summary by email, what presses at once`.
