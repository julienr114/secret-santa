# 136 — V3 : le Secret Santa et ma partie d'une liste

- **Dépend de** : 107
- **Migration** : à voir (retenir quelle personne d'une liste est « moi » pour un Secret Santa, si ce n'est pas déjà déductible du compte)
- **Maquettes** : `V3TirageQuelleListe`, `V3ListeSecretNouvelle`, `V3ListeSecret`, `V3ListeSurligne`, `V3ListeSurligneTout`

## Objectif

Retour de Julien, 22 novembre 2026, après avoir essayé : depuis un Secret Santa, on crée chaque fois une liste neuve et vide ; rien sur la liste ne dit qu'elle sert à un Secret Santa ; et celui qui m'a tiré tombe sur la liste entière. Ce qui est lié au Secret Santa, c'est moi dans une liste.

## À lire d'abord

- `docs/decisions/2026-11-22-le-secret-santa-et-ma-partie-d-une-liste.md`
- `docs/spec/v3/listes.md` (« Depuis mon Secret Santa »)
- `docs/spec/v3/secret-santa.md` (« Le résultat », « Du résultat à la liste »)

## À faire

- [ ] **Une liste créée depuis mon Secret Santa m'a déjà dedans, en premier** (`V3ListeSecretNouvelle`) : la personne « Moi », avec sa ligne « Une idée pour … ». Pareil depuis « Écrire ma liste » de l'email d'une demande d'idées.
- [ ] **« Repartir d'une liste » tant que la liste n'a aucune idée**, même avec des personnes (Q-032, `docs/spec/v3/listes.md`, « Repartir d'une liste ») : `canResumeInto` ne demande plus une liste sans personne. La reprise garde à leur place les personnes déjà là, ajoute les autres après, ne met personne deux fois ; les idées pas offertes d'une personne déjà là arrivent sous son prénom. Le troisième critère du tri (une personne en commun) sert enfin. Le bloc est sous les personnes, avant « Ajouter quelqu'un ».
- [ ] **« Quelle liste pour ton Secret Santa ? »** (`V3TirageQuelleListe`), quand je tiens déjà une ou plusieurs listes de cette année où je figure : mes listes (le nom, « Pour Léo, Zoé et moi », ses événements), puis « Une nouvelle liste » ; la première choisie d'avance (le même événement, sinon la même catégorie, sinon la plus récente), en fonction pure testée ; « Continuer ». Le composant `UiChoiceSheet`, les radios natifs.
- [ ] **Choisir une liste qui existe** lui ajoute le stade « Celui qui m'a tiré » pour cet événement, sans rien retirer de son partage.
- [ ] **Sous mon prénom, dans la liste** : « Secret Santa · Famille Camille », avec l'icône du Secret Santa, une ligne par Secret Santa, qui mène à mon Secret Santa. Seuls ceux qui tiennent la liste la voient.
- [ ] **Le gros plan** (`V3ListeSurligne`) : arrivé depuis sa carte de résultat, celui qui m'a tiré voit la liste avec son titre et son mot d'accueil, mais une seule personne, moi ; en haut, `UiSegmented` avec mon prénom (choisi) et « Toute la liste ». Le mode anonyme reste activé d'office.
- [ ] **« Toute la liste »** (`V3ListeSurligneTout`) : tout le monde, moi en premier.
- [ ] Le gros plan se demande par l'adresse (un paramètre), pour que « Retour » puis « Suivant » le retrouvent ; il ne change aucun droit d'accès.
- [ ] La page ne dit jamais « tu as tiré … ».
- [ ] Trois langues, `tests/e2e`.

## Hors périmètre

- Limiter le droit d'accès de celui qui m'a tiré à ma seule partie : écarté par la décision.
- Lier à un Secret Santa quelqu'un d'autre que moi (un enfant sans compte).
- La barre du haut de la liste (ticket 135).

## C'est fini quand

- [ ] Sans aucune liste, « Ma liste de cadeaux » depuis mon Secret Santa ouvre une liste où je figure déjà.
- [ ] Avec une liste de Noël où je figure, on me la propose, choisie d'avance ; la choisir ne crée rien.
- [ ] Celui qui m'a tiré ne voit d'abord que ma partie, et le reste par « Toute la liste ».
- [ ] Une liste créée depuis mon Secret Santa propose de repartir de « Noël 2025 » ; après la reprise, je n'y suis qu'une fois, en premier.
- [ ] Les cinq maquettes sont reproduites.
- [ ] `/controle` passe.

## Compte rendu

À remplir par Claude Code à la fin : ce qui a été fait, ce qui a été décidé seul (et pourquoi), les écarts avec les maquettes, les questions posées, les commits.
