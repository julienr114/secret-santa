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

- [ ] « Ajouter un organisateur » ouvre **une page** (plus de `UiSheet`) : au-dessus du titre, « {événement} · Réglages » ; « Nouvel organisateur » ; deux champs avec leur label, « Son prénom » et « Son adresse email » ; une phrase, « Cette personne gère l'événement comme toi, sans voir les résultats du tirage. » ; le bouton « Ajouter ». Le retour ramène aux réglages.
- [ ] **Les deux champs sont obligatoires.** L'adresse est validée comme aujourd'hui.
- [ ] **Le compte** : si l'adresse n'a pas de compte, il est créé avec ce prénom. Si elle en a un, il garde le sien ; le prénom écrit n'est pas utilisé.
- [ ] Après « Ajouter », retour aux réglages, le nouvel organisateur dans la liste, un message en bas.
- [ ] Les textes qui ne servent plus s'en vont (les trois phrases du panneau) ; trois langues, tournures neutres.
- [ ] Chercher s'il reste d'autres panneaux avec un champ où écrire, et les lister dans le compte rendu (sans les changer).
- [ ] Tests : sans prénom, refusé ; une adresse sans compte, une adresse avec compte.

## C'est fini quand

- [ ] Ajouter un organisateur se fait sur une page, avec son prénom et son adresse.
- [ ] `/controle` passe.
