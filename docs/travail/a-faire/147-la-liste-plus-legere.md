# 147 — La liste, plus légère : « (moi) », la pastille du Secret Santa, « Une idée pour toi… », le mot d'accueil en option

- **Dépend de** : 144 (la carte blanche de l'écriture)
- **Avant** : la bascule (ticket 113)
- **Migration** : non (une liste déjà créée garde son mot ; voir plus bas)
- **Maquettes** : `V3ListeSecretNouvelle`, `V3ListeSecret`, `V3ListeNouvelle`, `V3ListeMotAccueil`, `V3ListeMembre`, `ListeVueReliee`, `ListeVisiteurMes`, `ListeSansPersonneVisiteur`

## Objectif

Julien, le 23 novembre 2026, en essayant les listes : cinq retouches qui allègent la page.

## À lire d'abord

- `docs/spec/v3/listes.md` : « Une nouvelle liste » (le mot d'accueil est en option), « Depuis mon Secret Santa » (sous mon prénom), « Ma partie d'une liste », « La liste d'un autre membre » (plus de phrase sous le mot d'accueil)
- `docs/spec/v3/categories.md` (« L'icône d'un événement est une tuile en couleur »)

## À faire

- [ ] **« Camille (moi) »** : partout où ma partie porte « Moi » ou « C'est toi » sous le prénom, « (moi) » passe entre parenthèses à côté du prénom, plus petit, en gris ; la ligne du dessous disparaît. Je suis seul à le lire. Trois langues.
- [ ] **La pastille du Secret Santa sous mon prénom** : une petite pastille discrète (20 px de haut, fond clair, texte gris de 11,5 px, l'emoji de l'événement puis « Secret Santa · {événement} », une ligne, « … »), de la famille des pastilles de prénoms. Le prénom et la pastille ne dépassent pas la hauteur de l'icône (52 px). Plus d'enveloppe, plus de gras. Ce qu'elle ouvre : ticket 148 (d'ici là, elle mène à mon Secret Santa).
- [ ] **« Une idée pour toi… »** et « Une autre idée pour toi… » dans ma partie, que je tienne la liste ou que j'y figure (`lists.ideaFor` reste pour les autres ; `visitor.ideaForMe` et `anotherForMe` disent « toi »). L'étiquette pour les lecteurs d'écran suit. Trois langues.
- [ ] **Le mot d'accueil en option** : une liste neuve n'a pas de mot (plus de `noteDefault` affiché dans un cadre en pointillés, plus de `noteDefaultHint`). « Ajouter un mot d'accueil » est une ligne discrète sous la date ; la toucher ouvre le champ dans la carte blanche (ticket 144), rempli du mot de départ de la catégorie, le curseur au bout. Vidé : pas de mot, la ligne revient.
- [ ] Une liste **déjà créée** dont le mot est encore le texte de départ jamais touché : elle n'a pas de mot non plus (rien n'est enregistré tant qu'on n'a pas écrit ; si le texte de départ était enregistré, le dire dans le compte rendu avant de toucher aux données).
- [ ] **Pour un visiteur, plus de phrase sous le mot d'accueil** : retirer « La liste de {name}. », « … seul(e) voit qui a coché quoi », « Tu offres n cadeaux : … sait que c'est toi », « Tu y figures : … », « Un point marque ce qui a changé… », dans les trois langues, avec leurs clés. Une liste sans personne garde « la liste de … » à côté de sa date.
- [ ] Les tests qui lisaient ces textes.

## Hors périmètre

- La phrase de celui qui tient la liste (« 9 cadeaux déjà prévus. Toi seul vois les prénoms. »).
- Lier et délier une liste d'un Secret Santa, le nom d'une liste créée depuis un Secret Santa, la visite guidée : en cours de conception.

## C'est fini quand

- [ ] Une liste neuve s'ouvre sans mot d'accueil ; « Ajouter un mot d'accueil » en propose un.
- [ ] Ma partie dit « Camille (moi) » et « Une idée pour toi… » ; celle des autres ne change pas.
- [ ] La liste d'un autre n'a plus de phrase entre le mot d'accueil et les idées.
- [ ] `/controle` passe.

## Compte rendu

À remplir par Claude Code à la fin : ce qui a été fait, ce qui a été décidé seul (et pourquoi), les écarts avec les maquettes, les questions posées, les commits.
