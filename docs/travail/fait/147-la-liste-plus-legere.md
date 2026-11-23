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

- [x] **« Camille (moi) »** : partout où ma partie porte « Moi » ou « C'est toi » sous le prénom, « (moi) » passe entre parenthèses à côté du prénom, plus petit, en gris ; la ligne du dessous disparaît. Je suis seul à le lire. Trois langues.
- [x] **La pastille du Secret Santa sous mon prénom** : une petite pastille discrète (20 px de haut, fond clair, texte gris de 11,5 px, l'emoji de l'événement puis « Secret Santa · {événement} », une ligne, « … »), de la famille des pastilles de prénoms. Le prénom et la pastille ne dépassent pas la hauteur de l'icône (52 px). Plus d'enveloppe, plus de gras. Ce qu'elle ouvre : ticket 148 (d'ici là, elle mène à mon Secret Santa).
- [x] **« Une idée pour toi… »** et « Une autre idée pour toi… » dans ma partie, que je tienne la liste ou que j'y figure (`lists.ideaFor` reste pour les autres ; `visitor.ideaForMe` et `anotherForMe` disent « toi »). L'étiquette pour les lecteurs d'écran suit. Trois langues.
- [x] **Le mot d'accueil en option** : une liste neuve n'a pas de mot (plus de `noteDefault` affiché dans un cadre en pointillés, plus de `noteDefaultHint`). « Ajouter un mot d'accueil » est une ligne discrète sous la date ; la toucher ouvre le champ dans la carte blanche (ticket 144), rempli du mot de départ de la catégorie, le curseur au bout. Vidé : pas de mot, la ligne revient.
- [x] Une liste **déjà créée** dont le mot est encore le texte de départ jamais touché : elle n'a pas de mot non plus (rien n'est enregistré tant qu'on n'a pas écrit ; si le texte de départ était enregistré, le dire dans le compte rendu avant de toucher aux données).
- [x] **Pour un visiteur, plus de phrase sous le mot d'accueil** : retirer « La liste de {name}. », « … seul(e) voit qui a coché quoi », « Tu offres n cadeaux : … sait que c'est toi », « Tu y figures : … », « Un point marque ce qui a changé… », dans les trois langues, avec leurs clés. Une liste sans personne garde « la liste de … » à côté de sa date.
- [x] Les tests qui lisaient ces textes.

## Hors périmètre

- La phrase de celui qui tient la liste (« 9 cadeaux déjà prévus. Toi seul vois les prénoms. »).
- Lier et délier une liste d'un Secret Santa, le nom d'une liste créée depuis un Secret Santa, la visite guidée : en cours de conception.

## C'est fini quand

- [x] Une liste neuve s'ouvre sans mot d'accueil ; « Ajouter un mot d'accueil » en propose un.
- [x] Ma partie dit « Camille (moi) » et « Une idée pour toi… » ; celle des autres ne change pas.
- [x] La liste d'un autre n'a plus de phrase entre le mot d'accueil et les idées.
- [x] `/controle` passe.

## Compte rendu

- **« Camille (moi) »** : un composant `ListsMeTag` (« (moi) », « (me) », « (ich) », 16 px, gris) à côté de mon prénom, dans ma liste et dans la liste d'un autre où je figure. « Moi » sous le prénom et « C'est toi » (`visitor.itsYou`, supprimé) disparaissent. La page « Mes proches » garde « Moi » : elle n'est pas une liste.
- **La pastille** : 20 px, fond `peach-100`, texte de 11,5 px gris, l'emoji de l'événement (nouveau champ `emoji` de `SantaLine`, `partyEmoji`), une ligne coupée par « … ». Elle mène encore à mon Secret Santa ; le ticket 148 lui donne son panneau.
- **« Une idée pour toi… »**, « Une autre idée pour toi… » dans ma partie, dans ma liste comme dans celle d'un autre (`visitor.ideaForMe` et `anotherForMe` disent « toi » / « you » / « dich »). L'étiquette pour les lecteurs d'écran est le même texte.
- **Le mot d'accueil en option** : `noteOf` ne renvoie plus de texte de départ ; « Ajouter un mot d'accueil » (crayon, italique, gris) ouvre le champ dans la carte blanche, rempli du mot de départ, le curseur au bout. Gardé tel quel, il est enregistré ; vidé, plus de mot. `noteDefaultHint` et `noteHelp` supprimés.
- **Les listes déjà créées** : le texte de départ n'a jamais été enregistré (`note` à `null`, `note_edited` à faux tant qu'on n'a pas écrit) ; elles n'ont plus de mot, sans toucher aux données.
- **Pour un visiteur** : plus de phrase sous le mot (`figures`, `whoSees`, `mine` supprimés ; le compte `mine` de la réponse du visiteur aussi). Une liste sans personne dit « Le 12 juin · la liste de Camille et Hugo » (`visitor.holderOn`), ou « La liste de … » sans date. « Tu tiens cette liste : tu vois qui offre quoi. » (celui qui la tient, par le lien) reste : le ticket ne le cite pas.
- « Un point marque ce qui a changé… » n'existait plus dans les textes.
- Écarts notés dans `ECARTS-MAQUETTES.md` : l'icône de 40 px, un seul mot de départ pour toutes les catégories (la spec n'en écrit pas par catégorie), le crayon.
- Tests : `lists`, `lists-single`, `lists-live`, `lists-several`, `lists-link`, `lists-draw`, `membership`, et `server/utils/lists.test.ts`.
