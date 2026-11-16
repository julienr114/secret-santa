# Under the Tree — Secret Santa familial

> Document de passation. Il décrit **ce qui a été décidé** avec Julien (le porteur du projet) et **l'état réel** de l'application. Un agent qui reprend le projet doit pouvoir démarrer avec ce seul fichier.
>
> **État au 14 novembre 2026** : l'application est en production sur https://under-the-tree.party (déploiement manuel, `pnpm deploy:prod`). Les étapes 0 à 6 du plan sont terminées, la revue de sécurité de l'étape 7 est faite, le groupe réel « Famille Delacoux » est créé. Reste : accessibilité, seconde famille, première édition réelle (section 17).

### Historique des versions du plan

| Version | Ce qui a changé |
|---|---|
| v2 | Liste de souhaits par participant (section 6 bis), TanStack Query, guidelines de code (7.1) |
| v3 | Nuxt 4, Cloudflare Workers ; l'email gratuit sans nom de domaine est écarté (7.2) |
| v4 | TypeScript strict partout, Nuxt UI 4, thème « carte de Noël », imports par alias (`#server/…`, `#shared/…`, `~/…`) |
| v5 | Plus de code à 6 chiffres : le lien personnel suffit. Partage par la feuille de partage du téléphone. Les « couples » deviennent des exclusions génériques |
| v6 | Nom de domaine `under-the-tree.party` ; envoi par email en option (13.3) |
| v7 | Trois langues, langue préférée par personne (section 21) ; l'application s'appelle Under the Tree, « Secret Santa » reste le nom du jeu |

