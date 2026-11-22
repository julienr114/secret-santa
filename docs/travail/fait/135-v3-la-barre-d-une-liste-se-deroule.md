# 135 — V3 : la barre du haut d'une liste, repliée, se déroule sur place

- **Dépend de** : 106
- **Migration** : non
- **Maquettes** : `V3ListeNouvelle`, `V3Liste`, `V3ListeSecret`, `V3ListePublique`, `ListeAidePartage` (repliée) ; `V3ListeQui`, `V3ListeQuiModifier`, `V3ListeQuiSecret`, `V3ListeQuiLien`, `V3ListeLienChanger`, `V3ListeQuiRetirer`, `V3ListeAideLien` (déroulée)

## Objectif

Retour de Julien, 22 novembre 2026, après avoir essayé : la barre prend trop de place avec l'adresse toujours affichée, et « Modifier » ouvre un panneau du bas alors que tout devrait être au même endroit. La barre devient une ligne ; son bouton la déroule là où elle est, et tout est dedans.

## À lire d'abord

- `docs/spec/v3/listes.md` (« La barre du haut d'une liste », « Qui verra ta liste ? », « Resserrer le partage »)
- `app/components/lists/ShareBar.vue`, `app/components/lists/SharingSheet.vue`

## À faire

- [x] **Repliée** : une ligne (l'icône, le stade, sa phrase, le bouton). Plus de ligne d'adresse. Elle reste collée sous la barre du haut, comme aujourd'hui.
- [x] **Le bouton la déroule sur place** : « Partager » (brouillon), « Modifier » (ensuite), « Le lien » (celui qui « aide à écrire »). Pas de panneau du bas, pas de voile : la liste est poussée vers le bas. **Déroulée, la barre reste collée en haut** (Julien, 22 novembre) ; si elle est plus haute que l'écran, c'est son contenu qui défile, pas la page. Le bouton devient « Fermer », qui replie sans rien changer.
- [x] **Dedans, d'abord l'adresse et « Copier le lien »** (« Copié », un instant, comme aujourd'hui).
- [x] **Puis « Qui verra ta liste ? »**, pour ceux qui gèrent la liste : le contenu de `SharingSheet` passe dans la barre, sans changer ses règles (les événements à cocher, « Une autre occasion », « Inviter quelqu'un », « Tout le monde, avec le lien », le bouton). Le bouton enregistre et replie la barre.
- [x] **« Tous les membres » / « Celui qui m'a tiré »** : le composant `UiSegmented`, pas des pastilles maison.
- [x] **Liste publique** : l'adresse n'est plus répétée sous l'interrupteur (elle est en haut de la barre déroulée). « Le message qui accompagne le lien » et « Changer de lien » restent.
- [x] **Les confirmations** (« Retirer ta liste de … ? », « Changer de lien ? ») s'affichent dans la barre déroulée, à la place du bouton.
- [x] **Celui qui « aide à écrire »** : « Le lien » déroule la barre, qui ne contient que l'adresse et « Copier le lien ».
- [x] Le clavier et les lecteurs d'écran : le bouton dit s'il est déroulé (`aria-expanded`), le focus entre dans la barre à l'ouverture et revient au bouton à la fermeture, Échap replie.
- [x] `SharingSheet` ne sert plus : le supprimer, et ses textes qui ne servent plus (« Copier », `lists.sharing.copy`).
- [x] Trois langues (« Fermer », « Le lien »), `tests/e2e` mis à jour.

## Hors périmètre

- Les règles du partage, qui ne changent pas.
- La page « Inviter quelqu'un » (`V3ListeInviter`), qui reste une page.

## C'est fini quand

- [x] Sur une liste, l'adresse n'est visible que la barre déroulée.
- [x] « Modifier » n'ouvre plus de panneau du bas ; on change le partage et on copie le lien au même endroit.
- [x] Celui qui « aide à écrire » peut copier le lien, et rien d'autre.
- [x] Sur un petit écran, avec dix événements, la barre déroulée reste en haut et on atteint « Enregistrer » en faisant défiler son contenu.
- [x] Les douze maquettes sont reproduites.
- [x] `/controle` passe.

## Compte rendu

**Fait.**

- **`ShareBar`** : repliée, une ligne (l'icône, le stade, sa phrase, le bouton), collée sous la barre du haut. Le bouton (« Partager », « Modifier », « Le lien ») la déroule sur place et devient « Fermer » ; déroulée, elle reste collée, sa hauteur est bornée à l'écran (moins la barre du haut, celle du bas et les marges) et c'est son contenu qui défile. Dedans : l'adresse et « Copier le lien » (« Copié », un instant), puis, pour qui gère la liste, « Qui verra ta liste ? ». `aria-expanded` et `aria-controls` sur le bouton, le focus entre sur « Copier le lien » et revient au bouton, Échap replie.
- **`SharingSheet` devient `SharingPanel`** (même règles) : plus de panneau ni de voile ; « Tous les membres » / « Celui qui m'a tiré » dans `UiSegmented` ; « Une autre occasion » (icône pointillée) et « Inviter quelqu'un » avec leur chevron ; l'interrupteur avec son globe ; l'adresse n'est plus sous l'interrupteur ; « Le message qui accompagne le lien » (liste publique) et « Changer de lien » (toute liste, ticket 117) restent. Le bouton enregistre et replie la barre. Les confirmations (retirer, « Tout le monde », changer de lien) s'affichent dans la barre, en `alertdialog`, à la place de ce qui suit, bouton compris.
- L'icône du stade est verte à tous les stades, brouillon compris, comme les maquettes (elle était grise pour un brouillon).
- Textes : `lists.sharing.close` (« Fermer »), `lists.sharing.theLink` (« Le lien ») en trois langues ; `lists.sharing.copy` supprimée.
- **Tests** : Playwright, nouveau `lists-share-bar.spec.ts` (320 × 568, dix événements : la barre reste en place, son contenu défile jusqu'à « Enregistrer », qui replie) ; `lists.spec.ts` (l'adresse seulement déroulée, `aria-expanded`, focus, Échap, pas de panneau, « Changer de lien » à la place du bouton) ; `lists-invite.spec.ts` (« Le lien » de qui aide à écrire : l'adresse et rien d'autre) ; `participant.spec.ts` (le choix à deux, « Fermer » ne change rien) ; `lists-sharing.spec.ts` (la confirmation remplace le bouton) ; `lists-resume.spec.ts`. Pas de fonction pure nouvelle.

**Décidé seul, et pourquoi.**

- La confirmation se place sous ce qu'on a touché et cache ce qui suit : c'est ce que montrent ensemble `V3ListeQuiRetirer` (sous les événements) et `V3ListeLienChanger` (sous l'interrupteur). Le focus va sur son « Annuler ».
- Le bouton « Retirer » / « Changer » est un bouton à contour corail, comme les maquettes (il était rouge plein dans le panneau).
- « Qui verra ta liste ? » lit le partage une fois, à l'ouverture : un rechargement en arrière-plan ne défait pas ce qu'on vient de cocher.
- Échap replie comme « Fermer », en oubliant ce qui n'est pas enregistré.

**Écarts avec les maquettes** : nouvelle section « La barre d'une liste se déroule (V3, ticket 135) » de `docs/refonte/ECARTS-MAQUETTES.md` ; les lignes des tickets 106, 107 et 117 qui parlaient du panneau sont mises à jour.

**Questions posées** : aucune.

**Migration** : aucune.

**Contrôle** : `pnpm controle --e2e` passe en entier : trois langues, mots interdits, textes en dur, lint, typecheck, 957 tests Vitest, 194 tests Playwright (`security.spec.ts` compris).

**Commits** : `5fad429` docs: ticket 135 started ; `7bec5d7` feat(lists): the bar of a list unrolls where it is ; et celui qui range ce ticket.
