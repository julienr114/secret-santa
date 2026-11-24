# 155 — Un seul panneau pour lier et délier : mes Secret Santa, à cocher

- **Dépend de** : 153
- **Avant** : la bascule (ticket 113)
- **Migration** : non
- **Maquettes** : `V3ListeSecretLie` (ouvert par la pastille, un coché), `V3ListeSecretLierConfirmer` (ouvert par le menu, un lié à une autre liste)

## Objectif

Julien, le 24 novembre 2026 : la question « Lier à ton Secret Santa ? » et le panneau de la pastille (« Voir mon Secret Santa », « Délier ») deviennent un seul panneau, la liste de mes Secret Santa de l'année, liés ou non à cette liste, à cocher. On lie et on délie au même endroit.

## À lire d'abord

- `docs/spec/v3/listes.md` : « Lier et délier »
- ce que les tickets 148 et 153 ont codé : `ListsDrawLink`, `linkChoicesOf`, `linkDraw`, `unlinkDraw`, `PUT` et `DELETE /api/lists/[id]/draw/[partyId]`

## À faire

- [x] **Le panneau** (`UiSheet`) : titre « Lier à un Secret Santa » ; « Celui qui t'a tiré verra cette liste pour choisir ton cadeau. » ; une ligne par Secret Santa : la tuile de l'événement, son nom (le nom d'aujourd'hui dans les choix), une case à cocher native à droite. Toute la ligne coche.
- [x] **Ce qu'il liste** : mes Secret Santa de l'année liés à cette liste (cochés), puis ceux que `linkChoicesOf` propose aujourd'hui (pas cochés). Celui qui est lié à une autre liste a un texte sous son nom : « Lié à « {liste} » ».
- [x] **Cocher lie, décocher délie, tout de suite**, par les routes qui existent ; pas de bouton, le panneau reste ouvert. Message en bas : « Liste liée », « Liste déliée » ; quand le lien vient d'une autre liste : « Liste liée. « {liste} » ne l'est plus. ».
- [x] **Deux entrées, le même panneau** : la pastille sous mon prénom, et « Lier à un Secret Santa » dans le menu « … » de ma partie (sa condition ne change pas).
- [x] Retirer l'ancien panneau du lien (« Voir mon Secret Santa », « Délier ») et la question « Lier à ton Secret Santa ? » ; les textes `lists.link.*` qui ne servent plus s'en vont. Trois langues.
- [x] Rien de ce qui touche au tirage n'est exposé : le panneau ne dit jamais qui m'a tiré, et seuls ceux qui tiennent la liste l'ouvrent.
- [x] Tests (`tests/e2e/lists-draw.spec.ts`) : cocher, décocher, déplacer depuis une autre liste ; la pastille et le menu ouvrent le même panneau.

## Hors périmètre

- « Quelle liste pour ton Secret Santa ? », sur la page de mon Secret Santa : ne change pas.
- La croix de « Celui qui m'a tiré » dans « Qui voit ta liste ? » : ne change pas.

## C'est fini quand

- [x] Depuis la pastille ou le menu, je vois mes Secret Santa de l'année et je lie ou délie d'un toucher.
- [x] `/controle` passe.

## Compte rendu

- **Un seul panneau** (`ListsDrawLink`) : titre « Lier à un Secret Santa », « Celui qui t'a tiré verra cette liste pour choisir ton cadeau. », puis mes Secret Santa de l'année, une ligne chacun (`UiCheckRow`, qui prend maintenant la tuile de l'événement à la place de l'icône par l'emplacement `leading`) : d'abord ceux liés à cette liste, cochés, puis ceux de `linkChoicesOf`, pas cochés ; « Lié à « Noël 2026 » » sous le nom de celui qui est lié à une autre liste.
- **Cocher lie, décocher délie, tout de suite**, par `PUT` et `DELETE /api/lists/[id]/draw/[partyId]` ; la case suit le geste jusqu'à la relecture de la liste, et revient en cas d'échec. Messages : « Liste liée », « Liste déliée », « Liste liée. « Noël 2026 » ne l'est plus. ». Le panneau reste ouvert.
- **Deux entrées** : la pastille et le menu « … » de ma partie ouvrent le même panneau (`ask()`). Pour celui qui ne gère pas la liste, la pastille ne s'ouvre pas.
- `linkChoicesOf` donne aussi la catégorie et l'emoji de l'événement, pour la tuile. Rien sur le tirage : ni qui m'a tiré, ni lien vers ma page.
- **Retirés** : l'ancien panneau de la pastille (« Voir mon Secret Santa », « Délier ») et la question « Lier à ton Secret Santa ? ». Clés supprimées : `lists.link.what`, `see`, `unlink`, `askTitle`, `ask`, `moves`, `submit` ; ajoutées : `intro`, `linkedTo`, `linked`, `linkedMoved`. Trois langues.
- **Décidé seul, question posée (Q-037)** : l'entrée du menu suit la spec, « un Secret Santa tiré qui n'est pas lié à cette liste », et non la condition d'avant (« n'a aucune liste ») que le ticket gardait. Sans cela, un Secret Santa lié ailleurs ne pouvait pas être déplacé depuis une autre liste, ce que le ticket demande pourtant.
- **Tests** (`tests/e2e/lists-draw.spec.ts`) : la pastille ouvre le panneau, Famille Lilas cochée, aucun lien ; décocher délie (le panneau reste ouvert), cocher depuis le menu relie ; sur une autre liste, la ligne dit « Lié à « Idées pour le Secret Santa » » et la cocher déplace le lien avec son message ; avec un deuxième Secret Santa, les deux lignes et la case à cocher.
- Écarts notés dans `ECARTS-MAQUETTES.md` (`V3ListeSecretLie`, `V3ListeSecretLier`, `V3ListeSecretLierConfirmer`).
- Contrôle : `pnpm controle` et `lists-draw.spec.ts` ; le Playwright complet tourne à la fin des trois tickets (156).

