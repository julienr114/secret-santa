# 159 — La carte d'un événement : la roue dans l'en-tête, la date sous le titre ; « Réglages de l'événement » en ligne

- **Dépend de** : 156
- **Avant** : la bascule (ticket 113)
- **Migration** : non
- **Maquettes** : `V3Accueil`, `V3AccueilSansSecret`, `V3AccueilAnnee` (les cartes), `V3FeteOrganisateur` (la page de l'événement), `V3FeteReglages` (ses réglages)

## Objectif

Julien, le 24 novembre 2026, après avoir vu le ticket 156 : la ligne « Gérer l'événement » dans la carte, « ça fait un peu trop ». On la retire. L'en-tête de la carte dit lui-même qu'on gère : une roue crantée à la place de la flèche. Et sur la page de l'événement, la roue du haut devient une ligne.

## À lire d'abord

- `docs/spec/v3/lignes.md` : « L'en-tête d'une carte » (il remplace « La ligne « Gérer l'événement » »)
- `docs/spec/v3/fete.md` : « La page d'un événement » (les membres, « Réglages de l'événement »)
- ce que le ticket 156 a codé

## À faire

- [x] **Retirer la ligne « Gérer l'événement »** de la carte (ticket 156) et ses textes. « Tu l'organises » ne change pas.
- [x] **L'en-tête de toutes les cartes de l'accueil** : la date passe sous le titre, en petit. Le titre tient sur deux lignes au plus, puis « … ».
- [x] **À droite de l'en-tête** : la flèche pour un membre ; pour un organisateur de l'événement, une roue crantée dans un rond de 38 px (`aria-label` « Gérer l'événement », trois langues). Tout l'en-tête reste un seul lien vers la page de l'événement.
- [x] **La page de l'événement, pour un organisateur** : plus de roue en haut à droite. La carte des membres gagne une deuxième ligne, « Réglages de l'événement » (une roue, le titre, une flèche), qui ouvre les réglages. Pour un membre, rien ne change.
- [x] **Les réglages de l'événement** (`V3FeteReglages`) : la section « Secret Santa » et sa ligne « Réglages du Secret Santa 2026 » s'en vont (doublon : on y va depuis le suivi du Secret Santa). Vérifier que le suivi y mène bien ; sinon, le dire dans le compte rendu.
- [x] Les tests qui passaient par la roue du haut, par la ligne « Gérer l'événement » ou par cette ligne des réglages.

## C'est fini quand

- [x] La carte d'un événement que j'organise n'a plus de ligne « Gérer l'événement » ; son en-tête a la roue.
- [x] Sur la page de l'événement, « Réglages de l'événement » est une ligne sous les membres.
- [x] `/controle` passe.

## Compte rendu

- **La ligne « Gérer l'événement » est retirée** de la carte (`PartyCard`) ; l'accueil ne compte plus les membres (`manage` devient `organises`, la requête s'en va). « Tu l'organises » ne change pas.
- **L'en-tête de toutes les cartes** : le nom sur deux lignes au plus (`line-clamp-2`), la date dessous en 13 px ; à droite, la flèche pour un membre, et pour un organisateur une roue (`i-lucide-settings`) dans un rond de 38 px, `role="img"` et « Gérer l'événement » pour les lecteurs d'écran (`home.manage`, trois langues, la clé du 156 reprise). Tout l'en-tête reste un seul lien vers l'événement.
- **La page de l'événement** : plus de roue en haut à droite ; pour un organisateur, la carte des membres a une deuxième ligne, « Réglages de l'événement » (la roue, le titre, une flèche), qui ouvre les réglages. Pour un membre, la carte ne change pas.
- **Les réglages de l'événement** : la section « Secret Santa » et sa ligne « Réglages du Secret Santa 2026 » s'en vont ; clés `party.reglages.secretSanta` et `secretSantaRow` supprimées. **Le suivi y mène bien** : sa ligne des réglages (`EditionSettingsRow`, `settings-row`) ouvre `…/editions/[id]/reglages`, ce que vérifie `edition-cases.spec.ts`.
- **Tests** : `homeParties.test.ts` (`organises`) ; `home.spec.ts` (la roue et la date dans l'en-tête de l'organisateur, plus de ligne « Gérer l'événement », pas de roue pour un membre) ; `party.spec.ts` (la ligne sous les membres, aucune ligne vers les réglages d'un Secret Santa). Les autres tests passaient par le nom « Réglages de l'événement », que la ligne garde.
- `ARBORESCENCE.md` et `ECARTS-MAQUETTES.md` mis à jour.

