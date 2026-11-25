# 171 — Pouvoir changer la clé du serveur

- **Vient de** : l'ancien plan, « Lot 38 A » (« à écrire avant le lot 34 », aujourd'hui le ticket 128)
- **Dépend de** : rien ; à faire avant le 128
- **Migration** : à voir
- **Maquettes** : aucune

## Objectif

Aujourd'hui, `NUXT_DATA_KEY` ne peut pas être changée : les résultats des tirages et les liens personnels en dépendent, et rien ne sait les rechiffrer. Si la clé fuit, on ne peut donc rien faire. Ce ticket écrit le script et la marche à suivre pour la changer sans rien perdre. Décidé par Julien le 25 novembre 2026.

## À lire d'abord

- `docs/refonte/PLAN.md`, « Lot 38 A », la case « La clé des résultats et les sauvegardes »
- README, section 16 (la procédure d'export et de garde de la clé)
- Le code qui se sert de la clé : les résultats, les liens personnels, les empreintes des adresses (ticket 130), les codes de connexion (ticket 123), les tickets signés des listes en direct

## À faire

- [x] **Faire la liste** de tout ce qui dépend de la clé, et pour chaque chose dire ce qui arrive quand elle change : rechiffré, recalculé, ou perdu et sans gravité (un code de connexion d'un quart d'heure). L'écrire dans le README 16.
- [x] **Le script** : lit avec l'ancienne clé, écrit avec la nouvelle, en une fois ou par lots repris sans dégât s'il est interrompu. Il se lance d'abord « à blanc » et dit ce qu'il ferait.
- [x] (Q-043, réponse de Julien : A et B) **Le cas des empreintes** (les adresses qui ont refusé nos emails) : on ne peut pas recalculer une empreinte sans l'adresse. Dire dans `questions.md` ce que tu proposes avant de coder ce point.
- [x] **La marche à suivre** pour Julien, dans le README 16, pas à pas : exporter la base, essayer sur une copie locale de la production, changer le secret chez Cloudflare, lancer le script, vérifier, et comment revenir en arrière.
- [x] Un test sur une base de test : après le changement, un résultat se lit, un lien personnel s'ouvre, une adresse bloquée le reste.

## Hors périmètre

- Changer la clé pour de bon en production : c'est Julien qui le décide et le fait.

## C'est fini quand

- [x] Sur une copie locale, la clé change et rien n'est perdu de ce qui doit rester. (Sur la base locale de développement : 105 valeurs réécrites, toutes ouvertes par la nouvelle clé.)
- [x] La marche à suivre est écrite, avec le retour en arrière.
- [x] `/controle` passe.

## Compte rendu

- **L'inventaire**, dans le README 16 : ce qui est chiffré (les receveurs des tirages, les réponses d'un tirage fait ailleurs, les liens personnels) est rechiffré ; les empreintes d'adresses (refus, « déjà écrit ») ne changent pas ; les codes de connexion, le `p=` signé des listes et les tickets du direct se perdent sans gravité ; les liens « stop » et « signaler » des emails déjà partis marchent encore trois mois.
- **Le script** `pnpm cle:changer <export.sql> [--ecrire <sortie.sql>]` (`scripts/rotate-key.ts`), les clés par l'environnement (`ANCIENNE_CLE`, `NOUVELLE_CLE`), jamais en argument. Il charge l'export dans une base SQLite à côté (supprimée à la fin), lit tout (`readRotationInput`, `server/database/rotateKey.ts`), prévoit (`planRotation`, `server/utils/rotateKey.ts`) et, avec `--ecrire`, écrit le SQL à appliquer avec `wrangler d1 execute --file`. Chaque `UPDATE` ne touche une valeur que si elle est encore celle qui a été lue : appliqué deux fois, ou repris après une coupure, il ne fait aucun dégât. À blanc par défaut.
- **La marche à suivre**, dans le README 16 : exporter, créer et ranger la nouvelle clé, à blanc, essayer sur une copie (l'export plus le fichier, relu avec la nouvelle clé), en production d'un trait (nouvel export, fichier, secret, fichier appliqué), vérifier, revenir en arrière (l'ancienne clé, et l'export ou le script dans l'autre sens), supprimer les fichiers.
- **Essayé** sur la base locale de développement (migrée en local jusqu'à 0053 pour l'occasion) : 105 valeurs à réécrire ; après le fichier, la nouvelle clé les ouvre toutes et l'ancienne aucune ; appliqué deux fois, rien ne bouge de plus. Les fichiers de l'essai sont supprimés.
- **Décidé seul** : l'empreinte d'une adresse (`emailPrint`, `plainAddress`) sort de `stopEmail.ts` dans `server/utils/emailPrint.ts`, sans changer son calcul, pour que le script la lise sans les textes de l'application ; les fichiers qui l'importaient suivent.
- **Q-043, réponse de Julien (25 novembre 2026) : A et B.** Les empreintes d'adresses prennent leur propre secret, `NUXT_PRINT_KEY`, qui vaut la clé tant qu'il n'est pas posé : au changement, on le pose à l'ancienne clé, aucune empreinte ne change, aucun refus ne se perd ; le script ne touche donc plus aux empreintes (l'arrêt et `--perdre-refus` sont retirés). `NUXT_DATA_KEY_PREVIOUS`, posé à l'ancienne clé pendant trois mois, fait encore lire les liens « stop » et « signaler » des emails déjà partis (`readWithEither`, testé). README 15 et 16 à jour.
- **Tests** : `server/utils/rotateKey.test.ts` (une valeur relue la même, une valeur déjà réécrite laissée, les instructions gardées, les clés refusées) ; `server/utils/stopEmail.test.ts` (un lien signé lu avec la clé d'avant) ; `tests/rotate-key.test.ts`, sur une base de test : après le changement, un résultat se lit, un lien personnel s'ouvre, une adresse bloquée le reste, et deux applications ne font pas de dégât.
- **Migration** : aucune. **Contrôle** : `pnpm controle --e2e` passé.
