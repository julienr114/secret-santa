# 126 — « Qui a fait ça, et pourquoi ? », et le café

- **État** : réécrit pour la V3 le 24 novembre 2026. Attend les textes et les réponses de Julien (rapport de conception du 25 novembre, questions sur le 126) avant de passer dans `a-faire/`.
- **Vient de** : l'ancien plan, « Lot 33 » ; README 22.24
- **Dépend de** : rien ; se fait avec le 125 ou avant lui
- **Migration** : non
- **Maquettes** : `APropos` (ses textes sont un brouillon)

## Objectif

Une page publique dit qui a fait Under the Tree et pourquoi, donne un moyen d'écrire à Julien, et propose de lui offrir un café. Elle ne demande rien dans l'application et ne suit personne.

## À lire d'abord

- `docs/refonte/PLAN.md`, « Lot 33 » et ses points à relire (section 6)
- la maquette `APropos`

## À faire

- [ ] **La page `/a-propos`**, publique, rendue côté serveur : l'icône et « Salut, moi c'est Julien », « Pourquoi j'ai fait ça », « Mon métier », « Un café ? », « Une idée, un souci ? Écris-moi ».
- [ ] **Les textes sont ceux de Julien** : ne rien coder ni traduire avant qu'il les ait écrits ou validés.
- [ ] **« Mon métier »** : deux liens en texte, LinkedIn et GitHub, dont les adresses sont dans la configuration ; sans adresse, le lien ne s'affiche pas. Pas de logo de marque.
- [ ] **Le code reste privé** : le lien GitHub mène au profil, jamais au dépôt. Vérifier avant la mise en ligne : le dépôt est privé ; aucune adresse du dépôt dans les pages, les emails ni les fichiers servis ; pas de fichiers `.map` servis au navigateur.
- [ ] **« M'offrir un café »** : un lien vers le service de dons, dans un nouvel onglet (`rel="noopener"`). Son adresse est dans la configuration ; sans adresse, le bloc « Un café ? » ne s'affiche pas. Aucun script ni traceur du service.
- [ ] **« Écris-moi »** : l'adresse de contact de la configuration, une adresse créée pour ça sur le domaine. **Jamais l'adresse personnelle de Julien.** Sans adresse, la ligne ne s'affiche pas.
- [ ] **Les liens vers la page** : en bas de la page de présentation (ticket 125) et dans « Mon compte ».
- [ ] Trois langues, tests de parcours (la page sans session, chaque bloc absent quand son adresse manque), README 11 et 22.24 à jour.

## Hors périmètre

- Comment déclarer des dons : à voir par Julien avec un comptable.

## C'est fini quand

- [ ] La page s'ouvre sans compte, dans les trois langues, avec les textes de Julien.
- [ ] Sans adresse de dons ni de contact dans la configuration, la page n'en parle pas.
- [ ] `/controle` passe.

## Ce qui manque

- Les textes de Julien ; son icône ; le service de dons ; l'adresse de contact.
