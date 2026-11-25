# 127 — Le tableau de bord du super-admin

- **Décidé par Julien le 25 novembre 2026** : « listes » sans flèche, « emails envoyés » mène aux plafonds ; les requêtes et la dépense se lisent chez Cloudflare avec un jeton en lecture seule (Q-039), jamais comptées en base ; les prix sont en configuration.
- **Vient de** : l'ancien plan, « Lot 37 » ; README 22.27
- **Dépend de** : 129 (les interrupteurs, les chiffres du jour, les plafonds) ; 132 pour la ligne « Signalements » ; 121 pour « Résumé du matin »
- **Migration** : oui (les compteurs par jour, le dernier passage des tâches planifiées), si le 129 ne les a pas déjà posés
- **Maquettes** : `V3Admin` (toute la page), `AdminOnglet` (la pastille), `V3AdminComptes`, `AdminGroupes` (les événements)

## Objectif

Le super-admin ouvre « Admin » et voit en une page si l'application va bien : qui s'en sert, ce qui attend une décision, ce qu'il faut surveiller, ce que coûte le mois, et si ce qui tourne tout seul a bien tourné. Aujourd'hui la page a une jauge « Capacité », deux listes et un interrupteur.

## Ce que le 129 a déjà fait (ne pas le refaire)

Les trois interrupteurs d'urgence ; les chiffres du jour (requêtes refusées pour débit, connexions échouées, erreurs du serveur, adresses qui refusent, emails rejetés) ; les plafonds avec leur jauge et l'avertissement à 70 %. Ce ticket les range dans la page et ajoute le reste.

## À lire d'abord

- `docs/spec/v3/administration.md`
- `docs/refonte/PLAN.md`, « Lot 37 » et ses points à relire (section 6) : l'intention, pas les mots (il parle encore de groupes et de demandes)
- `app/pages/admin/index.vue`, ce que le ticket 129 a codé

## À faire

- [ ] **L'ordre de la page**, celui de `V3Admin` : « Qui s'en sert », « À traiter et à surveiller », « Les plafonds », « En cas d'urgence », « Ce qui tourne tout seul », « Version en ligne », « Outils ». La jauge « Capacité », sa phrase et le bloc « Tout voir » disparaissent.
- [ ] **Le cœur, en fonctions pures**, testé d'abord : additionner des compteurs par jour sur une période ; la part d'un plafond ; ce qui entre dans la pastille.
- [ ] **Base** : un compteur par jour et par nature (comptes créés, comptes actifs, événements créés, listes créées, emails envoyés, emails rejetés, erreurs), **sans identifiant de personne** ; les requêtes ne se comptent pas en base (Q-039). Un compte actif se compte une fois par jour, à partir d'une empreinte qui change chaque jour. Les totaux « depuis le début » se lisent dans les tables qui existent.
- [ ] **« Qui s'en sert », quatre tuiles** : comptes (« +12 · 61 actifs »), événements (« +3 · 9 Secret Santa en cours »), listes (« +9 · 27 partagées »), emails envoyés (« +212 »). Le grand chiffre est le total depuis le début ; la ligne dessous suit la période.
- [ ] **La période**, sous les tuiles, dans `UiSegmented` : « 7 jours », « 30 jours », « 12 mois ». Une phrase dessous dit ce que les chiffres comptent.
- [ ] **Où mènent les tuiles** : « comptes » à la liste des comptes, « événements » à la liste des événements. « emails envoyés » descend à « Les plafonds ». « listes » ne mène nulle part : pas de flèche.
- [ ] **« À traiter et à surveiller », une seule liste** : en tête ce qui attend une décision, avec une pastille (« Signalements », quand le 132 est fait) ; dessous, de simples chiffres. Une ligne n'a une flèche que si elle mène à une liste qui existe (les comptes à leur limite, les événements à 30 membres, les adresses qui ont refusé).
- [ ] **La pastille de l'onglet « Admin »** ne compte que ce qui attend une décision (`administration.md`) : les signalements. Un plafond à 70 % n'y entre pas : il arrive dans « Quoi de neuf » du super-admin, comme une nouveauté qui presse.
- [ ] **« Ce qui tourne tout seul »** : une ligne par tâche planifiée (le résumé du matin, les rappels avant le jour J, « Devine qui »), avec son dernier passage et ce qu'il a fait (« Passé aujourd'hui à 8 h 02 · 34 emails »). Une tâche qui n'est pas passée depuis plus d'un jour, ou qui a échoué, le dit en rouge.
- [ ] **« Version en ligne »** : l'identifiant du commit déployé et sa date, inscrits au moment du déploiement.
- [ ] **« Requêtes, aujourd'hui » et « Dépense, ce mois »** (Q-039, la piste A) : lues chez Cloudflare par son API d'analyse, avec un jeton en lecture seule (`NUXT_CLOUDFLARE_API_TOKEN`, que Julien crée), au plus une fois par heure. Sans jeton, les deux jauges ne s'affichent pas et la ligne vers le tableau de bord de Cloudflare reste. La dépense se calcule avec des prix écrits en configuration, et l'écran dit la date de leur relevé.
- [ ] Aucun outil de mesure extérieur, aucun cookie de plus.
- [ ] Trois langues, tournures neutres, tests.

## Hors périmètre

- Des courbes : des chiffres et des jauges suffisent pour cette version.
- Les demandes de l'ancien plan : elles n'existent plus (la limite de 3 Secret Santa par compte, la pause).

## C'est fini quand

- [ ] La page a les sept blocs de `V3Admin`, dans l'ordre, avec de vrais chiffres.
- [ ] Changer la période change la ligne sous chaque tuile, pas le grand chiffre.
- [ ] Aucune donnée de comptage ne permet de retrouver une personne.
- [ ] `/controle` passe.

## Compte rendu

À remplir par Claude Code à la fin : ce qui a été fait, ce qui a été décidé seul (et pourquoi), les écarts avec les maquettes, les questions posées, les commits.
