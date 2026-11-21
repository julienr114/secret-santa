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

- [ ] **Julien** : décider les durées qui restent (le journal, les empreintes de blocage) ; relire la liste du README 22.26 et le texte de `Confidentialite` ; créer l'adresse de contact (jamais son adresse personnelle).
- [ ] **« Tes données, en clair »** (`Confidentialite`) et « Mentions légales », publiques, en trois langues, liées en bas de la page de présentation et de chaque email. Pour une liste, elle dit les stades du partage : ceux que je choisis dans « Qui verra ta liste ? », et toute personne qui a le lien si elle est publique.
- [ ] **« Mes données »** dans « Mon compte » (`CompteDonnees`).
- [ ] **L'accès de dernier recours de l'organisateur**, dit sous « À qui tu offres » : un résultat à la fois, lu par tous les membres dans le journal ; et le dévoilement du tirage à tous. Aucun écran ne dit plus « même l'organisateur ne voit pas » sans cette précision, page de présentation comprise.
- [ ] **La CNIL**, sur les deux pages : « Si sa réponse ne te convient pas, tu peux saisir la CNIL », avec le lien.
- [ ] **Qui verra ce que j'écris** (README 23.3) : la ligne sous chaque champ de donnée personnelle. Passer en revue tout champ du code : la connexion et la création de compte, rejoindre un événement, ajouter une personne ou son adresse, inviter quelqu'un à tenir une liste, la fiche d'une personne d'une liste (un enfant : prénom, âge, tailles), les goûts de la fiche « Moi », « Mon compte ».
- [ ] **« Une allergie… »** disparaît de l'exemple du champ « J'évite, ou j'ai déjà » : on n'invite pas à écrire des données de santé.
- [ ] **Le pied de chaque email** : refuser les emails (ticket 130), « Ce que l'application fait de tes données » ; l'email de connexion dit seulement pourquoi il part.
- [ ] **« Télécharger mes données »** (mon profil, mes événements, mes listes) et **« Supprimer mon compte »**. Supprimer un compte ne casse ni un Secret Santa en cours ni l'historique d'un événement : dire ce qui est effacé et ce qui est rendu anonyme.
- [ ] **Le retrait d'une personne sans compte**, sur demande : la marche à suivre pour le super-admin.
- [ ] **La purge** : une tâche planifiée. Un compte sans visite depuis trois ans reçoit un email qui prévient, puis est supprimé ; des anciens Secret Santa, il ne reste que ce qui sert à la règle « pas la même personne ».
- [ ] **Les listes** : l'âge plutôt que la date de naissance là où il suffit ; un mot à celui qui rend publique une liste où figurent des enfants ; une liste publique n'est pas lisible par les moteurs de recherche.
- [ ] **Le registre** : `docs/donnees-personnelles.md`, un tableau des traitements, et la marche à suivre en cas de fuite.

## Hors périmètre

- Les règles d'usage et les signalements (ticket 132).

## C'est fini quand

- [ ] Le fichier téléchargé contient tout ce que la page dit que l'application sait, et rien d'un autre compte.
- [ ] Supprimer un compte qui participe à un Secret Santa tiré ne change le résultat de personne.
- [ ] Les textes de `Confidentialite` ont été relus par Julien (le dire dans le compte rendu).
- [ ] `/controle` passe.

## Compte rendu

À remplir par Claude Code à la fin : ce qui a été fait, ce qui a été décidé seul (et pourquoi), les écarts avec les maquettes, les questions posées, les commits.
