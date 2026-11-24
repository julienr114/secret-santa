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

- [ ] **Le panneau** (`UiSheet`) : titre « Lier à un Secret Santa » ; « Celui qui t'a tiré verra cette liste pour choisir ton cadeau. » ; une ligne par Secret Santa : la tuile de l'événement, son nom (le nom d'aujourd'hui dans les choix), une case à cocher native à droite. Toute la ligne coche.
- [ ] **Ce qu'il liste** : mes Secret Santa de l'année liés à cette liste (cochés), puis ceux que `linkChoicesOf` propose aujourd'hui (pas cochés). Celui qui est lié à une autre liste a un texte sous son nom : « Lié à « {liste} » ».
- [ ] **Cocher lie, décocher délie, tout de suite**, par les routes qui existent ; pas de bouton, le panneau reste ouvert. Message en bas : « Liste liée », « Liste déliée » ; quand le lien vient d'une autre liste : « Liste liée. « {liste} » ne l'est plus. ».
- [ ] **Deux entrées, le même panneau** : la pastille sous mon prénom, et « Lier à un Secret Santa » dans le menu « … » de ma partie (sa condition ne change pas).
- [ ] Retirer l'ancien panneau du lien (« Voir mon Secret Santa », « Délier ») et la question « Lier à ton Secret Santa ? » ; les textes `lists.link.*` qui ne servent plus s'en vont. Trois langues.
- [ ] Rien de ce qui touche au tirage n'est exposé : le panneau ne dit jamais qui m'a tiré, et seuls ceux qui tiennent la liste l'ouvrent.
- [ ] Tests (`tests/e2e/lists-draw.spec.ts`) : cocher, décocher, déplacer depuis une autre liste ; la pastille et le menu ouvrent le même panneau.

## Hors périmètre

- « Quelle liste pour ton Secret Santa ? », sur la page de mon Secret Santa : ne change pas.
- La croix de « Celui qui m'a tiré » dans « Qui voit ta liste ? » : ne change pas.

## C'est fini quand

- [ ] Depuis la pastille ou le menu, je vois mes Secret Santa de l'année et je lie ou délie d'un toucher.
- [ ] `/controle` passe.
