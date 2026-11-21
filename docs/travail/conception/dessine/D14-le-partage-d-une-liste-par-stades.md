# D14 — Le partage d'une liste, par stades

- **Débloque** : tickets 106 et 107
- **Décision** : `docs/decisions/2026-11-21-le-partage-d-une-liste-a-des-stades.md`
- **Maquettes** : `V3ListeOccasion`, `V3ListeFermee`, `V3ListeFermeeConnecte` (nouvelles) ; `V3ListeQui`, `V3ListeNouvelle`, `V3Liste`, `V3ListeSecret`, `V3ListePublique`, `V3ListeReprise`, `V3ListeQuiModifier`, `V3ListeQuiRetirer`, `V3ListeQuiLien`, `V3ListeLienChanger`, `V3OffreAilleurs` et quinze maquettes de liste d'avant, reprises
- **Dessiné le** : 21 novembre 2026

## Ce qui est dessiné

- La barre du haut sur deux lignes : l'état et son bouton, puis l'adresse et « Copier le lien », à chaque stade.
- Une nouvelle liste : « Pour quelle occasion ? », puis un brouillon.
- « Qui verra ta liste ? » ouvert par « Partager » ou « Modifier » ; « Tous les membres » à la place de « Toute la fête ».
- Resserrer le partage : la confirmation compte ceux qui ont coché.
- Arriver par le lien sans y avoir droit, connecté ou non.
- « Ce que j'offre ailleurs » sans liste fermée.

## Décidé seul

- **« Qui verra ta liste ? » n'est plus la première étape d'une liste** : c'est « Pour quelle occasion ? », puis on écrit, puis on partage.
- **Les pages de refus ne disent rien de la liste**, ni son nom ni à qui elle est.
- **Les coches de ceux qui perdent l'accès restent** (annoncé à Julien, non contredit).
- **À la migration**, une liste partagée par lien aujourd'hui devient publique, une liste au partage éteint devient un brouillon.
- La barre prend deux lignes sur toutes les listes : elle est plus haute qu'avant.

## Contrôlé

`V3ListeNouvelle`, `V3ListeQui`, `V3Liste`, `V3ListePublique`, `V3ListeOccasion`, `V3ListeFermee`, `V3ListeFermeeConnecte` et `V3ListeQuiRetirer`, en image. Les quinze maquettes d'avant portent la même barre, pas regardées une à une.
