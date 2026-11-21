# 102 — V3 : les mots (« événement », « Secret Santa », plus de « pistes »)

- **Dépend de** : 105
- **Migration** : non
- **Maquettes** : toutes (elles disent « événement » depuis le 21 novembre 2026)

## Objectif

Plus un seul « groupe », « fête », « édition » ni « tirage » pour désigner la chose, dans les écrans, les emails, les notifications, le journal et l'administration, en trois langues. Le nom commun est « événement ». « Père Noël » seulement dans un événement de catégorie Noël.

## À lire d'abord

- `docs/spec/v3/vocabulaire.md` (tout le ticket est là : les mots, la table de « événement », le jour J, « Devine qui » hors de Noël)
- `docs/decisions/2026-11-21-evenement-pas-fete.md`
- `docs/decisions/2026-11-20-secret-santa-garde-son-nom.md`

## À faire

- [x] Dans `shared/i18n`, « fête » devient « événement » (« event », « Event ») partout où le mot désigne la chose ; la table de `vocabulaire.md` donne les textes.
- [x] « Toute la fête » devient « Tous les membres » (aucun texte ne le disait encore : le partage d'une liste arrive au ticket 106 ; « tout le groupe » devient « tous les membres » partout).
- [x] Là où « la fête » voulait dire le jour : la date seule, « Date », « le jour J » (« Réponse le jour J », « Jour J · dans 40 jours », « Dévoiler avant le jour J »).
- [x] Les restes de « groupe », « édition », « tirage » (pour la chose) et « pistes » dans les emails, les notifications, le journal et l'administration.
- [x] Les variantes sans « Père Noël » hors d'un événement de catégorie Noël, « Devine qui » compris, écrites dans les trois langues.
- [x] L'adresse d'un événement devient `/e/nom` ; `/f/nom` et les anciennes adresses du groupe y mènent.
- [x] Les noms dans le code (`party`, `parties`) peuvent rester : ce ticket ne renomme que ce qui se lit.

## Hors périmètre

- Les objets des emails et « Quoi de neuf » (ticket 110).
- Les noms de fichiers des maquettes.

## C'est fini quand

- [x] Aucune des trois langues ne contient « fête », « party » ou « Fest » pour désigner la chose (une recherche le montre ; « fêter » et les noms propres ne comptent pas).
- [x] Aucune ne contient « groupe », « édition » ou « pistes » dans un texte affiché, sauf deux objets d'email qui attendent le ticket 110 (« groupe », « Gruppe », « édition », « edition », « Ausgabe » sont maintenant dans `scripts/controle.mots.json`).
- [x] Un Secret Santa dans un événement de catégorie « Autre » n'affiche « Père Noël » nulle part, jeu compris.
- [x] `/f/nom` redirige vers `/e/nom`.
- [x] `/controle` passe.

## Compte rendu

**Fait.**

- Environ 400 textes réécrits dans chacune des trois langues, d'après la table de `vocabulaire.md` et les textes des maquettes du 21 novembre : « événement » (« event », « Event ») pour la chose ; « le jour J » (« the big day », « der große Tag »), la date seule ou « Date » pour le jour ; « Secret Santa » (« Wichteln ») pour la chose qu'on appelait tirage ou édition, « tirage » gardé pour le geste ; « tous les membres », « À tous » pour les gens ; « idées » pour les pistes.
- L'adresse d'un événement est `/e/nom` ; `/f/…` y mène, comme les anciennes adresses du groupe (`partyPathOf`, testé). L'identifiant de secours d'un nom sans lettre est `evenement`.
- Le contrôle des mots ignore les noms des variables (`{edition}`), jamais affichés, et refuse désormais « groupe », « Gruppe », « édition », « edition », « Ausgabe ».
- Un parcours Playwright passe l'événement du jeu en catégorie « Autre » : la page du jeu et la page personnelle ne disent plus « Père Noël ». Les variantes neutres existaient depuis le ticket 105 ; toutes les clés qui disent « Père Noël » en ont une.
- Les textes d'exemple du guide de style suivent.

**Décidé seul** (dans `ECARTS-MAQUETTES.md`, section « Les mots ») :

- « Pistes » devient « idées » et non « Ma liste de cadeaux » : avant le ticket 107, « liste » désignerait aussi les vraies listes.
- « Le jour J » se dit « the big day » et « der große Tag ».
- Les adresses `/admin/groupes`, `?vers=groupe` et `/p/…/pistes` gardent l'ancien mot : ce ticket ne change que l'adresse d'un événement.
- La section des réglages d'un Secret Santa qui garde la date, le budget et le petit mot s'appelle « Le jour J » (en attendant Q-015).

**Pas fait, hors périmètre** : les objets des emails (« La fête approche… », « des pistes de cadeaux t'attendent »), au ticket 110.

**Questions** : aucune.
