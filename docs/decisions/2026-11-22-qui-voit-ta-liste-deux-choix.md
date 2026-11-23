# « Qui voit ta liste ? » : deux choix, et seulement ceux qui la voient

22 novembre 2026 · décidé par Julien, après avoir essayé le partage d'une liste dans la V3.

## Contexte

La barre du haut d'une liste, déroulée, montrait tout à la fois : mes événements à cocher, un choix à deux sous l'un d'eux (« Tous les membres » / « Celui qui m'a tiré »), « Une autre occasion », « Inviter quelqu'un », un interrupteur « Tout le monde, avec le lien », « Changer de lien », et un bouton « Enregistrer ». Julien : « c'est incompréhensible ». Une première reprise, tout en cases à cocher, n'a pas convaincu non plus. Sur trois pistes, il a retenu « un mixte entre la 1 et la 3 », avec « que 2 entrées » en haut : « tout le monde n'est pas compatible avec le choix de qui voit la liste ».

## Décision

- **Deux choix qui s'excluent, en haut** : « Qui je veux » ou « Tout le monde ».
- **Sous « Qui je veux », seulement ceux qui voient la liste**, une ligne chacun, avec une croix pour le retirer. Les autres possibilités sont derrière **« Ajouter »**, qui se déroule sur place en pastilles : mes autres événements, « Celui qui m'a tiré », « Quelqu'un d'autre ».
- **« Celui qui m'a tiré » est une ligne comme les autres**, plus un choix à deux sous un événement.
- **Sous « Tout le monde », plus personne à choisir.** Y passer demande confirmation. En revenir retrouve ceux qu'on avait choisis.
- **Plus de bouton « Enregistrer »** : chaque geste s'applique tout de suite. Deux gestes demandent d'abord : retirer quelqu'un qui perd l'accès, et ouvrir à tout le monde.
- **« Quelqu'un d'autre »** remplace « Une autre occasion » et « Inviter quelqu'un » : une seule entrée, vers la page « Inviter quelqu'un », qui gagne « Dans une autre occasion ».
- **« Le message qui accompagne le lien » disparaît** : « Copier le lien » ne copie que l'adresse, ce message n'était plus relié à rien.
- **« Changer de lien »** reste proposé dès que le lien fait entrer quelqu'un, publique ou non.

## Écarté

- Tout en cases à cocher, « Tout le monde » compris : une longue liste de tout ce qui est possible, alors qu'on veut d'abord voir ce qui est.
- Trois choix en haut (« Moi seul », « Événements », « Tout le monde ») : « Moi seul » n'est pas un choix, c'est une liste que personne ne voit encore.
- Trois lignes à choix unique qui s'ouvrent : la même idée, en plus haut.
- Garder « Enregistrer » : on ne sait jamais si c'est fait.

## Où ça s'applique

`docs/spec/v3/listes.md` (« Qui voit ta liste ? », « Resserrer le partage », « Inviter quelqu'un »). Maquettes : `V3ListeQui`, `V3ListeQuiModifier`, `V3ListeQuiAjouter`, `V3ListeQuiSecret`, `V3ListeQuiRetirer`, `V3ListeQuiOuvrir`, `V3ListeQuiLien`, `V3ListeLienChanger`, `V3ListeLienNouveau`, `V3ListeInviter`, `V3ListeInviterEmail`, `V3ListeInviteEnvoyee`. Ticket 139.
