# 117 — V3 : on entre dans un événement par un Secret Santa ou par une liste

- **Dépend de** : 106, 116
- **Migration** : oui (par où chaque membre est entré)
- **Maquettes** : `V3FeteMembres`, `V3FeteMembresComplet`, `V3FeteMembresReprendre`, `V3FeteNouvelle`, `AjouterParticipants`, `V3ListeQui`, `V3ListeQuiModifier`, `V3ListeInviter`, `V3ListePartageEmail`, `V3ListeFermee`, `V3ListeFermeeConnecte`

## Objectif

On n'ajoute plus personne à un événement. On y entre par un de ses Secret Santa (son organisateur m'y met, ou je m'inscris par son lien) ou par une de ses listes (on m'y invite, ou j'ouvre son lien). La page « Membres » montre qui est là et par où, et ce qu'on y ajoute va toujours à un Secret Santa ou à une liste.

## À lire d'abord

- `docs/decisions/2026-11-21-on-entre-par-un-secret-santa-ou-par-une-liste.md`
- `docs/spec/v3/modele.md` (« Deux sortes de personnes »)
- `docs/spec/v3/fete.md` (« Les membres », « 30 membres au plus », « Inviter, rejoindre »)
- `docs/spec/v3/secret-santa.md` (« Choisir les participants »)
- `docs/spec/v3/listes.md` (« Inviter quelqu'un », « Arriver par le lien »)
- `docs/spec/v3/accueil-et-creation.md` (« Une autre occasion »)

## À faire

- [ ] **Le cœur, en fonctions pures**, testé d'abord : qui est membre d'un événement et par où ; ce que fait l'ouverture du lien d'une liste selon son stade, son événement, la place qui reste et qui je suis.
- [ ] **Base** : par où chaque membre est entré (un Secret Santa, une liste, les deux). La migration garde tous les membres d'aujourd'hui : ceux d'un Secret Santa par lui ; les autres restent membres, sans rien sous leur prénom.
- [ ] **Créer un événement** ne demande plus qui en fait partie (`V3FeteNouvelle` mène droit au Secret Santa ou à la liste). L'étape « membres » et sa page disparaissent.
- [ ] **« Choisir les participants »** (`AjouterParticipants`) : « Reprendre ceux d'un autre événement », et sa page « Qui reprendre ? » (`V3FeteMembresReprendre`).
- [ ] **« Membres »** (`V3FeteMembres`) : par où chacun est entré ; plus de « Ajouter une personne » ni de `/e/[événement]/membres/nouvelle` ; la section « Ajouter quelqu'un », avec « Au Secret Santa » et « À ma liste » selon ce que je peux faire. Complet : `V3FeteMembresComplet`.
- [ ] **« Inviter quelqu'un »** sur une liste (`V3ListeQui`, `V3ListeInviter`) : copier le lien, par son adresse email, reprendre ceux d'un autre événement. Seulement pour celui qui gère la liste, et seulement si elle est partagée avec tous les membres de son événement.
- [ ] **L'email** à celui qu'on invite par son adresse (`V3ListePartageEmail`), dans les trois langues, avec le pied des autres emails.
- [ ] **Le lien d'une liste fait entrer** : connecté, pas membre, liste partagée avec tous les membres de son événement, il reste de la place → je deviens membre et elle s'ouvre. Sinon `V3ListeFermee` ou `V3ListeFermeeConnecte`.
- [ ] « Changer de lien » pour toute liste, pas seulement une liste publique.
- [ ] Trois langues. `docs/refonte/ECARTS-MAQUETTES.md` et `docs/ARBORESCENCE.md` à jour.

## Hors périmètre

- Le lien d'invitation d'un Secret Santa (ticket 116).
- Faire entrer quelqu'un dans un autre événement que celui de la liste.
- Dire à celui qui gère la liste qui est entré par son lien, ailleurs que sur « Membres ».

## C'est fini quand

- [ ] Aucune route n'ajoute un membre à un événement sans passer par un Secret Santa ou une liste (un test le vérifie).
- [ ] Ouvrir le lien d'un brouillon, ou d'une liste réservée à celui qui a tiré, ne fait entrer personne ; ouvrir celui d'une liste partagée avec les membres de son événement fait entrer, jusqu'à 30.
- [ ] Une liste partagée dans deux événements ne fait entrer que dans le sien.
- [ ] Après la migration, personne n'a perdu l'accès à un événement (un test sur des données d'essai).
- [ ] Les maquettes du ticket sont reproduites.
- [ ] `/controle` passe.

## Compte rendu

À remplir par Claude Code à la fin : ce qui a été fait, ce qui a été décidé seul (et pourquoi), les écarts avec les maquettes, les questions posées, les commits.
