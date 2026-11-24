# 161 — « Ajouter un organisateur » : une page, et le prénom

- **Dépend de** : 159
- **Avant** : la bascule (ticket 113)
- **Migration** : non prévue (le dire dans le compte rendu s'il en faut une)
- **Maquettes** : `V3FeteOrganisateurNouveau` (remplace `PanneauOrganisateur`)

## Objectif

Julien, le 24 novembre 2026 : « Ajouter un organisateur », dans les réglages de l'événement, ouvre un panneau du bas avec un champ. Un panneau ne porte jamais de champ où écrire. Et comme l'ajout crée un compte, il faut demander le prénom.

## À lire d'abord

- `docs/spec/v3/fete.md`, « Les réglages de l'événement » (« Organisateurs »)
- `docs/spec/v3/regles-d-ecran.md`, « Des lignes, pas des champs » (un panneau ne porte jamais de champ)
- le panneau d'aujourd'hui (`adminGroup.organisers.*`) et la route qui ajoute un organisateur

## À faire

- [x] « Ajouter un organisateur » ouvre **une page** (plus de `UiSheet`) : au-dessus du titre, « {événement} · Réglages » ; « Nouvel organisateur » ; deux champs avec leur label, « Son prénom » et « Son adresse email » ; une phrase, « Cette personne gère l'événement comme toi, sans voir les résultats du tirage. » ; le bouton « Ajouter ». Le retour ramène aux réglages.
- [x] **Les deux champs sont obligatoires.** L'adresse est validée comme aujourd'hui.
- [x] **Le compte** : si l'adresse n'a pas de compte, il est créé avec ce prénom. Si elle en a un, il garde le sien ; le prénom écrit n'est pas utilisé.
- [x] Après « Ajouter », retour aux réglages, le nouvel organisateur dans la liste, un message en bas.
- [x] Les textes qui ne servent plus s'en vont (les trois phrases du panneau) ; trois langues, tournures neutres.
- [x] Chercher s'il reste d'autres panneaux avec un champ où écrire, et les lister dans le compte rendu (sans les changer).
- [x] Tests : sans prénom, refusé ; une adresse sans compte, une adresse avec compte.

## C'est fini quand

- [x] Ajouter un organisateur se fait sur une page, avec son prénom et son adresse.
- [x] `/controle` passe.

## Compte rendu

- **Une page** : `/e/[fête]/reglages/organisateur` (« Nouvel organisateur »), ouverte par la ligne « Ajouter un organisateur » des réglages ; au-dessus du titre, « {événement} · Réglages » ; « Son prénom », « Son adresse email », la phrase, « Ajouter ». Le retour ramène aux réglages ; après « Ajouter », retour aux réglages (remplacé dans l'historique), le nouvel organisateur dans la liste, et « Inès organise maintenant l'événement » en bas. Le panneau `AdminOrganizerSheet` est supprimé.
- **Les deux champs obligatoires**, à l'écran (« Écris son prénom. », l'adresse comme avant) et sur la route (`POST /api/admin/[fête]/organizers` prend `firstName` avec `nameSchema` : sans lui, 400).
- **Le compte** : `addOrganizer` crée le compte avec ce prénom ; un compte qui existe garde le sien. Le prénom reste facultatif pour la seule autre voie, la création d'un groupe par le super-admin (adresses seulement). **Pas de migration.**
- **Décidé seul** : le formulaire revalide sans délai (`validate-on-input-delay` à 0) : avec le délai de 300 ms de Nuxt UI, un « Ajouter » touché juste après avoir écrit le prénom, quand l'erreur était affichée, n'envoyait rien.
- **Textes** : `adminGroup.organizers.addDescription` et `emailHelp` supprimés, `noResults` dit la phrase de la maquette ; ajoutés `firstNameLabel`, `firstNameRequired`, `added`, et `party.reglages.short` (« Réglages », pour le fil). Trois langues, tournures neutres.
- **Les autres panneaux qui portent un champ où écrire** (inchangés) : `ListsWhoSheet` (« Qui l'offre ? » : un prénom, une adresse), `ListsClaimSheet` (un prénom, pour cocher pour quelqu'un), `ListsNewPersonSheet` (le prénom d'une personne nouvelle dans une liste), `AdminDeleteGroupSheet` (le nom à recopier avant de supprimer), `AdminRevealSheet` (la phrase avant de dévoiler), et `UiTextSheet` / `UiNumberSheet` / les panneaux de date, utilisés par « Mon compte » (`compte.vue`), la fiche d'un membre (`e/[fête]/membres/[id].vue`), les réglages d'un Secret Santa et ses règles (`EditionRuleRows`), l'invitation par lien (le nombre de places) et la date d'un événement (`PartyDateSheet`). Une partie relève du ticket 162.
- **Tests** : `members-organise.spec.ts` (sans prénom, refusé à l'écran et par la route ; une adresse sans compte, dont le compte prend le prénom ; le message), `admin-edition.spec.ts` (une adresse qui a un compte garde son prénom).
- `ARBORESCENCE.md` : la nouvelle page.

