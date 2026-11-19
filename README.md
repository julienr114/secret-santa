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
11. **Pistes de cadeaux** (liste de souhaits en v2, remplacée le 17 novembre 2026, 22.11) : chaque participant peut dire qui il est et ce qui lui ferait plaisir ; son donneur le découvre **uniquement** sous son résultat, après avoir touché « Découvrir ». Rien ne révèle qui a tiré qui. Détails en section 6 bis.
12. **Programmation fonctionnelle et standards de l'industrie** (décision v2) : fonctions pures pour tout le métier, effets de bord repoussés dans les routes, ESLint + Prettier, tests Vitest sur la logique métier, Git en petits commits. Détails en section 7.1.

### Hors périmètre

- Tout envoi sans action de l'organisateur : pas d'envoi automatique, pas d'API WhatsApp ni de SMS.
- Chiffrement de bout en bout.
- Messagerie anonyme, paiement, application native.
- Dans les pistes de cadeaux : réservation d'un cadeau (« je le prends ») et notification du donneur quand elles changent (seule exception : la réponse à une demande de pistes, 6 bis.3).
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
| **Pistes de cadeaux** | Ce qu'un participant laisse pour celui qui lui offre, pour une édition : six réponses, trois textes, des idées précises. Visibles par son donneur après le tirage (section 6 bis). |

Une personne présente dans deux familles est enregistrée **deux fois** (une personne par groupe), avec un lien distinct.

---

## 4. Parcours

### 4.1 Cycle de vie d'une édition

```
en préparation ──► tirée ──► clôturée
       ▲             │
       └── annulation du tirage (journalisée)
```

Depuis le 15 novembre 2026 (22.8), l'édition naît **en préparation**, avec une date de fête obligatoire : il n'y a plus d'étape « brouillon » ni d'étape « invitations » à ouvrir. L'écran de l'organisateur montre une frise en trois étapes, Préparer, Tirer, Fêter ; « Fêter » est la même édition tirée, à partir du jour de la fête. Pour un tirage déjà fait ailleurs (6.7, lot 17), la frise devient Préparer, Réponses, Fêter : l'édition reste `preparing` tant que les réponses sont recueillies, puis passe `drawn` à la validation.

| Statut | Ce qui est possible |
|---|---|
| `preparing` | L'organisateur compose la liste des participants et les exclusions, règle les paramètres. Les liens marchent déjà : il peut, s'il le veut, prévenir avant le tirage pour que chacun laisse ses pistes de cadeaux. |
| `tirée` | Le tirage est fait. La liste des participants est verrouillée. Chacun peut consulter son résultat et les pistes de son receveur, et continuer à modifier les siennes. |
| `clôturée` | Après la fête. Lecture seule, pistes comprises. Sert d'historique pour l'exclusion de l'année suivante. |

### 4.2 Parcours de l'organisateur

1. Se connecte avec son adresse email (lien magique) et ouvre son groupe.
2. Crée l'édition. L'application **reprend les participants de l'édition précédente** (les exclusions appartiennent au groupe et restent valables).
3. Coche qui participe, ajoute les nouveaux, désactive les absents, met à jour les exclusions.
4. Facultatif : prévient avant le tirage (« Prévenir avant le tirage »), pour que chacun laisse ses pistes.
5. Lance le tirage quand la vérification est verte, après un récapitulatif dans un panneau du bas. Ou, si le tirage a déjà eu lieu sur papier ou ailleurs, touche « Le tirage a déjà été fait ailleurs ? », demande à chacun à qui il offre, puis valide (6.7).
6. Prévient chacun que le tirage est fait : par email à plusieurs d'un coup (action principale), ou une personne à la fois depuis sa ligne (email, partage du téléphone, copie).
7. Suit chaque personne : *à prévenir*, *pas encore ouvert*, *a découvert* (combien de fois), et s'il a laissé des pistes (jamais leur contenu).
8. En cas de pépin : renvoie un lien, régénère un lien transféré par erreur, annule et relance le tirage.
9. Après la fête : clôture l'édition.

### 4.3 Parcours du participant

1. Reçoit son lien personnel (WhatsApp, SMS…), partagé par l'organisateur.
2. Ouvre son lien : pas de code, pas de compte.
3. Avant le tirage : voit un écran d'attente (« Encore un peu de patience ») avec « Laisser mes pistes de cadeaux ». Pour un tirage déjà fait ailleurs : « À qui offres-tu un cadeau ? », puis « C'est noté » avec l'avancement (6.7).
4. À tout moment avant la clôture : laisse ou modifie ses **pistes de cadeaux** (6 bis). Le lien suffit (v5).
5. Après le tirage : touche « Découvrir à qui j'offre un cadeau », voit « Tu offres un cadeau à **Prénom** », avec le budget et la date si renseignés, puis « Pour t'aider à choisir » : les **pistes de Prénom**, ou, s'il n'a rien laissé, « Lui demander des pistes » (6 bis.3). C'est ce geste, et non la simple ouverture du lien, qui compte comme consultation : les aperçus automatiques de liens (WhatsApp, iMessage) ne le déclenchent pas.
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

**Le budget, la date de la fête et le petit mot sont des règles de l'édition** (décidé par Julien le 16 novembre 2026, Correction 9) : « Nouvelle édition » les demande en reprenant ceux de l'édition précédente, et l'écran de l'édition les corrige tant qu'elle n'est pas clôturée (lignes « Budget » et « Petit mot pour les participants », dans « Si tu veux » avant le tirage, en tête de « Plus tard, ou en cas de pépin » après ; en lecture seule une fois clôturée). Ils s'enregistrent dans `rules_override` de l'édition ; la valeur du groupe ne sert plus que de repli pour les anciennes éditions. Le nombre d'idées par liste n'est plus réglable à l'écran et garde sa valeur : la liste de souhaits sera remplacée par les pistes de cadeaux (22.11).

| Règle | Défaut | Description |
|---|---|---|
| `exclure_annees_precedentes` | 1 | « Éviter de retomber sur la même personne » : non, l'an dernier, les 2 ou les 3 dernières années (0 à 3) |
| `exclusions_manuelles` | aucune | Paires interdites supplémentaires (ex. « A ne tire jamais B »), à sens unique ou réciproques |
| `budget` | vide | Texte libre affiché sur la page de résultat (ex. « 20 € max ») ; par édition |
| `date_evenement` | vide | Date de la fête, affichée sur la page de résultat ; par édition |
| `message_gardien` | vide | Petit mot affiché sur la page de résultat ; par édition |
| `pistes_cadeaux` (`giftHints`) | portrait et idées précises | Ce que chacun peut laisser à celui qui lui offre : portrait et idées précises (`full`), portrait seulement (`portrait`), aucune piste (`none`) ; remplace l'interrupteur `liste_souhaits` (6 bis.1) |
| `souhaits_max` (`maxWishes`) | 10 | Nombre maximal d'idées précises par participant et par édition ; plus réglable à l'écran |

---

## 6. Le tirage

### 6.1 Contraintes

Pour chaque participant *donneur*, le *receveur* doit être :

- un autre participant de la même édition ;
- différent du donneur ;
- différent des receveurs qu'il a eus lors des N dernières éditions clôturées ou tirées du groupe (si `exclure_annees_precedentes` ≥ 1), **uniquement si le donneur participait à ces éditions** ;
- absent de ses exclusions manuelles.

Chaque participant reçoit exactement un cadeau et en offre exactement un (permutation sans point fixe). Les boucles courtes (A→B et B→A) sont autorisées.

Il faut **au moins trois participants** (`MIN_PARTICIPANTS`, décidé par Julien le 17 novembre 2026) : à deux, chacun sait à qui l'autre offre.

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

### 6.7 Tirage déjà fait ailleurs (lot 17, 17 novembre 2026)

Décisions dans 22.12. Le cœur est pur (`server/utils/answers.ts`, testé) ; les routes ne font que lire, écrire et chiffrer.

- **Le mode** : `editions.draw_mode`, `app` ou `elsewhere`. « Le tirage a déjà été fait ailleurs ? », sous « Lancer le tirage », ouvre un panneau qui dit une fois que les exclusions (et la règle des années précédentes) ne sont pas vérifiées, puis « Demander les réponses » (`answers/start`). Le tirage de l'application refuse alors (`collecting_answers`), et « Abandonner et tirer avec l'application » efface les réponses (`answers/abandon`).
- **Les réponses** : `draw_answers`, une par participation, le receveur (une personne) chiffré comme un tirage (8.3). Chacun répond sur sa page : tous les participants sauf soi, une recherche au-delà de 10, puis un panneau de confirmation ; il corrige seul jusqu'à la validation. Sa réponse ne s'affiche que s'il la demande (« Revoir ou corriger ma réponse »), par une mutation jamais mise en cache. **Aucun message d'erreur** quand elle heurte celle d'un autre.
- **Ce que voit l'organisateur** (`answersState`) : qui a répondu, qui est en conflit (deux personnes ont nommé la même), et s'il ne manque qu'une réponse qui se déduit des autres (une seule personne n'est nommée par personne, et ce n'est pas celle qui n'a pas répondu). Jamais ce que quelqu'un a répondu : un test vérifie qu'un changement de réponse sans conflit ne change rien à ce que lit l'organisateur.
- **La carte « Réponses »** (`answersCard`) : *collect* (« Demande à chacun à qui il offre », Demander puis Relancer par email), *conflict* (« Deux réponses ne vont pas ensemble », les prénoms, « Leur écrire » avec « À vérifier »), *oneMissing* (« Il ne manque que Louis », Relancer ou « Valider sans attendre »), *ready* (« Valider le tirage »). La liste va des réponses à vérifier à ceux qui ont répondu (`sortByAnswer`).
- **La validation** (`answers/validate`, `pairsFromAnswers`) : les paires, avec celle qui se déduit, sont stockées comme un tirage ordinaire, par le même code que le tirage de l'application (`drawStatements`), sans exclusion appliquée (`manualExclusions: []` dans `rules_snapshot`) ; les réponses sont effacées. L'édition est ensuite une édition tirée comme les autres (liens, suivi, résultat, dévoilement, alertes), et ses paires comptent pour l'an prochain.
- **Les participants** se changent jusqu'à la validation. Le retrait d'un participant efface sa réponse ; une réponse qui le nommait reste, mais ne compte plus tant qu'il est absent (`validAnswers`) : son auteur repasse « pas encore répondu ». Un nouveau venu n'a pas encore répondu. Points notés en section 6 du plan.
- **Annuler le tirage** après une validation remet l'édition en préparation, toujours en mode `elsewhere`, sans réponse : on recueille de nouveau, ou on abandonne.

---

## 6 bis. Pistes de cadeaux

Ajoutées en v2 sous la forme d'une liste de souhaits, **remplacées le 17 novembre 2026 par les pistes de cadeaux** (22.11, lot 16 de `docs/refonte/PLAN.md`). L'objectif : aider celui qui offre à choisir, en lui disant qui est la personne plutôt que « offrez-moi ça », sans rien changer au secret du tirage.

### 6 bis.1 Principes

- Des pistes **par participation** (donc par personne et par édition). Quand la page est vide, « Reprendre mes pistes de {édition} » copie celles de la dernière édition du groupe où la personne en avait laissé (portrait, et idées si le groupe les garde).
- **Tout est facultatif.** La page « Mes pistes de cadeaux » (`/p/[token]/pistes`) a quatre blocs :
  - **Moi et les cadeaux** : six questions à deux choix, une par écran (`/p/[token]/pistes/question?n=1` à `6`), un appui pour répondre et passer à la suivante, « Plus tard » pour revenir. L'enchaînement ne part que de « Commencer », à la première question sans réponse (`firstUnanswered`). Ensuite, sur la page, chaque réponse est une étiquette (« Les deux me vont » compris, « Pour soi ou à partager ») et chaque question sans réponse une étiquette en pointillés avec son titre (« + Pour moi, ou à partager ? ») ; un appui ouvre cette seule question (`?modifier=1`), réponse cochée : choisir enregistre et revient, la flèche revient sans rien changer, « Effacer ma réponse » la remet à « sans réponse » (décidé par Julien le 17 novembre 2026). Chaque question propose aussi « Les deux me vont », « Neuf, ou d'occasion ? » comprise (décidé par Julien le 17 novembre 2026 : « D'occasion ou fait main » ou « Neuf » ; `first` et `second` gardent leur sens d'avant). Avec le réglage « Portrait seulement », la question « Surprends-moi, ou je préfère savoir ? » n'est pas posée : il en reste cinq, et les compteurs le disent (« question 2 sur 5 ») (`questionsFor`). Les réponses sont des **valeurs fixes par question** (`first`, `second`, `both`, ou rien), jamais du texte, pour pouvoir un jour les compter (22.11, « statistiques »).
  - **En ce moment**, **Ce qui me servirait**, **J'évite, ou j'ai déjà** : trois textes libres de 300 caractères, chacun écrit sur sa page (`/p/[token]/pistes/texte?texte=`, Correction 18).
  - **Une idée précise, si tu sèches** : l'ancienne liste (une idée de 200 caractères, un lien facultatif `http`/`https` affiché avec `rel="noopener noreferrer nofollow"`), au plus `maxWishes` idées (10).
- **Réglage du groupe à trois valeurs** (`giftHints`) : `full` (portrait et idées précises, par défaut), `portrait` (sans idée d'objet : la surprise reste entière), `none` (aucune piste : la page, la ligne et les routes disparaissent). La migration `0019` a converti l'ancien interrupteur `wishlist` (activé donne `full`, désactivé `none`), et `mergeRules` lit encore l'ancien s'il en reste un.
- Modifiables en préparation et une fois tirée, figées en `clôturée`. Une relance du tirage (6.5) **conserve** les pistes : elles appartiennent à la participation.

### 6 bis.2 Qui voit quoi

| Acteur | Accès |
|---|---|
| Le participant | Lit et modifie ses propres pistes depuis sa page personnelle |
| Celui qui lui offre | Les lit sous son résultat, « Pour t'aider à choisir » : des phrases, pas d'étiquettes (`giverPortrait`, décidé par Julien le 17 novembre 2026) : « Inès préfère : » puis une puce par réponse tranchée aux quatre premières questions (« un moment plutôt qu'un objet ») ; l'occasion et la surprise dans une phrase à part (« D'occasion ou fait main, volontiers. Inès aime la surprise. », ou « Plutôt du neuf que de l'occasion. ») ; une ligne grise par « Les deux me vont » (« Pour soi ou à partager : peu importe. ») ; puis « En ce moment », « Ce qui lui servirait », « À éviter », « Si tu sèches ». Aucun pronom genré |
| L'organisateur | Seulement **si la personne a laissé des pistes** (« A laissé des pistes », `hasHints`), jamais leur contenu |
| Le journal | Rien (plus d'événement `wishes_updated`) |

Afficher les pistes de tout le monde permettrait de deviner par recoupement qui achète quoi pour qui : on s'en abstient.

### 6 bis.3 Demander des pistes

- Sous son résultat, quand la personne n'a rien laissé (ni réponse, ni texte, ni idée), celui qui offre peut « Lui demander des pistes » : un panneau dit ce qui va se passer, puis la demande part **tout de suite**.
- **Une seule demande par tirage**, sans relance ; le bouton disparaît ensuite. Un nouveau tirage (6.5) efface les demandes : chaque nouveau donneur peut demander une fois.
- **Anonyme** : aucune route, aucun email, aucune ligne de journal, aucun écran de l'organisateur ne dit qui demande, ni qu'une demande a eu lieu (`tests/e2e/hints.spec.ts` compare tout ce que l'organisateur lit avant et après une demande). La personne le voit par un email si elle a une adresse (« Quelqu'un cherche une idée de cadeau pour toi », vers sa page de pistes) et, dans tous les cas, par un bandeau en haut de sa page de pistes.
- La première fois que des pistes apparaissent après que celui qui offre a découvert son résultat, **qu'il les ait demandées ou non**, il reçoit un email (« Des pistes de cadeaux t'attendent »), sans le prénom de la personne : un email ne contient jamais de résultat (8.6). Une seule fois par tirage (`participations.hints_announced_at`), jamais pour une simple modification (lot 16 bis, `shouldAnnounceHints`).
- **Qui a demandé n'est pas stocké** (décidé par Julien le 17 novembre 2026, migration `0020`) : `hint_requests` ne garde que le receveur, l'édition et les dates. Quand les premières pistes arrivent, le serveur retrouve qui offre à la personne en déchiffrant le tirage de l'édition (`findGiverParticipationId`, 8.3), lui écrit, et n'en garde rien. Une demande disparaît avec le tirage quand il est annulé (`tests/e2e/hints.spec.ts`).
- Les deux emails passent par `plainEmail` de `server/utils/messages.ts`, comme ceux des organisateurs : texte simple, un lien.
- Limite connue et acceptée : si la demande part juste après une découverte visible au journal, la personne peut faire le lien par l'heure.

### 6 bis.4 Les pistes mises en avant (lot 16 bis, 17 novembre 2026)

Celui qui offre doit voir qu'il y a des pistes, et quand il y en a de nouvelles. Chaque enregistrement (question, rubrique, idée, reprise) date les pistes de la participation (`participations.hints_updated_at`, migration `0021`) ; l'ouverture du résultat est `last_viewed_at`. Trois états pour celui qui offre (`giverHintsState`) : pas de pistes, des pistes, de **nouvelles** pistes (laissées ou modifiées depuis sa dernière ouverture ; jamais avant la première). Ouvrir son résultat les rend anciennes.

- Résultat à découvrir : « Le tirage est fait, et des pistes de cadeaux t'attendent à l'intérieur. »
- Résultat caché : « Ses pistes de cadeaux t'attendent à l'intérieur » et « Revoir à qui j'offre, et ses pistes » ; « De nouvelles pistes t'attendent » quand elles sont nouvelles ; sans pistes, le bouton en contour et « Pas encore de pistes. Tu pourras lui en demander. » tant que la demande est possible.
- Résultat ouvert : la pastille « Nouveau » et « Pistes mises à jour le {date} », à cette ouverture seulement.
- Accueil : la carte « De nouvelles pistes pour ton cadeau » (22.10, rang 3 bis), et sinon la ligne du tirage « De nouvelles pistes à lire » (le signal du journal garde la priorité).
- Organisateur : « 1 sur 3 a laissé des pistes » sur le suivi, sans dire lesquelles sont nouvelles ni pour qui. Personne d'autre que celui qui offre ne sait s'il les a lues.

### 6 bis.5 Protection contre la triche

- **Le lien suffit pour modifier ses pistes** (décision v5). Une réécriture par quelqu'un qui aurait récupéré le lien n'est plus journalisée (22.11) : risque accepté, la parade reste de régénérer le lien.
- Une réponse change seule (`PATCH /api/p/[token]/hints`, seules les clés envoyées changent) ; la liste des idées est remplacée entière (`PUT …/wishes`).

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
- Le déchiffrement n'a lieu que dans trois cas : la consultation par le participant, le calcul des exclusions lors d'un tirage ultérieur, et l'email « des pistes sont arrivées » à celui qui en avait demandé (6 bis.3), pour retrouver qui offre à la personne ; le résultat ne sort pas du serveur.
- Les réponses d'un tirage fait ailleurs (`draw_answers`, 6.7) sont chiffrées de la même façon. Elles sont déchiffrées pour dire où en sont les réponses (sans les renvoyer), pour la validation, et pour le participant qui demande à revoir la sienne.
- **Aucune route d'administration ne renvoie une attribution en clair**, y compris pour le super-admin.

### 8.4 Administration (comptes, depuis le 14 novembre 2026)

Plus aucun mot de passe. Détail de la conception en 22.5.

- **Compte** : une adresse email. La connexion se fait par **lien magique** : `/login` demande l'adresse, un email apporte un lien `/login/<jeton>`, et un bouton sur cette page ouvre la session.
- **Lien** : jeton de 256 bits stocké en empreinte SHA-256, **usage unique**, valable **15 minutes** ; en demander un nouveau invalide les précédents ; ouvrir la page ne le consomme pas (seul le bouton le fait) ; même réponse que l'adresse ait un compte ou non ; 5 demandes par heure et par adresse, 20 par heure et par adresse IP.
- **Session** : une ligne en base (`sessions`), 30 jours, **révocable**. Le cookie scellé (`HttpOnly`, `Secure`, `SameSite=Lax`) ne porte que son identifiant ; elle est vérifiée à chaque requête. Se déconnecter la révoque ; « Mon compte » liste les appareils et permet de tout déconnecter.
- **Rôle**, recalculé à chaque requête depuis le compte, jamais lu dans le cookie : **super-admin** (indicateur `accounts.is_super_admin`, plusieurs possibles), **organisateur** (au moins un groupe dans `group_members`) ou **membre** (tous les autres : un participant qui se connecte pour retrouver ses tirages). Un membre n'a aucun accès à `/api/admin/*` (403) ni aux écrans `/admin`.
- **Inscription libre** (14 novembre 2026) : toute adresse valide reçoit un lien ; son compte est créé à la première demande, simple membre, dans la langue du participant qu'un organisateur aurait saisi avec cette adresse. Seul un compte désactivé ne reçoit rien. Garde-fous : 5 demandes par heure et par adresse, 20 par adresse IP.
- **Quota de groupes** (`accounts.group_quota`, 0 par défaut) : un compte crée un groupe s'il lui reste de la place (groupes créés et encore existants, `groups.created_by`) ; il en devient le premier organisateur. Un super-admin n'a pas de limite.
- **Demande de groupe** (`group_requests`) : depuis l'accueil, un compte sans place écrit pour qui il veut organiser un tirage ; une seule demande en attente à la fois. Chaque super-admin reçoit un email. Accepter laisse la place pour **un** groupe de plus ; dans les deux cas le demandeur est prévenu par email. Le super-admin peut y ajouter un mot (300 caractères, facultatif), tapé ou tout prêt (« Bienvenue », « C'est complet », « Entre proches ») : colonne `decision_note` (migration `0017`, lot 12), repris dans l'email (« Le mot de l'administrateur : ») et, pour un refus, sur l'accueil du demandeur.
- **Pages du super-admin** (refaites au lot 9 de la refonte, 17 novembre 2026). Plus de barre du bas : on y entre par la ligne « Administration » en bas de l'accueil (section « Super-admin ») et par le menu, où elle vient en premier ; toutes deux portent le nombre de demandes en attente (`UiCountBadge`).
  - `/admin` : l'accueil de l'administration. La demande la plus ancienne dans une carte (qui, quand, son texte ; un seul bouton « Traiter » ouvre sa page, où l'on refuse ou accepte), posée sur une pile quand d'autres attendent (un bord de carte par demande derrière, deux au plus, `UiStack`), intitulée « À traiter · 1 sur N » ; une fois répondue, elle part vers la gauche et la suivante monte de la pile (sans mouvement si l'appareil le demande). Sans nom, l'adresse sert de titre. Sans demande, « Aucune demande à traiter » ; la capacité (groupes de l'application sur environ 50, `AdminCapacityBar`, et ce que donneraient les demandes acceptées) ; puis Comptes, Groupes et le guide de style. L'ancienne redirection de `/admin` vers l'accueil n'existe plus ; un compte qui n'est pas super-admin y est renvoyé à l'accueil par le middleware.
  - La page d'une demande (`/admin/demandes/[id]`, Correction 18) : « Demande de {nom} », la date, le texte, « Un mot en réponse » (les messages tout prêts au-dessus du champ, 300 caractères, ajouté à l'email de la réponse), « Si tu acceptes » (groupes qu'il peut créer, groupes de l'application, la barre de capacité), puis « Refuser » et « Accepter », du même poids, fixés en bas, chacun avec sa roue (`useDecideRequest`) ; une fois répondu, retour à l'administration.
  - `/admin/comptes` : les comptes en usage, ceux qui attendent une réponse en tête (« À traiter »), la plus ancienne d'abord, avec une recherche par nom ou adresse ; chaque ligne dit le nombre de groupes organisés, ou « demande refusée » quand sa dernière demande l'a été ; les désactivés derrière la ligne « Comptes désactivés » (`?desactives`).
  - `/admin/comptes/[id]` : la page d'un compte, **en lecture seule pour le profil** (décidé par Julien le 16 novembre 2026 : il appartient au compte ; la route reste). La dernière visite ; « Groupes » : la demande en attente, « Peut en créer N » avec « moins » et « plus » (affiché aussitôt, remis en cas d'échec), les groupes qu'il organise (« Organise · 5 membres · tirage fait ») puis ceux où il participe (« Participe », une personne porte son adresse) ; « Accès » : désactiver (second appui) ou réactiver.
  - `/admin/groupes` : tous les groupes avec leur organisateur (tiré de la liste des comptes), leurs membres et leur tirage en cours (« Camille · 5 membres · tirage fait, 1 sur 5 a consulté »), une recherche par groupe ou organisateur, et « Créer un groupe pour quelqu'un ».
  - **Ce qui n'est qu'au super-admin sur un écran que tout le monde voit** est dans un cadre en pointillés titré « Super-admin » (`UiRestricted`), sans phrase d'explication : l'adresse du premier organisateur sur « Nouveau groupe », « Supprimer le groupe » dans les réglages.
- **Charge de l'application** : au-delà d'environ 50 groupes (`APP_GROUPS_COMFORT`), le plan gratuit de Resend (3 000 emails par mois) risque de ne plus suffire ; la page d'une demande le signale en orange, puis en rouge.
- **L'organisateur est une personne de son groupe** : le désigner (à la création ou depuis « Organisateurs ») le crée comme personne, copiée de son profil (prénom tiré de l'adresse sans profil). Tant qu'il organise, on ne peut ni le supprimer, ni le désactiver, ni changer son adresse (`person_is_organizer`).
- **Profil d'un compte** (`accounts.first_name`, `last_name`, `avatar_emoji`, `avatar_color`, migration `0012`) : prénom, nom facultatif, avatar et langue, réglés dans « Mon compte ». Quand un compte crée son groupe, il en devient la **première personne**, copiée de son profil (avec son adresse) ; la modifier ensuite dans le groupe ne change pas le profil, et inversement. Sans prénom, l'accueil invite à compléter le profil et aucune personne n'est créée.
- **Identifiant d'un groupe** : il n'est plus demandé. Il est déduit du nom (`slugify`), numéroté si déjà pris (`famille`, `famille-2`…).
- **Retour à l'accueil depuis un tirage** : sur les pages `/p/...`, une personne connectée a un bouton maison et le logo cliquable.
- **Rôle à jour côté écran** : quand l'application relit sa session, le serveur répond avec le rôle actuel du compte (`server/plugins/session.ts`), pour qu'un membre qui vient de créer un groupe voie tout de suite ses écrans d'organisateur.
- **Page d'accueil** (`/`, la même pour tous) : sans session, la connexion ; avec, « Je participe » (une ligne par tirage en cours avec l'étape suivante et le compte à rebours jusqu'à l'échange, les tirages clôturés repliés ; les participations des personnes qui portent l'adresse du compte, hors brouillons, ouvertes par leur lien personnel), « J'organise » (chaque groupe avec l'état de son tirage en cours ; « Nouveau groupe » avec le nombre restant, ou « Organiser un tirage » qui ouvre la page de demande `/demande` (le texte en haut, « Pourquoi une demande ? » dessous, « Envoyer ma demande » fixé en bas, Correction 18), l'application étant en bêta), et pour le super-admin une section « Administration ». Un organisateur qui met sa propre adresse sur un participant y verrait son lien : comme pour un lien copié, la première consultation du résultat reste inscrite au journal.
- **Organisateurs d'un groupe** : désignés par leur adresse depuis l'écran « Organisateurs » du groupe, par un super-admin ou par un autre organisateur. On ne se retire pas soi-même. Retirer quelqu'un coupe ses sessions ouvertes sur ce groupe à la requête suivante.
- **Super-admin** : crée et supprime les groupes, active l'envoi par email, gère tous les groupes. `julienr114@gmail.com` est créé par la migration `0007` ; les adresses de `NUXT_SUPER_ADMIN_EMAILS` le deviennent à leur première demande de lien (amorçage d'une installation neuve).
- **Développement et tests** : `NUXT_DEV_LOGIN_LINKS=true` renvoie le lien à l'écran au lieu de dépendre d'un email. **Jamais en production.**
- Toutes les routes `/api/admin/*` vérifient la session **et** le droit sur le groupe concerné.
- **Lien d'invitation d'un groupe** (`groups.invite_code`, `invite_until`, `invite_places`, `invite_message`, migration `0013`) : désactivé par défaut ; l'organisateur le crée sur la page `/admin/[groupe]/invitation` (« Inviter par lien », depuis les membres). Une fois créé : le message tel que les invités le liront, « Partager le lien » et « Copier le message » ; puis les réglages du lien : places restantes (par défaut, ce qu'un tirage peut encore accueillir : 100 moins les personnes actives) et date limite facultative, chacune dans son panneau ; son mot affiché sur la page d'invitation, écrit sur sa page (`/admin/[groupe]/invitation/mot`, Correction 18) ; enfin un nouveau lien (l'ancien cesse de marcher) ou la désactivation, chacun avec un second appui. Page `/rejoindre/[code]` : le groupe, son tirage en cours et le mot de l'organisateur ; sans session, connexion ou inscription par lien magique qui ramène ici (`?next=`, limité aux pages `/rejoindre/…` et `/p/…`) ; puis un prénom si le profil n'en a pas, et « Rejoindre le groupe » : le compte devient une personne du groupe (la sienne si l'organisateur avait déjà saisi cette adresse) et prend une place. **On rejoint le groupe, et le tirage tant qu'il est à préparer** (décidé par Julien le 17 novembre 2026) : le compte devient aussi participant de l'édition « à préparer » (sauf si elle a déjà 100 participants), le journal dit « Zoé rejoint l'édition », et la page mène à son tirage (« Voir mon tirage », « Noter mes idées de cadeaux ») ; un tirage déjà fait n'est pas touché, la page le dit (« tu seras du prochain »). Refus après la date limite (`invite_expired`) ou sans place (`invite_full`) ; un lien expiré dit depuis quand (« Ce lien d'invitation n'est plus valable depuis le 11 décembre », le lendemain du dernier jour, que `GET /api/invite/[code]` renvoie dans `expiredAfter`). La page a quatre états (lot 8 de la refonte) : l'invitation et l'adresse (« Recevoir mon lien »), le prénom et « Rejoindre le groupe » une fois connecté, la bienvenue, et le lien fermé (plus de place, date passée, lien désactivé ou inconnu), avec l'enveloppe au cadenas.
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
- [x] Aucun contenu de pistes de cadeaux dans une réponse d'API admin ni dans le journal (même test) ; une demande de pistes ne change aucune réponse de l'organisateur ni le journal (`tests/e2e/hints.spec.ts`).
- [x] Toute modification faite avec un lien personnel est journalisée : icône (`avatar_changed`), langue (`language_changed`). Les pistes de cadeaux ne le sont plus depuis le 17 novembre 2026 (22.11, risque accepté).
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
- Une édition **tirée mais pas encore clôturée** reste secrète : ses paires ne sont que comptées, sauf si l'organisateur les a **dévoilées** (22.9) : dès le jour de la fête, ou avant après un avertissement ; c'est définitif, journalisé pour tous, et seul l'organisateur voit la liste.
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
| ~~`wishes_updated`~~ | Plus écrit ni affiché depuis les pistes de cadeaux (22.11) ; les anciennes lignes restent en base, `journalEntries` les écarte (`RETIRED_TYPES`) |
| `avatar_changed` / `language_changed` | « Léa a changé son icône » / « Léa a changé sa langue (Deutsch) » |
| `edition_closed` | « L'édition Noël 2026 est clôturée » |
| `draw_revealed` | « L'organisateur a dévoilé les résultats du tirage », dès le jour de la fête : un jalon, pas une alerte ; jamais qui offre à qui |
| `answers_started` | « L'organisateur a indiqué que le tirage a été fait ailleurs : chacun donne sa réponse » (6.7) |
| `answer_given` / `answer_changed` | « Léa a donné sa réponse » / « Léa a changé sa réponse », **sans son contenu** : le garde-fou contre un organisateur qui sonderait en changeant la sienne |
| `answers_validated` | « L'organisateur a validé les réponses : le tirage compte pour 5 participants », un jalon |
| `answers_abandoned` | « L'organisateur a abandonné les réponses pour tirer avec l'application » |
| `guesses_enabled` | « Devine qui : le jeu de pronostics est ouvert » (22.17), à l'activation du jeu |
| `guesses_closed` | « Devine qui : les pronostics sont fermés », à l'heure de fin (tâche horaire) ou au dévoilement |
| `guess_results_ready` | « Devine qui : le palmarès est arrivé », une carte verte avec « Découvrir le palmarès » ; jamais un pronostic |
| `guess_reminder_sent` | « L'organisateur a rappelé le jeu à 2 personnes » |

Les événements stockés ne contiennent aucun texte : la phrase est composée à l'affichage, dans la langue du lecteur (section 21). `link_shared` n'est plus émis ; il reste décrit pour d'anciennes lignes. `results_revealed`, l'ancien accès au tirage entier, sert depuis le lot 13 aux résultats dévoilés **avant** la fête : « L'organisateur a dévoilé les résultats avant la fête », une alerte avec son panneau d'explication (22.15) ; d'anciennes lignes, s'il en reste, se lisent de la même façon, ce qui reste vrai (l'organisateur avait vu tous les résultats).

Chaque événement porte la date, l'heure et l'auteur (`participant`, `organisateur`, `super-admin` ou `système`).

**L'écran** (lot 6 de la refonte, 17 novembre 2026), le même pour le participant et l'organisateur (`JournalView`) : « Tout le groupe voit ce journal » et « À quoi sert-il ? », qui ouvre un panneau (ce qu'il note, ce qu'il ne dit jamais, qui le voit) ; deux vues, « L'essentiel », sans les changements d'icône et de langue (`essentialEvents`), et « Tout » ; l'édition (celle en cours d'abord, ou toutes) ; puis une frise par jour (`journalDays`). Les jalons de l'édition (création, tirage, clôture) sont des cartes blanches, les alertes (un résultat consulté par l'organisateur, un tirage annulé) des cartes moutarde avec « Qu'est-ce que ça veut dire ? », qui ouvre un panneau d'explication. Les événements d'un même type, d'un même jour et d'une même édition (découvertes, envois, liens copiés ou partagés, arrivées) tiennent sur une ligne, « 5 personnes ont découvert leur résultat », placée à l'heure du dernier, avec « Voir le détail » (`groupEvents`, `shared/utils/journal.ts`). Les envois ne se replient qu'avec le même message envoyé de la même façon : « L'organisateur a envoyé « Tirage fait » à 5 personnes par email ». Une ligne de découvertes montre les icônes des personnes, et son détail leur icône et leur prénom. **Filtre par personne** (lot 11, 17 novembre 2026) : chaque ligne porte la personne concernée (`personId`), et un envoi son message et son moyen (`messageType`, `via`, seuls mots du `meta` transmis) ; le journal renvoie aussi les personnes nommées, avec leur icône. Au participant, les personnes sont désignées par des clés propres à la réponse (`p0`, `p1`…, `keyPeople`), jamais par leur identifiant : aucune réponse d'un lien personnel ne porte celui d'une autre personne (8.3, test `security.spec.ts`). Le participant choisit « Tout le monde » ou « Moi (Hugo) » : ses lignes, à la deuxième personne (« Tu as découvert ton résultat », `ownText`, calculé par le serveur pour lui seul), sous l'encadré « Tout ce qui touche ton lien et ton résultat ». L'organisateur filtre sur n'importe quelle personne. Le panneau d'une alerte nomme la personne et dit ce que ça change pour qui le lit : la personne concernée, un autre participant ou l'organisateur.

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
| `revealed_at` | text nullable | Résultats dévoilés par l'organisateur (migration `0018`, README 22.9) |
| `draw_mode` | text | `app` (par défaut) ou `elsewhere`, tirage déjà fait ailleurs (migration `0022`, 6.7) |
| `guess_mode`, `guess_ends_at`, `guess_time_zone` | text | « Devine qui » (migration `0023`, 22.17) : `none`, `santa` ou `all` ; la fin des pronostics (un instant) et le fuseau où elle a été choisie |
| `guess_reminder_sent_at`, `guesses_closed_at`, `guess_results_sent_at` | text nullable | Le rappel unique, la fin inscrite au journal, le palmarès annoncé (une fois) |
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
| `hints_updated_at`, `hints_announced_at` | text nullable | Dernier enregistrement de ses pistes ; email « des pistes sont arrivées » déjà envoyé à son donneur pour ce tirage (migration `0021`, lot 16 bis) |
| `journal_seen_at` | text nullable | Dernière ouverture du journal depuis la page du tirage (migration `0016`) : les alertes d'après sont comptées sur la page |

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

