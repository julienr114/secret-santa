# Le registre des données personnelles

**Brouillon écrit par Claude Code le 25 novembre 2026 (ticket 131), à relire par Julien.** Ce n'est pas un avis juridique ; rien ici ne se dit « conforme ». Les durées sont celles que Julien a décidées (ticket 131, README 22.26).

Le responsable : Julien, qui fait et héberge l'application. L'adresse de contact est dans la configuration : elle n'existe pas encore (`bonjour@under-the-tree.party` est prévue).

## Les traitements

| Traitement | À quoi il sert | Les données | Qui les voit | Combien de temps |
|---|---|---|---|---|
| Les comptes (`accounts`, `sessions`) | Se connecter, retrouver ses événements et ses listes | Adresse email, prénom, icône, langue, choix des emails, date de dernière visite | La personne ; les organisateurs de ses événements (adresse, prénom) ; le super-admin (adresse, événements, dernière visite) | Trois ans sans visite, puis suppression après un email qui prévient |
| La connexion (`login_links`, `login_codes`) | Envoyer un lien ou un code | Empreinte du lien ou du code, empreinte de l'adresse IP (pour limiter les essais) | Personne | Un quart d'heure d'usage ; à purger |
| Les événements et leurs membres (`parties`, `persons`, `party_organisers`) | Organiser une fête, un Secret Santa | Prénom, nom s'il faut distinguer deux homonymes, adresse si on la donne, icône, langue | Les membres de l'événement ; l'adresse, les organisateurs | Tant que l'événement existe |
| Le tirage (`participations`, `assignments`, `draw_answers`) | Dire à chacun à qui il offre | Le lien personnel et le receveur, **chiffrés** avec la clé du serveur | La personne seule ; l'organisateur en dernier recours, un résultat à la fois, inscrit au journal | Des anciens Secret Santa, il ne reste que ce qui sert à la règle « pas la même personne » |
| Le journal d'un événement (`audit_log`) | Que la triche se voie | Qui a fait quoi, quand ; jamais qui a tiré qui | Tous les membres | Aussi longtemps que l'événement (décidé le 25 novembre 2026) |
| Les listes de cadeaux (`gift_lists`, `gift_list_people`, `family_members`, `gift_list_ideas`, `gift_claims`…) | Dire ce qui ferait plaisir, ne pas offrir deux fois | Prénoms, âge ou date de naissance, tailles, goûts, idées ; qui coche (ou « Anonyme ») | Ceux que choisit celui qui tient la liste ; avec un lien public, toute personne qui a le lien (jamais les moteurs de recherche) | Tant que la liste existe |
| Les nouveautés (`news`) | « Quoi de neuf » | Ce qui s'est passé, pour un compte | Le compte seul | Trente jours après avoir été vues |
| Les emails (`email_blocks`, `email_seen`, `email_reports`) | Ne jamais écrire à qui a refusé ; dire au premier email d'où vient l'adresse ; les envois signalés | Empreinte de l'adresse (jamais en clair), la raison, la date | Le super-admin (les signalements) | Le refus, tant qu'il tient (la CNIL recommande au moins trois ans) |
| Les notifications du téléphone (`push_subscriptions`) | Prévenir de ce qui presse | L'adresse de l'appareil chez son service de notifications, ses clés | Personne ; le message passe chiffré par le service du téléphone (Apple, Google, Mozilla), qui ne peut pas le lire | Jusqu'à ce que l'appareil se désabonne ou que son service l'oublie |
| Les compteurs (`app_counters`) | Rester sous les plafonds de l'offre gratuite | Des nombres par jour, sans personne | Le super-admin | À décider |
| Les journaux de sécurité et de modération (ticket 132) | Comprendre un abus | À venir avec le ticket 132 | Le super-admin | Un an (CNIL : six mois à un an) |

## Où sont les données

- **Cloudflare** : l'application (Workers) et sa base (D1).
- **Resend** : l'envoi des emails (l'adresse, l'objet, le texte).
- **Les services de notifications** des téléphones (Apple, Google, Mozilla) : seulement l'adresse de l'appareil et un message chiffré qu'ils ne peuvent pas lire (Q-044).

Leurs contrats de sous-traitance et le pays des serveurs : à vérifier et à noter ici.

## Ce qui n'est jamais demandé ni gardé

Un mot de passe, un numéro de téléphone, une position. Aucune publicité, aucun traceur, aucune revente. Un seul cookie, celui de la session.

## En cas de fuite

1. **Arrêter la fuite** : couper ce qui fuit (déployer une correction, suspendre les emails ou les inscriptions depuis `/admin`), et exporter la base pour garder l'état.
2. **Mesurer** : quelles données, combien de personnes, depuis quand. Noter chaque constat, daté, dans un fichier hors du dépôt.
3. **La clé a fui** : la changer (README 16, « Changer la clé ») ; régénérer les liens personnels des tirages en cours.
4. **Prévenir la CNIL sous 72 heures** quand la fuite présente un risque pour les personnes (RGPD, article 33), par son téléservice de notification.
5. **Prévenir les personnes** quand le risque est élevé (article 34) : un email simple, ce qui s'est passé, ce qu'elles peuvent faire.
6. **Garder la trace** de la fuite, même sans notification : ce qui s'est passé, ses effets, ce qui a été fait.
