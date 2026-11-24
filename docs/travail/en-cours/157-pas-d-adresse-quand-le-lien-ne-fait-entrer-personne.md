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

- [ ] L'adresse et « Copier le lien » ne sont dans la barre déroulée que si la liste est partagée avec un événement au moins, ou ouverte à tout le monde. La même condition que la ligne « Changer de lien » : une seule fonction pour les deux.
- [ ] Sur un brouillon, ou sur une liste que seul celui qui m'a tiré voit : la barre déroulée commence par « Qui voit ta liste ? ».
- [ ] Dès qu'on ajoute un événement (ou qu'on ouvre à tout le monde), l'adresse apparaît, tout de suite ; elle repart quand on retire le dernier.
- [ ] Celui qui « aide à écrire » : quand il n'y a pas d'adresse, sa barre n'a pas de bouton.
- [ ] **Un Secret Santa se choisit à son nom** (maquettes `V3ListeQui`, `V3ListeQuiAjouter`, `V3ListeQuiSecret`) : dans « Ajouter », la pastille « Celui qui m'a tiré » devient une pastille par Secret Santa pas encore lié, l'enveloppe et « Secret Santa · {événement} » (le texte de la pastille sous mon prénom). Dans « Qui je veux », la ligne a pour titre « Secret Santa · {événement} » et pour texte « Celui qui t'a tiré la voit » ; une ligne par Secret Santa lié, chaque croix ne délie que le sien. Trois langues.
- [ ] **Plusieurs Secret Santa liés, et rien d'autre** : toujours pas d'adresse. La barre repliée écrit les noms des événements, séparés par une virgule, et « Seuls ceux qui t'ont tiré la voient ».
- [ ] Tests : les quatre cas (brouillon, celui qui m'a tiré seul, plusieurs Secret Santa, un événement).

## C'est fini quand

- [ ] Sur une liste liée à mon seul Secret Santa, plus d'adresse ni de « Copier le lien ».
- [ ] `/controle` passe.
