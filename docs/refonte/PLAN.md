# Plan de refonte des interfaces — ce qui reste à coder

Écrit le 16 novembre 2026, à partir du canevas de maquettes (97 écrans) et du code à `5f50067`.
Ce plan est fait pour être exécuté par Claude Code, lot par lot.

- Maquettes : `docs/refonte/maquettes/<Nom>.html` (une par écran, 390 px de large, styles en ligne). Le canevas complet : https://claude.ai/artifact/6XYdmH9di9ctyAZxzLD9Ns
- Le statut de chaque écran vient d'une lecture du code et de l'historique Git, pas d'une comparaison visuelle. Les écrans notés « partiel » sont à contrôler en premier dans leur lot.

## 1. Périmètre

**Dans le périmètre** : refaire l'interface d'écrans qui existent déjà, avec les routes d'API, les mutations et les données qui existent déjà.

**Hors périmètre** (ne pas coder, même si une maquette le montre) :

| Sujet | Maquettes concernées | Pourquoi |
|---|---|---|
| Dévoiler les résultats (README 22.9) | `DevoilerAvant`, `Feter`, `Devoiler`, `Cloturee`, et la ligne « Dévoiler les résultats » de `Suivi100` | Nouvelle fonctionnalité, côté serveur compris |
| Idées futures | `FuturAccueil`, `FuturListes` | Non planifié |
| Mot de l'administrateur sur un refus | bloc « Le mot de l'administrateur » de `AccueilDemandeRefusee`, champ « Un mot pour elle » de `AdminDemande` | Demande un champ en base et un email |
| Liste de souhaits | `Souhaits`, `SouhaitsVide`, `SouhaitsIdee`, `SouhaitsFigee` | Remplacée par « Pistes de cadeaux » (README 22.11), codée à part |
| Alerte du journal sur la page du participant | `TirageAlerteJournal` | Demande de mémoriser la dernière visite ; pas encore décidé |

**Règle générale** : si une maquette affiche une donnée que l'API ne fournit pas, ne pas l'inventer et ne pas toucher au schéma. Laisser l'élément de côté et l'ajouter à la section 6 « Questions pour Julien » de ce fichier.

## 2. Avant de coder

1. Lire dans `README.md` : 7.1 (règles de code), 11 (écrans), 21 (langues), 23 (design system).
2. Ouvrir `/admin/guide-de-style` et lire `app/components/ui/*` : tout ce qui existe se réutilise.
3. Lire un écran déjà refait comme modèle : `app/pages/admin/[slug]/editions/[id]/index.vue` et ses composants `AdminEdition*`, `AdminSendSheet`, `AdminDateSheet`.
4. Pour chaque lot, lire les maquettes citées **et** l'écran actuel avant d'écrire une ligne.

**Les maquettes se reproduisent fidèlement** (demandé par Julien le 16 novembre 2026) : pas seulement la structure et les textes, mais aussi la forme des éléments, leurs tailles, leurs espacements, leurs couleurs et l'ordre des actions. Une maquette donne ses valeurs en clair dans ses styles en ligne (hauteurs, rayons, graisses) : les reprendre, en passant par les jetons et les composants du design system, quitte à ajouter une variante à un composant `ui/*`. Avant de clore un écran, le comparer à sa maquette côte à côte, à 390 px de large : prendre avec Playwright une capture du fichier de la maquette et une capture de l'écran dans le même état, les regarder toutes les deux, et corriger jusqu'à ce qu'il ne reste que des écarts de données. À la fin de chaque lot, lister dans le résumé les écarts qui restent, écran par écran. Seuls les prénoms, dates et chiffres sont des exemples. Deux écarts permis : une règle du README 23.3 contredite par la maquette (la règle gagne, à noter en section 6), et un texte qui vient d'un modèle de message existant (13.2), qui reste celui du modèle.

## 3. Règles de travail

