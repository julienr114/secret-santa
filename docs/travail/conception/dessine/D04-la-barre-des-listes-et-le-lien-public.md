# D04 — La barre du haut des listes d'avant, et le lien d'une liste publique

- **Débloque** : ticket 106
- **Maquettes** : `V3ListeQuiLien`, `V3ListeLienChanger` ; 15 maquettes d'avant retouchées
- **Dessiné le** : 20 novembre 2026

## Pourquoi

Les maquettes de liste gardées disaient encore « Partage par lien », avec un interrupteur. La V3 dit où est la liste.

## Ce qui est dessiné

- **14 maquettes** où la barre était repliée disent maintenant « Famille Camille, Chez Mamie · 21 membres la voient », avec « Modifier » : `ListeDecocheFait`, `ListeDecocher`, `ListeDecocherCase`, `ListeGlisser`, `ListeLiveTeneur`, `ListeNouvelleReprendre`, `ListePersonneMenu`, `ListePersonneRetiree`, `ListePersonneRetirer`, `ListeReprise`, `ListeSansPersonne`, `ListeTeneur`, `MenuAvatarListe`, `ProcheSupprime`. (`ListeDecocher` n'est que sur le canevas : son fichier n'est pas dans le dépôt.)
- **`ListeAidePartage`** (celui qui aide à tenir la liste) : la même barre, sans « Modifier », avec « choisi par Camille ».
- **`V3ListeQuiLien`** : « Modifier » touché sur une liste publique. Sous « Tout le monde, avec un lien » allumé : le lien et « Copier », puis deux lignes, « Le message qui accompagne le lien » et « Changer de lien ».
- **`V3ListeLienChanger`** : la conséquence avant le geste (« L'ancien lien ne marchera plus… »), « Annuler », « Changer ».

## Périmées par ce ticket

`ListeEtatBrouillon`, `ListeNouvelle` (remplacées par `V3ListeNouvelle`), `ListeEtatPubliee`, `ListeChangerLien` (remplacées par `V3ListePublique`, `V3ListeQuiLien`, `V3ListeLienChanger`), `ListeAideSansPartage`, `ListePartageArrete` (ces états n'existent plus : une liste est toujours dans une fête).

## Décidé seul

- **Celui qui « aide à écrire » ne choisit pas qui voit la liste** : il n'a pas « Modifier ». Celui qui « gère la liste » l'a. C'était déjà vrai pour le partage par lien.
- **Les réglages du lien sont derrière « Modifier »**, plus dans la barre : la barre ne garde que le lien et « Partager ».
- « Personnaliser le message » s'appelle « Le message qui accompagne le lien » : une ligne, pas un lien souligné.
- **Il n'y a plus de brouillon** : `docs/travail/questions.md`, Q-006.

## Contrôlé

`V3ListeQuiLien`, `V3ListeLienChanger`, `ListeGlisser` et `ListeAidePartage` en image (le haut de page pour les deux dernières). Les 12 autres barres n'ont pas été regardées une à une : c'est le même remplacement.
