# Le modèle

Décisions : `2026-11-20-le-groupe-devient-la-fete.md`, `2026-11-20-on-cree-un-secret-santa-ou-une-liste.md`, `2026-11-20-plus-de-demande-limite-de-trois.md`.

## L'événement

Un événement, c'est **une occasion** : il n'y a pas de niveau « famille » au-dessus. Il a :

- un nom libre ;
- une catégorie (`categories.md`) ;
- une date habituelle (jour et mois) et « revient chaque année », ou non ;
- des membres et des organisateurs ;
- pour un anniversaire, **le proche pour qui il est fait**, si on l'a choisi (`categories.md`, « Pour un anniversaire »).

Tout ce que le groupe porte aujourd'hui reste à l'événement : les organisateurs, les exclusions du tirage, les réglages. **Sauf l'invitation par lien, qui passe au Secret Santa** : on s'inscrit à un Secret Santa, et du coup à son événement (`secret-santa.md`, « Inviter par lien »).

## L'année

Événement (permanent) → **l'année de l'événement** (« Noël 2026 », avec sa vraie date, qui peut varier d'une année à l'autre) → ses Secret Santa et ses listes.

- Une seule date à changer par année.
- **Une liste appartient à l'année de sa date** : elle n'a pas d'année à elle en base (Q-020).
- Les années passées s'archivent ensemble.
- À l'écran, on ne dit pas « édition » : on dit « Noël 2026 » et « le Secret Santa ».

## Le Secret Santa

- Il appartient à une année d'un événement, et à un seul événement.
- **Plusieurs Secret Santa sont possibles la même année** dans un événement (les adultes, les enfants).
- Il propose la date de l'événement cette année-là, modifiable.
- Ses participants se choisissent parmi les membres de l'événement.
- Ses règles de tirage ne changent pas (README, sections 5 et 6).

## Les listes

- **Toute liste est dans au moins un événement.** Une liste pour soi ou une liste de mariage ont leur événement, même avec un seul membre. Le nom, la date et l'icône d'une liste viennent de son événement.
- **Une liste peut être dans plusieurs événements à la fois**, avec les mêmes coches partout : Justine met sa liste dans « Noël · famille A » et « Noël · famille B », personne n'offre deux fois la même chose.
- Tout membre peut mettre une liste dans un événement.

## Qui voit une liste

Dans cet ordre, du plus étroit au plus large, événement par événement :

1. **Celui qui m'a tiré au sort, et lui seul**, si l'événement a un Secret Santa où je participe et que je l'ai choisi (`listes.md`).
2. **Tous les membres de l'événement.**
3. En plus, si son propriétaire le choisit : **tout le monde avec un lien**. La liste est alors publique ; on y coche sans compte. C'est la réponse pour un mariage.

**Un événement n'a pas de lien à lui**, et on n'y ajoute personne : on y entre par un de ses Secret Santa ou par une de ses listes (plus bas). Le lien public est celui d'une liste.

## Deux sortes de personnes

- **Les membres** d'un événement : ceux qui y sont entrés **par un de ses Secret Santa** (son organisateur les y a mis, ou ils se sont inscrits par son lien) **ou par une de ses listes** (ils la tiennent, on les y a invités, ou ils ont ouvert son lien). **On n'ajoute personne à l'événement lui-même** (`docs/decisions/2026-11-21-on-entre-par-un-secret-santa-ou-par-une-liste.md`). C'est la table `persons` d'aujourd'hui, avec ce par quoi chacun est entré. Un membre peut ne pas avoir de compte : il participe au Secret Santa par son lien personnel, il ne voit pas les listes.
- **« Mes proches »** : ceux pour qui j'écris des listes, attachés à mon compte (`family_members`), **transversaux aux événements**. Léo, 6 ans, n'apparaît dans un événement qu'à travers la liste de ses parents.

Les deux tables ne fusionnent pas. La page « Mes proches » ne change pas.

## Les rôles

- **Les organisateurs** invitent, règlent l'événement, organisent un Secret Santa, retirent une liste de l'événement.
- **Les membres** voient l'événement et y mettent leurs listes.
- **Quitter un événement, ou en être retiré** : mes listes sortent de cet événement ; mes coches sur les listes des autres restent (le cadeau est toujours prévu).

## Les limites

- **3 Secret Santa par compte**, ceux qu'il organise et qui ne sont pas finis. Pas de demande à un administrateur. Le super-admin peut changer ce nombre pour un compte (`administration.md`).
- **30 membres par événement** (`fete.md`, « 30 membres au plus »).
- Les garde-fous des emails ne changent pas.
- En cas d'abus, le super-admin peut **suspendre les nouveaux Secret Santa** ; l'interrupteur est éteint. (`docs/decisions/2026-11-21-une-pause-pas-des-demandes.md` : pas de retour des demandes.)

Créer une liste, et l'événement qui va avec, est libre pour tout compte.

## La surprise

C'est le mode anonyme, et rien d'autre. Aucune règle ne cache les prénoms à celui qui figure sur une liste qu'il tient. Un événement surprise ne demande aucune fonction : il suffit de ne pas inviter la personne fêtée.
