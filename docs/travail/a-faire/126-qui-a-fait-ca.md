# 126 — « Qui a fait ça, et pourquoi ? », et le café

- **Décidé par Julien le 25 novembre 2026** : les textes de la maquette `APropos` sont les bons ; pas de photo, le rond de la maquette suffit ; on arrive à la page par le menu de l'avatar, « À propos » ; l'adresse de contact et le lien du café sont en configuration, et Julien les donnera.
- **Vient de** : l'ancien plan, « Lot 33 » ; README 22.24
- **Dépend de** : rien ; se fait avec le 125 ou avant lui
- **Migration** : non
- **Maquettes** : `APropos` (ses textes sont validés), `MenuAvatarOuvert` (l'entrée « À propos »)

## Objectif

Une page publique dit qui a fait Under the Tree et pourquoi, donne un moyen d'écrire à Julien, et propose de lui offrir un café. Elle ne demande rien dans l'application et ne suit personne.

## À lire d'abord

- `docs/refonte/PLAN.md`, « Lot 33 » et ses points à relire (section 6)
- la maquette `APropos`

## À faire

- [ ] **La page `/a-propos`**, publique, rendue côté serveur : l'icône et « Salut, moi c'est Julien », « Pourquoi j'ai fait ça », « Mon métier », « Un café ? », « Une idée, un souci ? Écris-moi ».
- [ ] **Les textes sont ceux de la maquette `APropos`**, validés par Julien le 25 novembre 2026. Pas de photo : le rond de la maquette.
- [ ] **« Mon métier »** : deux liens en texte, LinkedIn et GitHub, dont les adresses sont dans la configuration ; sans adresse, le lien ne s'affiche pas. Pas de logo de marque.
- [ ] **Le code reste privé** : le lien GitHub mène au profil, jamais au dépôt. Vérifier avant la mise en ligne : le dépôt est privé ; aucune adresse du dépôt dans les pages, les emails ni les fichiers servis ; pas de fichiers `.map` servis au navigateur.
- [ ] **« M'offrir un café »** : un lien vers le service de dons, dans un nouvel onglet (`rel="noopener"`). Son adresse est dans la configuration ; sans adresse, le bloc « Un café ? » ne s'affiche pas. Aucun script ni traceur du service.
- [ ] **« Écris-moi »** : l'adresse de contact de la configuration, une adresse créée pour ça sur le domaine (Julien prévoit `bonjour@under-the-tree.party` ; il la donnera quand elle existe). **Jamais l'adresse personnelle de Julien.** Sans adresse, la ligne ne s'affiche pas.
- [ ] **Les liens vers la page** : en bas de la page de présentation (ticket 125) et dans **le menu de l'avatar**, une entrée « À propos » (`MenuAvatarOuvert`).
- [ ] Trois langues, tests de parcours (la page sans session, chaque bloc absent quand son adresse manque), README 11 et 22.24 à jour.

## Hors périmètre

- Comment déclarer des dons : à voir par Julien avec un comptable.

## C'est fini quand

- [ ] La page s'ouvre sans compte, dans les trois langues, avec les textes de la maquette, et le menu de l'avatar y mène.
- [ ] Sans adresse de dons ni de contact dans la configuration, la page n'en parle pas.
- [ ] `/controle` passe.

## Compte rendu

À remplir par Claude Code à la fin : ce qui a été fait, ce qui a été décidé seul (et pourquoi), les écarts avec les maquettes, les questions posées, les commits.
