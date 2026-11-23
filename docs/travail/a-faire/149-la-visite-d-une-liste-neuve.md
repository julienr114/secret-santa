# 149 — La visite d'une liste neuve

- **Dépend de** : 147, 148
- **Avant** : la bascule (ticket 113)
- **Migration** : oui (ce qu'un compte a déjà vu ; voir plus bas)
- **Maquettes** : `V3ListeVisiteSecret1` à `V3ListeVisiteSecret6`, `V3ListeVisiteCreer1` à `V3ListeVisiteCreer3`, `V3ListeVisiteIdee` ; le système existant : `ListeCocheGuide`

## Objectif

Julien, le 23 novembre 2026 : la première fois qu'on arrive sur une liste qu'on vient de créer, une visite courte montre ce qu'on peut y faire, avec le voile et la note de la première coche. Deux visites : depuis un Secret Santa, depuis « Créer ».

## À lire d'abord

- `docs/spec/v3/listes.md` (« La visite d'une liste neuve » : les règles et les deux tableaux d'étapes)
- `docs/decisions/2026-11-23-la-visite-d-une-liste-neuve.md`
- `useTickGuide` et la note de la première coche (`IdeaLine.vue`, `VisitorLine.vue`)

## À faire

- [ ] **Un seul mécanisme** pour le voile, l'élément dans la lumière et la note : celui de la première coche, étendu à une suite d'étapes (pas un second système à côté). La note de la première coche ne change pas.
- [ ] **La note d'une étape** : titre, phrase, « n sur N », « Passer » à gauche, « Suivant » à droite ; à la dernière, « Compris » seul. Sous l'élément, ou au-dessus s'il est en bas de l'écran ; la page défile pour amener l'élément à l'écran (sans mouvement pour qui a demandé moins d'animations).
- [ ] **La visite « depuis un Secret Santa »** : les six étapes du tableau, dans l'ordre ; l'étape « Repartir d'une liste » saute quand le bloc n'est pas là (et le compte dit « sur 5 »).
- [ ] **La visite « depuis Créer »** : les trois étapes du tableau ; puis la note seule sur la première ligne, quand la première personne est ajoutée.
- [ ] **Quand** : seulement sur une liste que je viens de créer, à son premier affichage. Jamais sur la liste d'un autre, ni sur une liste que je rouvre.
- [ ] **Une seule fois par compte**, vue ou passée, tous appareils confondus : le compte retient « visite vue » et « note de la première ligne vue » (migration). Qui a vu une visite ne voit pas l'autre ; qui a vu la visite du Secret Santa ne voit pas la note de la première ligne.
- [ ] **« Touche un texte pour le modifier. »** disparaît de la phrase de celui qui tient la liste, dans les trois langues.
- [ ] Clavier et lecteurs d'écran : la note prend le focus, Échap vaut « Passer », le voile n'empêche pas de lire la note ; les textes dans les trois langues.
- [ ] Tests Playwright : les deux visites jusqu'au bout, « Passer », et qu'elles ne reviennent pas.

## Hors périmètre

- Rejouer la visite depuis un menu.
- Expliquer les autres gestes d'une liste (cocher pour quelqu'un, déplacer, les goûts).

## C'est fini quand

- [ ] Un compte neuf qui crée sa liste depuis un Secret Santa voit les six étapes (ou cinq), une fois.
- [ ] Un compte neuf qui crée une liste depuis « Créer » voit les trois étapes, puis la note à la première personne ajoutée.
- [ ] Ni l'une ni l'autre ne revient, même sur un autre appareil.
- [ ] `/controle` passe.

## Compte rendu

À remplir par Claude Code à la fin : ce qui a été fait, ce qui a été décidé seul (et pourquoi), les écarts avec les maquettes, les questions posées, les commits.
