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

- [x] **Un composant de ligne qui s'écrit sur place** (dans `app/components/ui/`), avec les états de la spec : au repos (pas de flèche, la valeur à l'encre, l'invite en gris si elle est vide) ; on écrit (la ligne blanche, le label et la bordure en rouge, la bordure qui suit les traits et les coins de la carte) ; une erreur sous la ligne.
- [x] Enregistrer sur « OK », Entrée ou la perte du focus, seulement si la valeur a changé ; « Enregistré » en bas. Échap annule. Une valeur obligatoire vidée reprend l'ancienne.
- [x] Accessible : un vrai `<input>` avec son label, l'état annoncé, la cible de 44 px.
- [x] **Où le poser** :
  - « Mon compte » : « Prénom » (obligatoire), « Nom de famille » ;
  - **la fiche d'un membre** (`e/[slug]/membres/[id].vue`) : aujourd'hui deux champs pleine largeur (« Prénom », « Adresse email »), puis des lignes, puis « Enregistrer ». Elle passe tout en lignes, dans une seule carte : « Prénom » (obligatoire), « Adresse email », « Nom de famille » s'écrivent sur leur ligne, « Langue de ses messages » garde sa flèche. **Le bouton « Enregistrer » s'en va.** Sous « Adresse email », pendant qu'on écrit seulement : « Cette personne recevra un email qui dit que c'est toi qui l'as ajoutée. Elle pourra refuser les emails de l'application. ». Les autres phrases d'aide s'en vont ;
  - les réglages d'un Secret Santa : « Nom » ;
  - le formulaire de création d'un Secret Santa : « Nom » (sa page de champ s'en va).
- [x] **Le budget ne change pas ici** : il garde sa flèche et sa page ; un autre ticket lui fera une page de propositions.
- [x] Les phrases d'aide des anciens panneaux s'en vont. Les textes qui ne servent plus sont retirés, trois langues.
- [x] `UiTextSheet` : le retirer s'il n'a plus d'usage hors du guide de style ; sinon dire où il reste.
- [x] Le guide de style montre la ligne dans ses trois états.
- [x] Tests : écrire, Entrée, Échap, vider un champ obligatoire, une erreur du serveur.

## Hors périmètre

- Les panneaux d'une liste, les confirmations à recopier, les nombres, l'heure, la recherche : ils restent comme ils sont (`docs/decisions/2026-11-24-ou-l-on-ecrit-ligne-page-panneau.md`).
- Les dates (ticket 160).

## C'est fini quand

- [x] Dans « Mon compte », je change mon prénom en le touchant, sans panneau ni page.
- [x] Le nom d'un Secret Santa s'écrit sur sa ligne, à la création comme dans les réglages.
- [x] La fiche d'un membre n'a plus de champ pleine largeur ni de bouton « Enregistrer ».
- [x] `/controle` passe.

## Compte rendu

- **`UiInlineTextRow`** (`app/components/ui/InlineTextRow.vue`) : un vrai `<input>` dans un `<label>` (44 px et plus), la valeur à droite à l'encre, « Ajouter » en gris quand elle est vide, pas de flèche. Pendant qu'on écrit (ou qu'on enregistre, ou qu'une erreur la tient ouverte), le label passe en `primary-ink` et la bordure en `primary` (ombre intérieure de 1,5 px, les coins de la carte quand elle en a). Entrée ou la perte du focus enregistre, seulement si la valeur a changé, puis « Enregistré » (`common.saved`) ; Échap annule ; une valeur obligatoire vidée reprend l'ancienne ; une erreur (la vérification de l'écran ou le serveur) s'écrit sous la ligne (`role="alert"`, `aria-invalid`), qui reste ouverte. L'emplacement `writing` dit ce que l'écriture déclenche, pendant qu'on écrit seulement. `quiet` : pas de « Enregistré » (le formulaire de création, qui ne garde qu'un brouillon).
- **Le curseur au bout** : posé au `click` qui suit un toucher sur la ligne, pas au `focus` (au focus, il défaisait la sélection que le navigateur ou le clavier venait de faire, et le texte s'ajoutait au bout de l'ancien).
- **Où** :
  - « Mon compte » : « Prénom » (obligatoire) et « Nom de famille » ; `useProfileSaver` gagne `commit`, qui rend l'erreur à la ligne au lieu d'un message ;
  - la fiche d'un membre (`e/[slug]/membres/[id].vue`) : une seule carte, « Prénom » (obligatoire), « Adresse email » (vérifiée à l'écran ; sous elle, pendant qu'on écrit, la phrase de l'email), « Nom de famille », puis « Langue de ses messages », qui garde sa flèche et s'enregistre dès qu'on la choisit ; l'icône s'enregistre dès qu'on la choisit ; **plus de bouton « Enregistrer »**. Une adresse déjà prise dit l'erreur du serveur sous la ligne. `AdminPersonFields` ne sert plus qu'à « Nouvelle personne » ;
  - les réglages d'un Secret Santa : « Nom » (fermé : la ligne ne s'écrit plus) ;
  - le formulaire de création : « Nom » ; sa page de champ (`nouvelle/nom`) n'existe plus.
- **Le budget** garde sa flèche et son panneau dans les réglages : `UiTextSheet` reste pour lui seul (`AdminEditionRuleRows`), jusqu'au ticket 164.
- **Textes** supprimés : `auth.account.firstNameHelp`, `lastNameHelp`, `adminGroup.personForm.emailHelpPerson`, `lastNameHelp`, `adminGroup.person.saved` ; ajoutés : `common.saved`, `adminGroup.personForm.emailWriting`. Trois langues.
- Le guide de style montre les trois lignes (une valeur, vide, une adresse vérifiée).
- **Tests** : `account.spec.ts` (le nom de famille, Entrée, pas de panneau), `signup.spec.ts` (le prénom ; le nom du Secret Santa à la création), `edition-cases.spec.ts` (le nom dans les réglages : Échap, Entrée, « Enregistré », vidé), `email.spec.ts` (l'adresse d'un membre : la phrase pendant qu'on écrit, une adresse fausse, une adresse déjà prise, pas de « Enregistrer »), `admin-edition.spec.ts` (quatre lignes à page à la création, plus le nom).
- Corrigé en route : `email.spec.ts` ajoutait un organisateur par la route sans prénom, refusé depuis le ticket 161.
- `ARBORESCENCE.md` et `ECARTS-MAQUETTES.md` mis à jour.

