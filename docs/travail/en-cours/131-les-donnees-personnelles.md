# 131 — Les données personnelles

- **Dépend de** : 106, 107, 130
- **Migration** : oui (la purge, ce qui est rendu anonyme)
- **Maquettes** : `Confidentialite`, `CompteDonnees`, `StopEmail` (le pied d'email)

## Objectif

Chacun sait ce que l'application garde sur lui et qui le voit, peut le télécharger, et peut supprimer son compte. L'application dit aussi ce qui fâche : la clé est sur le serveur, l'administrateur voit les comptes. **Les textes sont à faire relire par Julien avant d'être publiés** : ils engagent.

## À lire d'abord

- `README.md`, section 22.26 et 23.3 (« Qui verra ce que j'écris »)
- `docs/spec/v3/listes.md` (qui voit une liste : c'est ce que « Tes données, en clair » doit dire)
- L'archive `docs/refonte/PLAN.md`, section 6, « Lots 35 et 36 »

## À faire

- [x] **Décidé par Julien le 25 novembre 2026** :
  - **la relecture** des textes est la sienne, pas celle d'un juriste : le dire dans le compte rendu, sans écrire nulle part que les textes sont « conformes » ;
  - **le journal d'un événement** vit aussi longtemps que son événement : c'est une fonction (la triche se voit), pas un journal de sécurité ;
  - **l'empreinte d'une adresse qui a refusé nos emails** se garde tant que le refus tient, sans autre usage. La CNIL recommande au moins trois ans pour une telle liste (https://www.cnil.fr/fr/comment-utiliser-une-liste-repoussoir-pour-respecter-lopposition-la-prospection) ;
  - **les journaux de sécurité et de modération** (ticket 132) : un an, dans la fourchette de six mois à un an que recommande la CNIL (https://www.cnil.fr/fr/securite-tracer-les-operations) ;
  - **un compte sans visite depuis trois ans** est supprimé après un email (décidé le 19 novembre) ;
  - **l'adresse de contact** est dans la configuration : Julien prévoit `bonjour@under-the-tree.party` et la donnera quand elle existe. Sans adresse, les pages ne peuvent pas être publiées : le dire au lieu d'en inventer une.
- [ ] **Julien** : relire le texte de `Confidentialite` et la liste du README 22.26 ; créer l'adresse de contact (jamais son adresse personnelle).
- [ ] **« Tes données, en clair »** (`Confidentialite`) et « Mentions légales », publiques, en trois langues, liées en bas de la page de présentation et de chaque email. Pour une liste, elle dit les stades du partage : ceux que je choisis dans « Qui voit ta liste ? » (« Qui je veux »), et toute personne qui a le lien si elle est ouverte à « Tout le monde ».
- [ ] **« Mes données »** dans « Mon compte » (`CompteDonnees`).
- [ ] **L'accès de dernier recours de l'organisateur**, dit sous « À qui tu offres » : un résultat à la fois, lu par tous les membres dans le journal ; et le dévoilement du tirage à tous. Aucun écran ne dit plus « même l'organisateur ne voit pas » sans cette précision, page de présentation comprise.
- [ ] **La CNIL**, sur les deux pages : « Si sa réponse ne te convient pas, tu peux saisir la CNIL », avec le lien.
- [ ] (en partie : la connexion et la création de compte) **Qui verra ce que j'écris** (README 23.3) : la ligne sous chaque champ de donnée personnelle. Passer en revue tout champ du code : la connexion et la création de compte, rejoindre un événement, ajouter une personne ou son adresse, inviter quelqu'un à tenir une liste, la fiche d'une personne d'une liste (un enfant : prénom, âge, tailles), les goûts de la fiche « Moi », « Mon compte ».
- [x] **« Une allergie… »** disparaît de l'exemple du champ « J'évite, ou j'ai déjà » : on n'invite pas à écrire des données de santé.
- [ ] **Le pied de chaque email** : refuser les emails (ticket 130), « Ce que l'application fait de tes données » ; l'email de connexion dit seulement pourquoi il part.
- [ ] **« Télécharger mes données »** (mon profil, mes événements, mes listes) et **« Supprimer mon compte »**. Supprimer un compte ne casse ni un Secret Santa en cours ni l'historique d'un événement : dire ce qui est effacé et ce qui est rendu anonyme.
- [ ] **Le retrait d'une personne sans compte**, sur demande : la marche à suivre pour le super-admin.
- [ ] **La purge** : une tâche planifiée. Un compte sans visite depuis trois ans reçoit un email qui prévient, puis est supprimé ; des anciens Secret Santa, il ne reste que ce qui sert à la règle « pas la même personne ».
- [ ] (en partie : une liste publique n'est déjà pas lisible par les moteurs de recherche, en-tête et balise `noindex`, vérifiés par `security.spec.ts`) **Les listes** : l'âge plutôt que la date de naissance là où il suffit ; un mot à celui qui rend publique une liste où figurent des enfants ; une liste publique n'est pas lisible par les moteurs de recherche.
- [ ] (brouillon écrit, à relire par Julien) **Le registre** : `docs/donnees-personnelles.md`, un tableau des traitements, et la marche à suivre en cas de fuite.

## Hors périmètre

- Les règles d'usage et les signalements (ticket 132).

## C'est fini quand

- [ ] Le fichier téléchargé contient tout ce que la page dit que l'application sait, et rien d'un autre compte.
- [ ] Supprimer un compte qui participe à un Secret Santa tiré ne change le résultat de personne.
- [ ] Les textes de `Confidentialite` ont été relus par Julien (le dire dans le compte rendu).
- [ ] `/controle` passe.

## Relu le 24 novembre 2026 (conception)

- Les règles d'écran d'aujourd'hui s'appliquent (`docs/spec/v3/regles-d-ecran.md`) : « Mes données » dans « Mon compte » est une ligne qui ouvre sa page ; « Supprimer mon compte » se confirme sur une page, en recopiant un mot si l'on veut un garde-fou ; aucun champ dans un panneau.
- « Qui verra ce que j'écris » : sur une ligne qui s'écrit sur place, la phrase se dit sous la ligne, pendant qu'on écrit seulement.

## Compte rendu

**Commencé le 25 novembre 2026, en fin de séance, sans l'adresse de contact** : aucune page qui en a besoin n'est faite. `Confidentialite`, « Mentions légales » et `CompteDonnees` (qui porte « Télécharger mes données », « Supprimer mon compte », et la ligne « Une question ? Écris à Julien ») attendent l'adresse ; la purge et la suppression d'un compte vont avec eux (la même migration, ce qui est rendu anonyme). Les textes de ces pages restent à faire relire par Julien : ce compte rendu ne dit nulle part qu'ils sont « conformes ».

Fait :
- **« Une allergie… »** sort de l'exemple de « J'évite, ou j'ai déjà » : « Ce que tu n'aimes pas, ce que tu as en trop… », comme le dit le README 22.26, en trois langues.
- **Qui verra ce que j'écris, à la connexion** (`Connexion`, `ConnexionCreer`) : sous l'adresse, « Ton adresse sert à te connecter et à te prévenir. Les organisateurs des événements que tu rejoins la voient, personne d'autre. » ; sous le prénom, « Celui que verront les autres dans tes Secret Santa. ». Le lien « Tes données, en clair » de la maquette attend sa page (noté dans `ECARTS-MAQUETTES.md`). Les autres champs (`PersonneNouvelle`, `EnvoiAjouterEmail` avaient déjà leur ligne) restent à passer en revue.
- **Les moteurs de recherche** : une liste publique envoie déjà `X-Robots-Tag: noindex` et la balise `robots`, vérifiés par `tests/e2e/security.spec.ts`. Rien à changer.
- **Le registre**, en brouillon : `docs/donnees-personnelles.md`, les traitements (données, qui les voit, durées décidées), où sont les données, et la marche à suivre en cas de fuite. À relire par Julien.
- **Les phrases « personne, toi compris, ne voit »** des écrans de l'organisateur (`ConfirmerTirage`, le suivi : « Personne, organisateur compris, ne voit les résultats ici ») suivent leurs maquettes ; la page de présentation d'aujourd'hui n'en dit rien. Laissées telles quelles : la précision de l'accès de dernier recours viendra avec `Confidentialite` (« À qui tu offres ») et la nouvelle page de présentation.

Question : Q-044 (les services de notifications des téléphones, absents de « deux prestataires »).

Tests : `tests/e2e/account.spec.ts` lit la ligne sous l'adresse. `pnpm controle --e2e` passé.

**Reste** : tout ce qui n'est pas coché, dont les pages qui attendent l'adresse de contact.