### `gift_portraits` (migration `0019`)
| Colonne | Type | Notes |
|---|---|---|
| `participation_id` | text PK, FK | Une ligne par participation, dès qu'elle a écrit quelque chose |
| `useful_or_surprising`, `object_or_moment`, `keep_or_consume`, `self_or_shared`, `second_hand`, `surprise` | text nullable | Les six réponses : `first`, `second` ou `both`, jamais du texte ; null sans réponse |
| `lately`, `would_help`, `avoid` | text nullable | Les trois textes, 300 caractères |
| `updated_at` | text | |

Les idées précises restent dans `wishes`.

### `guesses` (migration `0023`)
| Colonne | Type | Notes |
|---|---|---|
| `id` | text PK | |
| `edition_id` | text FK | |
| `guesser_person_id`, `recipient_person_id`, `giver_person_id` | text FK | « Le joueur pense que `giver` offre à `recipient` » ; un pronostic par joueur et par destinataire (index unique). Jamais renvoyé à quelqu'un d'autre avant le dévoilement |
| `updated_at` | text | |

Effacés à l'annulation du tirage, quand le jeu est éteint, et avec le groupe ; en revenant à « Qui m'offre ? », seuls ceux sur son propre Père Noël restent. `participations.guess_results_seen_at` : le palmarès vu.

### `draw_answers` (migration `0022`)
| Colonne | Type | Notes |
|---|---|---|
| `participation_id` | text PK, FK | Une réponse par participant, tant que l'édition recueille les réponses (6.7) |
| `edition_id` | text FK | |
| `receiver_enc`, `receiver_iv` | text | La personne nommée, chiffrée (8.3) ; jamais renvoyée à l'organisateur |
| `answered_at` | text | |

Effacées à la validation (elles deviennent des `assignments`) et à l'abandon.

### `hint_requests` (migration `0019`)
| Colonne | Type | Notes |
|---|---|---|
| `receiver_participation_id` | text PK, FK | Une demande au plus par receveur et par tirage ; qui l'a faite n'est pas gardé (migration `0020`) |
| `edition_id` | text FK | Pour tout effacer à un nouveau tirage |
| `requested_at` | text | |
| `answered_at` | text nullable | Les pistes sont arrivées et l'email est parti |

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

L'arbre des écrans, avec le parent de chacun et donc la cible de « Retour », est dans `docs/ARBORESCENCE.md`, à tenir à jour à chaque nouvel écran. « Retour » remonte d'un cran dans cet arbre ; ce n'est pas le retour du navigateur (décidé par Julien le 18 novembre 2026, `useGoBack`, `backMove`).

Tous conçus pour un écran de téléphone en premier (≈ 380 px de large), zones tactiles d'au moins 44 px, une seule colonne. Ils ont été refaits du 15 au 17 novembre 2026 d'après les maquettes de `docs/refonte/maquettes/`, lot par lot ([`docs/refonte/PLAN.md`](docs/refonte/PLAN.md)) ; les composants qu'ils partagent sont en section 23.

### Côté participant

| Route | Écran |
|---|---|
| `/p/[token]` | Page personnelle. Selon l'état : attente du tirage, bouton « Découvrir », résultat, lien invalide. Ligne « Mes pistes de cadeaux » (« Rien pour l'instant », « Remplies · modifiables jusqu'à la fête ») si le groupe a des pistes. La ligne « Journal du groupe » dit « 1 alerte depuis ta dernière visite », avec un point moutarde, quand, depuis sa dernière ouverture du journal, un résultat a été consulté par l'organisateur, les résultats ont été dévoilés avant la fête, le tirage a été annulé, ou son propre lien a été régénéré (les événements de 22.15) (depuis la création de l'édition s'il ne l'a jamais ouvert, pour qu'un tirage annulé puis refait reste signalé ; lot 12, `unseenAlerts`). Balises `<title>` et Open Graph **neutres** (« Secret Santa »), sans prénom : les messageries génèrent un aperçu du lien |
| `/p/[token]/pistes` | Mes pistes de cadeaux (6 bis) : « Seule la personne qui t'offre un cadeau les verra », ou le bandeau d'une demande ; « Moi et les cadeaux » (carte « Pour commencer », puis une étiquette par question, sa réponse ou en pointillés, qui ouvre cette seule question) ; « Reprendre mes pistes de {édition} » sur une page vide ; les trois textes, chacun écrit sur sa page (`/p/[token]/pistes/texte?texte=`) ; « Une idée précise, si tu sèches » (`ParticipantIdeasSection`), chaque idée ajoutée ou changée sur sa page (`/p/[token]/pistes/idee`, `?n=`), avec « Supprimer l'idée » (Correction 18). L'ancienne adresse `/p/[token]/souhaits` y mène |
| `/p/[token]/pistes/question?n=` | Une des questions : la progression en points, « Plus tard », deux grands choix (la réponse actuelle cochée) et « Les deux me vont » ; un appui enregistre et passe à la suivante. Avec `modifier=1`, la seule question, « Moi et les cadeaux » au-dessus du titre, « Effacer ma réponse » en bas |
| `/p/[token]/tirage` | « Qui offre à qui » (22.18, `TirageTout`) : une fois le tirage dévoilé, toutes les paires dans l'ordre des prénoms, sa ligne marquée « toi ». Avant, la route refuse |
| `/p/[token]/journal` | Journal du groupe, le même que celui de l'organisateur (section 9) : « L'essentiel » ou « Tout », l'édition, une frise par jour, les lignes répétées repliées, les alertes expliquées, « À quoi sert-il ? » |
| `/rejoindre/[code]` | Lien d'invitation d'un groupe (22.2), quatre états : l'invitation et l'adresse ; le prénom et « Rejoindre le groupe » ; la bienvenue (dans le tirage à préparer, ou dans le groupe seulement si le tirage est fait) ; le lien fermé (plus de place, date passée, désactivé ou inconnu) |

Détails d'interface (page du tirage refaite le 15 novembre 2026) :
- De haut en bas : l'icône (avec un crayon tant qu'elle est modifiable), « Salut {prénom} ! », le groupe et l'édition, puis « Budget **30 €** · Fête le **ven. 25 décembre** » (ce qui est connu, pas sur une édition clôturée) ; une frise Invitation, Tirage, Fête (`participantSteps`, avec « bientôt », « fait », « dans N jours », « passée ») ; une carte avec une enveloppe (`envelopeState`) ; « Le mot de l'organisateur » dans un bloc beige, coupé à trois lignes avec « Lire la suite » (`ParticipantOrganizerNote`, pas sur une édition clôturée) ; les tuiles, puis « Journal du groupe » ; la carte « Garde tes tirages au même endroit ».
- **« Devine qui »** (lot 19, 22.17) : la tuile du jeu (« Fais ton pronostic », « Pronostic fait », « Réponse à la fête », « Le palmarès t'attend » en vert sapin, « Voir les réponses », `gameTile` ; aucune tuile après le dévoilement si personne n'a joué) ; à côté des pistes, les deux tuiles se mettent côte à côte. Une fois le tirage dévoilé et tant que le palmarès n'est pas vu, la carte de la page devient « Le palmarès de Devine qui est arrivé » (`UiPodium`, « Découvrir le palmarès » en vert sapin, puis « Revoir à qui j'ai offert un cadeau »). `/p/[token]/devine` : un seul pronostic en grand (« Qui m'offre ? ») ou la liste « Mon Père Noël » et « Les autres » (« Toutes les paires »), chaque ligne avec son pronostic ou « + Choisir », le panneau de choix (`ParticipantGuessSheet`, qui dit d'où vient un pronostic déplacé, et « Effacer ce pronostic ») ; une fois fermés, « Réponse à la fête » et ses pronostics ; une fois dévoilés, « Devine qui : les réponses » (le bouton vert du palmarès, ses pronostics sans correction, puis corrigés une fois les images vues). `/p/[token]/devine/palmares` : les images (`ParticipantStories`) ; le petit palmarès n'en garde que quatre (Correction 12, `DevineStoryPetit`).
- **Un tirage dévoilé** (22.18, Correction 13) : la frise dit « Tirage dévoilé » ; avant la fête, le bandeau « Le tirage n'est plus secret. » (`ParticipantRevealedBanner`, couleur des alertes, « Tu l'as dévoilé » pour qui a dévoilé, « Voir au journal » ; la ligne d'alerte du journal s'efface à sa place), la carte du résultat ouverte d'emblée (`ParticipantRevealCard` avec `open` : sans enveloppe, ni « Revoir », ni « Cacher »), puis « Qui m'offre mon cadeau ? » (repliée, se replie en quittant la page) et « Voir tout le tirage » (`ParticipantDrawLines`). Après la fête, au passé : la carte « Tu as offert un cadeau à… » (compacte sous l'invitation au palmarès), sans pistes, sans le mot de l'organisateur ni la date, la frise toute cochée ; clôturée, « Cette édition est clôturée. Rendez-vous l'an prochain ! ». Clôturée sans dévoiler : inchangée.
- **Tuiles** (lot 18, 22.16, `UiTile`) : une par chose à faire, pour l'instant « Mes pistes de cadeaux » quand le groupe en a (`hintsTile`). À faire, elle est cerclée de brique avec « À remplir » ; faite, elle porte une coche et « Remplies, modifiables jusqu'à la fête » (« Remplies, plus modifiables » une fois clôturée) ; sans piste après la clôture, pas de tuile. Seule, elle prend toute la largeur ; à deux (lot 19), côte à côte, plus compactes (« Remplies »). « Journal du groupe » est une ligne encadrée sous les tuiles (`ParticipantJournalRow`) ; avec une alerte, elle passe au-dessus, en ambre, « 1 alerte depuis ta dernière visite » en gras.
- Les états : avant le tirage (enveloppe en pointillés, « Laisser mes pistes de cadeaux ») ; tirage fait ailleurs (6.7, la frise dit « Ta réponse ») : « À qui offres-tu un cadeau ? » et « Dire à qui j'offre », qui ouvre la liste (`UiPersonPicker`) puis la confirmation (« Tu offres un cadeau à Louis ? », « Oui, c'est Louis », « Choisir quelqu'un d'autre », `ParticipantAnswerSheets`), puis « C'est noté », « 3 réponses sur 5 pour l'instant » et « Revoir ou corriger ma réponse » en contour ; à découvrir (enveloppe scellée, « Découvrir à qui j'offre un cadeau ») ; résultat affiché ; déjà découvert (enveloppe ouverte, « Revoir… » en contour, « Des pistes de cadeaux t'attendent. » quand il y en a) ; clôturée (« La fête est passée », et « Découvrir » si le résultat n'a jamais été vu) ; lien invalide (enveloppe au cadenas, sans en-tête ni listes, sur les trois pages `/p/**`).
- Résultat : sur une étiquette cadeau qui se retourne en apparaissant (sans animation si `prefers-reduced-motion`) : « Tu offres un cadeau à », l'icône et le prénom en très grand, puis « Pour t'aider à choisir » (le budget, la date et le mot sont sur la page, depuis le lot 16 bis) (`ParticipantGiverHints`) : ses réponses en phrases, ses textes, ses idées précises (chaque lien affiché « Voir le lien ») ; sans piste, « Lui demander des pistes » et son panneau, puis « Demande envoyée. »
- Le résultat ne reste pas affiché : il disparaît quand on quitte ou recharge la page, il faut retoucher « Découvrir ». Côté TanStack Query, la révélation est une **mutation**, jamais une requête mise en cache.
- Messages d'erreur clairs et sans jargon (« Ce lien n'est plus valable, demande-en un nouveau à ton organisateur »).

### Côté admin

| Route | Écran |
|---|---|
| `/` | Accueil, le même pour tous (refait le 15 novembre 2026). Sans session : le logo, une phrase, un encadré pour qui a reçu un lien personnel, puis la connexion. Connecté : « Bonjour » et l'avatar, la carte « À faire maintenant » (22.10), puis selon `homeLayout` : compte vide (d'où viendront les tirages, organiser un Secret Santa), un seul tirage (sa carte avec l'enveloppe, sa liste, les tirages passés), plusieurs tirages (une ligne chacun), ou au moins un groupe organisé (une carte par groupe, `groupCards` : « Mon tirage » et « Gérer le tirage ») Sans tirage, une demande de groupe en attente a sa carte « Ta demande est partie » (envoyée le…, un administrateur te répond par email, puis le texte de la demande), une demande refusée la sienne avec « Faire une autre demande » (lot 8 de la refonte). Le menu en haut à droite : « Langue » et les trois langues, puis « Mon compte » et « Se déconnecter », en lignes de 48 px.. Un tirage dévoilé avant la fête (22.18, `AccueilDevoileAvant`) : la carte dit « Tu offres un cadeau à {prénom} » avec son icône, « Le tirage n'est plus secret. » et « Voir ses pistes de cadeaux » ; plus de « Découvrir » |
| `/tirages-passes` | Les éditions clôturées du compte, par année ; chaque ligne ouvre la page du tirage |
| `/login`, `/login/[jeton]` | Connexion par lien magique : saisie de l'adresse (même écran que l'accueil sans session), puis « Regarde ta boîte mail » (l'adresse, les indésirables, ouvrir le lien sur cet appareil, « Utiliser une autre adresse ») ; la page du lien : « Se connecter sur cet appareil ? », « Tu vas être connecté avec hugo@example.com pendant 30 jours » (l'adresse lue sans consommer le lien) et son bouton, ou, dès l'ouverture, « Ce lien ne marche plus » et « Demander un nouveau lien » |
| `/admin/groupes/nouveau` | Création d'un groupe, pour tout compte qui a de la place dans son quota : le nom ; pour le super-admin, l'adresse du premier organisateur dans le cadre « Super-admin » ; sinon « Tu en seras l'organisateur » |
| `/admin` | Super-admin : l'administration (demandes, capacité, comptes, groupes) |
| `/admin/groupes` | Super-admin : tous les groupes, avec leur organisateur et une recherche |
| `/admin/comptes`, `/admin/comptes/[id]` | Super-admin : comptes (demandes en tête, recherche, désactivés à part), page d'un compte : profil en lecture, demande, quota, groupes, accès |
| `/admin/guide-de-style` | Super-admin : le guide de style (section 23), depuis la dernière ligne de l'administration |
| `/compte` | Mon compte (lot 8 de la refonte) : l'icône avec son crayon et l'adresse ; le profil en lignes (prénom, nom de famille, langue des emails), chacune changée dans son panneau et enregistrée aussitôt (`useProfileSaver`, la valeur s'affiche tout de suite et revient en cas d'échec) ; les appareils (téléphone ou ordinateur, `deviceIcon`), « Cet appareil » et « Déconnecter » pour les autres ; « Déconnecter partout » ; « Se déconnecter de cet appareil » |
| `/admin/[groupe]/organisateurs` | Ancienne adresse des organisateurs : mène à leur section des réglages |
| `/admin/[groupe]` | Accueil du groupe (refait le 16 novembre 2026) : nombre de membres et « tu es organisateur » ; la carte de l'édition en cours (date et compte à rebours, frise `editionSteps`, résultats consultés et personnes à prévenir, « Ouvrir l'édition »), ou, sans édition, « Prépare le tirage de cette année » (qui sera repris, `carriedOver`, et « Créer l'édition ») ; « Le groupe » en quatre lignes : Membres (les membres actifs, le même nombre que sous le titre, et « 1 ne participe plus » quand c'est le cas, `useMembersLine`, décidé par Julien le 17 novembre 2026), Exclusions (nombre de paires), Journal (dernier événement), Réglages ; puis les éditions passées. La suppression du groupe (super-admin) est dans les réglages |
| `/admin/[groupe]/personnes` | Membres (refait le 16 novembre 2026) : une liste, chacun avec son adresse et qui il ne tire pas (`notDrawnBy`), ceux qui ne participent plus grisés à la fin, recherche et repli ; « Ajouter une personne » en bas, puis « Inviter par lien ». La fiche d'une personne : son icône, prénom, adresse, langue de ses messages, nom de famille (panneaux), « Ne tire pas » (retrait d'un appui, ajout dans « Nouvelle exclusion »), « Enregistrer », puis « Retirer du groupe » (son historique reste) ; une fois retirée, « Remettre dans le groupe » ou « Supprimer définitivement ». « Nouvelle personne » : icône au hasard, prénom, adresse, langue, « Participe à {édition} » quand une édition se prépare, « Ajouter » ou « Ajouter, puis en créer une autre » |
| `/admin/[groupe]/exclusions` | Exclusions du groupe : « Ajouter une exclusion » en premier (panneau où chaque personne se choisit dans `UiPersonPicker`, avec la phrase qui en résulte), les paires « Camille et Hugo », et une exclusion dans un seul sens en toutes lettres, « Inès ne tire pas Louis » (sans flèche, décidé par Julien le 17 novembre 2026), puis la règle des années précédentes, réglée dans les réglages |
| `/admin/[groupe]/editions/nouvelle` | Nouvelle édition (refaite le 16 novembre 2026) : nom, date de la fête (le 25 décembre proposé), budget et petit mot facultatifs (le budget repris de la dernière édition ; le petit mot, une ligne « Petit mot pour les participants » qui ouvre sa page `…/editions/nouvelle/mot`, le formulaire étant gardé au retour par `useNewEditionDraft`, Correction 18), qui sera repris (`carriedOver`), « Créer l'édition ». Le budget et le mot, s'ils diffèrent de ceux du groupe, sont envoyés avec la création et deviennent les règles propres de l'édition |
| `/admin/[groupe]/reglages` | Réglages du groupe (refaits le 16 novembre 2026), une ligne par réglage, chacun dans son panneau ou par son interrupteur : Tirage (éviter la même personne), Participants (pistes de cadeaux, à trois valeurs dans un panneau ; mot ajouté aux messages et sa place, écrits sur leur page `/admin/[groupe]/reglages/mot`, Correction 18), M'écrire par email (trois emails aux organisateurs), Organisateurs (« Nouvel organisateur » dans un panneau, retrait par un second appui) ; pour le super-admin, « Supprimer le groupe » dans le cadre « Super-admin », puis dans un panneau : ce qui disparaît, l'identifiant à recopier, « Garder le groupe » en premier |
| `/admin/[groupe]/editions/[id]` | Pilotage d'une édition (voir ci-dessous) |
| `/admin/[groupe]/editions/[id]/emails` | Envoi par email à plusieurs participants (13.3) |
| `/admin/[groupe]/editions/[id]/exclusions` | Exclusions qui s'appliquent à l'édition : celles du groupe et les paires des tirages précédents, levables ; une fois tirée, celles appliquées |
| `/admin/[groupe]/invitation` | Le lien d'invitation du groupe : le message à partager, puis ses réglages (places, à taper ou avec « moins » et « plus », date limite, mot), un nouveau lien, la désactivation |
| `/admin/[groupe]/journal` | Journal du groupe, le même que celui des participants (section 9) |

