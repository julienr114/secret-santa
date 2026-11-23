# 139 — V3 : « Qui voit ta liste ? », deux choix, et seulement ceux qui la voient

- **Dépend de** : 138
- **Migration** : à voir (si « Celui qui m'a tiré » et « Tous les membres » d'un même événement ne peuvent pas être vrais ensemble aujourd'hui)
- **Maquettes** : `V3ListeQui`, `V3ListeQuiModifier`, `V3ListeQuiAjouter`, `V3ListeQuiSecret`, `V3ListeQuiRetirer`, `V3ListeQuiOuvrir`, `V3ListeQuiLien`, `V3ListeLienChanger`, `V3ListeLienNouveau`, `V3ListeInviter`, `V3ListeInviterEmail`, `V3ListeInviteEnvoyee`

## Objectif

Retour de Julien, 22 novembre 2026, après avoir essayé : le contenu de la barre déroulée est incompréhensible, tout y est à la fois. On le refait autour de deux choix, et on ne montre que ce qui est.

## À lire d'abord

- `docs/decisions/2026-11-22-qui-voit-ta-liste-deux-choix.md`
- `docs/spec/v3/listes.md` (« La barre du haut d'une liste », « Qui voit ta liste ? », « Resserrer le partage », « Inviter quelqu'un »)
- `app/components/lists/ShareBar.vue`, `app/components/lists/SharingPanel.vue`, `app/pages/listes/[id]/inviter/`, `app/pages/listes/[id]/message.vue`

## À faire

- [ ] **Le titre « Qui voit ta liste ? »** et, dessous, `UiSegmented` à deux choix : « Qui je veux », « Tout le monde ».
- [ ] **« Qui je veux »** : une ligne par événement où la liste est partagée (« 12 membres ») et par Secret Santa auquel ma partie est liée (« Celui qui m'a tiré » · « Secret Santa · Famille Camille »), chacune avec une croix « Retirer ». Rien d'autre.
- [ ] **« Ajouter »** : une ligne qui se déroule sur place (`aria-expanded`) en pastilles : mes autres événements, « Celui qui m'a tiré » (si je participe à un Secret Santa et que je figure dans la liste), « Quelqu'un d'autre ». Toucher une pastille l'ajoute tout de suite aux lignes du dessus. Sur un brouillon, « Ajouter » est déjà ouvert.
- [ ] **« Celui qui m'a tiré » et l'événement sont deux lignes** qui peuvent être là ensemble : plus de choix à deux sous un événement.
- [ ] **« Quelqu'un d'autre »** n'est proposé que si la liste est partagée avec les membres de son événement ; il ouvre la page « Inviter quelqu'un », qui gagne la ligne « Dans une autre occasion ». « Une autre occasion » et « Inviter quelqu'un » quittent l'encart.
- [ ] **« Par son adresse email »** (`V3ListeInviterEmail`) : la page comme sur la maquette ; au retour sur la liste, le message « Invitation envoyée ».
- [ ] **« Tout le monde »** : le toucher demande d'abord (« Ouvrir ta liste à tout le monde ? »). Une fois publique, une seule ligne, « Changer de lien ». Revenir à « Qui je veux » retrouve ceux qui y étaient, avec la confirmation de « Resserrer le partage ».
- [ ] **Plus de bouton « Enregistrer »** : chaque geste s'enregistre tout de suite, la phrase de la barre suit. Une croix ne demande confirmation que si quelqu'un perd l'accès.
- [ ] **« Changer de lien »** : en dernière ligne dès que le lien fait entrer quelqu'un (publique, ou partagée avec son événement) ; après « Changer », la nouvelle adresse est dans la barre et le message « Nouveau lien créé » s'affiche.
- [ ] **Supprimer « Le message qui accompagne le lien »** : la ligne, la page `message.vue`, `useListMessage`, leurs textes et leurs tests, s'ils ne servent plus à rien d'autre.
- [ ] Trois langues, `tests/e2e`, les textes qui ne servent plus retirés.

## Hors périmètre

- La barre repliée et la façon dont elle se déroule (tickets 135 et 138).
- Les règles d'accès, qui ne changent pas : qui entre par le lien, les 30 membres.
- Montrer dans l'encart une invitation en attente.

## C'est fini quand

- [ ] Sur une liste partagée dans deux événements, l'encart montre deux lignes, « Ajouter » et « Changer de lien », rien d'autre.
- [ ] Ajouter un événement, en retirer un, passer à « Tout le monde » et en revenir se font sans bouton « Enregistrer », et la barre dit le bon nombre de membres à chaque fois.
- [ ] Les douze maquettes sont reproduites.
- [ ] `/controle` passe.

## Compte rendu

À remplir par Claude Code à la fin : ce qui a été fait, ce qui a été décidé seul (et pourquoi), les écarts avec les maquettes, les questions posées, les commits.
