# 157 — La barre d'une liste : pas d'adresse quand le lien ne fait entrer personne, un Secret Santa se choisit à son nom

- **Dépend de** : 148
- **Avant** : la bascule (ticket 113)
- **Migration** : non
- **Maquettes** : `V3ListeQuiSecret` (seul celui qui m'a tiré), `V3ListeQui` (un brouillon), `V3ListeQuiAjouter` (les pastilles)

## Objectif

Julien, le 24 novembre 2026 : sur une liste que seul celui qui m'a tiré voit, la barre déroulée montre l'adresse et « Copier le lien ». Ça ne sert à rien : je ne sais pas qui m'a tiré, et personne d'autre ne peut ouvrir ce lien.

## À lire d'abord

- `docs/spec/v3/listes.md` : la barre du haut, « Dedans, dans cet ordre », le point 1 ; « Changer de lien » (la même condition)
- `app/components/lists/ShareBar.vue`, `SharingPanel.vue`

## À faire

- [x] L'adresse et « Copier le lien » ne sont dans la barre déroulée que si la liste est partagée avec un événement au moins, ou ouverte à tout le monde. La même condition que la ligne « Changer de lien » : une seule fonction pour les deux.
- [x] Sur un brouillon, ou sur une liste que seul celui qui m'a tiré voit : la barre déroulée commence par « Qui voit ta liste ? ».
- [x] Dès qu'on ajoute un événement (ou qu'on ouvre à tout le monde), l'adresse apparaît, tout de suite ; elle repart quand on retire le dernier.
- [x] Celui qui « aide à écrire » : quand il n'y a pas d'adresse, sa barre n'a pas de bouton.
- [x] **Un Secret Santa se choisit à son nom** (maquettes `V3ListeQui`, `V3ListeQuiAjouter`, `V3ListeQuiSecret`) : dans « Ajouter », la pastille « Celui qui m'a tiré » devient une pastille par Secret Santa pas encore lié, l'enveloppe et « Secret Santa · {événement} » (le texte de la pastille sous mon prénom). Dans « Qui je veux », la ligne a pour titre « Secret Santa · {événement} » et pour texte « Celui qui t'a tiré la voit » ; une ligne par Secret Santa lié, chaque croix ne délie que le sien. Trois langues.
- [x] **Plusieurs Secret Santa liés, et rien d'autre** : toujours pas d'adresse. La barre repliée écrit les noms des événements, séparés par une virgule, et « Seuls ceux qui t'ont tiré la voient ».
- [x] Tests : les quatre cas (brouillon, celui qui m'a tiré seul, plusieurs Secret Santa, un événement).

## C'est fini quand

- [x] Sur une liste liée à mon seul Secret Santa, plus d'adresse ni de « Copier le lien ».
- [x] `/controle` passe.

## Compte rendu

- **Une seule règle** : `linkLetsIn(stage)` (`server/utils/listSharing.ts`, testée) dit si le lien fait entrer quelqu'un : partagée avec un événement au moins, ou publique. La barre (`ShareBar`) n'écrit l'adresse et « Copier le lien » qu'alors ; « Changer de lien » (`SharingPanel`) suit la même fonction, sur le stade calculé du partage en cours (il dépendait avant du seul événement de la liste). Le stade change dès que le geste est enregistré : l'adresse apparaît avec le premier événement et repart avec le dernier.
- **Un brouillon, ou seul celui qui m'a tiré** : la barre déroulée commence par « Qui voit ta liste ? ». Elle prend le focus sur son contenu le temps que le panneau charge (il n'y a plus de bouton « Copier » à qui le donner).
- **Celui qui aide à écrire** : sans adresse, sa barre n'a pas de bouton.
- **Un Secret Santa à son nom** : `sharingOptions` donne `santaName`, calculé comme la pastille sous mon prénom et le panneau du ticket 155 (`invitePlace` et `subjectSantaName` : « Famille Camille », « Les enfants · Famille Camille »). Dans « Ajouter », une pastille par Secret Santa pas encore lié, l'enveloppe et « Secret Santa · … » ; chacune n'ajoute que le sien. Dans « Qui je veux », la ligne a ce titre et « Celui qui t'a tiré la voit » dessous ; chaque croix ne délie que le sien.
- **Plusieurs Secret Santa et rien d'autre** : pas d'adresse ; la barre repliée nomme les événements, séparés par une virgule (dans l'ordre où ils ont été liés), et « Seuls ceux qui t'ont tiré la voient ».
- Textes : `lists.sharing.giverSees`, `giversHint` ajoutés ; `giverOnly` (« Celui qui m'a tiré ») supprimé. Trois langues.
- **Tests** : `listSharing.test.ts` (`linkLetsIn`, `santaName`) ; Playwright, les quatre cas : un brouillon (`lists.spec.ts`), seul celui qui m'a tiré puis avec l'événement puis de nouveau seul (`participant.spec.ts`), plusieurs Secret Santa, leurs lignes, une croix et une pastille (`lists-draw.spec.ts`) ; celui qui aide à écrire sur un brouillon, sans bouton (`lists-invite.spec.ts`).
- Écart noté dans `ECARTS-MAQUETTES.md` (`V3ListeQuiAjouter`, `V3ListeQuiSecret`).
- Contrôle : `pnpm controle` et ces quatre specs ; le Playwright complet tourne à la fin du 158.