Écran de pilotage d'une édition, le plus important (refait le 15 novembre 2026). De haut en bas : où en est l'édition, ce qu'il faut faire maintenant, les participants, puis ce qui peut attendre.
- **En-tête** : nom de l'édition, groupe et budget, pastille « Fête le … » qui ouvre le panneau de la date. Une édition ancienne sans date montre une carte « Quand a lieu la fête ? ».
- **Frise** Préparer, Tirer, Fêter (`editionStep`) ; une fois le tirage fait, l'étape du milieu dit « Tirage fait ».
- **Préparer** : carte « À faire maintenant » avec la vérification (le tirage est possible, sinon pourquoi) et « Lancer le tirage », qui ouvre un panneau de confirmation (participants, règles, personnes du groupe absentes de l'édition). Puis la liste des participants (nombre d'idées, langue des messages), « Choisir les participants », et une section « Si tu veux » : prévenir avant le tirage, exclusions, « Réglages de l'édition » (la même ligne et la même page qu'après le tirage, 22.16).
- **Cas limites de « Préparer »** : sans participant, la carte dit « Ajoute les participants » (« Ajouter des participants », « Inviter par lien ») ; un tirage impossible a sa carte « À corriger avant le tirage » : une ligne par personne bloquée ou trop contrainte, la phrase d'aide, « Voir les exclusions » et « Ajouter des participants » à la place de « Lancer le tirage ».
- **Choisir les participants** (`…/editions/[id]/ajouter`, décidé par Julien le 16 novembre 2026, avant le tirage seulement) : un seul écran pour ajouter et retirer. Tous les membres actifs du groupe, une case par personne (`UiCheckRow`, toute la ligne coche), cochée si elle participe ; « Tout cocher » ; recherche et repli des longues listes ; « Créer une personne » (elle rejoint le groupe et l'édition, et revient cochée) et « Inviter par lien » ; « Enregistrer · N participants » dans un pied collant (`UiStickyFooter`), qui fait les ajouts et retraits (`participantChanges`) puis revient à l'édition. Après le tirage, l'adresse mène à l'édition.
- **Grands groupes** : au-delà de 10 participants, une recherche au-dessus de la liste ; au-delà de 12 (`FOLD_FROM`), la liste se replie (`listView`) : 6 lignes avant le tirage ; après, chaque série (`followSeries` : pas encore envoyé, pas encore consulté, résultat consulté) montre 3 lignes puis sa ligne de repli, qui rappelle l'état de la série. Le bouton de la carte dit « Prévenir les N par email ». L'écran d'envoi à plusieurs se replie après 5 lignes ; la sélection porte toujours sur toute la liste.
- **Noms** (décidé par Julien le 16 novembre 2026) : dans les écrans de l'organisateur et du super-admin (listes de membres et de participants, fiches, sélecteur de personne, envoi par email, exclusions), le nom de famille suit le prénom dès qu'il est renseigné (`fullName`) ; la recherche porte aussi sur le nom, le tri se fait par prénom puis par nom (`byName`). Côté participant (page du tirage, résultat, messages, journal), rien ne change : le prénom, et le nom seulement pour départager des homonymes (section 20, `displayName`).
- **« Devine qui »** (lot 19, 22.17) : dans « Réglages de l'édition », la section « Le jeu » et son panneau (`AdminGuessSheet` : trois modes, l'heure de fin dans le fuseau du navigateur, un second appui avant d'effacer des pronostics ; après un tirage à trois, seul « Aucun pronostic » reste, avec « À partir de quatre participants », `DevineReglageTrois`). Si le jeu est actif, « Lancer le tirage ? » et « Valider le tirage ? » disent, à trois, qu'il sera éteint. Sur le suivi, la carte du jeu (`AdminGameCard` : combien ont joué sur ceux qui n'ont pas passé leur tour, la fin, « Envoyer un rappel » puis « Dernier rappel le… » et « Rappeler encore », sans limite ; cinq jours avant la fin, s'il reste quelqu'un, cerclée de rouge avec « Leur rappeler », `DevineSuiviRelance` ; « Découvrir le palmarès » une fois dévoilé ; plus de carte après le dévoilement si personne n'a joué), la page « Rappeler le jeu » (`…/editions/[id]/rappel`, Correction 16, `DevineRappel`, `DevineRappelGroupe`) : un interrupteur « À chacun, par email » (l'aperçu, « Personnaliser le message », ceux qui n'ont pas encore joué cochés s'ils ont une adresse, « Ajouter » sinon, jamais ceux qui passent leur tour, la date du dernier rappel, « Envoyer {n} email(s) ») et « Au groupe » (un message sans nom ni lien personnel, « Partager », « Copier le message », `useGroupReminder`) ; « Personnaliser le message » ouvre `…/message?pour=rappel` ou `?pour=groupe` (`DevineRappelPersonnaliser`), sans « Quel message ». Dans le réglage du jeu, « Rappel automatique » et « Me tenir au courant » (`DevineReglage`). « Clôturer sans dévoiler » disparaît tant que le jeu est actif. `…/editions/[id]/palmares` : les images pour l'organisateur, sans « mon Père Noël ».
- **Tirage déjà fait ailleurs** (lot 17, 6.7) : sous « Lancer le tirage », sur toute la largeur de la carte (`UiActionCard`, `footer`), « Le tirage a déjà été fait ailleurs ? » ouvre `AdminStartAnswersSheet` (trois lignes d'explication, les exclusions non vérifiées, « Demander les réponses », « Pas encore »). L'étape « Réponses » (`AdminEditionAnswers`) : la carte (à prévenir, pas encore répondu, a répondu ; conflit avec les icônes et les prénoms ; une seule réponse manque ; prêt), la liste par statut de réponse (`useAnswerLook` : « Réponse à vérifier », « Pas encore demandé », « Demandé, pas encore répondu », « A répondu »), le bouton rond qui ouvre le panneau d'envoi sur Demande, Relance ou À vérifier, puis « Réglages de l'édition » et « Un souci ? » (22.16), dont le panneau propose de changer les participants et « Abandonner et tirer avec l'application » au second appui, et « Personne, organisateur compris, ne voit qui offre à qui. » « Valider » ouvre `AdminValidateAnswersSheet`. L'écran d'envoi à plusieurs coche d'abord ceux à qui le message choisi s'adresse (`preselectedForAnswers`).
- **Il faut au moins trois participants** (`MIN_PARTICIPANTS`) : à deux, chacun sait à qui l'autre offre.
- **Tirée** : carte « Préviens chacun que le tirage est fait » avec trois compteurs (à prévenir, pas encore ouvert, a découvert) et « Prévenir par email » (puis « Relancer par email ») vers l'écran d'envoi groupé. La liste met en tête ceux qui restent à prévenir (`sortParticipants`) ; le bouton rond de chaque ligne ouvre le panneau d'envoi, qui passe ensuite à la personne suivante.
- **Panneau d'envoi** (allégé le 16 novembre 2026, 22.14) : court, seulement de quoi envoyer : sous le titre, où en est la personne (« Envoyé le 14 nov., pas encore consulté ») ; le message entier choisi tout seul (`defaultMessageType` : l'invitation puis sa relance avant le tirage, « Tirage fait » puis la relance après, « Nouveau tirage » quand l'édition a été tirée de nouveau), « Personnaliser le message › » (qui rappelle la langue du message quand ce n'est pas celle de l'organisateur) ; puis l'email en premier s'il y a une adresse, sinon le partage du téléphone, avec la ligne « {Prénom} n'a pas d'adresse email » et son bouton « Ajouter » ; au renvoi, « Renvoyer par email » seul. « Autre moyen, ou un souci ? » remplace le contenu par une liste : partager, copier le message ou le lien seul, corriger l'adresse, puis le dépannage. Une fois le message parti (email, partage ou copie), le panneau se referme.
- **Personnaliser le message** (`…/editions/[id]/message?pour=`, une personne ou `plusieurs`) : quel message (trois segments), l'aperçu entier, « Un mot en plus » (placé selon la règle du groupe, 500 caractères), la langue du message pour une personne (enregistrée sur elle). « Valider » garde ces choix le temps de l'envoi (`useMessageChoice`, jamais en base) et ramène au panneau, qui dit alors « Modifier le message », ou à l'envoi groupé, sa sélection intacte (`useEmailSelection`). Rien n'est envoyé par « Valider ».
- **Fêter** (lot 13, README 22.9) : dès le jour de la fête, la carte devient « La fête est passée : dévoile les résultats » (« C'est le jour de la fête : … » le jour même), avec la barre des résultats consultés, « Dévoiler les résultats » et, à partir du lendemain, « Clôturer sans dévoiler » (second appui) ; « Pour l'instant, toi seul verras qui a offert à qui. » La liste du bas devient « En cas de pépin » : voir un seul résultat, annuler et relancer.
- **Dévoiler** : un panneau (`AdminRevealSheet`). Dès le jour de la fête : la fête a eu lieu, qui n'a pas consulté son résultat, « Toi seul verras la liste », « C'est définitif, et le journal du groupe l'indique », puis « Dévoiler les résultats » ou « Pas encore ». Avant la fête, depuis la ligne « Dévoiler les résultats » de « Plus tard » : l'encadré rouge « Le secret s'arrête ici, pour de bon », la phrase « dévoiler avant la fête » à recopier, « Attendre la fête » en vert et « Dévoiler quand même » en contour rouge, actif une fois la phrase recopiée.
- **Résultats dévoilés** (l'édition reste tirée jusqu'à sa clôture) : la frise entièrement faite, l'encadré « Résultats dévoilés », « Le tirage · N participants » (chaque paire, avec l'icône du receveur ; « Pour l'instant, toi seul vois cette liste »), les exclusions appliquées, le journal, « Clôturer l'édition » (second appui) et « Préparer l'édition suivante ».
- **Clôturée** : la frise entièrement faite (« Fêté »), « fêté le … » sous le titre, l'encadré « Édition clôturée », les paires du tirage (README 8.7), les lignes « Exclusions appliquées au tirage » et « Journal du groupe », puis « Préparer l'édition suivante ».
- **Annuler le tirage** (`…/annuler`) : l'encadré rouge « Tout le monde devra redécouvrir » (résultats effacés et combien les avaient vus, liste de nouveau modifiable, message « Nouveau tirage » à envoyer), ce qui reste (liens, listes de souhaits), le motif, la ligne que le journal affichera, la case « Je comprends… », puis « Garder ce tirage » en vert et « Annuler le tirage » en contour rouge, actif une fois le motif écrit et la case cochée.
- **Voir un seul résultat** (`…/voir-le-tirage`) : l'encadré « À n'utiliser qu'en dernier recours », le choix de la personne dans `UiPersonPicker` (recherche au-delà de 10), la ligne que le journal affichera avec son prénom, la phrase « JE VEUX VOIR LE TIRAGE » à recopier, la case « Je comprends… », puis « Voir le résultat de {Prénom} ». Le résultat (« Hugo offre un cadeau à » et le prénom en grand) reste à l'écran jusqu'à « Cacher et revenir à l'édition » ou « Voir un autre résultat ».
- **Sous la liste du suivi** (lot 18, 22.16 ; remplace « Plus tard, ou en cas de pépin ») : deux lignes, puis « Personne, organisateur compris, ne voit les résultats ici. » « Réglages de l'édition » (ce qui est réglé, « Budget 30 € · petit mot », sinon « Date, budget, petit mot ») ouvre la page `…/editions/[id]/reglages` : date de la fête, budget et petit mot, la valeur à droite, la date et le budget dans leur panneau, le petit mot sur sa page (`…/editions/[id]/mot`, Correction 18), en lecture seule une fois clôturée. « Un souci ? » ouvre un panneau (`AdminTroubleSheet`) : voir un seul résultat, dévoiler avant la fête (avant le jour de la fête, avec une date ; il ouvre le panneau de dévoilement forcé), annuler et relancer le tirage ; sans date, « Clôturer l'édition » (second appui), que rien d'autre ne propose alors. « Dévoiler les résultats » n'est plus sur la page avant la fête. Sans date, la carte « Quand a lieu la fête ? » vient sous la carte « À faire maintenant ». Le jour de la fête, les mêmes deux lignes, sans « Dévoiler avant la fête ».
- **Plus de fiche participant** (décidé par Julien le 16 novembre 2026 : elle doublait le panneau d'envoi). Avant le tirage, toucher une personne ouvre sa fiche dans le groupe (on y corrige un prénom, une adresse, une exclusion) ; après, le panneau d'envoi. Les réparations sont dans la liste « Autre moyen, ou un souci ? » (`AdminParticipantTroubleshoot`) : « Pas envoyé finalement ? » une fois un message parti, et « Régénérer son lien » (second appui). Retirer quelqu'un passe par « Choisir les participants ». L'adresse s'ajoute (« Ajouter ») ou se corrige (« La corriger ») sur place (`AdminEmailInline`) : une adresse refusée s'affiche en rouge sous le champ ; enregistrée, le panneau propose l'email en premier. L'ancienne adresse `…/participants/[id]` mène à l'édition, panneau ouvert sur la personne (`?envoyer=`).

---

## 12. API

Routes serveur Nitro (`server/api/**`, un fichier par méthode). Toutes les entrées validées par Zod. Les réponses ne contiennent que le strict nécessaire. Côté client, chaque route de lecture a son composable `useQuery` et chaque route d'écriture son `useMutation`, qui invalide les clés concernées.

### Participant

Le jeton du lien est le seul identifiant ; inconnu, mal formé ou régénéré, il reçoit le même 404 `link_invalid`.

| Méthode et route | Rôle |
|---|---|
| `GET /api/p/[token]` | État de la participation : prénom, icône, langue, groupe, édition, phase, date de la fête, budget et mot de l'organisateur (rien de secret, lot 16 bis), le réglage des pistes (`giftHints`), s'il en a laissé (`hasHints`), les pistes de la personne à qui il offre vues par lui (`receiverHints` : aucune, des pistes, nouvelles) et si une demande est encore possible (`canAskHints`). Pour un tirage fait ailleurs (6.7), `drawMode` et `answer` : sa réponse donnée ou non, et combien l'ont donnée, jamais laquelle. Le nombre d'alertes du journal depuis sa dernière visite (`journalAlerts`). Jamais le résultat. N'est pas compté comme une consultation |
| `POST /api/p/[token]/reveal` | Bouton « Découvrir ». Renvoie le receveur, le budget, la date, le message **et les pistes du receveur** (`hints` : réponses, textes, idées, demande déjà faite), , si elles sont nouvelles depuis la dernière ouverture et leur date (lot 16 bis), et si chacun a une adresse email (pour les mots sous la demande). Compte et journalise la consultation |
| `GET/PATCH /api/p/[token]/hints` | Ses pistes (réponses, textes, idées, demande en cours, édition à reprendre) ; une réponse ou un texte à la fois. Non journalisé. Refusé si l'édition est clôturée ou le groupe sans pistes |
| `GET /api/p/[token]/draw` | Un tirage dévoilé (22.18) : la personne à qui il offre (avec ses pistes, sans passer par « Découvrir » : rien n'est compté ni journalisé), celle qui lui offre, toutes les paires, et qui a dévoilé (« me », un prénom, ou personne de connu). `409 draw_not_revealed` avant le dévoilement |
| `POST /api/p/[token]/hints/copy` | « Reprendre mes pistes de {édition} », sur une page vide |
| `POST /api/p/[token]/hints/request` | « Lui demander des pistes » : une fois par tirage, après sa découverte (ou une fois le tirage dévoilé), quand le receveur n'a rien laissé. Anonyme, jamais journalisé ; email au receveur s'il a une adresse. Une fois le tirage dévoilé (22.18), l'email nomme celui qui demande |
| `GET /api/p/[token]/wishes` | Ses idées précises |
| `PUT /api/p/[token]/wishes` | Corps : la liste complète des idées précises. Remplace la liste, sans journal. Refusé si l'édition est clôturée ou le réglage n'est pas « portrait et idées précises » |
| `PUT /api/p/[token]/avatar` | Son icône (emoji et couleur), journalisé. Refusé si l'édition est clôturée |
| `PUT /api/p/[token]/language` | Sa langue préférée, journalisé |
| `GET /api/p/[token]/answer` | Tirage fait ailleurs (6.7) : les personnes qu'il peut nommer (tous sauf lui) et sa réponse, seulement quand il la demande. Tant que l'édition recueille les réponses |
| `PUT /api/p/[token]/answer` | Corps `personId` : dit à qui il offre, ou corrige. `invalid_answer` pour soi-même ou une personne hors de l'édition ; jamais d'erreur quand elle heurte celle d'un autre. Journalisé sans son contenu (`answer_given`, `answer_changed`) |
| `GET/PUT /api/p/[token]/guess` | « Devine qui » (22.17) : les personnes, ses propres pronostics, et, une fois le tirage dévoilé, le palmarès et ses pronostics corrigés. `PUT` (corps `recipientId`, `giverId` ou `null`) fait, change ou retire un pronostic tant que les pronostics sont ouverts ; une personne nommée ailleurs est déplacée. Jamais le pronostic d'un autre avant le dévoilement, jamais journalisé |
| `POST /api/p/[token]/guess/seen` | Le palmarès a été regardé jusqu'au bout |
| `POST /api/p/[token]/guess/skip` | « Je passe mon tour » (`skip: true`, refusé une fois qu'on a joué : `already_played`) ou « Finalement, je joue » (`skip: false`), tant que les pronostics sont ouverts (Correction 15). Faire un pronostic reprend aussi la partie. Jamais journalisé |
| `POST /api/p/[token]/journal-seen` | Le participant ouvre le journal : le compte des alertes de sa page repart de maintenant |
| `GET /api/p/[token]/journal` | Journal du groupe, dans sa langue : les lignes (avec leur personne, et ses lignes à elle à la deuxième personne), les personnes nommées avec leur icône, et `me` |

### Admin

Toutes ces routes exigent une session ; celles d'un groupe exigent d'en être l'organisateur ou d'être super-admin.

| Méthode et route | Rôle |
|---|---|
| `POST /api/auth/link` | Demande un lien de connexion (réponse identique dans tous les cas) |
| `GET /api/auth/link-email?token=` | L'adresse avec laquelle le lien connecte, sans le consommer ; `410` pour un lien inconnu, utilisé ou expiré |
| `POST /api/auth/confirm` | Consomme le lien, ouvre la session |
| `GET /api/auth/home` | L'accueil du compte : ses tirages (avec leur lien personnel, où ils en sont, s'ils ont laissé des pistes), les groupes qu'il organise (où en est l'édition, à prévenir, pas encore ouverts, tirage possible), son rôle et sa dernière demande (avec son texte) ; pour chaque tirage en cours, les alertes de son journal depuis la dernière visite (22.15) ; pour un super-admin, le nombre de demandes en attente et qui attend depuis le plus longtemps (nom, ou adresse). Jamais un résultat |
| `GET /api/auth/sessions`, `POST /api/auth/sessions/revoke-all` | Mon compte : appareils, tout déconnecter |
| `POST /api/admin/logout`, `GET /api/admin/session` | Déconnexion (révoque la session), session courante |
| `GET /api/admin/groups` | Les groupes du compte, chacun avec ses membres actifs et son tirage en cours (`draw` : état, participants, résultats ouverts ; `null` sans tirage en cours) |
| `POST /api/admin/groups` | Création par un super-admin ou un compte qui a de la place dans son quota (il en devient organisateur) |
| `POST /api/auth/group-requests` | Demande de groupe (une seule en attente), email aux super-admins |
| `GET /api/admin/accounts`, `PATCH /api/admin/accounts/[id]` | Super-admin : comptes (leurs groupes, organisés ou non, avec membres et tirage ; `requestRefused`) et demandes en attente ; quota, désactivation |
| `POST /api/admin/group-requests/[id]/decide` | Super-admin : accepte ou refuse une demande (`approve`, `note` facultatif), email au demandeur avec le mot |
| `PATCH /api/admin/groups/[id]` | Super-admin : nom |
| `GET/POST /api/admin/[groupe]/organizers`, `DELETE …/organizers/[compte]` | Organisateurs du groupe |
| `POST /api/admin/groups/[id]/delete` | Super-admin : supprime le groupe et tout ce qu'il contient ; corps `confirm` = identifiant du groupe |
| `GET /api/admin/[groupe]` | Accueil du groupe : éditions, édition en cours, règles |
| `GET/POST /api/admin/[groupe]/persons`, `PATCH/DELETE …/persons/[id]` | Personnes : prénom, nom, email, langue, icône, actif. Une adresse n'appartient qu'à une personne du groupe : la donner à une seconde est refusé (`409 email_taken`, `canUseEmail`), à la création, à la modification et quand on rattache un tirage à son compte. Suppression seulement si la personne n'a jamais participé |
| `POST /api/admin/[groupe]/exclusions`, `DELETE …/exclusions/[id]` | Exclusions |
| `GET/PATCH /api/admin/[groupe]/rules` | Règles du groupe |
| `GET /api/admin/[groupe]/journal` | Journal, dans la langue de l'administration, avec la personne de chaque ligne et les personnes nommées |
| `GET/POST /api/admin/[groupe]/editions` | Liste, création (avec reprise de l'édition précédente, 100 participants au plus ; le budget et le mot aux participants, s'ils sont donnés, sont les règles propres de l'édition dès sa création, sans ligne « règles modifiées » au journal) |
| `GET/PATCH /api/admin/[groupe]/editions/[id]` | Édition avec ses participants et leurs statuts (a laissé des pistes ou non, `hasHints`, jamais leur contenu), pendant le recueil des réponses d'un tirage fait ailleurs, le statut de chacun (`answerStatus`) et `answers` (la carte, les personnes en conflit, celle dont la réponse se déduit ; jamais une réponse), et `redrawn` : tirée de nouveau après une annulation (lu dans le journal, `draw_cancelled`), pour que le panneau d'envoi, « Personnaliser le message » et « Prévenir par email » proposent « Nouveau tirage » tout seuls (décidé par Julien le 17 novembre 2026) ; libellé et règles propres |
| `POST …/editions/[id]/draw`, `/redraw`, `/close` | Cycle de vie : tirer, annuler le tirage (motif obligatoire), clôturer. Le tirage refuse pendant le recueil des réponses (`collecting_answers`) |
| `PUT …/editions/[id]/guess` | « Devine qui » : `mode` (`none`, `santa`, `all`), `endsAt` (un instant) et `timeZone` ; refusé une fois le tirage dévoilé ou l'édition clôturée ; applique `changeGuessMode`  Correction 15 : `autoReminder` (le rappel automatique de l'édition) et `news` (« Me tenir au courant », propre à l'organisateur connecté, dans `group_members`) ; allumer le jeu note `guess_enabled_at` |
| `POST …/editions/[id]/guess/reminder` | Le rappel du jeu, autant de fois que l'organisateur veut (Correction 15), par email à ceux qui n'ont pas joué, n'ont pas passé leur tour et ont une adresse (mot facultatif) ; garde la date du dernier ; `participationIds` limite l'envoi à ceux cochés sur « Rappeler le jeu » (Correction 16) ; journalisé |
| `GET …/editions/[id]/guess/results` | Le palmarès pour l'organisateur, une fois le tirage dévoilé ; `GET …/editions/[id]` donne `guess` (mode, fin, ouvert, joueurs sur ceux qui n'ont pas passé leur tour, restant à rappeler, dernier rappel, rappel automatique, « Me tenir au courant » de l'organisateur connecté, relance suggérée) et, par participant, `played` et `skipped` par participant, jamais un pronostic. `close` refuse (`guess_game_on`) tant que le jeu est actif et le tirage pas dévoilé |
| `POST …/editions/[id]/answers/start`, `/answers/abandon`, `/answers/validate` | Tirage fait ailleurs (6.7) : recueillir les réponses, les abandonner (effacées), les valider en un tirage (`answers_not_ready` tant qu'elles manquent ou se heurtent, sauf une seule qui se déduit). Journalisé ; la réponse ne contient jamais de paire |
| `GET …/editions/[id]/check` | Le tirage est-il possible ? Sinon, pourquoi. Liste aussi les paires des éditions clôturées qui excluent |
| `POST/DELETE …/editions/[id]/history-waivers` | Lever une exclusion d'un tirage précédent pour cette édition ; tout rétablir |
| `POST …/editions/[id]/participants`, `DELETE …/participants/[participationId]` | Ajouter, retirer (avant le tirage) |
| `GET …/editions/[id]/messages?type=` | Textes prêts à partager pour chaque participant, dans sa langue, sans effet de bord |
| `POST …/editions/[id]/emails` | Envoi par email (13.3) : `type`, puis `participationIds` ou `audience` |
| `POST …/editions/[id]/reveal` | Dévoile les résultats, pour de bon (README 22.9) : édition tirée avec une date de fête ; avant la fête, seulement avec `early: true` (`party_not_reached` sinon). Journalisé : `draw_revealed` dès le jour de la fête, `results_revealed` avant (une alerte, 22.15), avec `meta.by`, la personne du groupe qui a dévoilé (22.18) ; ensuite le tirage ne s'annule plus (`results_revealed`) |
| `GET …/editions/[id]/results` | Qui a offert à qui, pour une édition **dévoilée ou clôturée** uniquement |
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
- **Le contexte, toujours** (Correction 17, `docs/refonte/TEXTES.md` section 15) : la première ligne dit que c'est le Secret Santa du groupe, l'objet d'un email nomme le groupe, « Devine qui » est présenté chaque fois qu'il apparaît. Un email envoyé par un organisateur est signé de son prénom (`sender`, le prénom de son compte) ; sans prénom, ou envoyé par l'application, « Le Secret Santa de {groupe} ». Côté participant, « tes organisateurs » au pluriel dès que le groupe en a plusieurs (`organizers` dans les réponses de la page du tirage, du jeu, du journal et de l'invitation ; `useOrganizers`).
- Les messages proposés suivent l'étape (`messageTypesFor`) : `invitation` et `reminder` avant le tirage, `drawn`, `reminder` et `redraw` après ; pendant le recueil des réponses d'un tirage fait ailleurs (6.7), `answerRequest`, `answerReminder` et `answerCheck`. L'API refuse les autres.
- Avant le tirage, l'écran de l'organisateur reste discret : aucun suivi d'envoi ni compteur. Le suivi commence au tirage, qui remet la pastille *envoyé* à zéro : une seule tournée de messages suffit pour jouer.

| Modèle (`type`) | Moment | Contenu |
|---|---|---|
| `invitation` | Avant le tirage, facultatif | « Salut Léa ! 🎁 Tu participes au Secret Santa de [groupe] ([édition]). Ouvre ton lien et laisse quelques pistes de cadeaux : [lien] » |
| `tirage` | Après le tirage | « Le tirage est fait ! Ouvre ton lien pour découvrir à qui tu offres un cadeau : [lien] » + budget et date s'ils sont renseignés |
| `relance` | Manuel | « Petit rappel Léa : ton lien t'attend, pense à l'ouvrir. Ton lien : [lien] » |
| `nouveau_tirage` | Après une relance du tirage | « Un nouveau tirage a eu lieu, ton ancien résultat n'est plus valable. Ton lien ne change pas : [lien] » |
| `answerRequest` (Demande) | Tirage fait ailleurs, pas encore demandé | « Salut Léa ! 🎁 Le tirage du Secret Santa de [groupe] ([édition]) a été fait hors de l'application. Dis sur ta page à qui tu offres un cadeau, pour voir ses pistes de cadeaux : [lien] » |
| `answerReminder` (Relance) | Demandé, pas encore répondu | « Léa, on n'attend plus que toi ! 🎁 Dis à qui tu offres un cadeau : dès que tout le monde a répondu, chacun voit les pistes de cadeaux de sa personne. [lien] » |
| `answerCheck` (À vérifier) | Sa réponse heurte celle d'un autre | « Léa, peux-tu vérifier ta réponse ? 🎁 Deux réponses du Secret Santa de [groupe] ne vont pas ensemble. Vérifie à qui tu offres un cadeau, et corrige-la si besoin : [lien] » |

### 13.3 Envoi groupé par email (v6)

Décision du 13 novembre 2026. Le partage par téléphone reste le fonctionnement par défaut ; l'email évite seulement à l'organisateur de partager chaque lien à la main.

- **Activation** : plus d'option. D'abord réservé aux groupes où le super-admin l'activait (colonne `groups.email_sending`, migration `0005`), l'envoi par email est ouvert à **tous les groupes** depuis le 14 novembre 2026 ; la colonne est supprimée par la migration `0010`. Raison : l'adresse d'un participant sert aussi à sa connexion, elle doit donc pouvoir être saisie partout.
- **Adresses** : `persons.email`, facultative, saisie par l'organisateur dans tous les groupes. Elle sert à l'envoi par email et permet à la personne de se connecter pour retrouver ses tirages (8.4).
- **Envoi** : `POST /api/admin/[groupe]/editions/[id]/emails`, corps `type` (un message de l'étape en cours) et `audience` (`unsent` par défaut, ou `all`). Écrit aux participants qui ont une adresse, pose la pastille *envoyé* et journalise `message_sent` avec `via: email`. 50 emails au plus par appel, le reste au suivant.
- **Fournisseur** : Resend (offre gratuite), domaine `under-the-tree.party` vérifié, un seul appel HTTPS par envoi groupé (`/emails/batch`), ce qui reste loin de la limite de 50 sous-requêtes du plan gratuit. Secret `NUXT_RESEND_API_KEY` ; sans clé, la route répond `email_not_configured` et rien d'autre ne change.
- **Contenu** : `buildEmail` dans `server/utils/messages.ts`, même texte que le message à partager, plus un objet et un jumeau HTML sobre. Jamais de résultat.
- **Délivrabilité, mesurée le 13 novembre 2026 sur Gmail** : SPF, DKIM et DMARC passent. Sans DMARC le premier essai est arrivé en spam ; avec, les mails arrivent dans l'onglet **Promotions**, mis en forme ou non. Le domaine venait d'être créé ; à remesurer plus tard. Seul Gmail a été testé. L'écran de l'organisateur prévient que les emails arrivent souvent en spam (formulation demandée par Julien). Conséquence : l'email est un complément, l'organisateur relance par téléphone ceux qui n'ouvrent pas leur lien.
- **Envoi individuel** : le bouton rond d'un participant ouvre le panneau d'envoi (section 11) : message, langue (enregistrée comme langue préférée de la personne), puis l'email s'il a une adresse, le partage du téléphone ou la copie.
- **Envoi à plusieurs** : un écran à part (`…/editions/[id]/emails`), à barre de titre (« Annuler », le titre et « {Groupe} · {Édition} » dessous) : en haut, « Aperçu, pour {premier coché} » avec le message entier et « Personnaliser le message › » ; puis la liste où ceux qui ont une adresse et restent à prévenir sont cochés d'avance (`preselectedForEmail`) et où toute la ligne coche, l'état de chacun avec son icône, un lien « Ajouter » pour ceux sans adresse ; la phrase sur le spam ; enfin « Envoyer N emails », seul dans le pied collant. L'API prend `participationIds` ; `audience` reste accepté.
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
│   │   ├── p/[token]/           ← participant : index, pistes (et sa question), journal
│   │   └── admin/               ← connexion, groupes, puis [slug]/ : accueil, personnes,
│   │                              exclusions, réglages, organisateur, journal, éditions/[id]/…
│   ├── components/
│   │   ├── ui/                  ← design system : PageTitle, SectionTitle, Card, List, ListItem, Avatar, TextPreview
│   │   ├── admin/               ← Screen, StatusCard, SendOptions, Exclusions, PersonForm, DateField…
│   │   ├── participant/         ← Screen, RevealCard, GiverHints, IdeasSection, WishList
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

**Un onglet resté ouvert après un déploiement** (Correction 11, 17 novembre 2026) : les fichiers de code (`/_nuxt/…`) changent de nom à chaque déploiement et les anciens disparaissent. Pour qu'un onglet ne reste pas sur l'ancienne version, avec des appuis sans effet :

- les pages HTML partent en `Cache-Control: no-cache` (`server/plugins/htmlCache.ts`), sauf celles qui ont déjà leur `no-store` ;
- le fichier qui annonce une nouvelle version (`/_nuxt/builds/latest.json`) est en `no-cache` aussi. Nitro lui donnait à la fois une seconde et l'année des autres fichiers, que Cloudflare joignait : une règle ajoutée à la fin de `_headers` au build (`nuxt.config.ts`) retire les deux ;
- les fichiers de code gardent leur cache d'un an ;
- Nuxt recharge la page quand le code d'un écran manque, ou à la navigation suivante quand une nouvelle version est annoncée (comportement par défaut, gardé).

Testé par `tests/e2e/deploy.spec.ts`.

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
- **Clés anglaises dans le code**, textes dans les dictionnaires. Règles : `excludePreviousYears`, `budget`, `eventDate`, `guardianMessage`, `giftHints` (ex-`wishlist`), `maxWishes` (`rules.ts`, schéma Zod = source de vérité, `mergeRules(groupRules, override)`). Types de message : `invitation`, `drawn`, `reminder`, `redraw` (`messages.ts`).
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
- Le journal renvoyé au participant ne contient que des phrases (`journalEntries`), jamais le `meta` brut. Le composant `JournalView` et `loadJournal` servent aussi côté organisateur.
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
- Cas impossibles détectés avec un message exploitable : moins de 3 participants, 3 participants dont un couple, 4 participants en 2 couples avec exclusion de l'an dernier qui bloque tout.
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

### Pistes de cadeaux

- `server/utils/hints.test.ts` et `shared/utils/hints.test.ts` : une réponse est une valeur fixe (`first`, `second`, `both`), cinq questions sans les idées précises, une étiquette par réponse tranchée, un texte de plus de 300 caractères est refusé ; qui peut écrire (jusqu'à la clôture, idées précises seulement en `full`) ; qui peut demander (après le tirage, une fois, quand le receveur n'a rien) ; l'email à celui qui a demandé part une fois ; les deux emails ne nomment ni celui qui demande ni le receveur.
- La normalisation des idées (`wishes.ts`) rejette : plus de `maxWishes` idées, un libellé vide ou de plus de 200 caractères, une URL qui n'est pas `http`/`https`, et renvoie des positions contiguës à partir de 0.
- `PUT /wishes` et `PATCH /hints` sur une édition clôturée sont refusés ; selon le réglage, les idées (`portrait`) ou tout (`none`).
- `POST /reveal` renvoie les pistes du receveur et uniquement les siennes ; les routes admin disent seulement `hasHints` (`security.spec.ts`).
- Une demande de pistes ne change rien de ce que lit l'organisateur ni le journal, une seconde est refusée, et l'annulation du tirage l'efface (`hints.spec.ts`).
- Après une annulation et relance du tirage, les pistes sont intactes.

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
| Reprendre les pistes de l'an dernier ? | Pas automatiquement : « Reprendre mes pistes de {édition} » sur une page vide (6 bis.1) |
| L'organisateur peut-il voir le contenu des pistes de cadeaux ? | Non, seulement si la personne en a laissé (voir 6 bis.2) |

---

## 21. Langues (v7)

Français, anglais, allemand. Le français reste la langue de référence et la langue par défaut.

### 21.1 Qui voit quelle langue

| Où | Langue |
|---|---|
| Page personnelle, pistes de cadeaux, journal du participant | Langue préférée de la personne (`persons.language`, migration `0006`, `fr` par défaut) |
| Messages à partager et emails | Langue préférée du **destinataire**, pas celle de l'organisateur |
| Administration | Choix du visiteur, gardé dans un cookie `locale` sur l'appareil ; à défaut, langue du navigateur ; à défaut, français |
| Lien invalide | Cookie ou langue du navigateur (on ne sait pas qui c'est) |

L'organisateur règle la langue d'une personne sur sa fiche. Le participant la change lui-même depuis sa page (`PUT /api/p/[token]/language`) : c'est enregistré comme sa préférence, donc ses prochains messages suivent.

### 21.3 Autres décisions du 13 novembre 2026 (soir)

- **Date de la fête** : saisie avec un sélecteur de date (Nuxt UI `UInputDate` + `UCalendar`, le 25 décembre de l'année proposé en un geste), stockée en jour ISO dans `eventDate`. Elle est écrite dans la langue de chacun (messages, emails, page de résultat). Une ancienne valeur en texte libre reste affichée telle quelle. Le bouton **« Clôturer » n'apparaît qu'à partir du lendemain** de cette date ; sans vraie date, il reste disponible.
- **Exclusions après le tirage** : l'écran d'une édition tirée ou clôturée affiche les exclusions **appliquées au tirage** (`rules_snapshot`), plus celles du groupe, qui ont pu changer depuis.
- **Suppression d'un groupe** : super-admin uniquement, `POST /api/admin/groups/[id]/delete` avec l'identifiant du groupe à recopier. Efface le groupe, ses personnes, exclusions, éditions, tirages, pistes de cadeaux et journal, en une transaction. Irréversible.
- **Barre du haut de l'administration** : logo toujours visible, un seul menu (langue, déconnexion), chemin réduit aux niveaux parents.
- **Avatars** : emoji de marché de Noël ajoutés (bretzel, vin chaud, marrons…), puis six emoji retirés le 14 novembre 2026 ; il en reste 30. Une icône enregistrée avec un emoji retiré est remplacée par une icône par défaut, la couleur étant gardée.

### 21.2 Comment c'est fait

- **Dictionnaires typés** dans `shared/i18n/locales/<langue>/<domaine>.ts`, partagés par le serveur et les écrans. Le français est la référence ; les autres langues se terminent par `satisfies Dict<typeof fr>`, donc une clé manquante ou en trop ne compile pas.
- **Pas de bibliothèque d'i18n.** `translate(locale, clé, params)` (`shared/i18n/index.ts`) tient en quelques dizaines de lignes : substitutions `{nom}`, pluriels `{ one, other }` choisis par `Intl.PluralRules`, repli sur le français puis sur la clé. Raison : le serveur a besoin des mêmes textes que les écrans (messages, emails, journal), et les clés sont vérifiées à la compilation des deux côtés. C'est un écart assumé au « standard de l'industrie » de la section 7.1.
- **Élision** (décidée par Julien le 17 novembre 2026) : en français, « de » et « que » devant une substitution s'élident quand la valeur commence par une voyelle ou un h (« le lien d'Inès », « d'Hugo », « ce qu'Agathe recevra », mais « de Louis », « de Yann ») ; `shared/i18n/elision.ts`, appliquée par `translate`, donc partout. Rien ne change en anglais ni en allemand.
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
- `group_requests` : demande de création de groupe (compte, message, état, date de décision, mot du super-admin).

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

### 22.9 Fait : « Dévoiler les résultats » à l'étape Fêter (15 novembre 2026)

Idée de Julien, cadrée le 15 novembre 2026. **Codé le 17 novembre 2026** (lot 13 de la refonte : colonne `editions.revealed_at`, migration `0018`, `POST …/reveal`, événement `draw_revealed`, écrans « Fêter », « Dévoiler », « Résultats dévoilés » ; section 11). Une édition clôturée sans être dévoilée garde ses paires visibles pour l'organisateur (8.7 inchangé, décidé par Julien le 17 novembre 2026) : la maquette « Clôturée sans dévoiler » n'est pas suivie. Maquettes : même canevas qu'en 22.8 (écrans « Étape 2 · Dévoiler avant la fête », « Étape 3 · Fêter, à dévoiler », « Confirmation du dévoilement », « Résultats dévoilés »).

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
| **Qui voit** | **Tout le groupe**, depuis le 18 novembre 2026 (22.18, Correction 13). Avant : pour le moment, **l'organisateur seul**. Plus tard : sert de base au mode prédictions (22.3) ; sans prédictions, la liste sera visible depuis la page personnelle d'un tirage |

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
| 2 | Super-admin | Au moins une demande de groupe en attente | N demandes de groupe à traiter, « Léa Martin attend ta réponse depuis le 14 novembre » | « Voir la demande » (ou « Voir les demandes ») → administration |
| 3 | Participant | Tirage fait, résultat jamais découvert | Le tirage est fait ! | « Découvrir à qui j'offre un cadeau » → page du tirage |
| 3 ter | Participant | Tirage fait ailleurs (6.7), sa réponse pas encore donnée ; classé avant 3 bis | À qui offres-tu un cadeau ? | « Dire à qui j'offre » → page du tirage |
| 3 bis | Participant | Tirage fait, de nouvelles pistes de la personne à qui il offre (lot 16 bis) | De nouvelles pistes pour ton cadeau | « Lire ses pistes » → page du tirage |
| 4 | Organisateur | Tout le monde prévenu, fête dans 7 jours ou moins, au moins une personne n'a pas consulté | N personnes n'ont pas encore ouvert leur lien | « Relancer » → édition |
| 5 | Organisateur | Édition à préparer, tirage impossible | Le tirage est impossible pour l'instant | « Corriger » → édition |
| 5 bis | Organisateur | Tirage fait ailleurs, deux réponses se heurtent | Deux réponses ne vont pas ensemble | « Ouvrir l'édition » → édition |
| 5 ter | Organisateur | Tirage fait ailleurs, tout concorde, ou une seule réponse manque et se déduit | Les réponses vont ensemble : valide le tirage | « Ouvrir l'édition » → édition |
| 6 | Organisateur | Édition à préparer, tirage possible | Vérifie la liste, puis lance le tirage | « Ouvrir l'édition » → édition |
| 6 bis | Organisateur | Tirage fait ailleurs, des réponses attendues | Demande à chacun à qui il offre, « N réponses attendues » | « Ouvrir l'édition » → édition |
| 7 | Participant | Pistes de cadeaux actives, aucune piste, édition non clôturée | Laisse tes pistes de cadeaux | « Mes pistes » → pistes de cadeaux |
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

Lot 17 (17 novembre 2026) : pour un tirage fait ailleurs, la route donne aussi, par édition organisée, la carte des réponses et leur nombre (`answers`, sans la vérification du tirage, qui n'a pas lieu), et par tirage si la réponse est à donner ou donnée (`answer`). Les lignes de tirage disent « Ta réponse est attendue » (avec « Répondre ») ou « C'est noté », la carte d'un groupe « Réponses · 3 sur 5 ».

Avec un seul tirage en cours et aucun groupe organisé, la carte du tirage tient lieu de carte du haut : les rangs 3, 3 ter et 7 (qui le concernent) n'en ajoutent pas une seconde. Tout le haut de cette carte ouvre la page du tirage, même avant le tirage, quand elle n'a pas de bouton.

### 22.11 Fait : « Pistes de cadeaux », à la place de la liste de souhaits (16 novembre 2026)

**Codé le 17 novembre 2026**, puis mis en avant par le lot 16 bis (6 bis.4 : nouvelles pistes, email à celui qui offre même sans demande, carte de l'accueil, budget et mot hors de la carte du résultat) (lot 16 de `docs/refonte/PLAN.md` : migration `0019`, tables `gift_portraits` et `hint_requests`, routes `…/hints`, écrans `/p/[token]/pistes`, réglage à trois valeurs ; décrit en 6 bis, 9, 11 et 12). Réponses de Julien du 17 novembre 2026, codées le même jour : les anciennes lignes `wishes_updated` restent en base, cachées ; qui demande des pistes n'est pas stocké, le donneur est retrouvé en déchiffrant le tirage au moment de l'email (migration `0020`) ; chez celui qui offre, des phrases plutôt que des étiquettes (« Inès préfère : », une ligne grise « … : peu importe. » par « Les deux me vont ») ; sur sa page, chaque étiquette ouvre sa question ; « Neuf, ou d'occasion ? » a désormais « Les deux me vont », comme les autres (étiquettes « D'occasion, volontiers », « Plutôt du neuf », « Neuf ou d'occasion » ; chez celui qui offre « D'occasion ou fait main, volontiers. », « Plutôt du neuf que de l'occasion. », « Neuf ou d'occasion : peu importe. ») ; cinq questions avec le réglage « Portrait seulement » (sans « Surprends-moi »). Maquettes dans `docs/refonte/maquettes/Pistes*.html`.

Conception validée par Julien le 16 novembre 2026. C'est la prochaine fonctionnalité, avant le tirage déjà fait (22.12). Maquettes : https://claude.ai/artifact/6XYdmH9di9ctyAZxzLD9Ns, page « Pistes de cadeaux » (11 écrans).

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

### 22.12 Fait : tirage déjà fait ailleurs (16 novembre 2026)

**Codé le 17 novembre 2026 : lot 17 de `docs/refonte/PLAN.md`, décrit en 6.7.** Maquettes dans `docs/refonte/maquettes/Manuel*.html`.

Conception validée par Julien le 16 novembre 2026, **remplace 22.6**. Maquettes : même canevas, page « Tirage déjà fait » (12 écrans).

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
| Page du participant en attente | « C'est noté », avec l'avancement (« 3 réponses sur 5 ») |
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

### 22.14 Décidé : le panneau d'envoi allégé (16 novembre 2026)

Remarque de Julien du 16 novembre 2026 : le panneau « Envoyer à {prénom} » était très chargé, plus encore au renvoi. Trois pistes ont été dessinées (A, deux lignes d'aperçu et « Personnaliser » ; B, les boutons d'abord ; C, un écran entier) ; **la piste A est retenue, pour l'envoi comme pour le renvoi**. Elle est décrite dans `docs/refonte/PLAN.md`, « Correction 7 », et dans les maquettes `Envoi`, `EnvoiPersonnaliser`, `EnvoiSansEmail`, `EnvoiAjouterEmail`, `Renvoi`, `RenvoiPepin`.

En bref, version hybride : le panneau reste court (l'en-tête, le message entier, les boutons d'envoi, une ligne « Autre moyen, ou un souci ? ») et le lien « Personnaliser le message » ouvre un écran à part (choix du message, mot à ajouter, langue), le même pour l'envoi à plusieurs. L'écran d'envoi à plusieurs devient une seule page, avec le seul bouton « Envoyer » collé en bas. Le message est choisi tout seul selon la situation. Tout ce qui est rare (autres chemins, correction d'adresse, dépannage) est dans la liste qu'ouvre cette ligne. L'enchaînement d'une personne à la suivante est supprimé : les groupes où l'on prévient beaucoup de monde à la main seront rares, et l'envoi par email à plusieurs couvre ce cas.

Écartées : B (on envoie sans avoir le texte sous les yeux) et C (un écran entier fait quitter la liste). Non retenue non plus : l'envoi direct par le bouton rond avec « Annuler », parce qu'un email parti ne se rattrape pas.

Sous le titre, l'en-tête dit où en est la personne ; une fois le lien parti et pas encore ouvert, avec le jour du dernier envoi : « Envoyé le 14 nov., pas encore consulté » (décidé par Julien le 17 novembre 2026). Pas le moyen d'envoi, que l'application ne connaît pas toujours.

### 22.15 Fait : le journal signalé depuis l'accueil (17 novembre 2026)

**Codé le 17 novembre 2026** (lot 14 de `docs/refonte/PLAN.md`) : la route de l'accueil donne, pour chaque tirage en cours, `journal` (`journalSignal` : le nombre d'alertes depuis la dernière ouverture du journal et, seule, l'alerte avec sa date) ; `HomeJournalSignal` dans la carte du tirage (ou la carte du haut quand elle parle de ce tirage), « Du nouveau au journal » avec un point ambré sur la ligne d'un autre tirage. Le lien ouvre le journal sur l'explication de l'alerte (`?alerte=`), ce qui remet le compte à zéro. Maquettes dans `docs/refonte/maquettes/` : `FuturAccueilJournal` (lien régénéré), `FuturAccueilJournalAcces` (accès de dernier recours), `FuturAccueilJournalDeux` (plusieurs alertes : une seule ligne, « 2 alertes depuis ta dernière visite », qui mène au journal), `FuturAccueilJournalPlusieurs` (plusieurs tirages : si l'alerte concerne le tirage de la carte, le signal est dans la carte ; sinon il remplace le sous-titre de la ligne du tirage concerné, avec un point ambré, et la ligne mène à la page du tirage), `FuturAccueilJournalOrganisateur` (quelqu'un qui organise un groupe et participe à un autre : même règle, le signal est sur la ligne « Mon tirage » du groupe concerné).

Pas de lien permanent vers le journal sur l'accueil : le journal appartient à un groupe et non au compte, il ne contient le plus souvent rien de notable, et l'accueil sert à savoir où en est son tirage. À la place, un signal sur la carte du tirage, seulement quand le journal contient une alerte que la personne n'a pas encore vue :

| Événement du journal | Ce qui s'est passé | Qui voit le signal | Maquette |
| --- | --- | --- | --- |
| `result_revealed` | L'organisateur a regardé un résultat (dernier recours) | Tout le groupe | `FuturAccueilJournalAcces` |
| `results_revealed` | Les résultats ont été dévoilés avant la fête | Tout le groupe | `FuturAccueilJournalDevoile` |
| `draw_cancelled` | Le tirage a été annulé | Tout le groupe | `FuturAccueilJournalAnnule` |
| `link_regenerated` | Son lien a été régénéré | Elle seulement | `FuturAccueilJournal` |

Ce sont les trois événements qui ont déjà un panneau d'explication dans le journal, plus le lien régénéré pour la personne concernée. Aucun autre événement ne déclenche de signal (liens envoyés, copiés ou partagés, résultats découverts, participants, règles, icône, langue, clôture). L'organisateur n'a pas de signal sur « Gérer le tirage » : ces alertes viennent de ses propres actions.

Limite connue : si l'organisateur copie le lien de quelqu'un et l'ouvre à sa place, le journal ne note que « lien copié » puis « résultat découvert ». Le signal ne le détecte pas ; il faudrait savoir depuis quel appareil le résultat a été ouvert.

Le signal est une ligne dans la carte, sous le bouton principal (« Du nouveau au journal. Ton lien a été régénéré le 16 novembre. »), qui mène droit à l'explication de l'alerte. Il disparaît une fois l'alerte vue. C'est le prolongement de la ligne « Journal du groupe · 1 alerte depuis ta dernière visite » de la page d'un tirage, et il s'appuie sur la même information.

### 22.16 Fait : des pages plus claires, avec moins de lignes en bas (17 novembre 2026)

Conception validée par Julien le 17 novembre 2026. Lot 18 de `docs/refonte/PLAN.md`, **codé le 17 novembre 2026** : `AdminTroubleSheet`, la page `…/editions/[id]/reglages`, `UiTile` et `ParticipantJournalRow` (section 11). **Compléments du même jour**, demandés par Julien : la ligne « Réglages de l'édition » aux trois étapes (`AdminEditionSettingsRow`) ; à « Préparer », elle remplace le budget et le petit mot de « Si tu veux » ; à « Réponses » (22.12), « Réglages de l'édition » et « Un souci ? » remplacent « Plus tard, ou en cas de pépin », le panneau proposant de changer les participants et d'abandonner ; sans piste, la tuile disparaît après la clôture ; les six illustrations redessinées (23.2). Les maquettes courantes sont à jour (`Suivi*`, `EditionReglages`, `Souci`, `Tirage*`) ; `DevineSuivi`, `DevineTirage` et `PropEditionReglages` montrent les mêmes pages avec le jeu de 22.17.

**Pourquoi** : chaque nouveauté a été ajoutée comme une ligne de plus en bas d'une liste. Les deux listes mélangent des choses sans rapport, donc rien ne ressort.

**Le suivi de l'organisateur** (`DevineSuivi`). La liste « Plus tard, ou en cas de pépin » disparaît. À sa place :

| Élément | Contenu |
|---|---|
| La carte du jeu | Sous la liste des participants, quand un jeu est actif : « Le jeu de cette édition », son nom, son avancement. Elle ouvre son réglage |
| « Réglages de l'édition » | Une ligne, qui ouvre une page à part (`PropEditionReglages`) : date, budget, petit mot, jeu |
| « Un souci ? » | Une ligne, qui ouvre un panneau (`Souci`) : voir un seul résultat, dévoiler avant la fête, annuler et relancer le tirage |

« Dévoiler les résultats » n'est plus sur cette page avant la fête : c'est l'étape « Fêter » de la frise. La version forcée est dans « Un souci ? ». Les réglages du groupe ne gardent que ce qui vaut pour toutes les éditions.

**La page du tirage du participant** (`DevineTirage`). La liste du bas disparaît. À sa place, des tuiles sur deux colonnes, une par chose à faire (« Mes pistes de cadeaux », « Devine qui », et les suivantes) : la tuile qui attend une action est cerclée de rouge avec son appel (« Fais ton pronostic »), celle qui est faite porte une coche. « Journal du groupe » reste une ligne à part sous les tuiles, encadrée et bien visible ; en cas d'alerte (lots 12 et 14) elle passe au-dessus, en ambre. Une tuile n'existe que si la fonctionnalité est active pour l'édition ; une tuile seule prend toute la largeur.

### 22.17 Fait : « Devine qui », le jeu de pronostics (17 novembre 2026)

Conception validée par Julien le 17 novembre 2026, à partir de l'idée « mode prédictions » de 22.3. Lot 19 de `docs/refonte/PLAN.md`, **codé le 17 novembre 2026** (voir « Côté code » à la fin de cette section). Maquettes : `docs/refonte/maquettes/Devine*.html`.

**Principe** : après le tirage, chacun peut pronostiquer qui offre à qui. Les réponses tombent à la fête, quand le tirage est dévoilé.

| Sujet | Décision |
|---|---|
| Vocabulaire | Le jeu s'appelle « Devine qui ». On dit « pronostic », jamais « pari » |
| Réglage | Par édition, par l'organisateur, repris de l'édition précédente : « Aucun pronostic » (par défaut), « Qui m'offre ? » (un seul pronostic : son propre Père Noël), « Toutes les paires » (celui-là, plus un par autre participant, autant qu'on veut) |
| Conditions | Une date de fête, et une heure de fin des pronostics ce jour-là, demandée dans le réglage. **Au moins quatre participants** (Correction 12) : à trois, le tirage est forcément une boucle, chacun sait donc qui lui offre et il n'y a rien à deviner. Avant le tirage, le réglage reste libre ; si le tirage se fait à trois, le jeu est éteint et la confirmation du tirage le dit. Après un tirage à trois, le réglage est grisé avec l'explication (`DevineReglageTrois`) |
| Qui joue | Chaque participant, librement. Rien n'est obligatoire |
| Changer d'avis | Jusqu'à la fin des pronostics |
| Un Père Noël, un seul destinataire | En mode « Toutes les paires », choisir une personne déjà choisie pour quelqu'un d'autre déplace le pronostic ; la liste le dit (« Ton pronostic pour Hugo ») |
| Se nommer soi-même | En mode « Toutes les paires », chacun peut se choisir (« Moi ») comme Père Noël de n'importe qui, sauf sur sa propre ligne (décidé par Julien le 18 novembre 2026). La ligne de la personne à qui j'offre compte comme les autres : y mettre « Moi » est un bon pronostic, qui compte pour le classement et le détective. Les prix sur les Pères Noël (le plus transparent, les mieux cachés, le suspect idéal) ne tiennent pas compte des pronostics où l'on s'est nommé soi-même. Remplace le leurre, qui ne comptait jamais |
| Fin des pronostics | À l'heure choisie le jour de la fête, ou dès que le tirage est dévoilé si c'est plus tôt |
| Les réponses | Quand l'organisateur dévoile le tirage (22.9), ou automatiquement le lendemain de la fête, à l'heure de fin des pronostics, s'il ne l'a pas fait |
| Clôturer sans dévoiler | N'est plus proposé tant que le jeu est actif. Éteindre le jeu efface les pronostics |
| Tirage annulé | Les pronostics sont effacés |
| Avant la fête | Personne ne voit rien : ni score, ni tendance, ni pronostic d'un autre. L'organisateur voit combien ont joué et qui n'a pas encore joué, jamais un pronostic |
| Journal | L'activation du jeu, la fin des pronostics, et « le palmarès est arrivé ». Jamais un pronostic |
| Communication | Une ligne dans le message « tirage fait », puis tout ce que décrit « Donner envie de jouer, et rappeler » plus bas (Correction 15) |
| Changer de mode | Passer de « Qui m'offre ? » à « Toutes les paires » garde les pronostics. Le chemin inverse efface tous les pronostics sauf celui de son propre Père Noël, après confirmation |
| Heure de fin | Enregistrée comme un instant précis, dans le fuseau du navigateur de l'organisateur au moment du réglage. Chacun la voit dans son propre fuseau |
| Date de fête | Ne peut pas être retirée tant que le jeu est actif : il faut d'abord éteindre le jeu |
| Le rappel | L'organisateur rappelle quand il veut, autant de fois qu'il veut (Correction 15 ; avant : un seul par édition). La carte du jeu affiche « Dernier rappel le… » et « Rappeler encore » (`DevineSuiviRappelFait`) |
| L'email du palmarès | Au dévoilement, manuel ou automatique, un email « Le palmarès de Devine qui est arrivé » (`DevineEmailPalmares`) part à tous les participants qui ont une adresse, joueurs ou non. Aucun nom dedans, une seule fois. Pas d'email si personne n'a joué |
| Qui voit le palmarès | Tous les participants, même ceux qui n'ont pas joué, et l'organisateur même s'il ne participe pas ; pour lui, l'écran « mon Père Noël » est sauté |
| Édition passée | Le palmarès reste figé sur les participants de l'édition, même si le groupe a changé depuis |
| Limite connue | Un organisateur qui a regardé un résultat en dernier recours peut tricher sur son pronostic ; le journal le montre déjà |

**Le palmarès**

- **Les prix** (Correction 14, 18 novembre 2026) : douze prix possibles, chacun avec son calcul et sa condition d'affichage. Un prix dont la condition n'est pas remplie est sauté : selon le groupe et la partie, le palmarès n'est jamais tout à fait le même. Le détail est dans « Les prix, un par un », plus bas.
- **Ex æquo** : jusqu'à trois gagnants, le prix passe au pluriel et les nomme tous ; au-delà, il devient une phrase avec un nombre, sans nom ; un prix sans personne ne s'affiche pas. Pas de dernier du classement.
- **Mode « Qui m'offre ? »** : chaque ligne n'a qu'un pronostic au plus, donc les conditions d'affichage écartent d'elles-mêmes les prix qui comparent (détective, sans-faute, mieux caché, plus transparent, rumeur, jumeaux). Restent possibles : « Démasqués », « Le suspect idéal », « Sur le fil », « La girouette », « Si près du but » et « Le score du groupe ».
- **Un ou deux joueurs : le petit palmarès** (Correction 12). Les prix qui comparent n'ont pas de sens à si peu, mais la révélation reste un bon moment. Les images se réduisent à quatre écrans : l'ouverture, le suspense, « mon Père Noël » (`DevineStoryPetit`) et la fin. Aucun écran de prix, pas de classement. Tout le reste est identique au grand palmarès : la page des réponses (`DevinePalmares`, `DevinePalmaresVu`), les invitations, l'email, le vert sapin.
- **Aucun joueur** : rien du jeu n'apparaît après le dévoilement, ni tuile, ni invitation, ni email, ni ligne « le palmarès est arrivé » au journal. Il n'existe plus de page « pas de palmarès cette fois ».
- **Édition à trois participants où le jeu était déjà actif** avant la Correction 12 : petit palmarès, quel que soit le nombre de joueurs.

**Donner envie de jouer, et rappeler** (Correction 15, 18 novembre 2026). Le palmarès récompense ; il manquait de quoi faire entrer dans le jeu.

| Levier | Règle | Maquette |
|---|---|---|
| Le bon moment | Juste après avoir découvert à qui j'offre, sous le résultat, une carte cerclée de rouge : « Et toi, qui t'offre ton cadeau ? », le compte des joueurs, « Faire mon pronostic », « Je passe mon tour ». Tant que je n'ai ni joué ni passé mon tour | `DevineInviteResultat` |
| Les autres jouent | « 4 sur 6 ont déjà joué » sur la tuile, la carte de l'accueil et la carte du résultat. Un simple compte, sur ceux qui n'ont pas passé leur tour. Affiché dès qu'au moins deux personnes ont joué | `DevineTirageFin`, `DevineAccueilFin` |
| L'échéance | « Plus que 3 jours » sur la tuile et la carte, dans les sept derniers jours ; « Dernier jour » le jour même | `DevineTirageFin`, `DevineAccueilFin` |
| La surprise | **Les prix restent une surprise** (Julien, 18 novembre 2026) : avant la fête, rien dans l'application ni dans les emails ne nomme un prix, ni ne dit combien il y en a. La page du jeu dit seulement « Une surprise attend le groupe à la fête. Plus vous êtes nombreux à jouer, plus elle sera belle. » | `DevineUniquePrix` |
| Où j'en suis | Une fois qu'on a joué, en mode « Toutes les paires » : « 3 pronostics sur 5 », une barre de progression, et un encouragement à finir le tour. Aucun prix nommé, jamais un score, jamais une tendance | `DevinePairesCourse` |
| Le défi | À partir de la deuxième édition avec le jeu : « L'an dernier, 3 personnes sur 6 avaient deviné leur Père Noël. À battre. » Seul ce chiffre de l'an dernier est cité | `DevineUniquePrix` |
| Je passe mon tour | Un lien sur la carte du résultat, la carte de l'accueil, la page du jeu et en bas de l'email de rappel. Celui qui passe son tour n'est plus rappelé, sort de la liste « n'a pas encore joué » de l'organisateur et des comptes ; sa tuile dit « Tu passes ton tour ». Il peut revenir jusqu'à la fin (« Finalement, je joue »), et il voit le palmarès comme les autres | `DevinePasse` |

Les rappels :

| Rappel | Règle | Maquette |
|---|---|---|
| Automatique, aux joueurs | Un seul, 48 heures avant la fin, à 10 h dans le fuseau du réglage. À ceux qui ont une adresse, n'ont pas passé leur tour, et n'ont pas joué ; en mode « Toutes les paires », aussi à ceux qui n'ont pronostiqué que leur Père Noël, avec un autre texte. Pas envoyé si le jeu a été activé moins de trois jours avant la fin, ni si l'organisateur a rappelé dans les deux derniers jours. Le lien arrive sur l'écran du pronostic | `DevineEmailRappelAuto`, `DevineEmailRappelEncore` |
| Manuel, par email | Une **page** « Rappeler le jeu », plus un panneau (trop haut sur mobile), bâtie comme « Envoyer par email » : un interrupteur à deux positions en haut, « À chacun, par email » et « Au groupe ». Sur la première : l'aperçu du message, « Personnaliser le message » qui ouvre un écran à part, la liste de ceux qui n'ont pas encore joué (cochés s'ils ont une adresse, « Ajouter » sinon ; jamais ceux qui passent leur tour), la date du dernier rappel, et un seul bouton en bas, « Envoyer 1 email ». Autant de fois que l'organisateur veut | `DevineRappel`, `DevineRappelPersonnaliser` |
| Manuel, au groupe | La seconde position de l'interrupteur : le message pour le groupe, « Personnaliser le message », puis « Partager » et « Copier le message ». Il donne le compte et l'échéance, ne nomme personne et ne contient aucun lien personnel. C'est aussi le moyen de toucher ceux qui n'ont pas d'adresse | `DevineRappelGroupe` |
| La relance suggérée | Sur le suivi, cinq jours avant la fin, s'il reste quelqu'un à rappeler : la carte du jeu passe en avant, cerclée de rouge, avec « 2 personnes n'ont pas encore joué. Fin dans 5 jours. » et un bouton « Leur rappeler » | `DevineSuiviRelance` |
| À l'organisateur, point d'étape | Un email cinq jours avant la fin, seulement s'il reste quelqu'un à rappeler : qui n'a pas joué, qui n'a pas d'adresse, quand part le rappel automatique | `DevineEmailOrgaPoint` |
| À l'organisateur, fermeture | Un email à la fin des pronostics : combien ont joué, « Dévoiler le tirage », et le rappel que le tirage se dévoilera seul le lendemain | `DevineEmailOrgaFin` |

Deux réglages, dans le réglage du jeu, activés par défaut (`DevineReglage`) : « Rappel automatique » (aux joueurs) et « Me tenir au courant » (les deux emails à l'organisateur ; avec plusieurs organisateurs, chacun règle le sien). Tous ces emails sont dans les trois langues, dans la langue de la personne. Aucun ne dit qui a pronostiqué quoi.

**Les prix, un par un** (Correction 14). Un « pronostic compté » est un pronostic hors leurre (la ligne de la personne à qui j'offre ne compte jamais). Les « tentatives » sur un Père Noël sont les pronostics comptés faits sur la ligne de la personne à qui il offre. La **note lissée** d'un compte `k` sur `n` vaut `(k + 1) / (n + 2)` : elle évite qu'un seul essai donne la note maximale.

| Prix | Calcul | Condition d'affichage | Maquette |
|---|---|---|---|
| Démasqués | Ceux qui ont deviné leur propre Père Noël. Ce prix est une liste, pas un podium, donc il nomme plus de monde que les autres : jusqu'à trois, les grands avatars ; de quatre à neuf, une grille de trois par ligne avec les prénoms ; au-delà de neuf, le nombre seul, sur le nombre de joueurs qui ont pronostiqué leur Père Noël (« 11 personnes sur 14 ») | Au moins un | `DevineStoryDemasques`, `DevineStoryDemasquesGrille`, `DevineStoryDemasquesNeuf`, `DevineStoryDemasquesPlus` |
| Le détective | Somme de ses bons pronostics, chacun valant entre 1 et 2 points : 1 + la part des autres joueurs de cette ligne qui se sont trompés (1,5 s'il était seul sur la ligne). Une erreur ne coûte rien. À égalité : la meilleure précision, puis le moins de pronostics | Au moins 2 bons pronostics. Mode « Toutes les paires » | `DevineStory4` |
| Le sans-faute | Tous ses pronostics comptés sont justes | Au moins 3 pronostics. S'il est aussi le détective, cet écran remplace celui du détective | `DevineStorySansFaute` |
| Le mieux caché | La note lissée la plus haute : (trompés + 1) / (tentatives + 2) | Autant de tentatives sur lui que le seuil du groupe | `DevineStory5` |
| Le plus transparent | La même note, la plus basse | Démasqué autant de fois que le seuil du groupe. Jamais la même personne que le mieux caché | `DevineStoryTransparent` |
| Le suspect idéal | Le plus souvent cité à tort. À égalité : celui qui n'a jamais été cité à raison | Cité à tort autant de fois que le seuil du groupe | `DevineStory6` |
| La rumeur | La fausse piste la plus partagée, une paire « X offrait à Y » : la note lissée (joueurs qui l'ont pronostiquée + 1) / (tentatives sur cette ligne + 2). **Une seule rumeur affichée** : à égalité, celle crue par le plus de joueurs, puis celle qui vise le Père Noël le mieux caché, puis la plus ancienne | Autant de joueurs que le seuil du groupe y ont cru | `DevineStoryRumeur` |
| Les jumeaux | Les deux joueurs aux pronostics les plus proches. Se tromper ensemble compte double : 2 points par erreur commune, 1 par bonne réponse commune. Note : (points + 1) / (2 × lignes que les deux ont pronostiquées + 2). **Une seule paire affichée** : la meilleure note, puis celle dont aucun membre n'a déjà un prix à l'écran, puis celle qui s'est fixée la première (dernier pronostic commun enregistré le plus tôt) | Au moins 3 pronostics identiques | `DevineStoryJumeaux` |
| Les triplés | Trois joueurs dont les trois paires remplissent chacune la condition des jumeaux, et qui contiennent la meilleure paire. Au-delà de trois, on revient à la meilleure paire | À la place des jumeaux, quand ce trio existe | `DevineStoryTriples` |
| Sur le fil | Le dernier pronostic compté enregistré avant la fin | Fait dans la dernière heure avant la fin des pronostics | `DevineStoryFil` |
| La girouette | Celui qui a le plus changé d'avis, tous ses pronostics confondus. À égalité : celui qui a fait le moins de pronostics | Au moins 3 changements | `DevineStoryGirouette` |
| Si près du but | J'avais la bonne réponse sur une ligne, puis j'ai changé pour une mauvaise. **Écran personnel** : seul le joueur concerné le voit, juste après « mon Père Noël ». S'il y a plusieurs lignes, celle du Père Noël le mieux caché | Au moins une ligne dans ce cas | `DevineStoryPresDuBut` |
| Le score du groupe | Bons pronostics sur pronostics comptés, comparé au hasard : pronostics comptés / (participants − 2), arrondi. Trois phrases selon le résultat : nettement mieux que le hasard, à peu près pareil, moins bien (« les Pères Noël étaient bien cachés ») | Au moins 6 pronostics comptés. Dernier écran avant la fin | `DevineStoryGroupe` |

- **Le seuil du groupe** : un joueur sur quatre, arrondi au-dessus, au moins 2 et au plus 5 (2 jusqu'à 8 joueurs, 3 de 9 à 12, 4 de 13 à 16, 5 à partir de 17). Les « joueurs » sont ceux qui ont fait au moins un pronostic compté. Il sert de condition d'affichage à quatre prix : la rumeur, le suspect idéal, le plus transparent et le mieux caché. Le plafond à 5 évite que ces prix disparaissent dans les grands groupes, où personne ne pronostique toutes les lignes. Les notes pondérées, elles, ne changent pas : le seuil décide seulement si le prix mérite d'être montré.
- **Les maquettes des prix portent leur règle.** Chaque maquette de prix montre l'écran, et dessous, dans un encadré « La règle · ne fait pas partie de l'écran », le calcul, la condition d'affichage et le départage. L'encadré n'est pas à reproduire dans l'application.
- **Les prix à paire n'ont jamais d'ex æquo** (jumeaux, rumeur) : deux paires feraient quatre noms à l'écran. Un départage désigne toujours une seule paire.
- **L'ordre des écrans de prix** : Démasqués, Le détective ou Le sans-faute, Le plus transparent, Le mieux caché, La rumeur, Le suspect idéal, Les jumeaux, Sur le fil, La girouette, Le score du groupe. « Si près du but » vient avant, avec « mon Père Noël ».
- **Les couleurs suivent l'enchaînement, pas le prix.** Les écrans fixes gardent la leur : sapin pour l'ouverture, brique pour le suspense, « mon Père Noël » et « Si près du but », crème pour la fin. Les écrans de prix tournent dans cet ordre : moutarde, prune, sapin, brique, puis on recommence, selon leur rang parmi les prix réellement affichés. Deux écrans voisins n'ont donc jamais la même couleur, quels que soient les prix sautés. Un prix n'a pas de couleur à lui.
- **Pas plus de huit écrans de prix.** Chaque prix a une force entre 0 et 1 (sa note lissée, ou sa part des joueurs pour les prix à compte) ; s'il y en a plus de huit, les plus faibles sont sautés. « Démasqués » et « Le score du groupe » ne sont jamais sautés pour cette raison.
- **Personne n'est moqué** : il n'y a pas de dernier du classement, « Si près du but » n'est montré qu'à l'intéressé, et « La girouette » se dit avec le sourire.
- **Ce qu'il faut enregistrer en plus** : pour chaque pronostic, la liste des personnes qu'il a désignées avant la réponse actuelle. Elle sert à « La girouette » (sa longueur) et à « Si près du but » (la bonne réponse y figure). Les pronostics faits avant cette correction ont une liste vide.

**Le palmarès en images** (`DevineStory1` à `7`, plus les écrans des nouveaux prix) : des écrans plein cadre, un par moment (l'ouverture, le suspense, mon Père Noël, puis un prix par écran, la fin), avec une barre de progression en haut.

- Une fois lancé, chaque écran dure 7 secondes puis passe au suivant tout seul, comme une story.
- Un appui à droite passe au suivant, à gauche revient au précédent ; maintenir l'écran met en pause ; la croix ferme.
- Si l'appareil demande moins d'animations, rien ne défile tout seul : on avance à l'appui.
- Un prix sans gagnant est sauté. Le dernier écran propose « Voir tous les résultats » et « Revoir depuis le début ».
- **Le dernier écran est sous une pluie de fête** (décidé par Julien le 19 novembre 2026, `DevineStory7` ; à faire, lot 23 bis) : des flocons de neige, des étoiles à quatre branches qui scintillent et quelques confettis tombent derrière le texte, en boucle. Une cinquantaine en tout : la moitié de flocons, un quart d'étoiles, un quart de confettis. Flocons en bleus de glace (`#6eb0f2`, `#8fc0f4`, `#b5d6f9`) et lilas `#b993dd` ; étoiles lilas, corail `#ff8478` et menthe `#4fcaa3` ; confettis corail, menthe, lilas et pêche `#f2a65a`. Pas de jaune. La pluie est décorative : elle n'est pas lue par un lecteur d'écran et ne prend aucun appui. Avec « réduire les animations », rien ne bouge : les mêmes dessins, posés sur l'écran.
- **La page « Devine qui : les réponses »** (`DevinePalmares`) ne liste pas le palmarès : en haut, un bouton « Découvrir le palmarès » qui lance les images ; dessous, mes pronostics tels que je les ai faits, sans correction, pour ne rien gâcher. Une fois les images vues (`DevinePalmaresVu`), le bouton devient « Revoir le palmarès » et mes pronostics sont corrigés. Pas de carte « Tu avais deviné » : c'est le rôle des images. Le palmarès du groupe n'existe qu'en images.

**Partout ailleurs, une invitation** : le journal (`DevineJournal`), l'accueil (`DevineAccueilPalmares`) et la page du tirage (`DevineTiragePalmares`, où c'est l'action principale) disent « le palmarès est arrivé » et lancent les images, sans rien dévoiler. Le vert sapin est la couleur du palmarès, et de lui seul : le fond des images, le bouton « Découvrir le palmarès » partout où il apparaît, et la tuile du jeu quand le palmarès attend. Le reste du jeu garde les couleurs normales de l'application. L'accueil rappelle d'ouvrir son cadeau d'abord. Une fois le palmarès vu, la carte de l'accueil disparaît et les liens mènent au récapitulatif.

**Côté code (lot 19)**

- **Cœur pur** (`server/utils/guesses.ts`, testé) : `guessesOpen`, `autoRevealDue` (le lendemain de la fête à l'heure de fin), `moveGuessEnd` (la fin suit la date de la fête), `guessChoices` (tout le monde sauf soi et la personne de la ligne ; en « Qui m'offre ? », seulement sa ligne), `placeGuess` (une personne nommée ailleurs est déplacée), `countedGuesses` (toutes les lignes comptent, « Moi » compris), `ranking`, `gamePossible` (quatre participants au moins), `palmaresSize` (rien sans joueur, le petit palmarès à un ou deux joueurs ou dans un tirage à trois, le grand sinon), `palmares` (les prix et leurs ex æquo, au grand palmarès seulement), `correctedGuesses`, `changeGuessMode`, `carriedGame` (repris de l'édition précédente, la fin à la même heure le jour de la nouvelle fête).
- **Base** (migration `0023`) : sur `editions`, `guess_mode`, `guess_ends_at` (un instant), `guess_time_zone` (le fuseau de l'organisateur au réglage, pour écrire l'heure dans les messages), `guess_reminder_sent_at`, `guesses_closed_at`, `guess_results_sent_at` ; sur `participations`, `guess_results_seen_at` ; la table `guesses` (qui pronostique, pour quel destinataire, quelle personne, par personne).
- **Tâche planifiée** : une seconde cron, toutes les 15 minutes (`server/plugins/guesses.ts`, Correction 12), inscrit la fin des pronostics au journal, et dévoile le tirage le lendemain de la fête à l'heure de fin si l'organisateur ne l'a pas fait (action `system`). Le rappel du matin garde sa cron de 8 h. Après tout dévoilement, manuel ou automatique, `afterReveal` (`server/http/guesses.ts`) ferme les pronostics, et, dès qu'une personne a joué, inscrit « le palmarès est arrivé » et envoie l'email du palmarès, une fois.
- **Messages** : une ligne dans « Tirage fait » tant que le jeu est actif, le rappel du jeu (`guessReminder`) et l'email du palmarès (`buildGuessResultsEmail`), dans les trois langues ; l'heure s'écrit « 25 décembre à 18 h » (`guessEndText`, `shared/utils/dates.ts`), à l'écran dans le fuseau du lecteur, une fois la page montée.
- **Écrans** : décrits en section 11 ; le palmarès en images est `ParticipantStories`, ses écrans choisis par `storyScreens` et leurs couleurs par `storyLooks` (`shared/utils/palmares.ts`, testés), les nombres écrits en lettres par `numberWord` (`shared/utils/words.ts`).
- **Donner envie de jouer, et rappeler (Correction 15, codée le 18 novembre 2026)** : `server/utils/nudges.ts`, testé : `playedCount`, `toRemind`, `canSkip`, `deadlineOf` (« Plus que 3 jours », « Dernier jour », par jour du calendrier dans le fuseau du lecteur), `autoReminderAt` (deux jours avant la fin, à 10 h dans le fuseau du réglage), `autoReminderDecision` (une fois ; pas si coupé, si le jeu a été allumé moins de trois jours avant la fin, ni si l'organisateur a rappelé dans les deux derniers jours), `autoReminderTargets` (textes `play` et `more`), `nudgeTime` (cinq jours avant la fin, s'il reste quelqu'un), `AUTO_REMINDER_GRACE_HOURS` (le rappel automatique part encore jusqu'à six heures après son heure si la tâche a eu du retard, Correction 16), `challengeOf` (le chiffre de l'an dernier). Migration `0025` : sur `editions`, `guess_auto_reminder`, `guess_auto_reminder_sent_at`, `guess_enabled_at`, `guess_point_sent_at`, `guess_end_sent_at` ; sur `participations`, `guess_skipped_at` ; sur `group_members`, `guess_news`. La tâche des 15 minutes envoie le point d'étape et le rappel automatique (`server/http/nudges.ts`), et l'email de fermeture quand les pronostics ferment à l'heure. Emails : `buildGuessAutoReminderEmail`, `buildGuessPointEmail`, `buildGuessEndEmail`. Écrans : `ParticipantGameInvite` (sous le résultat), `ParticipantGameSurprise` (la surprise, le défi), les lignes de la tuile (`UiTile` `lines`, `useGameLines`), « Tu passes ton tour » sur la page du jeu, confirmé depuis l'email (`?passer=1`). Événement `guess_auto_reminder_sent` (action automatique, sans nom). Test : `tests/e2e/game-nudges.spec.ts`.
- **Les prix (Correction 14, codée le 18 novembre 2026)** : `server/utils/awards.ts`, testé prix par prix : `smoothed`, `groupThreshold`, `detectiveScores` (aussi le classement), `santaScores`, `twinScores`, `awardsOf`, `pickAwards` (huit écrans au plus), `closeCallOf` (« Si près du but », pour le seul joueur concerné). Migration `0024` : `guesses.previous_giver_ids`, les réponses précédentes de chaque ligne ; chaque pronostic garde l'heure de sa réponse actuelle. `palmares` reçoit la fin réelle des pronostics (`guessesEndedAt`).

**Les textes (Correction 16, 18 novembre 2026)** : la voix, les mots et chaque texte modifié sont dans [`docs/refonte/TEXTES.md`](docs/refonte/TEXTES.md). Côté participant, « mon enveloppe » remplace « mon résultat » (journal compris) et « c'est terminé pour cette année » remplace « cette édition est clôturée » ; sur le suivi, « Enveloppe ouverte » remplace « Résultat consulté » ; « les résultats » reste pour le tirage entier. En anglais, « organizer » et « party » partout ; en allemand, « Feier » et « Umschlag ». Avant la fête, aucun texte ne nomme un prix ni ne dit « palmarès » aux joueurs.

### 22.18 Fait : la page d'un tirage dévoilé (18 novembre 2026)

**Codé le 18 novembre 2026** (Correction 13) : `GET /api/p/[token]/draw` (refusé avant le dévoilement), `openDraw` et `revealerFor` (`server/utils/personal.ts`, testés), qui a dévoilé gardé dans l'événement du dévoilement (`meta.by`, la personne du groupe qui a l'adresse de l'organisateur), `ParticipantRevealedBanner`, `ParticipantDrawLines`, la page `/p/[token]/tirage`, la carte de l'accueil (`opened`), la demande de pistes nominative (`hints.email.request.*From`). Test de bout en bout : `tests/e2e/revealed.spec.ts`.

Décidé par Julien le 18 novembre 2026, en voyant la page d'un participant après un dévoilement forcé avant la fête : elle parlait encore de secret (« Un trou de mémoire ? », « assure-toi que personne ne regarde ton écran ») et ne disait nulle part que le tirage était dévoilé. Correction 13 de `docs/refonte/PLAN.md`. Maquettes : `TirageDevoileAvant*`, `TirageTout`, `AccueilDevoileAvant`.

**Ce qui change dans la règle** : dévoiler le tirage le rend visible à **tout le groupe**, plus seulement à l'organisateur (22.9). Les textes qui disaient « toi seul verras la liste » sont donc faux et changent.

| Élément | Une fois le tirage dévoilé |
|---|---|
| La frise | L'étape du milieu s'appelle « Tirage dévoilé » |
| Le bandeau | Couleur des alertes du journal : « Le tirage n'est plus secret. Camille l'a dévoilé le 18 novembre : tout le monde peut voir qui offre à qui. », avec un lien vers le journal. Pour celui qui a dévoilé : « Tu l'as dévoilé le… » (`TirageDevoileAvantOrganisateur`) |
| La carte du résultat | Ouverte d'emblée : la personne à qui j'offre et ses pistes. Plus d'enveloppe, plus de « Revoir », plus de « Refermer mon enveloppe », plus de phrase sur l'écran qu'on regarde. Vaut aussi pour qui n'avait jamais ouvert son enveloppe |
| Sans pistes | « Lui demander des pistes » reste (`TirageDevoileAvantSansPistes`), sans « Sans dire que ça vient de toi » : la demande n'est plus anonyme, et son email nomme celui qui demande |
| « Qui m'offre mon cadeau ? » | Une ligne repliée par défaut, « Appuie pour le voir, ou garde la surprise ». Dépliée (`TirageDevoileAvantQui`) : l'avatar et « C'est Hugo qui t'offre ton cadeau. » Elle se replie quand on quitte la page |
| « Voir tout le tirage » | Une ligne vers la page « Qui offre à qui » (`TirageTout`) : la liste des paires, ma ligne marquée « toi » |
| Les tuiles | Inchangées : « Mes pistes de cadeaux », modifiables jusqu'à la fête, et « Devine qui » si le jeu est actif (`TirageDevoileAvantSansJeu` sinon) |
| L'accueil | La carte dit « Tu offres un cadeau à Camille » et « Voir ses pistes de cadeaux », au lieu de « Le tirage est fait ! Découvrir » (`AccueilDevoileAvant`). L'alerte du journal reste dessous |

**Après la fête**, mêmes règles : rien n'est caché, la frise dit « Tirage dévoilé » puis « Fête passée », et les pistes de la personne ne sont plus affichées.

| État | Maquette | La page |
|---|---|---|
| Le palmarès attend | `DevineTiragePalmares` | L'invitation au palmarès reste l'action principale ; dessous, une carte compacte « Tu as offert un cadeau à Inès », puis les deux lignes. Plus de « Revoir à qui j'ai offert un cadeau » |
| Sans jeu, ou palmarès déjà vu | `TirageDevoileApres` | La carte principale dit « Tu as offert un cadeau à Inès », puis les deux lignes ; la tuile du jeu dit « Voir les réponses » |
| Édition clôturée et dévoilée | `TirageClotureDevoile` | La même, avec « Cette édition est clôturée. Rendez-vous l'an prochain ! » |
| Édition clôturée sans dévoiler | `TirageCloture` | Inchangée : le secret reste, « Revoir à qui j'offre un cadeau » |

Les deux lignes sont au passé (« Qui m'a offert mon cadeau ? », « Qui a offert à qui, dans tout le groupe »). Elles sont là même quand le palmarès attend : les ouvrir avant les images est le choix de chacun.

**Côté organisateur** : le panneau « Dévoiler » et l'écran « Résultats dévoilés » ne disent plus « toi seul verras la liste » ni « pour l'instant, toi seul vois cette liste », mais que tout le groupe la verra. L'avertissement du dévoilement forcé avant la fête ne change pas.

### 22.19 Décidé : les listes de cadeaux (18 novembre 2026)

Décidé par Julien le 18 novembre 2026. Lots 20 à 22 de `docs/refonte/PLAN.md` : **faits** (18 novembre 2026). Tables `family_members`, `gift_lists`, `gift_list_people`, `gift_list_ideas` (migration `0026`), `gift_claims`, `gift_off_list`, `gift_list_visits` (migration `0027`) ; routes `/api/lists`, `/api/family`, `/api/l/[jeton]` ; cœur `server/utils/lists.ts` et `server/utils/claims.ts` ; écrans `/listes`, `/listes/[id]`, `/famille/[id]`, `/l/[jeton]` (`docs/ARBORESCENCE.md`). Deux comptes ne cochent jamais seuls la même idée : l'écriture ne se fait que si personne ne l'offre encore, en une seule requête. Choix faits seul : section 6 du plan, lots 21 et 22. Maquettes : `Liste*`, `ListesAccueil`, `ListesVide`, `PanneauAvatarGrand`.

**L'idée.** Une famille écrit ses idées de cadeaux pour un événement (Noël, un anniversaire, toute l'année), envoie un lien, et chacun coche ce qu'il offre pour que personne n'ait la même idée. Très utile pour les enfants. Le modèle est une page Notion que Julien tenait à la main : une icône, un titre, un mot, des prénoms, des lignes à cocher. L'écran doit rester un **document**, pas un formulaire : on écrit là où le texte apparaîtra.

**Séparé du tirage.** Une liste n'appartient ni à un groupe ni à une édition. Elle a son onglet : la barre du bas a deux entrées, « Tirages » et « Listes ». Le lien éventuel avec un tirage n'est pas décidé (section 6 du plan).

**Les mots.** « Liste », « idée », « cocher », « c'est pris », « celui qui tient la liste ». On coche « ce qu'on offre » : jamais « réserver » à l'écran, jamais « souhait ». Une liste n'est pas une commande : aucun écran ne dit combien d'idées restent, ni sur combien. On dit seulement « 9 cadeaux déjà prévus ».

#### Qui fait quoi

| Rôle | Ce qu'il peut faire |
|---|---|
| **Celui qui tient la liste** | N'importe quel compte, sans quota. Il crée la liste, écrit les idées de toutes les personnes, partage le lien. Il voit qui a coché quoi. Il peut cocher lui aussi, dans le document où il écrit et dès le brouillon, y compris les idées qui lui sont destinées |
| **Celui qui ouvre le lien, sans compte** | Il lit toute la liste. Toucher une case lui demande son adresse email (`ListeConnexion`) : le lien magique habituel le ramène sur la liste, et le cadeau est coché |
| **Celui qui ouvre le lien, connecté** | Il coche, décoche, propose un cadeau à plusieurs, se joint à un cadeau, dit qu'il offre autre chose. La liste apparaît dans son onglet « Listes » dès qu'il l'a ouverte connecté |

#### Ce qu'une liste contient

| Élément | Règle |
|---|---|
| Icône | Une tuile **carrée** en couleur pleine : six couleurs (sapin, brique, moutarde, prune, bleu nuit `#2c4a63`, kraft) et des symboles propres aux listes, en quatre familles (« Noël et hiver », « Anniversaires et fêtes », « Grands moments », « Saisons »). Panneau `ListeIcone`, le même que celui des personnes (voir plus bas) |
| Nom de l'événement | Obligatoire pour partager |
| Date | Facultative. Affichée sous le titre (« Le 25 décembre »). Elle range les listes et dit quand une liste est passée |
| Le mot pour la famille | Écrit par celui qui tient la liste. Un texte de départ est proposé dans sa langue (« Quelques idées pour t'éviter de chercher. Coche ce que tu offres, et personne n'aura la même idée. Tu en as une autre ? Elle est la bienvenue. ») ; il le modifie ou l'efface. Effacé, la liste n'a pas de mot : on ne remet rien à la place. Une fois enregistré, c'est son texte, il n'est pas traduit |
| Les personnes | Celles de **ma famille**, gardée d'une liste à l'autre sur le compte : prénom, icône ronde (la même que celle des participants d'un tirage), infos pratiques (âge, tailles, pointure) et goûts (`ListePersonne`). Une personne n'est pas un compte |
| Les idées | Une ligne de texte par idée, avec un lien facultatif. Pas de prix, pas de priorité |

#### Créer et écrire, dans le document

- **« Nouvelle liste » ouvre le document, encore vide** (`ListeNouvelle`) : une icône tirée au hasard, « Nom de l'événement » en gris avec le curseur dedans, « Ajouter une date », le mot de départ dans un cadre en pointillés, puis le bloc « Ajouter quelqu'un ». Aucun formulaire, aucun bouton « Créer ».
- **« Ajouter quelqu'un »** est le même bloc dans le brouillon et dans la liste partagée, en bas du document : les personnes de ma famille qui ne sont pas encore sur la liste, en pastilles, puis « Quelqu'un d'autre ». Toucher un prénom l'ajoute, avec ses idées qui n'ont pas été offertes la dernière fois.
- **Écrire une idée** (`ListeTeneur`, `ListeIdee`) : chaque personne se termine par une ligne vide en gris, « Une autre idée… ». On y écrit directement ; la touche retour valide et passe à la ligne suivante. Les actions d'une ligne sont sous elle, dans le document, tant qu'on y écrit (22.20, lot 24) : la barre « Lien », « Supprimer la ligne », « Terminé » au-dessus du clavier a disparu.
- **Tout texte se modifie en le touchant** : le titre, la date, le mot, une idée.
- **Enregistrement automatique** : pas de bouton « Enregistrer ». Une ligne laissée vide disparaît. Une adresse collée dans une ligne devient le mot « lien ».
- **Celui qui tient la liste coche dans le document**, sans changer de vue, y compris tant que la liste est un brouillon : la case d'une idée la coche à son prénom, seul ; retouchée, elle décoche. En V2 (22.20), cela vaut pour chacun de ceux qui tiennent la liste.
- **Personne n'est bloqué sur ses propres idées** (décidé par Julien le 19 novembre 2026 ; **fait**, Correction 20). Celui qui tient la liste coche aussi une idée de sa section « Moi » : il se l'offre, ou il l'a déjà. Elle s'affiche comme n'importe quelle idée qu'il a cochée.
- **Sous une idée que j'ai cochée dans le document** (décidé par Julien le 19 novembre 2026 ; **fait**, Correction 21) : « Tu l'offres · seul · Changer », en petit texte gris, comme par le lien (`ListeVisiteurMes`). La pastille verte « C'est toi » disparaît ; la coche verte et le texte en gras restent. « Changer » ouvre le même panneau que par le lien (`ListeReserver`) pour passer à un cadeau à plusieurs, sans le choix de rester anonyme : c'est celui qui tient la liste qui lit les prénoms. Depuis le document, il peut aussi se joindre à un cadeau à plusieurs.
- **Une idée déjà cochée** par quelqu'un peut être corrigée ; la supprimer demande une confirmation.
- Un document quitté sans nom ni personne n'est pas gardé.

#### Brouillon, puis partagée : un seul bouton

Tout en haut du document, au-dessus de l'icône, un seul bouton dit l'état et sert à partager.

| État | Le bouton | Le lien public |
|---|---|---|
| Brouillon | « Brouillon · toi seul la vois », et « Partager » | N'existe pas |
| Partagée | « Partagée avec la famille », et « Le lien » | Créé au premier partage |

Le bouton mène à `ListePartager` : le lien, et un message tout prêt à coller dans la conversation de la famille, qui dit aussi un mot de l'application. S'il manque un nom ou une personne, cet écran dit ce qui manque au lieu de créer le lien.

#### Cocher

- **Connecté, toucher la case coche tout de suite**, sans panneau (`ListeVisiteurMes`). Par défaut : je l'offre seul, et celui qui tient la liste voit mon prénom.
- Sous ma ligne : « Tu l'offres · seul, sous ton prénom · Changer ». « Changer » ouvre le panneau (`ListeReserver`) : seul ou à plusieurs, et « Dire à Camille que c'est moi ».
- Retoucher la case décoche, sans confirmation tant que je suis seul dessus.
- **« J'offre autre chose à Léo »** (`ListeHorsListe`), en fin de chaque personne : deux mots sur un cadeau qui n'est pas sur la liste.

#### Qui voit quoi

| | Celui qui tient la liste | Les autres |
|---|---|---|
| Une idée cochée | Barrée, avec le prénom de celui qui offre, ou « Anonyme » s'il l'a choisi | Barrée. Rien d'autre |
| Mon propre cadeau | | « C'est toi », en vert |
| Un cadeau à plusieurs | Les prénoms | Les prénoms et les icônes de ceux qui participent |
| Un cadeau hors liste | « Hors liste : un jeu de société », et le prénom | « Un cadeau surprise, hors liste » |

Les personnes d'une liste ne sont pas des comptes : l'application ne sait pas cacher une liste à celui qui y figure. Celui qui tient la liste et qui y figure aussi verra ce qu'on lui offre ; c'est assumé.

#### Un cadeau à plusieurs

Maquettes : `ListePlusieursLigne`, `ListeReserverPlusieurs`, `ListeRejoindre`, `ListeRejoindreSept`, `ListePlusieursOuvreur`.

- **Proposer** : depuis « Changer », « On l'offre à plusieurs ». L'écran prévient que mon prénom sera visible de ceux qui ouvrent la liste ; un mot facultatif (« Je l'achète, on partage ? »).
- **La ligne** n'est pas barrée : case moutarde, les icônes de ceux qui participent (trois au plus, puis « +4 »), leurs prénoms ou « 7 personnes », et « Se joindre ». Pour moi : « Tu participes ».
- **Se joindre** ouvre toujours un panneau, car il faut accepter que son prénom soit visible. Pas de nombre maximum.
- **Si personne ne se joint**, le cadeau reste à celui qui l'a proposé : il compte comme un cadeau prévu.
- **« On est au complet »** : seul celui qui a proposé peut fermer le groupe. La ligne est alors barrée, « Offert à plusieurs · au complet ».
- **Si celui qui a proposé se retire**, le cadeau passe au participant suivant, qui peut à son tour fermer le groupe. S'il était seul, la ligne redevient libre.
- L'application ne gère pas l'argent.

#### L'onglet « Listes »

`ListesAccueil`, `ListesVide`. Une seule suite de cartes, par date, les miennes et celles qu'on m'a envoyées mélangées.

- **En tête de chaque carte, qui tient la liste** : son icône ronde et « Liste de Mamie », ou « Tu tiens cette liste ». Un brouillon dit « Brouillon ».
- Puis la tuile carrée, le nom, la date (« dans 37 jours »), « Pour » et les icônes de ceux qui reçoivent.
- La phrase du bas dit ce que j'y offre, quelle que soit la liste : « 9 cadeaux déjà prévus, dont 2 par toi. », « Tu offres 2 cadeaux. », « Tu n'as encore rien coché. » Une pastille signale les nouvelles idées depuis ma dernière visite.
- **« Passées »**, après la date : une ligne par liste, avec ce qui s'y est offert (« 7 cadeaux offerts à Léo », « Liste de Tonton · tu as offert 1 cadeau »).

#### Le choix d'une icône, refait pour beaucoup plus d'icônes

`PanneauAvatarGrand` remplace `PanneauAvatar` partout où une personne choisit son icône, tirages compris. Le panneau reste bas (Correction 8). **Fait** (lot 20, 18 novembre 2026).

- En haut : l'icône en cours, le titre, et un bouton rond « Au hasard » (deux flèches croisées) qui tire un symbole et une couleur.
- Les symboles sur trois rangées qui **défilent de côté**. Les familles se suivent dans le défilement, chacune avec son titre au-dessus de ses colonnes. Pas d'onglets.
- Les couleurs **dessous**, sur une ligne.
- De nouvelles icônes qui ne sont pas de Noël (« Enfants et jeux », et d'autres), pour tout le monde.

`ListeIcone` est le même panneau, à trois différences près : la tuile est carrée, les couleurs sont pleines, les symboles sont ceux des listes.

### 22.20 Décidé : les listes de cadeaux, V2 (19 novembre 2026)

Décidé par Julien le 19 novembre 2026, après la V1 (22.19). Pas encore codé : lots 24 à 27 de `docs/refonte/PLAN.md`. Maquettes : `ListeLiveTeneur`, `ListeTeneurs`, `ListePersonneCompte`, `ListeVueReliee`, `ListeIdee`, `ListeIdeeLien`, `ListeIdeeLienFait`, `ListeHorsListe`, `ListeNouvelleReprendre`, `ListeReprise`.

**Une règle qui ne change pas, et qu'on écrit ici une fois pour toutes : dans une liste, rien n'est une surprise.** Personne ne se voit cacher ce qu'on lui offre, pas même celui qui y figure. La seule chose réservée à ceux qui tiennent la liste, ce sont les prénoms de ceux qui offrent.

#### Écrire sur place, sans rien au-dessus du clavier

**Fait** (lot 24, 19 novembre 2026). Dans le code : `ListsIdeaLine` (la ligne, ses actions et l'adresse), `asAddress` (`app/utils/ideaLink.ts` : une adresse tapée sans « https:// » est complétée, ce qui n'en est pas une est refusé), `ListsOffListLine` (« J'offre autre chose », sur place). `ListsLineBar`, le panneau du lien et la page `/l/[jeton]/hors-liste` ont disparu.

- **Plus de barre collée au clavier** (`ListeIdee`). Sous la ligne qu'on écrit, dans le document, un petit lien de texte, « Ajouter un lien ». Il apparaît quand on entre dans la ligne et disparaît quand on la quitte. Pas de « Supprimer » (retiré le 19 novembre 2026, à la demande de Julien) : on efface le texte, et la ligne vide disparaît. Un texte long passe à la ligne pendant qu'on l'écrit aussi : le champ grandit avec lui. Au clavier, les flèches haut et bas et la touche Tab (Maj+Tab pour remonter) passent d'une ligne à l'autre, d'une personne à la suivante, en enregistrant ; une flèche ne quitte un texte de plusieurs rangs que depuis son premier ou son dernier rang. La touche retour valide et passe à la ligne suivante ; toucher ailleurs valide aussi.
- **Le lien reste à part du texte** : une idée a un texte et un lien au plus, qui s'écrit toujours au bout de la ligne par le mot « lien », souligné. « Ajouter un lien » prolonge la ligne de « : », avec le curseur et l'invitation grise « colle ou écris l'adresse » ; dessous, « Annuler » (`ListeIdeeLien`). Une fois l'adresse posée, dessous : « Changer le lien » et « Retirer le lien » (`ListeIdeeLienFait`, qui montre encore « Supprimer »). Pas de bouton « Coller ».
- **« J'offre autre chose »** n'ouvre plus de panneau (`ListeHorsListe`) : une ligne s'écrit sur place en fin de personne, déjà cochée à mon nom. Dessous : « Camille lira ces mots. Les autres verront seulement "Un cadeau surprise, hors liste". » et « Supprimer ».
- **Des liens de texte, pas des boutons** : « Se joindre » est un lien souligné au bout de la ligne, comme « Changer » ; « Tu participes » un texte vert en gras. Ces liens gardent une zone tactile d'au moins 44 px de haut.

#### En direct

Seulement dans une liste : le document de celui qui la tient, et la page de celui qui la consulte.

- **Ce qui arrive en direct** : une case cochée ou décochée, quelqu'un qui se joint à un cadeau ou s'en retire, un groupe fermé, une idée ajoutée, corrigée ou supprimée, une personne ajoutée ou retirée, un cadeau hors liste, le titre, la date, le mot.
- **Comment ça se voit** : par l'animation du changement, et rien d'autre. Pas d'étiquette, pas de surlignage, pas de message.
- **La ligne que quelqu'un écrit est bloquée pour les autres** (`ListeLiveTeneur`) : on y voit son curseur, à la couleur de son icône, avec son emoji et son prénom collés dessus ; la case est pâlie, la ligne ne se touche pas. Elle se libère quand il valide ou quitte la ligne, et d'office après 30 secondes sans frappe.
- **Deux personnes cochent en même temps** : la première gagne, la case de l'autre passe en « pris », sans message.
- **La ligne que j'écris ne bouge jamais** sous mes doigts : les changements des autres s'insèrent autour.
- **Technique** : un objet durable Cloudflare par liste garde les connexions WebSocket (avec hibernation : une liste que personne ne regarde ne coûte rien). D1 reste la seule source de vérité. L'objet n'envoie qu'un signal « la liste a changé », et chaque navigateur recharge alors sa propre vue par les routes existantes : rien de ce qu'une personne n'a pas le droit de voir ne passe par ce canal. Seules exceptions, qui passent par l'objet : qui écrit quelle ligne, et la présence. Sans connexion, la page se recharge quand elle redevient visible.

#### Tenir une liste à plusieurs

- Une liste peut être tenue par **plusieurs comptes, tous égaux** (`ListeTeneurs`) : chacun écrit, partage, voit qui offre quoi, y compris ce qu'on lui offre s'il y figure.
- On invite par adresse email ; la liste apparaît dans les listes de l'invité dès qu'il se connecte. Une invitation en attente peut être annulée.
- Chacun peut en retirer un autre. Le dernier ne peut pas se retirer.
- **Présence**, entre ceux qui tiennent la liste seulement : sous le bouton d'état, « Tu tiens cette liste avec Hugo. Il est là en ce moment. », un point vert sur son icône. Les invités ne voient jamais qui regarde.

#### Relier une personne à son compte

- Sur la fiche d'une personne de ma famille (`ListePersonneCompte`), une adresse email la relie à son compte. Pour un enfant, on laisse vide.
- Une personne reliée peut **écrire, corriger et supprimer ses propres idées** sur les listes où elle figure (`ListeVueReliee`) : sa section passe en premier, « C'est toi ».
- Pour le reste, elle voit la liste **comme tout le monde**, l'état de ses propres idées compris. Elle coche comme tout invité, y compris ce qui lui est destiné (22.19, « Personne n'est bloqué sur ses propres idées »).
- Elle ne tient pas la liste pour autant : elle ne voit pas qui offre quoi.

#### Reprendre une liste

- Dans le document vide d'une nouvelle liste, un bloc **« Repartir d'une liste »** propose mes listes (`ListeNouvelleReprendre`), avec ce qu'on y reprend (« 4 personnes · 6 idées pas encore offertes »). Une liste passée a aussi son bouton « Reprendre cette liste ».
- **Ce qui est repris** : l'icône, le mot, les personnes, et les idées qui n'avaient pas été cochées. Pas les cadeaux cochés, pas les cadeaux hors liste. Le nom et la date sont à remplir. La nouvelle liste est un brouillon ; l'ancienne ne change pas.
- **Une marque discrète** (`ListeReprise`) : une idée reprise porte une petite flèche grise en rond au bout de sa ligne, visible de ceux qui tiennent la liste seulement. Une phrase grise l'explique en haut. Pas de bouton pour garder ou retirer : on efface une idée comme n'importe quelle ligne. La marque disparaît quand on modifie l'idée, et pour toutes au premier partage.

### 22.21 Fait : la navigation toujours là (19 novembre 2026)

Décidé par Julien le 19 novembre 2026. **Fait** (Correction 19 de `docs/refonte/PLAN.md`). Maquettes : `NavTirage`, `NavListe`, `NavRedaction`. Le menu est `AppMenu`, le même dans tous les cadres d'écran (`AdminScreen`, `ParticipantScreen`, `ListsScreen`, `AuthScreen`) ; la barre `UiTabBar` est posée une fois, dans `app.vue`, et chaque cadre s'arrête au-dessus d'elle (`--tab-bar`). L'onglet « Listes » est actif sur `/listes`, `/l/…` et `/famille/…`, « Tirages » partout ailleurs.

Pour une personne **connectée**, sur tous les écrans, quel que soit le lien par lequel elle est arrivée (son lien personnel de participant compris) :

- **en haut à droite, le menu**, avec ce qu'il contient déjà sur l'accueil : la langue, « Mon compte », « Se déconnecter ». Le bouton de langue à part disparaît ;
- **en bas, la barre « Tirages / Listes »**, l'onglet actif selon l'endroit où l'on est.

Sans session (lien personnel, lien d'une liste, lien d'invitation) : rien ne change, le bouton de langue reste, pas de barre.

Deux exceptions : le palmarès en images, en plein écran ; et un panneau du bas ouvert, qui recouvre la barre comme le fait le clavier.

**Pour le super-admin, un troisième onglet « Admin »** (décidé par Julien le 19 novembre 2026, lot 37) : « Tirages / Listes / Admin », avec une pastille qui compte ce qui est à traiter. Personne d'autre ne le voit, et l'entrée « Administration » sort du menu. C'est la seule exception à « pas de troisième onglet » (22.22).

### 22.22 Décidé : les notifications, la connexion par code, l'application installée (19 novembre 2026)

Décidé par Julien le 19 novembre 2026. Pas encore codé : lots 28 à 31 de `docs/refonte/PLAN.md`. Maquettes : `NotifAccueil`, `NotifListe`, `NotifMenu`, `NotifCentre`, `NotifReglage`, `NotifEmailResume`, `ConnexionCode`, `ConnexionCodeEmail`, `Installer`, `NotifAutoriser`.

**L'idée.** Aujourd'hui l'application prévient par email, automatiquement. Demain, chaque compte a ses **nouveautés** : elles se voient d'abord dans l'application, elles peuvent arriver sur le téléphone, et l'email devient le dernier recours, regroupé. Moins d'emails, sans rien manquer.

**Qui est concerné.** Une personne qui a un compte. Un participant qui n'a que son lien personnel, sans compte, garde les emails d'aujourd'hui.

#### Une nouveauté

Quelque chose qui concerne une personne précise, avec l'écran où aller voir. Deux niveaux :

| Niveau | Exemples |
|---|---|
| **Ce qui presse** | Ton enveloppe t'attend (le tirage vient d'être fait) ; une invitation, à rejoindre un groupe ou à tenir une liste ; la réponse à une demande de groupe ; quelqu'un te demande des pistes ; pour l'organisateur, le rappel à quelques jours de la fête |
| **Le reste** | De nouvelles pistes ; le tirage est dévoilé ; le palmarès est arrivé ; une alerte du journal ; quelqu'un a rejoint le groupe ; toutes les enveloppes sont ouvertes ; le point sur « Devine qui » ; quelqu'un a coché sur une liste que je tiens ; quelqu'un se joint à mon cadeau ; de nouvelles idées sur une liste, ou pour une personne, que je suis |

- Les nouveautés de même nature au même endroit se **regroupent** dans la journée : « 2 cadeaux ont été cochés sur ta liste ».
- Une nouveauté est **vue** quand la personne ouvre ce qu'elle signale. Il n'y a pas de bouton « tout marquer comme lu ».
- Au bout de trente jours, une nouveauté disparaît.

#### Dans l'application

- **Des pastilles là où ça se passe** (`NotifAccueil`, `NotifListe`) : un point sur l'onglet « Tirages » ou « Listes » de la barre du bas ; « 2 nouveautés » ou un point sur la carte d'un tirage ou d'une liste ; un petit point dans la marge devant une ligne de liste qui a changé depuis ma dernière visite. La pastille s'efface quand on a vu la chose.
- **« Quoi de neuf », dans le menu** (`NotifMenu`, `NotifCentre`) : première ligne du menu, avec son compteur ; le bouton du menu porte un point quand il y a du nouveau. La page liste les nouveautés par jour (« Aujourd'hui », « Hier », « Cette semaine ») : une icône, ce qui s'est passé, où et quand. Une ligne pas encore vue est en gras, avec un point. Ouvrir cette page ne marque rien comme vu : c'est la même information que les pastilles, en liste.
- Pas de troisième onglet dans la barre du bas.
- Quand l'application est ouverte, pastilles et compteur se mettent à jour en direct, par le mécanisme du lot 26 ; sans lui, au retour sur la page.

#### Suivre une liste, ou une seule personne

Décidé par Julien le 19 novembre 2026. Pas encore codé : lot 29 bis. Maquette : `ListeSuivre`.

- **Suivre**, c'est demander à être prévenu des nouvelles idées sur une liste qu'on ne tient pas : toute la liste, ou seulement certaines personnes (« je veux savoir quand il y a du nouveau pour Léo »).
- **Une cloche au bout du nom de chaque personne**, sur la liste ouverte par son lien : vide, je ne la suis pas ; pleine, je la suis. Sous le mot de la liste, une ligne dit où j'en suis (« Tu es prévenu des nouvelles idées pour Léo. ») et propose « Suivre toute la liste ».
- **Suivre toute la liste** prévient aussi quand une personne y est ajoutée. Suivre une personne ne prévient que de ses idées à elle.
- **Ce que suivre change** : sans suivre, les nouvelles idées ne se voient que dans l'application, par les pastilles. En suivant, elles arrivent aussi sur le téléphone et dans le résumé par email, selon « Me prévenir ». C'est du niveau « le reste », regroupé dans la journée : « 3 nouvelles idées pour Léo, sur Noël 2026 ».
- **Sans compte**, toucher une cloche demande l'adresse email, comme pour cocher.
- **Arrêter** : retoucher la cloche ; un lien dans chaque email ; et la liste de ce que je suis, dans « Me prévenir ».
- Une liste passée ne prévient plus. Une idée corrigée ou supprimée ne prévient pas.
- Ceux qui tiennent la liste ne voient pas qui la suit.

#### « Me prévenir » : le téléphone et l'email se règlent à part

Dans « Mon compte » (`NotifReglage`).

| Réglage | Choix |
|---|---|
| **Sur ce téléphone** | Un interrupteur « Notifications » : tout de suite, à chaque nouveauté. Par appareil |
| **Par email** | « Un résumé le matin » (par défaut), « Tout de suite », « Aucun email » |

- **Le résumé** (`NotifEmailResume`) : un seul email par jour, le matin, en texte seul, avec ce qui n'a pas encore été vu, un bloc par tirage ou par liste. Rien à dire, pas d'email.
- **Ce qui presse**, avec le résumé : l'email part quand même tout de suite, sauf si la nouveauté a déjà été vue. Quand la personne a des notifications sur un téléphone, on attend dix minutes avant d'envoyer cet email.
- **« Tout de suite »** : un email à chaque nouveauté.
- **« Aucun email »** : seul l'email de connexion part encore.
- Les emails n'ont pas d'image (23.5).

#### La connexion par code, dans l'application installée

- Safari et l'application installée ne partagent pas leur session, et un lien reçu par email s'ouvre dans le navigateur : le lien magique ne peut pas connecter l'application installée.
- **Quand l'application tourne installée** (sur iPhone comme sur Android), on se connecte par un **code à six chiffres** (`ConnexionCode`) : l'adresse, puis six cases, validées au sixième chiffre ; « Renvoyer un code », « Utiliser une autre adresse ».
- L'email (`ConnexionCodeEmail`) met le code dans son objet et en gros dans le message, sans lien.
- Le code est valable 15 minutes, ne sert qu'une fois, sur l'appareil qui l'a demandé, cinq essais au plus. Les mêmes limites d'envoi que le lien magique.
- **Dans un navigateur, rien ne change** : le lien magique, et « Confirmer sur cet appareil ».

#### L'application installée

- L'application devient installable (manifeste, icônes, couleurs de Sorbet).
- **Proposer l'installation** : dans « Me prévenir », et une fois sur l'accueil d'une personne connectée, sur téléphone, dans un navigateur. Sur iPhone, un panneau explique les trois gestes (`Installer`) ; sur Android, un bouton « Installer » déclenche la proposition du téléphone. Jamais dans l'application déjà installée.
- **Les notifications du téléphone** : sur iPhone, elles n'existent que dans l'application installée (iOS 16.4 et plus). On les demande par un panneau à nous (`NotifAutoriser`), puis par la question du téléphone, toujours après un geste de la personne. Toucher une notification ouvre l'écran concerné.
- **La pastille sur l'icône** de l'application montre le nombre de nouveautés pas encore vues, là où le téléphone le permet.

### 22.23 Décidé : la page de présentation (19 novembre 2026)

Décidé par Julien le 19 novembre 2026. Pas encore codé : lot 32 de `docs/refonte/PLAN.md`, **à faire en dernier**, quand tout ce qu'elle présente existe (lots 23 bis à 31). Maquette : `Landing`.

**L'idée.** Celui qui arrive sur `/` sans session ne voit plus seulement le logo et la connexion : il voit ce que fait l'application. La page se lit d'un trait sur un téléphone, de haut en bas.

| Bloc | Ce qu'il dit |
|---|---|
| L'en-tête | Le sapin, « Under the Tree », « Le Secret Santa de la famille, et les listes de cadeaux qui vont avec. », puis « Créer un compte » et « Se connecter » |
| Le lien personnel | L'encadré vert d'aujourd'hui : « Tu as reçu un lien personnel ? Ouvre-le directement : il fonctionne sans compte. » |
| Le tirage | Secret : l'organisateur ne voit pas qui offre à qui, et s'il regarde un résultat en dernier recours, tout le groupe le sait ; les règles (pas soi-même, pas son conjoint, pas la même personne que les années passées) ; un lien par personne ; le journal que tout le groupe lit |
| Les pistes | Six questions, trente secondes, lues par son Père Noël |
| Devine qui | Les pronostics, puis le palmarès en images |
| Les listes | Pas de doublon, le cadeau à plusieurs, la liste tenue à deux et en direct |
| Et aussi | L'application installée, les notifications et le résumé du matin, la connexion sans mot de passe, la mémoire d'une année sur l'autre, les trois langues |
| Tes données | « En clair, et le moins possible » : aucune publicité, aucun traceur, aucune revente ; ni mot de passe ni numéro de téléphone ; à chaque écran on sait qui verra ce qu'on écrit ; refuser les emails, télécharger ou supprimer ses données. Un lien vers « Tes données, en clair » (22.26) |
| Bientôt | L'assistant, voir ci-dessous |
| La fin | « Prêt pour cette année ? », les deux boutons, et le choix de la langue |

- **« Créer un compte » et « Se connecter »** mènent aux écrans de connexion actuels, qui ne changent pas. La page ne contient plus le champ d'adresse elle-même.
- **Deux mises en page, une seule page** : sur téléphone (`Landing`), tout s'empile ; sur un écran large (`LandingDesktop`), l'en-tête porte « Se connecter » et « Créer un compte » à droite, le titre est à gauche de deux captures, les quatre blocs alternent texte et capture, « Et aussi » tient sur trois colonnes.
- **Des captures d'écran, sur un écran large seulement**, chacune dans un cadre de téléphone : l'enveloppe à ouvrir, les pistes, deux écrans du palmarès, une liste. En haut de page, deux captures qui ne se ressemblent pas : une claire (l'enveloppe) et une foncée (le palmarès). Dans les maquettes, ce sont les maquettes elles-mêmes, réduites. Dans l'application, ce sont de vraies captures, faites à partir des données de démonstration : jamais une donnée réelle. **Le téléphone est dessiné, pas un simple cadre** : tranche en métal, boutons sur les côtés, bord noir, barre d'état (l'heure, le réseau, la batterie), encoche, trait du bas, léger reflet sur l'écran, ombres en plusieurs couches, et un halo de la couleur du bloc derrière lui. **Elles ne sont pas posées à plat** : sur un écran large, chaque téléphone est incliné en perspective et tourné vers son texte, donc une fois d'un côté, une fois de l'autre ; **sur téléphone, pas de capture** (décidé par Julien le 19 novembre 2026).
- **Une petite icône par bloc** : une tuile en autocollant, à gauche du titre sur téléphone (44 px), au-dessus du texte sur un écran large (52 px), une enveloppe sur corail pour le tirage, une étiquette sur ciel pour les pistes, un détective sur lilas pour le jeu, un cadeau sur menthe pour les listes.
- En bas, « Qui a fait ça, et pourquoi ? » mène à la page de Julien (22.24).
- **Une personne connectée ne voit jamais cette page** : `/` reste son accueil.
- **Elle ne promet que ce qui existe.** Un bloc dont le lot n'est pas fait n'est pas affiché.
- **« Bientôt : demande-le à ton assistant préféré »**, dans un encadré lilas à l'étiquette « Bientôt ». L'application se branchera sur l'assistant que chacun utilise déjà, par MCP (Model Context Protocol), le standard qui relie les assistants aux applications. Deux exemples en bulles : « Ajoute un vélo 16 pouces à la liste de Léo. », « Qu'est-ce qu'il reste à offrir à Mamie ? ». Aucune marque d'assistant n'est nommée. Une phrase rappelle que le tirage reste secret : aucun assistant ne saura qui offre à qui. **Ce n'est qu'une annonce** : le branchement lui-même n'est ni conçu ni planifié.
- Trois langues. La page est publique : elle a un titre, une description et une image d'aperçu pour les moteurs de recherche et le partage du lien.

### 22.24 Décidé : « Qui a fait ça, et pourquoi ? », et le café (19 novembre 2026)

Décidé par Julien le 19 novembre 2026. Pas encore codé : lot 33 de `docs/refonte/PLAN.md`. Maquette : `APropos`.

- Une page publique, `/a-propos`, où Julien se présente et dit pourquoi il a fait l'application. On y arrive par « Qui a fait ça, et pourquoi ? », en bas de la page de présentation, et par le menu.
- **Les textes de la maquette sont un brouillon**, écrit à partir de ce que ce README sait de lui (deux familles, des tricheurs, la page de listes qu'il tenait à la main). Julien les réécrit avant qu'on les code.
- **C'est aussi sa vitrine de développeur** (dit par Julien le 19 novembre 2026) : un bloc « Mon métier » dit ce qu'il fait, que l'application lui sert de vitrine, et donne deux liens, **LinkedIn** et **GitHub**. L'application reste gratuite.
- **Le code de l'application n'est pas public** et ne doit pas le devenir : le lien GitHub mène au profil de Julien, jamais au dépôt ; aucune page, aucun email, aucun fichier servi ne donne l'adresse du dépôt ; le dépôt reste privé.
- **« Un café ? »** : un bouton vers un service de dons extérieur, ouvert dans un nouvel onglet. Aucun paiement dans l'application, aucun script du service chargé dans la page.
- **« Écris-moi »** : une adresse de contact à créer sur le domaine. Jamais l'adresse personnelle de Julien.
- Le service de dons reste à choisir. Relevé le 19 novembre 2026 sur des comparatifs, à vérifier sur les sites des services : Buy Me a Coffee prend 5 % sur tout, plus les frais de paiement ; Ko-fi ne prend rien sur les dons de son offre gratuite, hors frais de paiement.

### 22.25 Décidé : ne plus recevoir d'emails, et les garde-fous contre les abus (19 novembre 2026)

Décidé par Julien le 19 novembre 2026. Pas encore codé : lot 35 de `docs/refonte/PLAN.md`, à faire avant d'ouvrir les groupes à tous (lot 34). Maquettes : `StopEmail`, `StopDemande`, `StopConfirme`, `StopSaisie`, `StopEnvoi`.

**L'idée.** L'application écrit à des adresses saisies par quelqu'un d'autre : un organisateur, ou celui qui tient une liste. Chacun doit pouvoir dire non une fois pour toutes, et l'application doit s'en souvenir.

- **« Ne plus recevoir d'emails d'Under the Tree »** : un lien en bas de chaque email, qui marche sans se connecter (`StopEmail`). Il ouvre une page qui pose la question (`StopDemande`) : c'est le bouton « Oui, ne plus m'écrire » qui bloque, pas l'ouverture du lien, parce que des messageries ouvrent les liens toutes seules pour les vérifier. Ensuite « C'est noté », avec « Annuler » (`StopConfirme`). Les messageries qui affichent leur propre bouton de désabonnement déclenchent la même chose.
- **Ce que ça bloque** : tout email vers cette adresse, de n'importe quel groupe, liste ou organisateur, aujourd'hui et plus tard. **Une seule exception** : l'email de connexion que la personne demande elle-même.
- **Ce que l'application garde** : pour une adresse sans compte, pas l'adresse en clair, seulement une empreinte qui permet de la reconnaître.
- **Celui qui saisit une adresse bloquée le voit** (la fiche d'une personne, « Envoyer par email », l'invitation à tenir une liste, une personne reliée à son compte) : « La personne qui a cette adresse a demandé à ne plus recevoir d'emails d'Under the Tree. Tu peux garder l'adresse, mais aucun email ne lui partira. Envoie-lui son lien autrement. » (`StopSaisie`). Le dire clairement, c'est voulu par Julien : celui qui saisit doit comprendre que c'est un choix de la personne, pas une panne. L'envoi groupé la range avec ceux qui n'ont pas d'adresse, sous « A demandé à ne plus recevoir d'emails » (`StopEnvoi`). Rien ne dit quand ni pourquoi. Pour une adresse bloquée parce qu'elle n'existe pas, la phrase est autre : « Cette adresse ne semble pas exister. »
- **Lever le blocage** : seule la personne le peut, par la page du lien, ou dans « Me prévenir » si elle a un compte.
- **« Signaler cet envoi »** : un second lien en bas des emails partis à la demande d'un organisateur. Le super-admin voit les signalements par groupe et par compte ; il peut couper l'envoi d'emails d'un groupe ou désactiver un compte.
- **Les retours du fournisseur d'emails** : une adresse qui n'existe pas, ou une plainte pour courrier indésirable, bloque l'adresse sans attendre.
- **Le premier email à une adresse** dit toujours qui l'a ajoutée et pourquoi, ce que l'application sait d'elle, et comment refuser.
- **Des plafonds** (lot 34) : emails par groupe et par jour, par compte ; plus bas pour un compte récent, jusqu'à son premier tirage.

### 22.26 À faire : les données personnelles (RGPD)

Liste de contrôle écrite le 19 novembre 2026, à la demande de Julien. **Ce n'est pas un avis juridique** : à faire relire, et à confronter aux fiches de la CNIL. Lot 36.

**Le cap, fixé par Julien le 19 novembre 2026 : être exemplaire, et le plus transparent possible.** Aller au-delà de ce qui est obligatoire, et le dire avec des mots simples. C'est aussi un argument de la page de présentation (22.23).

- **À chaque endroit où l'on saisit une donnée personnelle, une ligne dit qui la verra et à quoi elle sert** (règle 23.3). Retouché dans les maquettes : `Connexion`, `ConnexionCreer`, `Rejoindre` (mon adresse) ; `PersonneNouvelle`, `GroupePersonne`, `EnvoiAjouterEmail`, `ListeTeneurs` (l'adresse de quelqu'un d'autre : « Elle recevra un email qui dit que c'est toi qui l'as ajoutée. Elle pourra refuser les emails de l'application. ») ; `PistesTexteMoment`, `PistesTexteServirait`, `PistesTexteEviter` (« Seul ton Père Noël lira ces lignes. ») ; `ListePartager` (ce que voit celui qui a le lien).
- **Ne pas inviter à écrire des données de santé** : l'exemple « Une allergie… » du champ « J'évite, ou j'ai déjà » devient « Ce que tu n'aimes pas, ce que tu as en trop… ».
- **Le pied de chaque email** : comment refuser les emails, et « Ce que l'application fait de tes données ». L'email de connexion dit seulement qu'il part parce qu'on vient de le demander.
- **« Tes données, en clair »** (`Confidentialite`), une page publique en langage courant : ce que l'application sait et qui le voit, ligne par ligne ; ce qu'elle ne demande jamais ; les enfants ; les deux prestataires ; les durées ; les droits. **L'accès de dernier recours de l'organisateur y est dit** (demandé par Julien le 19 novembre 2026) : sous « À qui tu offres », la page écrit que l'organisateur ne voit pas les résultats, qu'en dernier recours il peut en regarder un seul à la fois (8.7), que tout le groupe le lit alors dans le journal avec le prénom concerné, et qu'il peut aussi dévoiler le tirage à tous. La page de présentation ne dit donc plus « même l'organisateur ne voit pas », mais « L'organisateur ne voit pas qui offre à qui. S'il regarde un résultat en dernier recours, tout le groupe le sait. » Enfin, les deux pages disent qu'on peut saisir la CNIL si la réponse de Julien ne convient pas. Elle dit aussi ce qui fâche (validé par Julien le 19 novembre 2026) : les résultats sont chiffrés mais la clé est sur le serveur, donc celui qui héberge pourrait techniquement les lire et s'engage à ne pas le faire ; l'administrateur voit les comptes (adresse, groupes, dernière visite).
- **« Mes données »** (`CompteDonnees`), dans « Mon compte » : ce que l'application sait de moi, télécharger mes données, les emails, supprimer mon compte, avec ce qui est effacé et ce qui reste.
- **Aucune publicité, aucun traceur, aucune revente** : décidé par Julien le 19 novembre 2026, et écrit tel quel sur la page de présentation et sur « Tes données, en clair ».

| Sujet | Où en est l'application | À faire |
|---|---|---|
| Informer ceux qu'un autre a ajoutés | L'email d'envoi ne dit pas tout | Le premier email (22.25) et une page « Confidentialité » : qui est responsable, d'où vient l'adresse, à quoi elle sert, combien de temps, comment refuser |
| Pages légales | Aucune | « Confidentialité » et « Mentions légales », publiques, liées en bas de la page de présentation et de chaque email |
| Droit d'accès | Le profil se lit dans l'application | « Télécharger mes données » dans « Mon compte » |
| Droit à l'effacement | La désactivation par le super-admin | « Supprimer mon compte » ; une demande de retrait pour une personne sans compte |
| Droit d'opposition | Rien | « Ne plus recevoir d'emails » (22.25) |
| Durées de conservation | Tout est gardé | **Décidé par Julien le 19 novembre 2026** : un compte sans visite depuis trois ans est supprimé, après un email qui prévient ; des anciens tirages, il ne reste que ce qui sert à la règle « pas la même personne ». Julien répond aux demandes sous un mois. Restent à décider : le journal, les empreintes de blocage |
| Le moins de données possible | Aucun numéro de téléphone ; résultats chiffrés | Dans les listes : l'âge plutôt que la date de naissance partout où il suffit |
| Les enfants | Une liste montre un prénom, un âge et des tailles à qui a le lien | Le dire à celui qui tient la liste au moment de partager ; ne pas laisser les moteurs de recherche lire une liste |
| Ceux qui hébergent | Cloudflare, Resend | Leurs contrats de sous-traitance, où sont les données, les nommer dans « Confidentialité » |
| Cookies | Un seul, pour la session | Aucun bandeau tant qu'il n'y a aucun traceur : s'y tenir (pas de script tiers, page du café comprise) |
| Sécurité | Jetons, chiffrement, journal | Une marche à suivre en cas de fuite : qui prévenir, sous quel délai |
| Registre | Aucun | Un document court dans le dépôt : chaque traitement, sa raison, ses données, sa durée |

### 22.27 Décidé : le tableau de bord du super-admin (19 novembre 2026)

Demandé par Julien le 19 novembre 2026. Pas encore codé : lot 37. Maquette : `Admin`.

- **L'administration et le tableau de bord ne font qu'une page** (décidé par Julien le 19 novembre 2026) : l'accueil de l'administration, `/admin`, atteint par l'onglet « Admin » de la barre du bas (22.21). De haut en bas : ce qui est à traiter (une demande de groupe, avec « Traiter »), le choix de la période, les quatre blocs ci-dessous, puis « Tout voir » (Comptes, Groupes, Guide de style). L'ancienne jauge « Capacité » est remplacée par « Les plafonds ».
- **Des pastilles intégrées** : sur l'onglet « Admin », le nombre de choses à traiter (demandes de groupe en attente, signalements pas encore vus, plafond passé à 70 %) ; dans la page, la même pastille pleine devant chaque chose à traiter. Elle s'efface quand la chose est traitée ou vue. Lisible par un lecteur d'écran (« Admin, 3 à traiter »).
- La période au choix : aujourd'hui, 7 jours, 30 jours.
- **Qui s'en sert** : les comptes et les nouveaux, les personnes actives (comptes connectés et liens personnels ouverts), les groupes et les tirages en cours, les listes et celles qui sont partagées.
- **Les plafonds** : les emails du jour et du mois, les requêtes du jour, la dépense du mois, chacun en face de sa limite. À 70 % d'un plafond, le super-admin est prévenu (une nouveauté « qui presse », 22.22).
- **À surveiller** : les signalements et les adresses qui ont refusé les emails (22.25), les emails rejetés, les erreurs du serveur. Chaque ligne mène à sa liste.
- **Ce qui tourne tout seul** : le dernier passage de chaque tâche planifiée et ce qu'elle a fait ; la version en ligne.
- **Des comptes par jour, jamais qui a fait quoi** : l'application compte elle-même, côté serveur, sans outil de mesure extérieur, sans cookie de plus, sans identifiant de personne. Le journal d'un groupe reste la seule trace nominative, et il appartient au groupe.

## 23. Design system

Léger, fait le 14 novembre 2026 avant la v2. Nuxt UI 4 fournit les composants de base ; ce qui suit est la couche propre à l'application. Complété par la refonte des écrans (15 au 17 novembre 2026). La page **Guide de style** (`/admin/guide-de-style`, super-admin, dernière ligne de l'administration) montre tout ce qui est décrit ici, et `tests/e2e/design.spec.ts` vérifie qu'elle s'affiche, dans la langue choisie dans le menu.

### 23.1 Jetons

Définis dans `app/assets/css/main.css`, aux valeurs du style « Sorbet » (23.5, lot 23). Les écrans nomment un **rôle**, jamais une teinte.

| Jeton | Rôle |
|---|---|
| `bg-page` | Fond de page (crème rosé) |
| `bg-default` | Carte, ligne de liste (blanc, jeton Nuxt UI) |
| `bg-muted` | Texte cité, aperçu d'un message, pastille (pêche clair) |
| `bg-skeleton`, `bg-skeleton-soft` | Chargement, sur la page et sur une ligne blanche |
| `bg-track` | Partie vide d'une barre de progression |
| `bg-divider`, `border-default` | Trait entre deux lignes, entre deux étapes ; bord (pêche) |
| `border-accented`, `line-strong` | Bord marqué : champ, pointillés, case à cocher vide ; en fond, la case que quelqu'un d'autre a cochée |
| `text-default`, `text-toned`, `text-muted` | Texte (prune), texte secondaire, texte discret (jetons Nuxt UI). `text-muted` ne se pose pas sur un fond doux ou teinté : il n'y atteint pas 4,5 pour 1, on y met `text-toned` |
| `veil` | Le voile derrière un panneau du bas |
| `shadow-card` | Le bord pêche de 1,5 px et la bande de 3 px sous une carte ; `shadow-award` la bande verte de l'entrée « palmarès » du journal |
| `envelope`, `envelope-fold`, `envelope-line`, `shade`, `star`, `star-soft`, `wood` | Les illustrations : le papier, du clair au soutenu, son filet, l'ombre sous les choses, l'étoile lilas (aussi devant une idée précise) et son ton clair, le tronc du sapin |
| `thread`, `alert`, `alert-ink`, `alert-link` | Le fil du journal ; une alerte du journal (rond violet à l'icône blanche, texte et lien posés sur le fond lilas). L'utilitaire `knot` entoure un nœud du fil de la couleur de la page |
| `restricted`, `restricted-ring` | Le cadre en pointillés de ce qui n'est qu'au super-admin |
| `stack`, `stack-back` | Les bords des cartes en attente sous la première d'une pile |
| `*-tint`, `*-soft`, `*-ink` (`primary`, `success`, `warning`, plus `warning-ring`, `error-soft`, `error-ink`) | Teintes d'une couleur de sens : `tint` le fond d'un pavé ou d'un encadré, `soft` celui d'un halo, d'un bouton rond à presser, d'un rond d'état ou d'un surlignage (la même teinte que `tint` dans Sorbet), `ink` le texte et les icônes posés dessus |
| `primary-deep`, `success-deep`, `error-deep` | Un cran plus foncé : un bouton plein pressé, le texte d'un encadré de danger |
| `warning-fill` | Le lilas plein de ce qui signale sans texte blanc dessus : la case d'un cadeau à plusieurs |
| `story-coral`, `story-mint`, `story-violet`, `story-plum`, `story-cream` | Les fonds du palmarès en images, foncés, texte blanc (la crème a un texte prune) |
| `primary` (corail), `secondary` et `success` (menthe foncée), `warning` (lilas), `error` (canneberge) | Action, réussite, attention, danger (`app/app.config.ts`). `text-primary` est un cran plus foncé que `bg-primary`, pour rester lisible sur la page ; attention et danger utilisent une teinte assez sombre pour rester lisibles en texte sur blanc |

**Polices** : `font-display` (Outfit, 600 et 700) pour les titres, `font-sans` (DM Sans, 400 à 700) pour le texte ; chargées par `@nuxt/fonts` (`fonts` dans `nuxt.config.ts`).

**Coins**, par ce qu'ils arrondissent (les noms sont ceux de Tailwind) : `rounded-sm` 8 px (case à cocher), `rounded-md` 16 px (bouton, champ, zone de texte), `rounded-lg` 14 px (petite tuile), `rounded-xl` 18 px (encadré), `rounded-2xl` 28 px (carte), `rounded-3xl` 32 px (haut d'un panneau), `rounded-bubble` 24 px (bulle de message, coin bas gauche à 6 px).

Les teintes brutes (`--color-coral-*`, `--color-mint-*`, `--color-lilac-*`, `--color-peach-*`, `--color-plum-*`, `--color-cranberry-*`) ne servent qu'à définir ces jetons. Les couleurs des icônes de personne sont dans `app/utils/avatars.ts`, celles des tuiles carrées des listes dans `app/utils/listShades.ts`.

### 23.2 Composants d'interface (`app/components/ui`)

Sans aucun texte ni logique métier ; les composants de `admin/` et `participant/` sont construits dessus.

| Composant | Rôle |
|---|---|
| `UiPageTitle` | Le titre d'un écran, un seul par page (`h1`) |
| `UiSectionTitle` | Le petit titre en capitales au-dessus d'un groupe, en DM Sans même quand c'est un `h2` |
| `UiCard` | Surface blanche au bord pêche, une bande pleine dessous (`shadow-card`), coins de 28 px ; `padding` `md`, `lg` ou `none` |
| `UiList`, `UiListItem` | Liste pleine largeur ; une ligne est un lien (`to`), un bouton (`on-click`) ou un simple affichage, avec icône ronde de 40 px (corail pour ce qui est à faire, grise sinon : `icon-tone="neutral"`, rouge pour `tone="danger"`), emoji ou icône de personne, et un emplacement `trailing` ; le chevron va avec un lien ou une valeur, `chevron` le force (`true`, un bouton qui ouvre un panneau) ou le retire (`false`) ; 60 px de haut, titre en semi-gras, sous-titre en 13 px ; une ligne de réglage montre sa valeur à droite (`value`, avec chevron) ou un interrupteur (`v-model:checked`) |
| `UiAvatar` | L'icône d'une personne, en quatre tailles : `sm` 32 px, `md` 40 px, `lg` 56 px (en-tête d'une page), `xl` 80 px (résultat, fiche, choix de l'icône). L'emoji est une image (`UiEmoji`), la même sur tous les appareils (lot 15) : le dessin d'Apple, 64 px, copié dans `public/emoji` depuis le paquet de développement `emoji-datasource-apple` par `pnpm emoji:copy` (30 images, une par emoji d'`AVATAR_EMOJIS` ; `emojiImagePath`, `tests/emoji-images.test.ts`). Si l'image ne charge pas, le caractère s'affiche. Ces images restent sous le copyright d'Apple et ne sont pas sous licence libre : choix assumé pour un usage familial ; si l'app s'ouvre plus largement, passer à Noto Emoji (Apache 2.0) ou à Fluent Emoji (MIT) en changeant seulement le dossier des images. Les emails et les messages gardent les caractères |
| `UiTextPreview` | Un texte tel qu'il a été écrit ou sera envoyé |
| `UiMessageBubble` | Un message tel que la personne le lira, dans une bulle (92 % de large au plus, coin bas gauche resserré) : ses mots, puis son lien seul sur sa ligne, en gras, sans `https://`, coupé s'il est trop long (`aroundLink`) |
| `UiSegmented` | Un choix parmi quelques-uns, côte à côte sur une piste grise ; le choix fait est blanc et en gras. Des boutons radio natifs dessous : les flèches changent le choix |
| `UiStepper` | Frise d'étapes : faite (rond vert, coche), en cours (rond corail, halo, `aria-current="step"`), à venir (rond vide). Non cliquable |
| `UiActionCard` | « À faire maintenant » : étiquette en capitales (lilas avec `tone="warning"`, quand il faut d'abord corriger), titre, preuve dans le slot par défaut (phrase, compteurs, barre), action dans le slot `action`, ligne d'aide ; une illustration peut coiffer la carte (emplacement `illustration`) |
| `UiCounters` | Trois pavés chiffre et libellé, tons `primary`, `warning`, `success` |
| `UiAvatarStack` | Quatre icônes de personne au plus qui se recouvrent, puis « +N » (`stackOf`) |
| `UiSheet` | Panneau du bas autour de `UDrawer` : titre (Outfit 22 px), description, corps, pied (action et sortie), en-tête remplaçable ; `busy` l'empêche de se refermer pendant une action ; `ui` ajoute des classes au titre, à la description ou à l'espacement (le panneau du journal, plus serré). Le corps a 4 px de marge en haut et en bas, pour que le cadre d'un encadré collé au bord ne soit pas coupé |
| `UiSkeleton` | Un écran qui arrive, en pièces grises à la place et à la taille de ce qu'elles annoncent (dont `journal`, une frise verticale) ; `AdminQueryState` et `ParticipantScreen` s'en servent |
| `UiCountBadge` | Un nombre dans une pastille corail au bout d'une ligne ou d'un élément de menu (les demandes à traiter), lu en toutes lettres par les lecteurs d'écran |
| `UiStack` | Une carte posée sur une pile : un bord de carte par élément en attente derrière, deux au plus |
| `UiRestricted` | Ce que seul un super-admin voit sur un écran que tout le monde voit : un cadre en pointillés titré sur sa bordure (bouclier et « Super-admin »), sans phrase d'explication ; `flush` pour des lignes bord à bord |
| `UiCheckRow` | Une personne à cocher : icône, nom, une ligne dessous (ou l'emplacement `subtitle`, pour une icône), case native de 24 px ; toute la ligne coche |
| `UiStickyFooter` | L'action principale d'un écran, en bas. Sur un long écran où l'on choisit : une bande blanche collée en bas, au-dessus de la barre « Tirages / Listes » quand il y en a une. Sur une page où l'on rédige (`inline`) : dans la page, à la fin du contenu, sans rien au-dessus du clavier ; toucher hors du champ ferme le clavier (`useTapOutsideToBlur`) |
| `UiTabBar` | La barre du bas d'une personne connectée, sur tous les écrans (22.21) : « Tirages » et « Listes », l'onglet où l'on est en couleur |
| `UiPointList` | Quelques points, chacun après un petit rond ou son icône ; `tone` colore les marques (rouge pour ce qui se perd, vert pour ce qui reste) |
| `UiJournalPreview` | « Ce que le groupe lira dans le journal » : la ligne dans une carte blanche, avant l'action qui l'écrit |
| `UiTagList` | Quelques mots côte à côte, chacun dans une pastille pêche, qui passent à la ligne : les réponses de « Moi et les cadeaux ». Une étiquette peut être un lien (36 px à l'œil, 44 px au doigt) ou, en pointillés corail après un « + », ce qui manque |
| `UiStar` | L'étoile lilas à quatre branches, pleine, devant une idée précise |
| `UiConfirmBox` | La case « Je comprends que… » à cocher avant une action qui ne se rattrape pas |
| `UiPageContext` | Où se trouve un écran, en une ligne grise au-dessus du titre : « {Groupe} · {Édition} », chaque morceau un lien de 44 px vers l'accueil du groupe ou l'édition (`useScreenContext`, qui donne aussi le titre de l'onglet, `pageTitle`) |
| `UiPersonField` | Un champ qui contient une personne (icône et prénom, ou une indication) et ouvre le choix d'une personne |
| `UiChoiceList` | Une valeur parmi quelques-unes, une ligne par choix avec son bouton radio et son aide ; la ligne choisie est teintée. `UiChoiceSheet` s'en sert, un panneau peut l'ajouter sous un champ |
| `UiSpinner` | La petite roue (20 px) d'une ligne ou d'un interrupteur qui enregistre, avec son texte pour les lecteurs d'écran ; `UiListItem busy` la met à la place du chevron. Dans un bouton, c'est le `loading` de `UButton`. Elle ne tourne pas si `prefers-reduced-motion` |
| `UiNotice` | `info` (ligne discrète), `positive` (bandeau vert), `caution` (bandeau lilas encadré, à savoir), `warning` (encadré avec titre), `danger` (encadré rouge épais, titre avec icône, pour ce qui ne se rattrape pas), `checklist` (lignes validées ou en attention, avec emplacements `trailing` et `detail`) |
| `UiEnvelope` | L'enveloppe d'un tirage, selon `envelopeState` : `UiEnvelopePending` (pointillés, horloge), `UiEnvelopeSealed` (papier pêche, cachet de cire corail à l'étoile, brin de sapin et baies lilas), `UiEnvelopeOpened` (ouverte, la carte à l'étoile), `UiEnvelopeLocked` (cadenas). Redessinées au lot 18 d'après les maquettes, une illustration par composant, les couleurs du design system par leurs jetons. Décoratives |
| `UiEnvelopeSent` | L'enveloppe d'un lien de connexion envoyé, avec sa coche verte (« Regarde ta boîte mail ») |
| `UiPodium` | Le podium du palmarès de « Devine qui » (lot 19), prêt mais pas encore affiché |
| `UiIllusTree`, `UiIllusTreeEmpty`, `UiIllusWreath`, `UiIllusParcels`, `UiIllusLabel`, `UiIllusLetter`, `UiIllusSeats`, `UiIllusChecklist` | Les huit illustrations de Sorbet (23.5, lot 23), une par composant, 184 sur 128, dessinées d'après `docs/refonte/sorbet/illus2.py` dans la manière des enveloppes, couleurs par les jetons : le sapin et ses paquets, le sapin au paquet en pointillés, la couronne, les trois paquets cochés, l'étiquette, la lettre cochée, les places à remplir, la feuille à cocher. Décoratives ; le sapin et la couronne prennent un `label` quand ils remplacent le logo |
| `UiTile` | Une chose à faire sur la page d'un tirage (22.16) : `todo` cerclée de corail, `done` avec sa coche, `idle` ; seule sur toute la largeur, `compact` à deux |
| `UiGiftTag` | Carte en forme d'étiquette cadeau, un trou rond en haut au centre, contenu dans le slot |
| `UiPersonPicker` | Choix d'une personne dans un `UiSheet` ; au-delà de 10, une recherche (`UiSearchField`) sans accents ni casse, lettres trouvées surlignées (`matchesName`, `highlightName`) |
| `UiSearchField` | Champ de recherche au-dessus d'une liste de plus de 10 personnes : loupe, libellé, croix pour vider. La recherche montre tous les résultats, sans repli |
| `UiFoldRow` | La ligne qui remplace la suite d'une longue liste : trois icônes de personne, « Voir les N autres » et, si besoin, l'état de la série (emplacement `detail`, pour son icône), un chevron ; puis une petite bande avant la suite. La même ligne, sans les icônes et chevron vers le haut, replie une liste dépliée (« Replier la liste ») |
| `UiFoldedRows` | Les lignes d'une liste repliée, dans son `<ul>` : les premières lignes, puis « Voir les N autres » ; un appui déplie tout d'un coup (décidé par Julien le 16 novembre 2026 : jamais « Voir les N autres » et « Replier la liste » ensemble), et « Replier la liste » vient en dernière ligne ; replier ramène la fin de la liste à l'écran (`foldList`, `listView`). Chaque ligne est dessinée par l'emplacement `row` |
| `UiSettingSheet` | Cadre de tout panneau de réglage : titre, aide, contenu, « Valider » et « Annuler » ; un enregistrement refusé s'affiche en ligne rouge au-dessus du bouton, le panneau reste ouvert et la saisie est gardée |
| `UiChoiceSheet`, `UiTextSheet`, `UiNumberSheet` | Sur `UiSettingSheet` : une valeur parmi plusieurs (aide par choix), un texte avec son compteur (`hide-label` quand le titre nomme déjà le champ), un nombre entre bornes (moins, nombre, plus ; le nombre se tape aussi, ramené dans les bornes en quittant le champ, décidé par Julien le 17 novembre 2026). La valeur n'est gardée qu'avec « Valider » |
| `UiTextField` | Le champ d'une page où l'on rédige (23.3, Correction 18) : son nom en petites capitales, « (facultatif) », le champ (plusieurs lignes qui grandissent, ou une), l'aide à gauche et le compteur à droite ; ce qui va entre le nom et le champ (les messages tout prêts) dans son emplacement. `UiTextSheet` ne sert plus qu'aux champs courts d'une ligne |

Fonctions pures qui les servent, testées : `stackOf`, `foldList` et `listView` (`shared/utils/lists.ts`), `followSeries` (`server/utils/editions.ts`), `matchesName` et `highlightName` (`shared/utils/names.ts`), `participantSteps` et `envelopeState` (`server/utils/personal.ts`).

Composants construits dessus et réutilisés : `AdminAvatarSheet` (choisir l'icône d'une personne, le même panneau partout ; sur `UiIconSheet` et `UiIconPicker`, refaits au lot 20 : l'icône en direct, le titre et le bouton rond « Au hasard » (un symbole et une couleur tirés), les emojis rangés par famille (Enfants et jeux, Personnages, Animaux, Gourmandises, Boissons, Activités, Nature, Décor de Noël : `AVATAR_GROUPS`, 172 emojis, ajoutés en fin de `AVATAR_EMOJIS` pour ne changer aucune icône par défaut), chaque famille sous son titre, sur trois rangées qui défilent de côté, ouvertes sur celui choisi, puis « Couleur » et les couleurs sur une ligne, « Annuler » et « Valider » côte à côte. `UiIconSheet` prend une forme, ronde ou carrée, des couleurs et des familles : les listes de cadeaux s'en servent), `AdminStatusBadge`, `AdminDateField` (un jour dans un champ, chiffres et icône de calendrier, qui ouvre le calendrier en panneau ; tant qu'il est vide, la date proposée en pastille dessous), `LanguageSwitch`, `AdminPersonHeader` (l'icône avec son crayon, d'une personne ou de son propre compte), `AdminCapacityBar` (la capacité de l'application), `AuthScreen` (le cadre des écrans d'avant la connexion : invitation, lien de connexion).

Journal (section 9) : `JournalView` (les vues, l'édition, les panneaux), `JournalList` (la frise), `JournalGroup` (une ligne repliée), `JournalHelpSheet`, `JournalAlertSheet` ; l'allure de chaque événement est dans `app/utils/journalLook.ts`.

Panneaux et états communs de l'administration : `AdminDateSheet`, un jour dans un panneau de réglage (calendrier, jour en toutes lettres et compte à rebours, facultatif avec `clear-label`), dont `AdminPartyDateSheet` (date de la fête d'une édition) est un usage ; `AdminQueryState`, le chargement (`UiSkeleton`, composé par l'écran de `title`, `header`, `stepper`, `steps`, `card`, `envelope`, `groups`, `journal`, `list` : l'édition, l'accueil et la page d'un tirage ont chacun le leur ; il n'apparaît qu'après 200 ms) et l'erreur (carte avec « Réessayer », qui relance les requêtes de l'écran, et un retour ; accès refusé ou page introuvable : la phrase et le retour à l'accueil).

Écran d'une édition (section 11), construit sur ces composants : `AdminEditionHeader`, `AdminEditionPrepare`, `AdminEditionFollow`, `AdminEditionRuleRows` (budget et petit mot), `AdminDrawSheet`, `AdminSendSheet`, `AdminDateSheet`, `AdminPartyDateCard`.

Administration (section 11) : `AdminRequestSheet` (une demande, et ce que l'accepter change), `AdminAccountRow`, et la décision commune `useDecideRequest`.

Accueil (section 11), construit sur `UiActionCard`, `UiEnvelope` et `UiNotice` sans nouveau composant d'interface : `HomeTopCard` (la carte « À faire maintenant »), `HomeDrawCard` (le tirage unique), `HomeDrawRow`, `HomeGroupCard`, `HomeRequestSheet`, `HomeRequestCard` (une demande de groupe en attente ou refusée). Plus aucun emoji comme icône : enveloppe fermée (à découvrir), horloge (pas encore tiré), enveloppe ouverte (déjà vu), archive (clôturé).

### 23.3 Règles

- Une colonne de la largeur d'un téléphone (`max-w-md`) sur tous les écrans ; les barres du haut et du bas prennent toute la largeur ; les panneaux du bas restent dans la colonne.
- Une action courte sur un élément s'ouvre dans un **panneau du bas** (`UDrawer`) ; un formulaire long a son propre écran.
- **Choisir dans un panneau, rédiger sur une page** (décidé par Julien le 18 novembre 2026, après le bug du clavier : sur téléphone, un champ saisi dans un panneau du bas disparaissait sous le clavier). Le panneau remonte maintenant au-dessus du clavier, mais y saisir du texte reste fragile : le clavier prend la moitié de l'écran, le panneau devient étroit et doit défiler, et on peut le fermer par erreur en glissant vers le bas. Correction 18 de `docs/refonte/PLAN.md`.
  - Un panneau du bas sert aux choix (un mode, une date, une langue), aux confirmations, et à **un seul champ court** : un nombre, un nom, une adresse email, un identifiant ou une phrase à recopier.
  - Dès qu'on **rédige** (un texte de plus d'une ligne, ou plusieurs champs), c'est une page à part. Le contexte au-dessus du titre, le titre, le champ en haut avec son aide et son compteur de caractères, « Valider » fixé en bas de l'écran, et « Retour » qui abandonne. Le modèle est l'écran « Personnaliser le message » (maquette `DevineRappelPersonnaliser`).
  - **Clavier ouvert** : la règle du 18 novembre 2026 (« Valider » posé sur le clavier, comme dans une messagerie) est **abandonnée** le 19 novembre 2026 : voir « Rien ne se place au-dessus du clavier », plus bas. Le champ grandit toujours jusqu'à six lignes puis défile. Sous un bouton du bas, la place de la barre d'accueil ou 1 rem, pas les deux.
  - Les confirmations d'une action qui ne se rattrape pas (« Supprimer le groupe », « Dévoiler avant la fête ») restent des panneaux, même avec une phrase à recopier : le panneau garde le contexte sous les yeux.
- Un panneau enregistre avec un bouton « Valider » ; le fermer autrement abandonne. **Un réglage s'enregistre seul** (décidé par Julien le 16 novembre 2026) : à la validation de son panneau, ou dès qu'un interrupteur bascule ; pas de bouton « Enregistrer » en bas de page. La nouvelle valeur s'affiche tout de suite, la ligne montre la roue, et une erreur remet l'ancienne valeur avec un toast (`useRuleSaver` pour les règles du groupe, `useProfileSaver` pour son propre profil, de même pour le lien d'invitation et le quota d'un compte).
- **Rien ne se place au-dessus du clavier** (décidé par Julien le 19 novembre 2026 : sur téléphone, une barre ou un bouton collé au clavier ne tient pas). Sur une page où l'on rédige, « Valider » est **dans la page**, à la fin du contenu, et non dans une bande collée en bas ; le clavier passe par-dessus, et toucher hors du champ le ferme. Dans une liste, les actions d'une ligne sont dans le document, sous la ligne (22.20). Cela remplace « "Valider" fixé en bas de l'écran » de la règle précédente. **Fait** (Correction 19) : `UiStickyFooter inline` sur les douze pages où l'on rédige ; les pieds collants des écrans où l'on choisit (participants, emails, relance, pronostics) restent collés en bas, sans suivre le clavier.
- **Qui verra ce que j'écris** (décidé par Julien le 19 novembre 2026) : sous tout champ qui reçoit une donnée personnelle, la mienne ou celle de quelqu'un d'autre, une ligne courte dit qui la verra et à quoi elle sert. Voir 22.26.
- Une cible tactile fait au moins 44 px.
- Une action dangereuse est rouge, en bas de liste, et demande une confirmation (deuxième appui, ou texte à recopier quand elle est irréversible).
- La ligne « ajouter » est en haut d'une liste de règles (exclusions), en bas d'une liste de personnes.
- Le bouton d'action d'une ligne est rond, avec une icône seule : plein et clair quand l'action reste à faire, en contour gris quand elle est faite.
- **Les bords de l'écran** (décidé par Julien le 16 novembre 2026, iPhone) : la page passe sous les coins et la barre du bas (`viewport-fit=cover`) ; rien d'actionnable ni de lisible n'y reste. Une barre, un panneau ou un pied collant étend son fond jusqu'au bord et arrête son contenu à `env(safe-area-inset-*)`. Un panneau ne dépasse jamais la hauteur visible : son corps défile, son en-tête et son pied restent en place (réglé pour tous les panneaux dans `app.config.ts`). Les toasts restent au-dessus de la barre du bas.
- **Une action en cours** (décidé le 16 novembre 2026) : la roue remplace l'icône du bouton, le libellé dit ce qui se passe (« Tirage en cours… »), le bouton garde sa taille et se désactive, le panneau ne se referme pas ; un réglage qui s'enregistre met la roue à la place du chevron. L'indicateur n'apparaît qu'après 200 ms (`useBusy`) ; un rechargement en arrière-plan ne change rien à l'écran.
- **Le contexte d'un écran** (décidé par Julien le 16 novembre 2026) : un écran rattaché à un groupe ou à une édition porte au-dessus de son titre la ligne « {Groupe} · {Édition} » (`UiPageContext`), et son onglet « {Écran} — {Groupe} · {Édition} ». Exceptions : l'écran de l'édition et l'accueil du groupe (leur titre les nomme), les panneaux, le compte et l'administration, le lien invalide. L'envoi par email à plusieurs, à barre de titre, la porte sous son titre, sans lien.
- **Ce qui n'est qu'au super-admin** sur un écran que tout le monde voit est dans `UiRestricted`, et nulle part ailleurs.
- Aucun texte en dur dans un écran du produit : tout passe par les dictionnaires (section 21). Seule exception, la page Guide de style, outil du développeur.

### 23.4 Reste à faire

- **La refonte des interfaces est faite** (lots 0 à 10, 15 au 17 novembre 2026) : le plan coché est dans [`docs/refonte/PLAN.md`](docs/refonte/PLAN.md), les maquettes en HTML dans `docs/refonte/maquettes/`. Ce qui reste est dans sa section 6 : les questions ouvertes (presque toutes des données que les routes ne renvoient pas encore) et les maquettes encore hors périmètre (tirage déjà fait ailleurs, lot 17 ; idées futures).
- Pas de paquet séparé ni de Storybook tant qu'il n'y a qu'une application.


### 23.5 Fait : le style « Sorbet » (19 novembre 2026)

Décidé par Julien le 19 novembre 2026, après des retours de plusieurs personnes : l'interface ne faisait pas assez moderne. **L'ergonomie ne change pas** : mêmes écrans, mêmes blocs, mêmes textes, mêmes tailles de cibles. Seuls changent les couleurs, les polices, les coins, les ombres et les illustrations. **Fait** (lot 23 de `docs/refonte/PLAN.md`, 19 novembre 2026) : les jetons sont décrits en 23.1, ce qui a été tranché en codant est en section 6 du plan.

**Les maquettes.** `docs/refonte/maquettes-sorbet/` contient toutes les maquettes dans le nouveau style. Elles sont **produites** par `docs/refonte/sorbet/habiller.py` à partir de `docs/refonte/maquettes/`, qui reste la source du script : une maquette se modifie dans `maquettes/`, puis on relance le script. Ce script est aussi la référence des valeurs ci-dessous. Le rendu des maquettes habillées n'a pas été contrôlé écran par écran : en cas de doute, la règle de cette section l'emporte sur le fichier.

#### Les couleurs

| Rôle | Avant | Sorbet |
|---|---|---|
| Fond de page | kraft clair `#f7f2e9` | crème rosé `#fff6f1` |
| Carte, ligne de liste | blanc cassé `#fffdf9` | blanc `#ffffff` |
| Fond doux (texte cité, piste, pastille) | `#f1e8d8` | `#ffeae1` |
| Trait, bord | `#e9dcc5`, `#dccbad` | pêche `#ffd9cc` |
| Bord marqué (champ, pointillés) | `#cdb48a`, `#a8a29e` | `#f5b8a5` |
| Texte | `#292524` | prune `#2b1b3d` |
| Texte secondaire | `#57534e` | `#6b5a7a` |
| Texte discret | `#78716c` | `#796987` |
| Action (`primary`) | brique `#b8483a` | corail `#d93a2b`, foncé `#b92d1f` |
| Texte et lien d'action | `#8a2f27`, `#a43a2f` | `#c93425` |
| Fond d'action clair | `#f6e2dd` | `#ffe3de` |
| Réussite (`success`, `secondary`) | sapin `#2f613f` | menthe foncée `#0b7a5b`, fond `#dcf7ee` |
| Signalement (`warning`) | moutarde | **lilas** : plein `#b993dd`, fond `#f1e8fc`, bord `#cbb2ee`, texte `#6a3db3` |
| Danger (`error`) | canneberge | inchangé |
| Voile derrière un panneau | `#8f877b` | `#a8959d` |

- **Plus de jaune dans l'interface.** Tout ce qui signalait en moutarde passe au lilas : encadrés d'avertissement, étiquettes, cadeau à plusieurs, étoile des idées. Seule exception : le fond « citron » des icônes de personne.
- **Une alerte du journal**, et le bandeau « Le tirage n'est plus secret » qui prend sa couleur : fond `#f1e8fc`, texte `#3b2463`, rond violet `#7b4bc4` à l'icône blanche, lien `#6a3db3`.
- **« Devine qui : le palmarès est arrivé »**, dans le journal : vert plein `#0b7a5b`, texte blanc, comme le bouton de la page des réponses.
- **Contraste** : le corail `#d93a2b` a été choisi pour que le texte blanc d'un bouton reste lisible (4,6 pour 1). Un corail plus vif ne passe pas.

#### Les polices et les formes

- **Titres** : Outfit (600 et 700), à la place de Fraunces. **Texte** : DM Sans (400 à 700), à la place de Nunito.
- **Coins** : carte 28 px (16 avant) ; bouton, champ, zone de texte 16 px (6 avant) ; encadré 18 px (12) ; petite tuile 14 px (8 à 11) ; case à cocher 8 px (5) ; haut d'un panneau 32 px (20) ; bulle de message 24 px, coin bas gauche 6 px. Les ronds et les pastilles ne changent pas.
- **Carte** : plus d'ombre floue, un bord pêche de 1,5 px et une bande pleine de 3 px dessous (`0 3px 0 #ffd9cc, 0 0 0 1.5px #ffd9cc`).

#### Les icônes de personne

Les six noms enregistrés ne changent pas (`brick`, `pine`, `mustard`, `kraft`, `frost`, `plum`) : seules leurs teintes changent, donc pas de migration.

| Nom enregistré | Devient | Fond | Bord |
|---|---|---|---|
| `brick` | corail | `#ffd0c8` | `#ff8478` |
| `pine` | menthe | `#c6f1e2` | `#4fcaa3` |
| `mustard` | citron | `#ffe9a8` | `#f4b82e` |
| `kraft` | pêche | `#ffe2c4` | `#f2a65a` |
| `frost` | ciel | `#cfe6ff` | `#6eb0f2` |
| `plum` | lilas | `#e6d6f8` | `#b993dd` |

#### La forme des icônes : l'autocollant en dégradé (fait, lot 23 bis)

Décidé par Julien le 19 novembre 2026, sur la planche `StyleIcones` de l'artifact des maquettes (piste 7). Rien ne change dans ce qui est enregistré : mêmes noms de couleur, mêmes symboles. `docs/refonte/sorbet/autocollant.py` fait foi pour les valeurs. Dans le code : `app/utils/stickers.ts` (le liseré, l'ombre et les dégradés, testés), `UiAvatar` (`px` pour une taille à part, `flat` pour le dégradé seul) et `ListsTile` (`flat` : droite, sans liseré ni ombre) ; la pluie de fête du palmarès est `ParticipantFestiveRain`, tirée par `app/utils/festiveRain.ts`.

**Une personne** reste un rond.

- Fond : un dégradé doux, `linear-gradient(150deg, #ffffff 0%, <fond> 42%, <bord> 135%)`, avec le fond et le bord du tableau ci-dessus. Le bord coloré d'1 px disparaît.
- Un liseré blanc autour : 5 % du diamètre, 2 px au moins.
- Une ombre portée : `0 3px 8px rgba(90, 40, 60, 0.22)` à partir de 36 px de diamètre, `0 2px 5px rgba(90, 40, 60, 0.2)` en dessous.

**Une liste** reste un carré arrondi. Ses six couleurs pleines laissent la place aux six teintes des personnes, sous les mêmes noms enregistrés.

| Nom enregistré | Avant | Devient |
|---|---|---|
| `pine` | sapin | menthe |
| `brick` | brique | corail |
| `mustard` | moutarde | citron |
| `plum` | prune | lilas |
| `night` | bleu nuit | ciel |
| `kraft` | kraft | pêche |

- Fond : `linear-gradient(150deg, <fond> 0%, <bord> 110%)`. Coins : 30 % du côté.
- Le même liseré blanc et la même ombre que pour une personne.
- La tuile est penchée de 3 degrés vers la gauche (`rotate(-3deg)`).

**Les cas à part**

- Des icônes qui se chevauchent (un groupe, un cadeau à plusieurs) : le dégradé, et l'anneau de la couleur du fond qu'elles ont déjà. Pas d'ombre.
- Dans la grille d'un panneau de choix d'icône : l'icône choisie garde son anneau corail, sans liseré ni ombre, et une tuile de liste y reste droite. Les pastilles de couleur montrent le dégradé seul. L'aperçu en haut du panneau est une icône comme les autres.
- Sur le palmarès en images : le dégradé, avec le liseré clair et l'ombre que ces écrans ont déjà.
- Sur une carte blanche, le liseré ne se voit pas : c'est l'ombre qui détache l'icône.

#### Le palmarès en images

Il reste **foncé**, texte blanc sur les quatre fonds. La rotation des couleurs (22.17) ne change pas.

| Avant | Sorbet |
|---|---|
| Brique | corail foncé `#b92d1f` |
| Sapin | menthe foncée `#085a43` |
| Moutarde, texte foncé | violet `#5f37a6`, texte blanc, texte secondaire `#e6d6f8` |
| Prune | prune nuit `#2b1b3d` |

#### Les illustrations

Même dessin et même manière que les enveloppes du lot 18 : papier en dégradé au filet fin, couture en pointillés, cachet de cire, brins de sapin, baies, étoiles à quatre branches, ombre au sol. Aux couleurs de Sorbet : papier `#ffeae1` vers `#ffd9cc`, filet `#f5b8a5`, cire et ficelle corail `#d93a2b`, sapin `#0b7a5b`, étoiles et baies lilas `#b993dd`. Les enveloppes et le podium existants prennent ces couleurs. Les dessins sont dans `docs/refonte/sorbet/illus.py` (les six du lot 18) et `illus2.py` (les nouveaux).

| Illustration | Où |
|---|---|
| Le sapin et ses paquets | À la place du logo, sur les cinq écrans de connexion (`Connexion`, `ConnexionCreer`, `ConnexionEnvoye`, `ConnexionConfirmer`, `ConnexionLienInvalide`) |
| Le sapin et un paquet en pointillés | `AccueilVide`, au-dessus de « Aucun tirage pour l'instant » |
| La couronne | À la place du logo, sur le lien d'invitation (`Rejoindre`, `RejoindreConnecte`) |
| Trois paquets et une coche | `RejoindreFait`, à la place du rond coché |
| L'étiquette | `PistesVide`, en tête de « Six questions, trente secondes » |
| La lettre cochée | `AccueilDemandeAcceptee`, en tête de « Ta demande est acceptée » |
| Les places à remplir | `PreparerVide`, en tête de « Ajoute les participants » |
| La feuille à cocher | `ListesVide`, à la place de la tuile |

- Une illustration est décorative (`aria-hidden`), sauf quand elle remplace le logo : elle porte alors le nom « Under the Tree ».
- **Pas d'image dans les emails** : ils restent en texte seul.
- Pas d'illustration sur les écrans de travail (suivi, réglages, membres).

**Hors de ce lot** : un mode sombre. Une piste a été dessinée (« Sorbet de nuit », dans l'artifact des maquettes), sans décision.
