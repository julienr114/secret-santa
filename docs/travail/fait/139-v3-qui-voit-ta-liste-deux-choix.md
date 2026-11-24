# 139 — V3 : « Qui voit ta liste ? », deux choix, et seulement ceux qui la voient

- **Dépend de** : 138
- **Migration** : à voir (si « Celui qui m'a tiré » et « Tous les membres » d'un même événement ne peuvent pas être vrais ensemble aujourd'hui)
- **Maquettes** : `V3ListeQui`, `V3ListeQuiModifier`, `V3ListeQuiAjouter`, `V3ListeQuiSecret`, `V3ListeQuiRetirer`, `V3ListeQuiOuvrir`, `V3ListeQuiLien`, `V3ListeLienChanger`, `V3ListeLienNouveau`, `V3ListeInviter`, `V3ListeInviterEmail`, `V3ListeInviterReprendre`, `V3ListeInviteEnvoyee`

## Objectif

Retour de Julien, 22 novembre 2026, après avoir essayé : le contenu de la barre déroulée est incompréhensible, tout y est à la fois. On le refait autour de deux choix, et on ne montre que ce qui est.

## À lire d'abord

- `docs/decisions/2026-11-22-qui-voit-ta-liste-deux-choix.md`
- `docs/spec/v3/listes.md` (« La barre du haut d'une liste », « Qui voit ta liste ? », « Resserrer le partage », « Inviter quelqu'un »)
- `app/components/lists/ShareBar.vue`, `app/components/lists/SharingPanel.vue`, `app/pages/listes/[id]/inviter/`, `app/pages/listes/[id]/message.vue`

## À faire

- [x] **Le titre « Qui voit ta liste ? »** et, dessous, `UiSegmented` à deux choix : « Qui je veux », « Tout le monde ».
- [x] **« Qui je veux »** : une ligne par événement où la liste est partagée (« 12 membres ») et par Secret Santa auquel ma partie est liée (« Celui qui m'a tiré » · « Secret Santa · Famille Camille »), chacune avec une croix « Retirer ». Rien d'autre.
- [x] **« Ajouter »** : une ligne qui se déroule sur place (`aria-expanded`) en pastilles : mes autres événements, « Celui qui m'a tiré » (si je participe à un Secret Santa et que je figure dans la liste), « Quelqu'un d'autre ». Toucher une pastille l'ajoute tout de suite aux lignes du dessus. Sur un brouillon, « Ajouter » est déjà ouvert.
- [x] **« Celui qui m'a tiré » et l'événement sont deux lignes** qui peuvent être là ensemble : plus de choix à deux sous un événement.
- [x] **« Quelqu'un d'autre »** n'est proposé que si la liste est partagée avec les membres de son événement. « Une autre occasion » et « Inviter quelqu'un » quittent le premier niveau de la barre.
- [x] **On ne quitte pas la barre pour inviter** (Julien, 23 novembre) : la barre déroulée a une navigation à elle (`docs/spec/v3/listes.md`, « On reste dans la barre »). L'en-tête (le stade, « Fermer ») ne bouge pas ; dessous, le contenu glisse vers un niveau plus loin, qui a un titre précédé d'un retour ; l'adresse à copier n'est qu'au premier niveau.
- [x] **Le mouvement** : le niveau où l'on va arrive par la droite, l'autre part par la gauche, la hauteur de la barre suit, un quart de seconde ; l'inverse au retour ; rien ne glisse avec `prefers-reduced-motion`. Le focus va au titre du niveau où l'on arrive, et revient à ce qu'on avait touché au retour.
- [x] **« Quelqu'un d'autre »** (`V3ListeInviter`, `V3ListeInviterEmail`) : un niveau, « Son prénom », « Son adresse email », « Inviter » (éteint tant qu'il manque quelque chose), puis la ligne « Reprendre ceux d'un autre événement ». « Inviter » ramène au premier niveau, avec un membre de plus et « Invitation envoyée » (`V3ListeInviteEnvoyee`).
- [x] **« Reprendre ceux d'un autre événement »** (`V3ListeInviterReprendre`) : un deuxième niveau, mes autres événements en pastilles, leurs membres à cocher, « Inviter · 3 personnes ».
- [x] **Les pages `/listes/…/inviter`** (`index`, `email`, `reprendre`) disparaissent : leurs règles passent dans la barre, leurs adresses mènent à la liste. « Une autre occasion » n'est plus proposé depuis une liste, et « Copier le lien » n'est plus une ligne de l'invitation.
- [x] « Fermer », toucher en dehors et Échap replient d'où que l'on soit ; rouverte, la barre est au premier niveau. Le retour du téléphone recule d'un niveau avant de quitter la liste.
- [x] **« Tout le monde »** : le toucher demande d'abord (« Ouvrir ta liste à tout le monde ? »). Une fois publique, une seule ligne, « Changer de lien ». Revenir à « Qui je veux » retrouve ceux qui y étaient, avec la confirmation de « Resserrer le partage ».
- [x] **Plus de bouton « Enregistrer »** : chaque geste s'enregistre tout de suite, la phrase de la barre suit. Une croix ne demande confirmation que si quelqu'un perd l'accès.
- [x] **« Changer de lien »** : en dernière ligne dès que le lien fait entrer quelqu'un (publique, ou partagée avec son événement) ; après « Changer », la nouvelle adresse est dans la barre et le message « Nouveau lien créé » s'affiche.
- [x] **Supprimer « Le message qui accompagne le lien »** : la ligne, la page `message.vue`, `useListMessage`, leurs textes et leurs tests, s'ils ne servent plus à rien d'autre.
- [x] Trois langues, `tests/e2e`, les textes qui ne servent plus retirés.

## Hors périmètre

- La barre repliée et la façon dont elle se déroule (tickets 135 et 138).
- Les règles d'accès, qui ne changent pas : qui entre par le lien, les 30 membres.
- Montrer dans l'encart une invitation en attente.

## C'est fini quand

- [x] Sur une liste partagée dans deux événements, l'encart montre deux lignes, « Ajouter » et « Changer de lien », rien d'autre.
- [x] Ajouter un événement, en retirer un, passer à « Tout le monde » et en revenir se font sans bouton « Enregistrer », et la barre dit le bon nombre de membres à chaque fois.
- [x] Inviter quelqu'un par son adresse, ou trois personnes d'un autre événement, se fait sans quitter la liste, et le retour ramène d'un niveau à chaque fois.
- [x] Les treize maquettes sont reproduites.
- [x] `/controle` passe.

## Compte rendu

**Fait, d'un seul tenant avec le ticket 141** (arrivé pendant celui-ci : les confirmations y deviennent des niveaux de la barre, tout y est plus petit). Le compte rendu commun est ici ; celui du 141 dit ce qui lui est propre.

- **« Celui qui m'a tiré » et l'événement ensemble : migration `0043_v3_giver_with_members`.** Une ligne de `gift_list_parties` par liste et par événement ne pouvait pas dire les deux. Elle gagne `giver` (vrai pour les lignes `visibility = 'giver'` qui existent) : `visibility` dit toujours qui entre (tous les membres, ou seulement celui qui a tiré), `giver` dit que la ligne « Celui qui m'a tiré » est là. `saveSharing` écrit les deux, `giveListToDraw` met `giver` sans rien retirer. Rien ne change pour qui entre. Testé (`listSharing.test.ts`, `migrations.test.ts`, la comparaison de toute la V3 comprise). Appliquée en local seulement.
- **« Qui voit ta liste ? »** (`SharingPanel.vue`) : le titre, `UiSegmented` « Qui je veux » / « Tout le monde » ; sous « Qui je veux », une ligne par événement où elle est partagée (« 12 membres ») et une par « Celui qui m'a tiré » (« Secret Santa · Famille Camille »), chacune avec sa croix ; « Ajouter » (`aria-expanded`) en pastilles : « Celui qui m'a tiré » (si je participe à un Secret Santa et que je figure dans la liste : `amOnList`, nouveau champ `onList` de `GET …/sharing`), mes autres événements, « Quelqu'un d'autre » (si la liste est partagée avec son événement). Ouvert d'office sur un brouillon, et tant qu'on ajoute. Chaque geste s'enregistre tout de suite (`PUT …/sharing`, l'état affiché d'avance) ; la phrase de la barre suit. « Changer de lien » en dernière ligne dès que le lien fait entrer quelqu'un. Les lignes et les pastilles viennent de `sharingView` et `sharingAsk` (fonctions pures, testées).
- **La navigation de la barre** (`ShareBar.vue`) : `?partage=inviter`, `reprendre`, `confirmer` (`shareLevelOf`, `shareDepth`, testées). L'en-tête reste ; le niveau suivant arrive par la droite, la hauteur suit, un quart de seconde, rien ne glisse avec `prefers-reduced-motion` ; le focus va au titre du niveau, et revient à ce qu'on avait touché au retour. « ‹ » et le retour du téléphone reculent d'un niveau ; « Fermer », toucher en dehors et Échap replient d'où que l'on soit, et la barre rouverte est au premier niveau, ce qu'on écrivait oublié.
- **« Quelqu'un d'autre »** (`ShareInvite.vue`) et **« Reprendre ceux de »** (`ShareTake.vue`, un seul événement choisi, ses membres avec une adresse cochés, les autres à case vide ; `peopleToTake`, sortie de `TakeFromEvents` et testée) ramènent au premier niveau avec « Invitation envoyée » / « 3 invitations envoyées ».
- **Partis** : les pages `/listes/[id]/inviter` (et `email`, `reprendre`) et `/listes/[id]/message`, leurs adresses menant à la liste (`gonePathOf`, testé) ; `useListMessage` ; « Une autre occasion » depuis une liste (`shareInto`, le cas `liste=` de `/e/nouvelle`) ; les textes qui ne servaient plus (`lists.sharing.eventLine`, `allMembers`, `audienceLabel`, `otherOccasion`, `invite`, `message`, `save`, `lists.share.message`, `me`, `footer`, `personalize*`, `lists.inviteMembers.title`, `subtitle`, `copy`, `byEmail`, `byEmailHint`, `closed`). « À ma liste » des Membres mène à la liste, la barre déroulée sur « Quelqu'un d'autre ».
- **Tests** : Vitest (`sharingView`, `sharingAsk`, `peopleToTake`, `shareLevelOf`, `shareDepth`, `gonePathOf`, `saveSharing`, la migration) ; Playwright : `lists-sharing` (ajouter deux événements sans « Enregistrer », retirer avec sa question et le retour qui annule), `lists` (« Tout le monde », sa question, le retour, « Changer de lien »), `participant` (« Celui qui m'a tiré » et l'événement ensemble), `membership` (inviter sans quitter la liste ; « Reprendre ceux de », le retour du téléphone, « Fermer » d'un niveau), `lists-share-bar`, `lists-resume`, `lists-invite`.

**Décidé seul, et pourquoi** (détail dans `ECARTS-MAQUETTES.md`, section des tickets 139 et 141) : la migration (le ticket la laissait « à voir ») ; la pastille « Celui qui m'a tiré » ajoute tous les Secret Santa où je participe et qu'elle n'a pas, et ni l'ajouter ni le retirer ne demande ; les confirmations ont une adresse, pour que le retour du téléphone les annule ; « À ma liste » ouvre la barre sur « Quelqu'un d'autre ».

**Questions posées** : Q-035 (« Il reçoit un email à ton nom » et les tournures neutres) ; le texte de la spec est codé en attendant.

**Migration** : `0043_v3_giver_with_members`, appliquée en local (`pnpm db:migrate:local`). Elle part avec la bascule : `bascule-v3.md` et le ticket 113 disent maintenant `0034` à `0043`.

**Contrôle** : `pnpm controle --e2e` passe en entier (trois langues, mots interdits, textes en dur, lint, typecheck, 983 tests Vitest, 203 tests Playwright).

**Commits** : `75adde2` et `49e07f7` (le travail de la conception, tel quel) ; `docs: ticket 139 started`  ; `d4fb347` feat(lists): who sees your list, two choices, in a smaller bar with levels ; et celui qui range les deux tickets.
