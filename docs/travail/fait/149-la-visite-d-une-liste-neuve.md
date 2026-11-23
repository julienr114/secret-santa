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

- [x] **Un seul mécanisme** pour le voile, l'élément dans la lumière et la note : celui de la première coche, étendu à une suite d'étapes (pas un second système à côté). La note de la première coche ne change pas.
- [x] **La note d'une étape** : titre, phrase, « n sur N », « Passer » à gauche, « Suivant » à droite ; à la dernière, « Compris » seul. Sous l'élément, ou au-dessus s'il est en bas de l'écran ; la page défile pour amener l'élément à l'écran (sans mouvement pour qui a demandé moins d'animations).
- [x] **La visite « depuis un Secret Santa »** : les six étapes du tableau, dans l'ordre ; l'étape « Repartir d'une liste » saute quand le bloc n'est pas là (et le compte dit « sur 5 »).
- [x] **La visite « depuis Créer »** : les trois étapes du tableau ; puis la note seule sur la première ligne, quand la première personne est ajoutée.
- [x] **Quand** : seulement sur une liste que je viens de créer, à son premier affichage. Jamais sur la liste d'un autre, ni sur une liste que je rouvre.
- [x] **Une seule fois par compte**, vue ou passée, tous appareils confondus : le compte retient « visite vue » et « note de la première ligne vue » (migration). Qui a vu une visite ne voit pas l'autre ; qui a vu la visite du Secret Santa ne voit pas la note de la première ligne.
- [x] **« Touche un texte pour le modifier. »** disparaît de la phrase de celui qui tient la liste, dans les trois langues.
- [x] Clavier et lecteurs d'écran : la note prend le focus, Échap vaut « Passer », le voile n'empêche pas de lire la note ; les textes dans les trois langues.
- [x] Tests Playwright : les deux visites jusqu'au bout, « Passer », et qu'elles ne reviennent pas.

## Hors périmètre

- Rejouer la visite depuis un menu.
- Expliquer les autres gestes d'une liste (cocher pour quelqu'un, déplacer, les goûts).

## C'est fini quand

- [x] Un compte neuf qui crée sa liste depuis un Secret Santa voit les six étapes (ou cinq), une fois.
- [x] Un compte neuf qui crée une liste depuis « Créer » voit les trois étapes, puis la note à la première personne ajoutée.
- [x] Ni l'une ni l'autre ne revient, même sur un autre appareil.
- [x] `/controle` passe.

## Compte rendu

- **Migration `0044_v3_list_tours`** (appliquée en local seulement) : deux colonnes sur `accounts`, `list_tour_seen` et `first_line_note_seen`, à faux. La bascule publie maintenant onze migrations, de `0034` à `0044` (`bascule-v3.md` mis à jour).
- **Un seul mécanisme** : `ListsVeilNote` (le voile et la note de la première coche) sait maintenant être une étape (« 2 sur 6 », « Passer », « Suivant », « Compris » à la dernière, la pointe vers le haut ou le bas, le focus, Échap). La note de la première coche ne change pas. `useListTour` mène la visite, `useTourStop` met un élément dans la lumière et l'amène à l'écran (sans mouvement si l'on a demandé moins d'animations), `ListsTourStop` l'applique à un bloc (`display: contents` hors de son étape : la barre du partage reste collée en haut), `ListsTourNote` pose la note.
- **Les étapes** : `shared/utils/listTour.ts` (testé) ; « Repartir d'une liste » n'est une étape que si son bloc montre une liste (le compte dit alors « sur 5 »).
- **Quand** : l'adresse d'une liste qui vient d'être faite porte `?visite=secret` (« Ma liste de cadeaux », quand le serveur vient de la créer : `created` dans sa réponse) ou `?visite=creer` (« Nouvelle liste », une liste faite pour un événement). L'adresse le garde (le retirer par une navigation gênait « Retour » juste après) : une fois la visite vue ou passée, le compte le dit et rien ne se rouvre. Ni sur la liste d'un autre, ni sur une liste rouverte.
- **Une fois par compte** : le document de la liste dit ce que le compte a vu (`tours`) ; `POST /api/auth/tours` le retient. La visite du Secret Santa, vue ou passée, compte aussi pour la note de la première ligne ; « Passer » arrête tout.
- **Décidé seul** : la visite ne s'ouvre pas sur une liste reprise de l'an dernier (`?reprendre=`, elle a déjà ses personnes), ni après « Ma liste de cadeaux » écrite sans compte (`?compte=1` montre déjà « Ton compte est créé ») ; quitter la page au milieu de la visite compte comme « Passer ».
- « Touche un texte pour le modifier. » est retiré dans les trois langues.
- Écarts notés dans `ECARTS-MAQUETTES.md`.
- Tests : `tests/e2e/lists-tour.spec.ts` (les deux visites jusqu'au bout, la note de la première ligne, Échap, rien ne revient, même sur un autre appareil), `shared/utils/listTour.test.ts`.
