# 141 — V3 : la barre du partage en plus petit, et ses confirmations en niveaux

- **Dépend de** : 139
- **Avant** : la bascule (ticket 113), comme les 139 et 140. Validé par Julien le 23 novembre 2026 sur les maquettes.
- **Migration** : non
- **Maquettes** : les quatorze de la barre déroulée (`V3ListeQui`, `V3ListeQuiModifier`, `V3ListeQuiAjouter`, `V3ListeQuiSecret`, `V3ListeQuiLien`, `V3ListeLienNouveau`, `V3ListeInviter`, `V3ListeInviterEmail`, `V3ListeInviterReprendre`, `V3ListeInviteEnvoyee`, `V3ListeAideLien`), dont trois ont changé de forme : `V3ListeQuiRetirer`, `V3ListeQuiOuvrir`, `V3ListeLienChanger`

## Objectif

Retour de Julien, 23 novembre 2026, sur les maquettes du ticket 139, arrivé après son début : la barre est un espace restreint, tout doit y être un peu plus petit ; et les confirmations doivent passer par la navigation de la barre, comme « Quelqu'un d'autre ».

Si le ticket 139 n'est pas fini quand tu lis ceci, fais les deux d'un seul tenant.

## À lire d'abord

- `docs/spec/v3/listes.md` (« On reste dans la barre », « Tout y est un peu plus petit », « Resserrer le partage », « Changer de lien », « Tout le monde »)
- `docs/decisions/2026-11-22-qui-voit-ta-liste-deux-choix.md`

## À faire

- [x] **Les tailles de la barre**, d'après le tableau de la spec : boutons de 44 px, lignes de 48 px (texte en 15 px, icône de 28 px), pastilles de 36 px (texte en 14 px), les deux choix de 34 px, titres de niveau en 16 px, la ligne de l'adresse resserrée.
- [x] **Les champs de « Quelqu'un d'autre » sont des lignes** (`V3ListeInviter`, `V3ListeInviterEmail`) : « Prénom » et « Adresse email », le libellé à gauche, ce qu'on écrit à droite, 48 px, pas de cadre ; le texte écrit reste en 16 px pour qu'un iPhone ne zoome pas ; toucher la ligne met le curseur dans le champ.
- [x] **Des variantes des composants existants** (`UiSegmented`, `UiTextField`, les lignes, les boutons), pas des copies : une taille de plus, utilisée seulement dans la barre.
- [x] **Ce qu'on touche garde 44 px de haut**, par une marge invisible, sans que deux zones se recouvrent : pastilles, les deux choix, la croix d'une ligne. Un test le vérifie sur un écran de téléphone.
- [x] **Les coins s'emboîtent** : dans `UiSegmented` (partout dans l'application, pas seulement ici) et dans le champ de l'adresse, le rayon de la forme posée dedans est celui du fond moins la marge. Aujourd'hui le choix sélectionné est plus rond que son fond.
- [x] **Les messages restent en bas de l'écran** (« Invitation envoyée », « Nouveau lien créé »), même quand la barre est déroulée.
- [x] **La barre repliée** : son nom et sa phrase tiennent chacun sur une ligne, coupés par « … » s'ils sont trop longs (jamais deux lignes) ; « choisi par Camille » disparaît pour celui qui aide à écrire (`ListeAidePartage`), et son texte `lists.sharing.chosenBy` avec.
- [x] **Les trois confirmations deviennent des niveaux** de la navigation de la barre : « Retirer « Chez Mamie » ? », « Ouvrir à tout le monde ? », « Changer de lien ? ». Un titre précédé du retour, le texte, un seul bouton (« Retirer », « Ouvrir », « Changer »). Le retour annule ; plus de bouton « Annuler ». Le même glissement que pour « Quelqu'un d'autre ».
- [x] Les textes des confirmations suivent la spec (ils ont été resserrés).
- [x] Trois langues, `tests/e2e`.

## Hors périmètre

- Les tailles du reste de l'application.
- Ce que la barre contient, qui ne change pas.

## C'est fini quand

- [x] La barre déroulée d'une liste dans deux événements tient en moins de 420 px de haut sur un téléphone.
- [x] Retirer un événement passe par un niveau, et le retour annule.
- [x] Tout se touche au doigt : aucune zone de moins de 44 px.
- [x] Les maquettes sont reproduites.
- [x] `/controle` passe.

## Compte rendu

**Fait, d'un seul tenant avec le ticket 139** (son compte rendu dit le reste).

- **Les tailles** : lignes de 48 px, texte en 15 px, icônes de 28 px ; pastilles de 36 px, texte en 14 px ; les deux choix de 34 px ; titres de niveau en 16 px ; « Inviter » et la confirmation en boutons de 44 px ; la ligne de l'adresse resserrée (44 px).
- **Des variantes, pas des copies** : `UiSegmented` `size="sm"` ; `UiTextField` `inline` (une ligne de 48 px, le libellé à gauche en 15 px, le texte en 16 px, toucher la ligne met le curseur dans le champ) ; `UiCheckRow` `small`.
- **44 px à toucher** par une marge invisible (`after:`) : pastilles, les deux choix (posée sous leur texte, `isolate`), « Fermer », « Copier le lien » ; les croix et « ‹ » font 44 px. Un test Playwright le vérifie sur un écran de 390 px : chaque bouton et chaque choix répond à 21 px au-dessus et au-dessous de son milieu, et rien d'autre ne le couvre. Le même test mesure la barre d'une liste dans deux événements : moins de 420 px.
- **Les coins s'emboîtent** : dans `UiSegmented`, partout, le rayon d'un choix est celui du fond moins la marge (`calc(var(--radius-md) - …)`) ; « Copier le lien » dans le champ de l'adresse (16 px dehors, 4 px de marge, 12 px dedans).
- **Les messages en bas** : ils y sont toujours, sauf clavier ouvert (`app.vue`) ; après « Inviter », le clavier se ferme d'abord.
- **La barre repliée** : le nom et la phrase sur une ligne chacun, coupés par « … » ; « choisi par Camille » et `lists.sharing.chosenBy` partis (la prop `managerName` aussi).
- **Les trois confirmations sont des niveaux** (`ShareConfirm.vue`, `?partage=confirmer`) : un titre précédé du retour, le texte, un seul bouton ; le retour annule, le focus revient à ce qu'on avait touché ; plus d'« Annuler ». Les textes resserrés de la spec, dans les trois langues.

**Décidé seul** : voir le 139 et `ECARTS-MAQUETTES.md`.

**Questions posées** : Q-035, avec le 139.

**Migration** : aucune de plus que celle du 139.

**Contrôle** : celui du 139.

**Commits** : avec le 139.