- **Design system d'abord.** Un motif qui revient dans deux écrans devient un composant `app/components/ui/*`, sans texte ni métier, montré dans le guide de style. Les écrans nomment un rôle (`bg-page`, `primary-tint`…), jamais une teinte.
- **Programmation fonctionnelle** (README 7.1) : la logique d'affichage (tri, regroupement, repli, filtre) est une fonction pure dans `shared/utils` ou `server/utils`, avec son fichier de test à côté. Pas de mutation, `computed` plutôt que `watch`, pas de classe.
- **Standards** : `<script setup lang="ts">`, TypeScript strict, composants Nuxt UI 4, TanStack Query par les composables de `app/composables/queries/`, validation Zod inchangée.
- **Aucun texte en dur** : chaque libellé dans `shared/i18n/locales` en français, anglais et allemand. Supprimer les clés qui ne servent plus.
- **Mobile seulement** : colonne `max-w-md`, cibles de 44 px, panneaux du bas (`UiSheet`). Pas de version grand écran.
- **Accessibilité** : un seul `h1`, `aria-label` sur les boutons à icône seule, `prefers-reduced-motion` respecté.
- **Pas de note de conception à l'écran** : une phrase qui explique comment l'interface marche (« La recherche apparaît au-delà de 10 participants », « Triés par prénom », « Le bouton s'active une fois la case cochée ») ne va ni dans un écran ni dans un dictionnaire. Un texte d'aide parle à la personne de ce qu'elle peut faire ou de ce qui va se passer. Ces notes ont été retirées des maquettes le 16 novembre 2026 ; si une ancienne en a laissé une dans le code, la supprimer avec sa clé.
- **Emoji** : uniquement dans les icônes de personne. Partout ailleurs, icônes Lucide.
- **Tests** : Vitest pour chaque fonction pure ; Playwright (`tests/e2e`) pour le parcours principal de chaque lot ; garder les `data-testid` existants ou adapter les tests dans le même commit.
- **Commits** : petits, Conventional Commits en anglais, chacun passe `pnpm lint`, `pnpm typecheck` et `pnpm test`. README mis à jour dans le commit de la décision. Ne pas pousser, ne pas déployer.
- **Un lot à la fois**, dans l'ordre. À la fin d'un lot : lancer `pnpm test:e2e`, cocher le lot ici, s'arrêter et résumer.

## 4. État des 97 maquettes

| | Codé | Partiel | À coder | Hors périmètre |
|---|---|---|---|---|
| Accueil et connexion (18) | 11 | 3 | 4 | 0 |
| Participant (16) | 7 | 0 | 4 | 5 |
| Organisateur · édition (30) | 9 | 3 | 14 | 4 |
| Organisateur · groupe (16) | 0 | 1 | 15 | 0 |
| Journal (5) | 0 | 0 | 5 | 0 |
| Administration (8) | 0 | 0 | 8 | 0 |
| États et idées (4) | 0 | 0 | 2 | 2 |
| **Total** | **27** | **7** | **52** | **11** |

### Codé (27)

- **Accueil** (commits du 15 novembre) : `Connexion`, `ConnexionCreer`, `AccueilVide`, `Accueil`, `AccueilPlusieurs`, `AccueilOrganisateur`, `PanneauAvatar`, `TiragesPasses`, `PanneauDemandeGroupe`, `AccueilDemandeAcceptee`, `GroupeNouveau`.
- **Participant** : `TirageAttente`, `TirageDecouvrir`, `TirageResultat`, `TirageRevoir`, `TirageCloture`, `TirageLienInvalide`, `CarteCompte`.
- **Édition** : `Main`, `DateFete`, `ConfirmerTirage`, `Suivi`, `SuiviSansDate`, `SelectionEmail`, `Envoi`, `EnvoiSansEmail`, `Renvoi`.

### Partiel (7)

| Maquette | Ce qui existe | Ce qui manque | Lot |
|---|---|---|---|
| `PreparerImpossible` | Une phrase d'erreur dans la carte, bouton désactivé | Étiquette « À corriger avant le tirage », une ligne par personne bloquée, deux boutons « Voir les exclusions » et « Ajouter des participants » à la place de « Lancer le tirage » | 1 |
| `ConfirmerTirageGrand` | Pile d'icônes « +N », noms des absents abrégés | Lien « Voir et ajouter » sur la ligne des absents | 1 |
| `EtatConfirmation` | Un toast après l'envoi | Le texte de la maquette (nombre d'emails, prénoms) | 1 |
| `EditionNouvelle` | Date obligatoire | Mise en page de la maquette : date proposée, pile des participants repris | 3 |
| `AccueilMenu` | Menu déroulant dans `AdminScreen` | Ordre et contenu de la maquette (langue, Mon compte, Se déconnecter) | 8 |
| `AccueilDemandeAttente` | Une ligne de texte | La carte « Ta demande est partie » avec le texte de la demande | 8 |
| `AccueilDemandeRefusee` | Une ligne de texte | La carte « refusée » et « Faire une autre demande » (sans le mot de l'administrateur) | 8 |

### À coder (52)

Détaillé par lot en section 5.

## 5. Les lots

### Lot 0 — Fondations du design system

Rien de visible pour l'utilisateur, tout le reste en dépend.

- [x] **Repli des longues listes.** Fonction pure `foldList(items, shown)` dans `shared/utils/lists.ts` (renvoie les éléments montrés et le reste), testée. Composant `UiFoldRow` : trois petites icônes de personne qui se chevauchent, « Voir les N autres » et chevron en brique, un petit espace sous la ligne avant la suite ; un appui déplie sur place. Référence : `Preparer100`, `Suivi100`.
- [x] **Recherche dans une liste.** Composant `UiSearchField` au-dessus d'une liste de plus de 10 personnes, sur `matchesName` et `highlightName` qui existent. La recherche montre tous les résultats, sans repli. Référence : `GroupeMembres100`, `ChoisirPersonneRecherche`.
- [x] **Panneaux de réglage.** Quatre panneaux génériques sur `UiSheet`, avec « Valider » et « Annuler » : `UiChoiceSheet` (une valeur parmi plusieurs, avec aide par option), `UiTextSheet` (texte et compteur), `UiNumberSheet` (moins, nombre, plus), et une date facultative en généralisant `AdminDateSheet`. Référence : `PanneauChoix`, `PanneauTexte`, `PanneauNombre`, `PanneauDate`.
- [x] **Ligne de réglage.** `UiListItem` avec la valeur courante à droite, et variante avec interrupteur. Référence : `GroupeReglages`.
- [x] **Chargement et erreur.** `AdminQueryState` : squelette à la forme de l'écran (`EtatChargement`) ; erreur avec titre, phrase, « Réessayer » (`refetch`) et un retour (`EtatErreur`). Dans un panneau : ligne rouge au-dessus du bouton, panneau ouvert, saisie gardée. Accès refusé : phrase claire et retour à l'accueil.
- [x] Guide de style et README 23.2 à jour.

**Fini quand** : chaque composant est dans le guide de style, les fonctions pures sont testées, aucun écran n'a changé.

### Lot 1 — Édition : cas limites et grands groupes

Fichiers : `AdminEditionPrepare.vue`, `AdminEditionFollow.vue`, `AdminDrawSheet.vue`, `emails.vue`, `editions/[id]/index.vue`.

- [x] `PreparerVide` : sans participant, la carte dit « Ajoute les participants » avec « Ajouter des participants » et « Inviter par lien ».
- [x] `PreparerImpossible`, `ConfirmerTirageGrand`, `EtatConfirmation` : voir « Partiel ».
- [x] `Preparer100` : recherche au-delà de 10, 6 lignes puis `UiFoldRow`.
- [x] `Suivi100` : une seule liste dans l'ordre de `sortParticipants`. Chaque série (pas encore envoyé, pas encore consulté, résultat consulté) montre 3 lignes puis sa ligne de repli, qui rappelle l'état de la série. Pas de sections, pas de compteurs qui filtrent. Le bouton de la carte dit « Prévenir les N par email ».
- [x] `SelectionEmail100` : recherche, repli, compteur « N sélectionnés sur M ». La sélection porte sur toute la liste, pas seulement sur les lignes visibles.
- [x] `ClotureeSecrete` : édition clôturée en lecture seule : frise entièrement faite, encadré « Édition clôturée », participants, exclusions appliquées. Contrôler d'abord ce que `AdminEditionResults` affiche aujourd'hui (README 8.7) ; s'il montre les paires, ne rien retirer et poser la question en section 6.

À retirer si déjà codé : la note « Triés par prénom. La recherche apparaît au-delà de 10 participants. » sous la liste (clé dans `shared/i18n/locales/*/adminEdition.ts`), dans les trois langues.

Le repli ne s'active qu'au-delà de **12 personnes** dans la liste (constante nommée, par exemple `FOLD_FROM`, validée par Julien le 16 novembre 2026).

**Fini quand** : un groupe de 5 s'affiche comme aujourd'hui ; un groupe de 100 (à ajouter au script `seed:demo`) tient en moins de trois écrans de défilement.

### Correction du lot 0 — replier une liste, déplier par paquets

Demandé par Julien le 16 novembre 2026, à faire avant de poursuivre (le composant sert dans tous les lots suivants). Références : `GroupeMembres100Deplie`, `Preparer100Deplie`, `Suivi100Deplie`.

- [x] **Replier.** Une fois la liste dépliée, la ligne de repli reste à sa place, juste après les premières lignes, et devient « Replier la liste » (chevron vers le haut, fond `primary-tint`, `aria-expanded="true"`, sans les petites icônes). Un appui referme et ramène la ligne à l'écran si elle n'y est plus.
- [x] ~~**Par paquets.**~~ Remplacé le 16 novembre 2026 : déplier montre toute la liste d'un coup (voir la Correction 2).
- [x] La recherche montre toujours tous les résultats, sans repli.
- [x] Appliquer aux écrans déjà faits (édition à préparer, suivi après tirage, envoi par email) et mettre à jour le guide de style et leurs tests.

Pas de virtualisation : même pour un groupe de 300, la liste dépliée reste raisonnable, et une édition est plafonnée à 100 participants.

### Correction 2 — la ligne « Replier », et les noms de famille

Demandé par Julien le 16 novembre 2026, après avoir vu la première correction. À faire avant le lot 2. Références : `GroupeMembres100Deplie`, `Preparer100Deplie`, `Suivi100Deplie` (les trois montrent la page défilée jusqu'à la fin de la liste dépliée).

**La ligne « Replier »** (remplace ce qui a été fait dans la « Correction du lot 0 »)

- [x] **Du même type que la ligne qui a déplié** : fond blanc, même hauteur, titre en brique, même chevron mais vers le haut, et le petit espace en dessous. Sans les trois petites icônes et sans nombre : le texte est « Replier la liste ». Plus de fond teinté.
- [x] **Au même endroit** : en dernière ligne de la liste, après les personnes dépliées. Elle ne reste pas en haut de la partie dépliée.
- [x] Dans le suivi après tirage, la ligne garde sous son titre l'état de sa série (« Pas encore envoyé »…), comme la ligne « Voir les N autres ». La case « Dans le suivi après tirage » de la correction précédente est remplacée par celle-ci.
- [x] ~~Par paquets de 50~~ : abandonné par Julien le 16 novembre 2026, après essai (« Voir les N autres » et « Replier la liste » ensemble, c'est bizarre). Un appui sur « Voir les N autres » déplie **toute** la liste ; seule « Replier la liste » reste en bas.
- [x] Après un appui sur « Replier », ramener la liste à l'écran : sa fin repliée doit être visible.

**Les noms de famille**

- [x] Dans les écrans de l'organisateur et du super-admin, afficher le nom de famille après le prénom **dès qu'il est renseigné** (`fullName` de `server/utils/people.ts`), et plus seulement pour départager deux prénoms identiques : listes de membres et de participants, fiches, sélecteur de personne, envoi par email, exclusions.
- [x] La recherche trouve aussi sur le nom de famille (`matchesName`, `highlightName`, avec leurs tests).
- [x] Le tri reste par prénom, puis par nom.
- [x] **Seule exception à « interface seulement »** : si une route ne renvoie pas `lastName` (c'est le cas des participants d'une édition), l'ajouter à sa réponse. Rien d'autre côté serveur, pas de migration.
- [x] Côté participant (page du tirage, résultat, messages, journal), ne rien changer : le prénom, et le nom seulement pour départager des homonymes (`displayName`, README 20).
- [x] Mettre à jour le README 20 et les tests.

### Correction 3 — le panneau d'envoi, fidèle aux maquettes

Demandé par Julien le 16 novembre 2026, sur capture d'écran. À faire avant le lot 2. Références : `Envoi`, `EnvoiSansEmail`, `Renvoi`. Fichiers : `AdminSendSheet.vue`, `AdminSendOptions.vue`.

- [x] **Choix du message** : un contrôle segmenté, pas trois pastilles. Une piste grise arrondie (`bg-muted`, 4 px de marge intérieure), trois colonnes égales, l'option choisie en blanc avec une ombre légère et un texte foncé en gras. Pas de fond brique.
- [x] **Le message** : une bulle, pas un bloc pleine largeur. Alignée à gauche, 92 % de large au plus, coins arrondis sauf celui du bas à gauche, le lien sur sa propre ligne, en gras et en brique.
- [x] **Bouton principal** : 56 px de haut. Avec une adresse : « Envoyer par email » et l'adresse en dessous, sur deux lignes. Sans adresse : « Partager (WhatsApp, SMS…) ».
- [x] **Actions secondaires** : avec une adresse, « Partager » et « Copier » côte à côte, 46 px, en contour. Sans adresse, « Copier le message » seul, en contour.
- [x] **Sans adresse** : sous les boutons, la ligne « {Prénom} n'a pas d'adresse email. » avec le lien « Ajouter », qui ouvre la fiche de la personne. Elle manque aujourd'hui.
- [x] **Personne suivante** : dans le bandeau vert, l'icône de la personne suivante (32 px) à la place de la flèche, son prénom en gras, « Passer » souligné à droite.
- [x] **Fermer** : bouton rond de 44 px sur fond `bg-muted`.
- [x] Contrôler de la même façon `Renvoi`, et l'écran `SelectionEmail` (mêmes onglets, même bulle pour l'aperçu).

### Les états de chargement — règles pour tous les lots

Demandé par Julien le 16 novembre 2026, révisé le même jour. Maquettes de référence : `ChargementBouton`, `ChargementPanneau`, `ChargementEnvoi`, `ChargementReglage`.

**Ce qui compte : les actions.** Un tirage, un envoi d'emails, un enregistrement prennent un temps visible. C'est là qu'on montre que ça travaille.

| Cas | Ce qu'on montre | Maquette |
|---|---|---|
| Une action lancée par un bouton | La roue remplace l'icône du bouton, le libellé dit ce qui se passe (« Tirage en cours… »), le bouton garde sa taille et se désactive, la sortie du panneau aussi | `ChargementBouton` |
| Un envoi à plusieurs | Même règle sur le bouton (« Envoi des N emails… ») ; la liste au-dessus est atténuée et ne répond plus | `ChargementEnvoi` |
| Un réglage qui s'enregistre | La roue à la place du chevron de la ligne, ou dans l'interrupteur ; la nouvelle valeur est affichée tout de suite et revient en arrière si l'enregistrement échoue | `ChargementReglage` |
| Contenu d'un panneau qui arrive | Le panneau s'ouvre tout de suite ; seule la zone attendue est en squelette, les boutons qui en dépendent sont grisés | `ChargementPanneau` |

**Les squelettes d'écran : on garde le système du lot 0, et chaque écran lui donne sa forme.** `AdminQueryState` compose déjà un squelette à partir de pièces (`title`, `stepper`, `card`, `list`) choisies par l'écran. Il s'affiche réellement en passant d'un écran à l'autre, donc il doit ressembler à l'écran qu'il remplace, sinon la page saute à l'arrivée des données. Les maquettes `EtatChargement` (édition), `ChargementListe`, `ChargementAccueil`, `ChargementTirage` et `ChargementJournal` montrent la composition attendue pour ces écrans. Ce sont des exemples de composition, pas des dessins à reproduire au pixel : ce qui compte, c'est que chaque bloc du squelette soit à la place et à la taille du bloc qu'il annonce. Ajouter une pièce quand il en manque une (en-tête avec avatar, frise verticale du journal, carte de groupe), sans faire un squelette sur mesure par écran.

Règles :

- Un indicateur n'apparaît qu'après 200 ms d'attente, pour ne pas clignoter.
- Un rechargement en arrière-plan (TanStack Query) garde l'écran tel quel.
- Dépliage d'une liste, recherche, changement d'onglet : immédiats, aucun indicateur.
- Accessibilité : `aria-busy="true"` sur la zone en attente, un texte pour les lecteurs d'écran, la roue ne tourne pas si `prefers-reduced-motion`.
- Une roue reste petite (20 px), dans un bouton ou une ligne, jamais seule au centre d'un écran.

### Correction 4 — les actions en cours, sur les écrans déjà faits

Demandé par Julien le 16 novembre 2026, à faire avec la reprise du lot 1, avant le lot 2. Applique les règles de la section précédente aux écrans déjà refaits.

- [x] **La brique** : la petite roue de bouton et de ligne comme élément du design system, dans le guide de style, avec `prefers-reduced-motion`. Vérifier d'abord ce que `UButton` (`loading`) fait déjà et s'en servir.
- [x] **Lancer le tirage** (`ChargementBouton`) : roue dans le bouton, « Tirage en cours… », « Pas encore » grisé, panneau non refermable pendant l'appel.
- [x] **Panneau d'envoi** (`ChargementPanneau`) : la bulle du message en squelette tant que le texte n'est pas là, boutons d'envoi grisés. Pendant l'envoi : roue dans le bouton, « Envoi en cours… ».
- [x] **Envoi par email à plusieurs** (`ChargementEnvoi`) : « Envoi des N emails… », liste atténuée et inactive.
- [x] **« Découvrir »** côté participant, **date de la fête**, **clôturer**, **changer la langue d'une personne** : même règle du bouton ou de la ligne (`ChargementReglage`).
- [x] **Squelettes** : vérifier que l'édition, l'accueil et la page d'un tirage passent à `AdminQueryState` (ou à son équivalent côté participant) les pièces qui correspondent à leur maquette, et ajouter la pièce « en-tête avec avatar » si elle manque. Le contenu ne doit pas sauter quand les données arrivent.
- [x] Dans les parcours de bout en bout, vérifier au moins un bouton occupé.

### Lot 2 — Édition : sous-écrans

- [x] `AjouterParticipants` (`ajouter.vue`), devenu **« Choisir les participants »** (validé par Julien le 16 novembre 2026) : un seul écran pour ajouter et retirer. Tous les membres actifs du groupe, une case par personne, cochée si elle participe ; « Tout cocher » ; recherche et repli des longues listes ; puis « Créer une personne » et « Inviter par lien » ; bouton collant « Enregistrer · N participants ». Les lignes « Ajouter des participants » de l'édition y mènent et prennent ce nom. Avant le tirage seulement.
- [x] ~~`FicheParticipant`~~ : supprimée par Julien le 16 novembre 2026, elle doublait le panneau d'envoi. Toucher une personne ouvre `AdminSendSheet`, dont le bas porte le « Dépannage » (pas envoyé finalement, régénérer le lien, retirer de l'édition). L'ancienne route redirige vers l'édition, panneau ouvert.
- [x] ~~`PanneauRegenerer`~~ : la régénération se confirme par un second appui dans le « Dépannage » du panneau d'envoi, sans second panneau par-dessus.
- [x] `AnnulerTirage` (`annuler.vue`) : conséquences en liste, motif, aperçu de la ligne du journal, case à cocher, bouton sûr « Garder ce tirage » mis en avant.
- [x] `VoirResultat`, `ChoisirPersonne`, `ChoisirPersonneRecherche`, `VoirResultatAffiche` (`voir-le-tirage.vue`) : avertissement, choix de la personne par `UiPersonPicker` (qui existe et n'est pas encore branché), aperçu du journal, phrase à recopier ; puis le résultat avec « Cacher et revenir à l'édition ». Libellé « Voir un seul résultat ».

- [x] **Retouches du panneau d'envoi après la suppression de la fiche** (validées par Julien le 16 novembre 2026, maquettes `Renvoi` et `RenvoiPepin`) :
  - Le « Dépannage » est **replié par défaut** derrière une ligne « Dépannage » en bas du panneau (chevron, pleine largeur, trait au-dessus) ; un appui le déplie sur place. Le panneau est déjà haut : ouvert en permanence, il oblige à défiler pour atteindre les boutons d'envoi.
  - Il n'apparaît qu'**une fois un message envoyé** à la personne. Il contient « Pas envoyé finalement ? » et « Régénérer son lien » (second appui pour confirmer, comme aujourd'hui).
  - **« Retirer de l'édition » en sort** : retirer quelqu'un passe par « Choisir les participants ». Supprimer aussi la ligne grisée « impossible après le tirage ».
  - **Avant le tirage, toucher une personne ouvre sa fiche dans le groupe** (`personnes/[id]`), pas le panneau d'envoi : à cette étape on corrige un prénom, une adresse ou une exclusion. Le panneau d'envoi reste accessible par « Prévenir avant le tirage ».
  - La date et le moyen du dernier envoi restent sous le nom, dans l'en-tête du panneau.
  - **Ajouter ou corriger l'adresse email sans quitter le panneau** (demandé par Julien le 16 novembre 2026, maquette `EnvoiAjouterEmail`) : « Ajouter », dans la ligne « {Prénom} n'a pas d'adresse email », remplace cette ligne par un champ et un bouton « Enregistrer », sur place. Une fois l'adresse enregistrée (mutation existante de la personne), le panneau repasse dans son état « avec adresse » : « Envoyer par email » devient l'action principale. Même comportement pour « Ce n'est pas la bonne adresse ? La corriger » du renvoi, champ prérempli. Une adresse invalide ou déjà prise s'affiche en rouge sous le champ, le panneau reste ouvert. Plus aucun lien du panneau ne mène à la fiche du groupe.
- [x] **Actions en cours** conformes aux règles : roue dans « Enregistrer » de « Choisir les participants », « Annuler le tirage », « Voir le résultat », « Enregistrer » de l'adresse email.

**Fini quand** : les parcours de `tests/e2e/admin-edition.spec.ts` passent sur les nouveaux écrans.

### Lot 3 — Groupe : accueil et nouvelle édition

- [x] `Groupe` (`admin/[slug]/index.vue`) : carte de l'édition en cours avec `UiStepper` et une phrase d'état, bouton « Ouvrir l'édition » ; section « Le groupe » en quatre lignes : Membres, **Exclusions** (ligne à part, avec le nombre de paires), Journal (dernier événement), Réglages ; puis les éditions passées.
- [x] `GroupeSansEdition` : `UiActionCard` « Prépare le tirage de cette année ».
- [x] `EditionNouvelle` (`editions/nouvelle.vue`) : voir « Partiel ».
- [x] **Actions en cours** conformes : roue dans « Créer l'édition ».

### Le contexte d'un écran — règle pour tous les lots, et Correction 5

Demandé par Julien le 16 novembre 2026, après un audit des maquettes. Plusieurs écrans s'atteignent directement (carte « À faire maintenant » de l'accueil, email, favori) sans passer par l'édition : on doit toujours y lire dans quel groupe et quelle édition on se trouve, sans que ce soit voyant.

**La règle**

- **Une ligne de contexte au-dessus du titre** de chaque écran rattaché à un groupe ou à une édition : petite, grise (14 px, graisse 600, `text-muted`), toujours dans le même ordre, « {Groupe} · {Édition} », ou « {Groupe} » seul pour un écran du groupe.
- **Chaque morceau est un lien** : le groupe mène à l'accueil du groupe, l'édition à l'écran de l'édition. Cible tactile de 44 px sans agrandir la ligne à l'œil. Balise `nav` avec un nom accessible.
- **Un seul composant**, sans texte ni métier, dans `ui/*` et dans le guide de style : soit une prop `context` sur `UiPageTitle`, soit un `UiPageContext` posé juste au-dessus. Aucun écran ne compose cette ligne à la main.
- **Elle remplace** le nom du groupe ou de l'édition écrit sous le titre. Une vraie phrase d'explication sous le titre reste.
- **Exceptions** : l'écran de l'édition (son titre est l'édition, le groupe reste dessous) ; l'accueil du groupe (son titre est le groupe) ; les panneaux du bas (on voit l'écran derrière) ; les écrans du compte et de l'administration, qui n'ont pas de groupe ; « lien invalide », qui ne doit rien révéler.
- **Écran à barre de titre** (envoi par email à plusieurs) : le contexte est sous le titre, dans la barre, en 12 px, sans lien.
- **Le bouton retour** mène toujours à l'écran parent, même quand on est arrivé directement et qu'il n'y a pas d'historique.
- **Le titre de l'onglet** (`useHead`) porte aussi le contexte : « Envoyer par email — Famille Camille · Noël 2026 ».
- Côté participant, la ligne existe déjà (« Famille Camille · Noël 2026 ») : même composant, le lien ramène à la page du tirage.

**Correction 5 — les écrans déjà faits** (lots 1 à 3). À faire avant le lot 4. Maquettes mises à jour : `SelectionEmail`, `SelectionEmail100`, `AjouterParticipants`, `AnnulerTirage`, `VoirResultat`, `VoirResultatAffiche`, `EditionNouvelle`.

- [x] Le composant, dans le guide de style, avec ses tests.
- [x] **Envoi par email à plusieurs** : aujourd'hui aucun contexte, alors que la carte de l'accueil y mène tout droit. Le plus urgent.
- [x] **Choisir les participants** : le groupe manquait.
- [x] **Annuler le tirage**, **voir un seul résultat**, **exclusions de l'édition**, **nouvelle édition** : le contexte passe au-dessus du titre, dans l'ordre commun.
- [x] Vérifier le bouton retour et le titre d'onglet de ces écrans en y arrivant par leur adresse.
- [x] Un test de bout en bout : ouvrir l'envoi par email par son adresse, lire le groupe et l'édition, revenir à l'édition par le lien.

Pour les lots suivants, les maquettes portent déjà la ligne : `GroupeMembres`, `GroupeMembres100`, `GroupeExclusions`, `GroupeInvitation` (aucun groupe n'y était nommé), `GroupeReglages`, `Journal`, `JournalTout`, `JournalPersonne`.

### Les bords de l'écran (iPhone) — règle pour tous les lots, et Correction 6

Demandé par Julien le 16 novembre 2026 : sur iPhone, le bas des panneaux est rogné par les coins arrondis et la barre du bas. Maquette de référence : `PanneauIphone`. À faire avant le lot 4.

**Constat dans le code** : la balise `viewport` de `nuxt.config.ts` n'a pas `viewport-fit=cover`, et `UiSheet` n'a aucune marge de sécurité en bas. Plusieurs écrans utilisent déjà `env(safe-area-inset-*)` (barres du haut et du bas, `UiStickyFooter`). À vérifier sur un vrai iPhone avant de corriger : ce que valent ces marges aujourd'hui, dans Safari et en application ajoutée à l'écran d'accueil.

**La règle**

- Rien d'actionnable ni de lisible dans les zones réservées : le dernier élément d'un écran, d'un panneau ou d'un pied collant est suivi de sa marge habituelle **plus** `env(safe-area-inset-bottom)`.
- Idem en haut (`safe-area-inset-top`) pour les barres, et sur les côtés (`left`, `right`) pour le téléphone tourné.
- Le fond d'un panneau ou d'une barre va jusqu'au bord de l'écran ; c'est son contenu qui s'arrête avant.
- Un panneau ne dépasse jamais la hauteur visible (`100dvh` moins la marge du haut) : son corps défile, son en-tête et son pied restent en place.
- Le clavier ouvert ne doit pas cacher le champ en cours ni le bouton de validation d'un panneau.
- Les messages (toasts) apparaissent au-dessus de la zone réservée du bas.

**Correction 6**

- [x] Mesurer d'abord sur un iPhone à encoche (ou le simulateur) : panneau d'envoi, confirmation du tirage, choix d'une personne, date de la fête, pied collant de l'envoi par email et de « Choisir les participants ». Noter ce qui est rogné. *Fait en partie le 16 novembre 2026 : dans le simulateur (iPhone 17, iOS 26), la page d'un participant, avant et après `viewport-fit=cover` ; les panneaux n'ont pas pu y être ouverts (pas de clic possible par script). Dans le code, le pied d'un panneau défilait avec son corps et rien ne gardait la barre du bas : corrigé pour tous les panneaux. À confirmer sur un vrai iPhone.*
- [x] `viewport-fit=cover` si la mesure le confirme, puis vérifier que rien d'autre ne bouge (barre du haut, accueil, page du participant).
- [x] `UiSheet` : marge du bas, hauteur maximale, corps qui défile, pied fixe. Corrigé une fois dans le composant, pas panneau par panneau.
- [x] `UiStickyFooter`, barre du haut, toasts : même contrôle.
- [x] Un test Playwright avec un profil d'iPhone récent : le dernier bouton d'un panneau est entièrement visible et cliquable.
- [x] Ajouter la règle au README 23.3.

### Lot 4 — Groupe : membres et exclusions

- [x] `GroupeMembres`, `GroupeMembres100`, `GroupeMembres100Deplie` (`personnes/index.vue`) : une liste, exclusions rappelées sous le prénom, « Ajouter une personne » en bas, pied « L'historique de ceux qui ne participent plus est conservé », puis « Inviter par lien ». Recherche et repli du lot 0.
- [x] `GroupePersonne`, `PersonneNouvelle` (`personnes/[id].vue`, `nouvelle.vue`, `AdminPersonForm.vue`) : formulaire, section « Ne tire pas », « Retirer du groupe » en bas ; « Ajouter, puis en créer une autre ».
- [x] `GroupeExclusions`, `PanneauExclusion` (`exclusions.vue`, `AdminExclusions.vue`) : « Ajouter une exclusion » en haut, paires avec deux icônes, règles automatiques en lecture seule ; ajout dans un `UiSheet` avec `UiPersonPicker`.
- [x] `GroupeInvitation` (`invitation.vue`) : message et lien, « Partager le lien », réglages du lien par les panneaux du lot 0 (`PanneauNombre`, `PanneauDate`, `PanneauTexte`).
- [x] **Actions en cours** conformes : roue dans les boutons des formulaires et des panneaux.

### Correction 7 — l'envoi allégé : un panneau court, un écran pour personnaliser

Décidé par Julien le 16 novembre 2026 : le panneau « Envoyer à {prénom} » était trop chargé, surtout au renvoi, et l'écran d'envoi à plusieurs empilait un second bloc par-dessus sa liste. À faire après le lot 4, avant le lot 5.

Maquettes : `Envoi`, `EnvoiSansEmail`, `EnvoiAjouterEmail`, `Renvoi`, `RenvoiPepin` (la liste « Autre moyen, ou un souci ? »), `PersonnaliserMessage`, `PersonnaliserMessageMot`, `PersonnaliserMessagePlusieurs` (nouvelles), `SelectionEmail`, `SelectionEmail100`. **Ne plus utiliser** `EnvoiPersonnaliser`, `EnvoiMotOuvert` et `EnvoiMotAjoute` s'ils traînent dans le dossier : ils décrivaient une version abandonnée.

Cette section **remplace** ce que la « Correction 3 » et les retouches du lot 2 disaient de la disposition du panneau ; leurs autres points restent (bulle, boutons de 56 et 52 px, adresse ajoutée sur place, fermeture ronde).

**Le principe** (README 23.3 : une action courte dans un panneau, un formulaire dans son écran) : envoyer est une action courte, personnaliser un message est un formulaire.

**Le panneau d'envoi à une personne** : court, et de hauteur fixe

- [x] De haut en bas : l'en-tête ; le message **entier** dans sa bulle, lien compris ; le lien « Personnaliser le message » ; les boutons d'envoi ; une ligne en bas, « Autre moyen, ou un souci ? ». Plus d'onglets, plus de « Ajouter un mot », plus de langue dans le panneau.
- [x] **Le message est choisi tout seul** à l'ouverture : jamais envoyé, « Tirage fait » (ou l'invitation avant le tirage) ; déjà envoyé, « Relance » ; après un nouveau tirage, « Nouveau tirage ». Fonction pure avec ses tests, à partir de l'état de l'édition et de la personne ; vérifier avec le README 13.2.
- [x] **Boutons** : premier envoi avec adresse, « Envoyer par email » puis « Partager » et « Copier » ; sans adresse, « Partager (WhatsApp, SMS…) », « Copier le message » et la ligne « {Prénom} n'a pas d'adresse email · Ajouter » ; au renvoi, « Renvoyer par email » seul.
- [x] **« Autre moyen, ou un souci ? »** remplace le contenu du panneau par une liste, avec « Retour » en haut. Au renvoi : « L'email n'arrive pas » (partager, copier le message, copier le lien seul, corriger son adresse email) puis « Dépannage » (pas envoyé finalement, régénérer son lien). Au premier envoi : copier le lien seul, corriger ou ajouter l'adresse, régénérer son lien. La ligne « Dépannage » repliée du lot 2 disparaît.
- [x] **Plus d'enchaînement** : le bandeau « le panneau passe à… », « Passer » et le passage automatique à la personne suivante sont supprimés. Après un envoi, le panneau se referme. Retirer le code et les textes correspondants.
- [x] Sous-titre de l'en-tête : l'état de la personne (« Pas encore envoyé », « Envoyé par email, pas encore consulté »), plus le nombre de personnes restantes.

**L'écran « Personnaliser le message »** : un seul, pour l'envoi à une personne et pour l'envoi à plusieurs

- [x] Une route dédiée sous l'édition, ouverte par le lien du panneau ou de l'écran d'envoi à plusieurs. Ligne de contexte, titre, « Pour {prénom} » ou « Pour les N personnes sélectionnées ».
- [x] De haut en bas : « Quel message » (trois segments) ; l'aperçu dans sa bulle, entier ; « Un mot en plus (facultatif) », un champ de texte **toujours visible**, qui grandit avec le texte et le montre toujours en entier, avec son compteur sur 500 ; « Langue du message » en ligne de réglage (envoi à une personne seulement ; à plusieurs, une phrase dit que chacun le reçoit dans sa langue) ; bouton collant « Valider ».
- [x] La bulle reflète chaque changement tout de suite, mot compris, à l'endroit où il partira (réglage du groupe « au-dessus ou en dessous du message »).
- [x] « Valider » ramène d'où l'on vient avec les choix conservés : le panneau se rouvre sur la même personne, ou l'écran d'envoi à plusieurs retrouve sa sélection. Le retour arrière sans valider abandonne. Les choix vivent le temps de l'envoi (état de la page ou paramètres d'adresse), pas en base ; seule la langue d'une personne s'enregistre, comme aujourd'hui.
- [x] **Au retour** (maquette `EnvoiPersonnalise`) : le panneau se rouvre sur la même personne, la bulle montre le message tel qu'il partira (message choisi, mot ajouté, langue), et le lien devient « Modifier le message ». Rien n'est envoyé par « Valider » : il reste à toucher le bouton d'envoi. Même chose sur l'écran d'envoi à plusieurs, où l'aperçu est mis à jour et la sélection intacte.

**L'écran d'envoi par email à plusieurs** : une seule page

- [x] Plus de bloc d'aperçu dans le pied. De haut en bas, dans la page : « Aperçu, pour {premier coché} » avec la bulle entière, la phrase « Chacun le reçoit avec son prénom, son lien et dans sa langue », le lien « Personnaliser le message » ; puis le compteur de sélection et la liste ; puis la phrase sur le spam.
- [x] Le pied collant ne contient plus que le bouton « Envoyer N emails ».
- [x] Les trois segments de message quittent cet écran : ils sont dans « Personnaliser le message ».

- [x] Mêmes états de chargement et mêmes marges d'iPhone que définis plus haut. Tests de bout en bout du panneau, de l'écran de personnalisation et de l'envoi à plusieurs.

### Correction 8 — le sélecteur d'icône, moins haut

Demandé par Julien le 16 novembre 2026 : sur son iPhone, le panneau « Mon icône » est trop haut. À faire avant le lot 6 (le lot 5 était déjà terminé quand cette section a été écrite). Maquette redessinée : `PanneauAvatar`. Fichiers : `AdminAvatarPicker.vue`, `HomeProfileSheet.vue`, et les autres écrans qui utilisent le sélecteur.

Objectif : passer d'environ 690 px à environ 380 px de haut, sans descendre sous 44 px par cible.

- [x] **En-tête sur une ligne** : l'icône en cours (44 px), qui change à chaque choix, et le titre « Mon icône ». La phrase « Choisis ton emoji et ta couleur » disparaît.
- [x] **Les emojis sur trois rangées qui défilent de côté** (grille en colonnes, cellules de 44 px), au lieu de cinq rangées. La dernière colonne visible est coupée par le bord pour qu'on comprenne qu'il y en a d'autres. À l'ouverture, la grille défile jusqu'à l'emoji choisi.
- [x] **Les couleurs sur une ligne**, ronds de 32 px dans des cibles de 44 px.
- [x] **Plus d'intitulés « Emoji » et « Couleur »** à l'écran : des noms accessibles sur les deux groupes suffisent.
- [x] **« Annuler » et « Valider » côte à côte**, 48 px, « Valider » deux fois plus large.
- [x] Même sélecteur partout où une icône se choisit (accueil, page du participant, fiche d'une personne). Tests mis à jour.

### Lot 5 — Groupe : réglages

- [x] `GroupeReglages` (`reglages.vue`) : lignes de réglage par section (Tirage, Participants, M'écrire par email, Organisateurs), chaque valeur modifiée dans son panneau (`PanneauChoix`, `PanneauTexte`).
- [x] `PanneauOrganisateur` : la page `organisateurs.vue` devient une section des réglages ; garder la route en redirection.
- [x] `PanneauSupprimerGroupe` : suppression (super-admin) dans un panneau, identifiant à recopier, « Garder le groupe » mis en avant.

- [x] **Pas de bouton « Enregistrer » en bas de page** (validé par Julien le 16 novembre 2026) : chaque réglage s'enregistre quand on valide son panneau, un interrupteur s'enregistre dès qu'on le bascule. Une mutation par réglage, avec mise à jour optimiste et retour à l'ancienne valeur en cas d'erreur (toast). Retirer l'état « modifié, non enregistré » de la page. Même règle pour les réglages du lien d'invitation (lot 4). Ajouter la règle au README 23.3, qui dit aujourd'hui qu'un panneau enregistre avec « Valider ».
- [x] **Actions en cours** conformes : `ChargementReglage` pour chaque ligne et chaque interrupteur.

### Correction 9 — le budget et le petit mot, modifiables sur l'édition

Validé par Julien le 16 novembre 2026, en réponse à la question 1 du lot 5. À faire avant le lot 6. Maquettes mises à jour : `Main`, `Suivi`.

Le budget, la date de la fête et le petit mot se règlent **par édition**, plus par groupe : « Nouvelle édition » les demande et reprend ceux de l'édition précédente (lot 3). Il manquait de pouvoir corriger le budget et le mot une fois l'édition créée.

- [x] **À préparer** : dans la section « Si tu veux », après « Exclusions », deux lignes : « Budget » et « Petit mot pour les participants », chacune avec sa valeur en sous-titre (« Aucun pour l'instant » si vide).
- [x] **Tirage fait** : les deux mêmes lignes en tête de la section « Plus tard, ou en cas de pépin ».
- [x] Chaque ligne ouvre `UiTextSheet` (lot 0) et s'enregistre à la validation, par la route qui modifie déjà les règles d'une édition (celle que « Nouvelle édition » appelle). Rien à ajouter côté serveur.
- [x] Modifiables tant que l'édition n'est pas clôturée ; en lecture seule ensuite.
- [x] Le budget sous le titre de l'édition et la carte du résultat côté participant se mettent à jour aussitôt.
- [x] S'applique à tous les états de l'écran (aucun participant, tirage impossible, grands groupes), même si seules `Main` et `Suivi` sont redessinées.
- [x] **Le nombre d'idées par liste** n'est plus réglable et garde sa valeur : c'est voulu, la liste de souhaits sera remplacée par les pistes de cadeaux (README 22.11).
- [x] Mettre à jour le README 5 (règles par groupe) : ces trois règles sont désormais celles de l'édition.

### Correction 10 — les réponses aux questions

Réponses de Julien du 17 novembre 2026 aux questions de la section 6. À faire avant de poursuivre les lots. Trois points touchent au serveur, par exception voulue à « interface seulement » : le minimum de trois, la création avec budget et mot, l'information « tirée de nouveau ». Pas de migration sans en parler d'abord ; chaque changement de route a son test.

- [x] **Trois participants au moins** (lot 1, question 2) : la règle du tirage passe de deux à trois, avec son test et les textes dans les trois langues.
- [x] **La date du dernier envoi** (lot 2, question 2) : l'en-tête du panneau d'envoi dit « Envoyé le 14 nov., pas encore consulté ». Pas le moyen d'envoi.
- [x] **L'élision en français** (lot 2, question 5) : « de » devient « d' » devant une voyelle ou un h (« d'Agathe », « d'Inès », « d'Hugo »). Une fonction pure testée, utilisée partout où un texte écrit « de {prénom} ». Rien en anglais ni en allemand.
- [x] **Créer une édition avec son budget et son mot** (lot 3, question 3) : la route de création les accepte ; plus de « L'organisateur a modifié les règles » au journal juste après une création.
- [x] **Un seul nombre de membres** (lot 3, question 6) : celui des membres actifs, partout ; la ligne « Membres » dit en plus combien ne participent plus, quand il y en a.
- [x] **Taper le nombre de places** du lien d'invitation (lot 4, question 3), en gardant « moins » et « plus ».
- [x] **Une exclusion dans un seul sens en toutes lettres** (lot 4, question 6) : « Inès ne tire pas Louis », sans flèche.
- [x] **« Tirée de nouveau »** (Correction 7, question 1) : la réponse de l'édition dit si le tirage a été relancé, et le panneau propose alors « Nouveau tirage » tout seul.

### Lot 6 — Journal

Fichiers : `JournalList.vue`, `JournalView.vue`, `admin/[slug]/journal.vue`, `p/[token]/journal.vue`.

- [x] `Journal`, `JournalTout` : deux vues, « L'essentiel » et « Tout » ; par jour ; les événements répétés d'un même type regroupés en une ligne dépliable (« 5 personnes ont découvert leur résultat »). Fonctions pures `essentialEvents` et `groupEvents`, testées.
- [ ] `JournalPersonne` : filtre « Moi », seulement si les événements portent déjà la personne concernée ; sinon section 6.
- [x] `JournalDetail` : « Qu'est-ce que ça veut dire ? » ouvre un panneau qui explique l'alerte.
- [x] `JournalAide` : panneau « À quoi sert le journal ? ».
- [x] **Squelette** du journal : une pièce « frise verticale » (`ChargementJournal`).

### Lot 7 — supprimé

Supprimé le 16 novembre 2026. Les quatre écrans de la liste de souhaits (`Souhaits`, `SouhaitsVide`, `SouhaitsIdee`, `SouhaitsFigee`) sont remplacés par la fonctionnalité « Pistes de cadeaux » (README 22.11), qui sera codée à part : ne pas les refaire ici, et ne pas se servir de ces quatre maquettes. Les écrans « Rejoindre » passent au lot 8.

### Lot 8 — Connexion, compte, demandes, invitation

- [x] `Rejoindre`, `RejoindreConnecte`, `RejoindreFait`, `RejoindreFerme` (`rejoindre/[code].vue`) : les quatre états. `RejoindreFerme` montre le cas « plus de place » ; même écran, autre phrase, pour un lien expiré (« Ce lien d'invitation n'est plus valable depuis le 10 décembre. ») et pour un lien désactivé ou inconnu (« Ce lien d'invitation ne marche plus. »). Si le tirage est déjà fait, la personne rejoint le groupe, pas le tirage en cours : le dire sur `RejoindreFait`.
- [x] `ConnexionEnvoye`, `ConnexionConfirmer`, `ConnexionLienInvalide` (`AuthEmailLogin.vue`, `login/[token].vue`) : logo à la place de l'emoji clé, textes des maquettes.
- [ ] `Compte` (`compte.vue`) : profil en lignes modifiables, appareils, déconnexion.
- [ ] `AccueilMenu`, `AccueilDemandeAttente`, `AccueilDemandeRefusee` : voir « Partiel ».
- [x] **Actions en cours** conformes : roue dans « Recevoir mon lien », « Se connecter », « Rejoindre le groupe ».

### Lot 9 — Administration (super-admin)

- [ ] `AdminAcces`, `AdminAccesMenu` : la barre du bas (`AdminBottomNav`) disparaît ; l'accès se fait par une ligne « Administration » en bas de l'accueil et par le menu, avec le nombre de demandes en attente.
- [ ] `Admin`, `AdminPlusieursDemandes` : accueil de l'administration ; la demande la plus ancienne dans la carte, les suivantes en lignes.
- [ ] `AdminDemande` : réponse dans un panneau, avec l'effet sur le quota (sans le champ « Un mot pour elle »).
- [ ] `AdminComptes`, `AdminCompte`, `AdminGroupes` (`admin/comptes/*`, `admin/groupes/index.vue`).
- [ ] `GroupeNouveauAdmin` (`admin/groupes/nouveau.vue`, vu par un super-admin) : le champ « Adresse du premier organisateur » reste, mais dans un bloc à part, en pointillés, intitulé « Super-admin » avec la mention « Visible seulement par les super-admins ». Un compte normal ne voit ni le bloc ni le champ, et garde la phrase « Tu en seras l'organisateur ». Même marquage pour toute commande réservée au super-admin posée sur un écran que tout le monde voit (par exemple « Supprimer le groupe » dans les réglages) : un seul composant.

- [ ] Validé par Julien le 16 novembre 2026 : le super-admin ne modifie plus le profil d'un compte (prénom, icône, langue), il le lit seulement ; « Accepter » et « Refuser » ont le même poids visuel. Retirer du client le formulaire de profil de `admin/comptes/[id].vue` ; la route d'API reste en place.
- [ ] **Actions en cours** conformes : roue dans « Accepter » et « Refuser ».

### Lot 10 — Finitions

- [ ] Supprimer les composants et les clés de dictionnaire devenus inutiles.
- [ ] `tests/e2e/design.spec.ts` et guide de style à jour.
- [ ] README 11 et 23 réécrits pour les écrans refaits.
- [ ] Cocher les lots ici, et lister ce qui reste en section 6.

## 6. Questions pour Julien

À remplir pendant le travail : donnée manquante, écart entre une maquette et une règle, choix à trancher.

Rien pour l'instant : le seuil du repli (12), les réglages sans bouton « Enregistrer » et les deux choix de l'administration ont été validés le 16 novembre 2026.

### Lot 1

1. **`ClotureeSecrete` et les paires du tirage.** La maquette dit « Le tirage reste secret, même pour toi » et liste les participants avec « A participé ». Aujourd'hui, une édition clôturée montre à l'organisateur qui a offert à qui (`AdminEditionResults`, README 8.7). Comme le plan le demande, rien n'est retiré : l'écran garde les paires, et la phrase « secret » n'est pas écrite (elle serait fausse). L'encadré dit « En lecture seule. Le tirage sert à éviter les mêmes paires les années suivantes. » Faut-il cacher les paires d'une édition clôturée, comme la maquette le suppose ?
   **Réponse de Julien, 17 novembre 2026 :** on garde le comportement actuel, l'organisateur voit qui a offert à qui (README 8.7). La maquette supposait la future fonctionnalité « Dévoiler les résultats » : on y reviendra avec elle. Rien à coder.
2. **`PreparerVide` : « au moins trois ».** La maquette dit qu'il faut au moins trois participants ; le tirage en accepte deux (`too_few_participants`). Le texte dit « deux ». Faut-il relever le minimum à trois ?
   **Réponse de Julien, 17 novembre 2026 :** trois, pas deux : à deux, chacun sait à qui il offre. Changer la règle du tirage, son test et les textes dans les trois langues (Correction 10).
3. **`EtatConfirmation` : les prénoms.** L'API d'envoi renvoie le nombre d'emails partis, pas les prénoms. Le message nomme les personnes cochées seulement quand tout est parti en un appel (50 au plus) ; au-delà, il donne le nombre seul. Le test de bout en bout ne peut pas le vérifier : le serveur de test n'a pas de clé d'envoi.
   **Réponse de Julien, 17 novembre 2026 :** ça me va, rien à changer.
4. **Démo à 100.** `seed:demo` crée « comite-demo » (à préparer) et « grand-tirage-demo » (tirage fait) avec 99 prénoms : l'organisatrice, personne du groupe, fait la centième. Une édition ne peut pas dépasser 100 participants.
   **Réponse de Julien, 17 novembre 2026 :** ça me va, rien à changer.

### Lot 2

1. **`AjouterParticipants` : « A participé à Noël 2025 ».** La route des personnes ne dit pas qui a participé aux éditions passées. La ligne d'un membre affiche son adresse, ou « Pas d'adresse email ». Faut-il ajouter cette donnée à la route des personnes ?
   **Réponse de Julien, 17 novembre 2026 :** ça me va, pas de « A participé à Noël 2025 ».
2. **Panneau d'envoi : le moyen du dernier envoi.** La maquette dit « Envoyé par email, pas encore consulté ». Les participants d'une édition portent la date du dernier envoi (`messageSentAt`), pas son moyen ; le journal, lui, le connaît. L'en-tête garde « Envoyé, pas encore consulté », sans la date ni le moyen. Faut-il ajouter le moyen (et afficher la date) à la réponse de l'édition ?
   **Réponse de Julien, 17 novembre 2026 :** afficher la date, déjà dans les données (« Envoyé le 14 nov., pas encore consulté »). Pas le moyen d'envoi : on ne touche pas au serveur pour ça (Correction 10).
3. **`RenvoiPepin` : « Un second appui confirme. »** La maquette l'écrit sous « Régénérer son lien ». C'est une note de conception (section 3) : elle n'est pas écrite, le second appui reste.
   **Réponse de Julien, 17 novembre 2026 :** ça me va, rien à changer.
4. **`Renvoi`, `RenvoiPepin` : la phrase « Partager ouvre WhatsApp, SMS… ».** Retirée à ta demande ; les maquettes la montrent encore.
   **Réponse de Julien, 17 novembre 2026 :** ça me va, rien à changer.
5. **« de Agathe ».** Les textes écrivent « de {name} » partout (« Adresse email de Agathe », « le lien de Ines »), sans élision devant une voyelle. Faut-il une règle d'élision pour le français ?
   **Réponse de Julien, 17 novembre 2026 :** oui. En français, « de » devient « d' » devant une voyelle ou un h : « d'Agathe », « d'Inès », « d'Hugo ». Une fonction pure testée, utilisée partout où un texte écrit « de {prénom} ». Rien à changer en anglais ni en allemand (Correction 10).
6. **`EnvoiSansEmail` et `EnvoiAjouterEmail` : le bandeau de la personne suivante.** Les maquettes ne le montrent pas sans adresse ; il reste affiché, pour passer à la suivante.
   **Réponse de Julien, 17 novembre 2026 :** sans objet : l'enchaînement vers la personne suivante n'existe plus.

### Lot 3

1. **Les organisateurs.** La maquette `Groupe` n'a plus de ligne « Organisateurs » ; sa ligne « Réglages » dit « Règles du tirage, organisateurs ». L'écran des réglages (lot 5) ne menait pas aux organisateurs : une ligne « Organisateurs » y est ajoutée en bas, pour ne pas perdre l'accès. Le lot 5 la mettra à sa place.
   **Réponse de Julien, 17 novembre 2026 :** ça me va.
2. **Supprimer le groupe (super-admin).** Absent de `Groupe` ; la maquette `GroupeReglages` le place dans les réglages. Il reste en bas de l'accueil du groupe jusqu'au lot 5.
   **Réponse de Julien, 17 novembre 2026 :** ça me va.
3. **Budget et petit mot d'une nouvelle édition.** La route de création ne les prend pas : ils sont enregistrés juste après, par la route qui modifie l'édition, quand ils diffèrent de ceux du groupe. Le journal note alors aussitôt « L'organisateur a modifié les règles du tirage ». Faut-il que la création accepte ces deux règles (changement de route) ?
   **Réponse de Julien, 17 novembre 2026 :** la route de création accepte le budget et le petit mot, pour ne plus écrire « L'organisateur a modifié les règles » au journal juste après chaque création (Correction 10).
4. **L'année d'une nouvelle édition.** Le champ « Année » disparaît comme dans la maquette ; l'année est celle que l'app propose (`nextEdition`). Une date de fête choisie dans une autre année ne la change pas.
   **Réponse de Julien, 17 novembre 2026 :** ça me va, l'année reste déduite.
5. **`GroupeSansEdition` : qui est repris.** La maquette dit « Les 5 membres du groupe sont repris ». Le serveur reprend les participants de la dernière édition encore actifs (README 4.2) : la carte dit donc « Les 4 participants de Noël 2025 sont repris », et « membres du groupe » seulement pour une première édition.
   **Réponse de Julien, 17 novembre 2026 :** ça me va.
6. **Membres.** Sous le titre, « 5 membres » compte les personnes actives ; la ligne « Membres » dit combien de personnes compte le groupe, désactivées comprises, comme la maquette (« 5 membres », « 6 personnes »).
   **Réponse de Julien, 17 novembre 2026 :** un seul chiffre partout, celui des membres actifs. La ligne « Membres » précise « dont 1 ne participe plus » quand c'est le cas (Correction 10).
7. **Date libre d'un ancien réglage.** Un groupe dont la date de fête est un texte libre (« 25 décembre ») n'a pas de ligne de date sur la carte de l'édition.
   **Réponse de Julien, 17 novembre 2026 :** ça me va.

### Lot 4

1. **`GroupePersonne`, `PersonneNouvelle` : le groupe sous le titre.** Ces deux maquettes écrivent « Famille Camille » sous le titre. La règle du contexte (Correction 5) l'emporte : la ligne « Famille Camille » est au-dessus du titre ; sous le titre reste « participe à Noël 2026 ».
   **Réponse de Julien, 17 novembre 2026 :** ça me va.
2. **`GroupeInvitation` : « Chaque réglage s'enregistre dès qu'il est validé. »** C'est une note de conception (section 3) : elle n'est pas écrite.
   **Réponse de Julien, 17 novembre 2026 :** ça me va.
3. **Places du lien : un pas à la fois.** Le panneau `PanneauNombre` n'a que « moins » et « plus ». La valeur par défaut est ce que le groupe peut encore accueillir (jusqu'à 99) : descendre à 5 demande beaucoup d'appuis. Faut-il pouvoir taper le nombre ?
   **Réponse de Julien, 17 novembre 2026 :** on peut taper le nombre, en gardant les boutons « moins » et « plus » (Correction 10).
4. **Fiche d'une personne retirée du groupe.** La maquette ne montre que « Retirer du groupe ». Une fois retirée, la fiche propose « Remettre dans le groupe » et « Supprimer définitivement » (seulement si elle n'a jamais participé), qui existaient déjà.
   **Réponse de Julien, 17 novembre 2026 :** ça me va.
5. **« Nouvelle personne » sans nom de famille**, comme la maquette : il s'ajoute ensuite sur sa fiche.
   **Réponse de Julien, 17 novembre 2026 :** ça me va.
6. **Une exclusion dans un seul sens** s'écrit « Inès → Louis » dans la liste ; la maquette ne montre que des paires dans les deux sens.
   **Réponse de Julien, 17 novembre 2026 :** en toutes lettres, « Inès ne tire pas Louis ». Pas de flèche (Correction 10).
7. **`AdminPersonForm`** ne sert plus qu'au profil d'un compte : à simplifier au lot 8, avec l'écran du compte.
   **Réponse de Julien, 17 novembre 2026 :** ça me va, à simplifier au lot 8.

### Correction 7

1. **« Nouveau tirage » choisi tout seul.** Le tirage remet la pastille « envoyé » à zéro, et rien dans les données de l'édition ne dit qu'elle a été tirée une deuxième fois. `defaultMessageType` sait choisir « Nouveau tirage », mais le panneau lui dit toujours « pas de nouveau tirage » : après une relance du tirage, il propose « Tirage fait », et l'organisateur choisit « Nouveau tirage » dans « Personnaliser le message ». Faut-il ajouter à la réponse de l'édition qu'elle a été tirée de nouveau (changement de route) ?
   **Réponse de Julien, 17 novembre 2026 :** ajouter à la réponse de l'édition le fait qu'elle a été tirée de nouveau, pour que ce message se choisisse tout seul après une relance du tirage (Correction 10).
2. **Sous-titre de l'en-tête du panneau.** Le plan dit « l'état de la personne, plus le nombre de personnes restantes » ; les maquettes `Envoi`, `Renvoi` et `EnvoiPersonnalise` ne montrent que l'état (« Pas encore envoyé »). Le panneau suit les maquettes.
   **Réponse de Julien, 17 novembre 2026 :** ça me va.
3. **« Ce qu'elle recevra »** (`PersonnaliserMessage`) : le genre de la personne n'est pas connu ; l'écran dit « Ce que {prénom} recevra ».
   **Réponse de Julien, 17 novembre 2026 :** ça me va.
4. **« Envoyé par email »** reste écrit « Envoyé, pas encore consulté » : le moyen d'envoi n'est pas dans les données (lot 2, question 2). **« Un second appui confirme. »** n'est toujours pas écrit (note de conception, lot 2, question 3).
   **Réponse de Julien, 17 novembre 2026 :** ça me va, déjà traité.

### Lot 5

1. **Réglages absents de la maquette.** `GroupeReglages` ne montre plus le budget, la date de la fête, le petit mot de l'organisateur ni le nombre d'idées par liste, qui étaient des règles du groupe. L'écran suit la maquette : ces valeurs restent en base et servent toujours (le budget repris par « Nouvelle édition », 10 idées par liste), mais ne se changent plus au niveau du groupe. Le budget, la date et le mot se règlent désormais par édition. Faut-il garder une ligne pour le nombre d'idées par liste ? **Réponse de Julien, 16 novembre 2026 :** voulu pour le budget, la date et le mot, qui se règlent par édition (voir « Correction 9 ») ; le nombre d'idées reste figé en attendant les pistes de cadeaux.
   **Réponse de Julien, 17 novembre 2026 :** déjà répondu, voir « Correction 9 ».
2. **`PanneauNombre` du lien d'invitation et `PanneauTexte`** : les réglages du lien s'enregistrent maintenant comme ceux du groupe, dès la validation du panneau (règle de ce lot).
   **Réponse de Julien, 17 novembre 2026 :** ça me va.
3. **« Réservé au super-admin »** sous « Supprimer le groupe » n'est montré qu'au super-admin, seul à voir la ligne.
   **Réponse de Julien, 17 novembre 2026 :** ça me va.

### Lot 6

1. **Le filtre « Moi » et « Tout le monde » (`JournalPersonne`).** Les lignes du journal ne portent pas la personne concernée : la route renvoie le type, la phrase, l'édition et l'heure, jamais l'identifiant de la personne. Le filtre par personne, la pilule « Tout le monde » et la version « Moi (Hugo) » (« Tu as découvert ton résultat », l'encadré vert) sont donc laissés de côté. Il faudrait ajouter la personne à chaque ligne du journal, et, côté participant, savoir laquelle est « moi » : un changement de route. On le fait ?
2. **Les icônes et les prénoms d'une ligne regroupée.** « 5 personnes ont découvert leur résultat » montre, dans la maquette, les icônes des cinq personnes, et le détail les liste avec leur icône et leur prénom. Sans la personne sur chaque ligne (question 1), la ligne regroupée n'a pas d'icônes et son détail reprend la phrase de chaque événement (« Rose a découvert son résultat », 23:50).
3. **Les envois regroupés.** La maquette dit « L'organisateur a envoyé « Tirage fait » à 5 personnes par email ». La ligne ne porte ni le message ni le moyen d'envoi : l'écran regroupe donc tous les envois d'un jour et d'une édition et dit « L'organisateur a envoyé 5 messages » ; le détail donne chaque phrase, qui, elle, dit le message et le moyen. Ajouter le message et le moyen aux lignes du journal ferait le regroupement de la maquette (changement de route).
4. **« Qu'est-ce que ça veut dire ? » (`JournalDetail`).** Sans la personne (question 1), le texte ne peut pas dire « à qui Hugo offre un cadeau » ni « Ce que ça change pour toi : rien », faux pour Hugo lui-même. Il dit « à qui la personne nommée offre un cadeau » et « Ce que ça change. Les autres résultats et les listes de souhaits n'ont pas été vus. » J'ai aussi écrit l'explication de deux alertes que la maquette ne montre pas : « Tirage annulé » et l'ancien « L'organisateur a consulté les résultats du tirage ». Les textes te vont ?
5. **La phrase sous la liste**, « L'essentiel regroupe les envois et laisse de côté les changements d'icône et de langue », explique l'interface ; elle est dans la maquette, donc gardée, et seulement sous « L'essentiel ». On la garde ?

### Lot 8

1. **Rejoindre le tirage en même temps que le groupe.** **Réponse de Julien, 17 novembre 2026 :** la route `join` ajoute aussi la personne à l'édition « à préparer » (exception à « interface seulement », sans migration, avec son test). Fait.
2. **La date d'un lien d'invitation expiré.** La page d'invitation ne reçoit pas la date limite du lien : « Ce lien d'invitation n'est plus valable » s'affiche donc sans « depuis le 10 décembre ». L'ajouter demande que la route de l'invitation renvoie `inviteUntil` (changement de route). On le fait ?
3. **L'adresse sur « Se connecter sur cet appareil ? ».** La maquette dit « Tu vas être connecté avec hugo-demo@example.com pendant 30 jours ». La page du lien ne connaît pas l'adresse sans consommer le lien, et c'est voulu (un lecteur d'emails ne doit pas pouvoir l'utiliser). L'écran dit « Tu vas être connecté sur cet appareil pendant 30 jours. » Lire l'adresse du jeton sans le consommer serait une nouvelle route ; on la veut ?
