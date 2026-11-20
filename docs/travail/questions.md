# Les questions

Mode d'emploi : `docs/travail/README.md` et le skill `/question`.

## Ouvertes

### Q-001 — « Fête » ou « événement », pour le nom commun ? (tickets 102, 104)

- **Pour** : Julien
- **Ce qui bloque** : le vocabulaire définitif (ticket 102). Les maquettes et la spec disent « fête » ; le ticket 104 écrit « fête » par des clés faciles à changer.
- **Ce qu'on a trouvé** : le mot ne s'écrit presque plus (« Quitter cette fête », « Les fêtes passées », « Réglages de la fête », « Toute la fête »). « Événement » colle à toutes les catégories mais reste froid, s'élide mal (« cet événement », « Nouvel événement ») et « membres de l'événement » sonne faux. Julien penchait pour « événement » avant qu'on décide de ne plus parler de fête à la création.
- **Les choix** : A, « fête » ; B, « événement ».
- **Ce que la conception ferait** : A. Le mot est devenu rare, et il garde le ton de l'application.

### Q-002 — Peut-on retirer sa liste d'une fête sans la supprimer ? (ticket 106)

- **Pour** : Julien
- **Ce qui bloque** : ce que fait « Qui verra ta liste ? » quand on décoche une fête.
- **Les choix** : A, oui, en décochant la fête (il doit en rester au moins une) ; B, non, il faut supprimer la liste.
- **Ce que la conception ferait** : A.

### Q-003 — Une liste publique où j'ai coché cesse d'être publique : reste-t-elle dans « Ce que j'offre ailleurs » ? (ticket 106)

- **Pour** : Julien
- **Les choix** : A, elle y reste, fermée, avec ce que j'offre et « Cette liste n'est plus partagée » (c'est ce que montre `V3OffreAilleurs`) ; B, elle disparaît.
- **Ce que la conception ferait** : A : on ne perd pas la trace d'un cadeau qu'on a promis.

### Q-004 — Dans quel ordre, après la V3 ? (tickets 120 à 133)

- **Pour** : Julien
- **Ce qu'on a trouvé** : l'ancien plan disait seulement que la V3 passe avant la page de présentation (125, 126), le changement d'infrastructure (128, 129), le tableau de bord (127) et l'application installée (124). Rien sur l'ordre des autres.
- **Ce que la conception ferait** : d'abord ce qui protège (130, 131, 129), puis ce qui ouvre (128, 125, 126), puis le confort (120 à 124, 127), puis 132 et 133.

### Q-005 — Quand publier la migration de la V3 ? (ticket 101)

- **Pour** : Julien
- **Ce qu'on a trouvé** : la migration transforme tous les groupes en fêtes, et des gens utilisent l'application pour Noël 2026.
- **Ce que la conception ferait** : coder sur une branche dès maintenant, ne rien publier avant janvier 2027.

## Réponses

Rien pour l'instant. Les réponses d'avant le 20 novembre 2026 sont dans l'archive `docs/refonte/PLAN.md`, section 6.
