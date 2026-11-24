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

- [ ] **Le cœur, en fonctions pures** : pour une nouveauté et un compte, faut-il un email, lequel, quand (résumé, tout de suite, aucun ; ce qui presse ; déjà vue ; l'attente de dix minutes quand un téléphone est prévenu).
- [ ] La ligne « Choisir ce qui me prévient », en bas de « Quoi de neuf », apparaît et ouvre ce réglage.
- [ ] **Le réglage** « Par email » dans « Mon compte », trois choix, « Un résumé le matin » par défaut pour tous les comptes existants.
- [ ] **Les emails automatiques des comptes passent par cette règle** : ils ne partent plus un par un. Les participants sans compte gardent les emails d'aujourd'hui. Aucun email pour de nouvelles idées sur une liste tant que le ticket 122 n'est pas fait.
- [ ] **Le résumé** : la tâche planifiée du matin, un email par compte qui a du nouveau pas encore vu, **un bloc par événement** au nom de l'événement (et un bloc par liste publique où j'ai coché), en texte seul, dans la langue du compte, avec le lien pour changer le réglage.
- [ ] Une demande d'idées y reste anonyme ; un résultat de tirage n'y figure jamais.
- [ ] Les emails que l'organisateur envoie à la main (liens, rappels) ne changent pas.
- [ ] Trois langues, textes au ton de `docs/refonte/TEXTES.md`, tests.

## Hors périmètre

- Les notifications du téléphone (ticket 124).

## C'est fini quand

- [ ] Trois nouveautés dans la journée donnent un seul email le lendemain matin, et aucun si je les ai vues entre-temps.
- [ ] « Ton enveloppe t'attend » part tout de suite, quel que soit le réglage, sauf « aucun email ».
- [ ] Les deux maquettes sont reproduites.
- [ ] `/controle` passe.

## Compte rendu

À remplir par Claude Code à la fin : ce qui a été fait, ce qui a été décidé seul (et pourquoi), les écarts avec les maquettes, les questions posées, les commits.
