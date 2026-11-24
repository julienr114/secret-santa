# 162 — Un texte court s'écrit sur sa ligne

- **Dépend de** : 161
- **Avant** : la bascule (ticket 113)
- **Migration** : non
- **Maquettes** : `V3TirageNouveau` et `V3TirageReglages` (au repos : « Nom »), `V3TirageNouveauEcrire` (on écrit), `Compte` (« Prénom », « Nom de famille »), `GroupePersonne` (la fiche d'un membre)

## Objectif

Julien, le 24 novembre 2026 : un prénom, un nom ou un budget s'ouvrent aujourd'hui dans un panneau (`UiTextSheet`) ou sur une page. Pour un texte d'une ligne, c'est trop : on l'écrit sur sa ligne. Et un panneau ne porte jamais de champ.

## À lire d'abord

- `docs/spec/v3/regles-d-ecran.md`, « Un texte court s'écrit sur sa ligne » : toute la règle y est
- `app/components/ui/TextSheet.vue` et ses usages ; les pages de champ du formulaire de création (`admin/[slug]/editions/nouvelle/[champ].vue`)
- `app/components/lists/IdeaLine.vue` : l'écriture sur place d'une liste (pour le clavier, Entrée, Échap, la perte du focus)

## À faire

- [ ] **Un composant de ligne qui s'écrit sur place** (dans `app/components/ui/`), avec les états de la spec : au repos (pas de flèche, la valeur à l'encre, l'invite en gris si elle est vide) ; on écrit (la ligne blanche, le label et la bordure en rouge, la bordure qui suit les traits et les coins de la carte) ; une erreur sous la ligne.
- [ ] Enregistrer sur « OK », Entrée ou la perte du focus, seulement si la valeur a changé ; « Enregistré » en bas. Échap annule. Une valeur obligatoire vidée reprend l'ancienne.
- [ ] Accessible : un vrai `<input>` avec son label, l'état annoncé, la cible de 44 px.
- [ ] **Où le poser** :
  - « Mon compte » : « Prénom » (obligatoire), « Nom de famille » ;
  - **la fiche d'un membre** (`e/[slug]/membres/[id].vue`) : aujourd'hui deux champs pleine largeur (« Prénom », « Adresse email »), puis des lignes, puis « Enregistrer ». Elle passe tout en lignes, dans une seule carte : « Prénom » (obligatoire), « Adresse email », « Nom de famille » s'écrivent sur leur ligne, « Langue de ses messages » garde sa flèche. **Le bouton « Enregistrer » s'en va.** Sous « Adresse email », pendant qu'on écrit seulement : « Cette personne recevra un email qui dit que c'est toi qui l'as ajoutée. Elle pourra refuser les emails de l'application. ». Les autres phrases d'aide s'en vont ;
  - les réglages d'un Secret Santa : « Nom » ;
  - le formulaire de création d'un Secret Santa : « Nom » (sa page de champ s'en va).
- [ ] **Le budget ne change pas ici** : il garde sa flèche et sa page ; un autre ticket lui fera une page de propositions.
- [ ] Les phrases d'aide des anciens panneaux s'en vont. Les textes qui ne servent plus sont retirés, trois langues.
- [ ] `UiTextSheet` : le retirer s'il n'a plus d'usage hors du guide de style ; sinon dire où il reste.
- [ ] Le guide de style montre la ligne dans ses trois états.
- [ ] Tests : écrire, Entrée, Échap, vider un champ obligatoire, une erreur du serveur.

## Hors périmètre

- Les panneaux d'une liste, les confirmations à recopier, les nombres, l'heure, la recherche : ils restent comme ils sont (`docs/decisions/2026-11-24-ou-l-on-ecrit-ligne-page-panneau.md`).
- Les dates (ticket 160).

## C'est fini quand

- [ ] Dans « Mon compte », je change mon prénom en le touchant, sans panneau ni page.
- [ ] Le nom d'un Secret Santa s'écrit sur sa ligne, à la création comme dans les réglages.
- [ ] La fiche d'un membre n'a plus de champ pleine largeur ni de bouton « Enregistrer ».
- [ ] `/controle` passe.
