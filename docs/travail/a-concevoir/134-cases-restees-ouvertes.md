# 134 — Les cases restées ouvertes dans l'ancien plan

- **État** : triées le 24 novembre 2026. Il reste quatre choses pour Julien (rapport de conception du 25 novembre), une pour Claude Code. Ce fichier se ferme quand elles sont faites.
- **Vient de** : `docs/refonte/PLAN.md`, des lots et des corrections par ailleurs terminés
- **Dépend de** : rien

| Où (ancien plan) | Ce qui reste | Ce que la conception en fait |
|---|---|---|
| « Publier les listes » (migrations 0028 à 0032) | Rien | **Fermé** : la production était à 0033 avant la bascule, et la V3 est en ligne. |
| Lot 27 bis | « Suivre » une liste sans personne : une seule cloche | **Rangé dans le ticket 122** (une case ajoutée). |
| Lot 6, journal | `JournalPersonne` : le filtre « Moi » | **Pour Claude Code** : vérifier en cinq minutes si les lignes du journal portent la personne concernée. Si oui, une case dans un ticket de ménage ; sinon, on ferme. |
| Correction 23 | La double authentification sur Cloudflare, GitHub, Resend et la boîte email du super-admin | **Fermé** : déjà fait (Julien, 24 novembre 2026). Rien à coder. |
| Lot 38 A | La politique de contenu (CSP) est en mode rapport | **Pour Julien** : lire une semaine de rapports sur la V3, puis demander à Claude Code de la passer pour de bon (un petit ticket). |
| Correction 29 | axe (`@axe-core/playwright`) sur une liste tenue et une liste visitée | **Pour Julien** : autoriser l'installation. La conception le recommande : c'est le seul contrôle d'accessibilité automatique. |
| Correction 17 | Dire qui a fait quoi entre organisateurs (« Dernier rappel le 20 décembre, par Hugo ») | **Une décision de Julien** : garder ou non qui a fait l'action. La conception propose de le garder pour les envois seulement. |
| Lot 38 A | Changer `NUXT_DATA_KEY` demande un script de re-chiffrement | **Une décision de Julien** : la conception propose un ticket, après les 130 à 132. Sans ce script, une clé qui fuit ne se change pas. |
