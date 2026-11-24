# 166 — Une liste prend tout, tout de suite

- **Dépend de** : la bascule (ticket 113), faite le 24 novembre 2026
- **Migration** : non
- **Maquettes** : aucune

## Objectif

Julien, le 24 novembre 2026, juste après la bascule : « quand on écrit des trucs dans la liste, il y a un peu le même problème qu'il y avait quand on coche ou on décoche. On fait la modification, on défocus l'input et les modifications ne sont pas prises en compte tout de suite. Il faudrait vraiment qu'on ait l'impression que tout est pris tout de suite, même si la requête n'est pas finie, n'est pas encore partie. Juste s'il y a une erreur, on revient à l'état d'avant et on met une petite notice d'erreur. L'idée, c'est que ce soit fluide : même problème avec toutes les modifications sur la liste. »

C'est ce que la coche fait déjà depuis le 23 novembre (`useOptimisticClaim`, `shared/utils/optimisticTick.ts`).

## À faire

- [x] **Une idée** écrite, corrigée (le texte, le lien, les étoiles, en faire un titre), ajoutée ou supprimée se montre à l'instant, dans la liste de celui qui la tient comme par le lien.
- [x] **Une idée ajoutée** prend sa place tout de suite (après la ligne d'où on l'a écrite) ; ce qu'on lui fait avant que le serveur ait répondu (la corriger, la supprimer) part après sa création, dans l'ordre.
- [x] **Les requêtes d'une même ligne partent l'une après l'autre**, dans l'ordre des gestes ; la liste n'est relue qu'une fois la dernière modification répondue : le serveur a le dernier mot.
- [x] **Une erreur** : la liste revient à l'état du serveur, et un message le dit en bas.
- [x] **Les autres modifications de la liste** : le prénom et l'icône d'une personne, le nom, l'icône et la date de la liste, le mot d'accueil se montrent aussi à l'instant, et reviennent en cas d'erreur.
- [x] Tests : une idée corrigée se lit avant la réponse du serveur ; une idée ajoutée aussi ; une erreur remet la liste et le dit.

## C'est fini quand

- [x] Rien d'écrit dans une liste ne reprend un instant sa valeur d'avant.
- [x] `/controle` passe.

## Compte rendu

- **Une idée** (`useLists.ts`) : écrite, corrigée (texte, lien, étoiles, titre) ou supprimée, elle change dans les données de la page au geste (`useOptimisticEdit`), dans la liste de celui qui la tient comme par le lien. Les requêtes d'une ligne partent dans l'ordre des gestes (la file `inTurn` des coches) ; le compteur est celui des coches : la liste n'est relue qu'une fois la dernière modification ou coche de la page répondue, et le serveur a le dernier mot. Une erreur le dit en bas (`toast.failed`), et la liste relue revient à l'état du serveur.
- **Une idée ajoutée** prend sa place tout de suite, après la ligne d'où on l'a écrite (`withIdeaAdded`, aussi dans l'ordre mêlé aux « Hors liste »), sous un identifiant provisoire (`new-…`) jusqu'à la réponse. La corriger, la supprimer ou la cocher avant : la requête attend sa création (`serverIdOf`) et part avec l'identifiant du serveur.
- **La liste elle-même** (`useUpdateListMutation`) : son nom, sa date, son icône et son mot d'accueil changent au geste (`withListChanged`) ; une erreur le dit (avant, elle était silencieuse). **Une personne** : son prénom et son icône aussi (`PersonSection`), repris en cas d'erreur.
- L'état local des étoiles du ticket 152 (`starsChosen`) ne sert plus : les données de la page les portent.
- **Pas couvert** (déjà optimistes, ou rares) : l'ordre (`wanted`, déjà affiché tout de suite), retirer une personne (déjà tout de suite, avec « Annuler »). Glisser une idée tout juste écrite avant la réponse du serveur relit la liste (« la liste a changé ») : la fenêtre est d'une fraction de seconde.
- **La logique** est pure et testée : `shared/utils/optimisticList.ts`.
- **Tests** : `shared/utils/optimisticList.test.ts` ; `tests/e2e/lists-at-once.spec.ts` (une ligne corrigée et une ligne écrite se lisent pendant que leur requête est retenue ; une erreur du serveur remet la ligne et le dit).

