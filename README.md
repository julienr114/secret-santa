# Secret Santa familial — plan de réalisation

> Document de passation. Il décrit **tout ce qui a été décidé** avec Julien (le porteur du projet) avant d'écrire la moindre ligne de code. Un agent qui reprend le projet doit pouvoir démarrer avec ce seul fichier.
>
> État au 13 novembre 2026 : **plan v5, étapes 1 à 5 bis terminées** (socle, cœur métier, administration, pilotage d'une édition, parcours participant, liste de souhaits). Le tout est déployé sur https://under-the-tree.party depuis le 13 novembre 2026 (déploiement manuel, `pnpm deploy`). Prochaine étape : l'étape 7 (finitions), dont l'écran `/admin/[groupe]/journal`, pas encore fait.
>
> Changements de la v7 (13 novembre 2026, à la demande de Julien) : **trois langues**, français, anglais et allemand, pour toute l'application (section 21). Chaque personne a une **langue préférée** : sa page, ses messages, ses emails et le journal qu'elle lit suivent cette langue. L'application s'appelle désormais **Under the Tree** dans l'interface ; « Secret Santa » reste le nom du jeu dans les messages. La contrainte « interface entièrement en français » de la section 1 est levée.
>
> Changements de la v6 (13 novembre 2026, à la demande de Julien) : **un nom de domaine payant**, `under-the-tree.party`, acheté chez Cloudflare Registrar (la contrainte « 0 € » devient « le prix du domaine, rien d'autre »). L'application y est servie par un Custom Domain du Worker ; l'adresse `workers.dev` reste active. Le domaine ouvre la voie à un **envoi groupé par email** (Resend, offre gratuite), en option par groupe activable par le super-admin seulement, le partage par téléphone restant le fonctionnement par défaut (section 13.3).
>
> Changements de la v2, demandés par Julien : ajout de la **liste de souhaits** par participant (section 6 bis), passage de TypeScript à **JavaScript**, adoption de **TanStack Query** côté client, et formalisation des **guidelines de code** (section 7.1).
>
> Changements de la v3, issus de l'étape 0 : **plus aucun email**, le gardien envoie les liens par WhatsApp grâce aux liens officiels **« click to chat » (`wa.me`)** qui ouvrent la conversation avec le message prérempli (section 13) ; **Nuxt 4** au lieu de Nuxt 3 ; preset **Cloudflare Workers** ; conclusions des vérifications en section 7.2.
>
> Changements de la v5 (13 novembre 2026, à la demande de Julien) : **plus de code à 6 chiffres**, le lien personnel suffit (jeton de 256 bits, impossible à deviner) ; **plus rien de WhatsApp** (ni numéros, ni `wa.me`), le gardien partage les liens avec la **feuille de partage du téléphone** ; ce qui compte est de **savoir qui a consulté** son résultat (pastille, compteur, journal). Règles `inscription_obligatoire`, `tentatives_code_max` et `exclure_conjoint` supprimées ; **plus de notion de couple** : un seul mécanisme générique, les **exclusions** (réciproques par défaut), qui couvre couples, fratries, parents (migration `0002`, couples convertis). Fond papier plus clair.
>
> Changements de la v4 (13 novembre 2026, à la demande de Julien) : **retour à TypeScript strict** partout (aucun fichier `.js` dans le dépôt), **Nuxt UI 4** comme bibliothèque de composants, thème « carte de Noël » (rouge brique, vert sapin, papier crème, titres en Fraunces), **imports par alias** (`#server/…`, `~/…`, `~~/…`) au lieu des chemins relatifs profonds. Là où la suite du document parle de JavaScript, de JSDoc, de `jsconfig.json` ou de fichiers `.js`, lire TypeScript et `.ts`.

---

## 1. Le besoin en bref

Une petite application web pour organiser le tirage au sort du Secret Santa de plusieurs familles.

- Chaque participant découvre **en privé** la personne à qui il offre un cadeau.
- Le tirage respecte des règles : pas soi-même, pas une personne exclue (conjoint, frère ou sœur…), pas la même personne que les années précédentes.
- Un **gardien** (admin) pilote le tout sans jamais voir les résultats, et peut « rejouer » un envoi si quelqu'un n'a pas reçu ou a perdu son résultat, **sans trahir le secret**.
- Les participants sont, selon Julien, « tous des gros tricheurs » : l'application doit être **verrouillée et la triche visible de tous**.
- **Coût : 0 €.** Hébergement, base de données et envois compris.
- **Mobile first** : presque tout le monde l'utilisera sur téléphone.

### Contraintes fermes

| Contrainte | Détail |
|---|---|
| Gratuit | Aucun service payant, aucun nom de domaine à acheter |
| Mobile first | Conçu pour le téléphone d'abord, utilisable sur ordinateur ensuite |
| Secret | Personne d'autre que le participant ne voit son résultat dans l'interface, gardien compris |
| Anti-triche | Lien personnel impossible à deviner + journal public des consultations (v5 : plus de code) |
| Sans service d'envoi | Aucun email, aucune API d'envoi : le gardien partage chaque lien avec la feuille de partage de son téléphone (WhatsApp, SMS…) |
| Multi-familles | Plusieurs groupes cloisonnés dans une seule application |
| Pluriannuel | Participants et exclusions évoluent d'une année sur l'autre, l'historique est conservé |
| Langue | Interface entièrement en français |

---

## 2. Décisions prises (et pourquoi)

Ces points ont été tranchés avec Julien. Ne pas les rouvrir sans lui demander.

1. **Partage des liens par la feuille de partage du téléphone** (décision v5, remplace les liens WhatsApp `wa.me` de la v3). L'email gratuit a été écarté à l'étape 0 (sans nom de domaine, Resend refuse tout destinataire autre que soi-même et Brevo réécrit l'expéditeur). Le gardien touche « Partager » sur un participant : le téléphone propose WhatsApp, SMS, etc., avec le message et le lien prêts. Sur ordinateur, sans feuille de partage, le message est copié. Aucun numéro de téléphone n'est stocké.
2. **Le message ne contient jamais le résultat.** Il ne contient qu'un lien personnel. Le résultat ne s'affiche que dans l'application, après un geste explicite du participant (bouton « Découvrir »).
3. **Le lien personnel suffit** (décision v5, remplace « lien + code à 6 chiffres »). Le jeton fait 32 octets aléatoires (256 bits) : impossible à deviner. La protection contre la triche repose sur le **journal public** (chaque consultation y apparaît avec son compteur) et sur la **régénération** d'un lien transféré par erreur. Ce qui compte pour le gardien : savoir qui a consulté son lien.
4. **Journal public par groupe** : toutes les actions sensibles y sont listées, sans jamais indiquer qui a tiré qui.
5. **Pas de chiffrement de bout en bout.** Julien est le gardien du secret et assume ce rôle. Les résultats sont chiffrés en base avec une clé détenue par le serveur. L'hébergeur de l'application peut donc techniquement les lire : c'est accepté.
6. **Plusieurs groupes** (Julien a deux familles), chacun avec **son propre gardien** et **ses propres règles**.
7. **Participants modifiables chaque année** : ajout, retrait, mise à jour des exclusions.
8. **Tirage unique par édition**, avec une procédure explicite et journalisée d'annulation/relance.
9. **Hébergement Cloudflare Workers** (application + base D1) : un seul compte, sans carte bancaire, et la base ne se met pas en veille alors que l'application ne sert qu'un mois par an. Preset Nitro `cloudflare_module`, déploiement par Workers Builds à chaque `git push` (vérifié à l'étape 0).
10. **Stack Nuxt 4 / TypeScript strict** (v4 : retour à TypeScript, Nuxt UI pour l'interface ; historique : décision v2, remplace « TypeScript strict » ; v3 : Nuxt 4 au lieu de Nuxt 3, car c'est la version stable que ciblent aujourd'hui la documentation et les modules, et l'arborescence `app/` prévue ici est la sienne) : Vue 3 et Nuxt sont la stack que Julien maîtrise ; le code est écrit en **JavaScript moderne (ESM)**, typé par JSDoc là où c'est utile, sans étape de compilation TypeScript. Back-end en **routes serveur Nitro**, base via **Drizzle ORM**, appels API côté client via **TanStack Query (Vue)**. Pinia n'est plus prévu : TanStack Query porte l'état serveur, le reste tient dans des `ref` locaux.
11. **Liste de souhaits** (décision v2) : chaque participant peut saisir quelques idées de cadeaux ; son donneur les découvre **uniquement** sur l'écran de résultat, après saisie du code. La liste ne révèle jamais qui a tiré qui. Détails en section 6 bis.
12. **Programmation fonctionnelle et standards de l'industrie** (décision v2) : fonctions pures pour tout le métier, effets de bord repoussés dans les routes, ESLint + Prettier, tests Vitest sur la logique métier, Git en petits commits. Détails en section 7.1.

### Hors périmètre

- Tout envoi sans action du gardien : API WhatsApp, SMS et, depuis la v3, email.
- Chiffrement de bout en bout.
- Messagerie anonyme, paiement, application native.
- Dans la liste de souhaits : réservation d'un cadeau (« je le prends ») et notification du donneur quand la liste change.
- Comptes utilisateurs ou code secret pour les participants (le lien suffit, décision v5).

---

## 3. Vocabulaire

| Terme | Sens |
|---|---|
| **Groupe** | Une famille. Cloisonné des autres groupes. |
| **Gardien** | L'admin d'un groupe. Gère participants, tirage et envois, ne voit pas les résultats. |
| **Super-admin** | Julien. Crée les groupes et nomme les gardiens. |
| **Personne** | Un membre d'un groupe. Persiste d'une année sur l'autre. |
| **Édition** | Un Secret Santa donné (ex. « Noël 2026 ») dans un groupe. |
| **Participation** | La présence d'une personne dans une édition. Porte le lien personnel. |
| **Attribution** | Le résultat du tirage : « X offre à Y ». |
| **Journal** | La liste publique des événements d'un groupe. |
| **Souhait** | Une idée de cadeau saisie par un participant pour une édition. Visible par son donneur après le tirage. |

Une personne présente dans deux familles est enregistrée **deux fois** (une personne par groupe), avec un lien distinct.

---

## 4. Parcours

### 4.1 Cycle de vie d'une édition

```
brouillon ──► invitations ──► tirée ──► clôturée
                  ▲              │
                  └── annulation du tirage (journalisée)
```

| Statut | Ce qui est possible |
|---|---|
| `brouillon` | Le gardien compose la liste des participants et les exclusions, règle les paramètres. |
| `invitations` | Le gardien partage les liens. Chacun ouvre le sien et peut commencer sa liste de souhaits. La liste des participants reste modifiable. |
| `tirée` | Le tirage est fait. La liste des participants est verrouillée. Chacun peut consulter son résultat et les souhaits de son receveur, et continuer à modifier ses propres souhaits. |
| `clôturée` | Après la fête. Lecture seule, souhaits compris. Sert d'historique pour l'exclusion de l'année suivante. |

### 4.2 Parcours du gardien

1. Se connecte à l'admin de son groupe (mot de passe).
2. Crée l'édition. L'application **reprend les participants de l'édition précédente** (les exclusions appartiennent au groupe et restent valables).
3. Coche qui participe, ajoute les nouveaux, désactive les absents, met à jour les exclusions.
4. Passe en `invitations` : pour chaque participant, touche « Partager » ; la feuille de partage du téléphone s'ouvre avec le message et le lien, il choisit WhatsApp (ou autre) et le contact.
5. Suit les statuts : *envoyé*, *souhaits renseignés* (nombre d'idées, jamais leur contenu), *consulté* (combien de fois, et quand).
6. Lance le tirage quand la vérification est verte.
7. Prévient chacun que le tirage est fait, par le même procédé : le message « Le tirage est fait » est prêt sur chaque carte (même lien).
8. En cas de pépin : repartage un lien, régénère un lien transféré par erreur.
9. Après la fête : clôture l'édition.

### 4.3 Parcours du participant

1. Reçoit son lien personnel (WhatsApp, SMS…), partagé par le gardien.
2. Ouvre son lien : pas de code, pas de compte.
3. Avant le tirage : voit un écran d'attente (« Le tirage n'a pas encore eu lieu ») avec une invitation à remplir sa liste de souhaits.
4. À tout moment avant la clôture : renseigne ou modifie sa **liste de souhaits** (quelques idées, avec un lien facultatif). Le lien suffit (v5).
5. Après le tirage : touche « Découvrir à qui j'offre un cadeau », voit « Tu offres un cadeau à **Prénom** », avec le budget et la date si renseignés, puis la **liste de souhaits de Prénom** (ou « Prénom n'a pas encore donné d'idée »). C'est ce geste, et non la simple ouverture du lien, qui compte comme consultation : les aperçus automatiques de liens (WhatsApp, iMessage) ne le déclenchent pas.
6. Peut revenir consulter son résultat autant de fois qu'il veut. Chaque consultation est comptée et journalisée.
7. Peut consulter le journal de son groupe.

### 4.4 Cas « rejouer sans trahir le secret »

| Situation | Action du gardien | Effet |
|---|---|---|
| Message non reçu ou effacé | « Partager » à nouveau, ou « Copier le lien » | Même lien, journalisé |
| Lien perdu | Idem | Idem |
| Lien compromis (transféré par erreur) | « Régénérer le lien » | L'ancien lien ne marche plus, journalisé |
| Désistement ou ajout après le tirage | « Annuler et relancer le tirage » | Voir 6.5 |

Dans aucun de ces cas le gardien ne voit le résultat.

---

## 5. Règles paramétrables par groupe

Réglables par le gardien, avec une valeur par défaut au niveau du groupe et une surcharge possible par édition.

| Règle | Défaut | Description |
|---|---|---|
| `exclure_annees_precedentes` | 1 | « Éviter de retomber sur la même personne » : non, l'an dernier, les 2 ou les 3 dernières années (0 à 3) |
| `exclusions_manuelles` | aucune | Paires interdites supplémentaires (ex. « A ne tire jamais B »), à sens unique ou réciproques |
| `budget` | vide | Texte libre affiché sur la page de résultat (ex. « 20 € max ») |
| `date_evenement` | vide | Date de la fête, affichée sur la page de résultat |
| `message_gardien` | vide | Petit mot affiché sur la page de résultat |
| `liste_souhaits` | oui | Active la liste de souhaits pour le groupe. Si non, l'écran et les routes correspondants sont masqués |
| `souhaits_max` | 10 | Nombre maximal d'idées par participant et par édition |

---

## 6. Le tirage

### 6.1 Contraintes

Pour chaque participant *donneur*, le *receveur* doit être :

- un autre participant de la même édition ;
- différent du donneur ;
- différent des receveurs qu'il a eus lors des N dernières éditions clôturées ou tirées du groupe (si `exclure_annees_precedentes` ≥ 1), **uniquement si le donneur participait à ces éditions** ;
- absent de ses exclusions manuelles.

Chaque participant reçoit exactement un cadeau et en offre exactement un (permutation sans point fixe). Les boucles courtes (A→B et B→A) sont autorisées.

### 6.2 Algorithme

1. Construire pour chaque donneur la liste des receveurs autorisés.
2. **Tirage par rejet** : mélanger aléatoirement la liste des receveurs (Fisher-Yates), vérifier toutes les contraintes, recommencer en cas d'échec. Limite : 1 000 essais. Cette méthode donne un tirage uniforme parmi les solutions valides.
3. **Repli** si la limite est atteinte : backtracking aléatoire, en traitant d'abord les donneurs qui ont le moins de receveurs possibles.
4. Si le backtracking échoue : **aucune solution n'existe**. Renvoyer une erreur claire au gardien, en nommant les participants dont la liste de receveurs possibles est vide ou trop restreinte, pour qu'il assouplisse une règle.

Aléa : `crypto.getRandomValues` exclusivement, jamais `Math.random`.

### 6.3 Exécution

- Le tirage s'exécute **uniquement côté serveur**.
- La réponse renvoyée au gardien ne contient **aucune attribution**, seulement « tirage effectué » et le nombre de participants.
- Les attributions ne sont jamais écrites dans les logs.
- Le receveur est stocké **chiffré** (voir 8.3).

### 6.4 Unicité

Une édition `tirée` ne peut pas être retirée par un simple clic. Le bouton de tirage disparaît et l'API refuse un second tirage.

### 6.5 Annulation et relance

Procédure réservée au gardien, avec double confirmation :

1. Toutes les attributions de l'édition sont supprimées.
2. L'édition repasse en `invitations`, la liste redevient modifiable.
3. Les liens des participants **restent valables**.
4. Les compteurs de consultation sont remis à zéro.
5. Un événement `tirage_annule` est inscrit au journal, avec le motif saisi par le gardien.
6. Au nouveau tirage, le gardien renvoie à chacun le message « Nouveau tirage, ton ancien résultat n'est plus valable » (modèle fourni, voir section 13).

### 6.6 Nouveaux venus et absents

- **Nouveau venu** : pas d'historique, donc aucune exclusion liée aux années précédentes.
- **Absent une année** : la personne est désactivée, jamais supprimée. Son historique est conservé pour son retour.
- **Suppression définitive** d'une personne : possible uniquement si elle n'a participé à aucune édition. Sinon, désactivation.

---

## 6 bis. Liste de souhaits

Ajoutée en v2 à la demande de Julien. L'objectif : aider le donneur à choisir, sans rien changer au secret du tirage.

### 6 bis.1 Principes

- Une liste **par participation** (donc par personne et par édition) : les envies changent d'une année sur l'autre. Pas de reprise automatique de l'an dernier en V1 (voir section 20).
- Chaque souhait est une **idée courte** (texte de 200 caractères max) avec un **lien facultatif** (`http`/`https` uniquement, validé côté serveur, affiché avec `rel="noopener noreferrer nofollow"`).
- Au plus `souhaits_max` idées par liste (défaut 10). La fonctionnalité se désactive par la règle `liste_souhaits`.
- La liste est modifiable en statuts `invitations` et `tirée`, figée en `clôturée`.
- Une relance du tirage (6.5) **conserve** les listes : elles appartiennent à la participation, pas à l'attribution.

### 6 bis.2 Qui voit quoi

| Acteur | Accès |
|---|---|
| Le participant | Lit et modifie sa propre liste depuis sa page personnelle |
| Son donneur | Lit la liste de son receveur sur l'écran de résultat, en même temps que le prénom |
| Le gardien | Voit seulement le **nombre d'idées** par participant (pastille *souhaits renseignés*), jamais le contenu |
| Le journal | Mentionne qu'une liste a été mise à jour, jamais son contenu |

Le contenu d'une liste n'est donc jamais exposé en dehors des deux premiers cas. Ce n'est pas un secret aussi fort que l'attribution, mais afficher les listes de tout le monde permettrait de deviner par recoupement qui achète quoi pour qui. On s'en abstient.

### 6 bis.3 Protection contre la triche

- **Le lien suffit pour modifier sa liste** (décision v5). Un lien transféré permettrait donc de réécrire les envies de quelqu'un : chaque modification est journalisée (« Léa a mis à jour sa liste »), ce qui rend l'abus visible, et le gardien peut régénérer le lien.
- Lecture de sa propre liste : le lien suffit (rien à y gagner pour un tricheur).
- La sauvegarde **remplace la liste entière** (une seule requête idempotente, pas de gestion d'items unitaires) : plus simple, et conforme à l'approche fonctionnelle.
- Événement `souhaits_modifies` au journal : « Léa a mis à jour sa liste de souhaits (3 idées) ».

### 6 bis.4 Écran

- Route `/p/[token]/souhaits`, accessible depuis la page personnelle par un bouton « Ma liste de souhaits ».
- Un champ par idée, bouton « Ajouter une idée », suppression par croix, lien facultatif sous chaque idée. Un bouton « Enregistrer ».
- Sur l'écran de résultat, la liste du receveur apparaît sous le prénom, après l'animation de révélation, sous le titre « Ses idées de cadeaux ».

---

## 7. Stack technique

| Élément | Choix |
|---|---|
| Langage | **JavaScript** (ES2022+, modules ESM), `"type": "module"` dans `package.json`. Pas de TypeScript. Annotations **JSDoc** sur les fonctions métier et les objets échangés avec l'API, pour l'autocomplétion et la documentation ; `checkJs` activé dans `jsconfig.json` pour que l'éditeur signale les incohérences, sans bloquer le build |
| Framework | **Nuxt 4** (`nuxt.config.js`), structure `app/` native |
| Back-end | **Routes serveur Nitro** (`server/api/**`), un fichier par route et méthode (`persons.get.js`, `persons.post.js`), `defineEventHandler` |
| Appels API côté client | **TanStack Query pour Vue** (`@tanstack/vue-query`) : `useQuery` pour les lectures, `useMutation` pour les écritures, invalidation par clés après chaque mutation. Transport : `$fetch` de Nuxt. Hydratation SSR via `dehydrate`/`hydrate` dans un plugin Nuxt |
| État client | Aucun store global. TanStack Query porte l'état serveur ; l'état d'interface (champs de formulaire, étape d'un écran) vit dans des `ref` locaux ou des composables |
| Rendu | SSR sur Cloudflare Workers, preset Nitro `cloudflare_module`. Binding D1 déclaré dans `wrangler.toml`, lu dans les routes via le contexte Cloudflare de l'événement |
| Base de données | Cloudflare D1 (SQLite) |
| ORM et migrations | **Drizzle ORM** + drizzle-kit (`drizzle.config.js`, schéma en `server/database/schema.js`) |
| Validation | Zod sur toutes les entrées d'API. Avec JavaScript, Zod devient aussi la **source de vérité des formes de données** : les types JSDoc sont dérivés des schémas (`@typedef {import('zod').infer<typeof schema>}`) |
| Styles | Tailwind CSS ou UnoCSS, au choix de l'agent, approche mobile first |
| Sessions admin | Cookie de session scellé (par exemple le module `nuxt-auth-utils`) |
| Cryptographie | Web Crypto API (disponible dans les Workers) |
| Transmission des liens | Aucun service externe. Feuille de partage du téléphone (`navigator.share`), avec copie (`navigator.clipboard`) en repli. Les textes sont préchargés : Safari n'ouvre le partage que s'il démarre immédiatement au toucher (section 13) |
| Qualité | **ESLint** (config plate, `@nuxt/eslint`) + **Prettier**, `eslint-config-prettier` pour éviter les conflits. Hooks Git via `simple-git-hooks` + `lint-staged` |
| Tests | **Playwright** de bout en bout (`pnpm test:e2e`) sur un build Cloudflare servi par wrangler, D1 locale jetable, format téléphone. **Vitest** sur toute la logique métier (`server/utils/**`), couverture suivie. `@nuxt/test-utils` pour quelques tests de routes. Playwright facultatif (parcours mobile) |
| Intégration continue | GitHub Actions : `lint`, `format:check`, `test` sur chaque push et pull request |
| Gestionnaire de paquets | pnpm |

### 7.2 Vérifications de l'étape 0 (faites le 13 novembre 2026)

Les points « à vérifier » de la v2 ont été confrontés à la documentation officielle et, à défaut, à des sources récentes. Les limites gratuites changent souvent : revérifier les chiffres avant la mise en service (étape 8).

| Point | Conclusion | Conséquence |
|---|---|---|
| Offre gratuite Cloudflare | Workers Free : 100 000 requêtes/jour, **10 ms de CPU par requête**, 128 Mo. D1 Free : 10 bases, 500 Mo par base, 5 Go au total, 5 millions de lignes lues et 100 000 lignes écrites par jour. Workers Builds (déploiement Git) : 3 000 minutes/mois, 1 build à la fois. Carte bancaire : les docs ne la mentionnent pas ; toutes les sources tierces disent qu'elle n'est pas demandée sur le plan gratuit | Très largement suffisant pour deux familles un mois par an. À confirmer à la création du compte qu'aucune carte n'est demandée |
| Preset Nitro | `cloudflare_module` (Workers) est le preset recommandé ; `cloudflare_pages` « seulement pour des fonctionnalités propres à Pages » ; `cloudflare_durable` est déprécié. Bindings dans `wrangler.toml`/`wrangler.jsonc`. Dév local : `nitro dev` émule Cloudflare via Miniflare (paquet `miniflare` à installer), état local dans `.wrangler/state/v3` | Workers, pas Pages. Adresse en `*.workers.dev` |
| NuxtHub | L'admin NuxtHub est en cours d'arrêt (31 décembre 2025) ; la v0.10 est auto-hébergée (`@nuxthub/db` + Drizzle, SQLite libsql en local, migrations appliquées au build, déploiement par Workers Builds ou wrangler) et cible Nuxt 4 | **Non retenu** : une couche de plus pour un gain faible ici. Drizzle directement sur le binding D1 |
| CPU et PBKDF2 | Les Workers refusent plus de **100 000 itérations** PBKDF2 (`NotSupportedError`, confirmé par un employé Cloudflare en forum et par de nombreux rapports, absent de la doc officielle). Le plan gratuit limite à 10 ms de CPU par requête ; le temps réel d'un PBKDF2 natif sur un Worker déployé n'est documenté nulle part | **Mesuré le 13 novembre 2026 sur le Worker déployé** (temps CPU des logs Cloudflare, à chaud) : 10k ≈ 2 ms, 25k ≈ 5 ms, 50k ≈ 12-25 ms, 100k ≈ 15-43 ms ; démarrage à froid ≈ +13 ms. Les dépassements ont été tolérés (`outcome: ok`) mais ne sont pas garantis. **Défaut retenu : `PBKDF2_ITERATIONS` = 20 000** (≈ 4 ms), relevable par variable. Voir 8.2 pour la justification sécurité |
| Email gratuit sans nom de domaine | **Impossible proprement.** Resend : 100/jour, 3 000/mois, mais sans domaine vérifié on ne peut écrire qu'à sa propre adresse (403). Brevo : 300/jour, API incluse, sans carte, mais une adresse Gmail ne peut pas être authentifiée et Brevo réécrit l'expéditeur en `@brevosend.com` (« via brevosend.com » dans Gmail, pied de page Brevo, délivrabilité dégradée) | **Email abandonné** (décision v3). Envoi par WhatsApp via `wa.me`, section 13 |
| Liens WhatsApp « click to chat » | Fonction officielle (`https://wa.me/<numéro>?text=…`). Retenue en v3, **abandonnée en v5** au profit de la feuille de partage du téléphone, qui évite de stocker les numéros | — |
| `nuxt-auth-utils` sur Workers | Supporté. Exige `compatibility_date` ≥ 2025-04-01 (ou le flag `nodejs_compat_populate_process_env`). Secret de scellement `NUXT_SESSION_PASSWORD` obligatoire en production. Session limitée par la taille du cookie (4 096 octets) | Retenu. Ne stocker en session que `role`, `groupId`, `expiresAt` |
| TanStack Query dans Nuxt | Motif établi : plugin Nuxt qui crée le `QueryClient`, `useState('vue-query')` pour transporter l'état déshydraté, `dehydrate` dans le hook `app:rendered` côté serveur, `hydrate` côté client. Depuis `@tanstack/vue-query` 5.102.1, `hydrate()` lève une erreur si l'état est `null` (pages sans SSR) : garder l'appel | Retenu, plugin `app/plugins/vue-query.js` avec garde sur l'état nul |
| Nuxt en JavaScript | `typescript.typeCheck` est désactivé par défaut, Nuxt accepte `nuxt.config.js` et des fichiers `.js` sans réglage. `checkJs` n'est pas documenté côté Nuxt : il relève de l'éditeur. Astuce connue : `"jsx": "preserve"` dans `jsconfig.json` évite un avertissement de Volar | `jsconfig.json` minimal étendant `.nuxt/tsconfig.json`, `checkJs: true` pour l'éditeur seulement. La génération de `.nuxt/tsconfig.json` est inoffensive, on la laisse |
| Version de Nuxt | La documentation de Nuxt, Nitro et des modules cible Nuxt 4 ; la structure `app/` du plan est celle de Nuxt 4 | **Nuxt 4** (décision v3) |

### 7.1 Guidelines de code

Décidées avec Julien en v2. Elles s'appliquent à tout le code, serveur et client.

#### Programmation fonctionnelle

- **Fonctions pures d'abord.** Tout le métier (`draw`, `rules`, `crypto` hors appels Web Crypto, construction des événements du journal, modèles de messages WhatsApp, validation des souhaits) est écrit en fonctions pures : mêmes entrées, mêmes sorties, aucun accès à la base, à l'horloge ou à l'aléa à l'intérieur. L'aléa et l'horloge sont **passés en paramètre** (`draw(participants, rules, { random })`), ce qui rend les tests déterministes.
- **Noyau pur, coque impure.** Les routes Nitro sont la seule couche qui lit la requête, interroge la base et écrit la réponse. Elles sont courtes : valider (Zod) → charger → appeler le métier → persister → répondre. Pas de logique métier dans une route.
- **Immutabilité.** `const` partout, jamais de mutation d'un argument ni d'un objet partagé. Nouvelles valeurs par décomposition (`{ ...rules, budget }`), `map`/`filter`/`reduce` plutôt que boucles qui mutent, `toSorted` plutôt que `sort`. Exception tolérée et localisée : le mélange Fisher-Yates sur une copie du tableau.
- **Pas de classes, pas de `this`.** Les « interfaces » sont des objets de fonctions produits par des fabriques : `createRepository(db)` renvoie des fonctions de requête, `createClock()` renvoie `{ now }`. L'injection de dépendances se fait par arguments.
- **Composition.** Petites fonctions nommées d'après ce qu'elles renvoient, composées plutôt qu'imbriquées. Une fonction fait une chose ; au-delà d'une vingtaine de lignes, on la découpe.
- **Erreurs métier comme valeurs.** Le métier renvoie des résultats explicites (`{ ok: true, value }` / `{ ok: false, reason, details }`) plutôt que de lancer des exceptions. Seule la coque transforme un `ok: false` en `createError` HTTP. Le résultat de la vérification de faisabilité du tirage (section 6.2, point 4) en est l'exemple type.
- **Côté Vue** : composition API et `<script setup>`, composables qui renvoient des valeurs réactives dérivées (`computed`) plutôt que des mutations manuelles, pas de watchers quand un `computed` suffit. Les composables TanStack Query sont regroupés par domaine dans `app/composables/queries/`, avec un fichier `keys.js` pour les clés de cache.
- Pas de bibliothèque fonctionnelle imposée (Ramda, fp-ts…) : le JavaScript natif suffit à cette taille de projet.

#### Standards de l'industrie

- **ESLint** en configuration plate, basée sur `@nuxt/eslint`, complétée par des règles qui soutiennent le style fonctionnel : `no-param-reassign`, `prefer-const`, `no-var`, `prefer-arrow-callback`, `no-restricted-syntax` sur `class` et `for…in`, `eqeqeq`. `eslint-plugin-functional` évalué à l'étape 1, adopté s'il n'alourdit pas trop.
- **Prettier** avec la configuration par défaut (deux espaces, guillemets simples, point-virgule, 80 colonnes), appliqué à tout le dépôt. Aucune règle de mise en forme dans ESLint.
- **Tests** : Vitest. Toute fonction de `server/utils/**` a son fichier de test à côté (`draw.test.js`). Les tests décrits en section 18 sont la liste minimale. Les routes sont testées plus légèrement, sur les cas de refus (session absente, mauvais groupe, réponse admin sans attribution). Objectif de couverture sur `server/utils` : 90 % de lignes.
- **Hooks Git** : `pre-commit` lance `lint-staged` (ESLint + Prettier sur les fichiers modifiés) ; `pre-push` lance les tests.
- **Scripts `package.json`** : `dev`, `build`, `lint`, `lint:fix`, `format`, `format:check`, `test`, `test:watch`, `test:coverage`, `db:generate`, `db:migrate`.
- **Conventions de nommage** : fichiers en kebab-case, fonctions et variables en camelCase, constantes de configuration en SCREAMING_SNAKE_CASE, composants Vue en PascalCase. Code et commentaires en **anglais**, interface utilisateur et documentation en **français**.
- **Secrets** : jamais dans le dépôt, `.env` dans `.gitignore`, `.env.example` à jour.

#### Versionnement Git

- Un dépôt Git dès le premier fichier, branche principale `main`, dépôt GitHub privé.
- **Petits commits** : un commit = un changement cohérent qui laisse le projet dans un état qui passe `lint` et `test`. Ordre de grandeur : une fonction métier et ses tests, une route, un composant. Jamais un commit « étape 3 terminée » qui touche quarante fichiers.
- Messages au format **Conventional Commits** (`feat:`, `fix:`, `test:`, `refactor:`, `chore:`, `docs:`), sujet en anglais à l'impératif, portée facultative (`feat(draw): …`), corps libre quand le pourquoi n'est pas évident.
- Chaque étape de la section 17 se réalise en une **série de commits** sur `main` (Julien travaille seul) ; une branche et une pull request quand un changement mérite une relecture, par exemple le tirage ou la cryptographie.
- Le README est mis à jour **dans le même commit** que la décision qu'il documente.

---

## 8. Sécurité

### 8.1 Lien personnel

- Jeton de 32 octets aléatoires, encodé en base64url, dans l'URL : `/p/<jeton>`.
- En base : l'empreinte SHA-256 du jeton (pour la recherche) **et** le jeton chiffré avec la clé serveur (pour que le gardien puisse le renvoyer ou le copier).
- Un jeton par participation, donc un **nouveau lien à chaque édition**.
- Régénérable par le gardien, ce qui invalide l'ancien.
- Pages `/p/*` : en-têtes `Referrer-Policy: no-referrer`, `Cache-Control: no-store`, `X-Robots-Tag: noindex`.

### 8.2 Lien seul, sans code (v5)

- Rattaché à la **personne** : il est conservé d'une année sur l'autre.
- Choisi par le participant à la première ouverture d'un lien, saisi deux fois.
- Le jeton du lien fait 32 octets aléatoires (256 bits) : le deviner est hors de portée, même avec des milliards d'essais par seconde. Le stockage reste : empreinte SHA-256 pour la recherche, copie chiffrée pour le repartage.
- Le risque n'est pas le hasard mais la **fuite** d'un lien (message transféré, téléphone emprunté). Contre-mesures : journal public de chaque consultation avec son compteur, pastille *consulté* côté gardien, régénération du lien.
- Le résultat ne s'affiche qu'après un geste du participant (bouton), jamais au simple chargement de la page : les robots d'aperçu de liens ne le voient pas et ne faussent pas le compteur.
- Historique : la v1 à v4 prévoyait un code à 6 chiffres (PBKDF2, blocage après 5 échecs). Supprimé en v5 à la demande de Julien, colonnes retirées par la migration `0001`.

### 8.3 Chiffrement des résultats

- Le receveur de chaque attribution est chiffré en AES-256-GCM avec la clé `DATA_KEY` (variable secrète), un vecteur d'initialisation aléatoire par ligne.
- Le donneur est en clair, le receveur chiffré : une lecture brute de la base ne révèle pas les résultats.
- Le déchiffrement n'a lieu que dans deux cas : la consultation par le participant, et le calcul des exclusions lors d'un tirage ultérieur.
- **Aucune route d'administration ne renvoie une attribution en clair**, y compris pour le super-admin.

### 8.4 Administration

- **Super-admin** : mot de passe dans la variable secrète `SUPER_ADMIN_PASSWORD`. Peut créer des groupes, définir ou réinitialiser le mot de passe d'un gardien, et agir comme gardien de n'importe quel groupe.
- **Gardien** : un mot de passe par groupe, haché en base (PBKDF2-SHA256, sel par groupe, poivre `NUXT_PIN_PEPPER`, longueur minimale de 10 caractères).
- Session par cookie scellé, `HttpOnly`, `Secure`, `SameSite=Lax`, durée 12 heures.
- Limitation des tentatives de connexion admin (par exemple 10 échecs puis attente de 15 minutes).
- Toutes les routes `/api/admin/*` vérifient la session **et** l'appartenance au groupe concerné.

### 8.5 Cloisonnement

- Chaque requête de base filtre sur `group_id`.
- Un gardien ne peut ni lire ni modifier un autre groupe.
- Le journal d'un groupe n'est visible que par ses participants (lien valide) et son gardien.

### 8.6 Liste de contrôle

- [ ] Aucune attribution dans une réponse d'API admin
- [ ] Aucune attribution dans les logs ou les messages partagés
- [ ] Aucun contenu de liste de souhaits dans une réponse d'API admin ni dans le journal
- [ ] Toute modification d'une liste de souhaits est journalisée
- [ ] Toutes les entrées validées par Zod
- [ ] Requêtes paramétrées uniquement (Drizzle)
- [ ] Limitation des tentatives sur la connexion admin
- [ ] En-têtes de sécurité sur les pages `/p/*`
- [ ] Secrets uniquement dans les variables d'environnement, jamais dans le dépôt

---

### 8.7 Secret et éditions passées (décisions du 13 novembre 2026)

- **Édition clôturée = résultats non secrets.** Le gardien voit le tirage d'une édition clôturée dans les archives (« Léa a offert à Tom ») et, pendant la préparation de l'édition suivante, la liste nommée des paires exclues par les années précédentes. Il peut **lever une de ces exclusions pour l'édition en cours seulement** (colonne `editions.history_waivers`, migration `0004`), ou tout rétablir.
- Une édition **tirée mais pas encore clôturée** reste secrète : ses paires ne sont que comptées.
- **Accès de dernier recours, un résultat à la fois** (`POST /api/admin/[groupe]/editions/[id]/reveal-one`, corps `personId` ; d'abord prévu pour le tirage entier, restreint à une personne par appel le 13 novembre 2026, événement `result_revealed` qui nomme la personne dans le journal) : mot de passe du gardien redemandé, phrase « JE VEUX VOIR LE TIRAGE » à recopier, case de confirmation, et événement `results_revealed` inscrit au **journal public** (« Le gardien a consulté les résultats du tirage »). Le gardien pourrait de toute façon ouvrir les liens personnels ; cette voie officielle a l'avantage d'être visible de tous. Le résultat n'est affiché que dans l'état de l'écran, jamais mis en cache.
- Ces trois points remplacent, pour les éditions clôturées et l'accès de dernier recours, la règle « aucune route d'administration ne renvoie une attribution » de la section 8.3, qui reste vraie pour tout le reste.

---

## 9. Journal public

Visible par tous les participants du groupe (depuis leur page personnelle) et par le gardien. Affichage du plus récent au plus ancien, filtrable par édition.

**Règle absolue : le journal ne contient jamais qui a tiré qui.**

| Type d'événement | Exemple affiché |
|---|---|
| `edition_creee` | « L'édition Noël 2026 a été créée » |
| `participant_ajoute` / `participant_retire` | « Léa a été ajoutée à l'édition » |
| `regle_modifiee` | « Le gardien a modifié les règles du tirage » |
| `message_envoye` | « Le gardien a envoyé l'invitation à Léa (partagé) » (type de message et canal `share` ou `copy` dans `meta`) |
| `lien_copie` | « Le gardien a copié le lien de Léa » |
| `lien_regenere` | « Le lien de Léa a été régénéré » |
| `tirage_effectue` | « Le tirage a été effectué pour 12 participants » |
| `resultats_consultes` | « Le gardien a consulté les résultats du tirage (accès de dernier recours) » |
| `tirage_annule` | « Le tirage a été annulé. Motif : désistement de Tom » |
| `resultat_consulte` | « Léa a consulté son résultat (3ᵉ fois) » |
| `souhaits_modifies` | « Léa a mis à jour sa liste de souhaits (3 idées) » |
| `edition_cloturee` | « L'édition Noël 2026 est clôturée » |

Chaque événement porte la date, l'heure et l'auteur (`participant`, `gardien`, `super-admin` ou `système`).

---

## 10. Modèle de données

Base D1 (SQLite). Identifiants en texte (UUID ou nanoid). Dates en ISO 8601 UTC.

### `groups`
| Colonne | Type | Notes |
|---|---|---|
| `id` | text PK | |
| `slug` | text unique | Sert dans l'URL d'admin, ex. `famille-rabin` |
| `name` | text | |
| `guardian_password_hash`, `guardian_password_salt` | text | |
| `rules` | text (JSON) | Valeurs par défaut des règles du groupe |
| `email_sending` | integer (booléen) | Envoi groupé par email, activé par le super-admin (13.3) |
| `created_at` | text | |

### `persons`
| Colonne | Type | Notes |
|---|---|---|
| `id` | text PK | |
| `group_id` | text FK | |
| `first_name` | text | Affiché partout |
| `email` | text nullable | Facultatif, pour l'envoi groupé par email (13.3) |
| `last_name` | text nullable | Pour départager les homonymes |
| `active` | integer (booléen) | Désactivation plutôt que suppression |
| `created_at` | text | |


### `manual_exclusions`
| Colonne | Type | Notes |
|---|---|---|
| `id` | text PK | |
| `group_id` | text FK | |
| `giver_id`, `receiver_id` | text FK | « giver ne tire jamais receiver » |
| `reciprocal` | integer (booléen) | |

### `editions`
| Colonne | Type | Notes |
|---|---|---|
| `id` | text PK | |
| `group_id` | text FK | |
| `label` | text | Ex. « Noël 2026 » |
| `year` | integer | Sert à ordonner les éditions |
| `status` | text | `draft`, `invitations`, `drawn`, `closed` |
| `rules_override` | text (JSON) nullable | Surcharge des règles du groupe |
| `rules_snapshot` | text (JSON) nullable | Règles et exclusions réellement appliquées au tirage, pour audit |
| `drawn_at`, `closed_at` | text nullable | |
| `created_at` | text | |

### `participations`
| Colonne | Type | Notes |
|---|---|---|
| `id` | text PK | |
| `edition_id`, `person_id` | text FK | Paire unique |
| `token_hash` | text unique | SHA-256 du jeton |
| `token_enc`, `token_iv` | text | Jeton chiffré, pour renvoi par le gardien |
| `message_sent_at` | text nullable | Dernier partage ou copie déclaré, pour la pastille *envoyé* |
| `link_copied_at` | text nullable | |
| `view_count` | integer | Consultations du résultat |
| `first_viewed_at`, `last_viewed_at` | text nullable | |

### `assignments`
| Colonne | Type | Notes |
|---|---|---|
| `id` | text PK | |
| `edition_id` | text FK | |
| `giver_person_id` | text FK | Unique par édition |
| `receiver_enc`, `receiver_iv` | text | Identifiant du receveur, chiffré |
| `created_at` | text | |

### `wishes`
| Colonne | Type | Notes |
|---|---|---|
| `id` | text PK | |
| `participation_id` | text FK | La liste appartient à la participation (une par édition) |
| `position` | integer | Ordre d'affichage, de 0 à `souhaits_max − 1` |
| `label` | text | L'idée, 200 caractères max |
| `url` | text nullable | Lien `http`/`https` validé |
| `created_at` | text | |

En clair en base : un souhait ne révèle pas d'attribution. La sauvegarde remplace toutes les lignes d'une participation dans une transaction (`DELETE` puis `INSERT`). Le `group_id` se retrouve via la participation et l'édition : toute requête passe par cette jointure pour respecter le cloisonnement (8.5).

### `audit_log`
| Colonne | Type | Notes |
|---|---|---|
| `id` | text PK | |
| `group_id` | text FK | |
| `edition_id` | text FK nullable | |
| `type` | text | Voir section 9 |
| `person_id` | text FK nullable | Personne concernée |
| `actor` | text | `participant`, `guardian`, `super_admin`, `system` |
| `meta` | text (JSON) nullable | Compteurs, motif. Jamais de résultat |
| `created_at` | text | |

### `login_attempts`
Pour limiter les tentatives de connexion admin : `id`, `scope` (slug du groupe ou `super`), `ip_hash`, `created_at`.

---

## 11. Écrans

Tous conçus pour un écran de téléphone en premier (≈ 380 px de large), zones tactiles d'au moins 44 px, une seule colonne.

### Côté participant

| Route | Écran |
|---|---|
| `/p/[token]` | Page personnelle. Selon l'état : attente du tirage, bouton « Découvrir », résultat, lien invalide. Bouton « Ma liste de souhaits » si la règle est active. Balises `<title>` et Open Graph **neutres** (« Secret Santa »), sans prénom : les messageries génèrent un aperçu du lien |
| `/p/[token]/souhaits` | Liste de souhaits du participant : édition des idées et enregistrement (voir 6 bis.4) |
| `/p/[token]/journal` | Journal du groupe |

Détails d'interface :
- Résultat : animation courte de révélation (carte qui se retourne ou paquet qui s'ouvre), prénom en très grand, puis budget, date et message du gardien, puis la liste de souhaits du receveur.
- Le résultat ne reste pas affiché : il disparaît quand on quitte ou recharge la page, il faut retoucher « Découvrir ». Côté TanStack Query, la révélation est une **mutation**, jamais une requête mise en cache.
- Messages d'erreur clairs et sans jargon (« Ce lien n'est plus valable, demande-en un nouveau à ton gardien »).

### Côté admin

| Route | Écran |
|---|---|
| `/admin` | Connexion (choix du groupe + mot de passe, ou accès super-admin) |
| `/admin/groupes` | Super-admin : liste et création des groupes, mot de passe des gardiens |
| `/admin/[groupe]` | Tableau de bord du groupe : édition en cours, éditions passées |
| `/admin/[groupe]/personnes` | Personnes du groupe : ajouter, modifier (prénom, nom), désactiver ; écran Exclusions : paires qui ne se tirent pas (couples, fratries…), réciproques par défaut |
| `/admin/[groupe]/reglages` | Règles par défaut du groupe |
| `/admin/[groupe]/editions/[id]` | Pilotage d'une édition (voir ci-dessous) |
| `/admin/[groupe]/journal` | Journal du groupe |

Écran de pilotage d'une édition, le plus important :
- En-tête : nom de l'édition, statut, action principale du moment (« Ouvrir les invitations », « Lancer le tirage », « Clôturer »).
- Liste des participants, une ligne par personne, avec des pastilles : *envoyé*, *souhaits*, *consulté* ; l'en-tête indique combien ont consulté leur résultat.
- Sur chaque ligne, un bouton **« Partager »** ouvre la feuille de partage du téléphone avec le message du type choisi (invitation, tirage fait, relance, nouveau tirage) ; la pastille *envoyé* est posée si le partage n'est pas annulé.
- Fiche participant : partager, copier le message, copier le lien seul, « pas envoyé finalement ? », régénérer le lien, retirer de l'édition, et la date de dernière consultation.
- Un sélecteur en haut de liste choisit le type de message pour toutes les cartes (par défaut : celui qui correspond au statut de l'édition). Les cartes non encore *envoyées* pour ce type remontent en premier pour enchaîner les envois.
- Avant le tirage : un encart « Vérification » indique si le tirage est possible et, sinon, pourquoi.
- Zone dangereuse en bas de page : « Annuler et relancer le tirage ».

---

## 12. API

Routes serveur Nitro (`server/api/**`, un fichier par méthode). Toutes les entrées validées par Zod. Les réponses ne contiennent que le strict nécessaire. Côté client, chaque route de lecture a son composable `useQuery` et chaque route d'écriture son `useMutation`, qui invalide les clés concernées.

### Participant

| Méthode et route | Rôle |
|---|---|
| `GET /api/p/[token]` | État de la participation : prénom, groupe, édition, statut, liste de souhaits active ou non. Jamais le résultat. N'est pas compté comme une consultation |
| `POST /api/p/[token]/reveal` | Déclenché par le bouton « Découvrir ». Renvoie le prénom du receveur, le budget, la date, le message **et la liste de souhaits du receveur**. Compte et journalise la consultation |
| `GET /api/p/[token]/wishes` | Sa propre liste de souhaits (le lien suffit) |
| `PUT /api/p/[token]/wishes` | Corps : la liste complète. Remplace la liste, journalise. Refusé si l'édition est clôturée ou la règle inactive |
| `GET /api/p/[token]/journal` | Journal du groupe |

### Admin

| Méthode et route | Rôle |
|---|---|
| `POST /api/admin/login`, `POST /api/admin/logout` | Session |
| `GET/POST /api/admin/groups`, `PATCH /api/admin/groups/[id]` | Super-admin uniquement |
| `GET/POST/PATCH /api/admin/[groupe]/persons` | Personnes (prénom, nom, actif) |
| `POST/DELETE /api/admin/[groupe]/exclusions` | Exclusions manuelles |
| `GET/PATCH /api/admin/[groupe]/rules` | Règles du groupe |
| `GET/POST /api/admin/[groupe]/editions` | Liste, création (avec reprise de l'édition précédente) |
| `PATCH /api/admin/[groupe]/editions/[id]` | Règles de l'édition, changement de statut |
| `GET /api/admin/[groupe]/editions/[id]/participants` | Liste avec statuts, dont le nombre de souhaits par participant (jamais leur contenu) |
| `POST/DELETE /api/admin/[groupe]/editions/[id]/participants` | Ajouter, retirer |
| `GET /api/admin/[groupe]/editions/[id]/check` | Le tirage est-il possible ? Sinon, pourquoi |
| `POST /api/admin/[groupe]/editions/[id]/draw` | Lancer le tirage |
| `POST /api/admin/[groupe]/editions/[id]/redraw` | Annuler le tirage (motif obligatoire) |
| `GET /api/admin/[groupe]/editions/[id]/messages?type=` | Textes prêts à partager pour chaque participant (sans effet de bord), préchargés pour que le partage s'ouvre au toucher |
| `POST /api/admin/[groupe]/participations/[id]/message` | Corps : `type` ∈ `invitation`, `drawn`, `reminder`, `redraw` et `via` ∈ `share`, `copy`. Pose la pastille *envoyé* et journalise `message_sent` |
| `DELETE /api/admin/[groupe]/participations/[id]/message` | Annule la pastille *envoyé* (erreur de clic), journalisé |
| `GET /api/admin/[groupe]/participations/[id]/link` | Obtenir le lien seul (journalisé `lien_copie`) |
| `POST /api/admin/[groupe]/participations/[id]/regenerate` | Régénérer le lien |
| `GET /api/admin/[groupe]/journal` | Journal |

---

## 13. Messages à partager

Décision v5 : l'application n'envoie rien elle-même et ne stocke aucun numéro. Le gardien partage chaque message depuis la feuille de partage de son téléphone.

### 13.1 Mécanisme

- **Partage** : `navigator.share({ text })` ouvre la feuille de partage (WhatsApp, SMS, Mail…). Sans feuille de partage (ordinateur), le texte est copié avec `navigator.clipboard.writeText`.
- **Contrainte Safari** : le partage et la copie doivent démarrer dans le geste de l'utilisateur, avant tout `await`. Les textes de tous les participants sont donc préchargés (`GET …/messages?type=`) ; la pastille *envoyé* est posée après coup (`POST …/message`), sauf si le partage a été annulé.
- Pas de confirmation d'envoi possible : la pastille *envoyé* reflète le partage déclaré par le téléphone (non annulé), et reste annulable.

### 13.2 Modèles

- Fonctions pures `(données) → texte` dans `server/utils/messages.ts`, testées sans réseau. Données : prénom, nom du groupe, label de l'édition, lien personnel, et selon le modèle budget, date, message du gardien.
- Texte **court et sans mise en forme**, le lien **seul sur sa ligne** pour que les messageries le rendent cliquable et génèrent l'aperçu, un emoji 🎁 au plus.
- **Aucun message ne contient un résultat.**
- Les messages proposés suivent l'étape (`messageTypesFor`) : `invitation` et `reminder` avant le tirage, `drawn`, `reminder` et `redraw` après. L'API refuse les autres.
- Avant le tirage, l'écran du gardien reste discret : pas de « pas encore envoyé » ni de compteur, seulement une coche « Invitation envoyée ». Le suivi d'envoi commence au tirage, qui remet la pastille *envoyé* à zéro.

| Modèle (`type`) | Moment | Contenu |
|---|---|---|
| `invitation` | Statut `invitations` | « Salut Léa ! 🎁 Tu participes au Secret Santa de [groupe] ([édition]). Ouvre ton lien et note quelques idées de cadeaux : [lien] » |
| `tirage` | Après le tirage | « Le tirage est fait ! Ouvre ton lien pour découvrir à qui tu offres un cadeau : [lien] » + budget et date s'ils sont renseignés |
| `relance` | Manuel | « Petit rappel Léa : ton lien t'attend, pense à l'ouvrir. Ton lien : [lien] » |
| `nouveau_tirage` | Après une relance du tirage | « Un nouveau tirage a eu lieu, ton ancien résultat n'est plus valable. Ton lien ne change pas : [lien] » |

### 13.3 Envoi groupé par email (v6, en option)

Décision du 13 novembre 2026. Le partage par téléphone reste le fonctionnement par défaut ; l'email évite seulement au gardien de partager chaque lien à la main.

- **Activation** : colonne `groups.email_sending`, modifiable par le **super-admin uniquement** (`PATCH /api/admin/groups/[id]`, interrupteur sur l'écran du groupe). Le gardien ne peut ni l'activer ni le couper.
- **Adresses** : `persons.email`, facultative, saisie par le gardien ; le champ n'apparaît que si l'option est active. Migration `0005`.
- **Envoi** : `POST /api/admin/[groupe]/editions/[id]/emails`, corps `type` (un message de l'étape en cours) et `audience` (`unsent` par défaut, ou `all`). Écrit aux participants qui ont une adresse, pose la pastille *envoyé* et journalise `message_sent` avec `via: email`. 50 emails au plus par appel, le reste au suivant.
- **Fournisseur** : Resend (offre gratuite), domaine `under-the-tree.party` vérifié, un seul appel HTTPS par envoi groupé (`/emails/batch`), ce qui reste loin de la limite de 50 sous-requêtes du plan gratuit. Secret `NUXT_RESEND_API_KEY` ; sans clé, la route répond `email_not_configured` et rien d'autre ne change.
- **Contenu** : `buildEmail` dans `server/utils/messages.ts`, même texte que le message à partager, plus un objet et un jumeau HTML sobre. Jamais de résultat.
- **Délivrabilité, mesurée le 13 novembre 2026 sur Gmail** : SPF, DKIM et DMARC passent. Sans DMARC le premier essai est arrivé en spam ; avec, les mails arrivent dans l'onglet **Promotions**, mis en forme ou non. Le domaine venait d'être créé ; à remesurer plus tard. Seul Gmail a été testé. L'écran du gardien prévient que les emails arrivent souvent en spam (formulation demandée par Julien). Conséquence : l'email est un complément, le gardien relance par téléphone ceux qui n'ouvrent pas leur lien.
- Les tests de bout en bout tournent sans clé (`scripts/e2e-server.sh` ignore le `.env` du poste) : aucun test n'envoie de vrai email.

---

## 14. Arborescence proposée

```
secret-santa/
├── README.md                  ← ce document
├── nuxt.config.js
├── jsconfig.json              ← checkJs, alias, pour l'éditeur
├── eslint.config.js           ← config plate
├── .prettierrc
├── vitest.config.js
├── wrangler.toml              ← binding D1
├── drizzle.config.js
├── package.json               ← "type": "module", scripts, lint-staged
├── .env.example
├── .github/workflows/ci.yml   ← lint, format:check, test
├── app/
│   ├── plugins/vue-query.js   ← VueQueryPlugin + hydratation SSR
│   ├── pages/
│   │   ├── index.vue          ← page d'accueil neutre
│   │   ├── p/[token]/index.vue
│   │   ├── p/[token]/souhaits.vue
│   │   ├── p/[token]/journal.vue
│   │   └── admin/…
│   ├── components/            ← PinInput, RevealCard, WishList, WishEditor, ParticipantCard, JournalList, StatusBadge…
│   ├── composables/
│   │   └── queries/           ← useQuery/useMutation par domaine + keys.js
│   └── middleware/admin.js
├── server/
│   ├── api/p/…                ← un fichier par route et méthode (wishes.get.js, wishes.put.js…)
│   ├── api/admin/…
│   ├── database/
│   │   ├── schema.js
│   │   └── migrations/
│   └── utils/                 ← noyau pur, chaque fichier a son .test.js à côté
│       ├── draw.js            ← algorithme de tirage, aléa injecté
│       ├── crypto.ts          ← jetons, hachage des mots de passe gardien, AES-GCM
│       ├── audit.js           ← construction des événements du journal
│       ├── wishes.js          ← validation et normalisation d'une liste de souhaits
│       ├── messages.ts        ← modèles de messages à partager, fonctions pures
│       ├── rules.js           ← fusion règles groupe/édition
│       ├── result.js          ← helpers ok()/fail() pour les erreurs métier
│       └── auth.js
│   └── database/
│       └── client.js          ← useDb(event) : Drizzle sur le binding D1 (infrastructure, hors noyau pur)
└── tests/
    └── api/                   ← tests de routes (refus, cloisonnement, aucune attribution en sortie)
```

---

## 15. Variables d'environnement

| Variable | Rôle |
|---|---|
| `SUPER_ADMIN_PASSWORD` | Mot de passe du super-admin |
| `NUXT_SESSION_PASSWORD` | Clé de scellement des cookies de session (32 caractères minimum) |
| `DATA_KEY` | Clé AES-256 (base64) pour chiffrer receveurs et jetons |
| `NUXT_PIN_PEPPER` | Poivre pour le hachage des mots de passe gardien (nom historique, conservé pour ne pas changer le secret en production) |
| `PBKDF2_ITERATIONS` | Itérations PBKDF2 (défaut 20 000, maximum 100 000 sur Workers) |
| `PUBLIC_BASE_URL` | URL publique, pour construire les liens |
| `RESEND_API_KEY` | Clé d'API Resend pour l'envoi groupé par email (facultative, une clé limitée à l'envoi suffit) |
| `EMAIL_FROM` | Expéditeur des emails, sur un domaine vérifié chez Resend |

**Attention :** perdre `DATA_KEY` rend illisibles tous les résultats et tous les liens. La conserver dans un gestionnaire de mots de passe.

---

## 16. Déploiement (gratuit)

1. Créer un dépôt GitHub privé et y pousser le code.
2. Créer un compte Cloudflare gratuit.
3. Créer la base D1 (`wrangler d1 create secret-santa`) et reporter son identifiant dans `wrangler.toml`. *(Fait : `1128fa3f-…`.)* Le sous-domaine `workers.dev` du compte se choisit dans le tableau de bord (Workers & Pages → Account details) s'il n'existe pas encore.
4. Appliquer les migrations sur la base distante.
5. Déployer à la main avec `pnpm deploy` (build puis `wrangler deploy`, après `wrangler login`). **Un `git push` ne déploie pas** : Workers Builds n'est pas branché sur le dépôt (constaté le 13 novembre 2026, aucun commit ne porte de déploiement Cloudflare).
6. Renseigner les variables secrètes dans le tableau de bord Cloudflare.
7. L'application est servie sur `https://under-the-tree.party` (domaine personnalisé du Worker, déclaré dans `wrangler.toml`) et reste joignable sur `https://secret-santa.julienr114.workers.dev`.
8. Se connecter en super-admin, créer les deux groupes, définir les mots de passe des gardiens.

Développement local : base D1 locale émulée par Miniflare (`nitro dev`), état dans `.wrangler/state/v3`.

---

## 17. Plan de réalisation par étapes

Chaque étape est livrable et testable seule.

**Étape 0 — Vérifications** ✅ *terminée le 13 novembre 2026*
Points de la section 7 levés, conclusions en 7.2. Décisions : Workers (`cloudflare_module`), pas de NuxtHub, pas d'email mais WhatsApp `wa.me`, Nuxt 4, PBKDF2 configurable.

**Étape 1 — Socle** ✅ *terminée et déployée le 13 novembre 2026*
Fait : Nuxt 4 en JavaScript, `jsconfig.json`, ESLint + Prettier + hooks Git (simple-git-hooks, lint-staged), Vitest, CI GitHub Actions, Tailwind 4, plugin TanStack Query (SSR vérifié), Drizzle + schéma complet + migration `0000_init`, preset `cloudflare_module`, `wrangler.toml` (D1 + assets), route `/api/health` testée sous Miniflare, base D1 `secret-santa` créée et migrée, Worker déployé sur `secret-santa.julienr114.workers.dev`, `/api/health` répond en production, code poussé sur GitHub (CI active). PBKDF2 mesuré sur le Worker (voir 7.2), route de banc supprimée, défaut 20 000. Sous-domaine `workers.dev` du compte : `julienr114`.

Enseignements : l'horloge est gelée pendant une requête Worker (`performance.now()` rend 0), le temps CPU se lit dans `wrangler tail --format json` (champ `cpuTime`) ; ESLint 10 cherche la config depuis chaque fichier, d'où `--config eslint.config.js` dans les scripts ; `functional/immutable-data` exige TypeScript, remplacé par des sélecteurs `no-restricted-syntax` sur le noyau pur ; `server/utils` est réservé aux fonctions pures, l'infrastructure (client Drizzle) vit dans `server/database`.

Plan initial : Dépôt GitHub privé. Projet Nuxt 4 en JavaScript, `jsconfig.json`, ESLint + Prettier + hooks Git, Vitest, CI GitHub Actions, styles, plugin TanStack Query, Drizzle + D1, schéma complet (table `wishes` comprise) et première migration, déploiement d'une page vide sur Cloudflare Workers pour valider la chaîne. **Mesure du temps CPU d'un PBKDF2 à 50 000 itérations sur le Worker déployé** (route temporaire), pour fixer la valeur par défaut. Chaque outil = un commit.

**Étape 2 — Cœur métier, sans interface** ✅ *terminée le 13 novembre 2026*
`result.js`, `rules.js`, `draw.js`, `crypto.js`, `audit.js`, `wishes.js`, `whatsapp.js`, `messages.js` dans `server/utils/`, chacun avec son `.test.js` (58 tests, 100 % des lignes couvertes), un commit par module. Points à connaître pour la suite :
- **Clés anglaises dans le code**, libellés français dans l'interface. Règles : `excludePreviousYears`, `budget`, `eventDate`, `guardianMessage`, `wishlist`, `maxWishes` (`rules.js`, schéma Zod = source de vérité, `mergeRules(groupRules, override)`). Types d'événements : `edition_created`, `participant_added/removed`, `couple_changed`, `rules_changed`, `message_sent` (meta `messageType`, `via` ∈ `share`, `copy`), `link_copied/shared/regenerated`, `draw_done`, `draw_cancelled`, `result_viewed`, `wishes_updated`, `edition_closed` (`audit.js`). Types de message : `invitation`, `drawn`, `reminder`, `redraw` (`messages.js`).
- `draw(input, rules, { random })` : l'appelant fournit `history` (receveurs passés par donneur, déjà filtré sur N éditions et sur la participation du donneur) et `random` (`secureRandomInt` de `crypto.js` en production). `checkFeasibility` renvoie `blocked`, `constrained` et `allowedCounts` pour l'encart « Vérification ».
- `audit.js` purge de `meta` toute clé évoquant un résultat ou un secret (`receiver`, `assignment`, `pin`, `token`…), à n'importe quelle profondeur.
- Le hachage mêle le poivre au secret (`${pepper}\0${secret}`), 20 000 itérations par défaut, plafonné à 100 000.

Plan initial : `draw.js`, `crypto.js`, `rules.js`, `audit.js`, `wishes.js`, `messages.js`, `whatsapp.js`, `result.js`, avec leurs tests unitaires. C'est la partie la plus critique : la terminer et la tester avant toute interface. Un commit par fonction métier avec ses tests.

**Étape 3 — Administration**
Connexion super-admin et gardien, gestion des groupes, des personnes, des exclusions, des règles. Création d'édition avec reprise de l'année précédente.

**Étape 4 — Pilotage d'une édition** ✅ *terminée le 13 novembre 2026*
Écran de pilotage (action du moment, vérification nommant les personnes en cause, tirage avec confirmation, clôture), bouton « Partager » sur chaque participant (v5), fiche participant (partager, copier, lien, annuler « envoyé », dernière consultation, régénérer le lien, retirer), ajout de participants, annulation du tirage avec motif et double confirmation. Interface : écrans empilés avec retour et fil d'Ariane, listes mobiles, pas de modale. Tests de bout en bout Playwright (`pnpm test:e2e`, build Cloudflare + D1 jetable, format iPhone) en CI.

Plan initial : Liste des participants, génération des liens, copie et partage, vérification de faisabilité, tirage, annulation et relance, clôture.

**Étape 5 — Parcours participant** ✅ *terminée le 13 novembre 2026*
Page personnelle `/p/[token]` dans tous ses états (attente, bouton « Découvrir », résultat, clôturée, lien invalide), révélation comptée et journalisée (`POST /api/p/[token]/reveal`, compteur incrémenté en base de façon atomique), journal du groupe `/p/[token]/journal` filtrable par édition. Points à connaître :
- Garde unique `requirePersonalLink` (`server/http/personal.ts`) : jeton inconnu, mal formé ou régénéré, même réponse 404 `link_invalid`.
- Règles pures dans `server/utils/personal.ts` (`personalPhase`, `canReveal`, `canEditWishes`). Une édition clôturée laisse consulter son résultat (toujours compté et journalisé).
- Le résultat ne vit que dans l'état de la page (mutation TanStack Query, jamais mise en cache) : il disparaît au rechargement.
- En-têtes `Referrer-Policy`, `Cache-Control: no-store` et `X-Robots-Tag` posés par `routeRules` sur `/p/**` et `/api/p/**`.
- Le journal renvoyé au participant ne contient que des phrases (`journalEntries`), jamais le `meta` brut. Le composant `JournalList` et `loadJournal` sont prêts à resservir côté gardien.
- La page se met à jour seule : l'état est redemandé toutes les 10 s tant que l'onglet est visible (pas de SSE ni de WebSocket ; le vrai push par Durable Object a été étudié puis écarté le 13 novembre 2026, trop de mécanique pour un événement annuel).
- Le participant change son icône depuis sa page (`PUT /api/p/[token]/avatar`, panneau du bas avec « Valider ») jusqu'à la clôture. La personne modifiée vient du lien, jamais de la requête. Ce changement n'est pas journalisé.
- Journal affiché en frise (`JournalList`) : fil rouge, emoji par type d'événement, étapes clés en cartes, regroupement par jour.
- Tests de bout en bout dans `tests/e2e/participant.spec.ts`.

**Étape 5 bis — Liste de souhaits** ✅ *terminée le 13 novembre 2026*
Routes `GET/PUT /api/p/[token]/wishes`, écran `/p/[token]/souhaits`, liste du receveur sur l'écran de résultat, événement `wishes_updated`. La pastille *souhaits* côté gardien existait depuis l'étape 4. Modifiable en `invitations` et `tirée`, refusée en brouillon, en clôturée ou si la règle `wishlist` est inactive. Une insertion par souhait dans la transaction : D1 limite une requête à 100 paramètres. Écran en liste, ajout et modification dans un panneau du bas, avec un bouton **« Valider »** par idée (pas d'enregistrement global) : fermer le panneau autrement abandonne la saisie. Chaque validation écrit une ligne au journal.

**Étape 6 — Partage des liens** ✅ *fait avec l'étape 4 (v5)*
Quatre modèles de texte, textes préchargés, bouton « Partager » (feuille de partage du téléphone) et copie en repli, pastille *envoyé* annulable, journalisation. Le plan initial (liens WhatsApp `wa.me`) est abandonné.

**Étape 7 — Finitions**
Animation de révélation, états vides, messages d'erreur, accessibilité (contrastes, navigation clavier, lecteurs d'écran), revue de la liste de contrôle sécurité, test complet sur un vrai téléphone.

**Étape 8 — Mise en service**
Création des deux groupes réels, répétition générale avec une édition de test, puis lancement.

---

## 18. Tests attendus

### Algorithme de tirage (prioritaire)

- Personne ne se tire soi-même.
- Aucune paire exclue ne se tire ; une exclusion réciproque vaut dans les deux sens (cas des couples).
- Aucune répétition par rapport à l'édition précédente.
- Respect de `exclure_annees_precedentes` à 0, 1 et 2.
- Respect des exclusions manuelles, à sens unique et réciproques.
- Chaque participant offre une fois et reçoit une fois.
- Un nouveau venu n'a aucune exclusion d'historique.
- Une personne absente l'an dernier n'a pas d'exclusion pour cette année-là.
- Cas impossibles détectés avec un message exploitable : 2 participants en couple, 3 participants dont un couple, 4 participants en 2 couples avec exclusion de l'an dernier qui bloque tout.
- Test statistique : sur 10 000 tirages d'un petit groupe, toutes les solutions valides apparaissent avec des fréquences proches.
- Test par propriétés : groupes aléatoires de 3 à 30 personnes, toute solution renvoyée respecte toutes les contraintes.

### Sécurité

- Ouvrir la page d'un lien ne compte pas comme consultation ; seul `POST /reveal` incrémente le compteur et journalise.
- Un lien régénéré invalide l'ancien.
- Aucune route admin ne renvoie de receveur (test qui parcourt les réponses).
- Un gardien du groupe A reçoit un refus sur toutes les routes du groupe B.
- Chiffrement puis déchiffrement redonnent la valeur d'origine, et une clé différente échoue.

### Messages

- Chaque modèle contient le lien et le prénom, jamais de receveur ni de contenu de souhait, quelles que soient les données passées (test qui injecte un receveur dans les données et vérifie qu'il n'apparaît pas).
- Le lien est seul sur sa ligne.

### Liste de souhaits

- La normalisation (`wishes.js`) rejette : plus de `souhaits_max` idées, un libellé vide ou de plus de 200 caractères, une URL qui n'est pas `http`/`https`, et renvoie des positions contiguës à partir de 0.
- `PUT /wishes` est journalisé à chaque modification.
- `PUT /wishes` sur une édition clôturée ou un groupe où `liste_souhaits` est désactivée est refusé.
- `POST /reveal` renvoie la liste du receveur et uniquement la sienne.
- Les routes admin de participants renvoient un nombre de souhaits et jamais de libellé (test qui parcourt les réponses, comme pour les attributions).
- Après une annulation et relance du tirage, les listes sont intactes.

### Parcours

- Édition complète de bout en bout : création, invitations, partage, tirage, consultation, clôture (Playwright, `tests/e2e`).
- Annulation et relance : anciens résultats inaccessibles, liens conservés.
- Deuxième année : reprise des participants, exclusion de l'an dernier appliquée.

---

## 19. Critères de réussite

- [ ] Julien peut créer ses deux familles et nommer un gardien pour chacune.
- [ ] Un gardien peut mener une édition entière depuis son téléphone.
- [ ] Un participant découvre son résultat en moins d'une minute depuis son lien.
- [ ] Un participant qui n'a rien reçu peut être dépanné sans que personne d'autre ne voie son résultat.
- [ ] Toute tentative de triche laisse une trace visible de toute la famille.
- [ ] L'année suivante, la liste se met à jour en quelques minutes et personne ne retombe sur la même personne.
- [ ] Le tout fonctionne sans rien payer.

---

## 20. Questions encore ouvertes

À poser à Julien si elles bloquent, sinon appliquer la valeur proposée.

| Question | Valeur proposée par défaut |
|---|---|
| Nom du projet et de l'adresse Cloudflare ? | `secret-santa` |
| Noms et slugs des deux familles ? | À demander au moment de la mise en service |
| Qui est le gardien de la deuxième famille ? | Julien, tant qu'il n'a nommé personne |
| Le journal affiche-t-il les noms de famille ? | Prénom seul, nom ajouté uniquement en cas d'homonymes |
| Rappel automatique aux retardataires ? | Non, relance manuelle par le gardien |
| Après clôture, afficher à tous le tableau complet « qui a offert à qui » ? | Non, sauf demande explicite |
| Reprendre la liste de souhaits de l'an dernier à la création d'une édition ? | Non en V1 : liste vide à chaque édition. Un bouton « Reprendre ma liste de l'an dernier » est une évolution simple si la famille le demande |
| Le gardien peut-il voir le contenu des listes de souhaits ? | Non, seulement le nombre d'idées (voir 6 bis.2) |

---

## 21. Langues (v7)

Français, anglais, allemand. Le français reste la langue de référence et la langue par défaut.

### 21.1 Qui voit quelle langue

| Où | Langue |
|---|---|
| Page personnelle, liste de souhaits, journal du participant | Langue préférée de la personne (`persons.language`, migration `0006`, `fr` par défaut) |
| Messages à partager et emails | Langue préférée du **destinataire**, pas celle du gardien |
| Administration | Choix du visiteur, gardé dans un cookie `locale` sur l'appareil ; à défaut, langue du navigateur ; à défaut, français |
| Lien invalide | Cookie ou langue du navigateur (on ne sait pas qui c'est) |

Le gardien règle la langue d'une personne sur sa fiche. Le participant la change lui-même depuis sa page (`PUT /api/p/[token]/language`) : c'est enregistré comme sa préférence, donc ses prochains messages suivent.

### 21.2 Comment c'est fait

- **Dictionnaires typés** dans `shared/i18n/locales/<langue>/<domaine>.ts`, partagés par le serveur et les écrans. Le français est la référence ; les autres langues se terminent par `satisfies Dict<typeof fr>`, donc une clé manquante ou en trop ne compile pas.
- **Pas de bibliothèque d'i18n.** `translate(locale, clé, params)` (`shared/i18n/index.ts`) tient en quelques dizaines de lignes : substitutions `{nom}`, pluriels `{ one, other }` choisis par `Intl.PluralRules`, repli sur le français puis sur la clé. Raison : le serveur a besoin des mêmes textes que les écrans (messages, emails, journal), et les clés sont vérifiées à la compilation des deux côtés. C'est un écart assumé au « standard de l'industrie » de la section 7.1.
- **Écrans** : `const { t, tk, locale, setLocale } = useT()` (`t` pour une clé connue à la compilation, `tk` pour une clé construite à l'exécution), `useErrorMessage()` pour les erreurs d'API.
- **Journal** : les événements stockés ne contiennent aucun texte ; la phrase est composée à l'affichage dans la langue du lecteur (`describeEvent`, ordinaux par `Intl.PluralRules`).
- **Tests** : `shared/i18n/index.test.ts` vérifie que les trois langues ont les mêmes clés et les mêmes `{substitutions}` ; `tests/e2e/language.spec.ts` couvre le parcours.
- **Vocabulaire** : gardien → *organizer* / *Organisator* ; tirage → *draw* / *Auslosung* ; édition → *edition* / *Ausgabe* ; Secret Santa → *Secret Santa* / *Wichteln* ; tutoiement en allemand.
- La phrase de confirmation « JE VEUX VOIR LE TIRAGE » (8.7) reste en français dans toutes les langues : c'est le serveur qui la compare.

