# On crée un Secret Santa ou une liste ; la fête est la première étape

20 novembre 2026 · décidé par Julien, en séance de conception.

## Contexte

Les premières maquettes proposaient de créer « une fête », « un Secret Santa » ou « une liste ». Sur l'accueil d'un compte tout neuf, le Secret Santa, qui est le cœur de l'application, n'apparaissait même pas. Et personne n'ouvre l'application pour « créer une fête ».

## Décision

- On ne propose jamais « Une fête ». « Créer » a deux lignes : « Un Secret Santa », « Une liste ».
- La première étape des deux demande l'occasion : une de mes fêtes, ou « Une autre occasion », qui en crée une (« Pour quelle occasion ? »).
- **Toute liste est dans au moins une fête.** Plus de liste « sans fête ». Le nom, la date et l'icône d'une liste sont ceux de sa fête.
- L'accueil d'un compte tout neuf a deux cartes, le Secret Santa d'abord, et ne dit pas « fête ».
- Celui qui veut seulement réunir des gens passe par « Une liste » et s'arrête après la première étape.

## Écarté

- « Une fête » comme troisième choix.
- Une liste publique qui n'est dans aucune fête (décidé plus tôt le même jour, remplacé ici).

## Où ça s'applique

`docs/spec/v3/accueil-et-creation.md`, `modele.md`, `listes.md`, `migration.md`. Maquettes : `V3AccueilVide`, `V3AccueilPlusOuvert`, `V3TirageQuelleFete`, `V3ListeQui`, `V3FeteNouvelle`.
