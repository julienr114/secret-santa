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

- [ ] Sur une liste, l'adresse n'est visible que la barre déroulée.
- [ ] « Modifier » n'ouvre plus de panneau du bas ; on change le partage et on copie le lien au même endroit.
- [ ] Celui qui « aide à écrire » peut copier le lien, et rien d'autre.
- [ ] Sur un petit écran, avec dix événements, la barre déroulée reste en haut et on atteint « Enregistrer » en faisant défiler son contenu.
- [ ] Les douze maquettes sont reproduites.
- [ ] `/controle` passe.

## Compte rendu

À remplir par Claude Code à la fin : ce qui a été fait, ce qui a été décidé seul (et pourquoi), les écarts avec les maquettes, les questions posées, les commits.