Des versions abandonnées (JavaScript sans TypeScript en v2, liens WhatsApp `wa.me` en v3, code à 6 chiffres jusqu'en v4), il ne reste que les migrations `0001` et `0002` et le nom de la variable `NUXT_PIN_PEPPER`.

---

## 1. Le besoin en bref

Une petite application web pour organiser le tirage au sort du Secret Santa de plusieurs familles.

- Chaque participant découvre **en privé** la personne à qui il offre un cadeau.
- Le tirage respecte des règles : pas soi-même, pas une personne exclue (conjoint, frère ou sœur…), pas la même personne que les années précédentes.
- Un **organisateur** (admin) pilote le tout sans jamais voir les résultats, et peut « rejouer » un envoi si quelqu'un n'a pas reçu ou a perdu son résultat, **sans trahir le secret**.
- Les participants sont, selon Julien, « tous des gros tricheurs » : l'application doit être **verrouillée et la triche visible de tous**.
- **Coût : le prix du nom de domaine, rien d'autre.** Hébergement, base de données et envois restent sur des offres gratuites.
- **Mobile first** : presque tout le monde l'utilisera sur téléphone.

### Contraintes fermes

| Contrainte | Détail |
|---|---|
| Presque gratuit | Seul le nom de domaine est payant (v6) ; aucun abonnement |
| Mobile first | Conçu pour le téléphone d'abord, utilisable sur ordinateur ensuite |
| Secret | Personne d'autre que le participant ne voit son résultat dans l'interface, organisateur compris |
| Anti-triche | Lien personnel impossible à deviner + journal public des consultations |
| Envoi par l'organisateur | L'organisateur partage chaque lien avec la feuille de partage de son téléphone (WhatsApp, SMS…). L'envoi par email est une option par groupe (13.3) |
| Multi-familles | Plusieurs groupes cloisonnés dans une seule application |
| Pluriannuel | Participants et exclusions évoluent d'une année sur l'autre, l'historique est conservé |
| Langues | Français, anglais, allemand ; langue préférée par personne (section 21) |

---

## 2. Décisions prises (et pourquoi)

Ces points ont été tranchés avec Julien. Ne pas les rouvrir sans lui demander.

1. **Partage des liens par la feuille de partage du téléphone.** L'organisateur touche « Envoyer » sur un participant : le téléphone propose WhatsApp, SMS, etc., avec le message et le lien prêts. Sur ordinateur, sans feuille de partage, le message est copié. Aucun numéro de téléphone n'est stocké. L'envoi par email est une option par groupe, en complément (13.3).
2. **Le message ne contient jamais le résultat.** Il ne contient qu'un lien personnel. Le résultat ne s'affiche que dans l'application, après un geste explicite du participant (bouton « Découvrir »).
3. **Le lien personnel suffit.** Le jeton fait 32 octets aléatoires (256 bits) : impossible à deviner. La protection contre la triche repose sur le **journal public** (chaque consultation y apparaît avec son compteur) et sur la **régénération** d'un lien transféré par erreur. Ce qui compte pour l'organisateur : savoir qui a consulté son lien.
4. **Journal public par groupe** : toutes les actions sensibles y sont listées, sans jamais indiquer qui a tiré qui.
5. **Pas de chiffrement de bout en bout.** Julien est l'organisateur du secret et assume ce rôle. Les résultats sont chiffrés en base avec une clé détenue par le serveur. L'hébergeur de l'application peut donc techniquement les lire : c'est accepté.
6. **Plusieurs groupes** (Julien a deux familles), chacun avec **son propre organisateur** et **ses propres règles**.
7. **Participants modifiables chaque année** : ajout, retrait, mise à jour des exclusions.
8. **Tirage unique par édition**, avec une procédure explicite et journalisée d'annulation/relance.
9. **Hébergement Cloudflare Workers** (application + base D1) : un seul compte, et la base ne se met pas en veille alors que l'application ne sert qu'un mois par an. Preset Nitro `cloudflare_module`, déploiement manuel (section 16).
10. **Stack Nuxt 4 / TypeScript strict** : Vue 3 et Nuxt sont la stack que Julien maîtrise. Back-end en **routes serveur Nitro**, base via **Drizzle ORM**, interface en **Nuxt UI 4**, appels API côté client via **TanStack Query (Vue)**. Pas de store global : TanStack Query porte l'état serveur, le reste tient dans des `ref` locaux.
11. **Liste de souhaits** (décision v2) : chaque participant peut saisir quelques idées de cadeaux ; son donneur les découvre **uniquement** sur l'écran de résultat, après avoir touché « Découvrir ». La liste ne révèle jamais qui a tiré qui. Détails en section 6 bis.
12. **Programmation fonctionnelle et standards de l'industrie** (décision v2) : fonctions pures pour tout le métier, effets de bord repoussés dans les routes, ESLint + Prettier, tests Vitest sur la logique métier, Git en petits commits. Détails en section 7.1.

### Hors périmètre

- Tout envoi sans action de l'organisateur : pas d'envoi automatique, pas d'API WhatsApp ni de SMS.
- Chiffrement de bout en bout.
- Messagerie anonyme, paiement, application native.
- Dans la liste de souhaits : réservation d'un cadeau (« je le prends ») et notification du donneur quand la liste change.
- Comptes utilisateurs ou code secret pour les participants (le lien suffit, décision v5).

---

## 3. Vocabulaire

| Terme | Sens |
|---|---|
| **Groupe** | Une famille. Cloisonné des autres groupes. |
| **Organisateur** | L'admin d'un groupe (appelé « gardien » jusqu'au 14 novembre 2026 ; le code dit toujours `guardian`). Gère participants, tirage et envois, ne voit pas les résultats. |
| **Super-admin** | Julien. Crée les groupes et nomme les organisateurs. |
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
en préparation ──► tirée ──► clôturée
       ▲             │
       └── annulation du tirage (journalisée)
```

Depuis le 15 novembre 2026 (22.8), l'édition naît **en préparation**, avec une date de fête obligatoire : il n'y a plus d'étape « brouillon » ni d'étape « invitations » à ouvrir. L'écran de l'organisateur montre une frise en trois étapes, Préparer, Tirer, Fêter ; « Fêter » est la même édition tirée, à partir du jour de la fête.

| Statut | Ce qui est possible |
|---|---|
| `preparing` | L'organisateur compose la liste des participants et les exclusions, règle les paramètres. Les liens marchent déjà : il peut, s'il le veut, prévenir avant le tirage pour que chacun note ses idées. |
| `tirée` | Le tirage est fait. La liste des participants est verrouillée. Chacun peut consulter son résultat et les souhaits de son receveur, et continuer à modifier ses propres souhaits. |
| `clôturée` | Après la fête. Lecture seule, souhaits compris. Sert d'historique pour l'exclusion de l'année suivante. |

### 4.2 Parcours de l'organisateur

1. Se connecte avec son adresse email (lien magique) et ouvre son groupe.
2. Crée l'édition. L'application **reprend les participants de l'édition précédente** (les exclusions appartiennent au groupe et restent valables).
3. Coche qui participe, ajoute les nouveaux, désactive les absents, met à jour les exclusions.
4. Facultatif : prévient avant le tirage (« Prévenir avant le tirage »), pour que chacun note ses idées.
5. Lance le tirage quand la vérification est verte, après un récapitulatif dans un panneau du bas.
6. Prévient chacun que le tirage est fait : par email à plusieurs d'un coup (action principale), ou une personne à la fois depuis sa ligne (email, partage du téléphone, copie).
7. Suit chaque personne : *à prévenir*, *pas encore ouvert*, *a découvert* (combien de fois), et le nombre d'idées (jamais leur contenu).
8. En cas de pépin : renvoie un lien, régénère un lien transféré par erreur, annule et relance le tirage.
9. Après la fête : clôture l'édition.

### 4.3 Parcours du participant

1. Reçoit son lien personnel (WhatsApp, SMS…), partagé par l'organisateur.
2. Ouvre son lien : pas de code, pas de compte.
3. Avant le tirage : voit un écran d'attente (« Le tirage n'a pas encore eu lieu ») avec une invitation à remplir sa liste de souhaits.
4. À tout moment avant la clôture : renseigne ou modifie sa **liste de souhaits** (quelques idées, avec un lien facultatif). Le lien suffit (v5).
5. Après le tirage : touche « Découvrir à qui j'offre un cadeau », voit « Tu offres un cadeau à **Prénom** », avec le budget et la date si renseignés, puis la **liste de souhaits de Prénom** (ou « Prénom n'a pas encore donné d'idée »). C'est ce geste, et non la simple ouverture du lien, qui compte comme consultation : les aperçus automatiques de liens (WhatsApp, iMessage) ne le déclenchent pas.
6. Peut revenir consulter son résultat autant de fois qu'il veut. Chaque consultation est comptée et journalisée.
7. Peut consulter le journal de son groupe.

### 4.4 Cas « rejouer sans trahir le secret »

| Situation | Action de l'organisateur | Effet |
|---|---|---|
| Message non reçu ou effacé | « Partager » à nouveau, ou « Copier le lien » | Même lien, journalisé |
| Lien perdu | Idem | Idem |
| Lien compromis (transféré par erreur) | « Régénérer le lien » | L'ancien lien ne marche plus, journalisé |
| Désistement ou ajout après le tirage | « Annuler et relancer le tirage » | Voir 6.5 |

Dans aucun de ces cas l'organisateur ne voit le résultat.

---

## 5. Règles paramétrables par groupe

Réglables par l'organisateur, avec une valeur par défaut au niveau du groupe et une surcharge possible par édition.

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
4. Si le backtracking échoue : **aucune solution n'existe**. Renvoyer une erreur claire à l'organisateur, en nommant les participants dont la liste de receveurs possibles est vide ou trop restreinte, pour qu'il assouplisse une règle.

Aléa : `crypto.getRandomValues` exclusivement, jamais `Math.random`.

### 6.3 Exécution

- Le tirage s'exécute **uniquement côté serveur**.
- La réponse renvoyée à l'organisateur ne contient **aucune attribution**, seulement « tirage effectué » et le nombre de participants.
- Les attributions ne sont jamais écrites dans les logs.
- Le receveur est stocké **chiffré** (voir 8.3).

### 6.4 Unicité

Une édition `tirée` ne peut pas être retirée par un simple clic. Le bouton de tirage disparaît et l'API refuse un second tirage.

### 6.5 Annulation et relance

Procédure réservée à l'organisateur, avec double confirmation :

1. Toutes les attributions de l'édition sont supprimées.
2. L'édition repasse en préparation (`preparing`), la liste redevient modifiable.
3. Les liens des participants **restent valables**.
4. Les compteurs de consultation sont remis à zéro.
5. Un événement `draw_cancelled` est inscrit au journal, avec le motif saisi par l'organisateur.
6. Au nouveau tirage, l'organisateur renvoie à chacun le message « Nouveau tirage, ton ancien résultat n'est plus valable » (modèle fourni, voir section 13).

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
- La liste est modifiable en préparation et une fois tirée, figée en `clôturée`.
- Une relance du tirage (6.5) **conserve** les listes : elles appartiennent à la participation, pas à l'attribution.

### 6 bis.2 Qui voit quoi

| Acteur | Accès |
|---|---|
| Le participant | Lit et modifie sa propre liste depuis sa page personnelle |
| Son donneur | Lit la liste de son receveur sur l'écran de résultat, en même temps que le prénom |
| L'organisateur | Voit seulement le **nombre d'idées** par participant (pastille *souhaits renseignés*), jamais le contenu |
| Le journal | Mentionne qu'une liste a été mise à jour, jamais son contenu |

Le contenu d'une liste n'est donc jamais exposé en dehors des deux premiers cas. Ce n'est pas un secret aussi fort que l'attribution, mais afficher les listes de tout le monde permettrait de deviner par recoupement qui achète quoi pour qui. On s'en abstient.

### 6 bis.3 Protection contre la triche

- **Le lien suffit pour modifier sa liste** (décision v5). Un lien transféré permettrait donc de réécrire les envies de quelqu'un : chaque modification est journalisée (« Léa a mis à jour sa liste »), ce qui rend l'abus visible, et l'organisateur peut régénérer le lien.
- Lecture de sa propre liste : le lien suffit (rien à y gagner pour un tricheur).
- La sauvegarde **remplace la liste entière** (une seule requête idempotente, pas de gestion d'items unitaires) : plus simple, et conforme à l'approche fonctionnelle.
- Événement `wishes_updated` au journal : « Léa a mis à jour sa liste de souhaits (3 idées) ».

### 6 bis.4 Écran

- Route `/p/[token]/souhaits`, accessible depuis la page personnelle par un bouton « Ma liste de souhaits ».
- Un champ par idée, bouton « Ajouter une idée », suppression par croix, lien facultatif sous chaque idée. Un bouton « Enregistrer ».
- Sur l'écran de résultat, la liste du receveur apparaît sous le prénom, après l'animation de révélation, sous le titre « Ses idées de cadeaux ».

---

## 7. Stack technique

| Élément | Choix |
|---|---|
| Langage | **TypeScript strict**, modules ESM. `pnpm typecheck` (vue-tsc) tourne en CI |
| Framework | **Nuxt 4** (`nuxt.config.ts`), structure `app/` native |
| Interface | **Nuxt UI 4** sur Tailwind 4, thème « carte de Noël » (rouge brique, vert sapin, papier kraft, titres en Fraunces), mobile first |
| Back-end | **Routes serveur Nitro** (`server/api/**`), un fichier par route et méthode, `defineEventHandler` |
| Appels API côté client | **TanStack Query pour Vue** : `useQuery` pour les lectures, `useMutation` pour les écritures, invalidation par clés. Transport : `$fetch` de Nuxt. Hydratation SSR par un plugin Nuxt |
| État client | Aucun store global. L'état d'interface vit dans des `ref` locaux ou des composables |
| Rendu | SSR sur Cloudflare Workers, preset Nitro `cloudflare_module`. Binding D1 déclaré dans `wrangler.toml` |
| Base de données | Cloudflare D1 (SQLite). **Une requête est limitée à 100 paramètres** : pas d'insertion multi-lignes, une instruction par ligne dans `db.batch` |
| ORM et migrations | **Drizzle ORM** + drizzle-kit (`drizzle.config.ts`, schéma en `server/database/schema.ts`), migrations appliquées par wrangler |
| Validation | Zod sur toutes les entrées d'API ; les types sont dérivés des schémas |
| Traductions | Dictionnaires typés maison dans `shared/i18n`, partagés par le serveur et les écrans (section 21) |
| Sessions admin | Session en base, révocable, 30 jours ; cookie scellé (`nuxt-auth-utils`) qui ne porte que son identifiant |
| Cryptographie | Web Crypto API |
| Transmission des liens | Feuille de partage du téléphone (`navigator.share`), copie en repli ; email en option par Resend (13.3) |
| Qualité | **ESLint** (config plate, `@nuxt/eslint`, `eslint-plugin-functional`) + **Prettier**. Hooks Git via `simple-git-hooks` + `lint-staged` |
| Tests | **Vitest** sur toute la logique pure (`server/utils/**`, `shared/**`). **Playwright** de bout en bout (`pnpm test:e2e`) sur un build Cloudflare servi par wrangler, D1 locale jetable, format téléphone |
| Intégration continue | GitHub Actions : `lint`, `typecheck`, `format:check`, `test`, `build`, puis les tests de bout en bout |
| Gestionnaire de paquets | pnpm |

### 7.2 Vérifications de l'étape 0 (faites le 13 novembre 2026, conservées pour mémoire)

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
| Version de Nuxt | La documentation de Nuxt, Nitro et des modules cible Nuxt 4 ; la structure `app/` du plan est celle de Nuxt 4 | **Nuxt 4** (décision v3) |

### 7.1 Guidelines de code

Décidées avec Julien en v2. Elles s'appliquent à tout le code, serveur et client.

#### Programmation fonctionnelle

- **Fonctions pures d'abord.** Tout le métier (`draw`, `rules`, `crypto` hors appels Web Crypto, construction des événements du journal, modèles de messages, validation des souhaits) est écrit en fonctions pures : mêmes entrées, mêmes sorties, aucun accès à la base, à l'horloge ou à l'aléa à l'intérieur. L'aléa et l'horloge sont **passés en paramètre** (`draw(participants, rules, { random })`), ce qui rend les tests déterministes.
- **Noyau pur, coque impure.** Les routes Nitro sont la seule couche qui lit la requête, interroge la base et écrit la réponse. Elles sont courtes : valider (Zod) → charger → appeler le métier → persister → répondre. Pas de logique métier dans une route.
- **Immutabilité.** `const` partout, jamais de mutation d'un argument ni d'un objet partagé. Nouvelles valeurs par décomposition (`{ ...rules, budget }`), `map`/`filter`/`reduce` plutôt que boucles qui mutent, `toSorted` plutôt que `sort`. Exception tolérée et localisée : le mélange Fisher-Yates sur une copie du tableau.
- **Pas de classes, pas de `this`.** Les « interfaces » sont des objets de fonctions produits par des fabriques : `createRepository(db)` renvoie des fonctions de requête, `createClock()` renvoie `{ now }`. L'injection de dépendances se fait par arguments.
- **Composition.** Petites fonctions nommées d'après ce qu'elles renvoient, composées plutôt qu'imbriquées. Une fonction fait une chose ; au-delà d'une vingtaine de lignes, on la découpe.
- **Erreurs métier comme valeurs.** Le métier renvoie des résultats explicites (`{ ok: true, value }` / `{ ok: false, reason, details }`) plutôt que de lancer des exceptions. Seule la coque transforme un `ok: false` en `createError` HTTP. Le résultat de la vérification de faisabilité du tirage (section 6.2, point 4) en est l'exemple type.
- **Côté Vue** : composition API et `<script setup>`, composables qui renvoient des valeurs réactives dérivées (`computed`) plutôt que des mutations manuelles, pas de watchers quand un `computed` suffit. Les composables TanStack Query sont regroupés par domaine dans `app/composables/queries/`, avec un fichier `keys.ts` pour les clés de cache.
- Pas de bibliothèque fonctionnelle imposée (Ramda, fp-ts…) : le TypeScript natif suffit à cette taille de projet.

#### Standards de l'industrie

- **ESLint** en configuration plate, basée sur `@nuxt/eslint`, complétée par des règles qui soutiennent le style fonctionnel : `no-param-reassign`, `prefer-const`, `no-var`, `prefer-arrow-callback`, `no-restricted-syntax` sur `class` et `for…in`, `eqeqeq`. `eslint-plugin-functional` évalué à l'étape 1, adopté s'il n'alourdit pas trop.
- **Prettier** avec la configuration par défaut (deux espaces, guillemets simples, point-virgule, 80 colonnes), appliqué à tout le dépôt. Aucune règle de mise en forme dans ESLint.
- **Tests** : Vitest. Toute fonction de `server/utils/**` a son fichier de test à côté (`draw.test.ts`). Les tests décrits en section 18 sont la liste minimale. Les routes sont testées plus légèrement, sur les cas de refus (session absente, mauvais groupe, réponse admin sans attribution). Objectif de couverture sur `server/utils` : 90 % de lignes.
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
- En base : l'empreinte SHA-256 du jeton (pour la recherche) **et** le jeton chiffré avec la clé serveur (pour que l'organisateur puisse le renvoyer ou le copier).
- Un jeton par participation, donc un **nouveau lien à chaque édition**.
- Régénérable par l'organisateur, ce qui invalide l'ancien.
- Pages `/p/*` : en-têtes `Referrer-Policy: no-referrer`, `Cache-Control: no-store`, `X-Robots-Tag: noindex`.

### 8.2 Lien seul, sans code

- Le jeton du lien fait 32 octets aléatoires (256 bits) : le deviner est hors de portée, même avec des milliards d'essais par seconde. Le stockage reste : empreinte SHA-256 pour la recherche, copie chiffrée pour le repartage.
- Le risque n'est pas le hasard mais la **fuite** d'un lien (message transféré, téléphone emprunté). Contre-mesures : journal public de chaque consultation avec son compteur, pastille *consulté* côté organisateur, régénération du lien.
- Le résultat ne s'affiche qu'après un geste du participant (bouton), jamais au simple chargement de la page : les robots d'aperçu de liens ne le voient pas et ne faussent pas le compteur.

### 8.3 Chiffrement des résultats

- Le receveur de chaque attribution est chiffré en AES-256-GCM avec la clé `DATA_KEY` (variable secrète), un vecteur d'initialisation aléatoire par ligne.
- Le donneur est en clair, le receveur chiffré : une lecture brute de la base ne révèle pas les résultats.
- Le déchiffrement n'a lieu que dans deux cas : la consultation par le participant, et le calcul des exclusions lors d'un tirage ultérieur.
- **Aucune route d'administration ne renvoie une attribution en clair**, y compris pour le super-admin.

### 8.4 Administration (comptes, depuis le 14 novembre 2026)

Plus aucun mot de passe. Détail de la conception en 22.5.

- **Compte** : une adresse email. La connexion se fait par **lien magique** : `/login` demande l'adresse, un email apporte un lien `/login/<jeton>`, et un bouton sur cette page ouvre la session.
- **Lien** : jeton de 256 bits stocké en empreinte SHA-256, **usage unique**, valable **15 minutes** ; en demander un nouveau invalide les précédents ; ouvrir la page ne le consomme pas (seul le bouton le fait) ; même réponse que l'adresse ait un compte ou non ; 5 demandes par heure et par adresse, 20 par heure et par adresse IP.
- **Session** : une ligne en base (`sessions`), 30 jours, **révocable**. Le cookie scellé (`HttpOnly`, `Secure`, `SameSite=Lax`) ne porte que son identifiant ; elle est vérifiée à chaque requête. Se déconnecter la révoque ; « Mon compte » liste les appareils et permet de tout déconnecter.
- **Rôle**, recalculé à chaque requête depuis le compte, jamais lu dans le cookie : **super-admin** (indicateur `accounts.is_super_admin`, plusieurs possibles), **organisateur** (au moins un groupe dans `group_members`) ou **membre** (tous les autres : un participant qui se connecte pour retrouver ses tirages). Un membre n'a aucun accès à `/api/admin/*` (403) ni aux écrans `/admin`.
- **Inscription libre** (14 novembre 2026) : toute adresse valide reçoit un lien ; son compte est créé à la première demande, simple membre, dans la langue du participant qu'un organisateur aurait saisi avec cette adresse. Seul un compte désactivé ne reçoit rien. Garde-fous : 5 demandes par heure et par adresse, 20 par adresse IP.
- **Quota de groupes** (`accounts.group_quota`, 0 par défaut) : un compte crée un groupe s'il lui reste de la place (groupes créés et encore existants, `groups.created_by`) ; il en devient le premier organisateur. Un super-admin n'a pas de limite.
- **Demande de groupe** (`group_requests`) : depuis l'accueil, un compte sans place écrit pour qui il veut organiser un tirage ; une seule demande en attente à la fois. Chaque super-admin reçoit un email. Accepter laisse la place pour **un** groupe de plus ; dans les deux cas le demandeur est prévenu par email.
- **Pages du super-admin**, avec une barre du bas (Accueil, Comptes avec le nombre de demandes en pastille, Groupes) :
  - `/admin/comptes` : tous les comptes dans une liste, ceux qui attendent une réponse en tête (« À traiter »), les désactivés repliés à la fin ; recherche par nom ou adresse.
  - `/admin/comptes/[id]` : la page d'un compte. Prénom, nom et avatar modifiables par l'admin ; trois tuiles (groupes créés, organisés, dernière visite) ; « Création de groupes » : la demande en attente (réponse dans un panneau qui montre ce que l'acceptation change et la jauge de charge de l'application), le quota avec − / + (augmenter le quota accepte une demande en attente), les groupes organisés ; « Accès » : désactiver (avec confirmation), réactiver.
  - `/admin/groupes` : tous les groupes, et la création d'un groupe.
- **Charge de l'application** : au-delà d'environ 50 groupes (`APP_GROUPS_COMFORT`), le plan gratuit de Resend (3 000 emails par mois) risque de ne plus suffire ; la page d'une demande le signale en orange, puis en rouge.
- **L'organisateur est une personne de son groupe** : le désigner (à la création ou depuis « Organisateurs ») le crée comme personne, copiée de son profil (prénom tiré de l'adresse sans profil). Tant qu'il organise, on ne peut ni le supprimer, ni le désactiver, ni changer son adresse (`person_is_organizer`).
- **Profil d'un compte** (`accounts.first_name`, `last_name`, `avatar_emoji`, `avatar_color`, migration `0012`) : prénom, nom facultatif, avatar et langue, réglés dans « Mon compte ». Quand un compte crée son groupe, il en devient la **première personne**, copiée de son profil (avec son adresse) ; la modifier ensuite dans le groupe ne change pas le profil, et inversement. Sans prénom, l'accueil invite à compléter le profil et aucune personne n'est créée.
- **Identifiant d'un groupe** : il n'est plus demandé. Il est déduit du nom (`slugify`), numéroté si déjà pris (`famille`, `famille-2`…).
- **Retour à l'accueil depuis un tirage** : sur les pages `/p/...`, une personne connectée a un bouton maison et le logo cliquable.
- **Rôle à jour côté écran** : quand l'application relit sa session, le serveur répond avec le rôle actuel du compte (`server/plugins/session.ts`), pour qu'un membre qui vient de créer un groupe voie tout de suite ses écrans d'organisateur.
- **Page d'accueil** (`/`, la même pour tous) : sans session, la connexion ; avec, « Je participe » (une ligne par tirage en cours avec l'étape suivante et le compte à rebours jusqu'à l'échange, les tirages clôturés repliés ; les participations des personnes qui portent l'adresse du compte, hors brouillons, ouvertes par leur lien personnel), « J'organise » (chaque groupe avec l'état de son tirage en cours ; « Nouveau groupe » avec le nombre restant, ou « Organiser un tirage » qui ouvre la demande, l'application étant en bêta), et pour le super-admin une section « Administration ». Un organisateur qui met sa propre adresse sur un participant y verrait son lien : comme pour un lien copié, la première consultation du résultat reste inscrite au journal.
- **Organisateurs d'un groupe** : désignés par leur adresse depuis l'écran « Organisateurs » du groupe, par un super-admin ou par un autre organisateur. On ne se retire pas soi-même. Retirer quelqu'un coupe ses sessions ouvertes sur ce groupe à la requête suivante.
- **Super-admin** : crée et supprime les groupes, active l'envoi par email, gère tous les groupes. `julienr114@gmail.com` est créé par la migration `0007` ; les adresses de `NUXT_SUPER_ADMIN_EMAILS` le deviennent à leur première demande de lien (amorçage d'une installation neuve).
- **Développement et tests** : `NUXT_DEV_LOGIN_LINKS=true` renvoie le lien à l'écran au lieu de dépendre d'un email. **Jamais en production.**
- Toutes les routes `/api/admin/*` vérifient la session **et** le droit sur le groupe concerné.
- **Lien d'invitation d'un groupe** (`groups.invite_code`, `invite_until`, `invite_places`, `invite_message`, migration `0013`) : désactivé par défaut ; l'organisateur le règle sur la page `/admin/[groupe]/invitation`, ouverte depuis « Personnes » : date limite facultative, nombre de places (par défaut, ce qu'un tirage peut encore accueillir : 100 moins les personnes actives), son mot affiché sur la page d'invitation. Une fois créé : le message à copier ou partager (comme ceux d'un tirage), un nouveau lien (l'ancien cesse de marcher), la désactivation. Page `/rejoindre/[code]` : le groupe, son tirage en cours et le mot de l'organisateur ; sans session, connexion ou inscription par lien magique qui ramène ici (`?next=`, limité aux pages `/rejoindre/…` et `/p/…`) ; puis un prénom si le profil n'en a pas, et « Rejoindre le groupe » : le compte devient une personne du groupe (la sienne si l'organisateur avait déjà saisi cette adresse) et prend une place. **On rejoint le groupe, pas le tirage** : l'organisateur l'ajoute au tirage en cours, et les éditions suivantes le reprennent. Refus après la date limite (`invite_expired`) ou sans place (`invite_full`).
- **Emails aux organisateurs** (règles du groupe `notifyJoined`, `notifyAllViewed`, `notifyReminder`, activées par défaut, réglables dans « Réglages ») : à chaque organisateur du groupe, dans sa langue. Quelqu'un rejoint le groupe par le lien (avec un rappel : l'ajouter au tirage et à ses exclusions) ; le dernier participant découvre son tirage ; **rappel 3 jours avant l'échange** avec les prénoms de ceux qui n'ont pas encore découvert leur tirage. Le rappel part d'une **tâche planifiée** : cron Cloudflare chaque jour à 8 h UTC (`[triggers]` dans `wrangler.toml`, `server/plugins/reminders.ts`), une seule fois par édition (`editions.reminder_sent_at`, migration `0014`), rien n'est envoyé si tout le monde a vu. En test, `wrangler dev --test-scheduled` permet de la lancer par `GET /__scheduled`.
- **Connexion et création de compte** : deux onglets sur le même formulaire. « Se connecter » demande l'adresse ; « Créer un compte » demande le prénom et l'adresse (le prénom va dans le profil du nouveau compte, ou complète un compte qui n'en avait pas ; la réponse reste la même dans tous les cas). `/login?mode=signup` ouvre sur la création.
- **Garder un tirage dans son compte** : sur la page d'un tirage ouverte par le lien personnel, sans session, une carte invite à créer un compte. Si l'organisateur a saisi l'adresse de la personne, un bouton envoie directement le lien de connexion à cette adresse, avec son prénom : le compte est créé et le tirage y est d'office. Sinon, « Créer mon compte » ouvre le formulaire de création avec le prénom déjà rempli, et la connexion ramène sur le tirage. Connecté, « Ajouter à mon compte » donne l'adresse du compte à la personne, si elle n'en avait pas (`person_has_other_email` sinon) ; le tirage apparaît alors dans « Je participe ».

### 8.5 Cloisonnement

- Chaque requête de base filtre sur `group_id`.
- Un organisateur ne peut ni lire ni modifier un autre groupe.
- Le journal d'un groupe n'est visible que par ses participants (lien valide) et son organisateur.

### 8.6 Liste de contrôle (revue du 14 novembre 2026)

- [x] Aucune attribution dans une réponse d'API admin tant que l'édition n'est pas clôturée (hors accès de dernier recours, 8.7). Vérifié par `tests/e2e/security.spec.ts`, qui apprend les vraies paires par les liens des participants puis les cherche dans toutes les réponses admin, organisateur et super-admin.
- [x] Aucune attribution dans les logs (aucun `console.*` côté serveur) ni dans les messages et emails (tests unitaires).
- [x] Aucun contenu de liste de souhaits dans une réponse d'API admin ni dans le journal (même test).
- [x] Toute modification faite avec un lien personnel est journalisée : liste de souhaits, icône (`avatar_changed`), langue (`language_changed`).
- [x] Toutes les entrées validées par Zod ; les champs inconnus sont ignorés.
- [x] Requêtes paramétrées uniquement (Drizzle).
- [x] Limitation des tentatives sur la connexion admin, sur l'adresse `CF-Connecting-IP` (un `X-Forwarded-For` forgé ne la contourne plus) ; les échecs périmés sont purgés.
- [x] En-têtes de sécurité : sur toutes les pages et réponses `X-Frame-Options: DENY`, `frame-ancestors 'none'`, `nosniff`, `Referrer-Policy` ; en plus sur `/p/*` `no-referrer`, `no-store`, `noindex`.
- [x] Toutes les routes `/api/admin/*` refusent sans session (401) et hors de son groupe (403).
- [x] Aucune lecture n'écrit : la copie d'un lien, journalisée, est un `POST`.
- [x] Secrets uniquement dans les variables d'environnement, jamais dans le dépôt.

Limites connues et acceptées :
- L'organisateur reçoit les liens personnels pour les partager ; il peut donc en ouvrir un. C'est le journal public qui le rend visible (décision d'origine).
- Les adresses des pages personnelles, jeton compris, apparaissent dans les journaux de requêtes Cloudflare du compte (`[observability]`), lisibles par le seul titulaire du compte.
- Pas de limitation de débit sur les routes participant : le jeton de 256 bits ne se devine pas ; un détenteur de lien peut seulement gonfler son propre compteur et le journal.

Trouvé pendant la revue, hors sécurité : D1 limite une requête à 100 paramètres, ce qui faisait échouer la création d'une édition dès 10 personnes et le tirage dès 17 (insertions groupées). Corrigé par une insertion par ligne dans la transaction ; vérifié avec 40 personnes. Une édition est donc limitée à **100 participants** (`MAX_PARTICIPANTS`, refus `too_many_participants` à la création de l'édition et à l'ajout d'un participant), plutôt que de rencontrer la limite comme une erreur de base.

---

### 8.7 Secret et éditions passées (décisions du 13 novembre 2026)

- **Édition clôturée = résultats non secrets.** L'organisateur voit le tirage d'une édition clôturée dans les archives (« Léa a offert à Tom ») et, pendant la préparation de l'édition suivante, la liste nommée des paires exclues par les années précédentes. Il peut **lever une de ces exclusions pour l'édition en cours seulement** (colonne `editions.history_waivers`, migration `0004`), ou tout rétablir.
- Une édition **tirée mais pas encore clôturée** reste secrète : ses paires ne sont que comptées.
- **Accès de dernier recours, un résultat à la fois** (`POST /api/admin/[groupe]/editions/[id]/reveal-one`, corps `personId` ; d'abord prévu pour le tirage entier, restreint à une personne par appel le 13 novembre 2026, événement `result_revealed` qui nomme la personne dans le journal) : phrase « JE VEUX VOIR LE TIRAGE » à recopier, case de confirmation, et événement `results_revealed` inscrit au **journal public** (« L'organisateur a consulté les résultats du tirage »). L'organisateur pourrait de toute façon ouvrir les liens personnels ; cette voie officielle a l'avantage d'être visible de tous. Le résultat n'est affiché que dans l'état de l'écran, jamais mis en cache.
- Ces trois points remplacent, pour les éditions clôturées et l'accès de dernier recours, la règle « aucune route d'administration ne renvoie une attribution » de la section 8.3, qui reste vraie pour tout le reste.

---

## 9. Journal public

Visible par tous les participants du groupe (depuis leur page personnelle) et par l'organisateur. Affichage du plus récent au plus ancien, filtrable par édition.

**Règle absolue : le journal ne contient jamais qui a tiré qui.**

| Type d'événement | Exemple affiché (en français) |
|---|---|
| `edition_created` | « L'édition Noël 2026 a été créée » |
| `participant_added` / `participant_removed` | « Léa rejoint l'édition » / « Léa quitte l'édition » |
| `rules_changed` | « L'organisateur a modifié les règles du tirage » (règles, exclusions, exclusions levées) |
| `message_sent` | « L'organisateur a envoyé l'invitation à Léa (partagé) » ; type de message et canal `share`, `copy` ou `email` dans `meta` |
| `link_copied` | « L'organisateur a copié le lien de Léa » |
| `link_regenerated` | « Le lien de Léa a été régénéré » |
| `draw_done` | « Le tirage a été effectué pour 12 participants » |
| `draw_cancelled` | « Le tirage a été annulé. Motif : désistement de Tom » |
| `result_revealed` | « L'organisateur a consulté le résultat de Léa (accès de dernier recours) » |
| `result_viewed` | « Léa a découvert son résultat » : **seule la première consultation** de chacun est inscrite (décision du 14 novembre 2026). Les suivantes restent comptées pour l'organisateur, mais les journaliser permettrait de rapprocher « Léa a mis à jour sa liste » et « Tom a consulté son résultat » et de deviner qui offre à qui |
| `wishes_updated` | « Léa a mis à jour sa liste de souhaits (3 idées) » |
| `avatar_changed` / `language_changed` | « Léa a changé son icône » / « Léa a changé sa langue (Deutsch) » |
| `edition_closed` | « L'édition Noël 2026 est clôturée » |

Les événements stockés ne contiennent aucun texte : la phrase est composée à l'affichage, dans la langue du lecteur (section 21). `link_shared` et `results_revealed` (tirage entier) ne sont plus émis ; ils restent décrits pour d'anciennes lignes.

Chaque événement porte la date, l'heure et l'auteur (`participant`, `organisateur`, `super-admin` ou `système`).

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
| `created_at` | text | |

### `persons`
| Colonne | Type | Notes |
|---|---|---|
| `id` | text PK | |
| `group_id` | text FK | |
| `first_name` | text | Affiché partout |
| `email` | text nullable | Facultatif, pour l'envoi groupé par email (13.3) |
| `last_name` | text nullable | Affiché après le prénom dans les écrans de l'organisateur et du super-admin dès qu'il est renseigné ; côté participant, seulement pour départager des homonymes |
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
| `status` | text | `preparing`, `drawn`, `closed` (`draft` et `invitations` fusionnés par la migration `0015`) |
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
| `token_enc`, `token_iv` | text | Jeton chiffré, pour renvoi par l'organisateur |
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

Détails d'interface (page du tirage refaite le 15 novembre 2026) :
- De haut en bas : l'icône (avec un crayon tant qu'elle est modifiable), « Salut {prénom} ! », le groupe et l'édition ; une frise Invitation, Tirage, Fête (`participantSteps`, avec « bientôt », « fait », « dans N jours », « passée ») ; une carte avec une enveloppe (`envelopeState`) ; « Ma liste de souhaits » et « Journal du groupe » ; la carte « Garde tes tirages au même endroit ».
- Les états : avant le tirage (enveloppe en pointillés, « Noter mes idées de cadeaux ») ; à découvrir (enveloppe scellée, « Découvrir à qui j'offre un cadeau ») ; résultat affiché ; déjà découvert (enveloppe ouverte, « Revoir… » en contour, nombre d'idées qui attendent) ; clôturée (« La fête est passée », et « Découvrir » si le résultat n'a jamais été vu) ; lien invalide (enveloppe au cadenas, sans en-tête ni listes, sur les trois pages `/p/**`).
- Résultat : sur une étiquette cadeau qui se retourne en apparaissant (sans animation si `prefers-reduced-motion`) : « Tu offres un cadeau à », l'icône et le prénom en très grand, les pavés Budget et Date, le mot de l'organisateur, puis ses idées, chaque lien affiché « Voir le lien ».
- Le résultat ne reste pas affiché : il disparaît quand on quitte ou recharge la page, il faut retoucher « Découvrir ». Côté TanStack Query, la révélation est une **mutation**, jamais une requête mise en cache.
- Messages d'erreur clairs et sans jargon (« Ce lien n'est plus valable, demande-en un nouveau à ton organisateur »).

### Côté admin

| Route | Écran |
|---|---|
| `/` | Accueil, le même pour tous (refait le 15 novembre 2026). Sans session : le logo, une phrase, un encadré pour qui a reçu un lien personnel, puis la connexion. Connecté : « Bonjour » et l'avatar, la carte « À faire maintenant » (22.10), puis selon `homeLayout` : compte vide (d'où viendront les tirages, organiser un Secret Santa), un seul tirage (sa carte avec l'enveloppe, sa liste, les tirages passés), plusieurs tirages (une ligne chacun), ou au moins un groupe organisé (une carte par groupe, `groupCards` : « Mon tirage » et « Gérer le tirage ») |
| `/tirages-passes` | Les éditions clôturées du compte, par année ; chaque ligne ouvre la page du tirage |
| `/login`, `/login/[jeton]` | Connexion par lien magique : saisie de l'adresse (même écran que l'accueil sans session), puis page du lien avec son bouton |
| `/admin/groupes/nouveau` | Création d'un groupe, pour tout compte qui a de la place dans son quota |
| `/admin/groupes` | Super-admin : tous les groupes |
| `/admin/comptes`, `/admin/comptes/[id]` | Super-admin : comptes (demandes en tête), page d'un compte : profil, demande, quota, accès |
| `/admin/guide-de-style` | Super-admin : le guide de style (section 23). Plus aucun lien n'y mène, on y va par son adresse |
| `/compte` | Mon compte : adresse, appareils connectés, « Déconnecter partout » |
| `/admin/[groupe]/organisateurs` | Qui peut gérer le groupe : ajouter une adresse, en retirer une |
| `/admin/[groupe]` | Accueil du groupe (refait le 16 novembre 2026) : nombre de membres et « tu es organisateur » ; la carte de l'édition en cours (date et compte à rebours, frise `editionSteps`, résultats consultés et personnes à prévenir, « Ouvrir l'édition »), ou, sans édition, « Prépare le tirage de cette année » (qui sera repris, `carriedOver`, et « Créer l'édition ») ; « Le groupe » en quatre lignes : Membres, Exclusions (nombre de paires), Journal (dernier événement), Réglages ; puis les éditions passées. La suppression du groupe (super-admin) reste en bas |
| `/admin/[groupe]/personnes` | Personnes du groupe : ajouter, modifier (prénom, nom), désactiver ; écran Exclusions : paires qui ne se tirent pas (couples, fratries…), réciproques par défaut |
| `/admin/[groupe]/reglages` | Règles par défaut du groupe, et le lien vers les organisateurs |
| `/admin/[groupe]/editions/[id]` | Pilotage d'une édition (voir ci-dessous) |
| `/admin/[groupe]/editions/[id]/emails` | Envoi par email à plusieurs participants (13.3) |
| `/admin/[groupe]/editions/[id]/exclusions` | Exclusions qui s'appliquent à l'édition : celles du groupe et les paires des tirages précédents, levables ; une fois tirée, celles appliquées |
| `/admin/[groupe]/journal` | Journal du groupe |

Écran de pilotage d'une édition, le plus important (refait le 15 novembre 2026). De haut en bas : où en est l'édition, ce qu'il faut faire maintenant, les participants, puis ce qui peut attendre.
- **En-tête** : nom de l'édition, groupe et budget, pastille « Fête le … » qui ouvre le panneau de la date. Une édition ancienne sans date montre une carte « Quand a lieu la fête ? ».
- **Frise** Préparer, Tirer, Fêter (`editionStep`) ; une fois le tirage fait, l'étape du milieu dit « Tirage fait ».
- **Préparer** : carte « À faire maintenant » avec la vérification (le tirage est possible, sinon pourquoi) et « Lancer le tirage », qui ouvre un panneau de confirmation (participants, règles, personnes du groupe absentes de l'édition). Puis la liste des participants (nombre d'idées, langue des messages), « Choisir les participants », et une section « Si tu veux » : prévenir avant le tirage, exclusions.
- **Cas limites de « Préparer »** : sans participant, la carte dit « Ajoute les participants » (« Ajouter des participants », « Inviter par lien ») ; un tirage impossible a sa carte « À corriger avant le tirage » : une ligne par personne bloquée ou trop contrainte, la phrase d'aide, « Voir les exclusions » et « Ajouter des participants » à la place de « Lancer le tirage ».
- **Choisir les participants** (`…/editions/[id]/ajouter`, décidé par Julien le 16 novembre 2026, avant le tirage seulement) : un seul écran pour ajouter et retirer. Tous les membres actifs du groupe, une case par personne (`UiCheckRow`, toute la ligne coche), cochée si elle participe ; « Tout cocher » ; recherche et repli des longues listes ; « Créer une personne » (elle rejoint le groupe et l'édition, et revient cochée) et « Inviter par lien » ; « Enregistrer · N participants » dans un pied collant (`UiStickyFooter`), qui fait les ajouts et retraits (`participantChanges`) puis revient à l'édition. Après le tirage, l'adresse mène à l'édition.
- **Grands groupes** : au-delà de 10 participants, une recherche au-dessus de la liste ; au-delà de 12 (`FOLD_FROM`), la liste se replie (`listView`) : 6 lignes avant le tirage ; après, chaque série (`followSeries` : pas encore envoyé, pas encore consulté, résultat consulté) montre 3 lignes puis sa ligne de repli, qui rappelle l'état de la série. Le bouton de la carte dit « Prévenir les N par email ». L'écran d'envoi à plusieurs se replie après 5 lignes ; la sélection porte toujours sur toute la liste.
- **Noms** (décidé par Julien le 16 novembre 2026) : dans les écrans de l'organisateur et du super-admin (listes de membres et de participants, fiches, sélecteur de personne, envoi par email, exclusions), le nom de famille suit le prénom dès qu'il est renseigné (`fullName`) ; la recherche porte aussi sur le nom, le tri se fait par prénom puis par nom (`byName`). Côté participant (page du tirage, résultat, messages, journal), rien ne change : le prénom, et le nom seulement pour départager des homonymes (section 20, `displayName`).
- **Tirée** : carte « Préviens chacun que le tirage est fait » avec trois compteurs (à prévenir, pas encore ouvert, a découvert) et « Prévenir par email » (puis « Relancer par email ») vers l'écran d'envoi groupé. La liste met en tête ceux qui restent à prévenir (`sortParticipants`) ; le bouton rond de chaque ligne ouvre le panneau d'envoi, qui passe ensuite à la personne suivante.
- **Panneau d'envoi** : le message (`UiSegmented`), son texte exact dans une bulle (`UiMessageBubble`), un mot à ajouter, la langue (enregistrée sur la personne), puis l'email en premier s'il y a une adresse, sinon le partage du téléphone, avec la ligne « {Prénom} n'a pas d'adresse email » et son bouton « Ajouter » ; tant qu'il en reste à prévenir, l'icône et le prénom du suivant avec « Passer » ; pour un renvoi, corriger l'adresse ou passer par un autre chemin (partager, copier le message, copier le lien seul).
- **Fêter** : à partir du lendemain de la fête, la carte devient « La fête est passée : clôture l'édition ».
- **Clôturée** : la frise entièrement faite (« Fêté »), « fêté le … » sous le titre, l'encadré « Édition clôturée », les paires du tirage (README 8.7), les lignes « Exclusions appliquées au tirage » et « Journal du groupe », puis « Préparer l'édition suivante ».
- **Annuler le tirage** (`…/annuler`) : l'encadré rouge « Tout le monde devra redécouvrir » (résultats effacés et combien les avaient vus, liste de nouveau modifiable, message « Nouveau tirage » à envoyer), ce qui reste (liens, listes de souhaits), le motif, la ligne que le journal affichera, la case « Je comprends… », puis « Garder ce tirage » en vert et « Annuler le tirage » en contour rouge, actif une fois le motif écrit et la case cochée.
- **Voir un seul résultat** (`…/voir-le-tirage`) : l'encadré « À n'utiliser qu'en dernier recours », le choix de la personne dans `UiPersonPicker` (recherche au-delà de 10), la ligne que le journal affichera avec son prénom, la phrase « JE VEUX VOIR LE TIRAGE » à recopier, la case « Je comprends… », puis « Voir le résultat de {Prénom} ». Le résultat (« Hugo offre un cadeau à » et le prénom en grand) reste à l'écran jusqu'à « Cacher et revenir à l'édition » ou « Voir un autre résultat ».
- **Plus tard, ou en cas de pépin** : clôturer (possible après la fête), voir un seul résultat (dernier recours, journalisé), annuler et relancer le tirage.
- **Plus de fiche participant** (décidé par Julien le 16 novembre 2026 : elle doublait le panneau d'envoi). Avant le tirage, toucher une personne ouvre sa fiche dans le groupe (on y corrige un prénom, une adresse, une exclusion) ; après, le panneau d'envoi. Une fois un message envoyé, le bas du panneau porte le « Dépannage », replié derrière une ligne qui le déplie sur place (`AdminParticipantTroubleshoot`) : « Pas envoyé finalement ? » et « Régénérer son lien » (second appui). Retirer quelqu'un passe par « Choisir les participants ». L'adresse s'ajoute (« Ajouter ») ou se corrige (« La corriger ») sur place (`AdminEmailInline`) : une adresse refusée s'affiche en rouge sous le champ ; enregistrée, le panneau propose l'email en premier. L'ancienne adresse `…/participants/[id]` mène à l'édition, panneau ouvert sur la personne (`?envoyer=`).

---

## 12. API

Routes serveur Nitro (`server/api/**`, un fichier par méthode). Toutes les entrées validées par Zod. Les réponses ne contiennent que le strict nécessaire. Côté client, chaque route de lecture a son composable `useQuery` et chaque route d'écriture son `useMutation`, qui invalide les clés concernées.

### Participant

Le jeton du lien est le seul identifiant ; inconnu, mal formé ou régénéré, il reçoit le même 404 `link_invalid`.

| Méthode et route | Rôle |
|---|---|
| `GET /api/p/[token]` | État de la participation : prénom, icône, langue, groupe, édition, phase, date de la fête, liste de souhaits active ou non. Jamais le résultat. N'est pas compté comme une consultation |
| `POST /api/p/[token]/reveal` | Bouton « Découvrir ». Renvoie le receveur, le budget, la date, le message **et la liste de souhaits du receveur**. Compte et journalise la consultation |
| `GET /api/p/[token]/wishes` | Sa propre liste de souhaits |
| `PUT /api/p/[token]/wishes` | Corps : la liste complète. Remplace la liste, journalise. Refusé si l'édition est clôturée ou la règle inactive |
| `PUT /api/p/[token]/avatar` | Son icône (emoji et couleur), journalisé. Refusé si l'édition est clôturée |
| `PUT /api/p/[token]/language` | Sa langue préférée, journalisé |
| `GET /api/p/[token]/journal` | Journal du groupe, dans sa langue |

### Admin

Toutes ces routes exigent une session ; celles d'un groupe exigent d'en être l'organisateur ou d'être super-admin.

| Méthode et route | Rôle |
|---|---|
| `POST /api/auth/link` | Demande un lien de connexion (réponse identique dans tous les cas) |
| `POST /api/auth/confirm` | Consomme le lien, ouvre la session |
| `GET /api/auth/home` | L'accueil du compte : ses tirages (avec leur lien personnel, où ils en sont, le nombre d'idées), les groupes qu'il organise (où en est l'édition, à prévenir, pas encore ouverts, tirage possible), son rôle et ses demandes. Jamais un résultat |
| `GET /api/auth/sessions`, `POST /api/auth/sessions/revoke-all` | Mon compte : appareils, tout déconnecter |
| `POST /api/admin/logout`, `GET /api/admin/session` | Déconnexion (révoque la session), session courante |
| `GET /api/admin/groups` | Les groupes du compte |
| `POST /api/admin/groups` | Création par un super-admin ou un compte qui a de la place dans son quota (il en devient organisateur) |
| `POST /api/auth/group-requests` | Demande de groupe (une seule en attente), email aux super-admins |
| `GET /api/admin/accounts`, `PATCH /api/admin/accounts/[id]` | Super-admin : comptes et demandes en attente ; quota, désactivation |
| `POST /api/admin/group-requests/[id]/decide` | Super-admin : accepte ou refuse une demande, email au demandeur |
| `PATCH /api/admin/groups/[id]` | Super-admin : nom |
| `GET/POST /api/admin/[groupe]/organizers`, `DELETE …/organizers/[compte]` | Organisateurs du groupe |
| `POST /api/admin/groups/[id]/delete` | Super-admin : supprime le groupe et tout ce qu'il contient ; corps `confirm` = identifiant du groupe |
| `GET /api/admin/[groupe]` | Accueil du groupe : éditions, édition en cours, règles |
| `GET/POST /api/admin/[groupe]/persons`, `PATCH/DELETE …/persons/[id]` | Personnes : prénom, nom, email, langue, icône, actif. Suppression seulement si la personne n'a jamais participé |
| `POST /api/admin/[groupe]/exclusions`, `DELETE …/exclusions/[id]` | Exclusions |
| `GET/PATCH /api/admin/[groupe]/rules` | Règles du groupe |
| `GET /api/admin/[groupe]/journal` | Journal, dans la langue de l'administration |
| `GET/POST /api/admin/[groupe]/editions` | Liste, création (avec reprise de l'édition précédente, 100 participants au plus) |
| `GET/PATCH /api/admin/[groupe]/editions/[id]` | Édition avec ses participants et leurs statuts (nombre de souhaits, jamais leur contenu) ; libellé et règles propres |
| `POST …/editions/[id]/draw`, `/redraw`, `/close` | Cycle de vie : tirer, annuler le tirage (motif obligatoire), clôturer |
| `GET …/editions/[id]/check` | Le tirage est-il possible ? Sinon, pourquoi. Liste aussi les paires des éditions clôturées qui excluent |
| `POST/DELETE …/editions/[id]/history-waivers` | Lever une exclusion d'un tirage précédent pour cette édition ; tout rétablir |
| `POST …/editions/[id]/participants`, `DELETE …/participants/[participationId]` | Ajouter, retirer (avant le tirage) |
| `GET …/editions/[id]/messages?type=` | Textes prêts à partager pour chaque participant, dans sa langue, sans effet de bord |
| `POST …/editions/[id]/emails` | Envoi par email (13.3) : `type`, puis `participationIds` ou `audience` |
| `GET …/editions/[id]/results` | Qui a offert à qui, pour une édition **clôturée** uniquement |
| `POST …/editions/[id]/reveal-one` | Accès de dernier recours à un résultat (8.7) |
| `POST/DELETE /api/admin/[groupe]/participations/[id]/message` | Pose ou retire la pastille *envoyé* ; corps `type` et `via` ∈ `share`, `copy` |
| `POST /api/admin/[groupe]/participations/[id]/link` | Obtenir le lien seul, journalisé |
| `POST /api/admin/[groupe]/participations/[id]/regenerate` | Régénérer le lien |

`GET /api/health` : vérification de déploiement, publique.

---

## 13. Messages à partager

Décision v5 : l'application n'envoie rien elle-même et ne stocke aucun numéro. L'organisateur partage chaque message depuis la feuille de partage de son téléphone.

### 13.1 Mécanisme

- **Partage** : `navigator.share({ text })` ouvre la feuille de partage (WhatsApp, SMS, Mail…). Sans feuille de partage (ordinateur), le texte est copié avec `navigator.clipboard.writeText`.
- **Contrainte Safari** : le partage et la copie doivent démarrer dans le geste de l'utilisateur, avant tout `await`. Les textes de tous les participants sont donc préchargés (`GET …/messages?type=`) ; la pastille *envoyé* est posée après coup (`POST …/message`), sauf si le partage a été annulé.
- Pas de confirmation d'envoi possible : la pastille *envoyé* reflète le partage déclaré par le téléphone (non annulé), et reste annulable.

### 13.2 Modèles

- Fonctions pures `(données) → texte` dans `server/utils/messages.ts`, testées sans réseau. Données : prénom, nom du groupe, label de l'édition, lien personnel, et selon le modèle budget, date, message de l'organisateur.
- Texte **court et sans mise en forme**, le lien **seul sur sa ligne** pour que les messageries le rendent cliquable et génèrent l'aperçu, un emoji 🎁 au plus.
- **Aucun message ne contient un résultat.**
- Les messages proposés suivent l'étape (`messageTypesFor`) : `invitation` et `reminder` avant le tirage, `drawn`, `reminder` et `redraw` après. L'API refuse les autres.
- Avant le tirage, l'écran de l'organisateur reste discret : aucun suivi d'envoi ni compteur. Le suivi commence au tirage, qui remet la pastille *envoyé* à zéro : une seule tournée de messages suffit pour jouer.

| Modèle (`type`) | Moment | Contenu |
|---|---|---|
| `invitation` | Avant le tirage, facultatif | « Salut Léa ! 🎁 Tu participes au Secret Santa de [groupe] ([édition]). Ouvre ton lien et note quelques idées de cadeaux : [lien] » |
| `tirage` | Après le tirage | « Le tirage est fait ! Ouvre ton lien pour découvrir à qui tu offres un cadeau : [lien] » + budget et date s'ils sont renseignés |
| `relance` | Manuel | « Petit rappel Léa : ton lien t'attend, pense à l'ouvrir. Ton lien : [lien] » |
| `nouveau_tirage` | Après une relance du tirage | « Un nouveau tirage a eu lieu, ton ancien résultat n'est plus valable. Ton lien ne change pas : [lien] » |

### 13.3 Envoi groupé par email (v6)

Décision du 13 novembre 2026. Le partage par téléphone reste le fonctionnement par défaut ; l'email évite seulement à l'organisateur de partager chaque lien à la main.

- **Activation** : plus d'option. D'abord réservé aux groupes où le super-admin l'activait (colonne `groups.email_sending`, migration `0005`), l'envoi par email est ouvert à **tous les groupes** depuis le 14 novembre 2026 ; la colonne est supprimée par la migration `0010`. Raison : l'adresse d'un participant sert aussi à sa connexion, elle doit donc pouvoir être saisie partout.
- **Adresses** : `persons.email`, facultative, saisie par l'organisateur dans tous les groupes. Elle sert à l'envoi par email et permet à la personne de se connecter pour retrouver ses tirages (8.4).
- **Envoi** : `POST /api/admin/[groupe]/editions/[id]/emails`, corps `type` (un message de l'étape en cours) et `audience` (`unsent` par défaut, ou `all`). Écrit aux participants qui ont une adresse, pose la pastille *envoyé* et journalise `message_sent` avec `via: email`. 50 emails au plus par appel, le reste au suivant.
- **Fournisseur** : Resend (offre gratuite), domaine `under-the-tree.party` vérifié, un seul appel HTTPS par envoi groupé (`/emails/batch`), ce qui reste loin de la limite de 50 sous-requêtes du plan gratuit. Secret `NUXT_RESEND_API_KEY` ; sans clé, la route répond `email_not_configured` et rien d'autre ne change.
- **Contenu** : `buildEmail` dans `server/utils/messages.ts`, même texte que le message à partager, plus un objet et un jumeau HTML sobre. Jamais de résultat.
- **Délivrabilité, mesurée le 13 novembre 2026 sur Gmail** : SPF, DKIM et DMARC passent. Sans DMARC le premier essai est arrivé en spam ; avec, les mails arrivent dans l'onglet **Promotions**, mis en forme ou non. Le domaine venait d'être créé ; à remesurer plus tard. Seul Gmail a été testé. L'écran de l'organisateur prévient que les emails arrivent souvent en spam (formulation demandée par Julien). Conséquence : l'email est un complément, l'organisateur relance par téléphone ceux qui n'ouvrent pas leur lien.
- **Envoi individuel** : le bouton rond d'un participant ouvre le panneau d'envoi (section 11) : message, langue (enregistrée comme langue préférée de la personne), puis l'email s'il a une adresse, le partage du téléphone ou la copie.
- **Envoi à plusieurs** : un écran à part (`…/editions/[id]/emails`) : le message en onglets, la liste où ceux qui ont une adresse et restent à prévenir sont cochés d'avance (`preselectedForEmail`) et où toute la ligne coche, l'état de chacun avec son icône (l'adresse pour ceux qui restent à prévenir), un lien « Ajouter » pour ceux sans adresse, l'aperçu pour le premier coché, un mot à ajouter, puis « Envoyer N emails ». L'API prend `participationIds` ; `audience` reste accepté. Après l'envoi, le message dit combien d'emails sont partis et qui est prévenu (trois prénoms au plus, puis « et N autres »).
- Les tests de bout en bout tournent sans clé (`scripts/e2e-server.sh` ignore le `.env` du poste) : aucun test n'envoie de vrai email.

---

## 14. Arborescence

```
secret-santa/
├── README.md                    ← ce document
├── nuxt.config.ts               ← modules, secrets attendus, en-têtes de sécurité
├── wrangler.toml                ← Worker, binding D1, domaine personnalisé
├── drizzle.config.ts
├── eslint.config.ts · vitest.config.ts · playwright.config.ts
├── .env.example
├── .github/workflows/ci.yml
├── app/
│   ├── app.vue · app.config.ts  ← thème Nuxt UI, langue de l'interface
│   ├── pages/
│   │   ├── index.vue            ← page d'accueil neutre
│   │   ├── p/[token]/           ← participant : index, souhaits, journal
│   │   └── admin/               ← connexion, groupes, puis [slug]/ : accueil, personnes,
│   │                              exclusions, réglages, organisateur, journal, éditions/[id]/…
│   ├── components/
│   │   ├── ui/                  ← design system : PageTitle, SectionTitle, Card, List, ListItem, Avatar, TextPreview
│   │   ├── admin/               ← Screen, StatusCard, SendOptions, Exclusions, PersonForm, DateField…
│   │   ├── participant/         ← Screen, RevealCard, WishList
│   │   └── JournalList · JournalView · LanguageSwitch
│   ├── composables/
│   │   ├── useT.ts · useErrorMessage.ts · useShareMessage.ts
│   │   └── queries/             ← useQuery/useMutation par domaine + keys.ts
│   ├── middleware/admin.ts
│   └── utils/                   ← formatage, statut d'un participant
├── server/
│   ├── api/p/[token]/           ← état, reveal, wishes, avatar, language, journal
│   ├── api/admin/               ← login, groups, [slug]/…
│   ├── http/                    ← gardes (session, groupe, édition, lien), validation, email
│   ├── database/                ← schéma, migrations, requêtes (hors noyau pur)
│   └── utils/                   ← noyau pur, chaque fichier a son .test.ts à côté :
│                                  draw, rules, crypto, audit, messages, wishes,
│                                  editions, people, personal, avatars, auth, result
├── shared/i18n/                 ← dictionnaires fr/en/de typés, translate()
├── scripts/                     ← seed-demo.ts, e2e-server.sh
└── tests/e2e/                   ← admin-edition, email, language, participant, security
```

---

## 15. Variables d'environnement

| Variable | Rôle |
|---|---|
| `SUPER_ADMIN_EMAILS` | Adresses qui deviennent super-admins à leur première demande de lien (séparées par des virgules) |
| `DEV_LOGIN_LINKS` | `true` en développement seulement : le lien de connexion est affiché à l'écran |
| `LINK_REQUESTS_PER_IP` | Limite horaire de demandes de lien par adresse IP (20 par défaut ; relevée pour les tests) |
| `NUXT_SESSION_PASSWORD` | Clé de scellement des cookies de session (32 caractères minimum) |
| `DATA_KEY` | Clé AES-256 (base64) pour chiffrer receveurs et jetons |
| `PUBLIC_BASE_URL` | URL publique, pour construire les liens |
| `RESEND_API_KEY` | Clé d'API Resend pour l'envoi groupé par email (facultative, une clé limitée à l'envoi suffit) |
| `EMAIL_FROM` | Expéditeur des emails, sur un domaine vérifié chez Resend |

**Attention :** perdre `DATA_KEY` rend illisibles tous les résultats et tous les liens. La conserver dans un gestionnaire de mots de passe.

---

## 16. Déploiement

1. Créer un dépôt GitHub privé et y pousser le code.
2. Créer un compte Cloudflare gratuit.
3. Créer la base D1 (`wrangler d1 create secret-santa`) et reporter son identifiant dans `wrangler.toml`. *(Fait : `1128fa3f-…`.)* Le sous-domaine `workers.dev` du compte se choisit dans le tableau de bord (Workers & Pages → Account details) s'il n'existe pas encore.
4. Appliquer les migrations sur la base distante.
5. Déployer à la main avec `pnpm deploy:prod` (build puis `wrangler deploy`, après `wrangler login`). **Un `git push` ne déploie pas** : Workers Builds n'est pas branché sur le dépôt (constaté le 13 novembre 2026, aucun commit ne porte de déploiement Cloudflare).
6. Renseigner les variables secrètes dans le tableau de bord Cloudflare.
7. L'application est servie sur `https://under-the-tree.party` (domaine personnalisé du Worker, déclaré dans `wrangler.toml`) et reste joignable sur `https://secret-santa.julienr114.workers.dev`.
8. Se connecter en super-admin, créer les deux groupes, définir les mots de passe des organisateurs.

Développement local : base D1 locale émulée par Miniflare (`nitro dev`), état dans `.wrangler/state/v3`.

---

## 17. Plan de réalisation par étapes

Chaque étape est livrable et testable seule. État : étapes 0 à 6 terminées, 7 en partie, 8 commencée.

**Étape 0 — Vérifications** ✅
Points techniques levés, conclusions en 7.2 : Workers (`cloudflare_module`), pas de NuxtHub, PBKDF2 configurable.

**Étape 1 — Socle** ✅
Nuxt 4, ESLint + Prettier + hooks Git, Vitest, CI GitHub Actions, Tailwind 4, plugin TanStack Query, Drizzle + schéma + migration `0000_init`, base D1 `secret-santa`, Worker déployé.

Enseignements : l'horloge est gelée pendant une requête Worker (`performance.now()` rend 0), le temps CPU se lit dans `wrangler tail --format json` (champ `cpuTime`) ; ESLint 10 cherche la config depuis chaque fichier, d'où `--config eslint.config.ts` dans les scripts ; `server/utils` est réservé aux fonctions pures, l'infrastructure vit dans `server/database` et `server/http`.

**Étape 2 — Cœur métier, sans interface** ✅
Modules purs de `server/utils/`, chacun avec son fichier de test. Points à connaître :
- **Clés anglaises dans le code**, textes dans les dictionnaires. Règles : `excludePreviousYears`, `budget`, `eventDate`, `guardianMessage`, `wishlist`, `maxWishes` (`rules.ts`, schéma Zod = source de vérité, `mergeRules(groupRules, override)`). Types de message : `invitation`, `drawn`, `reminder`, `redraw` (`messages.ts`).
- `draw(input, { random })` : l'appelant fournit `history` (receveurs passés par donneur, déjà filtré sur N éditions et sur la participation du donneur) et `random` (`secureRandomInt` en production). `checkFeasibility` renvoie `blocked` et `constrained` pour la carte de statut.
- `audit.ts` purge de `meta` toute clé évoquant un résultat ou un secret (`receiver`, `assignment`, `token`…), à n'importe quelle profondeur.
- Le hachage mêle le poivre au secret (`${pepper}\0${secret}`), 20 000 itérations par défaut, plafonné à 100 000.

**Étape 3 — Administration** ✅
Connexion super-admin et organisateur, gestion des groupes, des personnes, des exclusions, des règles. Création d'édition avec reprise de l'année précédente.

**Étape 4 — Pilotage d'une édition** ✅
Écran de pilotage (action du moment, vérification nommant les personnes en cause, tirage avec confirmation, clôture), bouton « Partager » sur chaque participant (v5), fiche participant (partager, copier, lien, annuler « envoyé », dernière consultation, régénérer le lien, retirer), ajout de participants, annulation du tirage avec motif et double confirmation. Interface : écrans empilés avec retour et fil d'Ariane, listes mobiles, pas de modale. Tests de bout en bout Playwright (`pnpm test:e2e`, build Cloudflare + D1 jetable, format iPhone) en CI.

**Étape 5 — Parcours participant** ✅
Page personnelle `/p/[token]` dans tous ses états (attente, bouton « Découvrir », résultat, clôturée, lien invalide), révélation comptée et journalisée (`POST /api/p/[token]/reveal`, compteur incrémenté en base de façon atomique), journal du groupe `/p/[token]/journal` filtrable par édition. Points à connaître :
- Garde unique `requirePersonalLink` (`server/http/personal.ts`) : jeton inconnu, mal formé ou régénéré, même réponse 404 `link_invalid`.
- Règles pures dans `server/utils/personal.ts` (`personalPhase`, `canReveal`, `canEditWishes`). Une édition clôturée laisse consulter son résultat (toujours compté et journalisé).
- Le résultat ne vit que dans l'état de la page (mutation TanStack Query, jamais mise en cache) : il disparaît au rechargement.
- En-têtes `Referrer-Policy`, `Cache-Control: no-store` et `X-Robots-Tag` posés par `routeRules` sur `/p/**` et `/api/p/**`.
- Le journal renvoyé au participant ne contient que des phrases (`journalEntries`), jamais le `meta` brut. Le composant `JournalList` et `loadJournal` sont prêts à resservir côté organisateur.
- Depuis le 15 novembre 2026, l'état renvoie aussi la date de la fête (rien de secret : les messages la donnent à tous), pour le compte à rebours de la frise.
- La page se met à jour seule : l'état est redemandé toutes les 10 s tant que l'onglet est visible (pas de SSE ni de WebSocket ; le vrai push par Durable Object a été étudié puis écarté le 13 novembre 2026, trop de mécanique pour un événement annuel).
- Le participant change son icône depuis sa page (`PUT /api/p/[token]/avatar`, panneau du bas avec « Valider ») jusqu'à la clôture. La personne modifiée vient du lien, jamais de la requête ; le changement est journalisé.
- Journal affiché en frise (`JournalList`) : fil rouge, emoji par type d'événement, étapes clés en cartes, regroupement par jour.
- Tests de bout en bout dans `tests/e2e/participant.spec.ts`.

**Étape 5 bis — Liste de souhaits** ✅
Routes `GET/PUT /api/p/[token]/wishes`, écran `/p/[token]/souhaits`, liste du receveur sur l'écran de résultat, événement `wishes_updated`. La pastille *souhaits* côté organisateur existait depuis l'étape 4. Modifiable en préparation et une fois tirée, refusée en clôturée ou si la règle `wishlist` est inactive. Une insertion par souhait dans la transaction : D1 limite une requête à 100 paramètres. Écran en liste, ajout et modification dans un panneau du bas, avec un bouton **« Valider »** par idée (pas d'enregistrement global) : fermer le panneau autrement abandonne la saisie. Chaque validation écrit une ligne au journal.

**Étape 6 — Partage des liens** ✅ *fait avec l'étape 4*
Quatre modèles de texte, textes préchargés, bouton « Partager » (feuille de partage du téléphone) et copie en repli, pastille *envoyé* annulable, journalisation.

**Étape 7 — Finitions** (en partie)
- ✅ Animation de révélation, états vides, messages d'erreur.
- ✅ Revue de la liste de contrôle sécurité (8.6), le 14 novembre 2026.
- ✅ Test sur un vrai téléphone en production, fait par Julien.
- À faire : accessibilité (contrastes, navigation clavier, lecteurs d'écran).

**Étape 8 — Mise en service** (commencée)
- ✅ Groupe réel « Famille Delacoux » créé en production (9 personnes, envoi par email activé).
- À faire : y désigner un organisateur si ce n'est pas Julien, exclusions, première édition ; seconde famille.

Restes connus : remesurer la délivrabilité des emails (13.3), faire relire l'anglais et l'allemand par un locuteur, test automatique du parcours « deuxième année ».

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
- Un organisateur du groupe A reçoit un refus sur toutes les routes du groupe B.
- Chiffrement puis déchiffrement redonnent la valeur d'origine, et une clé différente échoue.

### Messages

- Chaque modèle contient le lien et le prénom, jamais de receveur ni de contenu de souhait, quelles que soient les données passées (test qui injecte un receveur dans les données et vérifie qu'il n'apparaît pas).
- Le lien est seul sur sa ligne.

### Liste de souhaits

- La normalisation (`wishes.ts`) rejette : plus de `souhaits_max` idées, un libellé vide ou de plus de 200 caractères, une URL qui n'est pas `http`/`https`, et renvoie des positions contiguës à partir de 0.
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

- [ ] Julien peut créer ses deux familles et nommer un organisateur pour chacune.
- [ ] Un organisateur peut mener une édition entière depuis son téléphone.
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
| Qui est l'organisateur de la deuxième famille ? | Julien, tant qu'il n'a nommé personne |
| Le journal affiche-t-il les noms de famille ? | Prénom seul, nom ajouté uniquement en cas d'homonymes |
| Les écrans de l'organisateur affichent-ils le nom de famille ? | Oui, dès qu'il est renseigné, après le prénom ; recherche et tri le prennent en compte (décidé le 16 novembre 2026). Côté participant, la règle ci-dessus ne change pas |
| Rappel automatique aux retardataires ? | Non, relance manuelle par l'organisateur |
| Après clôture, afficher à tous le tableau complet « qui a offert à qui » ? | Non, sauf demande explicite |
| Reprendre la liste de souhaits de l'an dernier à la création d'une édition ? | Non en V1 : liste vide à chaque édition. Un bouton « Reprendre ma liste de l'an dernier » est une évolution simple si la famille le demande |
| L'organisateur peut-il voir le contenu des listes de souhaits ? | Non, seulement le nombre d'idées (voir 6 bis.2) |

---

## 21. Langues (v7)

Français, anglais, allemand. Le français reste la langue de référence et la langue par défaut.

### 21.1 Qui voit quelle langue

| Où | Langue |
|---|---|
| Page personnelle, liste de souhaits, journal du participant | Langue préférée de la personne (`persons.language`, migration `0006`, `fr` par défaut) |
| Messages à partager et emails | Langue préférée du **destinataire**, pas celle de l'organisateur |
| Administration | Choix du visiteur, gardé dans un cookie `locale` sur l'appareil ; à défaut, langue du navigateur ; à défaut, français |
| Lien invalide | Cookie ou langue du navigateur (on ne sait pas qui c'est) |

L'organisateur règle la langue d'une personne sur sa fiche. Le participant la change lui-même depuis sa page (`PUT /api/p/[token]/language`) : c'est enregistré comme sa préférence, donc ses prochains messages suivent.

### 21.3 Autres décisions du 13 novembre 2026 (soir)

- **Date de la fête** : saisie avec un sélecteur de date (Nuxt UI `UInputDate` + `UCalendar`, le 25 décembre de l'année proposé en un geste), stockée en jour ISO dans `eventDate`. Elle est écrite dans la langue de chacun (messages, emails, page de résultat). Une ancienne valeur en texte libre reste affichée telle quelle. Le bouton **« Clôturer » n'apparaît qu'à partir du lendemain** de cette date ; sans vraie date, il reste disponible.
- **Exclusions après le tirage** : l'écran d'une édition tirée ou clôturée affiche les exclusions **appliquées au tirage** (`rules_snapshot`), plus celles du groupe, qui ont pu changer depuis.
- **Suppression d'un groupe** : super-admin uniquement, `POST /api/admin/groups/[id]/delete` avec l'identifiant du groupe à recopier. Efface le groupe, ses personnes, exclusions, éditions, tirages, listes de souhaits et journal, en une transaction. Irréversible.
- **Barre du haut de l'administration** : logo toujours visible, un seul menu (langue, déconnexion), chemin réduit aux niveaux parents.
- **Avatars** : emoji de marché de Noël ajoutés (bretzel, vin chaud, marrons…), puis six emoji retirés le 14 novembre 2026 ; il en reste 30. Une icône enregistrée avec un emoji retiré est remplacée par une icône par défaut, la couleur étant gardée.

### 21.2 Comment c'est fait

- **Dictionnaires typés** dans `shared/i18n/locales/<langue>/<domaine>.ts`, partagés par le serveur et les écrans. Le français est la référence ; les autres langues se terminent par `satisfies Dict<typeof fr>`, donc une clé manquante ou en trop ne compile pas.
- **Pas de bibliothèque d'i18n.** `translate(locale, clé, params)` (`shared/i18n/index.ts`) tient en quelques dizaines de lignes : substitutions `{nom}`, pluriels `{ one, other }` choisis par `Intl.PluralRules`, repli sur le français puis sur la clé. Raison : le serveur a besoin des mêmes textes que les écrans (messages, emails, journal), et les clés sont vérifiées à la compilation des deux côtés. C'est un écart assumé au « standard de l'industrie » de la section 7.1.
- **Écrans** : `const { t, tk, locale, setLocale } = useT()` (`t` pour une clé connue à la compilation, `tk` pour une clé construite à l'exécution), `useErrorMessage()` pour les erreurs d'API.
- **Journal** : les événements stockés ne contiennent aucun texte ; la phrase est composée à l'affichage dans la langue du lecteur (`describeEvent`, ordinaux par `Intl.PluralRules`).
- **Tests** : `shared/i18n/index.test.ts` vérifie que les trois langues ont les mêmes clés et les mêmes `{substitutions}` ; `tests/e2e/language.spec.ts` couvre le parcours.
- **Vocabulaire** : organisateur → *organizer* / *Organisator* ; tirage → *draw* / *Auslosung* ; édition → *edition* / *Ausgabe* ; Secret Santa → *Secret Santa* / *Wichteln* ; tutoiement en allemand.
- La phrase de confirmation « JE VEUX VOIR LE TIRAGE » (8.7) reste en français dans toutes les langues : c'est le serveur qui la compare.


---

## 22. Feuille de route (idées du 14 novembre 2026)

Onze idées apportées par Julien le 14 novembre 2026, triées en trois lots. Rien de cette section n'est codé. Les points marqués **à trancher** attendent une réponse de Julien (22.5) ; tant qu'ils ne sont pas tranchés, ne pas les coder.

### 22.1 Lot « tout de suite » — fait le 14 novembre 2026

| Idée | Ce qui a été fait |
|---|---|
| **« Organisateur » au lieu de « gardien »** | Dans tous les textes français (interface, messages, emails, journal). L'anglais et l'allemand disaient déjà *organizer* / *Organisator*. Le code garde `guardian` (rôle de session, colonnes, routes, adresse `/admin/[groupe]/gardien`) |
| **Fuite par le journal** | Le journal public n'inscrit plus que la **première** consultation de chacun (« Léa a découvert son résultat »). Les suivantes restent comptées pour l'organisateur. La page du participant ne parle plus du journal ; une fois le résultat déjà vu, le bouton devient « Revoir à qui j'offre un cadeau » et la page indique combien d'idées contient la liste du receveur, sans le nommer. Un écran séparé pour relire les idées sans trace a été essayé puis retiré le jour même : trop compliqué |
| **Messages personnalisables** | Forme retenue : **un mot ajouté**. Règle `messageNote` (500 caractères, réglages du groupe), reprise et modifiable dans les panneaux d'envoi individuel et à plusieurs. Le mot part tel quel, quelle que soit la langue du message, séparé du texte standard par une ligne vide : en dessous (après le lien, par défaut) ou au-dessus, selon `messageNotePosition`, modifiable aussi à l'envoi (`addNote`). Il figure dans l'aperçu |
| **Colonne étroite sur grand écran** | Le contenu et les panneaux du bas restent dans une colonne de la largeur d'un téléphone (`max-w-md`) ; les barres du haut prennent toute la largeur |
| **Icône d'onglet** | `public/favicon.svg` (sapin sous son étoile), avec ses variantes PNG pour les navigateurs sans SVG et l'écran d'accueil des téléphones |

### 22.2 V2 — ouverture à d'autres organisateurs

Décision du 14 novembre 2026 : l'application s'ouvre au public par **inscription libre, avec un garde-fou** : un compte ne peut créer aucun groupe par défaut.

**Étape préalable : un design system léger** ✅ *fait le 14 novembre 2026, voir la section 23.*

**Socle : comptes et quotas**

- **Compte utilisateur** pour les organisateurs, qui remplace le mot de passe partagé par groupe. Un compte peut organiser plusieurs groupes ; un groupe peut avoir plusieurs organisateurs (à confirmer).
- **Quota de groupes par compte, 0 par défaut.** Pour en créer un, l'utilisateur fait une **demande depuis l'application** ; le super-admin l'accepte en relevant le quota du compte, ou la refuse.
- **Interface d'administration** pour le super-admin : comptes, quota de chacun, demandes en attente, groupes de chaque compte, suspension d'un compte.
- **Notifications par email au super-admin** : nouvelle demande de groupe (et, à confirmer, nouveau compte). Il faut donc une **adresse email du super-admin** (variable d'environnement ou réglage).
- ~~Double authentification pour le super-admin (TOTP)~~ : abandonnée le 14 novembre 2026, voir 22.5.
- **Incitation à créer un groupe** : un compte sans groupe voit pourquoi il n'en a pas et comment en demander un.

Ce socle remet en cause des décisions actuelles, dont la section 8.4, réécrite le 14 novembre 2026 (plus de mot de passe par groupe ni de super-admin par variable d'environnement), la contrainte « presque gratuit » (quotas Cloudflare et Resend à surveiller dès qu'il y a des inconnus), et il ajoute des obligations nouvelles : mentions légales, RGPD (adresses de tiers saisies par un organisateur), protection contre l'abus à l'inscription.

**Fonctions qui s'appuient sur le socle**

| Idée | Contenu | Dépend de |
|---|---|---|
| **Notifications par email à l'organisateur**, réglables | Par exemple : tout le monde a consulté, une liste de souhaits a changé, quelqu'un s'est inscrit. Chaque notification s'active ou non | Comptes (adresse de l'organisateur) ; délivrabilité des emails (13.3) |
| **Inscription par lien d'invitation** | L'organisateur partage un lien ; les participants s'inscrivent eux-mêmes. Date de fin, nombre de places, informations affichées sur la page d'inscription. Email obligatoire dans ce mode | Comptes ; délivrabilité. Change la création des personnes, aujourd'hui saisies par l'organisateur |
| **Page d'accueil indexable** | Présente l'application et mène à l'inscription. Aujourd'hui tout le site est en `noindex` | Ouverture au public |

**Ordre de réalisation** : design system léger ✅ → comptes et connexion ✅ → interface d'administration et quotas ✅ → demandes de groupe et emails au super-admin ✅ → inscription par lien ✅ → notifications à l'organisateur ✅ → page d'accueil indexable → en dernier, avant de faire connaître le site : mentions légales, RGPD (page de confidentialité, suppression de compte, durée de conservation) et protection contre l'abus à l'inscription (Cloudflare Turnstile). Décision du 15 novembre 2026 : personne ne connaît encore le site, ces obligations passent en dernier. Le tirage à la main passe en v3.

### 22.3 V3

| Idée | Contenu | Remarques |
|---|---|---|
| **Mode prédictions** | Jeu facultatif, activé par l'organisateur : chacun parie sur qui a tiré qui ; résultats après la date de fin ; message de récompense personnalisé | Demande une vraie date de fin (déjà en place, section 21.3). Les prédictions ne doivent rien révéler avant la clôture |
| **Listes de cadeaux pour la famille** | Un second volet, hors tirage : listes partagées avec des membres choisis, réservation des cadeaux | Presque une deuxième application. La réservation était hors périmètre (section 2) : la décision est rouverte |
| **Tirage déjà fait à la main** | Mode d'édition sans tirage par l'application : chaque participant déclare à qui il offre. Il sert alors de support (listes de souhaits, rappels, historique pour l'an prochain) | Reporté en v3 le 14 novembre 2026. Conception validée en 22.6, prête à reprendre |
| **API REST, serveur MCP, documentation** | Tout piloter depuis un LLM | Demande des jetons d'accès par compte, donc le socle de la v2, et une API stable et documentée |

### 22.3 bis Idées à reprendre plus tard : actions automatiques

Notées le 15 novembre 2026, sans décision. Elles reposent sur la tâche planifiée du matin déjà en place (cron Cloudflare, `server/plugins/reminders.ts`), gratuite jusqu'à 5 crons par compte.

| Idée | Contenu | Points à trancher |
|---|---|---|
| **Clôture automatique** | L'édition se clôture seule quelques jours après la date d'échange | Combien de jours ; prévenir l'organisateur avant |
| **Tirage automatique** | L'organisateur choisit une date ; le tirage se fait seul ce jour-là | Que faire si le tirage est impossible (exclusions) : prévenir l'organisateur |
| **Relance des participants** | Un email au participant qui n'a pas ouvert son lien, et plus seulement à l'organisateur | Seulement pour ceux qui ont une adresse ; une seule relance ; activable dans les réglages |

### 22.4 Décisions du 14 novembre 2026 sur la v2

Réponses de Julien aux questions posées ; elles complètent 22.2.

| Sujet | Décision |
|---|---|
| **Connexion** | Par **lien magique** reçu par email, pas de mot de passe. Les liens doivent être bien sécurisés et invalidables (conception en 22.5) |
| **Super-admin** | Un compte comme les autres, avec un indicateur (`is_super_admin`). Il peut y en avoir plusieurs. Par défaut `julienr114@gmail.com`, créé par une migration. Doit être particulièrement protégé |
| **Emails au super-admin** | Envoyés aux adresses des comptes super-admin |
| **Inscription par lien d'invitation** | L'organisateur ne valide pas chaque inscription : elle est acceptée d'office dans la limite des places et de la date. Il peut retirer quelqu'un après coup |
| **Participants sans compte** | Un organisateur doit toujours pouvoir ajouter des participants qui n'ont pas de compte ; ils gardent leur lien personnel, comme aujourd'hui. La **page de résultat les incite à créer un compte** |
| **Tirage fait à la main** | L'organisateur est informé d'une incohérence et contacte les personnes ; tant qu'elle existe, le tirage reste **bloqué**. Les déclarations ne doivent pas servir à deviner qui offre à qui (proposition en 22.6) |

### 22.5 Conception proposée : comptes et lien magique

À valider par Julien avant de coder.

**Modèle**

- `accounts` : `id`, `email` (unique, en minuscules), `is_super_admin`, `group_quota` (0 par défaut), `language`, `created_at`, `last_login_at`, `disabled_at`.
- `group_members` : un compte organise un groupe (plusieurs organisateurs possibles par groupe).
- `persons.account_id` (facultatif) : relie une personne d'un groupe à un compte, quand le participant en crée un.
- `login_links` : `token_hash`, `account_id`, `created_at`, `expires_at`, `used_at`, `ip_hash`.
- `sessions` : `id`, `account_id`, `created_at`, `last_seen_at`, `expires_at`, `revoked_at`. Le cookie scellé ne porte que l'identifiant de session, ce qui permet de **révoquer** une session côté serveur.
- `group_requests` : demande de création de groupe (compte, message, état, date de décision).

**Lien magique : règles de sécurité**

- Jeton de 256 bits, stocké seulement sous forme d'empreinte SHA-256, comme les liens personnels.
- **Usage unique** : consommé à la première utilisation. **Durée de vie de 15 minutes.**
- **Demander un nouveau lien invalide les précédents** du même compte encore inutilisés.
- Le lien ouvre une page avec un bouton « Se connecter » ; c'est ce geste (un `POST`) qui consomme le jeton. Les robots d'aperçu et les antivirus de messagerie qui ouvrent les liens ne le brûlent donc pas, comme pour « Découvrir ».
- La réponse à une demande de lien est la même que l'adresse ait un compte ou non : pas d'énumération des comptes.
- Limitation des demandes par adresse et par adresse IP (`CF-Connecting-IP`).
- Pages de connexion en `no-store`, `no-referrer`, `noindex`.
- Session de 30 jours, révocable ; écran « mes appareils » avec « déconnecter partout ». Désactiver un compte révoque ses sessions.
- **Super-admin** : pas de second facteur dans l'application (décision du 14 novembre 2026). Avec le lien magique, le compte vaut ce que vaut la boîte mail : c'est elle qu'il faut protéger, par la double authentification du fournisseur (Gmail). Un TOTP en plus ne protégerait que du cas où la boîte mail tombe, au prix d'un appareil à garder et d'une procédure de secours sans accès de secours possible (tout passe par le lien magique). Un super-admin ne peut pas retirer le dernier super-admin.

**Risque connu** : la connexion dépend alors d'un email qui arrive. Au 14 novembre 2026 nos emails tombent en spam ou en Promotions sur Gmail (13.3). L'ancienne connexion par mot de passe est retirée : il faut donc vérifier, juste après la mise en production, que l'email de connexion arrive (le chercher dans les indésirables), et continuer d'améliorer la délivrabilité.

**Transition depuis l'existant (faite)**

- La migration `0007` crée le compte `julienr114@gmail.com` en super-admin. Il n'est rattaché à aucun groupe : un super-admin les gère tous. Les groupes existants n'ont donc aucun organisateur tant qu'on n'en désigne pas.
- Les migrations `0008` et `0009` suppriment le mot de passe par groupe et la table des essais de connexion, et créent `group_members`. `SUPER_ADMIN_PASSWORD` et `NUXT_PIN_PEPPER` ne sont plus lus : les secrets correspondants peuvent être supprimés chez Cloudflare.
- **Ordre de mise en production** : appliquer les migrations `0007` à `0013` (`pnpm db:migrate`) **avant** `pnpm deploy:prod`.

**Avancement**

1. ✅ Comptes, liens magiques et sessions (14 novembre 2026).
2. ✅ Organisateurs par compte (`group_members`), **retrait de tous les mots de passe** (groupe et super-admin) : fait d'un bloc avec le pas 1, à la demande de Julien. Migrations `0007` à `0009`.
2 bis. ✅ Connexion ouverte aux participants dont l'organisateur a saisi l'adresse, rôle « membre », page d'accueil commune avec « Mes tirages » (première ébauche, 14 novembre 2026).
3. ✅ Inscription libre, quota de groupes à 0, demande de groupe, pages d'administration des comptes et de tous les groupes, emails aux super-admins et au demandeur (14 novembre 2026, migration `0011`). Décrit en 8.4.
4. Abandonné : TOTP pour les super-admins (la double authentification de la boîte mail en tient lieu).
5. ✅ Comptes de participants : incitation sur la page d'un tirage et rattachement ; inscription au groupe par lien d'invitation (14 novembre 2026, migration `0013`).

**Si un super-admin ne reçoit plus ses emails** : il n'y a pas d'accès de secours dans l'application. Le recours est côté Cloudflare, réservé au titulaire du compte : activer temporairement `NUXT_DEV_LOGIN_LINKS`, ou lire les journaux d'envoi de Resend.

### 22.6 Conception proposée : tirage fait à la main (reporté en v3)

> **Remplacée le 16 novembre 2026 par la section 22.12.** Ce qui suit est gardé pour mémoire.

- L'organisateur choisit le mode « tirage déjà fait » à la création de l'édition. Pas de tirage par l'application.
- Chaque participant **déclare** sur sa page à qui il offre, parmi les participants, et peut corriger tant que l'édition n'est pas validée.
- **Le participant ne reçoit aucun retour sur une incohérence.** Sinon, déclarer une personne après l'autre et lire « déjà pris » permettrait de deviner qui offre à qui.
- L'organisateur voit qui a déclaré et qui manque. Une fois toutes les déclarations faites, soit elles forment un tirage valide (chacun offre une fois et reçoit une fois), soit l'écran indique une **incohérence et les personnes à contacter** : les donneurs dont les déclarations se contredisent, sans dire qui ils ont déclaré.
- Tant qu'il y a une incohérence ou une déclaration manquante, l'édition reste **bloquée** avant l'étape « tirée ».
- À la validation, les déclarations sont enregistrées comme un tirage normal (receveur chiffré) : page de résultat, listes de souhaits, historique pour l'an prochain fonctionnent à l'identique.
- Les exclusions ne sont pas imposées (le tirage a eu lieu ailleurs) ; elles peuvent être signalées à l'organisateur à titre d'information.

### 22.7 Réponses de Julien du 14 novembre 2026 (conception validée)

- **Tout passe par le lien magique** : pas de `SUPER_ADMIN_PASSWORD` de secours. Il a été retiré en même temps que le mot de passe par groupe (un seul moyen de connexion, demande du 14 novembre).
- **Installation à zéro et développement local** doivent fonctionner sans boîte mail :
  - `NUXT_SUPER_ADMIN_EMAILS` (liste séparée par des virgules) : une adresse de cette liste obtient un compte super-admin à sa première demande de lien. C'est l'amorçage d'une installation neuve. La migration crée en plus `julienr114@gmail.com`.
  - `NUXT_DEV_LOGIN_LINKS=true` : le lien de connexion est renvoyé à l'écran au lieu d'être seulement envoyé par email. **Jamais en production.** Utilisé en local et par les tests de bout en bout.
- **Emails aux super-admins** : à chaque demande de groupe.
- **Tirage à la main** : la conception 22.6 est validée, y compris l'affichage à l'organisateur des noms des donneurs en conflit.
- **Session** : 30 jours.

### 22.8 Fait : supprimer l'étape « Invitations » (décision du 15 novembre 2026)

Décidé avec Julien pour simplifier le pilotage d'une édition. **Codé le 15 novembre 2026** (statut `preparing`, migration `0015`, écran refait : sections 4.1, 11, 13). Maquettes : https://claude.ai/artifact/6XYdmH9di9ctyAZxzLD9Ns (rangée « Gestion d'un tirage par l'organisateur »).

**Pourquoi** : l'étape obligatoire ne sert qu'à débloquer les envois (« Ouvrir les invitations ») et impose deux tournées de messages par personne, alors qu'une seule suffit pour jouer. Brouillon et invitations permettent presque les mêmes choses.

**Cycle de vie visé** (remplace celui de 4.1) :

```
préparer ──► tirée ──► clôturée
    ▲           │
    └── annulation du tirage (journalisée)
```

- [x] **Fusionner `draft` et `invitations`** en une seule étape « Préparer ». Piste la plus simple : supprimer `draft`, l'édition est créée directement ouverte (liens valables, messages `invitation` et `reminder` disponibles, lien d'invitation au groupe inchangé). À vérifier avant de coder : tout ce qui dépend de `draft` (`server/utils/editions.ts` transition `open`, `server/utils/personal.ts` `links_not_open`, `server/database/home.ts`, `server/api/admin/[slug]/editions/index.post.ts`, schéma et migration des éditions existantes, tests de `editions`, `personal`, `messages`).
- [x] **Écran d'édition à préparer** : frise en trois étapes (Préparer, Tirer, Fêter) ; action principale « Lancer le tirage » avec la vérification des règles ; plus de bouton « Ouvrir les invitations ».
- [x] **Invitation facultative** : une ligne secondaire « Prévenir avant le tirage » (récolter les souhaits, confirmer les présences). Pas de compteur ni de suivi d'envoi avant le tirage (13.2 inchangé).
- [x] **Confirmation du tirage dans un panneau du bas** (au lieu de la confirmation en ligne), avec le récapitulatif : participants, règles, personnes du groupe absentes de l'édition.
- [x] **Après le tirage, une seule tournée** : « Prévenir par email » est l'action principale ; le partage à la main reste sur chaque ligne. Liste groupée : à prévenir, pas encore ouvert, ont découvert.
- [x] **Mettre à jour** les sections 4.1, 4.2, 11, 13.2 et l'étape 5 bis (souhaits « modifiable en `invitations` et `tirée` »), les dictionnaires (`adminEdition.cockpit.draftIntro`, `openInvitations`, libellés de statut), le guide de style et les tests de bout en bout.

### 22.9 Idée : « Dévoiler les résultats » à l'étape Fêter (15 novembre 2026)

Idée de Julien, cadrée le 15 novembre 2026. **Rien n'est codé**, et ce n'est pas encore planifié. Maquettes : même canevas qu'en 22.8 (écrans « Étape 2 · Dévoiler avant la fête », « Étape 3 · Fêter, à dévoiler », « Confirmation du dévoilement », « Résultats dévoilés »).

**Principe** : à l'étape « Fêter », l'action principale de l'organisateur devient « Dévoiler les résultats » (qui a offert à qui) ; « Clôturer sans dévoiler » reste possible en action secondaire. La frise garde trois étapes.

Décisions de Julien :

| Sujet | Décision |
|---|---|
| **Facultatif** | Oui : on peut clôturer sans jamais dévoiler |
| **Qui déclenche** | L'organisateur, jamais automatique |
| **Quand** | Normalement à partir de la date de la fête. Peut être **forcé avant**, avec un gros avertissement (maquette : encadré rouge, phrase à recopier, bouton sûr « Attendre la fête » mis en avant) |
| **Irréversible** | Oui. Confirmation dans un panneau du bas |
| **Listes de souhaits** | **Pas de gel** : dévoiler ne clôture pas l'édition. Les listes restent modifiables jusqu'à la clôture, qui reste une action à part |
| **Date de la fête** | **Obligatoire** (une vraie date) à la création d'une édition, décidé le 15 novembre 2026 : pas de parcours « sans date ». Pour les éditions existantes sans date : une carte « Quand a lieu la fête ? » sur l'écran de suivi, et le dévoilement indisponible tant qu'elle n'est pas renseignée (maquette « Étape 2 · Édition existante sans date de fête ») |
| **Qui voit** | Pour le moment, **l'organisateur seul**. Plus tard : sert de base au mode prédictions (22.3) ; sans prédictions, la liste sera visible depuis la page personnelle d'un tirage |

Proposé dans les maquettes, à confirmer par Julien avant de coder :

- Un événement au journal du groupe (« Les résultats ont été dévoilés »), sans jamais y écrire qui a offert à qui.
- « Voir un résultat » (dernier recours, une personne à la fois) existe déjà et ne change pas ; les maquettes proposent seulement de le libeller « Voir un seul résultat » pour ne pas le confondre avec le dévoilement.
- Écran « clôturée » (avec ou sans dévoilement) : pas encore redessiné.

À vérifier avant de concevoir plus loin : la section 8.7 (secret et éditions passées) et ce que la clôture rend visible aujourd'hui (`AdminEditionResults`, « ses résultats ne sont plus secrets »).

### 22.10 Carte « À faire maintenant » de l'accueil : règles d'affichage (15 novembre 2026)

Proposition issue des maquettes de l'accueil (même canevas qu'en 22.8, rangée « Page d'accueil »). **Codé le 15 novembre 2026** (`pickHomeAction` dans `server/utils/home.ts`, un test par rang).

**Principe** : l'accueil affiche **une seule carte** en tête, choisie par un classement fixe. On calcule tous les candidats, pour tous les groupes et tous les rôles du compte, et on affiche le premier de la liste.

| Rang | Rôle | Condition | Titre de la carte | Bouton → destination |
|---|---|---|---|---|
| 1 | Organisateur | Tirage fait, au moins une personne pas prévenue | Préviens chacun que le tirage est fait | « Prévenir par email » → sélection par email |
| 2 | Super-admin | Au moins une demande de groupe en attente | N demandes de groupe à traiter | « Voir les demandes » → comptes |
| 3 | Participant | Tirage fait, résultat jamais découvert | Le tirage est fait ! | « Découvrir à qui j'offre un cadeau » → page du tirage |
| 4 | Organisateur | Tout le monde prévenu, fête dans 7 jours ou moins, au moins une personne n'a pas consulté | N personnes n'ont pas encore ouvert leur lien | « Relancer » → édition |
| 5 | Organisateur | Édition à préparer, tirage impossible | Le tirage est impossible pour l'instant | « Corriger » → édition |
| 6 | Organisateur | Édition à préparer, tirage possible | Vérifie la liste, puis lance le tirage | « Ouvrir l'édition » → édition |
| 7 | Participant | Listes de souhaits actives, zéro idée, édition non clôturée | Note quelques idées de cadeaux | « Mes idées » → liste de souhaits |
| 8 | Organisateur | Fête passée, édition non clôturée | La fête est passée : clôture l'édition | « Ouvrir l'édition » → édition |
| 9 | Organisateur | Groupe sans édition en cours | Prépare le tirage de cette année | « Créer l'édition » → nouvelle édition |
| 10 | Compte | Peut créer un groupe et n'en a aucun | Ta demande est acceptée : crée ton groupe | « Créer mon groupe » → nouveau groupe |
| 11 | Compte | Prénom manquant | Dis-nous comment tu t'appelles | « Compléter mon profil » → compte |

**Logique de l'ordre** : d'abord ce qui bloque d'autres personnes (1, 2), puis ce qui me bloque (3), puis ce qui presse à cause de la date (4), puis l'étape normale suivante (5, 6), puis le facultatif (7 à 11).

**Règles autour**

- Une carte au plus. Sans candidat, pas de carte.
- Exception : avec un seul tirage en cours et aucun candidat, l'accueil montre quand même ce tirage en carte calme (enveloppe, bouton en contour « Revoir » ou simple état d'attente).
- Départage à rang égal entre deux groupes : la fête la plus proche, puis le plus de personnes concernées, puis le nom du groupe par ordre alphabétique.
- Le groupe est nommé dans l'étiquette de la carte dès que le compte a plus d'un groupe.
- Rien ne se perd : un candidat non retenu reste écrit sur sa ligne (statut, plus la pastille d'action pour un participant).
- La carte ne se ferme pas à la main pour les rangs 1 à 6 : elle disparaît quand la condition n'est plus vraie.
- Aucun indice sur le secret : jamais de prénom de receveur, de score ou de réservation dans la carte.

**Fonctionnalités futures**

| Fonctionnalité | Où elle s'insère |
|---|---|
| Dévoiler les résultats (22.9) | Remplace le rang 8 : « La fête est passée : dévoile les résultats » |
| Paris à faire (22.3) | Entre 6 et 7 : paris ouverts et incomplets |
| Résultats des paris | Juste après le rang 3, tant qu'ils n'ont pas été vus une fois |
| Listes partagées (22.3) | Aucune carte : elles vivent dans leur propre section |

**Tranché par Julien le 15 novembre 2026**

- Rangs facultatifs (7 à 11) : un lien « Plus tard » les met de côté, mémorisé par édition (ou par groupe et par année pour le rang 9), dans le navigateur seulement (`useHomeDismissed`). La carte suivante du classement prend la place.
- Rang 9 : seulement du 1er octobre au 31 décembre (`PREPARE_FROM_MONTH`).
- Rang 4 : à 7 jours de la fête ou moins (`REMIND_DAYS`), avant le rappel automatique de 3 jours.
- Rangs 5 et 6 : la vérification du tirage (celle de l'écran de l'édition) ne tourne que pour 3 éditions à préparer au plus par chargement de l'accueil (`CHECKED_EDITIONS_MAX`) : elle lit l'historique du groupe, et D1 plafonne les requêtes d'un appel. Au-delà, la carte est celle du rang 6.

**Côté code** : une seule fonction pure, `pickHomeAction(home, today, dismissed)` dans `server/utils/home.ts`, qui prend l'état de l'accueil, la date du jour et les cartes mises de côté, et renvoie la carte à afficher (ou rien). Ce tableau est son jeu de tests. La route `GET /api/auth/home` fournit ce qu'il lui faut : par édition organisée, la date de la fête, les nombres « à prévenir », « pas encore ouvert » et « a découvert », et si le tirage est possible ; par tirage, si le résultat a été vu, la liste de souhaits et le nombre d'idées.

Avec un seul tirage en cours et aucun groupe organisé, la carte du tirage tient lieu de carte du haut : les rangs 3 et 7 (qui le concernent) n'en ajoutent pas une seconde. Tout le haut de cette carte ouvre la page du tirage, même avant le tirage, quand elle n'a pas de bouton.

### 22.11 À faire en premier : « Pistes de cadeaux », à la place de la liste de souhaits (16 novembre 2026)

Conception validée par Julien le 16 novembre 2026. **Rien n'est codé.** C'est la prochaine fonctionnalité, avant le tirage déjà fait (22.12). Maquettes : https://claude.ai/artifact/6XYdmH9di9ctyAZxzLD9Ns, page « Pistes de cadeaux » (11 écrans).

**Pourquoi** : une liste de souhaits fait « offrez-moi ça ». Celui qui offre a surtout besoin de savoir qui est la personne.

**La page « Mes pistes de cadeaux »** remplace « Ma liste de souhaits ». Tout est facultatif. De haut en bas :

| Bloc | Contenu |
|---|---|
| Moi et les cadeaux | Six questions à deux choix, plus « Les deux me vont », une par écran, un appui pour répondre |
| En ce moment | Texte libre, 300 caractères : ce qui occupe la personne ces temps-ci |
| Ce qui me servirait | Texte libre, 300 caractères |
| J'évite, ou j'ai déjà | Texte libre, 300 caractères |
| Une idée précise, si tu sèches | La liste actuelle (un texte, un lien facultatif), avec la phrase « Une idée précise ne gâche rien » |

Les six questions : utile ou surprenant ; un objet ou un moment ; à garder ou à consommer ; pour moi ou à partager ; d'occasion ou fait main, ça me va ou non ; surprends-moi ou je préfère savoir.

Pourquoi cette forme (recherches lues en résumé le 16 novembre 2026) : celui qui reçoit apprécie davantage un cadeau qu'il a demandé (Gino et Flynn, 2011) ; celui qui offre vise l'effet du moment alors que l'autre regarde l'usage dans la durée (Galak, Givi et Williams, 2016) ; partir de ce que la personne *est* plutôt que de ce qu'elle *voudrait* donne des cadeaux trop typés (Steffel, Williams et LeBoeuf) ; un cadeau d'expérience rapproche plus qu'un objet (Chan et Mogilner, 2017). D'où « En ce moment » plutôt que « J'aime », pas de test de personnalité, et des questions sur le rapport au cadeau plutôt que sur les goûts.

- **Pour plus tard, des statistiques** (rien à coder maintenant, décidé le 16 novembre 2026) : les six réponses sont enregistrées comme des valeurs fixes par question, jamais comme du texte, pour pouvoir un jour les compter (part de « Les deux me vont », questions abandonnées, répartition des réponses). Règles posées avec Julien : en toute transparence (l'utilisateur est informé, et on peut lui montrer « Comme 62 % des gens »), des compteurs sans lien avec un compte, jamais d'analyse des textes libres (ils peuvent contenir des données de santé), rien par groupe en dessous d'un seuil.
- Par édition, comme aujourd'hui, avec « Reprendre mes pistes de {édition précédente} » quand la page est vide.
- Seule la personne qui offre les voit, après le tirage (6 bis.2 inchangé). Sur son résultat : les six réponses en étiquettes, puis « En ce moment », « Ce qui lui servirait », « À éviter », « Si tu sèches ». Pas de pronom genré : l'application ne connaît pas le genre.
- **Réglage du groupe à trois valeurs**, à la place de l'interrupteur : portrait et idées précises, portrait seulement (sans idée d'objet), aucune piste.
- **Plus rien au journal** : l'événement `wishes_updated` disparaît (il servait à rendre visible une réécriture par quelqu'un qui aurait récupéré le lien, 6 bis.3 ; risque accepté, la parade reste de régénérer le lien). L'organisateur ne voit plus qu'un état (« a laissé des pistes » ou non), à définir en codant.

**Demander des pistes**

- Sur son résultat, quand la personne n'a rien rempli, ni question ni rubrique : « Lui demander des pistes ».
- **Une seule demande par tirage**, sans relance, pour ne pas spammer. Le bouton disparaît ensuite pour de bon.
- **Anonyme** : ni l'email, ni le journal, ni l'écran de l'organisateur ne disent qui demande, ni même qu'une demande a eu lieu.
- **Envoyée tout de suite**, par email si la personne a une adresse, et dans tous les cas par un bandeau en haut de sa page de pistes.
- Quand des pistes arrivent, celui qui a demandé reçoit un email.
- Les emails passent par `buildEmail` (13.3) : texte simple, un lien, pas de mise en forme.
- Limite connue et acceptée : si la demande part juste après une découverte visible au journal, la personne peut faire le lien par l'heure.

**À faire en même temps** : le vocabulaire (« liste de souhaits », « idées de cadeaux ») sur l'accueil, la page du tirage, le suivi de l'organisateur, les messages et la carte « À faire maintenant » (22.10, rang 7) ; les sections 6 bis, 9 et 11 de ce document. Le lot 7 du plan de refonte (`docs/refonte/PLAN.md`) a été supprimé pour cette raison.

### 22.12 À faire ensuite : tirage déjà fait ailleurs (16 novembre 2026)

Conception validée par Julien le 16 novembre 2026, **remplace 22.6**. Rien n'est codé. À faire après 22.11. Maquettes : même canevas, page « Tirage déjà fait » (12 écrans).

**Principe** : le tirage a eu lieu sur papier ou dans une autre application. Chacun dit à qui il offre ; quand tout concorde, l'organisateur valide et l'édition devient une édition tirée ordinaire.

| Sujet | Décision |
|---|---|
| Choix du mode | À l'étape « Préparer », par le lien « Le tirage a déjà été fait ailleurs ? » sous « Lancer le tirage ». Pas de champ à la création |
| Frise de l'organisateur | Préparer, Réponses, Fêter |
| Qui saisit | Chaque participant, sur sa page. Jamais l'organisateur |
| Choix de la personne | Tous les participants sauf soi ; recherche au-delà de 10. Puis un panneau de confirmation |
| Correction | Le participant corrige seul sa réponse jusqu'à la validation |
| Blocage | Personne ne voit de pistes de cadeaux avant la validation |
| Conflit | Deux personnes ont nommé la même : l'organisateur voit leurs prénoms dès que le conflit existe, jamais ce qu'elles ont répondu. Le participant n'a aucun message d'erreur |
| Validation | Par un bouton de l'organisateur, quand tout le monde a répondu et que tout concorde. Les réponses deviennent un tirage normal (receveur chiffré) |
| Une réponse manquante | S'il n'en manque qu'une, elle se déduit des autres (une seule personne n'a été nommée par aucun) : l'organisateur peut valider sans attendre, sans voir le résultat |
| Messages | Trois modèles : Demande, Relance, À vérifier (pour les personnes en conflit) |
| Exclusions | Ni appliquées, ni vérifiées, ni signalées, y compris « pas la même personne que l'an dernier ». Le panneau de démarrage le dit une fois. Elles restent enregistrées pour les prochaines éditions |
| Participants | Ajout et retrait possibles jusqu'à la validation |
| Revenir en arrière | « Abandonner et tirer avec l'application » efface les réponses, tant que rien n'est validé |
| Page du participant en attente | « Réponse enregistrée », avec l'avancement (« 3 réponses sur 5 ») |
| Historique | Les paires validées comptent pour l'an prochain, comme après un tirage normal |

Garde-fou : chaque changement de réponse est inscrit au journal, sans son contenu, parce qu'un organisateur qui participe pourrait sonder en changeant sa propre réponse et en regardant avec qui le conflit apparaît.

Vocabulaire : « réponse » partout, pas « déclaration ».

### 22.13 Idée : les questions d'après-fête (16 novembre 2026)

Idée de Julien, notée le 16 novembre 2026. **Rien n'est conçu ni planifié.** À reprendre après 22.11, dont elle dépend.

**Principe** : une fois la fête passée, la page du tirage pose une ou deux questions, en un appui chacune.

| À qui | Question | À quoi ça sert |
|---|---|---|
| Celui qui a offert | « Ses pistes t'ont aidé ? » | Savoir quelles rubriques des pistes servent vraiment (22.11) |
| Celui qui a reçu | « Ton cadeau t'a plu ? » | Le retour le plus parlant, et un moment sympa à l'étape « Fêter » |

Points à trancher avant de dessiner :

- **Qui voit la réponse de celui qui a reçu ?** Montrée telle quelle à celui qui a offert, une réponse tiède blesse. Pistes : ne la garder que pour des statistiques ; ou ne transmettre que le positif ; ou la remplacer par un « mot de merci » facultatif, transmis sans dire de qui il vient tant que les résultats ne sont pas dévoilés (22.9).
- **Quand la poser** : à partir du lendemain de la fête, sur la page du tirage et dans la carte « À faire maintenant » (22.10), sans email dédié pour ne pas spammer.
- **Cette donnée ne se rattrape pas** : on ne peut pas la demander après coup pour les fêtes passées.
- Mêmes règles que pour les statistiques de 22.11 : transparence, compteurs sans lien avec un compte, rien par groupe en dessous d'un seuil.

## 23. Design system

Léger, fait le 14 novembre 2026 avant la v2. Nuxt UI 4 fournit les composants de base ; ce qui suit est la couche propre à l'application. La page **Guide de style** (`/admin/guide-de-style`, super-admin, lien depuis l'écran des groupes) montre tout ce qui est décrit ici, dans la langue choisie dans le menu.

### 23.1 Jetons

Définis dans `app/assets/css/main.css`. Les écrans nomment un **rôle**, jamais une teinte.

| Jeton | Rôle |
|---|---|
| `bg-page` | Fond de page (kraft clair) |
| `bg-default` | Carte, ligne de liste (blanc cassé, jeton Nuxt UI) |
| `bg-muted` | Texte cité, aperçu d'un message |
| `bg-skeleton`, `bg-skeleton-soft` | Chargement, sur la page et sur une ligne blanche |
| `bg-track` | Partie vide d'une barre de progression |
| `bg-divider` | Trait entre deux lignes, entre deux étapes |
| `envelope`, `envelope-fold`, `star` | Papier kraft de l'enveloppe, son pli, l'étoile moutarde (puces des idées, carte de l'enveloppe ouverte) |
| `*-tint`, `*-soft`, `*-ink` (`primary`, `success`, `warning`, plus `warning-ring`, `error-soft`, `error-ink`) | Teintes d'une couleur de sens : `tint` le fond le plus clair (pavé, encadré), `soft` un cran plus soutenu (halo, bouton rond à presser, rond d'état, surlignage), `ink` le texte et les icônes posés dessus |
| `primary` (rouge brique), `secondary` et `success` (vert sapin), `warning` (moutarde), `error` (canneberge) | Action, réussite, attention, danger (`app/app.config.ts`). Attention et danger utilisent une teinte assez sombre pour rester lisibles en texte sur blanc |

Les teintes brutes (`--color-kraft-*`, `--color-brick-*`, `--color-pine-*`) ne servent qu'à définir ces jetons, et aux couleurs des icônes de personne (`app/utils/avatars.ts`).

### 23.2 Composants d'interface (`app/components/ui`)

Sans aucun texte ni logique métier ; les composants de `admin/` et `participant/` sont construits dessus.

| Composant | Rôle |
|---|---|
| `UiPageTitle` | Le titre d'un écran, un seul par page (`h1`) |
| `UiSectionTitle` | Le petit titre en capitales au-dessus d'un groupe, en Nunito même quand c'est un `h2` |
| `UiCard` | Surface blanche en relief ; `padding` `md`, `lg` ou `none` |
| `UiList`, `UiListItem` | Liste pleine largeur ; une ligne est un lien (`to`), un bouton (`on-click`) ou un simple affichage, avec icône ronde de 40 px (brique pour ce qui est à faire, grise sinon : `icon-tone="neutral"`, rouge pour `tone="danger"`), emoji ou icône de personne, et un emplacement `trailing` ; 60 px de haut, titre en semi-gras, sous-titre en 13 px ; une ligne de réglage montre sa valeur à droite (`value`, avec chevron) ou un interrupteur (`v-model:checked`) |
| `UiAvatar` | L'icône d'une personne, en quatre tailles : `sm` 32 px, `md` 40 px, `lg` 56 px (en-tête d'une page), `xl` 80 px (résultat, fiche, choix de l'icône) |
| `UiTextPreview` | Un texte tel qu'il a été écrit ou sera envoyé |
| `UiMessageBubble` | Un message tel que la personne le lira, dans une bulle (92 % de large au plus, coin bas gauche resserré) : ses mots, puis son lien seul sur sa ligne, en gras, sans `https://`, coupé s'il est trop long (`aroundLink`) |
| `UiSegmented` | Un choix parmi quelques-uns, côte à côte sur une piste grise ; le choix fait est blanc et en gras. Des boutons radio natifs dessous : les flèches changent le choix |
| `UiStepper` | Frise d'étapes : faite (rond vert, coche), en cours (rond brique, halo, `aria-current="step"`), à venir (rond vide). Non cliquable |
| `UiActionCard` | « À faire maintenant » : étiquette en capitales (moutarde avec `tone="warning"`, quand il faut d'abord corriger), titre, preuve dans le slot par défaut (phrase, compteurs, barre), action dans le slot `action`, ligne d'aide |
| `UiCounters` | Trois pavés chiffre et libellé, tons `primary`, `warning`, `success` |
| `UiAvatarStack` | Quatre icônes de personne au plus qui se recouvrent, puis « +N » (`stackOf`) |
| `UiSheet` | Panneau du bas autour de `UDrawer` : titre (Fraunces 22 px), description, corps, pied (action et sortie), en-tête remplaçable ; `busy` l'empêche de se refermer pendant une action |
| `UiSkeleton` | Un écran qui arrive, en pièces grises à la place et à la taille de ce qu'elles annoncent ; `AdminQueryState` et `ParticipantScreen` s'en servent |
| `UiCheckRow` | Une personne à cocher : icône, nom, une ligne dessous (ou l'emplacement `subtitle`, pour une icône), case native de 24 px ; toute la ligne coche |
| `UiStickyFooter` | La bande blanche collée en bas d'un long écran, avec son action principale ; elle descend jusqu'au bas de la page |
| `UiPointList` | Quelques points, chacun après un petit rond ou son icône ; `tone` colore les marques (rouge pour ce qui se perd, vert pour ce qui reste) |
| `UiJournalPreview` | « Ce que le groupe lira dans le journal » : la ligne dans une carte blanche, avant l'action qui l'écrit |
| `UiConfirmBox` | La case « Je comprends que… » à cocher avant une action qui ne se rattrape pas |
| `UiSpinner` | La petite roue (20 px) d'une ligne ou d'un interrupteur qui enregistre, avec son texte pour les lecteurs d'écran ; `UiListItem busy` la met à la place du chevron. Dans un bouton, c'est le `loading` de `UButton`. Elle ne tourne pas si `prefers-reduced-motion` |
| `UiNotice` | `info` (ligne discrète), `positive` (bandeau vert), `caution` (bandeau moutarde encadré, à savoir), `warning` (encadré avec titre), `danger` (encadré rouge épais, titre avec icône, pour ce qui ne se rattrape pas), `checklist` (lignes validées ou en attention, avec emplacements `trailing` et `detail`) |
| `UiEnvelope` | L'enveloppe d'un tirage en SVG : `pending` (pointillés, horloge), `sealed` (kraft, cachet brique à l'étoile), `opened` (rabat levé, carte à l'étoile), `locked` (cadenas). Décorative |
| `UiGiftTag` | Carte en forme d'étiquette cadeau, un trou rond en haut au centre, contenu dans le slot |
| `UiPersonPicker` | Choix d'une personne dans un `UiSheet` ; au-delà de 10, une recherche (`UiSearchField`) sans accents ni casse, lettres trouvées surlignées (`matchesName`, `highlightName`) |
| `UiSearchField` | Champ de recherche au-dessus d'une liste de plus de 10 personnes : loupe, libellé, croix pour vider. La recherche montre tous les résultats, sans repli |
| `UiFoldRow` | La ligne qui remplace la suite d'une longue liste : trois icônes de personne, « Voir les N autres » et, si besoin, l'état de la série (emplacement `detail`, pour son icône), un chevron ; puis une petite bande avant la suite. La même ligne, sans les icônes et chevron vers le haut, replie une liste dépliée (« Replier la liste ») |
| `UiFoldedRows` | Les lignes d'une liste repliée, dans son `<ul>` : les premières lignes, puis « Voir les N autres » ; un appui déplie tout d'un coup (décidé par Julien le 16 novembre 2026 : jamais « Voir les N autres » et « Replier la liste » ensemble), et « Replier la liste » vient en dernière ligne ; replier ramène la fin de la liste à l'écran (`foldList`, `listView`). Chaque ligne est dessinée par l'emplacement `row` |
| `UiSettingSheet` | Cadre de tout panneau de réglage : titre, aide, contenu, « Valider » et « Annuler » ; un enregistrement refusé s'affiche en ligne rouge au-dessus du bouton, le panneau reste ouvert et la saisie est gardée |
| `UiChoiceSheet`, `UiTextSheet`, `UiNumberSheet` | Sur `UiSettingSheet` : une valeur parmi plusieurs (aide par choix), un texte avec son compteur, un nombre entre bornes (moins, nombre, plus). La valeur n'est gardée qu'avec « Valider » |

Fonctions pures qui les servent, testées : `stackOf`, `foldList` et `listView` (`shared/utils/lists.ts`), `followSeries` (`server/utils/editions.ts`), `matchesName` et `highlightName` (`shared/utils/names.ts`), `participantSteps` et `envelopeState` (`server/utils/personal.ts`).

Composants construits dessus et réutilisés : `AdminStatusBadge`, `AdminDateField` (un jour dans un champ, chiffres et icône de calendrier, qui ouvre le calendrier en panneau ; tant qu'il est vide, la date proposée en pastille dessous), `JournalList`, `LanguageSwitch`.

Panneaux et états communs de l'administration : `AdminDateSheet`, un jour dans un panneau de réglage (calendrier, jour en toutes lettres et compte à rebours, facultatif avec `clear-label`), dont `AdminPartyDateSheet` (date de la fête d'une édition) est un usage ; `AdminQueryState`, le chargement (`UiSkeleton`, composé par l'écran de `title`, `header`, `stepper`, `steps`, `card`, `envelope`, `groups`, `list` : l'édition, l'accueil et la page d'un tirage ont chacun le leur ; il n'apparaît qu'après 200 ms) et l'erreur (carte avec « Réessayer », qui relance les requêtes de l'écran, et un retour ; accès refusé ou page introuvable : la phrase et le retour à l'accueil).

Écran d'une édition (section 11), construit sur ces composants : `AdminEditionHeader`, `AdminEditionPrepare`, `AdminEditionFollow`, `AdminDrawSheet`, `AdminSendSheet`, `AdminDateSheet`, `AdminPartyDateCard`.

Accueil (section 11), construit sur `UiActionCard`, `UiEnvelope` et `UiNotice` sans nouveau composant d'interface : `HomeTopCard` (la carte « À faire maintenant »), `HomeDrawCard` (le tirage unique), `HomeDrawRow`, `HomeGroupCard`, `HomeRequestSheet`. Plus aucun emoji comme icône : enveloppe fermée (à découvrir), horloge (pas encore tiré), enveloppe ouverte (déjà vu), archive (clôturé).

### 23.3 Règles

- Une colonne de la largeur d'un téléphone (`max-w-md`) sur tous les écrans ; les barres du haut et du bas prennent toute la largeur ; les panneaux du bas restent dans la colonne.
- Une action courte sur un élément s'ouvre dans un **panneau du bas** (`UDrawer`) ; un formulaire long a son propre écran.
- Un panneau enregistre avec un bouton « Valider » ; le fermer autrement abandonne.
- Une cible tactile fait au moins 44 px.
- Une action dangereuse est rouge, en bas de liste, et demande une confirmation (deuxième appui, ou texte à recopier quand elle est irréversible).
- La ligne « ajouter » est en haut d'une liste de règles (exclusions), en bas d'une liste de personnes.
- Le bouton d'action d'une ligne est rond, avec une icône seule : plein et clair quand l'action reste à faire, en contour gris quand elle est faite.
- **Une action en cours** (décidé le 16 novembre 2026) : la roue remplace l'icône du bouton, le libellé dit ce qui se passe (« Tirage en cours… »), le bouton garde sa taille et se désactive, le panneau ne se referme pas ; un réglage qui s'enregistre met la roue à la place du chevron. L'indicateur n'apparaît qu'après 200 ms (`useBusy`) ; un rechargement en arrière-plan ne change rien à l'écran.
- Aucun texte en dur dans un écran du produit : tout passe par les dictionnaires (section 21). Seule exception, la page Guide de style, outil du développeur.

### 23.4 Reste à faire

- **Refonte des interfaces en cours** : le plan, lot par lot, est dans [`docs/refonte/PLAN.md`](docs/refonte/PLAN.md), avec l'état de chaque maquette (codée, partielle, à coder) et les maquettes en HTML dans `docs/refonte/maquettes/`. Chaque lot terminé y est coché.
- Pas de paquet séparé ni de Storybook tant qu'il n'y a qu'une application.

