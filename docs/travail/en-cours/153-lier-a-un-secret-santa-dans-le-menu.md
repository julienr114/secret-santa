# 153 — « Lier à un Secret Santa », dans le menu « … » de ma partie

- **Dépend de** : 148
- **Avant** : la bascule (ticket 113)
- **Migration** : non
- **Maquettes** : `V3ListeSecretLier` (le menu ouvert), `V3ListeSecretLierConfirmer` (ne change pas)

## Objectif

Julien, le 24 novembre 2026 : sous mon prénom, « Lier à mon Secret Santa » fait bizarre, surtout quand ma partie est déjà liée à un autre Secret Santa (la pastille « Secret Santa · Amis de Camille », puis « Lier à mon Secret Santa » juste dessous). L'entrée passe dans le menu « … » de ma partie et s'appelle « Lier à un Secret Santa ».

## À lire d'abord

- `docs/spec/v3/listes.md` : « Lier et délier » (le point « Lier une liste qui existe »)
- ce que le ticket 148 a codé : `ListsDrawLink`, `PersonSection.vue`, `lists.link.*`

## À faire

- [x] Retirer la ligne « Lier à mon Secret Santa » sous mon prénom. Sous le prénom, il ne reste que la pastille, quand ma partie est liée.
- [x] Ajouter au menu « … » de ma partie une entrée **« Lier à un Secret Santa »**, entre la fiche et « Retirer de cette liste », avec l'icône du tirage. La même condition qu'aujourd'hui : je tiens la liste, j'y figure, et j'ai cette année un Secret Santa tiré qui n'a pas de liste. Elle y est aussi quand ma partie est déjà liée à un autre.
- [x] Elle ouvre le panneau qui existe (« Lier à ton Secret Santa ? », le choix quand il y en a plusieurs, « Il ne sera plus lié à… », « Lier ») : rien n'y change.
- [x] `lists.link.action` : « Lier à un Secret Santa », trois langues.
- [x] Les tests qui touchaient la ligne sous le prénom (`tests/e2e/lists-draw.spec.ts`) passent par le menu ; un test : ma partie liée à un Secret Santa, un deuxième sans liste, l'entrée est dans le menu et rien de plus sous le prénom.

## Hors périmètre

- Le panneau du lien (la pastille, « Voir mon Secret Santa », « Délier ») : ne change pas.
- Le libellé de la fiche dans le menu : la maquette écrit « Ma fiche et mes goûts » ; garder celui du code.

## C'est fini quand

- [x] Plus rien sous mon prénom que la pastille ; « Lier à un Secret Santa » est dans le menu « … » de ma partie, et lie comme avant.
- [x] Celui qui ne tient pas la liste ne voit pas l'entrée.
- [x] `/controle` passe.

## Compte rendu

- **Sous mon prénom**, il ne reste que la pastille : la ligne « Lier à mon Secret Santa » de `ListsDrawLink` est retirée.
- **Le menu « … » de ma partie** (`PersonSection`) a l'entrée « Lier à un Secret Santa », avec l'enveloppe du tirage (`i-lucide-mail`, comme sur l'accueil), juste après la fiche, comme dans la maquette ; « Monter » et « Descendre » viennent après, puis « Retirer de cette liste ». Même condition qu'avant : je tiens la liste, c'est ma partie, et un de mes Secret Santa de l'année, tiré, n'a pas de liste, que ma partie soit déjà liée ou non.
- **Le panneau** ne change pas : `ListsDrawLink` l'ouvre par `ask()`, appelé depuis le menu.
- `lists.link.action` : « Lier à un Secret Santa », « Link to a Secret Santa », « Mit einem Secret Santa verknüpfen ».
- **Tests** (`tests/e2e/lists-draw.spec.ts`) : délier puis relier passe par le menu ; nouveau test, ma partie liée à « Famille Lilas » et un deuxième Secret Santa tiré sans liste : rien sous le prénom que la pastille, l'entrée deuxième du menu, le panneau propose les deux, lier ajoute la pastille, puis l'entrée s'en va. Celui qui arrive par le lien ne voit ni pastille ni entrée.
- **Décidé seul** : la place exacte dans le menu, juste après la fiche, d'après la maquette ; le ticket dit « entre la fiche et Retirer de cette liste », et « Monter » / « Descendre » se trouvent entre les deux.
- Écart noté dans `ECARTS-MAQUETTES.md` (`V3ListeSecretLier`).

