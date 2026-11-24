# 129 — Durcir : la dépense

- **Dépend de** : 109, 113
- **Migration** : non
- **Maquettes** : `V3Admin` (« En cas d'urgence », « À traiter et à surveiller », « Les plafonds »), `EnvoiSuspendu`, `V3TiragePause`

## Objectif

Une attaque ou un emballement ne peut pas coûter plus qu'un montant fixé d'avance, et le super-admin le voit venir et peut couper. C'est ce qui rend l'abonnement payant de l'hébergeur sans danger.

## À lire d'abord

- `docs/spec/v3/administration.md`
- L'archive `docs/refonte/PLAN.md`, section 8.1 (la dépense) et « Lot 38 A » (le filet, déjà fait)

## À faire

- [ ] **Julien, le jour de l'abonnement** : une limite de dépense sur Workers et sur les objets durables (Cloudflare, « Spend Management » : au seuil, les requêtes sont refusées jusqu'au cycle suivant), et une alerte de budget pour tout le compte. Montant proposé : 5 $ par mois au-dessus de l'abonnement.
- [ ] **Les interrupteurs d'urgence** : « Suspendre les emails » (plus aucun email ne part, sauf les liens de connexion) et « Suspendre les inscriptions » (ni nouveau compte, ni nouvel événement), à côté de « Suspendre les nouveaux Secret Santa », fait au ticket 109. Le premier se déclenche tout seul quand le plafond d'emails du mois est atteint, et l'organisateur qui veut envoyer voit `EnvoiSuspendu`.
- [ ] **Savoir qu'on est attaqué** : le tableau de bord compte les requêtes refusées pour débit, les connexions échouées, les erreurs du serveur, les adresses qui refusent les emails et les emails rejetés du jour. Ce qui attend une décision entre dans la pastille de l'onglet ; le reste est un chiffre.
- [ ] **Les plafonds**, avec leur jauge : emails du jour et du mois, requêtes du jour, dépense du mois ; un avertissement au super-admin à 70 %.
- [ ] **La règle de débit du pare-feu** (une seule sur l'offre gratuite) : sur la demande de lien de connexion, devant le Worker, pour que les requêtes refusées ne soient pas comptées.
- [ ] **Les connexions en direct**, si elles existent au moment de ce ticket : la mise en sommeil, le nombre maximal de connexions par liste, la fermeture après inactivité.
- [ ] Tests des interrupteurs et des plafonds.

## Hors périmètre

- Ouvrir l'application à tous et la financer (ticket 128).
- Le reste du tableau de bord (ticket 127).

## C'est fini quand

- [ ] « Suspendre les emails » allumé, seul un lien de connexion part encore (un test le vérifie).
- [ ] Le plafond d'emails du mois atteint allume l'interrupteur tout seul.
- [ ] « Suspendre les inscriptions » refuse un nouveau compte et un nouvel événement, pas une connexion.
- [ ] `/controle` passe.

## Compte rendu

À remplir par Claude Code à la fin : ce qui a été fait, ce qui a été décidé seul (et pourquoi), les écarts avec les maquettes, les questions posées, les commits.
