# 105 — V3 : le Secret Santa (le créer, ses réglages, la limite de 3, plus de demande)

- **Dépend de** : 101, 104
- **Migration** : oui
- **Maquettes** : `V3TirageQuelleFete`, `V3TirageNouveau`, `V3TirageReglages`, `V3TirageLimite`, `V3TirageNeutre`, `V3FeteMembresComplet`, `RejoindreFerme`, `ProcheNaissance`

## Objectif

Organiser un Secret Santa ne demande plus rien à personne. On le crée depuis « Créer », dans une fête qu'on organise ou dans une nouvelle. Son formulaire est tout en lignes, et il a ses propres réglages.

## À lire d'abord

- `docs/spec/v3/secret-santa.md`
- `docs/spec/v3/accueil-et-creation.md`
- `docs/spec/v3/regles-d-ecran.md`
- `docs/spec/v3/modele.md` (les limites)
- `docs/decisions/2026-11-20-plus-de-demande-limite-de-trois.md`
- `docs/decisions/2026-11-20-des-lignes-pas-des-champs.md`

## À faire

- [x] « Pour quelle occasion ? » d'un Secret Santa : mes fêtes que j'organise, « Une autre occasion ».
- [x] Le formulaire de création en six lignes, chacune avec sa page ; les valeurs reprises du Secret Santa précédent.
- [x] Plusieurs Secret Santa la même année dans une fête : « Un autre Secret Santa ».
- [x] Les réglages du Secret Santa (le tirage au sort, Devine qui, les messages, les emails).
- [x] La limite : 3 Secret Santa par compte, 30 membres par fête, vérifiée côté serveur ; l'écran de la limite.
- [x] Une fête complète (`docs/spec/v3/fete.md`, « 30 membres au plus ») : l'état à la place d'« Ajouter une personne », le lien d'invitation en pause tout seul, `RejoindreFerme` pour celui qui l'ouvre.
- [x] La fin des demandes : les écrans de demande et d'administration des demandes disparaissent ; les demandes en attente sont acceptées par la migration ; l'interrupteur d'urgence est au ticket 109 (pause ou demande : Q-007).
- [x] Le résultat hors d'une fête de catégorie Noël : sans « Père Noël ».
- [x] « Devine qui » hors d'une fête de catégorie Noël : les variantes sans « Père Noël » (`docs/spec/v3/vocabulaire.md`, « Devine qui hors de Noël »).

## Hors périmètre

- Le tirage lui-même et ses règles, le suivi, les envois, « Devine qui », le journal : inchangés.
- La carte du résultat et sa ligne vers la liste (ticket 107).
- Le réglage « Pistes de cadeaux » : il disparaît avec le ticket 107.

## C'est fini quand

- [ ] Un compte sans aucun droit particulier crée un Secret Santa de bout en bout.
- [ ] Le quatrième est refusé par le serveur et montre `V3TirageLimite`.
- [ ] Les maquettes du ticket sont reproduites.
- [ ] Le trente et unième membre est refusé par le serveur ; l'organisateur voit `V3FeteMembresComplet`.
- [ ] `/controle` passe.

## Compte rendu

À remplir par Claude Code à la fin : ce qui a été fait, ce qui a été décidé seul (et pourquoi), les écarts avec les maquettes, les questions posées, les commits.
