# 128 — Ouvrir l'envoi d'emails et tenir la charge, avec 100 € par an

- **Décidé par Julien le 25 novembre 2026** : 100 emails par événement et par jour, 200 par compte et par jour, 10 000 par mois pour toute l'application ; au plafond du mois, « Suspendre les emails », rien d'autre ; il s'abonne le 25 novembre.
- **Vient de** : l'ancien plan, « Lot 34 » et section 7
- **Dépend de** : 129 (les plafonds, « Suspendre les emails »), 130 (ne plus recevoir d'emails), 171 (changer la clé : l'ancien plan le demandait avant ce lot)
- **Migration** : à voir (les plafonds par événement et par compte)
- **Maquettes** : `EnvoiSuspendu` (ce que voit l'organisateur quand l'envoi est coupé) ; pas d'autre écran nouveau

## Objectif

Aujourd'hui l'envoi d'emails tient sur une offre gratuite : 3 000 emails par mois et 100 par jour. Dès que quelques événements envoient leurs liens le même jour, ça bloque. Ce ticket passe l'envoi sur un abonnement payant et bon marché, garde le fournisseur d'aujourd'hui en secours, et pose des plafonds pour qu'un abus ne coûte rien.

## Ce qui a changé depuis l'ancien plan

- **Plus de demandes** : un compte organise 3 Secret Santa sans rien demander (ticket 109), un événement a 30 membres au plus (ticket 117). Les « groupes par compte », les « participants par édition » et la « demande pour en avoir plus » de l'ancien lot n'existent plus.
- **Les prix relevés le 24 novembre 2026**, à relire par Julien avant de s'abonner : l'envoi d'emails de Cloudflare est en bêta publique, réservé à l'offre payante de Workers, avec 3 000 emails compris par mois puis 0,35 $ les 1 000 (https://developers.cloudflare.com/email-service/platform/pricing/). L'offre gratuite de Resend reste à 3 000 emails par mois et 100 par jour ; son offre payante commence à 20 $ par mois pour 50 000 emails (https://resend.com/pricing).

## À lire d'abord

- `docs/refonte/PLAN.md`, « Lot 34 » et section 7 : les raisons et les chiffres d'origine
- `server/http/email.ts`, ce que le ticket 129 a codé (les plafonds, l'interrupteur)
- `docs/spec/v3/administration.md`

## À faire

- [ ] **Julien** : passer le compte Cloudflare sur l'offre payante de Workers ; vérifier que le domaine est géré chez Cloudflare ; activer l'envoi d'emails et laisser poser ses enregistrements DNS ; fixer la limite de dépense (case du ticket 129).
- [ ] **L'envoi par deux fournisseurs** (`server/http/email.ts`) : Cloudflare d'abord ; Resend en secours si l'envoi échoue ou si le quota du jour est atteint. Les emails ne changent pas. Le tableau de bord compte les deux.
- [ ] **Un plafond d'emails par événement et par jour, et un par compte et par jour** : **100 par événement, 200 par compte**. Un événement plein, 30 membres, qui invite, tire et rappelle le même jour en envoie 90. Au-delà, l'organisateur partage les liens par son téléphone, ce qui ne coûte rien, et l'écran le lui dit avant qu'il touche la limite.
- [ ] **Un plafond d'emails par mois pour toute l'application**, **10 000 au départ**, réglable par le super-admin (il remplace les 3 000 de l'offre gratuite, `EMAIL_CAPS`) : à 70 % il est prévenu, à 100 % « Suspendre les emails » se déclenche (ticket 129). Les liens de connexion partent toujours.
- [ ] **Les textes de capacité** d'aujourd'hui (« L'application approche de sa capacité gratuite… ») s'en vont.
- [ ] README 7.2, 8, 13.3, 15 et 16 à jour ; tests des plafonds et du secours.

## Hors périmètre

- La page de présentation et « Un café ? » (tickets 125 et 126).

## C'est fini quand

- [ ] Un email part par Cloudflare ; si Cloudflare échoue, il part par Resend, et le tableau de bord le montre.
- [ ] Un événement qui dépasse son plafond du jour le sait avant d'envoyer, et peut encore partager ses liens à la main.
- [ ] `/controle` passe.

## Compte rendu

À remplir par Claude Code à la fin : ce qui a été fait, ce qui a été décidé seul (et pourquoi), les écarts avec les maquettes, les questions posées, les commits.
