# Où l'on écrit : sur la ligne, sur une page, ou dans un panneau

24 novembre 2026 · décidé par Julien, en séance de conception.

## Contexte

« Nouvel organisateur » s'ouvrait dans un panneau du bas avec un champ. En cherchant les autres, on en a trouvé une quinzaine : des panneaux avec du texte à écrire, des confirmations à recopier, des dates, un nombre, une heure, une recherche.

## Décision

- **Un texte court s'écrit sur sa ligne** : sur la fiche d'un membre (« Prénom », « Adresse email », « Nom de famille »), dans « Mon compte » (« Prénom », « Nom de famille »), et pour le nom d'un Secret Santa, à sa création comme dans ses réglages. La ligne reste blanche ; son label et sa bordure passent au rouge pendant qu'on écrit. La règle : `docs/spec/v3/regles-d-ecran.md`.
- **Dès qu'il faut plus qu'une ligne, c'est une page** : « Nouvel organisateur » (un prénom et une adresse), « Budget » (des propositions et une ligne « À ta façon »).
- **Dans une liste, les petites saisies restent dans leur panneau** (Julien : « c'est des petits trucs ») : le prénom de « Quelqu'un d'autre », « Qui l'offre ? » pour quelqu'un d'autre, la note quand on coche un cadeau.

## Ce qui ne change pas

| Où | Le panneau | Pourquoi |
|---|---|---|
| Une liste | « Quelqu'un d'autre » (`lists/NewPersonSheet.vue`), « Qui l'offre ? » (`lists/WhoSheet.vue`), la note quand je coche (`lists/ClaimSheet.vue`) | de petites saisies, dans le fil du geste |
| Super-admin | supprimer un événement : taper son nom (`admin/DeleteGroupSheet.vue`) | recopier est le garde-fou |
| Organisateur | dévoiler en dernier recours : taper une phrase (`admin/RevealSheet.vue`) | recopier est le garde-fou |
| Réglages d'un Secret Santa | « Devine qui » : une heure (`admin/GuessSheet.vue`) | ce n'est pas du texte |
| Invitation d'un Secret Santa | « Places » : un nombre, avec + et − (`UiNumberSheet`) | ce n'est pas du texte |
| Exclusions du tirage | choisir une personne, avec une recherche (`admin/ExclusionSheet.vue`) | un choix |
| Les dates | les trois listes dans un panneau (`e/[slug]/reglages`, `admin/PartyDateSheet.vue`, `admin/DateSheet.vue`) | à revoir avec le ticket 160 |
