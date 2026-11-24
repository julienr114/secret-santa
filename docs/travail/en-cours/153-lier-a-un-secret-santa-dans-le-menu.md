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

- [ ] Retirer la ligne « Lier à mon Secret Santa » sous mon prénom. Sous le prénom, il ne reste que la pastille, quand ma partie est liée.
- [ ] Ajouter au menu « … » de ma partie une entrée **« Lier à un Secret Santa »**, entre la fiche et « Retirer de cette liste », avec l'icône du tirage. La même condition qu'aujourd'hui : je tiens la liste, j'y figure, et j'ai cette année un Secret Santa tiré qui n'a pas de liste. Elle y est aussi quand ma partie est déjà liée à un autre.
- [ ] Elle ouvre le panneau qui existe (« Lier à ton Secret Santa ? », le choix quand il y en a plusieurs, « Il ne sera plus lié à… », « Lier ») : rien n'y change.
- [ ] `lists.link.action` : « Lier à un Secret Santa », trois langues.
- [ ] Les tests qui touchaient la ligne sous le prénom (`tests/e2e/lists-draw.spec.ts`) passent par le menu ; un test : ma partie liée à un Secret Santa, un deuxième sans liste, l'entrée est dans le menu et rien de plus sous le prénom.

## Hors périmètre

- Le panneau du lien (la pastille, « Voir mon Secret Santa », « Délier ») : ne change pas.
- Le libellé de la fiche dans le menu : la maquette écrit « Ma fiche et mes goûts » ; garder celui du code.

## C'est fini quand

- [ ] Plus rien sous mon prénom que la pastille ; « Lier à un Secret Santa » est dans le menu « … » de ma partie, et lie comme avant.
- [ ] Celui qui ne tient pas la liste ne voit pas l'entrée.
- [ ] `/controle` passe.
