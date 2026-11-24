# 164 — « Budget » : une page qui fait des propositions

- **Dépend de** : 162
- **Avant** : la bascule (ticket 113)
- **Migration** : non (le budget reste un texte)
- **Maquettes** : `V3TirageBudget` (un montant choisi), `V3TirageBudgetLibre` (« À votre bon cœur » touché)

## Objectif

Julien, le 24 novembre 2026 : « c'est jamais facile de savoir quoi mettre » comme budget. La page du budget propose cinq montants, « Sans limite » et quelques idées drôles, et laisse toujours écrire ce qu'on veut.

## À lire d'abord

- `docs/spec/v3/secret-santa.md`, « Le créer » : « « Budget » ouvre une page qui fait des propositions »
- la page de champ d'aujourd'hui (`admin/[slug]/editions/nouvelle/[champ].vue`) et le budget dans les réglages (`EditionRuleRows.vue`, un `UiTextSheet`)

## À faire

- [x] **Une seule page « Budget »**, ouverte par la ligne du formulaire de création et par celle des réglages d'un Secret Santa (plus de panneau dans les réglages).
- [x] **Six tuiles**, trois par rangée : « 5 € » · « Le défi », « 15 € » · « Le classique », « 30 € » · « Un vrai cadeau », « 50 € » · « On se fait plaisir », « 75 € » · « Le grand jeu », « ∞ » · « Sans limite » (lu « Sans limite » par un lecteur d'écran). Un groupe de boutons radio.
- [x] **« À ta façon »** : une ligne pleine largeur qui s'écrit sur place (le composant du ticket 162), label à gauche, valeur à droite, l'invite « Écris ce que tu veux » quand elle est vide, la longueur maximale d'aujourd'hui. Ici elle n'enregistre pas seule : « Valider » enregistre le choix de la page.
- [x] **« ou »** entre les tuiles et la ligne : un trait fin de chaque côté, 28 px d'air au-dessus et au-dessous, décoratif (caché aux lecteurs d'écran).
- [x] **Des suggestions, dans le même bloc blanc que la ligne**, juste dessous, sans trait : « À votre bon cœur », « Fait main », « Le plus kitsch possible », « Que de la récup' ». Des pastilles de 30 px, en pêche, sans contour. En toucher une l'écrit sur la ligne ; celle qui est reprise passe en blanc, trait et texte rouges.
- [x] **Un seul choix à la fois** : une tuile vide la ligne ; écrire ou toucher une idée désélectionne la tuile. Rien de choisi et la ligne vide : pas de budget.
- [x] **Ce qui est choisi** : fond blanc, le trait et le texte en rouge. Pas de fond teinté.
- [x] À l'ouverture : un budget qui vaut exactement le texte d'une tuile (« 15 € », « Sans limite ») la choisit ; tout autre texte arrive sur la ligne « À ta façon ».
- [x] La valeur enregistrée reste un texte : le montant tel qu'il est écrit dans la langue (« 15 € »), « Sans limite » pour la sixième tuile, ou le texte de la ligne. Les montants et les idées sont traduits dans les trois langues.
- [x] Tests : une tuile, une idée, un texte libre, vider.

## C'est fini quand

- [x] Depuis la création comme depuis les réglages, « Budget » ouvre cette page, et ce que je choisis se lit sur la ligne.
- [x] `/controle` passe.

## Compte rendu

- **`AdminBudgetPicker`** (`app/components/admin/BudgetPicker.vue`) : six tuiles, trois par rangée (`role="radiogroup"`, chacune un `role="radio"`) ; « ∞ » est lu « Sans limite » ; « ou » entre deux traits, 28 px d'air, caché aux lecteurs d'écran ; la ligne « À ta façon » est un `UiInlineTextRow` (ticket 162) en mode `quiet` qui n'enregistre que sur la page ; dessous, dans le même bloc sans trait, les quatre idées (30 px, `muted`, reprise : blanche, trait et texte rouges). Un seul choix à la fois.
- **La logique** est pure et testée (`shared/utils/budget.ts`) : `budgetPick` retrouve à l'ouverture la tuile dont le budget est exactement le texte (« 15 € », « Sans limite »), sinon le met sur la ligne tel quel ; `budgetOf` donne le texte enregistré (la tuile, la ligne, ou rien).
- **Deux entrées, la même page** : à la création, la page de champ `nouvelle/budget` montre le composant ; dans les réglages, une page `…/editions/[id]/budget` (comme celle du mot) enregistre la règle propre du Secret Santa et revient. `AdminEditionRuleRows` n'a plus de panneau : ses deux lignes mènent chacune à leur page.
- **Le budget reste un texte** : le montant écrit dans la langue (« 15 € », « €15 »), « Sans limite », ou la ligne. Pas de migration.
- **Décidé seul** : les intitulés anglais et allemands des tuiles et des idées (« The challenge », « Handmade »…), dans le ton du français.
- **`UiTextSheet` est supprimé** : le budget était son dernier usage ; sa démonstration quitte le guide de style. Clés supprimées : `adminEdition.screen.rules.budgetHelp`, `budgetPlaceholder` ; ajouté : `adminEdition.budget.*`. Trois langues.
- **Tests** : `shared/utils/budget.test.ts` ; `admin-edition.spec.ts` (à la création : une idée reprise, la ligne vidée, « Aucun », un texte à soi), `edition-cases.spec.ts` (dans les réglages : une tuile, choisie de nouveau à l'ouverture, puis un texte qui la lâche ; « Sans limite » lu ainsi ; une autre tuile).
- `ARBORESCENCE.md` et `ECARTS-MAQUETTES.md` mis à jour.

