# 134 — Les cases restées ouvertes dans l'ancien plan

- **Vient de** : `docs/refonte/PLAN.md`, des lots et des corrections par ailleurs terminés
- **Dépend de** : rien

Sept cases isolées, gardées ici pour ne pas les perdre. Chacune devient un ticket, une ligne d'un autre ticket, ou se ferme.

| Où (ancien plan) | Ce qui reste | Ce qu'il faut pour avancer |
|---|---|---|
| Lot 6, journal | `JournalPersonne` : le filtre « Moi », seulement si les événements portent déjà la personne concernée | Vérifier dans le code ; à fondre dans le ticket 110 |
| Correction 17 | Dire qui a fait quoi entre organisateurs (« Dernier rappel le 20 décembre, par Hugo ») ; demande de garder qui a fait l'action | Une décision de Julien : garder cette donnée ou non |
| Correction 23 | **Julien, dix minutes** : la double authentification sur Cloudflare, GitHub, Resend et la boîte email du super-admin | Rien à coder |
| Correction 29 | axe (`@axe-core/playwright`) sur une liste tenue et une liste visitée : l'installation avait été refusée par les permissions de la session | Julien autorise l'installation |
| Lot 27 bis | « Suivre » une liste sans personne : une seule cloche pour toute la liste | Avec le ticket 122 |
| Lot 38 A | La politique de contenu (CSP) : faite en mode rapport, à passer pour de bon après une semaine de rapports | Julien lit les rapports |
| Lot 38 A | La clé des résultats : changer `NUXT_DATA_KEY` n'est pas possible sans un script de re-chiffrement | Décider si ce script vaut un ticket |

**Et une chose à faire par Julien avant tout le reste : publier les listes.** Les migrations `0028_list_holders`, `0029_holder_levels`, `0030_carried_from`, `0031_amusing_pete_wisdom` et `0032_anonymous_mode` sont à appliquer avant de déployer, dans cet ordre ; le premier déploiement crée l'objet durable des listes en direct (Correction 30 de l'ancien plan).
