# 171 — Pouvoir changer la clé du serveur

- **Vient de** : l'ancien plan, « Lot 38 A » (« à écrire avant le lot 34 », aujourd'hui le ticket 128)
- **Dépend de** : rien ; à faire avant le 128
- **Migration** : à voir
- **Maquettes** : aucune

## Objectif

Aujourd'hui, `NUXT_DATA_KEY` ne peut pas être changée : les résultats des tirages et les liens personnels en dépendent, et rien ne sait les rechiffrer. Si la clé fuit, on ne peut donc rien faire. Ce ticket écrit le script et la marche à suivre pour la changer sans rien perdre. Décidé par Julien le 25 novembre 2026.

## À lire d'abord

- `docs/refonte/PLAN.md`, « Lot 38 A », la case « La clé des résultats et les sauvegardes »
- README, section 16 (la procédure d'export et de garde de la clé)
- Le code qui se sert de la clé : les résultats, les liens personnels, les empreintes des adresses (ticket 130), les codes de connexion (ticket 123), les tickets signés des listes en direct

## À faire

- [ ] **Faire la liste** de tout ce qui dépend de la clé, et pour chaque chose dire ce qui arrive quand elle change : rechiffré, recalculé, ou perdu et sans gravité (un code de connexion d'un quart d'heure). L'écrire dans le README 16.
- [ ] **Le script** : lit avec l'ancienne clé, écrit avec la nouvelle, en une fois ou par lots repris sans dégât s'il est interrompu. Il se lance d'abord « à blanc » et dit ce qu'il ferait.
- [ ] **Le cas des empreintes** (les adresses qui ont refusé nos emails) : on ne peut pas recalculer une empreinte sans l'adresse. Dire dans `questions.md` ce que tu proposes avant de coder ce point.
- [ ] **La marche à suivre** pour Julien, dans le README 16, pas à pas : exporter la base, essayer sur une copie locale de la production, changer le secret chez Cloudflare, lancer le script, vérifier, et comment revenir en arrière.
- [ ] Un test sur une base de test : après le changement, un résultat se lit, un lien personnel s'ouvre, une adresse bloquée le reste.

## Hors périmètre

- Changer la clé pour de bon en production : c'est Julien qui le décide et le fait.

## C'est fini quand

- [ ] Sur une copie locale, la clé change et rien n'est perdu de ce qui doit rester.
- [ ] La marche à suivre est écrite, avec le retour en arrière.
- [ ] `/controle` passe.

## Compte rendu

À remplir par Claude Code à la fin : ce qui a été fait, ce qui a été décidé seul (et pourquoi), les écarts avec les maquettes, les questions posées, les commits.
