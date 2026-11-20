# Plan de refonte des interfaces — ce qui reste à coder

> **Archive, gelée le 20 novembre 2026.** On n'écrit plus dans ce fichier. Le travail se suit dans `docs/travail/` (un ticket par fichier), la spec de la V3 dans `docs/spec/v3/`, les décisions dans `docs/decisions/`. Ce qui restait ouvert ici est repris par les tickets 100 à 134 : le lot 42 (la V3) par les tickets 101 à 111, les autres lots par les tickets 120 à 134. Pourquoi : `docs/decisions/2026-11-20-organisation-du-travail.md`.

Écrit le 16 novembre 2026, à partir du canevas de maquettes (97 écrans) et du code à `5f50067`.
Ce plan est fait pour être exécuté par Claude Code, lot par lot.

- **Depuis le lot 23 (19 novembre 2026), la référence visuelle est `docs/refonte/maquettes-sorbet/<Nom>.html`** : les mêmes écrans dans le style « Sorbet » (README 23.5). Ces fichiers sortent de `docs/refonte/sorbet/habiller.py` : une maquette se modifie toujours dans `docs/refonte/maquettes/`, puis on relance le script. Si une maquette habillée contredit le README 23.5, le README a raison.
- Maquettes d'origine (ancien style, source du script) : `docs/refonte/maquettes/<Nom>.html` (une par écran, 390 px de large, styles en ligne). Le canevas complet : https://claude.ai/artifact/6XYdmH9di9ctyAZxzLD9Ns
- Le statut de chaque écran vient d'une lecture du code et de l'historique Git, pas d'une comparaison visuelle. Les écrans notés « partiel » sont à contrôler en premier dans leur lot.

## 1. Périmètre

**Dans le périmètre** : refaire l'interface d'écrans qui existent déjà, avec les routes d'API, les mutations et les données qui existent déjà.

**Hors périmètre** (ne pas coder, même si une maquette le montre) :

| Sujet | Maquettes concernées | Pourquoi |
|---|---|---|
| Idées futures | `FuturAccueil`, `FuturListes` | Non planifié |
| Liste de souhaits | `Souhaits`, `SouhaitsVide`, `SouhaitsIdee`, `SouhaitsFigee` | Remplacée par « Pistes de cadeaux » (README 22.11) : c'est le lot 16 |

Dévoiler les résultats, le mot de l'administrateur sur un refus et l'alerte du journal sur la page du participant sortent de ce tableau le 17 novembre 2026 : ce sont les lots 12 et 13. Le même jour s'ajoutent deux fonctionnalités complètes, avec base et routes : les pistes de cadeaux (lot 16), puis le tirage déjà fait ailleurs (lot 17). La règle générale ci-dessous ne s'applique pas à ces deux lots.

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
- **Tout écart avec une maquette se note dans `docs/refonte/ECARTS-MAQUETTES.md`** (demandé par Julien le 20 novembre 2026, pour qui tient les maquettes à jour) : la maquette, ce que le code fait autrement ou l'état qu'elle ne montre pas, qui l'a décidé et quand. Dans le même commit que le code. La ligne s'enlève quand la maquette est remise d'accord.
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
- [x] `Compte` (`compte.vue`) : profil en lignes modifiables, appareils, déconnexion.
- [x] `AccueilMenu`, `AccueilDemandeAttente`, `AccueilDemandeRefusee` : voir « Partiel ».
- [x] **Actions en cours** conformes : roue dans « Recevoir mon lien », « Se connecter », « Rejoindre le groupe ».

### Lot 9 — Administration (super-admin)

- [x] `AdminAcces`, `AdminAccesMenu` : la barre du bas (`AdminBottomNav`) disparaît ; l'accès se fait par une ligne « Administration » en bas de l'accueil et par le menu, avec le nombre de demandes en attente.
- [x] `Admin`, `AdminPlusieursDemandes` : accueil de l'administration ; une seule demande : dans la carte, avec un seul bouton « Traiter » qui ouvre le panneau de réponse (« Refuser » et « Accepter » ne sont que dans le panneau). Plusieurs demandes : la même carte, posée sur une pile (deux bords de cartes dépassent dessous), intitulée « À traiter · 1 sur N » ; elle montre la plus ancienne, et la suivante prend sa place après la réponse. Pas de liste des suivantes sur cet écran. Sans demande (`AdminSansDemande`), la carte laisse place à une ligne « Aucune demande à traiter ».
- [x] `AdminDemande` : réponse dans un panneau, avec l'effet sur le quota (sans le champ « Un mot pour elle »).
- [x] `AdminComptes`, `AdminCompte`, `AdminGroupes` (`admin/comptes/*`, `admin/groupes/index.vue`). Les deux listes ont un champ de recherche (`UiSearchField`) : nom ou adresse pour les comptes, nom du groupe ou organisateur pour les groupes.
- [x] `GroupeNouveauAdmin` (`admin/groupes/nouveau.vue`, vu par un super-admin) : le champ « Adresse du premier organisateur » reste, mais dans un bloc à part, en pointillés, intitulé « Super-admin », sans phrase d'explication (le titre suffit ; même chose sur la carte « Administration » de l'accueil, `AdminAcces` et `AdminAccesMenu`). Un compte normal ne voit ni le bloc ni le champ, et garde la phrase « Tu en seras l'organisateur ». Même marquage pour toute commande réservée au super-admin posée sur un écran que tout le monde voit (par exemple « Supprimer le groupe » dans les réglages) : un seul composant.

- [x] Validé par Julien le 16 novembre 2026 : le super-admin ne modifie plus le profil d'un compte (prénom, icône, langue), il le lit seulement ; « Accepter » et « Refuser » ont le même poids visuel. Retirer du client le formulaire de profil de `admin/comptes/[id].vue` ; la route d'API reste en place.
- [x] **Actions en cours** conformes : roue dans « Accepter » et « Refuser ».

### Lot 10 — Finitions

- [x] Supprimer les composants et les clés de dictionnaire devenus inutiles.
- [x] `tests/e2e/design.spec.ts` et guide de style à jour.
- [x] README 11 et 23 réécrits pour les écrans refaits.
- [x] Cocher les lots ici, et lister ce qui reste en section 6.

### Lot 11 — Les données que les routes ne renvoyaient pas (sans migration)

Décidé par Julien le 17 novembre 2026 (réponses de la section 6). Les données sont déjà en base : seules les routes changent, chacune avec son test.

- [x] **Journal** : chaque ligne porte sa personne, et un envoi son message et son moyen. `JournalPersonne` : filtre « Moi » et « Tout le monde » ; lignes regroupées avec les icônes des personnes ; envois regroupés par message et par moyen, comme la maquette ; `JournalDetail` nomme la personne et dit « Ce que ça change pour toi ».
- [x] **Invitation expirée** (`RejoindreFerme`) : « n'est plus valable depuis le 10 décembre ».
- [x] **`ConnexionConfirmer`** : l'adresse du lien, lue sans le consommer.
- [x] **`AccueilDemandeAttente`** : le texte de la demande.
- [x] **`AdminCompte`** : ses groupes, avec rôle, membres et état du tirage, y compris ceux où il participe seulement.
- [x] **`AdminGroupes`** : membres et état du tirage sur chaque ligne.
- [x] **`AdminComptes`** : une demande refusée sur la ligne du compte.
- [x] **`AdminAcces`** : le nom du demandeur le plus ancien et « Voir la demande ».
- [x] **Genre** : une tournure neutre dans les textes de l'administration.
- [x] Au participant, le journal désigne les personnes par des clés propres à la réponse, jamais par leur identifiant (README 8.3).

### Lot 12 — Alerte du journal et mot sur un refus (deux migrations)

Décidé par Julien le 17 novembre 2026.

- [x] **`TirageAlerteJournal`** : colonne `participations.journal_seen_at` (migration). La page du tirage dit « 1 alerte depuis ta dernière visite » sur la ligne du journal ; ouvrir le journal depuis cette page remet le compte à zéro. Sans visite enregistrée, le compte part de la création de l'édition.
- [x] **Mot de l'administrateur sur un refus** : colonne `group_requests.decision_note` (migration). Champ « Un mot pour elle » et ses messages tout prêts dans le panneau de réponse (`AdminDemandeMot`, `AdminDemandeMotBienvenue`, `AdminDemandeMotProches`), repris dans l'email de refus et sur l'accueil (`AccueilDemandeRefusee`).

### Lot 13 — Dévoiler les résultats (README 22.9)

Décidé par Julien le 17 novembre 2026. Une édition clôturée garde ses paires visibles pour l'organisateur, dévoilée ou non (README 8.7 inchangé) : `ClotureeSecrete` n'est pas suivie.

- [x] Colonne `editions.revealed_at` (migration). Route `POST …/editions/[id]/reveal` : édition tirée, date de fête connue ; avant la fête, seulement si l'organisateur le confirme. Irréversible, inscrite au journal (« L'organisateur a dévoilé les résultats »), sans jamais dire qui offre à qui. Une fois dévoilée, le tirage ne s'annule plus, et la route des résultats renvoie les paires.
- [x] `Suivi`, `Suivi100`, `SuiviSansDate` : ligne « Dévoiler les résultats » dans « Plus tard, ou en cas de pépin » ; « Voir un seul résultat ».
- [x] `DevoilerAvant` : avant la fête, l'encadré rouge et la phrase à recopier.
- [x] `Feter` : la fête passée, « Dévoiler les résultats » et « Clôturer sans dévoiler ».
- [x] `Devoiler` : la confirmation dans un panneau.
- [x] `Cloturee` : les résultats dévoilés, puis « Clôturer l'édition ».

### Lot 14 — Le journal signalé depuis l'accueil (README 22.15)

Décidé par Julien le 17 novembre 2026. À faire après le lot 12 : le signal s'appuie sur `participations.journal_seen_at` et sur le même compte d'alertes que la page du tirage. Pas de migration.

- [x] **Route de l'accueil** : pour chaque tirage de la personne, le nombre d'alertes du journal depuis sa dernière visite et, s'il n'y en a qu'une, son type et sa date. Quatre événements comptent, et aucun autre : `result_revealed`, `results_revealed` avant la fête, `draw_cancelled` (tout le groupe), et `link_regenerated` (seulement la personne dont le lien a été régénéré). Avec ses tests.
- [x] **Dans la carte** (`FuturAccueilJournal`, `FuturAccueilJournalAcces`, `FuturAccueilJournalDevoile`, `FuturAccueilJournalAnnule`) : quand l'alerte concerne le tirage de la carte, une ligne ambrée sous le bouton principal, « Du nouveau au journal. » suivi de la phrase de l'événement et de sa date. Elle ouvre le journal sur l'explication de l'alerte.
- [x] **Plusieurs alertes** (`FuturAccueilJournalDeux`) : une seule ligne, « 2 alertes depuis ta dernière visite », qui ouvre le journal.
- [x] **Sur un autre tirage** (`FuturAccueilJournalPlusieurs`, `FuturAccueilJournalOrganisateur`) : le sous-titre de la ligne du tirage devient « Du nouveau au journal », avec un point ambré ; la ligne mène à la page du tirage. Rien sur la ligne « Gérer le tirage » d'un organisateur.
- [x] Le signal disparaît quand le journal a été ouvert (même remise à zéro que le lot 12). Si la règle « sans visite enregistrée, le compte part du tirage » cache une annulation, le noter en section 6 plutôt que de trancher.
- [x] Textes en fr, en et de ; guide de style et `tests/e2e` à jour.

Ces maquettes sont sur la page « Accueil et connexion » du canevas, rangée « Le journal signalé depuis l'accueil » ; leurs fichiers gardent le préfixe `Futur`.

### Lot 15 — Les avatars en images, identiques sur tous les appareils

Décidé par Julien le 17 novembre 2026. Aujourd'hui `UiAvatar` écrit l'emoji comme un caractère : chaque système le dessine à sa façon (Apple, Google, Samsung, Microsoft). Julien veut le dessin d'Apple pour tout le monde. Indépendant des autres lots, sans migration.

- [x] Dépendance de développement `emoji-datasource-apple` (images PNG de 64 px, une par emoji ; vérifier le chemin exact dans le paquet). N'embarquer dans l'app que les 30 images de `AVATAR_EMOJIS`, copiées dans `public/` par un script, pas tout le paquet.
- [x] Une seule fonction pure donne l'adresse de l'image d'un emoji (nom de fichier tiré des points de code, y compris `fe0f` pour ❄️ et ⛸️), avec un test qui vérifie que chacun des 30 emojis a son fichier. Le dossier des images est le seul endroit à changer pour passer à un autre jeu.
- [x] `UiAvatar` affiche l'image (`alt=""`, le nom de la personne est déjà à côté), à la même taille visuelle que l'emoji actuel ; si l'image ne charge pas, il retombe sur le caractère. Même chose dans `AvatarPicker` et partout où un avatar est dessiné sans `UiAvatar`.
- [x] Les emails et les messages gardent les caractères : rien n'y change.
- [x] 64 px suffit jusqu'à 32 px d'affichage sur un écran dense ; au-delà (avatar de 56 px de l'accueil), l'image est légèrement agrandie. Le noter en section 6 si le flou se voit.
- [x] README : dire que les images viennent d'Apple, qu'elles restent sous son copyright et ne sont pas sous licence libre, que ce choix est assumé pour un usage familial, et qu'il faudra passer à Noto Emoji (Apache 2.0) ou à Fluent Emoji (MIT) si l'app s'ouvre plus largement.
- [x] Guide de style et `tests/e2e` à jour.

### Lot 16 — Pistes de cadeaux, à la place de la liste de souhaits (README 22.11)

Décidé par Julien le 17 novembre 2026. Fonctionnalité complète. Le README 22.11 fait foi ; les maquettes `Pistes*` (11 écrans) se reproduisent à l'identique. Remplace le lot 7 supprimé.

À découper en plusieurs commits, les tests avec chaque étape.

- [x] **Base** (migration) : pour chaque participation, les six réponses de « Moi et les cadeaux », enregistrées comme des valeurs fixes par question (premier choix, second choix, « les deux me vont », sans réponse), jamais comme du texte ; et les trois textes libres de 300 caractères (« En ce moment », « Ce qui me servirait », « J'évite, ou j'ai déjà »). La liste actuelle est conservée telle quelle : elle devient « Une idée précise, si tu sèches ».
- [x] **Réglage du groupe à trois valeurs** (`PistesReglage`), à la place de l'interrupteur : portrait et idées précises, portrait seulement, aucune piste. La migration convertit l'ancien réglage (activé donne la première valeur, désactivé la dernière).
- [x] **Ma page** : `Pistes`, `PistesVide`, `PistesQuestion` (une question par écran, un appui pour répondre), `PistesRubrique`. Tout est facultatif. « Reprendre mes pistes de {édition précédente} » quand la page est vide.
- [x] **Chez celui qui offre** : `PistesResultat` (les six réponses en étiquettes, puis les rubriques) et `PistesResultatVide`. Seul celui qui offre les voit, après le tirage (README 6 bis.2 inchangé). Aucun pronom genré.
- [x] **Demander des pistes** : `PistesDemander`, `PistesResultatDemande`, `PistesDemande` (le bandeau sur la page de la personne), `PistesEmail`. Une seule demande par tirage, sans relance ; le bouton disparaît ensuite. Anonyme : aucune route, aucun email, aucune ligne de journal, aucun écran de l'organisateur ne dit qui demande, ni qu'une demande a eu lieu. Envoyée tout de suite. Quand des pistes arrivent, celui qui a demandé reçoit un email. Les deux emails passent par `buildEmail` (README 13.3) : texte simple, un lien.
- [x] **Journal** : l'événement `wishes_updated` n'est plus écrit ni affiché, et le panneau « À quoi sert le journal ? » dit « Qui offre à qui, ni les pistes de cadeaux de chacun » (maquette `JournalAide`). L'organisateur ne voit qu'un état, « a laissé des pistes » ou non.
- [x] **Vocabulaire** : « liste de souhaits » et « idées de cadeaux » disparaissent de l'accueil, de la page du tirage, du suivi de l'organisateur, des messages et de la carte « À faire maintenant » (README 22.10, rang 7). Trois langues. Les maquettes des écrans déjà codés ont été mises à jour le 17 novembre 2026 avec les nouveaux textes, à reprendre tels quels : `Accueil*`, `Tirage*` (« Mes pistes de cadeaux », « Remplies · modifiables jusqu'à la fête », « Laisser mes pistes de cadeaux », « Des pistes de cadeaux t'attendent. »), `TirageResultat` (identique à `PistesResultat`), `Main` et `Preparer*` (« A laissé des pistes », « chacun peut déjà laisser ses pistes »), `GroupeReglages` et `ChargementReglage` (la ligne « Pistes de cadeaux » avec sa valeur, à la place de l'interrupteur), `AnnulerTirage`, `Feter`, `Devoiler`, `Cloturee`, `PanneauSupprimerGroupe`, `RejoindreFait`. Les maquettes `Souhaits*` ne sont plus suivies.
- [x] **Statistiques** : rien à coder. Seule contrainte, déjà couverte par la base : des valeurs fixes par question, et jamais d'analyse des textes libres.
- [x] README : 22.11 marqué fait, sections 6 bis, 9 et 11 mises à jour. Guide de style et `tests/e2e` à jour.

**Fait le 17 novembre 2026** (commits `2c82a5f` à `70740fd`, puis la documentation). Ce que le README ne tranchait pas est noté en section 6, « Lot 16 » : ce que deviennent les lignes `wishes_updated` déjà au journal (proposition : ne plus les afficher), et comment retenir qui a demandé des pistes pour lui écrire ensuite, sans que cette information soit lisible ailleurs.

### Lot 16 bis — Les pistes de cadeaux, mises en avant

Décidé par Julien le 17 novembre 2026, à faire avant le lot 17. Les pistes sont ce qui distingue l'application d'un Secret Santa ordinaire : celui qui offre doit voir qu'il y en a, et savoir quand il y en a de nouvelles. Une migration.

- [x] **Base** (migration) : la date des dernières pistes de chaque participation (mise à jour à chaque enregistrement : question, rubrique, idée, reprise), et, sur la participation de celui qui offre, la date à laquelle il a ouvert son résultat pour la dernière fois. En fonction pure et testée, trois états pour celui qui offre : pas de pistes, des pistes, de nouvelles pistes (laissées ou modifiées depuis sa dernière ouverture). Ouvrir son résultat remet « nouvelles » à zéro.
- [x] **Budget, date et mot de l'organisateur hors de la carte du résultat**, visibles dans tous les états de la page du tirage (`TirageAttente`, `TirageDecouvrir`, `TirageResultat`, `TirageRevoir` et ses variantes, `TirageAlerteJournal`, `PistesResultat*`, et plus tard `ManuelTirage*`). Entre l'en-tête (avatar, « Salut… ») et la frise, une bande sur toute la largeur, jamais à côté de l'avatar : deux éléments avec leur icône, « Fête le **ven. 25 décembre** » puis « Budget : **30 €** », côte à côte s'ils tiennent, sinon l'un sous l'autre (le budget est un texte libre de 200 caractères : voir `TirageAttenteBudgetLong`). Sous la carte principale et au-dessus des liens, un bloc « Le mot de l'organisateur », coupé à trois lignes avec « Lire la suite » s'il est long. La carte du résultat ne garde que le nom et « Pour t'aider à choisir ». Ce qui manque ne s'affiche pas (pas de budget : seulement la date ; ni l'un ni l'autre : pas de ligne ; pas de mot : pas de bloc). Rien de cela sur une édition clôturée. Aucune route à changer si ces données sont déjà renvoyées avant le tirage ; sinon, les renvoyer.
- [x] **Résultat pas encore découvert** (`TirageDecouvrir`, mise à jour) : s'il y a des pistes, la carte le dit (« et des pistes de cadeaux t'attendent à l'intérieur ») ; sans pistes, la phrase d'avant (« Le tirage est fait. Assure-toi… »). Le fichier `TirageDecouvrirPistes.html` est un doublon à supprimer du dépôt.
- [x] **Résultat caché**, trois états : des pistes (`TirageRevoir`, bouton principal « Revoir mon résultat et ses pistes »), de nouvelles pistes (`TirageRevoirNouvelles`, titre « De nouvelles pistes t'attendent »), pas de pistes (`TirageRevoirSansPistes`, bouton discret, « Pas encore de pistes. Tu pourras lui en demander. » tant que la demande est possible).
- [x] **Résultat ouvert** (`PistesResultatNouvelles`) : quand les pistes sont nouvelles, la pastille « Nouveau » à côté de « Pour t'aider à choisir », et « Pistes mises à jour le {date} ». La pastille n'apparaît qu'à cette ouverture.
- [x] **Accueil** (`AccueilPistesNouvelles`) : de nouvelles pistes sont un cas de la carte « À faire maintenant » (README 22.10), « De nouvelles pistes pour ton cadeau », bouton « Lire ses pistes » ; rang juste après les actions à faire (découvrir son résultat, répondre), avant « laisse tes pistes ». Quand la carte montre autre chose, la ligne du tirage dit « De nouvelles pistes à lire ». Le signal du journal (lot 14) garde la priorité s'il y a les deux.
- [x] **Email** : l'email « des pistes sont arrivées » part à celui qui offre la première fois que des pistes apparaissent après qu'il a découvert son résultat, qu'il les ait demandées ou non ; une seule fois par tirage, jamais pour une simple modification.
- [x] **Organisateur** : sur le suivi, le compte « {n} sur {total} ont laissé des pistes », sans dire lesquelles sont nouvelles ni pour qui.
- [x] Rien de tout cela ne dit à quelqu'un d'autre que celui qui offre qu'il a lu, ou non, les pistes. Trois langues, tests, guide de style, README 22.11.

### Lot 17 — Tirage déjà fait ailleurs (README 22.12)

Décidé par Julien le 17 novembre 2026. À faire après le lot 16. Fonctionnalité complète : base, routes, écrans. Toutes les décisions sont dans le tableau du README 22.12, qui fait foi ; les maquettes `Manuel*` (12 écrans) se reproduisent à l'identique, comme le reste (section 2). Elles ont été mises à jour le 17 novembre 2026 et disent « pistes de cadeaux ».

À découper en plusieurs commits, dans cet ordre, les tests avec chaque étape.

- [x] **Le cœur, en fonctions pures** (`server/utils`, README 7.1), testé avant tout le reste : à partir des réponses, dire qui est en conflit (deux personnes ont nommé la même), s'il ne manque qu'une réponse et laquelle s'en déduit, et si l'édition peut être validée ; transformer des réponses concordantes en un tirage ordinaire.
- [x] **Base** (migration) : le mode de l'édition (tirage par l'application ou déjà fait ailleurs) et les réponses des participants. Une réponse n'est jamais renvoyée par une route de l'organisateur ; à la validation, les réponses deviennent un tirage normal (receveur chiffré) et sont effacées.
- [x] **Routes** : démarrer le mode depuis une édition à préparer ; abandonner (efface les réponses, tant que rien n'est validé) ; enregistrer ou corriger sa réponse (participant, jusqu'à la validation) ; l'état pour l'organisateur (nombre de réponses, prénoms des personnes en conflit, jamais leur réponse) ; valider.
- [x] **Journal** : le mode démarré, chaque réponse enregistrée ou changée (sans son contenu : c'est le garde-fou contre un organisateur qui sonderait avec sa propre réponse), la validation, l'abandon. Textes en fr, en, de.
- [x] **Organisateur, démarrage** : `ManuelPreparer` (le lien « Le tirage a déjà été fait ailleurs ? » sous « Lancer le tirage ») et `ManuelDemarrer` (le panneau, qui dit une fois que les exclusions ne s'appliquent pas).
- [x] **Organisateur, étape « Réponses »** : frise Préparer, Réponses, Fêter. `ManuelCollecte` (demander les réponses), `ManuelRelance`, `ManuelConflit`, `ManuelUneManque`, `ManuelPret`, `ManuelValider`. Les trois messages (Demande, Relance, À vérifier) passent par le panneau d'envoi existant (Correction 7) et par `server/utils/messages.ts`.
- [x] **Participant** : `ManuelTirageDeclarer`, `ManuelTirageChoisir` (tous les participants sauf soi, recherche au-delà de 10), `ManuelTirageConfirmer`, `ManuelTirageAttente` (« Réponse enregistrée », avec l'avancement). Aucun message d'erreur en cas de conflit.
- [x] **Avant la validation** : personne ne voit les pistes de cadeaux de quelqu'un d'autre, et « Demander des pistes » n'existe pas encore ; ajout et retrait de participants possibles. Les exclusions ne sont ni appliquées, ni vérifiées, ni signalées.
- [x] **Après la validation** : l'édition est une édition tirée ordinaire (liens, suivi, résultat, dévoilement du lot 13, alertes du lot 14), et ses paires comptent dans l'historique de l'an prochain.
- [x] Accueil : la carte « À faire maintenant » (README 22.10) et les lignes de tirage connaissent les nouveaux états (réponse à donner, réponse enregistrée, réponses à valider).
- [x] README : 22.12 marqué fait, et les sections qui décrivent le tirage et les étapes de l'organisateur mises à jour. Guide de style et `tests/e2e` à jour.

Ce que le README ne tranche pas, à noter en section 6 plutôt que de décider seul : le sort d'une réponse qui nomme un participant retiré ensuite, et celui d'un participant ajouté après que tout le monde a répondu.

### Correction 11 — Après un déploiement, les téléphones gardent l'ancienne version

Constaté par Julien le 17 novembre 2026, après le déploiement des lots 16 et 16 bis : dans Chrome sur iPhone, des clics ne font rien et des icônes manquent, alors que Safari et l'ordinateur vont bien. Cause : l'onglet garde le code de la version précédente ; chaque écran charge son propre fichier de code (`/_nuxt/…`), dont le nom change à chaque déploiement, et les anciens fichiers n'existent plus sur le serveur (404). La page `/` est envoyée sans en-tête de cache.

- [x] **Les pages se revérifient toujours** : `Cache-Control: no-cache` sur les pages HTML, sans toucher aux fichiers de `/_nuxt/`, qui gardent leur cache d'un an. Les pages `/p/**` gardent leur `no-store`. *Fait par un plugin serveur (`server/plugins/htmlCache.ts`) plutôt que par `routeRules` : une règle `/**` serait aussi passée dans le `_headers` de Cloudflare, et jointe à l'année des fichiers de code.*
- [x] **Un fichier de code disparu recharge la page** au lieu de ne rien faire. `experimental.emitRouteChunkError` vaut déjà `automatic` par défaut : Nuxt recharge quand le code d'un écran manque, et à la navigation suivante quand le fichier `/_nuxt/builds/latest.json` annonce une nouvelle version. *Trouvé en plus* : ce fichier partait avec `max-age=31536000, immutable, max-age=1` (deux règles de `_headers` jointes), si bien qu'aucun onglet n'apprenait un déploiement. Une règle ajoutée à la fin de `_headers` au build le remet en `no-cache`. Les icônes n'ont pas de fichier à elles : elles viennent de `/api/_nuxt_icon` par leur nom, et reviennent avec le rechargement.
- [x] Un test de bout en bout qui simule un fichier disparu (`tests/e2e/deploy.spec.ts`), et vérifie les en-têtes. *Reste l'essai sur Chrome iPhone après le déploiement.* Un onglet resté sur la version d'avant cette correction ne verra pas le changement tout seul : le fermer une fois.

### Lot 18 — Des pages plus claires, avec moins de lignes en bas (README 22.16)

Décidé par Julien le 17 novembre 2026. Interface seulement, aucune migration. À faire avant le lot 19, qui s'appuie dessus. Les maquettes courantes sont à jour depuis le 17 novembre 2026 : `Suivi`, `SuiviSansDate`, `Suivi100`, `Suivi100Deplie`, `EditionReglages`, `Souci`, et tous les états de la page du tirage (`Tirage*`, `PistesResultat*`, `ManuelTirage*`). `DevineSuivi`, `DevineTirage` et `PropEditionReglages` montrent les mêmes pages avec le jeu du lot 19 en plus. Les fichiers `PropSuivi.html`, `PropTirage.html` et `PropSouci.html` sont des doublons à supprimer du dépôt.

- [x] **Suivi de l'organisateur** (`Suivi`, `SuiviSansDate`, `Suivi100`, `Suivi100Deplie`) : la liste « Plus tard, ou en cas de pépin » disparaît. Deux lignes la remplacent, « Réglages de l'édition » et « Un souci ? ». « Dévoiler les résultats » n'apparaît plus avant la fête (étape « Fêter »).
- [x] **Page « Réglages de l'édition »** (`EditionReglages`) : date, budget, petit mot ; le jeu s'y ajoute au lot 19 (`PropEditionReglages`). Chaque ligne ouvre le panneau qui existe déjà ; rien ne change dans les routes.
- [x] **Panneau « Un souci ? »** (`Souci`) : voir un seul résultat, dévoiler avant la fête, annuler et relancer le tirage. Chaque ligne ouvre l'écran qui existe déjà.
- [x] **Réglages du groupe** : ne gardent que ce qui vaut pour toutes les éditions. Le noter en section 6 si une ligne ne se range pas clairement.
- [x] **Page du tirage du participant** (tous les états `Tirage*`, `PistesResultat*`, `ManuelTirage*`) : la liste du bas disparaît. Une tuile par chose à faire : celle qui attend une action est cerclée de rouge avec son appel (« À remplir »), celle qui est faite porte une coche et son état. Une tuile seule prend toute la largeur (c'est le cas tant qu'il n'y a que « Mes pistes de cadeaux ») ; à deux, elles se mettent côte à côte (`DevineTirage`). Dessous, « Journal du groupe » reste une ligne à part, encadrée et bien visible, avec son sous-titre ; en cas d'alerte (lots 12 et 14) elle passe au-dessus des tuiles, en ambre (`TirageAlerteJournal`).
- [x] Un seul composant pour la tuile, dans `app/components/ui`, présenté au guide de style. Trois langues, `tests/e2e`.
- [x] **Complément du 17 novembre 2026 — « Préparer »** (`Main`, `PreparerVide`, `PreparerImpossible`, `Preparer100`, `Preparer100Deplie`, `ManuelPreparer`) : « Si tu veux » garde « Prévenir avant le tirage » et « Exclusions », puis « Réglages de l'édition » (`AdminEditionSettingsRow`, la même ligne aux trois étapes) ; le budget et le petit mot en sortent.
- [x] **Complément — « Réponses »** (`ManuelCollecte`, `ManuelConflit`, `ManuelUneManque`, `ManuelPret`, `SouciReponses`) : « Réglages de l'édition » et « Un souci ? » remplacent « Plus tard, ou en cas de pépin » ; le panneau (`AdminTroubleSheet`, `answers`) contient « Ajouter ou retirer des participants » et « Abandonner et tirer avec l'application » (second appui).
- [x] **Complément — tuile des pistes après la clôture** : sans piste, pas de tuile ; avec des pistes, elle reste en lecture seule (`hintsTile`, testée).
- [x] **Complément — illustrations** : les six dessins des maquettes, un composant chacun (`UiEnvelopeSealed`, `UiEnvelopePending`, `UiEnvelopeOpened`, `UiEnvelopeLocked`, `UiEnvelopeSent`, `UiPodium`), les couleurs du design system par leurs jetons (brique, sapin, moutarde, kraft, fond, texte atténué), les autres telles que dessinées ; `UiEnvelope` choisit selon `envelopeState`, l'écran « Regarde ta boîte mail » prend `UiEnvelopeSent`. Le podium est prêt pour le lot 19, présenté seulement au guide de style.

### Lot 19 — « Devine qui », le jeu de pronostics (README 22.17)

Décidé par Julien le 17 novembre 2026. Fonctionnalité complète : base, routes, tâche planifiée, écrans. Le README 22.17 fait foi ; les maquettes `Devine*` se reproduisent à l'identique. À découper en plusieurs commits, les tests avec chaque étape.

- [x] **Le cœur, en fonctions pures** (`server/utils`, README 7.1), testé avant tout le reste : si les pronostics sont ouverts ; déplacer un pronostic quand la personne est déjà choisie ; corriger les pronostics d'un joueur (la ligne de la personne à qui il offre ne compte jamais) ; le classement ; chaque prix, avec la règle des ex æquo (jusqu'à trois noms, au-delà une phrase, rien si personne) ; pas de palmarès à moins de trois joueurs ; en mode « Qui m'offre ? », trois prix seulement (« Démasqués », « Le mieux caché », « Le suspect idéal ») et pas de classement ; changer de mode (vers « Qui m'offre ? », seuls les pronostics sur son propre Père Noël restent).
- [x] **Base** (migration) : le mode du jeu et l'heure de fin sur l'édition ; les pronostics (qui pronostique, pour quel destinataire, quelle personne). Aucune route ne renvoie le pronostic de quelqu'un d'autre avant le dévoilement.
- [x] **Réglage** (`DevineReglage`) : trois valeurs et l'heure de fin, dans « Réglages de l'édition » (lot 18). Demande une date de fête, qu'on ne peut plus retirer tant que le jeu est actif. L'heure de fin est enregistrée comme un instant, dans le fuseau du navigateur de l'organisateur. Revenir à « Qui m'offre ? » demande une confirmation, car cela efface des pronostics. Repris de l'édition précédente.
- [x] **Participant, avant la fête** : `DevineAccueil`, la tuile « Devine qui » de la page du tirage (lot 18, `DevineTirage`), `DevineUnique`, `DevineUniqueFait`, `DevineChoisir`, `DevinePaires`, `DevineChoisirPaire`, `DevineFerme`. En mode « Toutes les paires », la ligne de la personne à qui j'offre est rendue exactement comme les autres.
- [x] **Organisateur** : la carte du jeu sur le suivi (`DevineSuivi`), avec le nombre de joueurs. « Envoyer un rappel » (`DevineRappel`) : un email à ceux qui n'ont pas encore fait de pronostic et qui ont une adresse, avec un mot facultatif ; le panneau liste ceux qui n'ont pas encore joué (la route renvoie qui a joué, jamais un pronostic) ; ceux qui n'ont pas d'adresse sont signalés, avec le bouton de partage de leur lien, comme sur le suivi. Le bouton n'apparaît que s'il reste quelqu'un à rappeler et que les pronostics sont ouverts. Un seul rappel par édition : ensuite la carte affiche « Rappel envoyé le… » (`DevineSuiviRappelFait`). L'envoi est inscrit au journal.
- [x] **Fin et réponses** : les pronostics ferment à l'heure choisie, ou au dévoilement si c'est plus tôt. Si l'organisateur n'a pas dévoilé, la tâche planifiée (`server/plugins/reminders.ts`) dévoile le lendemain de la fête à cette heure-là, inscrit au journal comme une action automatique. Tant que le jeu est actif, « Clôturer sans dévoiler » n'est pas proposé. Tirage annulé ou jeu éteint : pronostics effacés. Au dévoilement, manuel ou automatique, l'email du palmarès (`DevineEmailPalmares`) part une fois à tous les participants qui ont une adresse, sans aucun nom ; pas d'email à moins de trois joueurs. Trois langues.
- [x] **Le palmarès en images** (`DevineStory1` à `7`) : 7 secondes par écran puis passage automatique au suivant une fois lancé ; appui à droite ou à gauche pour avancer ou reculer ; maintenir met en pause ; la croix ferme ; avec « réduire les animations », rien ne défile tout seul. Un prix sans gagnant est sauté. Visible par tous les participants, joueurs ou non, et par l'organisateur ; s'il ne participe pas, l'écran « mon Père Noël » est sauté. Une édition passée garde son palmarès, figé sur ses participants.
- [x] **La page des réponses** (`DevinePalmares` : en haut, « Découvrir le palmarès » qui lance les images ; dessous, mes pronostics sans correction. `DevinePalmaresVu`, une fois les images vues : « Revoir le palmarès » et mes pronostics corrigés. Ni verdict ni palmarès en liste. `DevinePalmaresPeu`, à moins de trois joueurs : remplacée par la Correction 12) et **les invitations** : journal (`DevineJournal`), accueil (`DevineAccueilPalmares`), page du tirage (`DevineTiragePalmares`). Aucune ne dévoile un nom. Le bouton « Découvrir le palmarès » et la tuile du jeu sont en vert sapin, la couleur du palmarès ; le reste du jeu garde les couleurs normales. Une fois le palmarès vu, la carte de l'accueil disparaît et les liens mènent au récapitulatif.
- [x] **Journal** : activation du jeu, fin des pronostics, « le palmarès est arrivé ». Trois langues.
- [x] README 22.17 marqué fait, sections 9 à 12 à jour. Guide de style et `tests/e2e`.

Les huit points restés ouverts ont été tranchés par Julien le 17 novembre 2026 (mode « Qui m'offre ? », changement de mode, fuseau, email du palmarès, non-joueurs, moins de trois joueurs, date de fête, un seul rappel) : ils sont dans le README 22.17 et dans les étapes ci-dessus.

### Correction 12 — « Devine qui » : le petit palmarès, et le jeu à partir de quatre participants

Demandée par Julien le 18 novembre 2026, après avoir vu l'écran « Moins de trois personnes ont joué : pas de palmarès cette fois », qui est une impasse. Le README 22.17 est à jour et fait foi.

- [x] **Le jeu demande au moins quatre participants.** À trois, le tirage est forcément une boucle : chacun sait qui lui offre. Une fonction pure testée dit si le jeu est possible. Avant le tirage, le réglage reste libre (on règle souvent le jeu avant d'avoir ajouté tout le monde). Si le tirage se fait à trois, le jeu est éteint à ce moment-là et la confirmation du tirage le dit en une phrase. Après un tirage à trois, le réglage est grisé, avec « À partir de quatre participants. À trois, chacun sait déjà qui lui offre : il n'y a rien à deviner. » (`DevineReglageTrois`). Même règle pour un tirage déjà fait ailleurs (lot 17), à la validation.
- [x] **Un ou deux joueurs : le petit palmarès.** Le seuil « pas de palmarès à moins de trois joueurs » disparaît. Les images n'ont alors que quatre écrans : l'ouverture, le suspense, « mon Père Noël » (`DevineStoryPetit`, avec une barre de progression à quatre segments) et la fin. Aucun écran de prix, pas de classement. La page des réponses, les invitations (journal, accueil, page du tirage), l'email et la tuile se comportent comme avec le grand palmarès.
- [x] **Aucun joueur** : rien du jeu après le dévoilement. Ni tuile, ni carte sur l'accueil, ni invitation au journal, ni email, ni ligne « le palmarès est arrivé ». La page « pas de palmarès cette fois » et son texte sont supprimés, dans les trois langues.
- [x] **Édition à trois participants où le jeu est déjà actif** (créée avant cette correction) : petit palmarès, quel que soit le nombre de joueurs. Pas de migration.
- [x] **La tâche du jeu tourne toutes les 15 minutes**, au lieu d'une fois par heure : la ligne « les pronostics sont fermés » et le dévoilement automatique arrivent au plus un quart d'heure après l'heure choisie (réponse à la question 4 du lot 19).
- [x] La maquette `DevinePalmaresPeu.html` n'a plus de raison d'être : à supprimer. Tests des fonctions pures et `tests/e2e` à jour, README sections 9 à 12 à jour, 22.17 déjà corrigé.

### Correction 13 — La page d'un tirage dévoilé (README 22.18)

Demandée par Julien le 18 novembre 2026. Le README 22.18 fait foi ; les maquettes `TirageDevoileAvant`, `TirageDevoileAvantQui`, `TirageDevoileAvantSansPistes`, `TirageDevoileAvantSansJeu`, `TirageDevoileAvantOrganisateur`, `TirageTout` et `AccueilDevoileAvant` se reproduisent à l'identique.

- [x] **La règle** : un tirage dévoilé est visible par tout le groupe. Les routes du participant renvoient alors la personne à qui il offre sans passer par « Découvrir », celui qui lui offre, et la liste des paires ; jamais avant le dévoilement. Tests sur ces trois cas, avant et après.
- [x] **La page du tirage, dévoilé avant la fête** : frise « Tirage dévoilé », bandeau (avec le prénom de celui qui a dévoilé, ou « Tu l'as dévoilé »), carte du résultat ouverte d'emblée, les deux lignes « Qui m'offre mon cadeau ? » (repliée, se replie en quittant la page) et « Voir tout le tirage », tuiles inchangées.
- [x] **La page « Qui offre à qui »** (`TirageTout`).
- [x] **Demander des pistes** après le dévoilement : plus de « Sans dire que ça vient de toi », et l'email nomme celui qui demande. Trois langues.
- [x] **L'accueil** : la carte « Tu offres un cadeau à… » (`AccueilDevoileAvant`).
- [x] **Après la fête** : mêmes règles, trois états dessinés. `DevineTiragePalmares` (le palmarès attend : l'invitation reste l'action principale, puis la carte compacte « Tu as offert un cadeau à… » et les deux lignes, sans « Revoir »), `TirageDevoileApres` (sans jeu ou palmarès vu), `TirageClotureDevoile` (clôturée et dévoilée). `TirageCloture` ne change pas : clôturée sans dévoiler, le secret reste.
- [x] **Côté organisateur** : les textes « toi seul verras la liste » (panneau « Dévoiler ») et « pour l'instant, toi seul vois cette liste » (« Résultats dévoilés ») disent maintenant que tout le groupe la verra. Trois langues.
- [x] README 22.18 marqué fait, 22.9 et sections 9 à 12 à jour. Guide de style et `tests/e2e`.

### Correction 14 — « Devine qui » : douze prix, pondérés, chacun avec sa condition d'affichage

Demandée par Julien le 18 novembre 2026 : « j'adore en avoir plein, un tirage ne sera jamais tout à fait pareil ». Le README 22.17, « Les prix, un par un », fait foi : calcul, condition d'affichage, ordre, plafond. Une maquette par prix, dans l'ordre des images : `DevineStoryDemasques` (jusqu'à trois ; `DevineStoryDemasquesGrille` et `DevineStoryDemasquesNeuf` de quatre à neuf, en grille ; `DevineStoryDemasquesPlus` au-delà), `DevineStory4` (le détective), `DevineStorySansFaute`, `DevineStoryTransparent`, `DevineStory5` (le mieux caché), `DevineStoryRumeur`, `DevineStory6` (le suspect idéal), `DevineStoryJumeaux`, `DevineStoryTriples`, `DevineStoryFil`, `DevineStoryGirouette`, `DevineStoryGroupe`, et `DevineStoryPresDuBut` (personnel). Sous chaque écran, un encadré « La règle · ne fait pas partie de l'écran » rappelle le calcul, la condition et le départage : il n'est pas à reproduire. La barre de progression et les couleurs y montrent un palmarès complet, à titre d'exemple.

- [x] **La note lissée**, fonction pure : `(k + 1) / (n + 2)`. Testée, et utilisée par tous les prix qui pondèrent.
- [x] **Les prix existants, recalculés** : « Le mieux caché » et « Le plus transparent » par la note lissée (réponse à la question 3 du lot 19), « Le détective » par la difficulté de chaque bon pronostic, « Le suspect idéal » avec son départage. Chaque prix a une condition d'affichage (README). Le classement suit le score du détective.
- [x] **Les nouveaux prix sans donnée nouvelle** : « Le sans-faute », « La rumeur », « Les jumeaux », « Sur le fil », « Le score du groupe ». Une fonction pure par prix, qui renvoie le ou les gagnants, la force du prix et de quoi écrire sa phrase ; un test par prix, avec un cas qui l'affiche et un cas qui le saute.
- [x] **Migration** : sur chaque pronostic, la liste des personnes désignées avant la réponse actuelle. Elle s'allonge à chaque changement de réponse ; un pronostic déplacé (personne déjà choisie ailleurs) garde la sienne. Puis « La girouette » et « Si près du but », ce dernier montré au seul joueur concerné.
- [x] **Ajout du 18 novembre, 10 h 20 : le seuil du groupe.** Une fonction pure testée : un joueur sur quatre, arrondi au-dessus, au moins 2 et au plus 5 (4, 8, 9, 13, 17 et 100 joueurs). Il remplace le « au moins 2 » fixe comme condition d'affichage de quatre prix : la rumeur, le suspect idéal, le plus transparent, le mieux caché. README 22.17 à jour ; les maquettes de ces quatre prix le disent sous l'écran.
- [x] **Ajout du 18 novembre : « Démasqués » en grille.** Jusqu'à trois, les grands avatars ; de quatre à neuf, une grille de trois par ligne avec les prénoms (`DevineStoryDemasquesGrille`, `DevineStoryDemasquesNeuf`) ; au-delà de neuf, le nombre seul (`DevineStoryDemasquesPlus`). Ne vaut que pour ce prix.
- [x] **Les jumeaux, les triplés, la rumeur** : jamais d'ex æquo pour un prix à paire. Les jumeaux comptent double une erreur commune ; le départage est celui du README (meilleure note, paire sans autre prix à l'écran, paire fixée la première). Trois joueurs tous jumeaux entre eux deviennent « Les triplés ». Tests : deux paires à égalité, un trio, quatre joueurs identiques.
- [x] **Le choix des écrans** : l'ordre du README, huit écrans de prix au plus (les plus faibles sautés, jamais « Démasqués » ni « Le score du groupe »), règle des ex æquo inchangée. Fonction pure testée.
- [x] **Les couleurs en rotation** : un prix n'a plus de couleur à lui. Les écrans de prix prennent moutarde, prune, sapin, brique, dans l'ordre de leur rang parmi les prix affichés ; les écrans fixes gardent la leur (README). Fonction pure testée : jamais deux voisins de la même couleur. Les maquettes montrent un exemple de rotation, pas une couleur par prix.
- [x] **Les écrans** et leurs phrases dans les trois langues. Chaque prix a plusieurs phrases selon le cas (un ou plusieurs gagnants, « aucune ne l'a trouvé » ou « une seule l'a trouvé », les trois tons du score du groupe).
- [x] Mode « Qui m'offre ? » : rien de spécial à coder, les conditions d'affichage font le tri. Petit palmarès (un ou deux joueurs) : toujours aucun écran de prix.
- [x] README 22.17 marqué fait pour cette partie, sections 9 à 12 à jour, guide de style et `tests/e2e`. À noter en section 6 : toute phrase ou tout seuil qui sonne mal à l'usage.

### Correction 15 — « Devine qui » : donner envie de jouer, et mieux rappeler

Demandée par Julien le 18 novembre 2026. Le README 22.17, « Donner envie de jouer, et rappeler », fait foi. Maquettes : `DevineInviteResultat`, `DevineTirageFin`, `DevineAccueilFin`, `DevineUniquePrix`, `DevinePairesCourse`, `DevinePasse`, `DevineSuiviRelance`, `DevineRappel` (mise à jour), `DevineRappelGroupe`, `DevineSuiviRappelFait` (mise à jour), `DevineReglage` (mise à jour), et les quatre emails `DevineEmailRappelAuto`, `DevineEmailRappelEncore`, `DevineEmailOrgaPoint`, `DevineEmailOrgaFin`.

- [x] **« Je passe mon tour »** (migration) : un participant peut passer son tour et revenir jusqu'à la fin. Fonctions pures testées : qui reste « à rappeler », et le compte « x sur y ont joué », où y exclut ceux qui passent leur tour. La route de l'organisateur les distingue ; les routes des participants ne renvoient que le compte.
- [x] **Le jeu proposé au bon moment** : la carte sous le résultat (`DevineInviteResultat`), tant qu'on n'a ni joué ni passé son tour.
- [x] **Le compte et l'échéance** sur la tuile, la carte de l'accueil et la carte du résultat : le compte dès deux joueurs, l'échéance dans les sept derniers jours. Fonction pure pour le texte de l'échéance.
- [x] **Les prix restent une surprise** (changement du 18 novembre, 10 h 40) : avant la fête, aucun texte de l'application ni d'un email ne nomme un prix ni n'en donne le nombre ; on dit « une surprise », pas « le palmarès », aux joueurs. La page du jeu porte la phrase de la surprise (`DevineUniquePrix`). Une fois qu'on a joué en mode « Toutes les paires » : « 3 pronostics sur 5 » et une barre de progression (`DevinePairesCourse`), calculés sur ses seuls pronostics. Pas de « dans la course pour… ».
- [x] **Le défi de l'an dernier**, quand l'édition précédente du groupe avait le jeu et un palmarès.
- [x] **Le rappel automatique aux joueurs**, par la tâche planifiée : une fois, 48 heures avant la fin, selon les conditions du README ; deux textes selon l'état du joueur ; lien direct vers l'écran du pronostic ; lien « Je passe mon tour ». Fonction pure testée : qui le reçoit, et quand il ne part pas.
- [x] **Les rappels de l'organisateur, sans limite** : la règle « un seul par édition » disparaît. Le panneau garde la date du dernier rappel ; « Écrire au groupe » (`DevineRappelGroupe`) partage ou copie un message sans nom ni lien personnel.
- [x] **La relance suggérée** sur le suivi, cinq jours avant la fin (`DevineSuiviRelance`).
- [x] **Les deux emails à l'organisateur** : cinq jours avant la fin s'il reste quelqu'un à rappeler, et à la fermeture des pronostics.
- [x] **Les deux réglages** du jeu, activés par défaut (`DevineReglage`).
- [x] Journal : le rappel automatique y est inscrit comme une action automatique, sans nom. Trois langues partout. README 22.17 marqué fait pour cette partie, sections 9 à 12 à jour, `tests/e2e`.

### Correction 16 — Les textes au nouveau ton, « Rappeler le jeu » refait, et deux retouches de la Correction 15

Demandée par Julien le 18 novembre 2026. Tout est dans `docs/refonte/TEXTES.md` : la voix (section 1), les mots (sections 2 et 12), puis, fichier par fichier, le texte actuel et le texte proposé. Le document ne liste que ce qui change.

- [x] **Partie 1, validée** (sections 3 à 5) : `participant.ts`, `messages.ts`, `errors.ts`. Côté participant, « mon enveloppe » remplace « mon résultat », et « c'est terminé pour cette année » remplace « cette édition est clôturée ».
- [x] **Parties 2 et 3, validées le 18 novembre à 11 h 10** (sections 6 à 12) : `common.ts`, `notify.ts`, `journal.ts`, `hints.ts`, `auth.ts`, `adminGroup.ts`, `adminEdition.ts`. Sur le suivi de l'organisateur, « Enveloppe ouverte » remplace « Résultat consulté » ; « les résultats » reste pour le tirage entier.
- [x] **L'anglais et l'allemand** : `TEXTES.md`, section 13, donne le texte proposé pour chaque clé modifiée, et le tableau des mots dans chaque langue. En anglais, « organizer » partout (les fichiers mélangent « organizer » et « organiser ») et « party », pas « exchange » ; en allemand, « Feier », pas « Bescherung », et « Umschlag », pas « Ergebnis », pour l'état d'une personne. Pour un texte absent de la section 13, suivre l'esprit, pas le mot à mot.
- [x] Tout nouveau texte écrit pour les Corrections 13 à 15 suit la voix de `TEXTES.md` ; avant la fête, aucun texte ne nomme un prix ni ne dit « palmarès » aux joueurs (Correction 15).
- [x] Les maquettes gardent leurs anciens textes : en cas d'écart, `TEXTES.md` fait foi pour les mots, les maquettes pour la mise en page. Tests et `tests/e2e` mis à jour là où ils lisent un texte.

**« Rappeler le jeu » : une page à deux positions, plus un panneau.** Demandé par Julien le 18 novembre 2026, sur l'écran codé à la Correction 15 : le panneau est trop haut pour un téléphone, ses deux boutons se comprennent mal, et « Ajouter un mot » ne convient pas. Maquettes refaites : `DevineRappel`, `DevineRappelGroupe`, `DevineRappelPersonnaliser`. Le README 22.17 (tableau des rappels) est à jour.

- [x] **Une page**, comme « Envoyer par email » (`SelectionEmail`) : en-tête avec « Annuler », contenu qui défile, bouton fixé en bas.
- [x] **Un interrupteur à deux positions** en haut : « À chacun, par email » et « Au groupe ». Il remplace les deux boutons empilés.
- [x] **« À chacun, par email »** : l'aperçu du message, la liste « Pas encore joué » avec une case cochée pour ceux qui ont une adresse et « Ajouter » pour les autres (comme dans `SelectionEmail`, à la place du bouton de partage par ligne), une phrase qui renvoie vers « Au groupe » et donne la date du dernier rappel, puis un seul bouton, « Envoyer {n} email(s) ».
- [x] **« Au groupe »** : le message, une note qui dit où le coller et qu'il ne nomme personne, puis « Partager » et « Copier le message ».
- [x] **« Personnaliser le message »** remplace « Ajouter un mot » : un lien sous l'aperçu, qui ouvre l'écran existant de personnalisation (un mot en plus, la langue), sans le choix « Quel message ».

**Deux retouches de la Correction 15**, d'après les réponses de Julien (section 6, « Correction 15 ») :

- [x] **Le rappel automatique tolère un retard** : si la tâche planifiée a eu du retard ou une panne, il part quand même jusqu'à six heures après l'heure prévue ; au-delà, il ne part plus. Les trois cas voulus (coupé, jeu allumé tard, organisateur qui vient de rappeler) ne changent pas. Avec son test.
- [x] **« Surprise », pas « palmarès »**, dans `DevinePasse` : « On ne te rappellera pas le jeu. Tu verras quand même la surprise à la fête. », dans les trois langues. La progression compte bien toutes les lignes (« 3 pronostics sur 6 ») : les maquettes `DevinePairesCourse` et `DevinePasse` sont alignées.


### Correction 17 — Le contexte dans les messages, et plusieurs organisateurs

Demandée par Julien le 18 novembre 2026 : les messages manquaient de contexte (« Devine qui », « Under the Tree » ne disent rien), et un groupe peut avoir plusieurs organisateurs. Règle dans `docs/refonte/TEXTES.md`, section 15.

- [x] **Le contexte** : le groupe dans l'objet de chaque email, le Secret Santa du groupe dès la première ligne de chaque message, « Devine qui » présenté. Trois langues.
- [x] **Point 1, la signature** : un email envoyé par un organisateur est signé de son prénom ; sans prénom, ou envoyé par l'application, « Le Secret Santa de {groupe} ». « Under the Tree » ne signe plus que les emails à l'organisateur.
- [x] **Point 3, « tes organisateurs »** : côté participant (page du tirage, jeu, journal, demande de pistes, invitation), le pluriel dès que le groupe a plusieurs organisateurs.
- [ ] **Point 4, plus tard** : dire qui a fait quoi entre organisateurs (« Dernier rappel le 20 décembre, par Hugo », « Hugo le reçoit aussi » dans les emails d'étape, le prénom dans le journal au lieu de « L'organisateur »). Demande de garder qui a fait l'action.

### Lot 20 — Le choix d'une icône, refait pour beaucoup plus d'icônes (README 22.19)

Décidé par Julien le 18 novembre 2026. Indépendant des listes, sans migration : à faire en premier, les listes s'en servent. Maquette : `PanneauAvatarGrand`, qui remplace `PanneauAvatar`. Le panneau reste bas (Correction 8).

- [x] **Plus d'icônes, pour tout le monde** : ajouter à `AVATAR_EMOJIS` des symboles qui ne sont pas de Noël, dont une famille « Enfants et jeux ». Chaque emoji reste dans une famille exactement (test existant). Les images viennent du même paquet que le lot 15 ; le test « chaque emoji a son fichier » doit passer.
- [x] **Le panneau** : en haut, l'icône en cours, le titre, et un bouton rond « Au hasard » (icône seule, deux flèches croisées, nom accessible « Au hasard ») qui tire un symbole et une couleur. Les symboles sur trois rangées qui défilent de côté ; les familles se suivent dans le défilement, chacune avec son titre au-dessus de ses colonnes ; pas d'onglets. Les couleurs dessous, sur une ligne, sous le titre « Couleur ». « Annuler » et « Valider » comme aujourd'hui.
- [x] À l'ouverture, le défilement s'arrête sur le symbole choisi. Rien ne signale les symboles déjà pris par d'autres.
- [x] Le composant accepte une forme (ronde ou carrée), une liste de couleurs et une liste de familles : le lot 21 s'en sert pour l'icône d'une liste.
- [x] Même sélecteur partout où une icône se choisit. Trois langues pour les titres de familles. Guide de style et `tests/e2e`.

### Lot 21 — Listes de cadeaux : celui qui tient la liste (README 22.19)

Décidé par Julien le 18 novembre 2026. Fonctionnalité nouvelle, séparée des tirages : base, routes, écrans. Le README 22.19 fait foi ; les maquettes `Liste*` se reproduisent à l'identique. À découper en plusieurs commits, les tests avec chaque étape.

- [x] **Le cœur, en fonctions pures** (`server/utils`), testé avant le reste : si une liste est un brouillon, partagée ou passée ; ce qu'il manque pour la partager ; ce que chacun voit d'une ligne (celui qui tient la liste, celui qui a coché, les autres) ; les phrases de l'onglet (« 9 cadeaux déjà prévus, dont 2 par toi ») ; les idées reprises d'une liste à la suivante.
- [x] **Base** (migration) : les personnes de ma famille, rattachées au compte (prénom, icône, infos pratiques, goûts) ; les listes (compte qui la tient, icône et couleur, nom, date, mot, jeton du lien, créé seulement au premier partage) ; les personnes d'une liste, dans l'ordre ; les idées (texte, lien, ordre). Aucune route ne renvoie une liste en brouillon à un autre compte.
- [x] **La barre du bas** : deux entrées, « Tirages » et « Listes ». L'onglet « Listes » (`ListesAccueil`, `ListesVide`) : les cartes par date, « Tu tiens cette liste » ou « Brouillon » en tête de carte, « Pour » et les icônes, la phrase du bas, puis « Passées ». Les listes des autres arrivent au lot 22.
- [x] **Créer** (`ListeNouvelle`) : « Nouvelle liste » ouvre le document vide, icône tirée au hasard. Pas de formulaire. Un document quitté sans nom ni personne n'est pas gardé.
- [x] **L'icône de la liste** (`ListeIcone`) : le sélecteur du lot 20, en tuile carrée, six couleurs pleines, quatre familles de symboles propres aux listes.
- [x] **Le document** (`ListeTeneur`) : titre, date et mot modifiables en les touchant ; le mot de départ dans un cadre en pointillés tant qu'il n'a pas été modifié ; effacé, il n'y a plus de mot. Les personnes avec leur icône ronde de 52 px à gauche du prénom et de la ligne d'infos, « ses goûts » vers `ListePersonne`.
- [x] **Écrire une idée** (`ListeIdee`) : la ligne vide en fin de chaque personne ; retour valide et passe à la suivante ; barre « Lien », « Supprimer la ligne », « Terminé » au-dessus du clavier ; enregistrement automatique ; une ligne vide disparaît ; une adresse collée devient « lien ». Supprimer une idée déjà cochée demande une confirmation.
- [x] **« Ajouter quelqu'un »** : le même bloc dans le brouillon et dans la liste partagée ; les personnes de ma famille pas encore sur la liste, puis « Quelqu'un d'autre » (`ListePersonne`). Ajouter une personne reprend ses idées qui n'ont pas été offertes sur sa liste précédente.
- [x] **Le bouton d'état, tout en haut** : « Brouillon · toi seul la vois » et « Partager », puis « Partagée avec la famille » et « Le lien ». `ListePartager` : le lien et le message tout prêt ; s'il manque un nom ou une personne, l'écran le dit et ne crée pas le lien.
- [x] **Ce que voit celui qui tient la liste** : le prénom de celui qui a coché, ou « Anonyme » ; « 9 cadeaux déjà prévus. Toi seul vois les prénoms. » Il ne peut pas cocher les idées qui lui sont destinées.
- [x] Trois langues, au ton de `docs/refonte/TEXTES.md` : les textes français des maquettes font foi, l'anglais et l'allemand sont à écrire dans ce lot et à ajouter à `TEXTES.md`. Guide de style et `tests/e2e`.

### Lot 22 — Listes de cadeaux : celui qui ouvre le lien (README 22.19)

Décidé par Julien le 18 novembre 2026. Après le lot 21.

- [x] **Le cœur, en fonctions pures**, testé avant le reste : cocher, décocher ; proposer à plusieurs, se joindre, se retirer (le cadeau passe au suivant, ou la ligne redevient libre) ; fermer le groupe ; ce que chacun voit d'un cadeau à plusieurs et d'un cadeau hors liste.
- [x] **Base** (migration) : qui offre quoi (compte, idée, seul ou à plusieurs, anonyme ou non pour celui qui tient la liste, le mot, le groupe fermé ou non) ; les cadeaux hors liste ; la dernière visite d'un compte sur une liste. Deux comptes ne peuvent pas cocher seuls la même idée : le second reçoit « c'est déjà pris » et la liste se met à jour.
- [x] **La page du lien** (`ListeVisiteur`) : lisible sans compte. Les lignes barrées ne disent pas qui offre.
- [x] **Sans compte** (`ListeConnexion`) : toucher une case demande l'adresse ; le lien magique ramène sur la liste et le cadeau est coché.
- [x] **Cocher sans panneau** (`ListeVisiteurMes`) : la case coche tout de suite ; « Tu l'offres · seul, sous ton prénom · Changer » sous la ligne ; retoucher la case décoche.
- [x] **« Changer »** (`ListeReserver`, `ListeReserverPlusieurs`) : seul ou à plusieurs, « Dire à Camille que c'est moi », le mot pour les autres, « Finalement, je ne l'offre plus ».
- [x] **À plusieurs** (`ListePlusieursLigne`, `ListeRejoindre`, `ListeRejoindreSept`, `ListePlusieursOuvreur`) : la ligne à 1, à 3, à 7 et au complet ; se joindre passe toujours par le panneau ; « On est au complet » réservé à celui qui a proposé.
- [x] **« J'offre autre chose à Léo »** (`ListeHorsListe`).
- [x] **L'onglet « Listes »** : une liste ouverte en étant connecté y apparaît, avec « Liste de Mamie » en tête de carte, « Tu offres 2 cadeaux. » ou « Tu n'as encore rien coché. », et la pastille des nouvelles idées depuis ma dernière visite. « Passées » : « Liste de Tonton · tu as offert 1 cadeau ».
- [x] Trois langues, guide de style, `tests/e2e`. README 22.19 marqué fait.

### Correction 18 — Rédiger sur une page, plus dans un panneau (README 23.3)

Demandée par Julien le 18 novembre 2026, après le bug du clavier remonté par sa famille (le champ d'un panneau du bas disparaissait sous le clavier ; corrigé et déployé). Règle : README 23.3, « Choisir dans un panneau, rédiger sur une page ». Chaque page suit le modèle `DevineRappelPersonnaliser` : le contexte au-dessus du titre, le titre, le champ en haut avec son aide et son compteur, « Valider » fixé en bas, « Retour » qui abandonne. Les textes ne changent pas : `docs/refonte/TEXTES.md` fait foi. Les anciennes maquettes de panneau restent dans le dossier, avec « remplacée par … » dans leur titre.

- [x] **1. Une idée précise** (l'idée, 200 caractères, et un lien) : page `PistesIdee`, ouverte par « Ajouter une idée » ou par une idée de `Pistes`. « Supprimer l'idée » sous les champs. Remplace `SouhaitsIdee`.
- [x] **2. Les trois textes des pistes** (300 caractères chacun) : une page par texte, `PistesTexteMoment`, `PistesTexteServirait`, `PistesTexteEviter`, ouvertes par leur ligne de `Pistes`. Remplacent `PistesRubrique`.
- [x] **3. Le petit mot de l'édition** (300 caractères) : page `EditionMot`, ouverte par la ligne « Petit mot » de `EditionReglages`. Dans `EditionNouvelle`, le champ devient une ligne « Petit mot pour les participants » qui ouvre la même page ; ce qui est déjà saisi dans le formulaire est gardé au retour.
- [x] **4. Le mot du groupe** (500 caractères, et « Où le placer ») : page `GroupeMot`, ouverte par la ligne « Mot ajouté aux messages » de `GroupeReglages`. Remplace `PanneauTexte`.
- [x] **5. Le message du lien d'invitation** (500 caractères) : page `GroupeInvitationMot`, ouverte par la ligne « Ton mot sur la page » de `GroupeInvitation`.
- [x] **6. Demander à créer un groupe** (500 caractères) : page `DemandeGroupe`, ouverte par « Demander à créer un groupe » de `AccueilVide`. Le champ en haut, « Pourquoi une demande ? » dessous. Remplace `PanneauDemandeGroupe`.
- [x] **7. Répondre à une demande de groupe** (super-admin ; un mot de 300 caractères) : page `AdminDemandePage`, ouverte par la demande dans l'administration. Les messages tout prêts au-dessus du champ (`AdminDemandePageMot`), « Si tu acceptes » dessous, « Refuser » et « Accepter » fixés en bas. Remplace `AdminDemande`, `AdminDemandeMot`, `AdminDemandeMotBienvenue`, `AdminDemandeMotProches`.
- [x] **Restent des panneaux** : le budget (60 caractères), le nombre de places (`PanneauNombre`), un nom ou un prénom, l'heure de fin de « Devine qui », ajouter un organisateur (`PanneauOrganisateur`), supprimer le groupe (`PanneauSupprimerGroupe`), dévoiler avant la fête. Rien à y changer.
- [x] README 23.3 à jour, tests e2e à jour.

### Lot 23 — Le style « Sorbet » (README 23.5)

Décidé par Julien le 19 novembre 2026 : nouvelles couleurs, nouvelles polices, coins plus ronds, illustrations. **Aucun écran ne change de structure, aucun texte ne change.** Le README 23.5 fait foi, avec `docs/refonte/sorbet/habiller.py` pour les valeurs ; les maquettes de `docs/refonte/maquettes-sorbet/` montrent le résultat attendu, écran par écran. **Fait** (19 novembre 2026), d'un bloc et sans migration. Ce qui a été tranché en codant : section 6, « Lot 23 ».

- [x] **Les jetons** (`app/assets/css/main.css`, `app/app.config.ts`) : les rôles gardent leurs noms, leurs valeurs changent (tableau du README 23.5). Les échelles brutes `brick`, `pine`, `mustard`, `kraft` sont remplacées par corail, menthe, lilas et pêche ; aucun écran ne doit nommer une teinte. `warning` devient le lilas ; `error` ne change pas.
- [x] **Les polices** : Outfit pour les titres (`--font-serif` change de nom, ce n'est plus une police à empattements), DM Sans pour le texte, chargées comme Fraunces et Nunito aujourd'hui, avec les seules graisses utilisées.
- [x] **Les coins et la carte** : les rayons du README 23.5 dans les composants `ui/` et dans le thème Nuxt UI (bouton, champ, panneau) ; `UiCard` perd son ombre floue pour le bord et la bande pêche.
- [x] **Plus de jaune** : `UiNotice` (`caution`, `warning`), `UiActionCard` en `tone="warning"`, `UiStar`, les étiquettes et le cadeau à plusieurs des listes passent au lilas. Les jetons `alert`, `alert-ink`, `alert-link` du journal prennent les valeurs de l'alerte (rond violet à l'icône blanche) ; le bandeau « Le tirage n'est plus secret » les suit.
- [x] **Le journal** : l'entrée « Devine qui : le palmarès est arrivé » en vert plein, texte blanc.
- [x] **Les icônes de personne** (`app/utils/avatars.ts`, et côté serveur si les teintes y sont) : les six nouvelles teintes, sous les mêmes noms enregistrés. Les tuiles carrées des listes (`app/utils/listShades.ts`) : voir la section 6.
- [x] **Le palmarès en images** : les quatre fonds foncés du README 23.5, texte blanc partout ; l'ancien écran moutarde avait un texte foncé, il passe au blanc, barres de progression comprises.
- [x] **Les illustrations existantes** (`UiEnvelope*`, `UiEnvelopeSent`, `UiPodium`) : mêmes dessins, aux couleurs de Sorbet par les jetons (`envelope`, `envelope-fold`, `star`).
- [x] **Les huit nouvelles illustrations**, un composant chacune, dessinées d'après `docs/refonte/sorbet/illus2.py` et posées aux endroits du tableau du README 23.5 : le sapin et ses paquets, le sapin au paquet en pointillés, la couronne, les trois paquets cochés, l'étiquette, la lettre cochée, les places à remplir, la feuille à cocher. Le logo reste dans la barre du haut.
- [x] **Les emails** : rien n'y change, pas d'image.
- [x] **Vérifier** : le contraste du texte sur chaque fond (au moins 4,5 pour 1 pour le texte courant) ; chaque écran à 390 px, car les nouvelles polices peuvent faire passer un titre ou un bouton sur une ligne de plus.
- [x] Guide de style et `tests/e2e` à jour. README 23.1 réécrit avec les nouveaux jetons, 23.5 marqué fait. `docs/refonte/maquettes-sorbet/` devient la référence : le dire en tête de ce plan.

### Lot 23 bis — Les icônes en autocollant dégradé, et la pluie de fête du palmarès (README 23.5, 22.17)

Décidé par Julien le 19 novembre 2026. Seule l'apparence des icônes de personne et des tuiles de liste change : rien dans la base, aucun texte. Le README 23.5, « La forme des icônes », fait foi, avec `docs/refonte/sorbet/autocollant.py` pour les valeurs. Les maquettes de `docs/refonte/maquettes-sorbet/` ont été refaites avec cette forme. **Fait** (19 novembre 2026). Points à relire : section 6, « Lot 23 bis ».

- [x] **L'icône de personne** (`UiAvatar`, `app/utils/avatars.ts`) : le dégradé à la place du fond uni, le liseré blanc et l'ombre à la place du bord coloré. Le liseré et l'ombre dépendent de la taille : les calculer dans le composant, pas écran par écran.
- [x] **Les icônes qui se chevauchent** (`UiAvatarStack`) : le dégradé seul, l'anneau actuel, pas d'ombre.
- [x] **La tuile carrée d'une liste** (`ListsTile`, `app/utils/listShades.ts` ; pas `UiTile`, qui est autre chose) : les six teintes des personnes sous les six noms enregistrés (tableau du README), le dégradé, le liseré, l'ombre, penchée de 3 degrés.
- [x] **Les panneaux de choix d'icône** (`AdminAvatarSheet`, `UiIconSheet`, `UiIconPicker`) : dans la grille, l'icône choisie garde son anneau, sans liseré ni ombre, et une tuile de liste reste droite ; les pastilles de couleur en dégradé seul.
- [x] **Le palmarès en images** (`ParticipantStories`) : le dégradé seul ; le liseré clair et l'ombre déjà là restent.
- [x] **La pluie de fête sur le dernier écran du palmarès** (`DevineStory7`, README 22.17) : flocons de neige, étoiles à quatre branches qui scintillent, quelques confettis, derrière le texte, en boucle. Les dessins, les couleurs, les tailles et les durées sont dans la maquette (classes `utt-p` pour la chute, `utt-tw` pour le scintillement). En CSS seulement, sur `transform` et `opacity`. Les positions sont tirées au hasard dans le navigateur, pas au rendu serveur. Décoratif : `aria-hidden`, aucun appui. Avec « réduire les animations » : rien ne bouge, les dessins restent posés.
- [x] **Vérifier** : une icône de 26 px dans une ligne (le liseré ne doit pas la noyer) ; une tuile penchée dans une ligne à hauteur fixe (rien ne doit être coupé) ; une icône sur une carte blanche et sur le fond de page.
- [x] Guide de style et `tests/e2e` à jour, README 23.5 marqué fait.

### Correction 19 — Rien au-dessus du clavier, et la navigation toujours là (README 23.3, 22.21)

Décidée par Julien le 19 novembre 2026. Indépendante des listes. Maquettes : `NavTirage`, `NavListe`, `NavRedaction`. **Fait** (19 novembre 2026), **sauf l'essai sur un vrai téléphone**, iOS et Android, qui reste à faire par Julien : tout a été vérifié dans Chrome à 390 px, où il n'y a pas de clavier à l'écran.

- [x] **Les pages où l'on rédige** (celles de la Correction 18) : « Valider » quitte la bande collée en bas et descend dans la page, à la fin du contenu. Le clavier passe par-dessus ; toucher hors du champ ferme le clavier. Vérifier sur un vrai téléphone, iOS et Android.
- [x] **Le menu partout**, pour une personne connectée : en haut à droite de chaque écran, à la place du bouton de langue, avec la langue, « Mon compte » et « Se déconnecter ». Y compris sur la page d'un tirage ouverte par le lien personnel, dès qu'il y a une session.
- [x] **La barre du bas partout**, pour une personne connectée : « Tirages / Listes », l'onglet actif selon l'écran. Le contenu de chaque page s'arrête au-dessus d'elle (`env(safe-area-inset-bottom)` compris).
- [x] **Sans session** : rien ne change. **Exceptions** : le palmarès en images n'a ni menu ni barre ; un panneau du bas recouvre la barre.
- [x] README 23.3 et 22.21 à jour, guide de style, `tests/e2e`.

### Correction 20 — Chacun coche aussi ses propres idées (README 22.19)

Décidée par Julien le 19 novembre 2026 : dans le brouillon de sa liste, il n'a pas pu cocher une idée de sa section « Moi ». Ce blocage disparaît. Sans migration. Indépendante des autres lots. **Fait** (19 novembre 2026) : le champ `tickable` et le refus `own_idea` ont disparu.

- [x] **Le cœur** (`server/utils/claims.ts`, `canTick`) : plus de refus `own_idea`. Les tests de `claims.test.ts` suivent.
- [x] **Les routes** (`server/http/claims.ts`, `tickIdea`) : plus de recherche « cette idée est-elle pour moi » ; `own_idea` sort de `server/http/errors.ts` s'il ne sert plus ailleurs.
- [x] **Ce que renvoient les listes** (`server/http/lists.ts`, `tickable`) : toujours vrai ; retirer le champ s'il ne sert plus à rien.
- [x] **Le document** (`ListsIdeaLine`) et **la liste par son lien** (`ListsVisitorLine`, `/l/[jeton]`) : la case d'une idée de « Moi » répond comme les autres, brouillon compris. Elle s'affiche comme toute idée que j'ai cochée.
- [x] `tests/e2e` : dans un brouillon, cocher puis décocher une idée de « Moi ».
- [x] README 22.19 marqué fait.

### Correction 21 — Dans le document, ma coche dit « Tu l'offres · Changer » (README 22.19)

Décidée par Julien le 19 novembre 2026 : la pastille verte « C'est toi » ne va pas. Celui qui tient la liste retrouve dans son document ce qu'il a par le lien. Sans migration. La ligne à reproduire est celle de `ListeVisiteurMes`. **Fait** (19 novembre 2026). Les deux panneaux (`ListsClaimSheet`, `ListsJoinSheet`) et leurs requêtes servent maintenant aux deux vues (`via`). Se joindre depuis le document n'a pas de test e2e : il faut le cadeau à plusieurs d'un autre compte ; la route et le panneau sont ceux du lien, déjà testés.

- [x] **Plus de pastille « C'est toi »** au bout d'une idée que j'ai cochée (`ListsIdeaLine`). La coche verte et le texte en gras restent. Les pastilles des autres (prénom, « Anonyme ») ne changent pas.
- [x] **Sous l'idée**, en petit texte gris : « Tu l'offres · seul · Changer », ou « Tu l'offres · à plusieurs · Changer ». Pas de « sous ton prénom » : c'est celui qui tient la liste qui lit les prénoms.
- [x] **« Changer »** ouvre le panneau de la liste par son lien (`ListsClaimSheet`, maquette `ListeReserver`) : seul ou à plusieurs, le mot pour les autres, fermer le groupe. Sans le choix de rester anonyme.
- [x] **Se joindre depuis le document** : sur un cadeau à plusieurs encore ouvert, « Se joindre » en lien de texte au bout de la ligne, puis « Tu participes », comme par le lien.
- [x] **Les routes de celui qui tient la liste** (`/api/lists/[id]/claims`) : changer sa façon d'offrir et se joindre, brouillon compris, avec les mêmes fonctions pures que par le lien.
- [x] Trois langues, `tests/e2e`, README 22.19 marqué fait.

### Ce qui reste, et dans quel ordre (relu le 19 novembre 2026)

Faits : tout jusqu'au lot 24 bis (ses deux dernières lignes comprises : le crayon, la barre collée), et les Corrections 19 à 24 (de la 23, il reste à Julien la double authentification de ses comptes). **Le lot 25 (à plusieurs, personne reliée) est fait** : sa migration `0028_list_holders` est à appliquer avant de déployer. **Le lot 24 ter (réordonner en glissant) est fait**, sans migration ; il reste à Julien de l'essayer sur iPhone et Android. **Le lot 25 bis (niveaux, pastilles, page d'invitation) est fait** : sa migration `0029_holder_levels` est à appliquer avant de déployer, après la `0028`. **La Correction 25 (décocher pour quelqu'un) est faite**, sans migration. **La Correction 26 (tous les messages en prune foncé, et leurs règles) est faite**, sans migration. **Le lot 38 A (le filet de sécurité) est fait**, sans migration, sauf la politique de contenu à appliquer pour de bon (dans une semaine) et le script de changement de clé. **La Correction 27 (la fiche d'un proche : une page par champ) est faite**, sans migration. **Le lot 27 (reprendre une liste) est fait** : sa migration `0030_carried_from` est à appliquer avant de déployer. **Le lot 26 (les listes en direct) est fait**, sans migration de la base : le premier déploiement crée l'objet durable. **Le lot 27 bis (une liste sans personne) est fait** (20 novembre 2026) : sa migration `0031_amusing_pete_wisdom` est à appliquer avant de déployer. **La Correction 28 (quatre retouches de la liste : le retrait des idées, ceux qui offrent sous l'idée, la pastille du lien, le partage vu par « Aide à écrire ») est faite** (20 novembre 2026), sans migration, après le lot 27 bis par erreur de lecture de l'ordre. **La Correction 29 (la ligne d'une idée : le lien sous le texte, tout en pastilles, plus de « Changer », plus d'air) est faite** (20 novembre 2026), sans migration. **Le lot 27 ter (relier ses pistes d'un tirage à sa liste, et le mode anonyme) est fait** (20 novembre 2026) : sa migration `0032_anonymous_mode` est à appliquer avant de déployer, après la `0031`. Le chantier « Les listes, V2 » est terminé, sauf le lot 41 (idées). Restent ensuite les lots 28 à 41 : voir le tableau pour l'ordre de chaque chantier. **La Correction 30 (les dernières retouches de la liste) est faite** (20 novembre 2026), sans migration. **À faire maintenant : Julien publie les listes en direct.** **Ensuite, le prochain gros chantier est le lot 42, la V3** (le groupe devient la fête, les listes appartiennent aux fêtes, un nouvel accueil) : Julien le veut **avant** la page de présentation (lots 32 et 33), le changement d'infrastructure pour passer à l'échelle (lots 34 et 38 B), le nouvel admin (lot 37) et l'application installée (lot 31), puisque la V3 change presque toutes les pages et que ces lots en dépendent (décidé le 20 novembre 2026). La séance de questions avec Julien est faite (20 novembre 2026) et le lot 42 est réécrit ; ses maquettes sont sur la page « V3 » de l'artifact. Ne rien coder de la V3 avant que Julien les ait validées. Les autres chantiers restent indépendants les uns des autres.

**Le cap** (Julien, 19 novembre 2026) : Noël 2026 est une phase d'essai, avec dix à quinze tirages et autant de listes ; l'application doit être au point pour Noël 2027. Rien ne presse donc au point de sortir un lot à moitié : mieux vaut peu de lots bien finis avant les fêtes (la Correction 23, le lot 24 bis, le lot 38 A), et le reste ensuite.


| Chantier | Ordre | Bloqué par Julien ? |
|---|---|---|
| **Les listes, V2** | Correction 24, 24, 24 bis, 24 ter, 25, 25 bis et la Correction 25 (faits) ; puis 27, 27 bis, 27 ter, 25, 26 ; 41 plus tard (idées) | Non |
| **Les garde-fous et l'ouverture** | Correction 23 tout de suite ; 38 A juste après le lot 24 bis ; puis 35, 36, 39, 37, 38 B, et 34 en dernier | 34 : s'abonner à Workers Paid, activer l'envoi d'emails de Cloudflare, chiffrer les plafonds. 36 : faire relire, décider deux durées, créer l'adresse de contact |
| **Les notifications** | 30, puis 28, 29, 29 bis, 31 | Non |
| **L'assistant (MCP)** | 40, après Noël 2026 | Non |
| **La V3 : la fête** | Lot 42, après la Correction 30 et la publication des listes ; **avant** les lots 31, 32, 33, 34, 37 et 38 B, qui en dépendent | Oui : valider les maquettes de la page « V3 » avant de coder |
| **La vitrine** | 33, puis 32 en tout dernier | 33 : ses textes, le service de dons, ses liens. 32 : confirmer la phrase sur l'assistant |

**Pour reprendre après la séance du 19 novembre 2026 (après-midi).** Les lots 24 et 24 bis et la Correction 22 sont faits. **La suite, dans cet ordre** : la Correction 24 (« Mes proches » : Julien bute dessus en essayant, elle passe en premier), la Correction 23 (sécurité), les deux lignes restantes du lot 24 bis (le crayon sur l'icône, les barres collées en haut), puis le lot 38 A (le filet de sécurité), puis 27, 27 bis, 27 ter, 25, 26. Ce qui a changé dans des lots déjà écrits, à relire avant de les coder :

- **Lot 24 bis** : la barre du haut s'appelle « Partage par lien » (plus « Brouillon » ni « Publiée », plus de texte d'explication) ; plus aucun bouton plein ni rouge dans le partage ; le menu « ⋯ » d'une personne, pour la retirer de la liste.
- **Lot 27 bis** : en bas d'une liste sans personne, le bloc « Ajouter quelqu'un » habituel, pas de lien « Séparer par personne ».
- **Lot 27 ter** : le mode anonyme n'est jamais imposé. Il est activé par défaut quand on vient d'un tirage, avec une note d'avertissement accrochée sous la barre (halo prune, « Compris »).
- **Le lot 36 (données personnelles) passe avant le lot 34** : on n'ouvre pas à tous sans les pages légales ; le lot 39 (signaler, règles d'usage) aussi.
- **Maquettes périmées à supprimer** de `docs/refonte/maquettes/` et `maquettes-sorbet/` : `ListePartager`, `ListePublier`, `ListePublication`, `ListeDepublier`, `ListeNouvelleForme`, `ListeSansPersonneA`, `ListeSansPersonneB`, `ListePersonneSaisie`, `ListePersonneEnregistre`, `AdminTableau`, `AdminAcces`, `AdminAccesMenu`, `AdminSansDemande`, `AdminPlusieursDemandes`, `AdminDemandeMot`, `AdminDemandeMotBienvenue`, `AdminDemandeMotProches`, `AdminDemandePage`, `AdminDemandePageMot`.

Trois règles qui traversent les lots :

- **Tout email nouveau** (lots 25, 29, 29 bis, 30) part par `server/http/email.ts`. Dès que le lot 35 existe, il passe par son contrôle des adresses bloquées ; dès que le lot 36 existe, il porte son pied d'email.
- **Tout champ nouveau qui reçoit une donnée personnelle** porte la ligne « qui verra ce que j'écris » (README 23.3), sans attendre le lot 36.
- **Un lot ne promet rien qu'un autre n'a pas encore fait** : s'il dépend d'un lot pas fait, il le dit en section 6 et laisse la partie de côté.

### Lot 24 — Listes V2 : écrire sur place (README 22.20)

Décidé par Julien le 19 novembre 2026. Sans migration. Maquettes : `ListeIdee`, `ListeIdeeLien`, `ListeIdeeLienFait`, `ListeHorsListe`, `ListePlusieursLigne`, `ListeVisiteur`. **Fait** (19 novembre 2026). Ce qui a été tranché en codant : section 6, « Lot 24 ».

- [x] **Plus de barre au-dessus du clavier** dans le document d'une liste. Sous la ligne qu'on écrit : « Ajouter un lien » et « Supprimer », en liens de texte, visibles tant qu'on est dans la ligne.
- [x] **Le lien dans la ligne** : « Ajouter un lien » prolonge la ligne de « : » avec l'invitation « colle ou écris l'adresse », « Annuler » dessous. L'adresse posée devient le mot « lien » ; dessous, « Changer le lien », « Retirer le lien », « Supprimer ». Une idée garde un texte et un lien au plus : le modèle de données ne change pas.
- [x] **« J'offre autre chose » sur place** : plus de panneau, une ligne écrite en fin de personne, cochée à mon nom, avec sa phrase et « Supprimer ».
- [x] **Des liens de texte** pour « Se joindre » et « Tu participes », zone tactile de 44 px : déjà le cas dans le document depuis la Correction 21 ; reste la liste par son lien.
- [x] **La barre d'une ligne** (« Lien », « Supprimer la ligne », « Terminé », `ListsLineBar`) disparaît : c'est elle que ce lot remplace (Correction 19, point 11 de la section 6).
- [x] Trois langues, `tests/e2e`.

### Correction 22 — Un bateau dans les icônes (demandé par Julien le 19 novembre 2026)

Le frère de Julien fait de la voile, et aucune icône de personne ne s'y prête. **Fait** (19 novembre 2026) : « ⛵ », « 🏊 », « 🎣 », « 🚴 », « 🥾 », après « 🏄 » dans les activités.

- [x] Ajouter le voilier « ⛵ » aux icônes de personne (`server/utils/avatars.ts`) : à la **fin** de `AVATAR_EMOJIS` (les 21 premières servent aux icônes par défaut, leur ordre ne bouge pas) et dans le groupe `activities`, à côté de « 🏄 ».
- [x] Dans la même passe, les loisirs voisins qui manquent : « 🎣 » (pêche), « 🚴 » (vélo de route), « 🏊 » (natation), « 🥾 » (randonnée). À retirer si la grille des activités dépasse ses colonnes.
- [x] Le test qui vérifie que chaque icône est dans un groupe, et un seul, passe toujours.

### Correction 24 — « Mes proches » : voir tout le monde, et supprimer quelqu'un (README 22.20)

Demandé par Julien le 19 novembre 2026 : quelqu'un ajouté par erreur reste proposé dans « Ajouter quelqu'un » pour toujours. Aujourd'hui aucune route ne supprime un membre de la famille (`server/api/family` n'a que la lecture et la modification), et aucune page ne les montre tous. **Fait** (19 novembre 2026), sans migration. Ce qui a été tranché en codant : section 6, « Correction 24 ». Maquettes : `ListeNouvelle` (la croix), `ProcheSupprime`, `ListePersonneMenu`, `Famille`, `FamilleSupprimer`, `ListesAccueil`.

- [x] **Le nom : « Mes proches »**, partout où l'écran disait « ma famille » (décidé par Julien) : la famille, mais aussi les amis et les collègues. Trois langues. Les noms dans le code et la base (`family_members`, `/api/family`) peuvent rester.
- [x] **Retouche du 19 novembre 2026, après essai par Julien : plus aucun « famille » dans les textes des listes** (une liste n'est pas forcément pour la famille). Dans `shared/i18n/locales/*/lists.ts` : « Ton mot pour la famille » devient « Ton mot d'accueil » ; « Ajouter un mot pour la famille », « Ajouter un mot d'accueil » ; « les idées de cadeaux de ta famille », « de tes proches » ; « Ce que la famille demande toujours », « Ce qu'on demande toujours » ; le pied du message de partage, « les Secret Santa en famille », « entre proches ». Relire le fichier entier, et les deux autres langues, pour ceux qui auraient échappé.
- [x] **Le cœur, en fonction pure**, testé d'abord : ce que la suppression emporte (les listes où la personne figure, ses idées, les cadeaux déjà prévus) et quand elle est refusée.
- [x] **`DELETE /api/family/[id]`** : supprime la personne, sa fiche et ses goûts, et la retire de toutes mes listes avec ses idées et leurs coches. Refusé pour « Moi », et pour une personne reliée à un compte tant qu'elle tient une de mes listes avec moi.
- [x] **Une croix sur la pastille, dans « Ajouter quelqu'un »** (demandé par Julien : pour se rattraper tout de suite, sans changer de page) : seulement pour un proche qui n'est sur **aucune** de mes listes. La pastille se coupe en deux zones : le prénom ajoute à la liste, la croix supprime. Suppression immédiate, avec « {Prénom} supprimé de tes proches » et « Annuler » (`ProcheSupprime`) : rien d'autre ne part avec lui, puisqu'il n'est sur aucune liste. Une ligne d'aide sous les pastilles quand au moins une a sa croix.
- [x] **Le menu « ⋯ » d'une personne sur une liste** : « Sa fiche et ses goûts », « Retirer de cette liste » (neutre), « Supprimer de mes proches » (rouge), qui mène à la confirmation.
- [x] **La confirmation** (`FamilleSupprimer`), une page, pour quelqu'un qui est sur des listes : ce qui part (les listes où il figure, le nombre d'idées et de cadeaux prévus perdus), que c'est définitif, et le rappel de « Retirer de cette liste ».
- [x] **La page « Mes proches »** (`Famille`), **dans « Listes »** et pas dans « Mon compte » (décidé par Julien : elle ne sert qu'aux listes de cadeaux) : un lien « Mes proches » sous le titre de l'accueil des listes (`ListesAccueil`) et sous les pastilles de « Ajouter quelqu'un ». Tout le monde, y compris ceux qui ne sont sur aucune liste, avec le nombre de listes ; toucher ouvre la fiche, qui porte « Supprimer de mes proches » en bas ; « Ajouter quelqu'un ».
- [x] **L'adresse email d'un proche reste facultative** (décidé par Julien) : elle sert à préparer le lien avec son compte (lot 25), rien d'autre ; aucun email ne lui part tant que le lot 25 n'existe pas.
- [x] **Les données** (lot 36) : supprimer un proche efface vraiment ses données ; « Mes données » compte mes proches.
- [x] Trois langues, `tests/e2e`.

### Correction 23 — Sécurité : ce qui se corrige tout de suite (section 8)

Demandé par Julien le 19 novembre 2026. **Fait** (19 novembre 2026), sauf la ligne qui revient à Julien. Ce qui a été tranché en codant : section 6, « Correction 23 ». De petites choses, sans migration ni maquette, à faire avant le lot 24 bis. Le reste est dans les lots 38 A et 38 B.

- [x] **Les en-têtes des pages de liste par lien** : `/l/**` et `/api/l/**` reçoivent les mêmes que `/p/**` (`no-referrer`, `no-store`, `noindex`), dans `nuxt.config.ts`. Aujourd'hui le lien d'une liste peut partir vers un site tiers quand on ouvre le lien d'une idée.
- [x] **`Strict-Transport-Security`** sur toutes les réponses (un an, sous-domaines compris seulement si tous sont en HTTPS).
- [x] **Interdire `v-html`** par une règle ESLint (`vue/no-v-html` en erreur). Aucun n'existe aujourd'hui : c'est pour que ça dure.
- [x] **`npm audit` dans `ci.yml`**, en échec sur une faille haute ou critique des dépendances de production ; Dependabot (ou l'équivalent) pour les mises à jour.
- [x] **Les requêtes qui modifient** (`POST`, `PUT`, `PATCH`, `DELETE`) refusent un en-tête `Origin` qui n'est pas celui de l'application, dans un seul intergiciel. Vérifier qu'un `?next=` après connexion, s'il existe, n'accepte qu'un chemin interne.
- [x] **Un test** : `tests/e2e/security.spec.ts` vérifie ces en-têtes sur `/l/…`, et le refus d'une origine étrangère.
- [ ] **Julien, dix minutes** : la double authentification sur Cloudflare, GitHub, Resend et la boîte email du super-admin. Rien à coder.

### Lot 24 bis — Listes : l'effacement au clavier, et publier n'est pas partager (README 22.19, 22.20)

Décidé par Julien le 19 novembre 2026, après le lot 24. **Fait** (19 novembre 2026), sans migration. Ce qui a été tranché en codant : section 6, « Lot 24 bis, en codant ». Maquettes : `ListeIdee`, `ListeIdeeLienFait`, `ListeTeneur`, `ListeNouvelle`, `ListeEtatBrouillon`, `ListeEtatPubliee`, `ListeChangerLien`, `ListePartageArrete`, `ListePersonneMenu`, `ListePersonneRetiree`, `ListePersonneRetirer`. Les maquettes `ListePartager`, `ListePublier`, `ListePublication`, `ListeDepublier` sont périmées : les supprimer de `docs/refonte/maquettes/`.

- [x] **Vérifier ce qui est déjà fait** au commit `53ad385` : plus de « Supprimer » sous une ligne, le texte long qui passe à la ligne, les flèches et la tabulation d'une ligne à l'autre. Les maquettes sont maintenant alignées.
- [x] **L'effacement au clavier** : dans une ligne vide, la touche d'effacement supprime la ligne et place le curseur à la fin de la ligne du dessus, comme dans un document. Sur la dernière ligne vide (« Une autre idée… »), elle remonte seulement. Une idée cochée par quelqu'un : la confirmation habituelle avant de la supprimer. Sur téléphone, la touche d'effacement du clavier fait la même chose.
- [x] **Une barre d'une ligne en haut du document**, sur le modèle de celle du mode anonyme (README 22.19, « Publier, partager, dépublier ») : icône, le titre fixe « Partage par lien », un nom neutre, ni action ni état (le même publiée ou non, sans texte d'explication ; pas publiée, pas de flèche), et l'interrupteur visible même replié ; toujours sur fond blanc ; une fois publiée, seul l'interrupteur est vert (`success`). Elle se déplie sur place. Pas de page, pas de panneau ; l'ancienne page « Partager » (`/listes/[id]/partager`) disparaît, « Personnaliser le message » reste une page.
- [x] **L'interrupteur** : allumé, la liste a son lien ; éteint, le partage s'arrête tout de suite, avec « Partage par lien arrêté » et « Annuler ». Grisé, avec la raison, s'il manque un nom ou une personne.
- [x] **Publiée, dessous** : le lien et « Copier », « Envoyer » (feuille de partage, message tout prêt), « Par email » (`mailto:`, rien n'est envoyé par l'application), « Personnaliser le message », « Changer de lien ». Rien de plein ni de rouge : deux boutons égaux à contour neutre, liens gris (README 22.19).
- [x] **Retouche du 19 novembre 2026, après essai par Julien : un seul bouton, « Partager »** (maquette `ListeEtatPubliee`). « Par email » disparaît : la feuille de partage du téléphone propose déjà la messagerie, la copie et le reste. « Envoyer » s'appelle « Partager » et prend toute la largeur, à contour neutre. Le lien et « Copier » restent au-dessus. Sans feuille de partage (ordinateur), le bouton « Partager » n'est pas affiché : « Copier » suffit. Vérifier au passage que « Copier » copie bien, avec « Copié » en retour : il ne marchait pas à l'essai.
- [x] **Partage arrêté** : le lien affiche « Cette liste n'est plus partagée » ; la liste sort des listes de ceux qui l'avaient ouverte ; les coches restent ; rallumer redonne le même lien (sauf si on l'a changé).
- [x] **« Changer de lien »** (proposition, section 6) : une confirmation sur place, dans la barre, « L'ancien lien ne marchera plus. » avec « Changer » et « Annuler » ; puis le nouveau lien s'affiche. Ceux qui ont un compte et avaient déjà ouvert la liste la gardent.
- [x] **Retirer quelqu'un sans passer par « ses goûts »** (demandé par Julien le 19 novembre 2026, important) : un bouton « ⋯ » au bout du prénom de chaque personne, pour ceux qui tiennent la liste (maquette `ListePersonneMenu`). Il ouvre un petit menu : « Sa fiche et ses goûts » (la fiche existante) et « Retirer de la liste ». Le lien « ses goûts » disparaît pour eux (il reste pour qui vient par le lien). Retirer est immédiat, avec « {Prénom} retiré de la liste » et « Annuler », quand aucune de ses idées n'est cochée ; sinon un second appui, qui dit combien de cadeaux déjà prévus seront perdus. La personne reste dans ma famille ; ses idées partent avec elle. « Retirer de la liste » reste aussi en bas de sa fiche.
- [x] **Changer l'icône d'une personne sans compte, depuis la liste et depuis sa fiche** (demandé par Julien à Claude Code le 19 novembre 2026 ; maquettes `ListeTeneur`, `ListePersonne`) : un petit crayon rond, en bas à droite de l'icône, pour ceux qui tiennent la liste. Toucher l'icône ouvre le panneau de choix habituel. Pas de crayon sur une personne reliée à un compte (elle choisit la sienne), ni par le lien.
- [x] **Les deux barres restent collées en haut quand on fait défiler** (demandé par Julien le 19 novembre 2026) : « Partage par lien » dans le document de celui qui tient la liste, « Mode anonyme » sur la liste ouverte par son lien (`position: sticky`, à 8 px du haut, au-dessus du contenu, une ombre légère). Elles ne sont jamais sur le même écran. Dépliée, une barre se replie dès qu'on fait défiler, pour ne pas masquer la liste ; la note d'avertissement du tirage (lot 27 ter) reste, elle, jusqu'à « Compris ». Rien ne recouvre la ligne qu'on écrit ni le clavier.
- [x] **Les idées en retrait sous leur personne** (demandé par Julien le 19 novembre 2026) : la liste des idées d'une personne est décalée de 20 px vers la droite par rapport à son icône, dans le document comme par le lien ; la ligne qu'on écrit garde son fond pleine largeur.
- [x] **Les mots, à l'écran** : « Partage par lien », « partagée par lien », « plus partagée ». Les mots « publier », « publiée », « dépublier », « brouillon » ne s'affichent plus nulle part (ils restent dans ce plan et dans le code pour désigner l'état).
- [x] Trois langues, `tests/e2e`.

### Lot 25 — Listes V2 : à plusieurs, et une personne reliée à son compte (README 22.20)

Décidé par Julien le 19 novembre 2026. **Fait** (19 novembre 2026), avec la migration `0028_list_holders`, **à appliquer avant de déployer** (`pnpm db:migrate`). Ce qui a été tranché en codant : section 6, « Lot 25 ». Maquettes : `ListeTeneurs`, `ListePersonneCompte`, `ListeVueReliee`, `ListeLiveTeneur` (la ligne « Tu tiens cette liste avec Hugo »).

- [x] **Le cœur, en fonctions pures**, testé d'abord : qui tient une liste ; ce que voit et peut faire chacun (celui qui tient, la personne reliée, l'invité) ; inviter, accepter, retirer, le dernier qui ne peut pas partir.
- [x] **Base** : les comptes qui tiennent une liste (plusieurs par liste, celui qui l'a créée en fait partie comme les autres) ; les invitations en attente, par adresse ; l'adresse d'une personne de la famille et le compte qu'elle rejoint.
- [x] **« Ceux qui tiennent la liste »** (`ListeTeneurs`) : la liste, « Retirer », l'invitation par adresse avec son email, « Annuler » une invitation. Tous égaux. Ceux qui tiennent la liste voient tout, y compris ce qu'on leur offre.
- [x] **Chacun de ceux qui tiennent la liste coche dans le document**, à son prénom, dès le brouillon, comme le fait déjà celui qui l'a créée (README 22.19, « Créer et écrire »), ses propres idées comprises (Correction 20).
- [x] **Relier une personne** (`ListePersonneCompte`) : l'adresse sur sa fiche, « Ne plus relier ».
- [x] **La personne reliée** (`ListeVueReliee`) : la liste apparaît dans ses listes ; sa section en premier, « C'est toi » ; elle écrit, corrige et supprime ses propres idées ; elle voit le reste comme tout invité et coche comme lui, y compris ce qui lui est destiné (Correction 20).
- [x] Trois langues, `tests/e2e`.

### Correction 26 — Tous les messages après une action, en prune foncé, et leurs règles (README 23.2, 23.3)

**Fait** (19 novembre 2026) ; ce qui a été tranché seul est en section 6, « Correction 26 ». Demandé par Julien le 19 novembre 2026 au soir : il préfère le bandeau foncé au message blanc. **Une partie était faite** : la barre « … · Annuler » des listes est déjà foncée (`app/utils/undoBar.ts`, commit `21eeccd`). Reste à en faire le message de toute l'application, avec ses règles. Sans migration. Maquette : `StyleMessages` (page « Styles »), et en situation `ListeDecocheFait`, `ListePartageArrete`, `ListePersonneRetiree`, `ProcheSupprime`.

- [x] **Un seul réglage pour tous les messages passagers** : le thème du `UToast` de Nuxt UI dans `app.config.ts` (ou un composant `UiToast` si le thème ne suffit pas), et `undoBar` n'en est plus qu'un cas. Aucun écran n'habille plus un message à sa façon.
- [x] **Le fond** : prune foncé (`plum-900`, `#2b1b3d`), texte blanc, coins de 14 px, ombre portée, pas de contour. Le détail en `plum-200`. L'action, à droite, en rose clair. Contrastes vérifiés (AA).
- [x] **Trois sortes** (`StyleMessages`) : « c'est fait, et ça se rattrape » (le texte et « Annuler », 6 secondes) ; « c'est fait » (pastille verte, un titre, une ligne de détail au plus, 4 secondes) ; « ça n'a pas marché » (pastille corail, ce qu'il faut faire, une croix : reste jusqu'à ce qu'on le ferme).
- [x] **Où** : en bas de l'écran, au-dessus de la barre d'onglets et du bord du téléphone ; jamais par-dessus le clavier ni la ligne qu'on écrit ; sur ordinateur, en bas, centré, 420 px au plus.
- [x] **Un seul à la fois** : un nouveau remplace l'ancien, sans pile.
- [x] **Reprendre tous les messages existants** (`useToast` dans `useShareMessage`, `useProfileSaver`, `useRuleSaver`, `useDecideRequest`, et les autres) : même habillage, même place, textes au passé et sans point.
- [x] **Accessibilité** : `role="status"` (`alert` pour une erreur) ; le temps s'arrête tant qu'on touche ou survole ; « réduire les animations » respecté.
- [x] **Le guide de style** de l'application montre les trois sortes ; README 23.2 et 23.3 passent de « à coder » à « fait ».
- [x] `tests/e2e` (un message avec « Annuler » annule ; une erreur reste).

### Correction 30 — Les dernières retouches de la liste, avant de publier les listes en direct (README 22.19, 22.20, 23)

Demandé par Julien le 20 novembre 2026, en essayant la liste : « c'est vraiment les derniers petits trucs qui me manquaient » avant de publier une version des listes qui marche bien, avec le temps réel. Six retouches, toutes validées par Julien sur maquette. Sans migration. **Faite** (20 novembre 2026) ; ce qui a été tranché seul est en section 6, « Correction 30 ». **Ordre conseillé : 6 d'abord** (il change la mise en page de `PersonSection.vue`, dont les autres dépendent), puis 5, 1, 2, 3, 4. Maquettes (page Listes, au bout de la première rangée, « Avant de publier ») : `ListeDecocherCase`, `ListeReserverSimple`, `ListeReserverAnonyme`, `ListeJOffreAgir`, `ListeCocheGuide`, `ListeGroupeFil`, `ListeGroupeFilDeplie`.

**1. Décocher pour quelqu'un : la case** (`ListeDecocherCase`, puis `ListeDecocheFait` ; retenu par Julien). Aujourd'hui, toucher le prénom (ou « Anonyme ») sous une idée cochée déplie la ligne sur un fond teinté, avec « Coché en anonyme » et un bouton « Décocher » : lourd, et la phrase répète la pastille.

- [x] **Toucher la case grise décoche tout de suite**, avec le message « Coche de Mamie retirée · Annuler ». C'est le même geste que pour ce que j'offre (la case verte décoche tout de suite).
- [x] Les pastilles des prénoms redeviennent de simples informations : on ne les touche plus. Plus de fond teinté, plus de phrase, plus de bouton « Décocher » sous la ligne.
- [x] À plusieurs, la case retire toute la coche (tout le groupe) ; « Annuler » la remet telle quelle, avec les mêmes personnes.
- [x] Nom accessible de la case : « Décocher : coché par Mamie ». Réservé à ceux qui pouvaient déjà décocher pour quelqu'un (Correction 25).
- [x] Maquettes périmées, à supprimer du dépôt : `ListeDecocher`, `ListeDecocherChip`, `ListeDecocherPanneau`.

**2. Le panneau de ce que j'offre, simplifié** (`ListeReserverSimple`, `ListeReserverAnonyme` ; validé par Julien le 20 novembre 2026 : « je valide, c'est très bien »). Julien : « Dire à Camille que c'est moi » et, dessous, « Personne d'autre ne saura que c'est toi », c'est confus. Les deux réglages (seul ou à plusieurs, avec ou sans prénom) deviennent **une seule question, trois choix, et chaque choix dit qui le sait** :

- [x] « **Je l'offre seul** » : « Camille sait que c'est toi. Les autres voient seulement que c'est pris. »
- [x] « **Je l'offre seul, en anonyme** » (le masque) : « Personne ne sait que c'est toi, pas même Camille. »
- [x] « **On l'offre à plusieurs** » : « D'autres pourront se joindre à toi, et verront ton prénom. »
- [x] L'interrupteur « Dire à Camille que c'est moi » et l'encart « Personne d'autre ne saura que c'est toi. » disparaissent. « Terminé » et « Finalement, je ne l'offre plus » restent.
- [x] **En mode anonyme** : « en anonyme » est choisi, les deux autres choix sont grisés, et une seule ligne dessous le dit : « Mode anonyme activé. Pour un autre choix, désactive-le en haut de la liste. » C'est le chemin pour dire qui on est : quitter le mode, puis changer le choix de ce cadeau.
- [x] Le serveur refuse aussi « seul sous mon prénom » et « à plusieurs » tant que le mode anonyme est activé (pas seulement l'écran).
- [x] Hors du mode anonyme, le choix par défaut reste « Je l'offre seul » (sous mon prénom pour qui tient la liste), et un cadeau coché en anonyme peut passer aux deux autres choix.

**3. « Tu l'offres » montre qu'il se touche** (`ListeJOffreAgir`). Aujourd'hui, la pastille « Tu l'offres » ouvre le panneau, mais rien ne le dit.

- [x] La pastille de mon état prend un **filet menthe et une petite flèche** (« Tu l'offres › »), retenu par Julien (« l'option A me suffit » : pas de bouton « ⋯ », pas de message la première fois). C'est la règle des pastilles (Correction 29) : une pastille à filet se touche, une pastille pleine informe. Même chose pour « Tu participes » et « Tu l'offres en anonyme » (filet plus clair sur l'aubergine).

**4. Après avoir coché, la première fois : une note sur « Tu l'offres › »** (`ListeCocheGuide` ; retenu par Julien, le message à chaque coche est écarté).

- [x] **La première fois seulement** qu'on coche (une fois par appareil), une note pointée sur la pastille « Tu l'offres › » : « **C'est noté** », « Touche « Tu l'offres » pour proposer de l'offrir à plusieurs, ou passer en anonyme. » (texte de Julien), et « Compris ». Ensuite, plus rien : la pastille à filet suffit.
- [x] **Le voile couvre toute l'application** (Julien), en-tête et barres comprises, comme celui de la note du mode anonyme dans le code (`AnonymousBar.vue` : un voile fixe à la racine de l'app, qui laisse passer les touchers). Seules la ligne cochée et sa note restent dans la lumière. Voile prune foncé à 35 %, pas aubergine (l'aubergine reste au mode anonyme).
- [x] Un seul composant pour les deux notes (mode anonyme, première coche) : la note, sa pointe, le voile, « Compris ». Jamais deux notes à la fois : celle du mode anonyme passe d'abord.
- [x] En mode anonyme, la pastille s'appelle « Tu l'offres en anonyme », et les autres choix du panneau sont fermés (point 2) : le texte de la note devient « Touche « Tu l'offres en anonyme » pour changer d'avis. »
- [x] La maquette `ListeVisiteurTirage` est mise à jour : voile sur toute la page, comme le code. Maquette périmée, à supprimer du dépôt : `ListeCocheNotice`.

**5. « ses goûts » : un petit paragraphe qui présente la personne** (`ListeGroupeFil`, `ListeGroupeFilDeplie` ; retenu par Julien : « j'aime beaucoup la 5 bis » ; le cadre teinté est écarté, « trop de choses », et le panneau aussi : « pas besoin de l'overlay »). Dans la vue du visiteur, « ses goûts » est aujourd'hui un lien rouge souligné au bout de la ligne d'infos.

- [x] Le lien souligné disparaît de la ligne d'infos (« 6 ans · taille 6 ans, pointure 30 »). Une personne sans âge ni taille n'a plus de ligne d'infos.
- [x] Sous l'en-tête de la personne, au-dessus de ses premières idées, **un petit paragraphe dans le texte courant** (15 px, gris-prune, ce qu'elle aime en gras) : « En ce moment, **les dinosaures et les billes**. Il commence à lire tout seul. Il lui faudrait un cartable pour le CP. À éviter : les peluches, il en a trop. Côté cadeaux, il préfère un objet à garder, et il aime être surpris. »
- [x] **Trois lignes au plus**, coupées par « … ». Quand le texte dépasse, et seulement là, **un petit « Voir plus »** dessous (13 px, gras, gris-prune, une petite flèche vers le bas, pas de soulignement) **déroule le paragraphe sur place** ; il devient « Voir moins ». Pas de panneau, pas de page (Julien).
- [x] « Voir plus » est un bouton (`aria-expanded`), cible de 44 px par un padding invisible ; l'état déroulé ne se garde pas d'une visite à l'autre.
- [x] Le paragraphe est composé des rubriques déjà enregistrées, sans nouveau champ ni migration : « En ce moment, … » ; « Il lui faudrait … » ; « À éviter : … » ; « Côté cadeaux, il préfère … ». Une fonction pure, testée ; trois langues, avec des tournures qui tiennent quel que soit ce que la personne a écrit (ne pas accorder, ne pas reformuler : poser le texte tel quel après une amorce fixe).
- [x] Pas de goûts écrits : pas de paragraphe. Celui qui tient la liste voit le même paragraphe que les visiteurs (c'est ce que les autres lisent), en plus de son crayon et de son « ⋯ ».
- [x] Maquettes périmées, à supprimer du dépôt : `ListeGoutsPistes`, `ListeGoutsCarte`, `ListeGoutsPanneau`, `ListeGoutsParagraphe`.

**6. Grouper par personne : deux colonnes et un fil** (`ListeGroupeFil` ; retenu par Julien : « j'adore le fil, on part sur le fil »). Julien : « ça manque de quelque chose pour vraiment bien grouper par personne », « les trucs à cocher ne tombent pas bien en dessous ». Aujourd'hui, rien ne s'aligne : l'icône de la personne est à gauche, son prénom à 80 px, le paragraphe revient à 16 px, les cases sont à 22 px et le texte des idées à 56 px.

- [x] **Deux colonnes.** À gauche, l'icône de la personne (40 px au lieu de 52) et les cases, **centrées l'une sous l'autre**. À droite, tout le texte sur un seul bord (à 50 px du bord de la colonne) : le prénom (24 px), les infos, le paragraphe des goûts, le texte des idées, le lien, les pastilles.
- [x] **Le fil** : un trait fin (2 px, pêche `--color-line`, bouts arrondis) part du bas de l'icône, descend au centre de la colonne de gauche, **passe derrière chaque case** et s'arrête à la dernière ligne de la personne (« J'offre autre chose à Léo », « Une autre idée… »). Les cases ont un fond plein pour le couvrir (la case pointillée aussi).
- [x] Le fil est décoratif (`aria-hidden`) ; il n'apparaît pas pour une personne sans aucune ligne, ni dans une liste sans personne.
- [x] La même mise en page pour celui qui tient la liste : l'encart d'écriture, la ligne « Une autre idée… », le crayon sur l'icône, le « ⋯ ». Pendant qu'on glisse une idée ou une personne (lot 24 ter), le fil de la personne soulevée se replie avec elle.
- [x] Le texte des idées recule de 10 px (66 au lieu de 56) : vérifier à 320 px de large. L'espace de 44 px entre deux personnes reste.
- [x] Maquettes écartées, à supprimer du dépôt : `ListeGroupeColonne`, `ListeGroupeCarte`.

**Pour finir, et publier**

- [x] Trois langues pour chaque texte nouveau ou changé ; retirer les clés devenues inutiles (« Coché par… », « Coché en anonyme », le bouton « Décocher », « ses goûts »).
- [x] Tests : les fonctions pures du paragraphe des goûts ; e2e de la case grise (décocher, « Annuler », à plusieurs), de la pastille qui ouvre le panneau, de la note de première coche (une seule fois, le voile, « Compris »), de « Voir plus » ; axe sur une liste tenue et une liste visitée ; un passage à 320 px de large.
- [x] README 22.19, 22.20 et 23 (les deux colonnes et le fil, le paragraphe des goûts, la note et son voile) ; `ECARTS-MAQUETTES.md` ; noter en section 6 ce qui a été tranché seul.
- [ ] **Puis Julien publie** : les migrations `0028_list_holders`, `0029_holder_levels`, `0030_carried_from`, `0031_amusing_pete_wisdom` et `0032_anonymous_mode` sont à appliquer avant de déployer, dans cet ordre ; le premier déploiement crée l'objet durable des listes en direct (lot 26).

### Correction 29 — La ligne d'une idée : le lien sous le texte, tout en pastilles, plus de « Changer », plus d'air (README 22.19, 22.20, 23)

Demandé par Julien le 20 novembre 2026, à la suite de la Correction 28 (faite) et sur ce qu'elle a posé : la rangée de pastilles sous l'idée. Sans migration. Trois parties, qui touchent les mêmes composants (`app/components/lists/IdeaLine.vue`, `VisitorLine.vue`, `PersonSection.vue`) : à faire d'un seul tenant. Tout a été validé par Julien sur maquette (« on peut partir sur ça »). **Faite** (20 novembre 2026), sans migration ; ce qui a été tranché seul est en section 6, « Correction 29 ». Maquettes : `ListeTeneur`, `ListeVisiteur`, `ListeVisiteurMes`, `ListeVisiteurAnonyme`, `ListeVisiteurToucher`, `ListePlusieursLigne`, `ListeIdee`, `ListeIdeeLien`, `ListeIdeeLienFait`, `ListeDecocher`.

Ce que cette correction change à la 28 : les pastilles passent de 13 px gras à 12 px demi-gras, avec 6 px d'écart ; rien d'autre de la 28 n'est défait.

**Le lien d'une idée : une ligne sous le texte, plus « : lien »** (Julien, 20 novembre 2026, troisième version : la puce à filet puis la pastille lilas ont été refusées, il y avait trop de pastilles ; maquettes `ListeTeneur`, `ListeIdee`, `ListeIdeeLien`, `ListeIdeeLienFait`).

- [x] **En lecture** : le lien a sa ligne à lui, **toujours sous le texte de l'idée** (sous la dernière ligne quand l'idée en fait plusieurs), au-dessus des pastilles. Une petite icône de lien et **le nom du site** (« lutin-jouets.fr », sans « www. »), en italique, à la taille du texte, lilas foncé `#5f37a6`. Pas de pastille, pas de soulignement, coupé par « … » sur une ligne. Pas de lien, pas de ligne.
- [x] Le lien n'est jamais barré ni grisé quand l'idée est cochée ; il reste un lien (nouvel onglet, `rel="noopener noreferrer"`), cible de 44 px par un padding invisible. Nom accessible : « Lien vers lutin-jouets.fr ». Le visiteur le voit comme celui qui tient la liste.
- [x] Le nom du site vient de l'adresse enregistrée (`app/utils/ideaLink.ts`, une fonction pure de plus, testée : `hostname` sans `www.`). Aucune requête vers le site, aucune image, aucun aperçu.
- [x] **En écriture** : dans l'encart blanc de la ligne qu'on écrit, sous le texte et un filet fin, **le champ du lien est toujours là**. Vide : l'icône et « Ajouter un lien » en gris italique. On le touche : le curseur s'y met, l'exemple devient « Colle ou écris l'adresse », clavier des adresses, sans majuscule ni correction. Rempli : l'adresse entière, modifiable sur place, avec une croix « Retirer le lien » à droite.
- [x] Les boutons soulignés « Ajouter un lien », « Annuler », « Changer le lien », « Retirer le lien » sous la ligne disparaissent : le champ les remplace tous.
- [x] Coller une adresse dans le texte de l'idée la déplace toujours dans le champ du lien (README 22.20, inchangé). « Entrée » dans le champ du lien enregistre et revient au texte ; une adresse qui n'en est pas une (`asAddress` rend `null`) garde le champ ouvert, marqué en erreur, sans rien enregistrer.
- [x] Les deux champs de l'encart s'enregistrent ensemble quand on quitte la ligne ; quitter le champ du lien pour le texte de la même ligne ne ferme pas l'encart.

**Sous une idée, plus de texte volant : tout en pastilles** (Julien, 20 novembre 2026 ; maquettes `ListeVisiteur`, `ListeVisiteurMes`, `ListeVisiteurAnonyme`, `ListePlusieursLigne`). Dans la vue du visiteur, il restait des phrases et des liens soulignés sous les idées (« Tu l'offres · anonyme · Changer », « Mamie et Tonton … Se joindre », « Mamie, Tonton et toi … Tu participes »). Tout passe dans la rangée de pastilles, la même que pour ceux qui offrent. Quatre familles, à écrire dans le README 23 (design) ; le lien n'en fait pas partie, il a sa ligne sous le texte :

- [x] **Une information** (un prénom, « 7 personnes », « Au complet », « À plusieurs », « Pris à l'instant ») : fond pêche, texte gris-prune. Un prénom n'a pas d'icône ; les autres en ont une (groupe, personne, horloge).
- [x] **Mon état, une seule pastille** (Julien, 20 novembre 2026 : « Tu l'offres » et « Anonyme » côte à côte se lisaient comme deux états) : sous mon prénom, « Tu l'offres » avec un cadeau, en menthe ; en anonyme, « Tu l'offres en anonyme » avec un petit masque, en aubergine `#5b3a55` texte blanc, comme la barre du mode anonyme. « Tu participes » avec une coche, en menthe. Plus de pastille « Sous ton prénom » ni « Anonyme » seule dans la vue du visiteur.
- [x] **Plus de « Changer »** (Julien, 20 novembre 2026 : le mot n'est pas clair, et il cachait trois choses dont décocher). Toucher la ligne d'une idée que j'offre, ou sa case verte, ouvre le panneau `ListeReserver` (seul ou à plusieurs, dire que c'est moi, « Finalement, je ne l'offre plus »), comme toucher une idée libre ouvre le panneau pour la réserver. Maquettes, dans l'ordre : `ListeVisiteurToucher` (la ligne touchée), `ListeReserver` (le panneau), `ListeReserverPlusieurs`. La ligne entière est le bouton ; nom accessible : « Circuit de billes, tu l'offres en anonyme : modifier ou ne plus l'offrir ».
- [x] **Une action** (« Se joindre » avec un plus) : fond blanc, filet, texte foncé. C'est la seule famille qui a un filet : une pastille à filet se touche, une pastille pleine informe. Plus aucun lien souligné rouge sous une idée.
- [x] Ordre dans la rangée : les prénoms ou le groupe, mon état, puis l'action en dernier. La rangée passe à la ligne.
- [x] Les avatars empilés des cadeaux à plusieurs disparaissent de la ligne : les prénoms en pastilles les remplacent (au-delà de trois, « 7 personnes »). « et toi » n'est plus écrit : « Tu participes » le dit.
- [x] Les pastilles d'action gardent une cible de 44 px en hauteur (padding invisible), et un nom accessible complet (« Se joindre à Mamie et Tonton pour Vélo 16 pouces »). Les icônes sont décoratives (`aria-hidden`).
- [x] Les quatre couleurs passent le contraste AA en 13 px gras ; le sens ne tient jamais à la couleur seule (un texte dans chaque pastille).

**Les tailles et les marges de la ligne d'une idée** (Julien, 20 novembre 2026 : « pas harmonieux » entre le texte, le lien et les pastilles). Trois niveaux, du plus fort au plus léger, à écrire dans le README 23 :

- [x] **Le texte de l'idée** : 16 px, interligne 22 px (demi-gras quand c'est moi qui l'offre).
- [x] **Le lien** : la même taille que le texte (Julien, 20 novembre 2026), 16 px, interligne 22 px ; c'est l'italique, le lilas et l'icône de 14 px qui le distinguent, plus la taille. 1 px sous le texte.
- [x] **Plus d'air** (Julien, 20 novembre 2026) : 13 px au-dessus et au-dessous de chaque idée au lieu de 10 (26 px entre deux idées), et **44 px de plus entre deux personnes de la liste** (16 ne suffisait pas : l'espace entre deux personnes doit être nettement plus grand que l'espace entre deux idées, c'est lui qui découpe la liste). À régler à l'œil sur un téléphone : une liste de vingt idées s'allonge d'environ 120 px.
- [x] **Les pastilles** : 12 px, demi-gras (600, plus 700 : en gras elles pesaient plus lourd que le texte de l'idée), hautes de 22 px, 9 px de marge intérieure, icônes de 12 px ; 6 px au-dessus de la rangée et 6 px entre deux pastilles.
- [x] La pastille reste la même partout où elle sert sur une liste (ceux qui offrent, mon état, « Se joindre ») : un seul composant, pas de variante de taille.

**Pour finir**

- [x] Un seul composant de pastille pour les listes (`UiChip` ou le nom qui convient), avec ses quatre familles en propriété ; les pastilles de la Correction 28 l'utilisent.
- [x] Trois langues pour tous les textes nouveaux ou changés (« Tu l'offres en anonyme », « Ajouter un lien », « Colle ou écris l'adresse », « Retirer le lien », « Au complet », les noms accessibles) ; retirer les clés devenues inutiles (« Changer », « Changer le lien », « Annuler » du lien, « Sous ton prénom »).
- [x] Tests : la fonction du nom de site ; e2e de la ligne du lien (ajouter, modifier, retirer, adresse fausse, adresse collée), de la ligne touchée qui ouvre le panneau, de « Se joindre ».
- [ ] **axe sur une liste tenue et une liste visitée** : pas fait, l'installation de `@axe-core/playwright` a été refusée par les permissions de la session. Le contraste des cinq couleurs a été calculé à la main (section 6).
- [x] README 22.19, 22.20 et 23 (les familles de pastilles, les trois niveaux de texte, les espaces) ; noter en section 6 ce qui a été tranché seul.

### Correction 28 — Retouches de la liste : le retrait, ceux qui offrent, la ligne pour décocher, le partage vu par « Aide à écrire » (README 22.19, 22.20)

Demandé par Julien le 20 novembre 2026 : sur une liste, les idées sont trop décalées par rapport au prénom ; le retrait doit être beaucoup plus léger. Petite correction, sans migration, à glisser quand on veut. **Faite** (20 novembre 2026) ; ce qui a été tranché seul est en section 6, « Correction 28 ». Maquettes : toutes les pages de liste (`ListeTeneur`, `ListeVisiteur`, `ListeGlisser`, `ListeDecocher`…).

- [x] Le retrait de la liste d'idées passe de 20 px à **6 px** (`app/components/lists/PersonSection.vue`, `pl-5` devient `pl-1.5`). La case à cocher tombe presque sous la pastille de la personne ; c'est la pastille et le prénom en gras qui font le titre, plus le décalage.
- [x] Les lignes à fond plein qui débordent jusqu'aux bords (idée en cours d'écriture, ligne dépliée pour décocher, ligne teintée « Hugo écrit… ») reprennent le même chiffre : marge négative et padding de gauche à 16 + 6 = 22 px au lieu de 36.
- [x] La ligne « Ajouter une idée » et la ligne de dépôt du glisser s'alignent sur les idées.
- [x] Vérifier à 320 px de large : les 14 px gagnés vont au texte de l'idée.

**Ceux qui offrent, toujours sous l'idée** (Julien, 20 novembre 2026 ; maquettes `ListeTeneur`, `ListeDecocher`, `ListeGlisser`). Aujourd'hui la pastille des prénoms est à droite du titre, et un cadeau à plusieurs ajoute dessous « Offert à plusieurs ». Voir « Mamie, Tonton » le dit déjà.

- [x] Sous le titre de l'idée, une rangée de pastilles, **une par prénom** (« Mamie » « Tonton »), qui passe à la ligne si besoin. Même place et même forme pour un seul prénom, pour plusieurs et pour « Anonyme ».
- [x] La ligne « Offert à plusieurs » disparaît de la vue de ceux qui voient les prénoms. Elle reste là où les prénoms sont cachés (le visiteur, et le texte « au complet » du lot à plusieurs).
- [x] Pour décocher à la place de quelqu'un (Correction 25), on touche la pastille de la personne : à plusieurs, chacun a la sienne.
- [x] **La ligne dépliée pour décocher** (`ListeDecocher` ; Julien, 20 novembre 2026) : le fond teinté n'est plus un encart sous le titre, il **englobe toute la ligne, case à cocher comprise** : coins de 10 px (validé par Julien ; 16 était trop fort), 10 px de débord de chaque côté pour que la case et le texte ne bougent pas. Dedans : le titre, les pastilles (celle de la personne touchée en foncé), puis « Coché par Mamie, le 12 novembre » et « Décocher » sans fond propre. Remplace, pour cette ligne, le fond bord à bord de la Correction 25.
- [x] Les pastilles, et la ligne « Coché par… Décocher », restent **alignées au texte de l'idée**, pas à la case (tranché par Julien le 20 novembre 2026 après un essai ; la maquette `ListeEssaiSousCase` est périmée, à supprimer du dépôt avec `maquettes-sorbet/ListeEssaiSousCase.html`).
- [x] Lecteur d'écran : la rangée s'annonce « Offert par Mamie et Tonton » (le texte existe déjà, `lists.share.and`).

**Le partage par lien, vu par « Aide à écrire »** (Julien, 20 novembre 2026 ; maquettes `ListeAidePartage`, `ListeAideSansPartage`). Qui aide à écrire ne peut pas activer le partage, mais une fois activé, il peut envoyer le lien.

- [x] Partage activé : la barre montre le globe vert, « Partage par lien », dessous « Activé par Camille », et à droite un bouton **« Partager »** (le partage du téléphone, sinon copie du lien). Pas d'interrupteur, pas de « Changer de lien », pas de « Personnaliser le message ».
- [x] Partage pas activé : le cadenas, « Partage par lien », dessous « Pas encore activé par Camille ». Rien à toucher. Remplace le texte actuel `lists.share.managersOnly`.
- [x] Côté serveur, rien ne s'ouvre : activer, arrêter et changer de lien restent réservés à « Gère la liste ». Le lien est seulement renvoyé à « Aide à écrire » quand le partage est activé (vérifier que la route de lecture de la liste le donne, et seulement dans ce cas) ; test e2e des deux états.
- [x] La barre reste collée en haut, comme pour qui gère la liste.

### Correction 27 — La fiche d'un proche : chaque ligne ouvre une page (README 22.20, 23.3)

Demandé par Julien le 19 novembre 2026 au soir. Aujourd'hui, sur la fiche d'un proche (`app/pages/famille/[id]/index.vue`), le prénom, la taille, la pointure et l'adresse ouvrent chacun un panneau du bas avec un grand champ de texte (`UiTextSheet`), et la date de naissance un calendrier (`AdminDateSheet`). Sans migration (`shoe_size` est déjà un texte). Maquettes : `ListePersonne`, `ProcheNaissance`, `ProchePointure`, `ProcheTaille`, `ProcheAdresse`. Un premier dessin (les champs écrits sur place, dans la fiche) n'a pas été retenu : les maquettes `ListePersonneSaisie` et `ListePersonneEnregistre` sont supprimées. **Fait** (19 novembre 2026) ; ce qui a été tranché seul est en section 6, « Correction 27 ».

- [x] **La fiche garde ses lignes** (`ListePersonne`) : « Date de naissance », « Taille de vêtements », « Pointure », puis « Son compte » avec « Adresse email » ; chacune montre sa valeur (ou « Aucune ») et un chevron. Toucher une ligne ouvre **une page**, plus aucun panneau.
- [x] **Le modèle de ces pages** (README 23.3) : au-dessus du titre, « Mes proches · Léo » ; le titre (« Sa pointure ») ; le champ ; « Valider » dans la page, sous le champ, jamais collé au clavier ; « Retour » abandonne. Valider ramène à la fiche, où la nouvelle valeur s'affiche.
- [x] **Date de naissance** (`ProcheNaissance`) : trois listes, « Jour », « Mois », « Année », pas de calendrier. Le mois en toutes lettres ; les années de l'année en cours à il y a 110 ans, la plus récente d'abord ; les jours suivent le mois et l'année. « Effacer la date » sous « Valider ». Une date incomplète ne se valide pas.
- [x] **Pointure** (`ProchePointure`) : la page s'appelle « Sa ou ses pointures » (Julien, 19 novembre 2026), et on choisit dans une grille, sans rien écrire. Deux groupes, « Enfant » (16 à 34) et « Ado et adulte » (35 à 50), six par rangée, cases de 44 px. **Une ou plusieurs pointures** : toucher une case la coche, la retoucher la décoche. Enregistré en texte, dans l'ordre croissant : « 30 », « 30 ou 31 », « 30, 31 ou 32 ». « Tout effacer » sous « Valider ». Sur la fiche, la ligne garde le nom « Pointure ». Une pointure déjà saisie hors de la grille (« 30,5 ») reste affichée jusqu'à ce qu'on en choisisse une.
- [x] **Taille de vêtements** (`ProcheTaille`) : texte libre (Julien : on peut vouloir dire plusieurs choses), mais **un champ d'une ligne**, jamais un `textarea` ; 40 caractères, compteur.
- [x] **Adresse email** (`ProcheAdresse`) : un champ d'une ligne, clavier des adresses, sans majuscule ni correction automatique. Une fois reliée, la page montre l'état et « Ne plus relier » (`ListePersonneCompte`, à aligner).
- [x] **Le placeholder fait le travail des phrases d'aide** (Julien, 19 novembre 2026) : puisqu'elles sont parties, l'exemple en gris dans le champ vide est la seule indication. Taille : « 6 ans, M, 38, plutôt grand… » (il montre qu'on peut écrire un âge, une lettre, un chiffre ou une remarque). Adresse : « prenom@exemple.fr ». Il disparaît à la première lettre, n'est jamais enregistré, se traduit dans les trois langues (tailles et domaine adaptés), et garde un contraste lisible (gris `#78716c` au moins). Le champ reste nommé par `aria-label`, le placeholder ne remplace pas le nom.
- [x] **Le prénom** se change en le touchant, dans le titre, comme dans la liste (lot 24 bis) : pas de panneau non plus.
- [x] **Aucune phrase d'aide** (demandé par Julien le 19 novembre 2026 : il y en avait trop, puis « enlève-les »). Sur la fiche, plus aucune phrase sous les sections (« Ce qu'on demande toujours… », « Les mêmes questions que les pistes… » disparaissent). Sur les quatre pages, rien que le titre, le champ et « Valider » : ni consigne, ni « qui verra ». Le champ de la taille garde son exemple en gris et son compteur. C'est une exception voulue à la règle « qui verra ce que j'écris » (README 23.3) : voir section 6.
- [x] **« Supprimer de mes proches »**, tout en bas : la ligne rouge habituelle des actions qui ne se rattrapent pas (pastille rouge clair, corbeille, chevron), comme « Supprimer le groupe ». Pas un lien souligné.
- [x] **« Ses goûts » ne change pas** : les quatre préférences dans leur carte, et les trois textes qui ouvrent chacun leur page.
- [x] **Vérifier les autres écrans** qui ouvrent un `UiTextSheet` pour une valeur d'un mot, et les lister en section 6 sans les changer.
- [x] `UiTextSheet` et `AdminDateSheet` ne sont plus utilisés par cette page ; les supprimer s'ils ne servent plus ailleurs.
- [x] Trois langues, `tests/e2e` (choisir deux pointures affiche « 30 ou 31 » sur la fiche, en retoucher une la retire ; une date incomplète ne se valide pas ; « Retour » n'enregistre rien).

### Lot 25 bis — Tenir une liste à plusieurs : deux niveaux, des proches proposés, et la page d'invitation (README 22.20)

Demandé par Julien le 19 novembre 2026 au soir, en essayant le lot 25, et **validé par lui le même soir**, maquettes comprises. Avec migration (le niveau de chacun ; le jeton d'une invitation). Maquettes : `ListeTeneurs`, `ListeTeneursAdresse`, `ListeTeneursNiveau`, `ListeInvitationEmail`, `ListeInvitation`, `ListeInvitationCompte`. Points à relire : section 6, « Lot 25 bis ». **Codé le 19 novembre 2026** (migration `0029_holder_levels`) ; ce qui a été tranché seul est en section 6.

- [x] **Le cœur, en fonctions pures**, testé d'abord : ce que chaque niveau voit et peut faire ; qui peut changer le niveau de qui ; le dernier qui gère ne peut ni partir ni être rétrogradé.
- [x] **Deux niveaux** pour ceux qui tiennent une liste :
  - **« Gère la liste »** : tout, comme aujourd'hui. En plus de ce que fait « Aide à écrire » : partager ou arrêter le partage, changer de lien, inviter, changer un niveau, retirer quelqu'un de ceux qui tiennent la liste, supprimer la liste.
  - **« Aide à écrire »** : ajoute, corrige, réordonne les idées et les personnes de toute la liste, coche à son prénom, **voit qui offre quoi** et décoche pour quelqu'un (décidé par Julien le 19 novembre 2026 : rien à cacher à quelqu'un qui aide). Ne partage pas, n'invite pas, ne retire personne de ceux qui tiennent la liste, ne supprime pas la liste. La seule différence entre les deux niveaux est donc ce qu'on peut **gérer**, pas ce qu'on voit.
  - La personne reliée à son compte (lot 25) reste à part : sa section seulement.
- [x] **Ce qui existe** : tous ceux qui tiennent une liste aujourd'hui passent à « Gère la liste » ; celui qui crée une liste la gère.
- [x] **Changer un niveau** (`ListeTeneursNiveau`) : chaque ligne porte son niveau ; le toucher ouvre un petit menu, « Aide à écrire », « Gère la liste », chacun avec sa phrase, et « Retirer {Prénom} ». Réservé à ceux qui gèrent ; les autres voient les niveaux sans pouvoir les toucher. La phrase « Vous êtes à égalité » disparaît.
- [x] **Inviter, d'une pastille** (`ListeTeneurs`, `ListeTeneursAdresse` ; choisi par Julien le 19 novembre 2026, après avoir essayé une « ligne à écrire » qu'il n'a pas retenue). Sous la liste, « Inviter quelqu'un » : une seule rangée de pastilles, comme « Ajouter quelqu'un » : mes proches reliés à un compte (sauf ceux qui tiennent déjà la liste ou sont invités), puis une pastille en pointillés, « Quelqu'un d'autre ». Toucher un proche le choisit, sans adresse à saisir. Toucher « Quelqu'un d'autre » fait apparaître le champ d'adresse, qui n'est pas affiché avant. Dessous, le niveau (deux choix expliqués, « Aider à écrire » par défaut), puis le bouton : « Inviter {Prénom} », ou « Envoyer l'invitation » pour une adresse. Sans proche relié, la rangée n'a que « Quelqu'un d'autre ».
- [x] **La page d'invitation**, ouverte par le lien de l'email (`ListeInvitation`, `ListeInvitationCompte`) : qui invite, à quelle liste, ce que le niveau permet et ne permet pas. Sans compte : un prénom (champ vide, sans texte d'exemple ; dessous, « Vu par ceux avec qui tu tiens une liste ou fais un tirage », car c'est le prénom du compte, pas seulement celui que verra celui qui invite), l'adresse à laquelle le compte sera créé, la phrase sur les règles d'usage, « Accepter, et créer mon compte » : le compte est créé à l'adresse invitée, sans second email, puisque le lien prouve l'adresse. Avec un compte : la page s'adresse à la personne, par l'icône et le prénom de son compte (« Tonton, Camille t'invite »), sans parler de compte ni d'adresse (Julien, 19 novembre 2026) ; « Accepter l'invitation » connecte et ouvre la liste ; sous les boutons, « Tu n'es pas Tonton ? Ce lien est le sien : ne l'ouvre pas à sa place. » « Non merci » refuse l'invitation. En bas : « Signaler » et « Ne plus recevoir d'emails » (lots 39 et 35, quand ils existent).
- [x] **Les boutons nomment l'action** (Julien, 19 novembre 2026) : « Accepter l'invitation », ou « Accepter, et créer mon compte » sans compte ; et « Non merci ». Accepter ouvre ensuite la liste. Aucun bouton ne dit « Ouvrir la liste ».
- [x] **Le lien d'invitation vaut une connexion pour cette adresse** : à usage unique, valable 7 jours comme l'invitation, jeton de 256 bits gardé en empreinte. Déjà utilisé mais invitation acceptée : la page propose de se connecter normalement. Invitation expirée : voir plus haut.
- [x] **Une invitation expire au bout de 7 jours** (demandé par Julien le 19 novembre 2026), elle et son lien ensemble. En attente, sa ligne dit jusqu'à quand : « Invitée le 18 novembre · valable jusqu'au 25 » (`lists.ts`, clé `invited`, à la place de « pas encore venu »). Expirée, la ligne est grisée, « Invitation expirée · le 12 novembre », avec « Renvoyer » : une nouvelle invitation de 7 jours, un nouvel email, le même niveau. Une invitation expirée ne donne plus aucun accès, même connecté avec la bonne adresse ; sa page dit « Cette invitation n'est plus valable. Demande à Camille de te la renvoyer. » Les lignes expirées ou refusées s'effacent d'elles-mêmes après 30 jours (une tâche planifiée, ou à la lecture).
- [x] **Un refus se voit** (demandé par Julien le 19 novembre 2026) : « Non merci » sur la page d'invitation garde la ligne dans « Ceux qui tiennent la liste », grisée, avec « A refusé · le 19 novembre » et un bouton « Effacer » (`ListeTeneurs`). On peut réinviter la même personne, ce qui remplace le refus. Celui qui a invité en est prévenu par une nouveauté quand le lot 28 existe. Un refus ne dit jamais pourquoi.
- [x] **L'email d'invitation** (`ListeInvitationEmail`) : qui invite, à quelle liste, ce que le niveau permet, un seul lien « Voir l'invitation » qui mène à la page, jusqu'à quand elle vaut, qu'on peut la refuser. Puis **un mot sur l'application** (demandé par Julien le 19 novembre 2026) : « Under the Tree est une application gratuite et sans publicité, pour tenir des listes de cadeaux et faire des tirages au sort entre proches. » Le pied habituel (refuser les emails, signaler, les données). Aucune image. « Une invitation est acceptée en venant » (lot 25) reste vrai pour qui se connecte autrement, tant qu'elle n'a pas expiré.
- [x] **Le même mot sur la page d'invitation**, pour qui n'a pas de compte (`ListeInvitation`) : un encadré discret sous les boutons. Pas pour qui a déjà un compte.
- [x] **La note « Pour un enfant » de la fiche d'un proche** (`lists.ts`, clé `child` : « Pour un enfant, pas besoin de compte : laisse ce champ vide. ») ne se comprend pas (Julien, 19 novembre 2026) : la retirer. À la place, sous le champ d'adresse tant qu'il est vide : « Facultatif. Si {prénom} a un compte à cette adresse, il pourra écrire ses propres idées sur tes listes. » Rien quand la personne est déjà reliée.
- [x] **Une personne reliée à son compte** (question laissée ouverte par le lot 25) : **hors de ce lot.** Relier un proche n'envoie toujours aucun email. À reprendre avec Julien : lui envoyer la même invitation, avec « ta partie de la liste » pour niveau.
- [x] Trois langues, `tests/e2e` (un « Aide à écrire » est refusé sur le partage, les invitations, les niveaux et la suppression ; un lien d'invitation ne sert qu'une fois).

### Lot 26 — Listes V2 : en direct (README 22.20)

Décidé par Julien le 19 novembre 2026. Après le lot 25 (la présence en dépend). Maquette : `ListeLiveTeneur`. **Fait** (20 novembre 2026), sans migration de la base ; ce qui a été vérifié, tranché seul et laissé de côté est en section 6, « Lot 26 ».

- [x] **Borner ce qui coûte** (section 8.1) : au plus 30 connexions par liste (proposition), fermeture après 30 minutes sans activité, pas de message plus gros que quelques kilo-octets.
- [x] **L'objet durable** : un par liste, WebSocket avec hibernation, déclaré dans la configuration de déploiement. Vérifier d'abord dans la documentation Cloudflare que l'offre du compte le permet, et le noter en section 6.
- [x] **Le signal** : chaque route qui change une liste (une idée, une coche, un « J'offre autre chose » ajouté par le lien, une personne, l'ordre) prévient l'objet après l'écriture dans D1 ; l'objet envoie « la liste a changé » ; chaque navigateur recharge sa vue par les routes existantes. Aucune donnée de la liste ne passe par le canal.
- [x] **Les animations** : une ligne qui apparaît, change, se coche ou disparaît le montre par son mouvement, sans étiquette ni couleur. Respecter « réduire les animations ».
- [x] **La ligne bloquée** : qui écrit quelle ligne passe par l'objet ; les autres voient la ligne teintée à la couleur claire de son icône, dessous en petit son icône et « {Prénom} écrit… », son curseur à sa couleur dans le texte, sans étiquette collée dessus (choisi par Julien le 19 novembre 2026, maquette `ListeLiveTeneur`) ; la ligne ne se touche pas ; libérée à la validation, à la sortie de la ligne, ou après 30 secondes sans frappe.
- [x] **Cocher en même temps** : la première écriture gagne, l'autre voit la case passer en « pris », sans message.
- [x] **La présence**, entre ceux qui tiennent la liste seulement. Un visiteur par le lien, avec ou sans compte, n'est jamais montré comme présent ni comme « en train d'écrire » : ce qu'il fait arrive en direct, sans dire qui.
- [x] **Le nombre de visiteurs présents** (demandé par Julien le 19 novembre 2026) : ceux qui tiennent la liste voient, près de leur présence, « 2 visiteurs en ce moment », un simple nombre de ceux qui ont la liste ouverte par son lien, avec ou sans compte. Jamais de prénom, jamais d'icône, jamais « vient d'arriver » ni « vient de partir » : le nombre change sans animation. L'objet durable connaît déjà ses connexions : rien de plus à stocker. Les visiteurs, eux, ne voient pas ce nombre (proposition).
- [x] **Sans connexion** : la page se recharge quand elle redevient visible ; rien ne casse.
- [x] Tests : les fonctions pures du signal et du blocage ; un test `e2e` à deux navigateurs.

### Correction 25 — Celui qui tient la liste décoche pour quelqu'un (README 22.19)

Demandé par Julien le 19 novembre 2026 : Mamie a coché, puis dit de vive voix qu'elle ne le prend plus ; il faut pouvoir l'enlever pour elle. Aujourd'hui, celui qui tient une liste ne décoche que ses propres coches (`DELETE /api/lists/[id]/claims/[ideaId]` ne vise que son compte). Sans migration. Maquettes : `ListeDecocher`, `ListeDecocheFait`. **Fait** (19 novembre 2026), sauf la nouveauté du lot 28 ; ce qui a été tranché seul est en section 6, « Correction 25 ».

- [x] **Le cœur, en fonction pure**, testé d'abord : qui peut retirer quelle coche (ceux qui tiennent la liste : toutes ; un visiteur : la sienne seulement, comme aujourd'hui).
- [x] **La route** : ceux qui tiennent la liste peuvent retirer la coche d'un autre, en la désignant (pas seulement « la mienne »).
- [x] **Dans le document, sans bulle ni question** (dessin revu le 19 novembre 2026, maquettes `ListeDecocher`, `ListeDecocheFait`) : toucher le prénom posé sur une idée cochée (« Mamie », « Anonyme ») déplie, dans la ligne, un bandeau clair : « Coché par Mamie, le 12 novembre » et un bouton « Décocher ». Le prénom touché passe en foncé ; le retoucher replie. « Décocher » agit tout de suite : l'idée redevient libre, et « Coche de Mamie retirée » s'affiche avec « Annuler ». Ma propre coche garde « Tu l'offres · Changer ».
- [x] **Une coche anonyme se retire aussi**, sans rien révéler : le bandeau dit « Coché en anonyme », sans date ni indice ; puis « Coche anonyme retirée ». Celui qui tient la liste ne sait toujours pas qui c'était.
- [x] **Un cadeau à plusieurs** : le bandeau a une ligne par prénom, chacune avec son « Retirer » ; le dernier retiré rend l'idée libre.
- [x] **« Annuler »** remet la coche telle qu'elle était (même personne, même mode, même date). C'est lui le filet : pas de « tu es sûr ? ».
- [x] **Celui qu'on décoche le voit** : sa liste « Ce que tu offres » ne compte plus ce cadeau ; quand les nouveautés existent (lot 28), il en reçoit une, « Camille a retiré ta coche sur … », sauf s'il avait coché en anonyme (rien ne doit relier une coche anonyme à une personne).
- [x] Trois langues, `tests/e2e`.

### Lot 24 ter — Listes : réordonner en glissant (README 22.20)

Demandé par Julien le 19 novembre 2026. **Fait** (19 novembre 2026), sauf la ligne « En direct » (le lot 26 n'existe pas) et l'essai sur un vrai téléphone, qui revient à Julien. **Ça doit bien marcher sur téléphone** : c'est le critère du lot. Sans migration (`position` existe sur les idées et sur les personnes d'une liste). Maquette : `ListeGlisser` (la ligne soulevée, et le trait qui montre où elle va tomber). Points à relire : section 6, « Lot 24 ter ».

- [x] **Le cœur, en fonction pure**, testé d'abord : la nouvelle suite de positions après un déplacement, d'une idée dans sa personne, d'une idée vers une autre personne, d'une personne dans la liste.
- [x] **Sur téléphone, un appui long soulève** (environ 350 ms, avec une vibration courte là où le téléphone le permet) : une idée par sa ligne, une personne par son en-tête (icône et prénom). Un appui court garde son rôle : modifier le texte, cocher, ouvrir le menu. Tant que rien n'est soulevé, la page défile normalement ; dès que c'est soulevé, le doigt déplace la ligne et la page ne défile plus que près des bords, toute seule.
- [x] **Ce qu'on voit** (`ListeGlisser`) : la ligne soulevée devient une carte blanche, à contour rouge et à ombre, légèrement penchée, avec une poignée à droite ; un trait rouge épais montre où elle tombera ; les autres lignes s'écartent. Une personne soulevée se replie en une ligne (icône, prénom, nombre d'idées) pour pouvoir traverser une longue liste.
- [x] **Sur ordinateur** : une poignée apparaît à gauche de la ligne au survol ; on la tire à la souris. Au clavier, dans une ligne : `Alt` + flèche haut ou bas déplace l'idée.
- [x] **Une idée peut changer de personne** en la lâchant dans la section d'une autre. La ligne vide « Une autre idée… » reste toujours la dernière de sa section.
- [x] **Ce qui suit l'idée** : ses coches, son lien, ceux qui se sont joints. Rien n'est perdu ni prévenu.
- [x] **Qui peut** : ceux qui tiennent la liste, partagée ou non. Par le lien, rien ne se déplace.
- [x] **Lâcher hors de la liste, ou appuyer sur Échap**, remet tout en place. Après un déplacement, « Annuler » pendant quelques secondes.
- [x] **En direct** (lot 26, s'il existe) : l'ordre arrive chez les autres ; une ligne que quelqu'un écrit ne se déplace pas sous ses doigts, le déplacement attend qu'il ait fini.
- [x] **Accessibilité** : le déplacement est annoncé (« Livres sur les dinosaures, position 3 sur 5 ») ; les deux gestes ont leur équivalent sans glisser : « Monter » et « Descendre » dans le menu « ⋯ » d'une personne, `Alt` + flèches pour une idée.
- [x] **Essayé sur un vrai téléphone**, iPhone et Android : pas de sélection de texte ni de menu du navigateur pendant l'appui long, pas de défilement parasite, le clavier ne s'ouvre pas.
- [x] Trois langues, `tests/e2e` (souris et tactile simulé).

### Lot 27 — Listes V2 : reprendre une liste (README 22.20)

Décidé par Julien le 19 novembre 2026. Maquettes : `ListeNouvelleReprendre`, `ListeReprise`. **Fait** (19 novembre 2026), avec la migration `0030_carried_from` ; ce qui a été tranché seul est en section 6, « Lot 27 ».

- [x] **Le cœur, en fonction pure** : ce qu'on reprend d'une liste (icône, mot, personnes, idées non cochées) et ce qu'on laisse (cadeaux cochés, hors liste, nom, date).
- [x] **Base** : sur une idée, de quelle liste elle a été reprise ; effacé quand on modifie l'idée et pour toutes au premier partage.
- [x] **« Repartir d'une liste »** dans le document vide, et **« Reprendre cette liste »** sur une liste passée. La nouvelle liste est un brouillon ; l'ancienne ne change pas.
- [x] **La marque** : la petite flèche grise au bout de la ligne, visible de ceux qui tiennent la liste seulement, et la phrase d'explication en haut.
- [x] Trois langues, `tests/e2e`. README 22.20 marqué fait.

### Lot 27 bis — Une liste sans personne (README 22.20)

Décidé par Julien le 19 novembre 2026. Après le lot 24 bis. Maquettes : `ListeNouvelle` (la pastille), `ListeSansPersonne`, `ListeSansPersonneVisiteur`. Points à relire : section 6, « Lot 27 bis ». **Fait** (20 novembre 2026), avec la migration `0031_amusing_pete_wisdom` ; ce qui a été tranché seul est en section 6, « Lot 27 bis, en codant ».

- [x] **Base** : la forme d'une liste, « par personne » (aujourd'hui) ou « une seule liste ». Pour une seule liste, les idées se rattachent à une seule partie cachée, sans membre de la famille : les routes, les coches, les cadeaux à plusieurs et le direct ne changent pas. Si ce modèle ne tient pas, le dire en section 6 avant d'en choisir un autre.
- [x] **Pas d'écran de choix** : une pastille « Une liste sans personne » dans le bloc « Ajouter quelqu'un » du document vide, après « Quelqu'un d'autre ». En bas d'une liste sans personne, le bloc « Ajouter quelqu'un » habituel (pastille « Une personne », phrase « La liste sera alors rangée par personne. Les idées déjà écrites iront à la première. »), tant qu'elle n'est pas publiée ; pas de lien « Séparer par personne », pas de menu. Les idées déjà écrites vont à la première personne ajoutée ; l'inverse n'est possible qu'avec une seule personne sur la liste.
- [x] **Le document et la liste par son lien** sans en-tête de personne, sans goûts, sans menu « ⋯ » ; par le lien, et dans le document une fois la liste partagée, sans « Ajouter quelqu'un » ; « J'offre autre chose » une seule fois, en bas.
- [ ] **Suivre** (lot 29 bis) : une seule cloche, pour toute la liste. À faire avec le lot 29 bis, qui n'existe pas encore.
- [x] **Reprendre** (lot 27) : la forme est reprise.
- [x] Trois langues, `tests/e2e` (`lists-single.spec.ts`).

### Lot 27 ter — Relier ses pistes d'un tirage à sa liste de cadeaux (README 22.20)

Décidé par Julien le 19 novembre 2026. Après les lots 24 bis et 27 bis. Avec migration. Maquettes : `PistesListe`, `PistesListeChoisir`, `PistesResultatListe`, `ListeVisiteurTirage`, `ListeVisiteur`, `ListeVisiteurMes`, `ListeVisiteurPrenom`, `ListeVisiteurAnonyme`. **Fait** (20 novembre 2026), avec la migration `0032_anonymous_mode` ; ce qui a été tranché seul et les limites sont en section 6, « Lot 27 ter, en codant ».

- [x] **Base** : sur les pistes d'une participation, la liste reliée (facultatif). Ne peut viser qu'une liste que le compte de la personne tient, ou une liste où elle figure reliée à son compte (lot 25 ; sans lui, seulement les listes qu'elle tient).
- [x] **« Ma liste de cadeaux »** dans les pistes (mode complet seulement) : le choix dans un panneau, les listes que je tiens par leur nom ; une liste non publiée est grisée ; « Aucune liste ». Il faut un compte : sans compte, le bloc dit de se connecter.
- [x] **Sous le résultat** du Père Noël, avec « Pour t'aider à choisir » : le lien vers la liste, avec son icône et son nom, et « Ce que tu y coches reste anonyme, même pour {prénom} ». Rien du contenu de la liste n'est recopié. Pas de lien si la liste n'est plus publiée.
- [x] **La barre du mode anonyme**, en haut de toute liste ouverte par son lien, sur une ligne, collée en haut au défilement (`position: sticky`) (README 22.20, « Le mode anonyme, bien visible ») : sous mon prénom (claire, un œil) ou anonyme (aubergine foncée `#5b3a55`, texte blanc, un masque), avec un interrupteur et « ? » qui déplie l'explication. Aucun prénom dans la barre. Possible sur toute liste, pas seulement depuis un tirage. L'explication dépliée prend toute la largeur de la barre.
- [x] **Sans session, pas de barre.** La connexion de la liste (`ListeConnexion`) rend le prénom facultatif : sans prénom, la première coche et le réglage de la liste sont anonymes.
- [x] **Les maquettes des écrans d'une personne connectée** ont le menu (burger) en haut à droite à la place de « FR » (Correction 19) : rien à changer dans le code, qui le fait déjà. Un réglage par compte et par liste, retenu. Le choix « Dire à Camille que c'est moi » du panneau « Changer » devient ce réglage.
- [x] **`?anonyme` dans l'adresse** ouvre la liste en mode anonyme ; le lien posé sous le résultat d'un tirage le porte.
- [x] **Activé par défaut, avec un avertissement, jamais imposé** (README 22.20) : si je suis, dans un tirage pas encore fêté, celui qui offre à quelqu'un qui tient la liste ou qui y est relié, la liste s'ouvre en mode anonyme et une note accrochée sous la barre collée en haut, qui survole la liste avec un halo prune (pas dans la barre, pas une fenêtre qui bloque), m'avertit sans nommer personne ; « Compris » la retire pour de bon sur cette liste. L'interrupteur reste libre. La détection est faite par le serveur (déchiffrement interne du résultat) ; le lien posé dans un tirage porte la participation, signée.
- [x] **« Si tu sèches »** ne s'affiche plus sous le résultat quand une liste est reliée.
- [x] **Aucun « Père Noël » dans les textes d'une liste** : une liste n'est pas que pour Noël. Relire aussi les textes existants des listes dans les trois langues.
- [x] **Les autres règles du secret** : aucune nouveauté (lot 28), aucun email, aucune ligne de journal ne dit qu'un Père Noël a coché ; « Mes listes » de celui qui offre la montre comme toute liste ouverte.
- [x] Trois langues, `tests/e2e` (le prénom du Père Noël n'apparaît dans aucune réponse lue par celui qui tient la liste).

### Lot 28 — Les nouveautés, dans l'application (README 22.22)

Décidé par Julien le 19 novembre 2026. Avec migration. Maquettes : `NotifAccueil`, `NotifListe`, `NotifMenu`, `NotifCentre`. Aucun email ne change dans ce lot.

- [ ] **L'inventaire d'abord** : la liste de tout ce que l'application envoie ou signale aujourd'hui (`server/utils/notifications.ts`, `server/plugins/reminders.ts`, `server/http/email.ts`, le journal, « À faire maintenant »), classé « ce qui presse » ou « le reste » d'après le README 22.22. Le noter en section 6 pour relecture avant de coder.
- [ ] **Le cœur, en fonctions pures**, testé d'abord : créer une nouveauté pour un compte ; regrouper celles de même nature au même endroit dans la journée ; ce qui la rend vue ; les compteurs par onglet, par carte, par ligne ; l'oubli à trente jours.
- [ ] **Base** : les nouveautés (compte, nature, niveau, l'endroit visé, quand, vue ou non). Aucune ne contient ce que son destinataire n'a pas le droit de voir.
- [ ] **Créer les nouveautés** aux endroits de l'inventaire, pour les seuls comptes. **« De nouvelles idées sur une liste »** ne donne ici que des pastilles dans l'application : être prévenu hors de l'application est le lot 29 bis (suivre).
- [ ] **Les pastilles** : le point sur un onglet de la barre du bas, le compteur ou le point sur une carte, le point dans la marge d'une ligne de liste changée depuis ma dernière visite. Lisibles par un lecteur d'écran.
- [ ] **« Quoi de neuf »** : la ligne du menu et son compteur, le point sur le bouton du menu, la page par jour. L'ouvrir ne marque rien comme vu.
- [ ] Mise à jour au retour sur la page ; en direct quand le lot 26 est là.
- [ ] Trois langues, guide de style, `tests/e2e`.

### Lot 29 — « Me prévenir » : le résumé par email, et ce qui presse (README 22.22)

Décidé par Julien le 19 novembre 2026. Après le lot 28. Maquettes : `NotifReglage`, `NotifEmailResume`.

- [ ] **Le cœur, en fonctions pures** : pour une nouveauté et un compte, faut-il un email, lequel, quand (résumé, tout de suite, aucun ; ce qui presse ; déjà vue ; l'attente de dix minutes quand un téléphone est prévenu).
- [ ] **Le réglage** « Par email » dans « Mon compte », trois choix, « Un résumé le matin » par défaut pour tous les comptes existants.
- [ ] **Les emails automatiques des comptes passent par cette règle** : ils ne partent plus un par un. Les participants sans compte gardent les emails d'aujourd'hui. Aucun email pour de nouvelles idées sur une liste tant que le lot 29 bis n'est pas fait.
- [ ] **Le résumé** : la tâche planifiée du matin, un email par compte qui a du nouveau pas encore vu, un bloc par tirage ou par liste, en texte seul, dans la langue du compte, avec le lien pour changer le réglage.
- [ ] **Les emails que l'organisateur envoie à la main** (liens, rappels) ne changent pas.
- [ ] Trois langues, textes au ton de `docs/refonte/TEXTES.md`, tests.

### Lot 29 bis — Suivre une liste, ou une personne (README 22.22)

Décidé par Julien le 19 novembre 2026. Après les lots 28 et 29. Avec migration. Maquette : `ListeSuivre`. Points à relire : section 6, « Lot 29 bis ».

- [ ] **Le cœur, en fonctions pures**, testé d'abord : qui suit quoi (une liste entière, ou des personnes d'une liste) ; pour une idée ajoutée ou une personne ajoutée, quels comptes prévenir ; jamais ceux qui tiennent la liste, jamais une liste passée.
- [ ] **Base** : ce qu'un compte suit (la liste, et la personne de la liste ou rien pour toute la liste).
- [ ] **La cloche** au bout du nom de chaque personne, sur la liste par son lien (`/l/[jeton]`) : `aria-pressed`, « Suivre Léo » ou « Ne plus suivre Léo », zone de 44 px. La ligne d'état sous le mot de la liste, avec « Suivre toute la liste » ou « Ne plus suivre ».
- [ ] **Sans compte** : la cloche mène à la connexion de la liste (`/l/[jeton]/connexion`), puis le suivi est posé au retour.
- [ ] **Les nouveautés** (lot 28) : « de nouvelles idées » n'est créée en nouveauté à prévenir que pour ceux qui suivent ; les pastilles de l'application restent pour toute liste ouverte. Regroupement par personne et par jour.
- [ ] **« Me prévenir »** : la liste de ce que je suis, avec « Ne plus suivre ». Le lien d'arrêt dans le résumé et dans l'email immédiat.
- [ ] Trois langues, `tests/e2e`.

### Lot 30 — La connexion par code (README 22.22)

Décidé par Julien le 19 novembre 2026. Indépendant. Maquettes : `ConnexionCode`, `ConnexionCodeEmail`.

- [ ] **Le cœur, en fonctions pures** : créer et vérifier un code (six chiffres, 15 minutes, une fois, cinq essais, lié à l'appareil qui l'a demandé), jamais gardé en clair.
- [ ] **Base** : les codes, à côté des liens de connexion ; mêmes limites d'envoi.
- [ ] **Savoir si l'application tourne installée**, et seulement alors : l'écran du code après l'adresse, l'email du code sans lien. Dans un navigateur, rien ne change.
- [ ] Trois langues, tests, `tests/e2e`.

### Lot 31 — L'application installée et les notifications du téléphone (README 22.22)

Décidé par Julien le 19 novembre 2026. Après les lots 28 et 30. Maquettes : `Installer`, `NotifAutoriser`, `NotifReglage`. À vérifier sur de vrais téléphones, iPhone et Android.

- [ ] **Installable** : le manifeste, les icônes, les couleurs ; un service worker réduit à ce qu'il faut pour les notifications. Pas de mode hors connexion dans ce lot.
- [ ] **Proposer l'installation** : le panneau des trois gestes sur iPhone, le bouton « Installer » sur Android ; dans « Me prévenir » et une fois sur l'accueil ; jamais dans l'application installée.
- [ ] **S'abonner** : le panneau `NotifAutoriser` puis la question du téléphone, après un geste ; un abonnement par appareil, retiré quand il ne répond plus ; l'interrupteur « Notifications » de « Me prévenir ».
- [ ] **Envoyer** : une notification du téléphone par nouveauté, depuis le Worker, sans service tiers ; la toucher ouvre l'écran concerné ; rien dans son texte que le verrouillage du téléphone ne devrait pas montrer (jamais à qui j'offre).
- [ ] **La pastille sur l'icône** : le nombre de nouveautés pas encore vues.
- [ ] L'attente de dix minutes du lot 29 s'applique dès qu'un appareil est abonné.
- [ ] Trois langues, tests. README 22.22 marqué fait.

### Lot 32 — La page de présentation (README 22.23)

Décidé par Julien le 19 novembre 2026. **À faire en dernier**, après tous les autres lots. Sans migration, sans route d'API. Maquettes : `Landing` (téléphone), `LandingDesktop` (écran large). Points à relire : section 6, « Lot 32 ».

- [ ] **`/` sans session** devient la page de présentation ; avec une session, rien ne change. Les écrans de connexion gardent leurs adresses, « Créer un compte » et « Se connecter » y mènent.
- [ ] **Les blocs** du tableau du README 22.23, dans l'ordre de la maquette, avec le sapin (`UiIllusTree`) en tête de page sur téléphone et, par bloc, une capture d'écran sur un écran large ou une petite icône sur téléphone.
- [ ] **Une icône par bloc, partout** : une tuile en autocollant, à gauche du titre sur téléphone (44 px), au-dessus du texte sur un écran large (52 px) : ✉️ sur corail pour le tirage, 🏷️ sur ciel pour les pistes, 🕵️ sur lilas pour le jeu, 🎁 sur menthe pour les listes.
- [ ] **Sur téléphone, pas de capture** : l'icône seule. Les images des captures n'y sont pas chargées.
- [ ] **L'encadré « Tu as reçu un lien personnel ? »** reste, juste sous les boutons.
- [ ] **Le bloc « Tes données »** : « En clair, et le moins possible », quatre points et le lien vers « Tes données, en clair » ; une tuile 🔒 sur pêche. Il ne s'affiche que quand le lot 36 est fait : la page ne promet que ce qui existe.
- [ ] **Le bloc « Bientôt »** : encadré lilas, étiquette « Bientôt », les deux bulles. Aucun lien, aucune marque d'assistant.
- [ ] **Ne montrer que ce qui existe** : un bloc dont le lot n'est pas fait ne s'affiche pas.
- [ ] **Sur un écran large** (`LandingDesktop`) : l'en-tête avec « Se connecter » et « Créer un compte » à droite, le titre à gauche de deux captures, les quatre blocs en lignes qui alternent texte et capture, « Et aussi » sur trois colonnes. Une seule page qui s'adapte, pas deux pages.
- [ ] **Les captures d'écran, sur un écran large seulement** : de vraies captures de l'application, faites par un script à partir des données de démonstration (`scripts/seed-demo.ts`), à 390 px, dans les trois langues, en images légères chargées à la demande. Jamais de données réelles. Écrans : l'enveloppe à ouvrir, les pistes, deux écrans du palmarès de couleurs différentes, une liste par son lien. En haut de page, une capture claire (l'enveloppe) à côté d'une foncée (le palmarès). Dans les maquettes, ce sont les maquettes elles-mêmes, réduites (`@@SHOT` dans `habiller.py`).
- [ ] **Les captures inclinées** : sur un écran large, en perspective et tournées vers leur texte, en alternance (`rotateY` de 16 degrés d'un côté ou de l'autre, valeurs dans `docs/refonte/sorbet/capture.py`, `TILT`).
- [ ] **Un téléphone dessiné, pas un simple cadre** (`capture.py` fait foi) : tranche en métal, boutons, bord noir, barre d'état, encoche, trait du bas, reflet, ombres en couches ; derrière lui, un halo de la couleur du bloc. Un seul composant, en CSS, qui reçoit l'image. L'image elle-même reste droite : c'est le cadre qui s'incline, en CSS.
- [ ] **La fin de page dit que c'est gratuit** (décidé par Julien le 19 novembre 2026). La phrase sur la création d'un groupe dépend du lot 34 : s'il est fait, « Un compte suffit, pour une liste comme pour un tirage » ; sinon, celle de la maquette.
- [ ] **En bas**, « Qui a fait ça, et pourquoi ? » vers la page du lot 33, si elle existe.
- [ ] **Pour les moteurs de recherche et le partage du lien** : un titre, une description et une image d'aperçu par langue, rendus côté serveur.
- [ ] Trois langues, `tests/e2e` (sans session : la page ; connecté : l'accueil), README 11 et 22.23 à jour.

### Lot 33 — « Qui a fait ça, et pourquoi ? », et le café (README 22.24)

Décidé par Julien le 19 novembre 2026. Peut se faire avec le lot 32 ou avant lui. Sans migration. Maquette : `APropos`. Points à relire : section 6, « Lot 33 ».

- [ ] **Attendre les textes de Julien** : ceux de la maquette sont un brouillon. Ne rien traduire avant.
- [ ] **La page `/a-propos`**, publique : l'icône et « Salut, moi c'est Julien », « Pourquoi j'ai fait ça », « Un café ? ».
- [ ] **« Mon métier »** : il conçoit et développe des applications web, celle-ci est sa vitrine ; deux liens, LinkedIn et GitHub, dont les adresses sont dans la configuration (sans adresse, le lien ne s'affiche pas). Du texte, pas de logo de marque.
- [ ] **Le code reste privé** : le lien GitHub mène au profil, jamais au dépôt. Vérifier avant la mise en ligne : le dépôt est privé chez GitHub ; aucune adresse du dépôt dans les pages, les emails ni les fichiers servis ; pas de fichiers `.map` du code servis au navigateur.
- [ ] **Le bouton du café** : un lien vers le service de dons, dans un nouvel onglet (`rel="noopener"`). Son adresse est dans la configuration ; sans adresse, le bloc « Un café ? » ne s'affiche pas. Aucun script ni traceur du service.
- [ ] **« Écris-moi »** : l'adresse de contact de la configuration ; sans adresse, la ligne ne s'affiche pas.
- [ ] **Les liens vers la page** : en bas de la page de présentation (lot 32) et dans le menu.
- [ ] Trois langues, `tests/e2e`, README 11 et 22.24 à jour.

### Lot 34 — Ouvrir les groupes et l'envoi d'emails, avec 100 € par an (section 7.6)

Proposé le 19 novembre 2026. **Le principe est acquis** : Julien veut lever les deux limites, accepte une soixantaine d'euros par an, et garde l'application gratuite. **Restent à chiffrer avec lui avant de coder** : les groupes par compte et les plafonds (section 6). **Après le lot 35** (les garde-fous) ; le lot 37 lui donne ses compteurs. Les étapes marquées « Julien » sont des abonnements et des réglages de compte, à faire par lui.

Maquettes : `LimiteGroupes`, `LimiteParticipants`, `DemandePlus`, `AdminDemandes`, `AdminDemandeParticipants`, `Admin`.

- [ ] **Julien** : passer le compte Cloudflare en Workers Paid ; vérifier que le domaine est géré chez Cloudflare ; activer l'envoi d'emails de Cloudflare (en bêta) et laisser poser ses enregistrements DNS.
- [ ] **L'envoi par deux fournisseurs** (`server/http/email.ts`) : Cloudflare d'abord, Resend en secours si l'envoi échoue ou si le quota du jour de Cloudflare est atteint. Les emails ne changent pas.
- [ ] **Les groupes sans demande** (précisé par Julien le 19 novembre 2026) : tout compte peut créer **3 groupes** sans rien demander (le quota par défaut passe de 0 à 3 ; chiffre proposé, Julien hésite entre 2 et 3). La demande existante reste, pour en avoir davantage. `APP_GROUPS_COMFORT` et ses alertes sont revus.
- [ ] **Les participants par édition, plafonnés de la même façon** (demandé par Julien le 19 novembre 2026 : 100 est énorme) : **30 par défaut** (proposition), au lieu de 100 pour tous. Le plafond est porté par le groupe et réglable par le super-admin ; 100 reste le maximum absolu (`MAX_PARTICIPANTS`). Un groupe qui existait avant ce lot garde 100.
- [ ] **Une seule demande pour les deux** : la demande actuelle (« créer un groupe ») gagne un second motif, « plus de participants dans {groupe} », avec le nombre voulu et un mot. Même file chez le super-admin, même pastille (lot 37), mêmes emails de réponse. Accepter fixe le nouveau plafond du groupe.
- [ ] **Dire la limite avant qu'on la touche** : à l'ajout du 31e participant, l'écran dit « Ce groupe peut tirer jusqu'à 30 participants » avec « Demander plus » ; l'erreur `too_many_participants` cite le plafond du groupe, plus « 100 ». Rien n'est perdu : les participants déjà saisis restent.
- [ ] **Des garde-fous, parce qu'un envoi ouvert à tous attire les abus** : un plafond d'emails par groupe et par jour et un plafond par compte (le nombre de participants est traité plus haut). Au-delà, l'organisateur partage par son téléphone, ce qui ne coûte rien.
- [ ] **Un plafond de dépense par mois**, réglable par le super-admin : quand les emails du mois l'atteignent, les envois automatiques passent au résumé du matin et le super-admin est prévenu.
- [ ] **Les compteurs** : ce sont ceux du lot 37 (tableau de bord). S'il n'est pas fait, ce lot les ajoute a minima sur la page du super-admin.
- [ ] README 7.2, 8, 13.3, 15 et 16 à jour ; `tests` des plafonds.

### Lot 38 A — Durcir : le filet (section 8)

Demandé par Julien le 19 novembre 2026. **À faire tôt : juste après le lot 24 bis**, car les listes sont déjà partagées par lien. Sans dépendance avec les autres lots. Les petites choses sont parties dans la Correction 23 ; ce qui touche à l'argent est dans le lot 38 B. **Fait le 19 novembre 2026**, sauf deux lignes laissées ouvertes exprès (la politique de contenu à appliquer pour de bon, le changement de clé) ; ce qui a été trouvé et tranché est en section 6, « Lot 38 A ».

- [x] **D'abord vérifier** : relire la section 8 contre le code et cocher ce qui existe déjà. Elle n'est pas un audit. Ce qui s'avère faux ou déjà fait se dit en section 6.
- [x] **Le cloisonnement des listes, par un test** comme celui des tirages (`tests/e2e/security.spec.ts`) : un compte B essaie toutes les routes `/api/lists/*` et `/api/family/*` du compte A ; un jeton de liste essaie les idées d'une autre liste ; aucun prénom de qui a coché dans une réponse lue par un visiteur. Corriger ce que le test trouve.
- [x] **Limiter le débit des routes publiques** par adresse (`CF-Connecting-IP`), avec la liaison `ratelimits` de Workers : demande de lien de connexion, `/api/l/*` en écriture, `/api/invite/*`, demande de groupe. Réponse 429, message dans les trois langues (maquette `TropDeDemandes`).
- [x] **Le lien de connexion**, première cible : au plus 3 par adresse email et par heure, un plafond par adresse IP, un plafond global par jour ; au-delà, la réponse reste la même, aucun email ne part. Lien à usage unique, court.
- [x] **Un plafond pour tout ce qui s'écrit en base** : listes par compte, personnes par liste, idées par liste, cadeaux hors liste par visiteur, membres de la famille, lignes de journal par groupe et par jour, sessions par compte. Des chiffres larges, une erreur claire.
- [ ] **Une politique de contenu stricte (CSP)** : `default-src 'self'`, des scripts limités à l'application (nonce ou empreintes), pas de `unsafe-eval`, `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`. D'abord en mode rapport pendant une semaine, puis pour de bon. **Fait en mode rapport** (19 novembre 2026) ; reste à l'appliquer pour de bon, par `NUXT_CSP_MODE=enforce`, après une semaine sans alerte : c'est pourquoi la ligne n'est pas cochée.
- [x] **Les emails comme porte d'entrée du hameçonnage** : tout texte saisi est échappé (fait pour les messages), jamais rendu cliquable ; un prénom, un nom de groupe ou de liste qui contient une adresse web est refusé. Vérifier SPF, DKIM et DMARC du domaine.
- [x] **Les tâches planifiées** : chaque passage traite un nombre borné de lignes et peut être rejoué sans rien envoyer deux fois.
- [ ] **La clé des résultats et les sauvegardes** : une procédure écrite (README 16) pour exporter la base, garder `NUXT_DATA_KEY` hors de Cloudflare, et la changer. Clé perdue : résultats perdus. **La procédure est écrite** (exporter, garder la clé hors de Cloudflare) ; **changer la clé n'est pas possible** sans un script de rechiffrement, qui n'est pas écrit : c'est pourquoi la ligne n'est pas cochée.
- [x] README 8.6 complété.

### Lot 38 B — Durcir : la dépense (section 8.1)

**Juste avant le lot 34**, après le lot 37 dont il utilise le tableau de bord. C'est ce qui rend Workers Paid sans danger. Maquettes : `Admin` (« En cas d'urgence », « À surveiller »), `EnvoiSuspendu`.

- [ ] **Julien, le jour de l'abonnement** : une limite de dépense sur Workers et sur les objets durables (Cloudflare, « Spend Management » : au seuil, les requêtes sont refusées jusqu'au cycle suivant), et une alerte de budget pour tout le compte. Montant proposé : 5 $ par mois au-dessus de l'abonnement.
- [ ] **Deux interrupteurs d'urgence** pour le super-admin : « Suspendre les emails » et « Suspendre les inscriptions et les nouveaux groupes ». Le premier se déclenche tout seul quand le plafond du mois est atteint (lot 34).
- [ ] **Savoir qu'on est attaqué** : le tableau de bord compte les refus pour débit, les échecs de connexion, les erreurs 5xx et les signalements du jour ; ils entrent dans la pastille de l'onglet.
- [ ] **La règle de débit du pare-feu** (une seule sur l'offre gratuite) : sur la demande de lien de connexion, devant le Worker, pour que les requêtes refusées ne soient pas comptées.
- [ ] **Les connexions en direct** (si le lot 26 est fait) : vérifier la mise en sommeil, le nombre maximal de connexions par liste, la fermeture après inactivité.
- [ ] `tests` des interrupteurs et des plafonds.

### Lot 35 — Ne plus recevoir d'emails, et les garde-fous contre les abus (README 22.25)

Décidé par Julien le 19 novembre 2026. **Avant le lot 34** : on n'ouvre pas les groupes à tous sans lui. Avec migration. Maquettes : `StopEmail`, `StopDemande`, `StopConfirme`, `StopSaisie`, `StopEnvoi`. Points à relire : section 6, « Lots 35 et 36 ».

- [ ] **Le cœur, en fonctions pures**, testé d'abord : une adresse est-elle bloquée ; quels emails partent quand même (la connexion demandée par la personne) ; ce qu'un envoi groupé fait d'une adresse bloquée.
- [ ] **Base** : les adresses bloquées, par empreinte (le poivre du serveur), avec la date et la cause (la personne, un rejet, une plainte) ; les signalements (quel email, quel groupe, quel compte).
- [ ] **Le lien en bas de chaque email**, signé, sans connexion (`StopEmail`). Il ouvre une page qui pose la question (`StopDemande`) : seul le bouton bloque, jamais l'ouverture du lien, que des messageries suivent toutes seules. Puis « C'est noté » et « Annuler » (`StopConfirme`). L'en-tête de désabonnement en un clic, lui, bloque directement.
- [ ] **Tous les envois passent par le contrôle** (`server/http/email.ts`) : aucun email vers une adresse bloquée, sauf la connexion.
- [ ] **L'avertissement à la saisie** d'une adresse bloquée, partout où une adresse se saisit (`StopSaisie`), et dans « Envoyer par email » (`StopEnvoi`). Il dit clairement que la personne l'a demandé ; une adresse bloquée parce qu'elle n'existe pas a sa propre phrase.
- [ ] **« Signaler cet envoi »** et la vue du super-admin ; couper l'envoi d'emails d'un groupe.
- [ ] **Les retours du fournisseur** (rejets, plaintes) bloquent l'adresse.
- [ ] **Le premier email à une adresse** : qui l'a ajoutée, pourquoi, ce qu'on sait d'elle, comment refuser.
- [ ] **Lever son blocage** dans « Me prévenir ».
- [ ] **Un seul refus, pas deux réglages** : pour une adresse qui a un compte, « Ne plus recevoir d'emails » met aussi « Par email » sur « Aucun email » (lot 29), et inversement choisir « Aucun email » ne bloque que les emails automatiques : ceux qu'un organisateur envoie à la main restent possibles tant que la personne n'a pas refusé par le lien. Dire la différence dans « Me prévenir ». Si le lot 29 n'est pas fait, seul le blocage existe.
- [ ] Trois langues, `tests/e2e`, README 13 à jour.

### Lot 36 — Les données personnelles (README 22.26)

Demandé par Julien le 19 novembre 2026. **Après le lot 35** (le pied d'email renvoie à son lien de refus). À faire relire avant de publier les pages. Points à relire : section 6, « Lots 35 et 36 ».

- [ ] **Julien** : décider les durées qui restent (le journal, les empreintes de blocage) ; faire relire la liste du README 22.26 ; créer l'adresse de contact.
- [ ] **« Tes données, en clair »** (`Confidentialite`) et « Mentions légales », publiques, en trois langues, liées en bas de la page de présentation et de chaque email. Le cap : exemplaire et le plus transparent possible, y compris sur ce qui fâche (la clé sur le serveur, ce que voit l'administrateur). Textes à valider par Julien.
- [ ] **« Mes données »** dans « Mon compte » (`CompteDonnees`).
- [ ] **L'accès de dernier recours de l'organisateur**, dit sous « À qui tu offres » de « Tes données, en clair » : un résultat à la fois, lu par tout le groupe dans le journal ; et le dévoilement du tirage à tous. Aucun écran ne dit plus « même l'organisateur ne voit pas » sans cette précision (page de présentation comprise).
- [ ] **La CNIL**, sur les deux pages : « Si sa réponse ne te convient pas, tu peux saisir la CNIL », avec le lien.
- [ ] **Qui verra ce que j'écris** (README 23.3) : la ligne sous chaque champ de donnée personnelle. Dans les maquettes : `Connexion`, `ConnexionCreer`, `Rejoindre`, `PersonneNouvelle`, `GroupePersonne`, `EnvoiAjouterEmail`, `ListeTeneurs`, `PistesTexteMoment`, `PistesTexteServirait`, `PistesTexteEviter`, `ListePartager`. **À faire de même, sans maquette retouchée** : `ListeConnexion`, `PanneauOrganisateur`, `GroupeNouveauAdmin`, `ListePersonneCompte`, `AjouterParticipants`, la fiche d'une personne d'une liste (un enfant : prénom, âge, tailles), `DemandeGroupe`, `Compte`. Passer en revue tout champ du code, pas seulement cette liste.
- [ ] **« Une allergie… »** disparaît de l'exemple du champ « J'évite, ou j'ai déjà » : on n'invite pas à écrire des données de santé.
- [ ] **Le pied de chaque email** (`StopEmail` pour le modèle) : refuser les emails, « Ce que l'application fait de tes données » ; l'email de connexion dit seulement pourquoi il part.
- [ ] **« Télécharger mes données »** et **« Supprimer mon compte »** dans « Mon compte ». Supprimer un compte ne casse ni un tirage en cours ni l'historique d'un groupe : dire ce qui est effacé et ce qui est rendu anonyme.
- [ ] **Le retrait d'une personne sans compte**, sur demande : la marche à suivre pour le super-admin.
- [ ] **La purge** : une tâche planifiée. Un compte sans visite depuis trois ans reçoit un email qui prévient, puis est supprimé ; des anciens tirages, il ne reste que ce qui sert à la règle « pas la même personne ».
- [ ] **Les listes** : l'âge plutôt que la date de naissance là où il suffit ; un mot à celui qui partage une liste où figurent des enfants ; une liste par son lien n'est pas lisible par les moteurs de recherche.
- [ ] **Le registre** : `docs/donnees-personnelles.md`, un tableau des traitements, et la marche à suivre en cas de fuite.

### Lot 39 — Ce que les gens publient : signaler, retirer, les règles d'usage (section 8.5)

Demandé par Julien le 19 novembre 2026 : une liste partagée par lien, un mot d'organisateur, un prénom sont du contenu écrit par des inconnus et hébergé par l'application. **Avant le lot 34** (l'ouverture à tous), après le lot 36 dont il partage les pages. **Textes à faire relire** : ce plan n'est pas un avis juridique. Maquettes (page « Garde-fous et suivi ») : `Signaler`, `SignalerEnvoye`, `AdminSignalements`, `AdminSignalement`, `ModerationEmail`, `ListePartageSuspendu`, `Regles`, `CompteCreerRegles`.

- [ ] **« Signaler »**, en bas de toute page ouverte par un lien (une liste, une page de participant, une invitation) et dans le pied des emails (lot 35 : même file). Sans compte. Un motif à choisir (contenu illégal, harcèlement, données d'un tiers ou d'un enfant, arnaque, autre), un mot libre, une adresse facultative pour la réponse. Accusé de réception si une adresse est donnée.
- [ ] **La file du super-admin** (lot 37, même pastille) : le contenu signalé, qui l'a écrit, les signalements précédents du même compte. Trois gestes : classer ; **arrêter le partage** de la liste ou couper l'envoi d'emails du groupe ; **suspendre le compte**. Rien n'est effacé sur un simple signalement : le contenu est d'abord rendu inaccessible.
- [ ] **Dire pourquoi** à celui dont le contenu est retiré : un email et une ligne dans l'application, avec le motif, la règle visée et comment contester (répondre à l'adresse de contact). Dire au signaleur ce qui a été décidé.
- [ ] **« Les règles d'usage »**, une page publique courte, en trois langues, liée en bas de chaque page et acceptée à la création d'un compte (une phrase avec un lien, pas une case de plus) : à quoi sert l'application ; ce qu'on n'y met pas (rien d'illégal, pas de harcèlement, pas de publicité ni de démarchage, pas de données d'autrui sans son accord, pas de données sensibles) ; n'ajouter que des adresses de gens qu'on connaît ; ce qui arrive en cas d'abus ; le service est gratuit, fourni tel quel, et peut s'arrêter ; comment signaler.
- [ ] **Un point de contact unique** (l'adresse du lot 36), écrit dans les mentions légales, les règles d'usage et `security.txt`.
- [ ] **Le journal de modération** : chaque signalement et chaque décision, avec sa date, gardés un an (durée à valider).
- [ ] **Pas de surveillance automatique des contenus** : on agit sur signalement. Seuls garde-fous automatiques : les plafonds du lot 38 A et le refus d'une adresse web dans un nom.
- [ ] **Les enfants** : dire dans les règles d'usage à partir de quel âge on peut créer un compte seul (à faire préciser par la relecture) ; une fiche d'enfant est écrite par un parent.
- [ ] Trois langues, `tests/e2e` (un signalement arrive dans la file ; arrêter le partage rend le lien inaccessible).

### Lot 40 — Brancher un assistant (MCP)

Décidé par Julien le 19 novembre 2026 : lecture et écriture d'un coup ; **jamais aucun résultat de tirage**. **Après Noël 2026**, et après les listes V2 (24 bis à 27 ter, 25), le lot 38 A (limitation de débit, test de cloisonnement) et le lot 36 (la page des données doit en parler). Avec migration. Maquettes (page « Garde-fous et suivi ») : `AssistantAutoriser`, `CompteAssistants`. Points à relire : section 6, « Lot 40 ».

- [ ] **Avant de coder** : relire la documentation de Cloudflare sur les serveurs MCP distants (transport Streamable HTTP, `createMcpHandler`, la bibliothèque Workers OAuth Provider) et la spécification MCP du moment. Le domaine a changé en 2026 ; ce lot décrit le besoin, pas l'API.
- [ ] **Une route `/mcp` sur le même Worker**, sans état. Chaque outil appelle les fonctions pures et les contrôles d'accès des routes existantes : aucune règle n'est réécrite pour l'assistant.
- [ ] **L'autorisation** (OAuth, `AssistantAutoriser`) : la personne se connecte comme d'habitude, voit ce que l'assistant demande, coche « Lire » et « Modifier » (les deux cochés par défaut, « Modifier » décochable), lit ce qu'il ne pourra jamais faire et que ce qu'il lit part chez son éditeur. Un jeton par assistant, révocable, jamais le cookie de session.
- [ ] **Les outils de lecture** : mes listes (celles que je tiens) et leurs idées ; la fiche des personnes de mes listes ; mes pistes ; pour mes groupes, où en est une édition (qui a ouvert son lien, qui a laissé des pistes : oui ou non, jamais le contenu).
- [ ] **Les outils d'écriture** : ajouter, modifier, retirer une idée sur une liste que je tiens ; modifier mes pistes ; modifier la fiche d'une personne de ma famille. Retirer une idée cochée par quelqu'un est refusé.
- [ ] **Ce qu'aucun outil ne fait, vérifié par un test** qui parcourt toutes les réponses du serveur MCP : aucune attribution d'un tirage, pas même celle du titulaire ; aucun prénom de qui a coché ; aucun contenu des pistes d'un autre ; aucun envoi d'email ; ni partage, ni tirage, ni suppression de liste, de groupe ou de compte ; rien de l'administration ni de l'accès de dernier recours.
- [ ] **Les textes écrits par d'autres sont des données** : les idées et les mots lus par l'assistant sont rendus dans un champ distinct, jamais mêlés aux consignes de l'outil, et tronqués à leur longueur maximale.
- [ ] **« Mes assistants »** dans « Mon compte » (`CompteAssistants`) : la liste, « Débrancher », l'adresse à donner à l'assistant, et ce qu'il a fait depuis 30 jours. Chaque écriture d'un assistant est marquée comme telle.
- [ ] **Les garde-fous** : limitation de débit par jeton (lot 38 A), un plafond d'écritures par jour, les mêmes plafonds d'objets que pour une personne ; un interrupteur d'urgence « Suspendre les assistants » pour le super-admin (lot 38 B) ; le tableau de bord compte les appels.
- [ ] **Les données** (lot 36) : « Tes données, en clair » dit qu'un assistant branché reçoit ce qu'il lit, y compris les prénoms et âges de la famille ; « Mes données » liste les assistants.
- [ ] **La page de présentation** (lot 32) : « Bientôt » devient un vrai bloc, et la phrase « Aucun assistant ne peut savoir qui offre à qui » est vraie par construction.
- [ ] Trois langues pour les écrans ; les descriptions d'outils en anglais ; `tests/e2e`.

### Lot 41 — « Mes proches », plus loin (idées, rien de décidé)

Réflexion du 19 novembre 2026, à reprendre avec Julien avant d'en faire un lot : **rien ici n'est à coder**. Décidé seulement : le nom, « Mes proches » ; la page ne sert qu'aux listes de cadeaux, donc pas de lien avec les participants d'un tirage ; l'adresse d'un proche est facultative.

- **Ce que je lui ai déjà offert** : sur la fiche d'un proche, l'historique de mes coches d'une année sur l'autre. Jamais ce que les autres ont offert.
- **« Moi », écrit une seule fois** : mes goûts et mes tailles servent à ma section dans chaque liste, et pourraient préremplir mes pistes dans un tirage.
- **La fiche tenue par la personne elle-même**, quand elle est reliée à son compte (suite du lot 25) : je lis, elle écrit.
- **Les dates** : l'anniversaire d'un proche approche, « créer une liste ? » (avec les notifications, lots 28 à 31).
- **L'assistant** (lot 40) : des idées d'après les goûts d'un proche et ce qu'il a déjà reçu.
- **La limite à garder en tête** : c'est un carnet de données sur des gens qui n'ont rien demandé, dont des enfants. Rien qui ne serve tout de suite, tout s'efface d'un geste, une personne reliée voit sa fiche.

### Lot 37 — Le tableau de bord du super-admin (README 22.27)

Demandé par Julien le 19 novembre 2026. Utile dès le lot 34 (les plafonds) et le lot 35 (les signalements). Avec migration. Maquette : `Admin` (l'administration et le tableau de bord, fusionnés). Points à relire : section 6, « Lot 37 ».

- [ ] **L'ordre de la page** (demandé par Julien le 19 novembre 2026, maquette `Admin`) : d'abord « Qui s'en sert », puis « À traiter et à surveiller », puis les plafonds, « En cas d'urgence », ce qui tourne tout seul.
- [ ] **« Qui s'en sert », quatre tuiles cliquables** : comptes (vers la liste des comptes), groupes (vers la liste des groupes), listes, emails envoyés. Le grand chiffre est le total depuis le début ; la ligne dessous suit la période choisie sous les tuiles : 7 jours, 30 jours, 12 mois (pas « Aujourd'hui », trop court pour dire quelque chose). Le bloc « Tout voir » disparaît : les tuiles y mènent.
- [ ] **« À traiter et à surveiller », une seule liste** : en tête, avec une pastille, ce qui attend une décision (« Demandes », « Signalements ») ; dessous, avec un simple chiffre, ce qu'on regarde de temps en temps (refus pour débit, connexions échouées, adresses qui ont refusé les emails, emails rejetés, erreurs du serveur). La pastille de l'onglet « Admin » est la somme des pastilles. La carte « Demande de groupe à traiter » disparaît.
- [ ] **Les demandes, repensées** (maquette `AdminDemandes`) : avec le lot 34, tout compte a ses groupes et ses participants sans rien demander ; une demande ne sert plus qu'à en avoir davantage. Une seule file, deux sortes marquées par une étiquette : « Un groupe de plus » et « Plus de participants ». Les traitées restent dessous, avec la décision. Côté demandeur : `LimiteGroupes` et `LimiteParticipants`.
- [ ] **Le panneau d'une demande, unique pour les deux sortes** (décidé par Julien le 19 novembre 2026 ; maquettes `AdminDemande`, `AdminDemandeParticipants`) : la question n'est plus « ai-je la place ? » mais « puis-je faire confiance à ce compte ? ». De haut en bas : qui, la sorte de demande, ce qui est demandé et son mot ; « Ce qu'on sait de ce compte » (ancienneté, groupes et tirages faits, emails envoyés et rejetés, adresses qui ont refusé ses emails, signalements ; en rouge ce qui inquiète), avec « Voir le compte » ; « Ta réponse » : le plafond accordé, modifiable (on peut accorder moins que demandé), un mot facultatif avec trois mots tout prêts (« C'est d'accord », « D'accord, mais pour moins », « Pas pour l'instant »), « Refuser » et « Accepter ». La jauge « groupes couverts par les offres gratuites » et les mots « C'est complet » et « Entre proches » disparaissent.
- [ ] **L'administration n'est plus que dans son onglet** (maquette `AdminOnglet`) : ni carte sur l'accueil des tirages, ni entrée dans le menu. L'onglet « Admin », avec sa pastille, est sur tous les écrans d'un super-admin.
- [ ] **Le cœur, en fonctions pures**, testé d'abord : additionner des compteurs par jour sur une période ; la part d'un plafond ; quand prévenir.
- [ ] **Base** : des compteurs par jour et par nature (emails envoyés, rejetés, requêtes, personnes actives, erreurs), sans identifiant de personne ; le dernier passage de chaque tâche planifiée et son résultat.
- [ ] **Compter** aux bons endroits : l'envoi d'emails, les routes, les tâches planifiées. Une personne active se compte une fois par jour, à partir d'une empreinte qui change chaque jour.
- [ ] **Une seule page, l'accueil de l'administration** (`/admin`, maquette `Admin`) : la demande à traiter, la période, « Qui s'en sert », « Les plafonds » (à la place de la jauge « Capacité »), « À surveiller », « Ce qui tourne tout seul », puis « Tout voir ». Chaque ligne de « À surveiller » mène à sa liste.
- [ ] **L'onglet « Admin »** dans la barre du bas, pour le super-admin seulement (README 22.21) : « Tirages / Listes / Admin ». L'entrée « Administration » sort du menu.
- [ ] **Les pastilles** : sur l'onglet, le nombre de choses à traiter (demandes en attente, signalements pas vus, plafond à 70 %), avec son texte pour lecteur d'écran ; dans la page, la même pastille devant chaque chose à traiter. Elles s'effacent quand c'est traité ou vu. Calculées à la demande, sans attendre le lot 28.
- [ ] **`docs/refonte/maquettes/AdminTableau.html` est périmé** (remplacé par `Admin`) : le supprimer.
- [ ] **Prévenir à 70 %** d'un plafond : une nouveauté « qui presse » pour le super-admin (lot 28) ; tant que le lot 28 n'est pas fait, un email au super-admin, une fois par jour au plus.
- [ ] **La version en ligne** : l'identifiant du commit déployé, inscrit au moment du déploiement.
- [ ] Aucun outil de mesure extérieur, aucun cookie de plus. Trois langues, tests.

### Lot 42 — La V3 : le groupe devient la fête, et tout est dans une fête (pour Noël 2027)

**Le prochain gros chantier, après la Correction 30 et la publication des listes** (Julien, 20 novembre 2026). Il passe **avant** la page de présentation (lots 32, 33), le changement d'infrastructure (lots 34, 38 B), le nouvel admin (lot 37) et l'application installée (lot 31) : la V3 change presque toutes les pages, et ces lots seraient à refaire s'ils passaient avant. Avec migration. À découper en plusieurs lots au moment de lancer (modèle et migration ; fêtes et membres ; listes ; accueil et navigation ; tirage et vocabulaire ; administration et limites).

Ce texte est le résultat de la séance de questions du 20 novembre 2026 avec Julien (deux séries, toutes tranchées). Maquettes : page « V3 » de l'artifact ; les maquettes des autres pages restent la référence de l'application en cours (V2) tant que la V3 n'est pas codée.

#### 1. Le modèle

- [ ] **Le groupe devient la fête.** On ne dit plus « groupe », nulle part (écrans, emails, textes, administration). **Une fête = une occasion** (pas de niveau « famille » au-dessus).
- [ ] **Une fête** a : un nom libre ; une **catégorie** ; une date habituelle (jour et mois) ; « revient chaque année » ; des **membres** ; des organisateurs. Tout ce que le groupe porte aujourd'hui reste à la fête (invitation par lien, organisateurs, exclusions, réglages).
- [ ] **L'année** : fête (permanente) → **l'année de la fête** (« Noël 2026 », avec sa vraie date, qu'on peut changer : il y a des variations d'une année à l'autre) → ses tirages et ses listes. Une seule date à changer par année ; les années passées s'archivent ensemble. À l'écran, on ne dit pas « édition » : on dit « Noël 2026 » et « le Secret Santa ».
- [ ] **Le tirage** appartient à une année d'une fête. **Plusieurs tirages possibles la même année** (les adultes, les enfants). Il propose la date de la fête cette année-là, modifiable. Ses participants se choisissent parmi les membres, comme aujourd'hui.
- [ ] **Les listes appartiennent aux fêtes.** Tout membre peut créer une liste dans une fête. **Une liste peut être dans plusieurs fêtes à la fois**, avec les mêmes coches partout (Justine met sa liste dans « Noël · famille A » et « Noël · famille B » : personne n'offre deux fois la même chose). Toute liste est dans au moins une fête (section 2).
- [ ] **Qui voit une liste** : les membres des fêtes où elle est ; et, si son propriétaire le choisit, **tout le monde avec un lien** (la liste est alors publique : c'est la réponse pour un mariage, on coche sans compte comme aujourd'hui). **Pas de lien d'invité sur la fête** : une fête ne s'ouvre qu'à ses membres.
- [ ] **Deux sortes de personnes, et elles le restent.** Les **membres** d'une fête sont ceux qui y ont accès (table `persons` d'aujourd'hui). **« Mes proches »** est une autre notion, **transversale aux fêtes** : ceux pour qui j'écris des listes, attachés à mon compte (`family_members`). Léo, 6 ans, n'apparaît dans une fête qu'à travers la liste de ses parents. Pas de fusion des deux tables. La page « Mes proches » ne change pas.
- [ ] **La surprise, c'est le mode anonyme, et rien d'autre** (Julien : « confiance en l'intelligence de Tonton »). Pas de règle qui cache les prénoms à celui qui figure sur la liste qu'il tient. Proposition écartée : afficher « Anonyme » d'office sur ses propres idées.
- [ ] **Du tirage à la liste, sans lien** : celui qui tire Hugo trouve sa liste dans la même fête ; le mode anonyme s'active seul (lot 27 ter, sans avoir à relier quoi que ce soit).

#### 2. Les rôles, et ce qui est libre

- [ ] **On ne crée jamais « une fête » : on crée un Secret Santa ou une liste, et la fête est leur première étape** (Julien, 20 novembre 2026). Personne n'ouvre l'application pour créer une fête. La première étape des deux parcours demande l'occasion : une de mes fêtes, ou « Une autre occasion », qui en crée une (la catégorie, un nom, une date, `V3FeteNouvelle`, dont le titre est « Pour quelle occasion ? »). Pour un compte tout neuf, on arrive directement sur les catégories. Le mot « fête » ne s'écrit presque plus : il reste dans « Quitter cette fête », « Les fêtes passées » et les réglages. **Toute liste est dans au moins une fête** : plus de liste « sans fête » ; une liste pour soi ou un mariage ont leur fête, même avec un seul membre, et le nom, la date et l'icône qu'on demandait pour la liste sont ceux de la fête. « Tout le monde, avec un lien » s'ajoute à la fête, il ne la remplace pas. Celui qui veut seulement réunir des gens, sans Secret Santa ni liste à lui, passe par « Une liste » et s'arrête après la première étape : la fête existe, il peut inviter. Créer est libre pour tout compte ; limites : **3 Secret Santa par compte**, 30 membres par fête (plus de demande, voir plus bas).
- [ ] **Les organisateurs** invitent, règlent la fête, organisent le tirage, retirent une liste de la fête. **Les membres** voient la fête et y mettent leurs listes.
- [ ] Un membre peut ne pas avoir de compte (une grand-mère sans email) : il participe au tirage, il ne voit pas les listes.
- [ ] **Quitter une fête, ou en être retiré** : mes listes sortent de cette fête ; mes coches sur les listes des autres restent (le cadeau est toujours prévu).
- [ ] **Créer une fête** : après la catégorie, le nom et la date, **« Reprendre les membres d'une autre fête »** (on coche qui), pour ne pas réinviter les mêmes personnes à chaque occasion.

#### 3. La catégorie

- [ ] **Le principe** : elle ne donne que des réglages de départ. Elle n'interdit rien (toute fête peut avoir un tirage et des listes), tout reste modifiable, et on peut en changer ensuite.
- [ ] **Ce qu'elle initialise** : l'icône de la fête et **celle de ses listes** (pour qu'elles tombent juste sans rien choisir) ; le nom proposé ; la date ; « revient chaque année » ; ce que la fête propose en premier (un tirage, ou une liste) ; la forme de la liste (par personne, ou sans personne) ; « tout le monde avec un lien » suggéré ou non ; **le mot d'accueil de départ d'une liste** (un texte par catégorie) ; le regroupement « Noël 2026 » sur l'accueil ; **« Père Noël » ou non** dans les textes du Secret Santa.
- [ ] **Trois formes derrière les catégories** : « on s'offre tous » (un tirage, chacun sa liste) ; « pour quelqu'un » (une liste pour une personne, pas de tirage) ; « pour un foyer » (une liste sans personne, souvent publique, une seule fois).

| Catégorie | Forme | Date | Revient | Proposé en premier |
|---|---|---|---|---|
| Noël | On s'offre tous | 25 décembre | Oui | Le tirage |
| Anniversaire | Pour quelqu'un | La date de naissance du proche | Oui | Sa liste |
| Naissance | Pour un foyer | À saisir | Non | Une liste sans personne, lien public suggéré |
| Mariage | Pour un foyer | À saisir | Non | Une liste sans personne, lien public suggéré |
| Crémaillère | Pour un foyer | À saisir | Non | Une liste sans personne |
| Autre | Aucune | À saisir | Au choix | Rien de rempli ; icône au choix |

- [ ] **Écartées, avec la raison** : pot de départ (surtout une cagnotte, et l'appli ne touche pas à l'argent ; la personne fêtée n'est pas dans la fête) ; fête des mères et des pères (la date change selon le pays, l'appli est en trois langues) ; Saint-Valentin, Pâques (pas de liste à coordonner) ; fêtes religieuses (une liste trop longue pour être juste). « Autre » les couvre, avec son nom et son icône.
- [ ] **Le Secret Santa hors de Noël est autorisé, et il garde son nom** (Julien, 20 novembre 2026, revient sur la décision d'avant) : « Secret Santa » est le nom de la chose, même pour un week-end d'été ; « tirage » n'est pas un mot courant. Dans toute l'interface, l'objet s'appelle « Secret Santa » (« Le Secret Santa 2026 », « Un Secret Santa », « Organiser un Secret Santa », « Créer le Secret Santa ») ; « tirage » ne reste que pour le geste (« Tirage fait », « On fait le tirage dimanche », « tant que le tirage n'a pas eu lieu »). **« Père Noël » ne se dit que dans une fête de catégorie Noël** (Julien, 20 novembre 2026) : ailleurs, chaque texte qui dit « Père Noël » a une variante neutre (« Tu offres un cadeau à Inès », « celui qui t'offre »), écrite pour de bon dans les trois langues, pas remplacée à la volée (`V3TirageNeutre`).
- [ ] **Les réglages se partagent en deux** (Julien) : sur la fête (`V3FeteReglages`), ce qui est à elle : catégorie, date, récurrence, organisateurs, l'email « Quelqu'un rejoint la fête par le lien », la suppression, et une ligne qui mène aux réglages de son Secret Santa. Sur le Secret Santa (`V3TirageReglages`), ce qui ne concerne que lui : « Éviter la même personne », « Devine qui » (aucun pronostic, « Qui m'offre ? », toutes les paires), le mot ajouté aux messages, les emails « Tout le monde a découvert son tirage » et « Rappel 3 jours avant la fête ». Ces réglages sont recopiés du Secret Santa précédent quand on prépare celui de l'année suivante, comme le budget. **Dès le formulaire de création** (`V3TirageNouveau`, Julien) : « Devine qui », « Petit mot pour les participants » et « Mot ajouté aux messages » y sont, déjà remplis (Julien : « Devine qui » est lié au Secret Santa, il se règle dès la création) ; « Éviter la même personne » reste dans les réglages, il ne sert qu'au moment du tirage. **Le formulaire n'a plus aucun champ écrit sur place** (Julien : des champs pleine largeur d'un côté, des lignes de l'autre, ce n'est pas harmonieux) : six lignes de la même forme, « Nom », « Date de la fête », « Budget », « Devine qui », « Petit mot pour les participants », « Mot ajouté aux messages », chacune avec sa valeur à droite et un chevron. Toucher une ligne ouvre sa page, sur le modèle de la fiche d'un proche (Correction 27, README 23.3) : le titre, le champ, « Valider » ; la date s'y choisit avec les trois listes. Aucune phrase d'aide sous les lignes.
- [ ] **Les pistes de cadeaux et les listes fusionnent** (Julien, 20 novembre 2026). Constat : donner ses pistes, c'est déjà remplir une liste sans cadeau, et le code a trois fois la même chose (`giftPortraits` et `familyMembers.answers/texts` pour les goûts, `wishes` et `giftListIdeas` pour les idées, `participations.giftListId` qui relie déjà une liste aux pistes, lot 27 ter). Décidé :
  - **« Mes pistes » n'est plus un objet.** Celui qui m'a tiré voit, sur sa carte de résultat, mes goûts (ma fiche « Moi » de « Mes proches ») et une ligne vers ma liste de cadeaux (`V3TirageVersListe`). Le mot « pistes » disparaît de l'interface : « Ma liste de cadeaux », « Camille te demande ta liste ».
  - **Une liste dans une fête qui a un Secret Santa peut n'être montrée qu'à celui qui m'a tiré.** Dans « Qui verra ta liste ? », sous une fête cochée où je participe à un Secret Santa, deux choix : « Toute la fête » ou « Celui qui m'a tiré » (`V3ListeQui`, `V3ListeQuiSecret`). Validé par Julien : en arrivant depuis mon Secret Santa, « Celui qui m'a tiré » est choisi d'avance (c'est la confidentialité des pistes d'aujourd'hui) ; en arrivant de l'accueil, « Toute la fête ». La barre du haut de la liste le dit (« Seul celui qui m'a tiré la voit », `V3ListeSecret`). Une telle liste n'apparaît pas dans les listes de la fête pour les autres membres ; celui qui m'a tiré y arrive par sa carte de résultat, en mode anonyme.
  - **Le compte se crée tout seul, à la première chose écrite** (un goût, une idée), pas à l'ouverture du lien : celui qui ne fait que regarder son résultat n'a pas de compte. On le dit sur le moment, par un message : « C'est enregistré. Un compte a été créé avec ton adresse, pour retrouver ta liste. » (`V3ListeCompteCree`).
  - **Plus de réglage « Pistes de cadeaux » pour l'organisateur** : tout est disponible, chacun en fait ce qu'il veut. Retiré du formulaire de création et des réglages du Secret Santa.
  - **Sans adresse email, pas de liste** (Julien) : celui qui arrive par un lien copié se voit demander son adresse au moment où il veut écrire sa liste (`V3ListeAdresse`, sur le modèle des pages de la fiche d'un proche) ; il reçoit un lien pour la confirmer, comme pour se connecter.
  - **Celui qui m'a tiré arrive sur la liste entière, et la page s'ouvre calée sur ma partie** (Julien) : mon prénom en haut de l'écran, juste sous la barre du mode anonyme, déjà activé. Rien d'autre : pas de fond, pas de phrase (un premier dessin surligné a été jugé de trop). Maquette `V3ListeSurligne` ; le nom du fichier est resté, il n'y a plus de surlignage.
  - **Le suivi de l'organisateur** dit « a écrit sa liste » à la place de « a rempli ses pistes », sans jamais en montrer le contenu. « Lui demander des pistes » devient « Lui demander des idées », toujours anonyme.
  - **Migration** : `wishes` vers `giftListIdeas`, `giftPortraits` vers la fiche « Moi » (si les deux existent, la plus récente gagne) ; lecture seule pour les années passées des personnes sans compte.
- [ ] **Le moins de phrases possible** (Julien, 20 novembre 2026) : aucune phrase écrite pour expliquer l'écran à celui qui le conçoit ; ne reste que ce qui sert à l'utilisateur là où il est (un état, une conséquence avant un geste qu'on ne rattrape pas, une information sur ses données). Une passe a été faite sur toutes les maquettes `V3*` : retirés, entre autres, les sous-titres du panneau « Créer », « Chaque réglage s'enregistre dès qu'il est validé », « Envoyé à chaque organisateur, dans sa langue », « L'historique de ceux qui ne participent plus est conservé », les explications de « Ce que j'offre ailleurs » et de « Dans quelle fête ? ». Même règle pour les textes à écrire dans l'application.
- [ ] **Le mot « fête » est en discussion** (Julien penche pour « événement », écrit le moins possible). Tant que ce n'est pas tranché, les maquettes disent « fête ».
- [ ] Une fête surprise ne demande aucune fonction : il suffit de ne pas inviter la personne fêtée.

#### 4. Les écrans

- [ ] **L'accueil** (`V3Accueil`) : « Bonjour Hugo », puis une section par saison (« Noël 2026 · dans 35 jours »). **C'est la catégorie qui regroupe** : toutes mes fêtes de catégorie Noël de la même année vont sous un seul titre « Noël <année> », quel que soit leur nom ; aucune autre catégorie n'est regroupée (un anniversaire, un mariage restent des cartes seules, rangées par date). Dans la section, les fêtes sont **dans l'ordre des dates, la plus proche en haut** (19, 24, 25 décembre). Le décompte du titre, lui, ne dépend d'aucune fête : **Noël a une date connue, le 25 décembre à minuit** (la nuit du 24 au 25), et c'est elle qu'il compte, toujours. Chaque carte garde sa propre date. **L'en-tête d'une fête se touche** (il ouvre la fête) : il porte la même flèche que les lignes du dessous, après la date. Une carte par fête avec l'icône de sa catégorie, ses tirages et les listes de ses membres au même niveau. Une liste dans deux fêtes apparaît dans les deux cartes (« aussi chez Mamie »). « Plus tard » pour les autres fêtes. En bas : « Les fêtes passées » et « Ce que j'offre ailleurs », en lignes (pas de lien de texte souligné). C'est l'accueil qui fait office de calendrier de la famille : pas d'écran à part.
- [ ] **Créer : un troisième onglet dans la barre du bas** (choisi par Julien, 20 novembre 2026). « Accueil », « Créer », « Quoi de neuf » : l'onglet « Créer » est dessiné comme les deux autres (une icône au trait, son nom dessous), sans rond rouge, et il est sur toutes les pages qui ont la barre du bas (`V3Accueil`). Il ouvre un panneau « Créer » de deux lignes sans sous-titre : « Un Secret Santa », « Une liste » (`V3AccueilPlusOuvert`), chacune avec son icône au trait dans un carré teinté (l'emoji reste réservé à une fête précise, d'après sa catégorie). Les boutons « Nouvelle liste » et « Nouvelle fête » du bas de l'accueil disparaissent. Écartées : un rond rouge « + » dans la barre du bas, un rond rouge « + » à côté de « Bonjour Hugo », un bouton blanc « + Créer » à côté du titre (inutile dès que l'onglet existe). Maquettes périmées, retirées de l'artifact, fichiers à supprimer dans `docs/refonte/maquettes/` et `docs/refonte/maquettes-sorbet/` : `V3AccueilPlus`, `V3AccueilPlusTitre`.
- [ ] **L'accueil d'un compte tout neuf ne parle pas de « fête »** (Julien) (`V3AccueilVide`) : deux cartes. « Un Secret Santa », « Chacun tire au sort la personne à qui il offre un cadeau. », le bouton rouge « Organiser un Secret Santa » ; « Une liste de cadeaux », « Tes idées, que tes proches cochent pour ne pas offrir deux fois la même chose. », le bouton « Écrire ma liste ». Les deux mènent à « Pour quelle occasion ? ».
- [ ] **« Un Secret Santa » depuis « Créer »** : première étape, « Pour quelle occasion ? » (`V3TirageQuelleFete`). Un seul choix (un Secret Santa est dans une seule fête) : une des fêtes **que j'organise**, ou « Une autre occasion ». Les fêtes où je ne suis que membre ne sont pas proposées. Une fête qui a déjà son Secret Santa de l'année reste proposée : ce sera un autre Secret Santa. **« Une liste » depuis « Créer »** : première étape, « Qui verra ta liste ? » (`V3ListeQui`) : mes fêtes à cocher, une ou plusieurs, et la ligne « Une autre occasion ».
- [ ] **Plus de demande pendant la bêta** (Julien, 20 novembre 2026) : organiser un Secret Santa ne passe plus par un administrateur. Restent les limites automatiques : **3 Secret Santa par compte** et 30 membres, les garde-fous des emails, et un interrupteur côté serveur pour rallumer la demande en cas d'abus. Arrivé à la limite, « Créer › Un Secret Santa » montre « Tu organises déjà 3 Secret Santa. C'est le maximum pour un compte. », avec les trois (`V3TirageLimite`). La table `groupRequests` et les écrans de demande disparaissent avec la V3. La maquette `V3TirageDemande` est périmée : retirée de l'artifact, ses fichiers sont à supprimer dans `docs/refonte/maquettes/` et `docs/refonte/maquettes-sorbet/`.
- [ ] **Pas de rubrique « Reçues par un lien »** (Julien). **« Ce que j'offre ailleurs »** ne montre que les listes publiques **où j'ai coché quelque chose** sans être membre d'une de leurs fêtes (l'invité d'un mariage doit retrouver ce qu'il offre) ; ouvrir un lien sans cocher ne laisse aucune trace. Maquette : `V3OffreAilleurs`.
- [ ] **Les anniversaires tout seuls** : avec la date de naissance d'un proche, l'accueil propose à l'avance « L'anniversaire de Zoé · dans 24 jours » ; un toucher crée la fête (catégorie anniversaire, date remplie, « reprendre les membres d'une autre fête ») et sa liste.
- [ ] **L'année suivante** (`V3AccueilAnnee`) : deux mois avant la date d'une fête qui revient, l'accueil propose à l'organisateur « Préparer Noël 2027 » ; les membres sont repris ; chacun voit « Reprendre ma liste de l'an dernier ». Une fête qui ne revient pas passe dans « Les fêtes passées » après sa date.
- [ ] **La barre du bas** : « Accueil · Créer · Quoi de neuf », la pastille des nouveautés sur « Quoi de neuf » ; « Admin » en plus pour le super-admin. Les onglets « Tirages » et « Listes » disparaissent.
- [ ] **Le menu du compte** : l'icône de la personne connectée remplace le burger (`MenuAvatar`, `MenuAvatarOuvert`) : « Mon compte » en tête avec le prénom et l'adresse, « Langue », « Se déconnecter ». Peut se faire avant le reste.
- [ ] **La page d'une fête** (`V3Fete`, `V3FeteOrganisateur`, `V3FeteAnniversaire`) : la catégorie, le nom, la date de l'année ; les membres ; le ou les Secret Santa ; les listes ; « Nouvelle liste » ; les années passées. Pour l'organisateur : « Inviter », les réglages, « Un autre Secret Santa ».
- [ ] **« Pour quelle occasion ? »** (`V3FeteNouvelle`, `V3FeteMembresReprendre`) : l'écran où une fête se crée, première étape d'un Secret Santa ou d'une liste quand l'occasion est nouvelle. La catégorie en six tuiles, qui remplit le reste ; le nom, la date, « Elle revient chaque année » ; puis les membres (« Reprendre les membres d'une autre fête »).
- [ ] **Réglages, membres, inviter, rejoindre, quitter** (`V3FeteReglages`, `V3FeteMembres`, `V3FeteInviter`, `V3FeteRejoindre`, `V3FeteQuitter`) : les pages du groupe d'aujourd'hui, avec en tête des réglages « La fête » (catégorie, date, récurrence).
- [ ] **Toutes les dates se choisissent avec les trois listes du téléphone** (Julien) : « Jour », « Mois », « Année », trois `<select>` natifs côte à côte, comme la date de naissance d'un proche (`app/pages/famille/[id]/naissance.vue`, maquette `ProcheNaissance`). Plus de calendrier dessiné : `AdminDateField` et son `UCalendar` en panneau du bas sont remplacés, pour la date d'une fête, d'un tirage et d'une liste (`V3FeteNouvelle`, `V3TirageNouveau`). Le mois en toutes lettres ; les années de l'année en cours à dans deux ans ; les jours suivent le mois et l'année. Les trois listes arrivent déjà remplies par la catégorie (Noël : le 25 décembre) ou par la date de la fête. Pas de `<input type="date">` : sur les téléphones d'aujourd'hui il ouvre un calendrier, pas des roulettes.
- [ ] **Le tirage** (`V3TirageNouveau`, `V3TirageLimite`, `V3TirageNeutre`, `V3TirageVersListe`, `V3ListeSurligne`, `V3TirageReglages`) : l'ancienne « Nouvelle édition » ; la date de la fête déjà remplie ; les membres du tirage précédent repris ; la limite de 3 par compte ; hors de Noël, le nom « Secret Santa » reste ; le résultat qui mène à la liste de la personne tirée. Sur la carte du résultat, la ligne dit seulement « La liste de cadeaux d'Inès » (Julien : on ne précise pas dans quelle fête elle est, les gens veulent le contexte de la page où ils sont).
- [ ] **La liste** (`V3ListeQui`, `V3ListeQuiSecret`, `V3Liste`, `V3ListeSecret`, `V3ListeCompteCree`, `V3ListeAdresse`, `V3ListeNouvelle`, `V3ListePublique`, `V3ListeMembre`) : « Qui verra ta liste ? » (mes fêtes à cocher, une ou plusieurs, et « Tout le monde, avec un lien ») ; la barre du haut ne dit plus « Partage par lien » mais dans quelles fêtes est la liste, avec « Modifier » ; une nouvelle liste prend le nom, la date et l'icône de la fête. La liste d'un autre membre s'ouvre depuis la fête, sans lien, avec une pastille en haut qui ramène à la fête ; elle garde le dessin de la Correction 30.
- [ ] **À refaire ensuite, par un passage systématique** : toutes les autres maquettes qui disent « groupe » ou « édition », qui ont le burger ou les onglets « Tirages · Listes » (participant, journal, « Devine qui », administration, garde-fous, notifications, emails, vitrine).

#### 5. La migration

- [ ] Chaque groupe devient une fête de catégorie Noël qui revient chaque année, avec son nom, ses membres, ses organisateurs, ses exclusions, ses réglages. Chaque édition devient l'année de la fête et son tirage, avec sa date.
- [ ] Les listes existantes : une liste reliée à un tirage (lot 27 ter) va dans la fête de ce tirage ; **chaque autre liste reçoit sa propre fête**, créée à la migration avec son nom, sa date et son icône, dont le seul membre est son propriétaire (ses co-teneurs en deviennent membres) ; si elle était partagée par lien, elle reste publique (« tout le monde avec un lien ») dans cette fête. Les coches faites par lien restent : elles alimentent « Ce que j'offre ailleurs ».
- [ ] **Les liens déjà envoyés continuent de marcher** : les adresses des groupes (invitation, pages) et des listes partagées sont redirigées.
- [ ] Les demandes de groupe disparaissent (`groupRequests`) : les demandes en attente au moment de la migration sont acceptées d'office, et le quota devient la limite de 3 Secret Santa par compte. À essayer sur une copie de la base de production avant tout.

#### 6. Ce qui reste ouvert

- [ ] Un membre peut-il retirer sa propre liste d'une fête sans la supprimer ? (Proposé : oui, depuis « Qui verra ta liste ? ».)
- [ ] Une liste publique où j'ai coché, puis qui cesse d'être publique : elle disparaît de « Ce que j'offre ailleurs », ou elle y reste, fermée ? (Proposé : elle y reste, avec ce que j'offre et « Cette liste n'est plus partagée ».)
- [ ] Les notifications et « Quoi de neuf » se regroupent par fête : à dessiner avec le lot 28.
- [ ] Maquettes d'exploration à supprimer du dépôt une fois la V3 lancée : `AccueilPiste*`, `AccueilFetes2`, `FeteChoisir`, `FeteNouvelle`, `FetePage`, `FetePartagee`, `FeteAjouterListe`, `FetePartageeAjoutee`, `FeteReglages`, `FeteMembres`, `FeteInviter`, `TirageNouveau`, `ListeV3`, `ListeV3Nouvelle`.

## 6. Questions pour Julien

À remplir pendant le travail : donnée manquante, écart entre une maquette et une règle, choix à trancher.

Rien pour l'instant : le seuil du repli (12), les réglages sans bouton « Enregistrer » et les deux choix de l'administration ont été validés le 16 novembre 2026.

**Lot 22, les listes, côté de celui qui ouvre le lien (18 novembre 2026).** Choix faits seul :
- **Pages plutôt que panneaux** (README 23.3) : `ListeConnexion` (deux champs, l'adresse et le prénom) et `ListeHorsListe` (un texte écrit) sont des pages, `/l/[jeton]/connexion` et `/l/[jeton]/hors-liste`. « Changer » et « Se joindre » restent des panneaux : des choix, et au plus un mot court pour les autres.
- **« Réserver »** encore dans ces maquettes (« pour réserver », « Ajouter et réserver ») : les textes disent « cocher » et « Ajouter ».
- **« La liste de Camille et Hugo »** (`ListeVisiteur`) : une liste n'a qu'une personne qui la tient ; la page dit « La liste de Camille. »
- **« Seule Camille sait »** : accordé au féminin dans la maquette ; le texte dit « personne d'autre que Camille », qui ne devine pas le genre.
- **Celui qui tient la liste coche depuis le lien** de sa liste (`/l/[jeton]`, qu'il ouvre par « Le lien »), sauf ses propres idées ; son document reste fait pour écrire.
- **Les goûts d'une personne** se lisent depuis le lien (`/l/[jeton]/gouts/…`), sans sa date de naissance : l'âge suffit.

**Lot 21, les listes, côté de celui qui la tient (18 novembre 2026).** Choix faits seul :
- **« Réserver »** : la maquette `ListePartager` écrit « Réserve ce que tu offres » et « Pour réserver » ; le README (22.19, « Les mots ») l'interdit à l'écran. Le message dit « Coche ce que tu offres », l'aide « Pour cocher ».
- **Moi dans ma famille** : celui qui tient la liste y est d'office, depuis son profil (prénom, icône), dès qu'il a un prénom ; sa ligne dit « Moi ».
- **Créer** : « Nouvelle liste » crée le brouillon aussitôt (icône tirée au hasard) et ouvre son document ; quitté sans nom ni personne, le document le supprime, et l'onglet ne montre jamais un brouillon vide (si la page n'a pas pu le supprimer).
- **Retirer quelqu'un d'une liste** : d'abord seulement en bas de sa fiche (« ses goûts ») ; depuis le lot 24 bis, par le menu « ⋯ » de la personne (`ListePersonneMenu`). Il reste dans ma famille.
- **« Répondre aux questions pour lui »** : « pour Léo », pour ne pas deviner le genre.
- **La carte d'une liste que je tiens** n'a pas encore ma petite icône à côté de « Tu tiens cette liste » (la maquette la montre) ; elle viendra avec le lot 22, qui ajoute celle de « Liste de Mamie ».
- **Ce que voit celui qui tient la liste** (prénoms, « Anonyme ») est prêt dans le cœur (`ideaView`) ; il s'affichera quand on pourra cocher, au lot 22.

**Correction 18, rédiger sur une page (18 novembre 2026).** Choix faits seul :
- **La page de la demande de groupe porte « Administration » au-dessus de son titre**, comme la maquette `AdminDemandePage`, alors que la règle du contexte (README 23.3) exempte l'administration. La maquette l'emporte ici, puisque « Retour » y ramène.
- **Le petit mot d'une nouvelle édition** a l'adresse `…/editions/nouvelle/mot` : la même page que celle d'une édition (`…/editions/[id]/mot`), qui écrit alors dans le formulaire gardé (`useNewEditionDraft`) au lieu d'enregistrer. Le formulaire est oublié dès qu'on le quitte ailleurs que vers cette page, ou une fois l'édition créée.
- **Les réglages du groupe et le lien d'invitation** sont devenus des dossiers (`reglages/index.vue`, `invitation/index.vue`) pour que leurs pages de mot soient en dessous : `/admin/[groupe]/reglages/mot`, `/admin/[groupe]/invitation/mot`. Les adresses existantes ne changent pas.
- **La demande de groupe** a l'adresse `/demande`. Les lignes et le bouton qui l'ouvraient sont devenus des liens.

**Ce qui reste, à la fin du lot 10 (17 novembre 2026).** Julien a répondu le même jour : les données manquantes sont le lot 11, l'alerte du journal et le mot sur un refus le lot 12, dévoiler les résultats le lot 13 ; ses réponses sont sous chaque question. Plus de question ouverte.

**Lot 14, la règle « sans visite, le compte part du tirage ».** Elle cachait une annulation suivie d'un nouveau tirage, pour qui n'avait jamais ouvert le journal. **Réponse de Julien, 17 novembre 2026 :** le compte part de la création de l'édition ; un lien régénéré avant le premier tirage compte aussi. Fait.

**`GroupeReglages`** (lot 9, question 6). **Réponse de Julien, 17 novembre 2026 :** on garde le cadre « Super-admin » ; la maquette est à mettre à jour. Hors périmètre, inchangé : les pistes de cadeaux (README 22.11).

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
   **Réponse de Julien, 17 novembre 2026 :** oui : la route du journal renvoie la personne de chaque ligne (lot 11).
2. **Les icônes et les prénoms d'une ligne regroupée.** « 5 personnes ont découvert leur résultat » montre, dans la maquette, les icônes des cinq personnes, et le détail les liste avec leur icône et leur prénom. Sans la personne sur chaque ligne (question 1), la ligne regroupée n'a pas d'icônes et son détail reprend la phrase de chaque événement (« Rose a découvert son résultat », 23:50).
   **Réponse de Julien, 17 novembre 2026 :** oui, avec la personne de chaque ligne (lot 11).
3. **Les envois regroupés.** La maquette dit « L'organisateur a envoyé « Tirage fait » à 5 personnes par email ». La ligne ne porte ni le message ni le moyen d'envoi : l'écran regroupe donc tous les envois d'un jour et d'une édition et dit « L'organisateur a envoyé 5 messages » ; le détail donne chaque phrase, qui, elle, dit le message et le moyen. Ajouter le message et le moyen aux lignes du journal ferait le regroupement de la maquette (changement de route).
   **Réponse de Julien, 17 novembre 2026 :** oui : la route du journal renvoie le message et le moyen d'un envoi (lot 11).
4. **« Qu'est-ce que ça veut dire ? » (`JournalDetail`).** Sans la personne (question 1), le texte ne peut pas dire « à qui Hugo offre un cadeau » ni « Ce que ça change pour toi : rien », faux pour Hugo lui-même. Il dit « à qui la personne nommée offre un cadeau » et « Ce que ça change. Les autres résultats et les listes de souhaits n'ont pas été vus. » J'ai aussi écrit l'explication de deux alertes que la maquette ne montre pas : « Tirage annulé » et l'ancien « L'organisateur a consulté les résultats du tirage ». Les textes te vont ?
   **Réponse de Julien, 17 novembre 2026 :** les textes me vont. Avec la personne de chaque ligne, le panneau suit la maquette (« à qui Hugo offre un cadeau », « Ce que ça change pour toi ») (lot 11).
5. **La phrase sous la liste**, « L'essentiel regroupe les envois et laisse de côté les changements d'icône et de langue », explique l'interface ; elle est dans la maquette, donc gardée, et seulement sous « L'essentiel ». On la garde ?
   **Réponse de Julien, 17 novembre 2026 :** réglé : la phrase est retirée, comme la maquette.

### Lot 8

1. **Rejoindre le tirage en même temps que le groupe.** **Réponse de Julien, 17 novembre 2026 :** la route `join` ajoute aussi la personne à l'édition « à préparer » (exception à « interface seulement », sans migration, avec son test). Fait.
2. **La date d'un lien d'invitation expiré.** La page d'invitation ne reçoit pas la date limite du lien : « Ce lien d'invitation n'est plus valable » s'affiche donc sans « depuis le 10 décembre ». L'ajouter demande que la route de l'invitation renvoie `inviteUntil` (changement de route). On le fait ?
   **Réponse de Julien, 17 novembre 2026 :** oui : la route de l'invitation renvoie la date limite (lot 11).
3. **L'adresse sur « Se connecter sur cet appareil ? ».** La maquette dit « Tu vas être connecté avec hugo-demo@example.com pendant 30 jours ». La page du lien ne connaît pas l'adresse sans consommer le lien, et c'est voulu (un lecteur d'emails ne doit pas pouvoir l'utiliser). L'écran dit « Tu vas être connecté sur cet appareil pendant 30 jours. » Lire l'adresse du jeton sans le consommer serait une nouvelle route ; on la veut ?
   **Réponse de Julien, 17 novembre 2026 :** oui : une route lit l'adresse du lien sans le consommer (lot 11).
4. **La phrase sous le profil de `Compte`.** La maquette dit « Ton prénom et ton icône sont repris dans tes tirages ». Le profil ne sert que de modèle quand le compte rejoint ou crée un groupe : une personne déjà dans un groupe garde ce que dit le groupe. L'écran dit donc « Ton prénom et ton icône sont repris quand tu rejoins ou crées un groupe. La langue est celle de tes emails. » Ça te va, ou faut-il que changer le profil change aussi les personnes de ses groupes (changement de route) ?
   **Réponse de Julien, 17 novembre 2026 :** ça me va, la phrase reste ; changer le profil ne change pas les personnes des groupes.
5. **Le texte de la demande sur `AccueilDemandeAttente`.** La carte « Ta demande est partie » montre, dans la maquette, ce que la personne a écrit. L'accueil ne reçoit que l'état et la date de la demande : la carte dit « Envoyée le 15 novembre. Un administrateur la lit et te répond par email. », sans le texte. L'ajouter demande que la route de l'accueil renvoie le message (changement de route). On le fait ?
   **Réponse de Julien, 17 novembre 2026 :** oui : la route de l'accueil renvoie le texte de la demande (lot 11).

### Lot 9

1. **Les groupes d'un compte (`AdminCompte`).** La maquette montre pour chaque groupe le rôle (« Organisatrice », « Participante »), le nombre de membres et où en est le tirage, et aussi les groupes où le compte participe seulement. La liste des comptes ne donne que les groupes qu'il organise, par leur nom : l'écran dit « Organise ce groupe », sans membres ni état, et ne montre pas les groupes où il participe. Les ajouter demande que la route des comptes les renvoie (changement de route). On le fait ?
   **Réponse de Julien, 17 novembre 2026 :** oui : la route des comptes renvoie ses groupes, avec rôle, membres et état du tirage (lot 11).
2. **Les lignes de `AdminGroupes`.** La maquette dit « Camille · 5 membres · tirage fait, 1 sur 5 a consulté ». La route des groupes ne donne ni le nombre de membres ni l'état du tirage ; l'organisateur est retrouvé dans la liste des comptes, et la ligne ne dit que lui. Même question : on étend la route ?
   **Réponse de Julien, 17 novembre 2026 :** oui : la route des groupes renvoie membres et état du tirage (lot 11).
3. **« demande refusée » sur `AdminComptes`.** La liste ne connaît que les demandes en attente ; une demande refusée n'apparaît pas sur la ligne du compte.
   **Réponse de Julien, 17 novembre 2026 :** oui : la liste des comptes montre une demande refusée (lot 11).
4. **La carte du haut de l'accueil d'un super-admin** (`AdminAcces`) dit, dans la maquette, « Léa Martin attend ta réponse depuis le 14 novembre » et « Voir la demande ». L'accueil ne reçoit que le nombre de demandes : la carte garde « Des comptes attendent ta réponse » et « Voir les demandes », et mène maintenant à `/admin`.
   **Réponse de Julien, 17 novembre 2026 :** oui : l'accueil reçoit le nom du demandeur le plus ancien (lot 11).
5. **Le genre.** « Groupes qu'elle peut créer », « Organisatrice » : l'application ne connaît pas le genre d'un compte. L'écran dit « Groupes qu'il peut créer » (texte déjà là) et « Organise ce groupe ». Faut-il une tournure neutre partout (« Groupes que ce compte peut créer ») ?
   **Réponse de Julien, 17 novembre 2026 :** une tournure neutre partout, sans genre en base (lot 11).
6. **« Supprimer le groupe » dans les réglages** est maintenant dans le cadre « Super-admin », comme le demande ce lot (« un seul composant »), alors que la maquette `GroupeReglages` montre encore la ligne avec « Réservé au super-admin ». À mettre à jour dans la maquette ?
7. **L'ordre du menu.** `AccueilMenu` met la langue en premier, `AdminAccesMenu` l'administration et le compte en premier, puis la langue. Chaque maquette est suivie : le menu d'un super-admin n'a donc pas le même ordre que celui des autres. C'est voulu ?
   **Réponse de Julien, 17 novembre 2026 :** ça me va, chaque maquette est suivie.

### Lot 16

1. **Les anciennes lignes `wishes_updated` du journal.** Le lot propose de ne plus les afficher : c'est ce qui est fait (`RETIRED_TYPES` dans `server/utils/audit.ts`), sans rien effacer en base. L'autre possibilité serait de les supprimer par une migration. Garder et cacher te va ?
   **Réponse de Julien, 17 novembre 2026 :** oui, cachées et non effacées. Rien à changer.
2. **Retenir qui a demandé des pistes.** Il faut écrire à celui qui a demandé quand les pistes arrivent, sans que l'information soit lisible ailleurs. Choix provisoire, codé : la demande est rangée sur la participation du receveur (`hint_requests`), et celui qui a demandé y est **chiffré avec la clé serveur**, comme un receveur (README 8.3). Aucune route ne le renvoie ; il n'est déchiffré qu'au moment d'envoyer l'email. Deux autres pistes : ne rien stocker et retrouver le donneur en déchiffrant les attributions de l'édition au moment de l'envoi (un cas de déchiffrement de plus en 8.3, sans nouvelle donnée), ou ne rien envoyer du tout (celui qui a demandé revient voir). Une lecture brute de la base dit, dans les deux premiers cas, qu'une demande a eu lieu pour telle personne. Lequel garder ?
   **Réponse de Julien, 17 novembre 2026 :** ne pas stocker qui a demandé ; retrouver le donneur en déchiffrant les tirages de l'édition au moment d'envoyer l'email « des pistes sont arrivées ». Fait : colonnes chiffrées supprimées (migration `0020`), `findGiverParticipationId`, et un test qui vérifie qu'une demande disparaît avec le tirage annulé.
3. **Les étiquettes « Les deux me vont ».** La maquette ne montre que des réponses à un choix. Une réponse « Les deux me vont » s'affiche chez celui qui offre comme « Utile ou surprenant », « Un objet ou un moment »… Faut-il plutôt ne rien montrer pour ces réponses ?
   **Réponse de Julien, 17 novembre 2026 :** une étiquette seulement pour une réponse tranchée ; s'il y a au moins un « Les deux me vont », une seule ligne discrète sous les étiquettes, « Pour le reste, les deux lui vont. » Clés `tags.*.both` supprimées. Fait (sur sa propre page, la personne lit « Pour le reste, les deux me vont. »).
   **Changé par Julien le même jour** (maquettes `Pistes`, `PistesQuestionModifier`, `PistesResultat`, `TirageResultat`) : chez celui qui offre, plus d'étiquettes mais des phrases (« Inès préfère : » et ses puces, l'occasion et la surprise à part, une ligne grise « {sujet} : peu importe. » par « Les deux me vont ») ; « Pour le reste, les deux lui vont. » et les lignes de la page de la personne disparaissent, les clés `tags.*.both` reviennent. Sur sa page, plus de « Modifier » : chaque étiquette, ou étiquette en pointillés pour une question sans réponse, ouvre sa seule question, avec « Effacer ma réponse » ; « Commencer » reprend à la première question sans réponse. Fait.
   Ton message s'arrêtait à « Pour soi ou à partager : » : le sujet de chaque ligne grise reprend l'étiquette « Les deux me vont » de la question (« Utile ou surprenant », « Un objet ou un moment », « À garder ou à consommer », « Pour soi ou à partager », « Surprise ou pas »), suivi de « : peu importe. », comme la maquette. À confirmer.
4. **Les textes des cinq autres questions.** Seule la question 2 est dessinée (« Un objet, ou un moment ? »). Les cinq autres, leurs aides et leurs étiquettes sont écrits d'après la liste du README 22.11, dans les trois langues (`shared/i18n/locales/*/hints.ts`) : à relire.
   **Réponse de Julien, 17 novembre 2026 :** nouveaux textes pour `objectOrMoment.firstHelp`, `selfOrShared.firstHelp` et `secondHelp`, `surprise.secondHelp`, `tags.surprise.first` (« Aime la surprise »), adaptés en anglais et en allemand ; pas de « Les deux me vont » pour `secondHand` ; avec « Portrait seulement », la question `surprise` n'est pas posée et les compteurs disent « sur 5 ». Fait (la carte « Pour commencer », le bandeau de la demande et son email disent alors « Cinq questions »).
   **Changé par Julien le même jour :** « Les deux me vont » revient sur la question de l'occasion, qui devient « Neuf, ou d'occasion ? » (« D'occasion ou fait main », « Neuf ») ; étiquettes « D'occasion, volontiers », « Plutôt du neuf », « Neuf ou d'occasion » ; chez celui qui offre, « D'occasion ou fait main, volontiers. », « Plutôt du neuf que de l'occasion. », « Neuf ou d'occasion : peu importe. ». Les valeurs enregistrées gardent leur sens. Fait.
5. **Sans adresse email.** Les maquettes supposent que les deux personnes ont une adresse. Sans adresse chez le receveur, le panneau dit « {Prénom} le verra sur sa page de pistes », et la confirmation de même ; sans adresse chez celui qui demande, « Reviens ici : les pistes s'afficheront dès qu'elles arrivent ». La confirmation dit « vient de recevoir un email » seulement si l'email est vraiment parti. Ça te va ?
   **Réponse de Julien, 17 novembre 2026 :** c'est bon.
6. **Demander n'est possible qu'après avoir découvert son résultat**, et seulement tant que l'édition est tirée (pas après la clôture). Une demande déjà faite reste affichée « Demande envoyée. » tant qu'aucune piste n'est arrivée.

### Lot 16 bis

1. **La dernière ouverture du résultat.** Le plan demandait une date sur la participation de celui qui offre ; la colonne `participations.last_viewed_at` existait déjà et change à chaque ouverture du résultat : elle sert, sans nouvelle colonne. Une colonne s'ajoute en revanche, `hints_announced_at`, pour n'envoyer l'email « des pistes sont arrivées » qu'une fois par tirage (remise à zéro par un nouveau tirage). Ça te va ?
   **Réponse de Julien, 17 novembre 2026 :** oui pour `last_viewed_at` et `hints_announced_at`. Vérifié : `last_viewed_at` change à chaque ouverture du résultat (test `hints.spec.ts`) ; `hints_announced_at` est remis à zéro quand le tirage est annulé et quand il est refait (`CANCELLED_PARTICIPATION`, `DRAWN_PARTICIPATION`, testés). Fait.
2. **Avant la première découverte**, des pistes ne sont jamais « nouvelles » : la carte dit seulement qu'elles attendent à l'intérieur, et la pastille « Nouveau » n'apparaît pas à la première ouverture.
   **Réponse de Julien, 17 novembre 2026 :** oui. Rien à changer.
3. **L'email et la demande de pistes.** L'email part à la première apparition de pistes après la découverte, demandées ou non ; une demande y répond donc par le même email. Si les pistes existaient déjà quand celui qui offre découvre son résultat, aucun email : il les lit tout de suite.
   **Réponse de Julien, 17 novembre 2026 :** oui, pas d'email si les pistes existaient déjà à la découverte. Rien à changer.
4. **La carte « De nouvelles pistes pour ton cadeau »** ne se met pas de côté (pas de « Plus tard ») : elle disparaît une fois le résultat ouvert, comme « Découvrir ». Sur l'accueil à un seul tirage, c'est la carte du tirage qui la montre, sans seconde carte (README 22.10).
   **Réponse de Julien, 17 novembre 2026 :** oui, pas de « Plus tard ». Rien à changer.
5. **Le compte de l'organisateur** (« 1 sur 3 a laissé des pistes ») est sous le titre de la liste des participants du suivi ; aucune maquette ne le place. Il n'apparaît que si au moins une personne a laissé des pistes.
   **Réponse de Julien, 17 novembre 2026 :** oui, sous le titre de la liste des participants, masqué à zéro et masqué quand le réglage est « Aucune piste ». Fait.
6. **iPhone 16** (393 × 659 visibles dans Safari) : sur `TirageDecouvrir` et `TirageRevoir`, le bouton principal reste visible sans défiler, avec la ligne du budget et de la date et le mot de l'organisateur (bas du bouton à 558 et 538 px sur 659).
7. **« Lire la suite »** n'apparaît que si le mot dépasse vraiment trois lignes à l'écran (mesuré à l'affichage).
8. **La ligne grise « peu importe »** (question 1 du lot 16, posée de nouveau). **Réponse de Julien, 17 novembre 2026 :** la forme « {libellé} : peu importe. », une ligne par question, avec ses propres textes à la troisième personne (« Utile ou surprenant », « Un objet ou un moment », « À garder ou à consommer », « Pour soi ou à partager », « Neuf ou d'occasion », « Surprise ou pas »), sans reprendre les étiquettes de la page de la personne, à la première personne depuis « Côté cadeaux, je préfère… ». Fait (`hints.giver.subjects`).

### Lot 17

1. **Une réponse qui nomme un participant retiré ensuite.** Choix provisoire, codé : le retrait efface la réponse du participant retiré ; une réponse qui le nommait reste en base mais ne compte plus tant qu'il est absent (`validAnswers`) : son auteur repasse « pas encore répondu » chez l'organisateur et retrouve « À qui offres-tu un cadeau ? » sur sa page, sans message. S'il revient dans l'édition, la réponse compte de nouveau. L'autre possibilité : effacer aussi ces réponses au retrait (il faudrait les déchiffrer pour les trouver). Ça te va ?
2. **Un participant ajouté après que tout le monde a répondu.** Il n'a pas encore répondu : la carte repasse à « Demande à chacun à qui il offre ». Sa réponse ne peut pas se déduire, puisque tout le monde est déjà nommé : il faudra qu'au moins une autre réponse change, ce qui créera un conflit visible. Rien de plus n'est prévu (pas d'avertissement à l'ajout). Faut-il prévenir l'organisateur, par exemple dans « Choisir les participants », que les réponses devront être reprises ?
3. **Les textes des messages Demande et À vérifier**, et du panneau d'envoi (« Demander à Louis », « Relancer Louis », « Écrire à Louis », « Demandé le 14 nov., pas encore répondu ») : seule la Relance est dessinée (`ManuelRelance`). Écrits dans les trois langues, à relire (`shared/i18n/locales/*/messages.ts`, `adminEdition.ts`). La maquette de la Relance dit « chacun voit les idées de sa personne » : écrit « les pistes de cadeaux », le vocabulaire des autres écrans.
4. **La maquette `ManuelRelance`** montre l'ancien panneau d'envoi (onglets, « Ajouter un mot », langue) : c'est le panneau allégé de la Correction 7 qui sert, avec les trois messages dans « Personnaliser le message ».
5. **Plusieurs conflits à la fois** : la carte dit « Des réponses ne vont pas ensemble » et nomme toutes les personnes concernées, dans une seule phrase (« Hugo, Inès, Louis et Rose ont nommé la même personne… »), qui n'est juste que pour un conflit. À reformuler si tu veux ce cas.
6. **Le panneau de démarrage** dit, selon le groupe : « L'exclusion du groupe (Camille et Hugo) n'est pas vérifiée » (maquette), « Les 3 exclusions du groupe ne sont pas vérifiées », et ajoute « , ni la règle des années précédentes » quand cette règle aurait écarté des paires ; sans aucune des deux, seulement « Tu peux revenir au tirage par l'application tant que tu n'as pas validé. »
7. **Annuler un tirage validé** remet l'édition en préparation en restant « tirage fait ailleurs », sans réponse : on recueille de nouveau, ou on abandonne pour tirer avec l'application.
8. **Le lien « Le tirage a déjà été fait ailleurs ? »** est aussi sous la carte « À corriger avant le tirage » (tirage impossible), où il sert le plus : la maquette ne le montre que sous « Lancer le tirage ».
9. **Accueil** (README 22.10) : rang « 3 ter » pour la réponse à donner (avant les nouvelles pistes), « 5 bis » pour un conflit, « 5 ter » pour valider, « 6 bis » pour demander les réponses. Aucune maquette. Les lignes de tirage disent « Ta réponse est attendue » (« Répondre ») ou « Réponse enregistrée », la carte d'un groupe « Réponses · 3 sur 5 ».
10. **Écarts aux maquettes**, à 390 px : la fin des panneaux suit la hauteur de leur contenu, comme tous les panneaux de l'application (les maquettes les montrent en pleine hauteur) ; l'en-tête de l'édition garde « Famille Camille · Budget 30 € » comme les autres étapes.

### Lot 18

1. **Réglages du groupe** : rien n'en est retiré. Toutes leurs lignes valent déjà pour toutes les éditions : la règle des années précédentes, les pistes de cadeaux, le mot ajouté aux messages, les notifications, les organisateurs, la suppression du groupe. Le budget et le petit mot sont des réglages de l'édition depuis la Correction 9.
2. **Sans date de la fête**, « Clôturer l'édition » n'avait plus de place (elle était dans « Plus tard ») : elle est dans « Un souci ? », avec un second appui. Avec une date, la clôture reste à l'étape « Fêter ».
3. **Le jour de la fête**, l'ancienne liste « En cas de pépin » est remplacée elle aussi par « Réglages de l'édition » et « Un souci ? » (sans « Dévoiler avant la fête », qui est alors l'action de la carte).
4. **L'étape « Préparer »** garde sa liste « Si tu veux » (prévenir avant le tirage, exclusions, budget, petit mot) : le lot ne la cite pas. La maquette `ManuelPreparer` ne montre plus budget ni petit mot dans cette liste ; à dire si elle doit passer par « Réglages de l'édition » elle aussi. Même question pour « Plus tard, ou en cas de pépin » de l'étape « Réponses » (lot 17).
5. **Sans piste après la clôture**, la tuile dit « Rien laissé », sans cercle ni coche ; aucune maquette ne montre ce cas.
6. **Le petit mot** sur la page des réglages tient sur une ligne, coupé par des points de suspension ; la maquette le montre sur deux lignes.
7. Les maquettes `PropSuivi`, `PropTirage` et `PropSouci` sont supprimées. `DevineSuivi` et `DevineSuiviRappelFait` pointent encore vers `PropSouci.dc.html`.

**Réponses de Julien, 17 novembre 2026.**

- Points 1, 2 et 3 : d'accord, rien à changer.
- Point 4 : oui, la même ligne « Réglages de l'édition » à toutes les étapes. **Préparer** : la liste « Si tu veux » garde « Prévenir avant le tirage » et « Exclusions », puis la ligne « Réglages de l'édition » ; le budget et le petit mot en sortent (maquettes `Main`, `Preparer*`, `ManuelPreparer`). **Réponses** : la liste « Plus tard, ou en cas de pépin » est remplacée par « Réglages de l'édition » et « Un souci ? », dont le panneau contient « Ajouter ou retirer des participants » et « Abandonner et tirer avec l'application » (maquettes `ManuelCollecte`, `ManuelConflit`, `ManuelUneManque`, `ManuelPret`, panneau `SouciReponses`). À faire.
- Point 5 : après la clôture, une tuile des pistes vide ne s'affiche pas du tout ; avec des pistes, elle reste, en lecture seule. À faire.
- Point 6 : le petit mot sur une ligne, ça va.
- Point 7 : les liens de `DevineSuivi` et `DevineSuiviRappelFait` sont corrigés vers `Souci.dc.html`. Les maquettes `Feter` et `EtatConfirmation` montrent maintenant les deux lignes, comme le code.

**Compléments faits le 17 novembre 2026** (points 4 et 5) : voir les cases cochées du lot 18. Restent à savoir :

8. **Les couleurs sans jeton** des illustrations (le papier en dégradé `#efe3cd` à `#e2d2b4`, le rabat `#f8f1e3` à `#efe4cf`, les traits `#cdb48a`, l'ombre `#3c1e0a`, la boule `#d9a93a`) sont gardées telles que dessinées. Faut-il en faire des jetons (« papier d'enveloppe », par exemple) ?
9. **Hydratation** : la page d'un lien invalide signale un écart d'hydratation dans la console, déjà en production avant ce lot ; sans effet visible. À corriger à part ?

### Lot 19

Fait le 17 novembre 2026, en suivant le README 22.17. Ce qui n'y est pas écrit, choisi pour avancer :

1. **L'ordre et les couleurs des prix dans les images.** Les maquettes montrent le détective (moutarde), les mieux cachés (prune) et le suspect idéal (sapin). Ajoutés, sans maquette : « Démasqués » (sapin) avant le détective, et « Le plus transparent » (brique) après lui. L'ordre : Démasqués, Le détective, Le plus transparent, Les mieux cachés, Le suspect idéal.
2. **Ton Père Noël quand on s'est trompé, ou sans pronostic.** « Tu avais dit Rose… », puis « C'était Hugo. » et « Raté : tu avais dit Rose. » ; sans pronostic, « Et ton Père Noël était… », puis « Tu n'avais pas fait de pronostic. ». À relire, dans les trois langues.
3. **« Le mieux caché »** compte tous les Pères Noël que personne n'a démasqués, même ceux sur qui personne n'a parié : avec peu de joueurs, ils sont souvent plus de trois, et l'écran devient « 4 personnes ». Faut-il ne compter que ceux sur qui quelqu'un a parié ?
   **Réponse de Julien, 18 novembre 2026 :** mieux que ça, une note pondérée par le nombre de tentatives, pour « Le mieux caché » et « Le plus transparent » (Correction 14).
4. **L'heure de fin et la tâche horaire.** La tâche tourne toutes les heures à la demie : la ligne « les pronostics sont fermés » et le dévoilement automatique peuvent arriver jusqu'à une heure après l'heure choisie (les pronostics, eux, ferment à l'heure exacte). Une cron toutes les 15 minutes resserrerait l'écart ; à dire.
   **Réponse de Julien, 18 novembre 2026 :** oui, toutes les 15 minutes (Correction 12).
5. **Les textes de la tuile** : « Fais ton pronostic », « Pronostic fait », « Réponse à la fête », « Le palmarès t'attend », « Voir les réponses ». Seuls le premier et le quatrième sont dessinés.
6. **Les textes du rappel et de l'email du palmarès** suivent les maquettes ; la ligne du jeu dans « Tirage fait » (« 🔍 Devine qui t'offre ton cadeau : tes pronostics jusqu'au 25 décembre à 18 h. ») n'est pas dessinée. À relire.
7. **Sur l'accueil**, la carte « Devine qui t'offre ton cadeau » se met de côté (« Plus tard ») : le jeu est facultatif. Celle du palmarès ne se met pas de côté ; elle passe après « Découvrir » (son cadeau d'abord) et disparaît une fois le palmarès vu.
8. **Le typage de la CI échouait depuis le lot 17** (`drawMode` manquant à la création d'une édition) : je vérifiais avec `vue-tsc`, qui ne couvre pas le serveur. Corrigé ; je lance maintenant `nuxt typecheck`, comme la CI. Le test de bout en bout du compte (« Appareil déconnecté », texte trouvé deux fois) échoue parfois sur la CI et passe ici : non corrigé.

### Correction 14

Codée le 18 novembre 2026. Points que j'ai tranchés seul, à relire :

1. **« Un pronostic compté est hors leurre »** (README, « Les prix, un par un ») contredit la règle « Se nommer soi-même » du même 22.17 (plus de leurre : la ligne de la personne à qui j'offre compte). J'ai gardé « Se nommer soi-même ». Pour les prix sur les Pères Noël (mieux caché, plus transparent, rumeur, suspect), j'écarte aussi les pronostics où l'on se nomme soi-même, et ceux du vrai Père Noël sur la ligne de la personne à qui il offre : il connaît la réponse.
2. **L'historique suit la ligne.** Un pronostic déplacé (personne déjà choisie ailleurs) quitte son ancienne ligne sans compter comme un changement ; sur la nouvelle ligne, l'ancienne réponse s'ajoute à l'historique. Effacer un pronostic efface son historique. Une réponse identique ne change ni l'historique ni l'heure.
3. **« Le sans-faute » et « Le détective »** : si ce sont des personnes différentes, les deux écrans s'affichent l'un après l'autre. Plusieurs sans-faute : ceux qui ont fait le plus de pronostics.
4. **Les tons du score du groupe** : « nettement mieux » à partir d'une fois et demie le hasard (et au moins 2 de plus), « moins bien » à deux tiers du hasard ou moins, « à peu près pareil » entre les deux. Phrase du milieu : « Le hasard aurait fait aussi bien. »
5. **« Démasqués » en grille ou en nombre** : « Les Pères Noël n'ont rien pu cacher. » quand tous ceux qui ont pronostiqué leur Père Noël l'ont trouvé, « Belle année pour les détectives. » à partir de la moitié, rien en dessous. Les maquettes donnaient ces phrases sans dire quand.
6. **La force des prix** (le plafond de huit écrans) : la note lissée pour les prix pondérés ; « Sur le fil » 1 − minutes ÷ 60 ; « Le suspect idéal » citations ÷ joueurs ; « La girouette » (changements + 1) ÷ (changements + pronostics + 2).
7. **« Sur le fil »** compte jusqu'à la fin réelle des pronostics : l'heure de fin, ou le dévoilement s'il est venu plus tôt. Avec un dévoilement anticipé, le dernier pronostic tombe souvent « dans la dernière heure ».
8. **Les phrases inventées** (plusieurs gagnants, une foule au-delà de trois, « une seule l'a trouvé », les trois langues) sont dans `shared/i18n/locales/*/participant.ts`, `participant.game.awards`. En allemand, « Der Durchschaubarste » et « Der am besten Versteckte » sonnent lourd : à relire.

### Correction 15

Codée le 18 novembre 2026. Points tranchés seul, à relire :

1. **« 3 pronostics sur 5 »** : la maquette `DevinePairesCourse` compte cinq lignes pour six participants, alors que la page en montre six (« Qui t'offre ? » et les cinq autres ; la ligne de la personne à qui j'offre compte depuis « Se nommer soi-même »). Je compte toutes les lignes de la page : « 3 pronostics sur 6 ».
2. **Passer son tour après avoir joué** n'est pas possible : il faut d'abord retirer ses pronostics. Faire un pronostic reprend la partie de soi-même.
3. **Le lien « Je passe mon tour » de l'email** ouvre la page du jeu et demande une confirmation (un lien ne doit rien changer à lui seul).
4. **Le rappel automatique** : s'il ne part pas (coupé, jeu allumé tard, organisateur qui vient de rappeler), il ne partira plus. Le jour du rappel est compté dans le fuseau du réglage.
5. **L'email de fermeture** ne part que si les pronostics ferment à l'heure : un dévoilement anticipé les ferme sans lui. « Bonjour {prénom} » prend le prénom du compte de l'organisateur, vide s'il n'en a pas donné.
6. **« Me tenir au courant »** n'apparaît qu'aux organisateurs du groupe : un super-admin qui n'en fait pas partie ne voit que « Rappel automatique ».
7. **Le message au groupe**, au-delà de sept jours, commence par « On joue à Devine qui jusqu'au 25 décembre à 18 h ! » ; dans les sept derniers jours, « Plus que 5 jours… », et « Dernier jour… » le jour même.
8. **« Tu verras quand même le palmarès à la fête »** (`DevinePasse`) garde le mot « palmarès », comme la maquette, alors que la règle dit de parler de « surprise » aux joueurs avant la fête. À trancher. Le seul autre texte d'avant la fête qui le disait (« Réponse à la fête ») dit maintenant « les résultats et la surprise ».

**Réponses de Julien, 18 novembre 2026, 11 h 17.**

- Point 1 : d'accord, toutes les lignes comptent, « 3 pronostics sur 6 ». Remplir aussi la ligne de la personne à qui on offre protège le secret : une seule ligne vide la désignerait. La maquette `DevinePairesCourse` est corrigée.
- Point 2 : d'accord. Passer son tour veut dire ne pas jouer.
- Point 3 : d'accord, et c'est important : les messageries ouvrent parfois les liens toutes seules.
- Point 4 : d'accord pour les trois cas cités, c'est voulu. **Une tolérance à ajouter** : si la tâche planifiée a simplement eu du retard ou une panne, le rappel part quand même jusqu'à six heures après l'heure prévue ; au-delà, il ne part plus. À faire, avec son test.
- Point 5 : d'accord.
- Point 8 : à corriger. Le texte devient « On ne te rappellera pas le jeu. Tu verras quand même la surprise à la fête. », dans les trois langues. La maquette `DevinePasse` est corrigée. À faire.
- Points 6 et 7 : pas encore lus par Julien. Rien à changer en attendant.

### Correction 16

Codée le 18 novembre 2026. Points tranchés seul, à relire :

1. **« Rappeler le jeu »** : l'interrupteur est gardé dans l'adresse (`?vers=groupe`), pour revenir sur « Au groupe » après « Personnaliser le message ». Le mot ajouté pour le groupe et celui pour les emails sont gardés séparément. Dans « Personnaliser » du rappel, la langue est celle de la première personne cochée (comme pour un envoi à une personne) ; pour le groupe, pas de langue.
2. **Le rappel automatique en retard** : au-delà de six heures après son heure, il est noté comme manqué et ne partira plus.
3. **Ce que j'ai changé hors de `TEXTES.md`, dans la même voix** : côté participant, les dernières mentions de « ton résultat » dans le journal (l'accès de dernier recours, l'aide « Moi », les explications des alertes, le signal de l'accueil) disent « ton enveloppe » ; le badge « consulté » devient « enveloppe ouverte », et le compte de l'accueil organisateur « ont ouvert leur enveloppe ». Les textes de l'organisateur sur « Voir un seul résultat » gardent « résultat ». En anglais, « organiser » devient « organizer » partout et « The day you exchange the gifts » devient « The day of the party, when gifts are given » ; en allemand, « Bescherung » devient « Feier » partout (date de la fête, clôture), « protokolliert » devient « im Journal vermerkt ».
4. **`home.drawCard.waiting`** (« Le tirage n'a pas encore eu lieu », carte de l'accueil) n'est pas dans `TEXTES.md` : inchangé.

### Correction 17

Codée le 18 novembre 2026. Points tranchés seul, à relire :

1. **Point 2 (messages automatiques) non retenu** : ils signent « Le Secret Santa de {groupe} », sans prénom. Même signature quand l'organisateur qui envoie n'a pas donné de prénom dans son compte.
2. **Les messages à partager** (WhatsApp, SMS) n'ont pas de signature : ils partent du téléphone de l'organisateur. Ils gagnent seulement le contexte en première ligne.
3. **Les messages d'erreur** gardent « ton organisateur » : ils ne savent pas de quel groupe il s'agit.
4. **La forme des objets** : « Secret Santa de {groupe} : … » en français, « {groupe} Secret Santa: … » en anglais, « Wichteln {groupe}: … » en allemand ; pour les emails à l'organisateur, « Devine qui, {groupe} : … ». Le prénom reste dans chaque objet.

### Lots 20 à 22 — listes de cadeaux

Écrits le 18 novembre 2026 à partir des maquettes. Points que Julien n'a pas encore tranchés ; la proposition entre parenthèses est celle que suivent le README 22.19 et les lots, à corriger s'il répond autrement.

1. **Le lien avec un tirage.** Aucun pour l'instant : une liste est séparée des groupes et des éditions. À décider plus tard : montrer à celui qui m'offre, dans un tirage, la liste où je figure.
2. **Le mot de départ.** **Réponse de Julien, 18 novembre 2026 :** « Quelques idées pour t'éviter de chercher. Coche ce que tu offres, et personne n'aura la même idée. Tu en as une autre ? Elle est la bienvenue. » Les maquettes sont à jour.
3. **Arrêter de partager** (proposition : pas dans ces lots). Un « Ne plus partager » sur `ListePartager` couperait le lien et remettrait la liste en brouillon, en gardant les cadeaux cochés.
4. **Celui qui tient la liste ne coche pas ses propres idées** (proposition : oui, pas de case sur ses lignes). **Tranché par Julien le 19 novembre 2026 : si, il les coche** (Correction 20).
5. **Rester anonyme** : le prénom est visible de celui qui tient la liste dès qu'on coche, jusqu'à ce qu'on passe par « Changer » (proposition : retenir le dernier choix de chacun pour la fois suivante).
6. **Un cadeau hors liste** : les autres voient « Un cadeau surprise, hors liste », sans les deux mots (proposition des maquettes). À confirmer : les montrer éviterait mieux les doublons.
7. **À plusieurs** : seul celui qui a proposé ferme le groupe ; s'il se retire, le cadeau passe au suivant (proposition des maquettes).
8. **« Au hasard »** tire un symbole et une couleur parmi tous, sans éviter ceux déjà pris (proposition).
9. **Le bleu nuit** `#2c4a63` des tuiles de liste est hors de la palette de l'application (proposition : on le garde, pour les listes seulement).
10. **Aucun email** dans ces lots : celui qui tient la liste n'est pas prévenu quand quelqu'un coche.
11. **La carte d'un brouillon** dans l'onglet « Listes » n'est pas dessinée : même carte, « Brouillon » en tête.

### Correction 18

Écrite le 18 novembre 2026. Choix faits en dessinant, à relire :

1. **Répondre à une demande** : une seule page, avec le mot et « Refuser » / « Accepter » ensemble, plutôt qu'une page pour le mot et un retour à la demande.
2. **`EditionNouvelle`** : le petit mot quitte le formulaire de création pour une ligne qui ouvre `EditionMot`. Il faut garder le reste du formulaire pendant l'aller-retour.
3. **Les listes de cadeaux** (lots 21 et 22) respectent déjà la règle : les idées s'écrivent dans le document (`ListeIdee`, `ListeNouvelle`), `ListePersonne` est une page. Leurs panneaux n'ont qu'un champ court : l'adresse email (`ListeConnexion`), le mot pour les autres (`ListeReserverPlusieurs`), le cadeau hors liste (`ListeHorsListe`).
4. **Les pages des trois textes des pistes** n'ont pas de ligne d'aide sous le champ : l'aide actuelle est déjà la phrase sous le titre.

### Lot 23 — le style « Sorbet »

Écrit le 19 novembre 2026. Points à relire :

1. **Le corail** : `#d93a2b`, plus soutenu que celui des premières planches (`#ff5c4d`), pour le contraste du texte blanc des boutons. L'autre voie serait de garder le corail vif avec un texte de bouton prune foncé.
2. **Les tuiles carrées des listes** : leurs six couleurs pleines n'ont pas été redessinées. Dans les maquettes habillées, sapin, brique et moutarde ont suivi le thème (menthe, corail, lilas) ; prune, bleu nuit et kraft sont restés. À choisir : six couleurs pleines de Sorbet.
3. **Violet et prune nuit**, deux des quatre couleurs du palmarès, sont de la même famille. Si deux écrans qui se suivent se ressemblent trop : remplacer la prune nuit par un bleu nuit ou un orange brûlé.
4. **Les maquettes habillées n'ont pas été contrôlées à l'œil** : elles sortent d'un script. Les hauteurs des cadres n'ont pas été recalculées.
5. **Le mode sombre** : une piste dessinée, aucune décision.
6. **Le journal vide** n'a pas de maquette, donc pas d'illustration.

**Codé le 19 novembre 2026.** Tranché seul, à relire :

7. **Le texte posé sur un fond corail clair est en corail foncé `#b92d1f`**, pas en `#c93425` comme dans les maquettes : `#c93425` sur `#ffe3de` ne fait que 4,3 pour 1. Les liens et le texte d'action sur la page ou sur blanc restent en `#c93425` (`text-primary`, un cran plus foncé que le bouton `#d93a2b`, qui ne ferait que 4,3 sur la page).
8. **Le texte discret `#796987` ne passe pas sur un fond doux** (4,3 sur `#ffeae1`, 4,2 sur le lilas clair). Là où il s'y trouvait (l'onglet « Créer un compte » non choisi), c'est le texte secondaire `#6b5a7a`. Un texte d'exemple dans un champ prend aussi `#796987`, au lieu d'un gris plus pâle.
9. **`tint` et `soft` ont la même teinte** dans chaque famille (`#ffe3de`, `#dcf7ee`, `#f1e8fc`), comme dans `habiller.py`. Un rond `soft` posé dans un pavé `tint` ne s'en détache donc plus.
10. **La case cochée par quelqu'un d'autre** (listes) : fond pêche `#f5b8a5` comme dans la maquette, mais coche prune au lieu de blanche (le blanc n'y fait que 1,7 pour 1).
11. **Le voile derrière un panneau** : le code avait un voile blanc à 75 %, pas le gris des anciennes maquettes. Il est maintenant `#a8959d` à 75 %.
12. **Le sapin garde deux verts** (`#0b7a5b` et `#085a43`) pour l'ombre entre ses étages ; le script les fondait en un seul. Son tronc est violet `#6a3db3`, comme dans les maquettes habillées. Les aiguilles de l'horloge de l'enveloppe en attente passent au même violet (le script les avait laissées brunes).
13. **Le rabat des enveloppes** est d'une seule teinte (`#ffeae1`), comme dans les maquettes habillées : le dégradé du rabat a disparu avec la palette.
14. **Dans le journal, l'heure de l'entrée « palmarès »** est en `#dcf7ee` (4,7 pour 1 sur le vert) au lieu de `#d3f3e8` (4,5 tout juste).
15. **Les coins passent par les noms de Tailwind** (README 23.1) : `rounded-lg` (petite tuile, 14 px) est donc plus petit que `rounded-md` (bouton, 16 px). Les deux cases à cocher natives (`UiCheckRow`, `UiConfirmBox`) sont redessinées pour avoir leurs coins de 8 px (utilitaire `tick`).
16. **Le grain de papier kraft du fond de page** est retiré : le fond est uni.
17. **Sur les écrans de connexion et d'invitation**, l'illustration porte le nom « Under the Tree » comme le demande 23.5, et le nom reste écrit dessous : un lecteur d'écran l'entend deux fois.
18. **Les noms des couleurs d'icône** dans les dictionnaires disent toujours « Rouge brique », « Vert sapin », « Moutarde », « Kraft », « Givre », « Prune » alors qu'on voit corail, menthe, citron, pêche, ciel et lilas. Aucun texte ne devait changer dans ce lot : à décider.
19. **L'icône de l'onglet et de l'écran d'accueil du téléphone** (`public/favicon.svg`, PNG) garde les anciennes couleurs. Seule la couleur de la barre du navigateur (`theme-color`) a suivi.
20. **Une pastille « envoyé » reste bleue** (couleur `info` de Nuxt UI) : 23.5 n'en dit rien.
21. **Les tuiles carrées des listes** (`app/utils/listShades.ts`) n'ont pas été touchées, comme demandé (point 2).

Écarts entre une maquette habillée et la règle : les points 7, 8, 10 et 14 (le contraste l'emporte), et le point 12 pour les aiguilles.

Vérifié : la suite e2e (93 tests), et un passage automatique sur 63 écrans à 390 px avec les données des tests, sans débordement ni texte sous 4,5 pour 1 hors éléments désactivés. Regardés à l'œil : la connexion, le guide de style, une édition tirée, la page d'un tirage dévoilé. **Pas regardés à l'œil** : le palmarès en images, la liste vue par son lien, les panneaux du bas ouverts, les écrans en anglais et en allemand.

Au passage : `hydrated` (aide des tests e2e) rendait la main avant que Vue ait pris la page ; retirer l'image du logo a suffi à faire perdre le texte tapé trop tôt. Elle attend maintenant le montage.

### Lot 23 bis — les icônes en autocollant

Écrit le 19 novembre 2026. Points à relire :

1. **Les couleurs des listes deviennent celles des personnes** (proposition, vue sur la planche `StyleIcones`). Une liste et une personne de la même teinte ne se distinguent plus que par la forme : ronde, ou carrée et penchée. Cela règle les points 2 et 21 du lot 23.
2. **Les noms des couleurs de liste** dans les dictionnaires (sapin, brique, moutarde, prune, bleu nuit, kraft) ne disent plus ce qu'on voit, comme ceux des personnes (point 18 du lot 23). À décider ensemble.
3. **Sur une carte blanche, le liseré blanc ne se voit pas** : seule l'ombre détache l'icône.
4. **La tuile penchée** : 3 degrés. À redresser si elle gêne dans une ligne.
5. **L'ombre des petites icônes** (moins de 36 px) est plus courte : choisi seul.
6. **Les maquettes refaites n'ont pas été contrôlées à l'œil** : elles sortent du script.
7. **La pluie de fête** est la même toute l'année (proposition). Des flocons n'ont pas de sens pour un tirage d'été : à revoir si le cas se présente. Le dosage (24 flocons, 11 étoiles, 12 confettis dans la maquette) se règle à l'œil.

**Codé le 19 novembre 2026.** Tranché seul :

8. **Les couleurs de la pluie** viennent des teintes des icônes de personne (bords corail, lilas, menthe, ciel, pêche) et du corail des actions. Les deux bleus pâles de la maquette (`#8fc0f4`, `#b5d6f9`) sont rendus par le bord et le fond du ciel.
9. **Les places et les rythmes sont tirés au hasard à chaque ouverture**, dans les bornes de la maquette (durées, dérive, rotation, tailles) ; le dosage est le sien (24 flocons, 11 étoiles, 12 confettis).
10. **Une icône à une taille à part** se demande par `px` (52, 64 et 48 px : la personne d'une liste, sa fiche, le panneau d'envoi) au lieu de classes posées par l'écran, pour que le liseré et l'ombre suivent.
11. **Les tests unitaires de `app/`** n'étaient pas lancés par `pnpm test` (seulement `server`, `shared`, `tests`) : ils le sont maintenant.

Regardés à l'œil : les quatre tailles et l'icône de 26 px sur une carte blanche (guide de style), les tuiles penchées dans les cartes de l'onglet « Listes » (rien de coupé), le panneau de choix d'icône. **Pas regardés à l'œil** : la pluie de fête et les icônes du palmarès en images (le test e2e vérifie que les 47 dessins sont là, derrière le texte, sans appui).

### Correction 19 et lots 24 à 27 — navigation et listes V2

Écrits le 19 novembre 2026. Points à relire :

1. **La famille et les listes tenues à plusieurs** : « ma famille » reste rattachée à un compte. Quand Hugo tient une liste créée par Camille, il y voit les personnes de la liste, mais elles ne s'ajoutent pas à sa propre famille. À décider : une famille commune à ceux qui tiennent des listes ensemble.
2. **« Repartir d'une liste »** propose toutes mes listes, en cours ou passées (proposition).
3. **La ligne bloquée se libère après 30 secondes** sans frappe (proposition).
4. **Le lot 26 dépend de l'offre Cloudflare** : les objets durables à stockage SQLite sont annoncés sur l'offre gratuite depuis avril 2025 ; à vérifier sur le compte avant de coder.
5. **L'ordre conseillé** : Corrections 20 et 21 (petites), Correction 19, lot 24, lot 27, lot 25, lot 26. Le lot 23 (Sorbet) se fait à part, quand rien d'autre n'est en cours.
6. **La personne reliée coche aussi ce qui lui est destiné** : c'est la décision de Julien pour celui qui tient la liste (Correction 20), étendue à elle pour garder une seule règle. À confirmer.
7. **Une idée de « Moi » cochée par moi** dit « Tu l'offres », comme les autres (Correction 21). « Tu te l'offres » serait plus juste : à décider.

**Correction 19, codée le 19 novembre 2026.** Tranché seul :

8. **Les pages où l'on rédige** sont les douze qui ont un champ de texte et un bouton en bas : les sept de la Correction 18, plus « Personnaliser le message » d'un envoi et d'une liste, un texte de la fiche d'une personne, l'adresse email et le cadeau hors liste d'une liste par son lien. Les écrans où l'on choisit dans une longue liste (participants, emails, relance, pronostics) gardent leur bande collée en bas, au-dessus de la barre ; elle ne suit plus le clavier.
9. **Sur « Demander à créer un groupe »**, le bouton est à la fin du contenu, donc sous « Pourquoi une demande ? », pas juste sous le champ.
10. **La barre du bas est aussi sur l'administration, « Mon compte » et le lien d'invitation** d'une personne connectée : « sur tous les écrans ». L'onglet « Tirages » y est actif.
11. **La barre d'une ligne de liste** (« Lien », « Supprimer la ligne », « Terminé ») reste collée en bas tant qu'on écrit, par-dessus la barre « Tirages / Listes » : c'est le lot 24 qui la remplace.
12. **Sur la page d'un tirage, changer de langue par le menu** enregistre toujours la langue du participant, comme le faisait le bouton de langue.
13. **Pas vérifié sur un vrai téléphone** : le clavier qui passe par-dessus le bouton, et le toucher hors du champ qui ferme le clavier (testé à la souris seulement).

### Lot 24 — écrire sur place

Codé le 19 novembre 2026. Tranché seul, à relire :

1. ~~Pendant qu'on écrit, le texte d'une idée reste un champ d'une seule ligne.~~ **Réponse de Julien, 19 novembre 2026 :** le texte long passe à la ligne ; le champ grandit avec son texte. Fait. Et « Supprimer » sous la ligne d'une idée ne sert à rien : on efface le texte, la ligne s'en va. Retiré (il reste sous un cadeau hors liste, qui ne se corrige pas) ; les maquettes `ListeIdee` et `ListeIdeeLienFait` le montrent encore.
2. **Pendant qu'on écrit l'adresse**, le texte de l'idée s'affiche tel quel (il ne se modifie plus), suivi de « : » et du champ ; l'adresse passe à la ligne quand le texte ne lui laisse pas 176 px.
3. **Une adresse tapée sans « https:// »** (« exemple.fr/velo ») est complétée. Ce qui n'est pas une adresse reste dans le champ, avec un message. Quitter la ligne avec une adresse valide dans le champ l'enregistre, comme le texte.
4. **« Retirer le lien » d'une idée qui n'a pas de texte** supprime l'idée (avec la confirmation habituelle si elle est cochée) : une idée sans texte ni lien n'existe pas.
5. **« J'offre autre chose »** : le choix « Dire à Camille que c'est moi » a disparu avec la page, comme dans la maquette (« déjà cochée à mon nom ») ; un cadeau hors liste n'est donc plus jamais anonyme pour celui qui tient la liste. Les cadeaux hors liste anonymes déjà enregistrés le restent.
6. **Un cadeau hors liste déjà dit** garde sa phrase (« Tu offres hors liste : … »), en gras, avec « Supprimer » dessous à la place de « Retirer ». Il ne se corrige pas : on le supprime et on le redit (les routes n'ont que l'ajout et le retrait).
7. **« Tu participes »**, par le lien, est un texte vert mais reste un bouton : il ouvre toujours « Changer ».
8. **La hauteur d'un écran ne suit plus le clavier** (`--keyboard-visible`) : plus rien ne s'y pose depuis la Correction 19 et ce lot.

Regardés à l'œil et comparés aux maquettes : la ligne qu'on écrit, l'adresse en cours, le lien posé, le cadeau hors liste sur place. Pas vérifié sur un vrai téléphone.

Au passage : un test du compte lisait un toast par un texte que le toast porte deux fois (son titre et son annonce pour les lecteurs d'écran) ; il échouait selon le moment. Il vise maintenant le titre.

### Lots 24 bis et 27 bis — publier, une liste sans personne

Écrit le 19 novembre 2026. Points à relire :

1. **Republier redonne le même lien**, sauf si on l'a changé (proposition) : ceux qui l'avaient gardé n'ont rien à refaire.
2. **Une liste dépubliée sort des listes de ceux qui l'avaient ouverte** ; elle y revient si elle est republiée (proposition).
6. **Dépublier sans confirmation**, avec « Annuler » : c'est la demande de Julien (« juste une case »). Les coches ne sont pas perdues, donc l'erreur se rattrape.
3. **« Par email » est retiré** (Julien, 19 novembre 2026) : un seul bouton « Partager », la feuille de partage fait le reste.
4. **Une seule liste, et une partie cachée** pour porter les idées : choix de modèle à confirmer en codant.
5. **Le choix de la forme** n'est modifiable que tant que la liste n'est pas publiée (proposition).
7. **« Personnaliser le message » d'une liste** (question ouverte, 19 novembre 2026) : la maquette garde le lien, mais « Partager » ouvre déjà un message qu'on retouche avant de l'envoyer. Proposition : le supprimer. En attendant la réponse de Julien, garder la page existante.
8. **« Changer de lien »** : la confirmation sur place est une proposition (maquette `ListeChangerLien`).
9. **Ajouter une personne à une liste sans personne déjà partagée** (question ouverte) : le plan dit non (le bloc disparaît au partage) ; la maquette `ListeSansPersonne` montre pourtant une liste partagée avec le bloc. Suivre le plan.
10. **Retirer quelqu'un qui a des idées cochées** : le second appui dit combien de cadeaux seront perdus ; ceux qui les avaient cochés ne sont pas prévenus (proposition ; à revoir avec les nouveautés du lot 28).

### Correction 28

Codée le 20 novembre 2026. Tranché seul, à relire :

1. **« Activé par Camille » nomme celui qui gère la liste**, le premier s'ils sont plusieurs (celui qui l'a créée) : la base ne retient pas qui a activé le partage. À corriger par une colonne si la différence compte.
2. **Le lien n'est plus envoyé à « Aide à écrire » quand le partage est arrêté** : avant, la route le donnait à tous ceux qui tiennent la liste, même arrêté (il est gardé pour être rendu au prochain partage). Testé dans les deux sens.
3. **« Partager », pour « Aide à écrire »** : la feuille de partage du téléphone avec le message tout prêt ; sur un ordinateur, le lien est copié et le bouton dit « Copié » un instant.
4. **À plusieurs, chaque pastille déplie la coche de sa personne**, une seule à la fois ; la ligne se replie quand cette coche est retirée (avant, un seul encart listait tout le monde). La case d'une idée cochée par un autre déplie la première. Ma propre pastille ne se touche pas : je me retire par « Changer ».
5. **« Se joindre » et « Tu participes » restent**, au bout de la rangée de pastilles : les maquettes ne les montrent pas pour celui qui tient la liste, mais sans eux il ne peut plus se joindre depuis le document.
6. **« Offert à plusieurs · au complet » reste** sous les pastilles d'un cadeau fermé ; « Offert à plusieurs » seul a disparu de la ligne écrite par ceux qui tiennent la liste et par une personne reliée (les prénoms d'un cadeau à plusieurs sont visibles de tous). La ligne du visiteur (`VisitorLine`) garde ses icônes et ses prénoms, et prend seulement la pastille du lien.
7. **Une personne reliée ne voit plus de pastille « Anonyme »** sur une idée cochée par quelqu'un d'autre dans sa partie : elle n'a pas à savoir qui, la case barrée suffit.
8. **Pendant qu'on écrit une idée qui a un lien**, la ligne garde « : lien » au bout et « Changer le lien » dessous (`ListeIdeeLienFait`) : la pastille est pour la lecture.
9. **La pastille lilas** prend les jetons du thème (`warning-soft`, `alert-ink`), qui sont les couleurs de la maquette. Un cadeau hors liste porte aussi sa pastille de prénom dessous.
10. **Vérifié à 320 px** : rien ne déborde. Les lignes à fond plein (idée en cours d'écriture, « J'offre autre chose ») débordent de 22 px à gauche ; la ligne teintée « Hugo écrit… » garde son arrondi de 8 px de débord, comme la ligne dépliée garde ses 10 px.
11. **La maquette périmée `ListeEssaiSousCase`** est supprimée du dépôt, dans `maquettes/` et `maquettes-sorbet/`.

### Lot 27 bis, en codant

Codé le 20 novembre 2026. Tranché seul, à relire :

1. **Le modèle tient, avec une nuance.** La partie cachée existe bien (une ligne de `gift_list_people`), mais la base exige qu'une partie appartienne à un proche, et lever cette obligation demande de reconstruire la table. La partie cachée appartient donc à **un proche fictif, « personne »**, un par compte, créé au premier besoin (`family_members.placeholder`, migration `0031_amusing_pete_wisdom`, une colonne). Il n'apparaît nulle part : ni dans « Mes proches », ni dans les pastilles, ni dans les cartes de l'onglet « Listes », ni dans le plafond des proches, et il n'a pas de fiche. Une liste est « sans personne » quand sa seule partie est celle-là : rien d'autre n'est stocké. Les routes, les coches, les cadeaux à plusieurs, l'ordre et le direct ne changent pas.
2. **La pastille « Une personne » ouvre le choix habituel sur place** (les prénoms de mes proches, puis « Quelqu'un d'autre »), au lieu d'ouvrir directement la saisie d'un prénom : sinon on ne pouvait pas donner les idées à un proche déjà connu, ni à « Moi ». La phrase « La liste sera alors rangée par personne… » reste dessous. Cet état n'est pas dans les maquettes.
3. **Sous les pastilles du document vide, une seule phrase** : « Pour un mariage ou une crémaillère, « Une liste sans personne » : les idées, l'une sous l'autre. » La première phrase de la maquette (« Touche un prénom : il s'ajoute… ») n'est pas remise : Julien l'a retirée le 19 novembre 2026.
4. **La pastille n'est proposée que dans un document vide.** La route accepte aussi une liste d'une seule personne (ses idées deviennent celles de la liste), comme le plan le prévoit, mais aucun écran ne le propose : le plan ne veut ni lien ni menu. Avec plusieurs personnes, c'est refusé.
5. **Une fois partagée, la forme ne change plus** dans aucun sens : le bloc « Ajouter quelqu'un » disparaît du document et la route refuse (« arrête le partage pour la ranger par personne »). Le partage arrêté, le bloc revient. La maquette `ListeSansPersonne`, qui montre le bloc sur une liste partagée, n'est pas suivie (point 9 ci-dessus).
6. **La première personne ajoutée garde tout** : les idées, les coches et les cadeaux hors liste déjà dits. Elle n'apporte pas ses idées non offertes de sa dernière liste (elles se mélangeraient à celles de l'événement).
7. **Par le lien, « J'offre autre chose » est un simple lien souligné**, une fois, sous les idées, comme sur la maquette. Les panneaux « Changer » et « Se joindre » ne nomment personne (« Tu l'offres », « Un cadeau à plusieurs »).
8. **La phrase sous le mot d'accueil n'est pas changée** : « La liste de Camille. Tu offres 1 cadeau… », et non « la liste de Camille et Hugo » à côté de la date comme sur la maquette, qui suppose de nommer tous ceux qui tiennent la liste.
9. **Reprendre** : la ligne de « Repartir d'une liste » dit « Sans personne · 3 idées pas encore offertes » ; la liste reprise est sans personne elle aussi. Une liste sans personne et sans nom reste dans l'onglet « Listes » (elle n'est pas vide).
10. **Ce qui manque encore sur l'écran par rapport aux maquettes** vient de la Correction 28, pas de ce lot : les pastilles des prénoms sous l'idée et la pastille lilas du lien.
11. **Pas de liste sans personne dans les données de démonstration** (`pnpm seed:lists`) : à ajouter si Julien veut l'essayer sans la créer à la main.

### Lot 24 bis, en codant

Codé le 19 novembre 2026. Tranché seul, à relire :

1. **Pas de migration** : une liste est partagée tant que `shared_at` est rempli. Arrêter le partage le vide et garde le lien (`share_token`), ce qui redonne le même lien en rallumant. `shared_at` devient donc la date du dernier partage, plus celle du premier.
2. **Le lien d'une liste plus partagée** répond 410 (et non 404) : la page dit « Cette liste n'est plus partagée. » ; un lien remplacé ou inconnu dit toujours « Ce lien ne marche plus… ».
3. **Allumer l'interrupteur déplie la barre**, pour montrer le lien tout de suite. Ensuite elle est repliée à chaque ouverture du document.
4. ~~Interrupteur grisé, avec la raison écrite sous la barre.~~ **Réponse de Julien, 19 novembre 2026 :** la raison n'apparaît qu'en erreur, quand on essaie de partager. L'interrupteur n'est donc plus grisé : touché alors qu'il manque un nom ou une personne, il reste éteint et la barre dit en rouge ce qui manque, jusqu'à ce que ce soit là. Fait.
5. **« Annuler » après « Retirer de la liste »** : la personne disparaît de l'écran tout de suite, mais le serveur n'est prévenu qu'à la fin du message (6 secondes) ou en quittant le document. « Annuler » ne perd donc rien, ni les idées ni les coches. Si l'onglet est fermé dans ces 6 secondes, la personne n'est pas retirée.
6. **Le second appui** se fait dans le menu « ⋯ » lui-même : il reste ouvert et affiche « 2 cadeaux déjà prévus seront perdus. », « Retirer », « Annuler ». Les cadeaux hors liste comptent.
7. **« Copier » ne marchait pas à l'essai** : sur un téléphone qui ouvre le serveur de développement par le wifi (http), le navigateur n'a pas de presse-papiers. « Copier » copie maintenant aussi dans ce cas (`copyText`, par un champ sélectionné hors de l'écran), répond « Copié » dans le bouton pendant deux secondes, et dit quand il n'y arrive pas. Même cause pour « Partager » : la feuille de partage n'existe qu'en https, donc le bouton n'apparaît pas en développement par le wifi ; il apparaît en production.
8. **Sur l'onglet « Listes »**, une liste que je tiens et qui n'est pas partagée porte « Pas partagée » (à la place de « Brouillon »).
9. **La touche d'effacement** : la touche « Suppr » d'un ordinateur fait comme elle. Une ligne vide qui garde un lien ne part pas ainsi : « Retirer le lien » d'abord.
10. **Une liste passée dont on arrête le partage** revient dans « À venir », comme toute liste pas partagée.
12. **L'icône et le prénom d'une personne dans le document** (demandé par Julien le 19 novembre 2026, après coup) : « sauf s'il est relié à un compte » ne vaut que pour le prénom, et ne concerne aujourd'hui que « Moi » (relier une personne à un compte, c'est le lot 25, qui devra reprendre cette règle). L'icône de « Moi » se change ici comme les autres. Sur la fiche de « Moi », prénom et icône se changent toujours.
11. **Les maquettes périmées ne sont pas supprimées** : ce sont des fichiers de Julien pas encore commités, je n'y ai pas touché.

### Correction 24

Codée le 19 novembre 2026. Tranché seul, à relire :

1. **Le refus « reliée à un compte qui tient une de mes listes avec moi »** est dans la fonction pure (`memberRemoval`, testée), mais ne peut pas arriver aujourd'hui : relier un proche à un compte et tenir une liste à plusieurs, c'est le lot 25. La route passe toujours « non » ; le lot 25 devra y brancher la vraie réponse.
2. **L'adresse email d'un proche** : rien à coder. La fiche n'a pas de champ d'adresse aujourd'hui (il arrive avec le lot 25) ; aucun email ne part vers un proche.
3. **Les données (lot 36)** : supprimer un proche efface vraiment sa ligne, ses places sur mes listes, ses idées, les coches et les cadeaux hors liste (rien n'est gardé). « Mes données » n'existe pas encore : le compte de mes proches y sera à ajouter avec le lot 36.
4. **« Annuler » après la croix** : comme pour « Retirer de cette liste », le proche disparaît tout de suite de l'écran et le serveur n'est prévenu qu'à la fin du message (6 secondes) ou en quittant l'écran. Onglet fermé avant : il n'est pas supprimé.
5. **Depuis la fiche, « Supprimer de mes proches » mène toujours à la page de confirmation**, même pour quelqu'un qui n'est sur aucune liste (la page dit alors seulement que sa fiche est effacée et que c'est définitif). La suppression immédiate avec « Annuler » est réservée à la croix.
6. **La phrase de ce qui part** est en trois phrases courtes plutôt qu'une (« Hugo est sur 1 liste, « Noël 2026 ». Ses 4 idées en sortent. 1 cadeau déjà prévu est perdu. ») et dit le prénom plutôt que « Il » : elle tient ainsi dans les trois langues et pour une femme.
7. **« Ajouter quelqu'un » sur la page « Mes proches »** a demandé une route de plus, `POST /api/family` : jusque-là un proche ne se créait qu'en l'ajoutant à une liste.
8. **Le menu « ⋯ » de « Moi »** n'a pas « Supprimer de mes proches », et sa fiche non plus.
9. **En anglais « My people », en allemand « Meine Leute »** pour « Mes proches » : à relire.
10. ~~« Ton mot pour la famille » garde son nom.~~ **Réponse de Julien, 19 novembre 2026 :** plus aucun « famille » dans les textes des listes. Fait dans les trois langues : « Ton mot d'accueil », « Ajouter un mot d'accueil », « les idées de cadeaux de tes proches », « Ce qu'on demande toujours », « les Secret Santa entre proches ». En anglais « Your welcome note », « your people's gift ideas », « What people always ask », « Secret Santas with those close to you » ; en allemand « Dein Willkommenswort », « deiner Leute », « Was man immer fragt », « Wichteln unter Nahestehenden » : à relire. Rien d'autre n'avait échappé dans le fichier ; le mot reste dans des commentaires du code, pas à l'écran.
11. **« Une liste sans personne »**, visible dans `ProcheSupprime`, est le lot 27 bis : pas fait ici.
14. **Les deux lignes d'aide sous les pastilles sont retirées** (Julien, 19 novembre 2026 : c'est évident) : « La croix supprime un proche qui n'est sur aucune liste. » et « Touche un prénom : il s'ajoute à la liste, avec ses idées qui n'ont pas été offertes la dernière fois. » Il reste « Tous tes proches sont déjà sur la liste. » quand c'est le cas, et le lien « Mes proches ». Les maquettes `ListeNouvelle` et `ProcheSupprime` la montrent encore.

Les deux lignes du lot 24 bis faites dans la même séance :

12. ~~Le crayon : pas sur « Moi », dont l'icône était une copie qui ne suivait pas « Mon compte ».~~ **Réponse de Julien, 19 novembre 2026 :** l'icône de « Moi » suit celle du compte, et la changer change celle du compte. Fait : les deux sont enregistrées ensemble, d'où qu'on la change (`setSelfAvatar`), et une ancienne copie différente est réalignée sur le compte à la prochaine ouverture d'une liste ou de « Mes proches ». « Moi » a donc de nouveau son crayon, dans le document et sur sa fiche. Le prénom de « Moi », lui, ne suit pas celui du compte (pas demandé) et ne se change toujours pas dans le document.
13. **La barre collée** : « Partage par lien » reste sous la barre du haut, avec une ombre légère, et se replie dès qu'on fait défiler de plus de 24 px. **« Mode anonyme » n'existe pas encore** (lot 27 ter) : rien à coller sur la liste ouverte par son lien ; le lot 27 ter devra reprendre la même règle. Une ligne qu'on écrit garde une marge sous la barre quand le navigateur la ramène à l'écran.

### Correction 23

Codée le 19 novembre 2026. Tranché seul, à relire :

1. **`Strict-Transport-Security` sans les sous-domaines** : un an (`max-age=31536000`), sans `includeSubDomains`, faute de savoir si tous les sous-domaines de `under-the-tree.party` répondent en HTTPS. À ajouter le jour où c'est sûr.
2. **Le refus d'une origine étrangère** (`server/middleware/origin.ts`, règle `isForeignWrite` testée) : une requête qui modifie est refusée (403) quand son en-tête `Origin` n'est ni l'adresse où elle arrive ni l'adresse publique de l'application. Une requête **sans** en-tête `Origin` passe : les scripts et les tests n'en envoient pas, et le cookie de session (`SameSite=Lax`) ne part pas avec une requête venue d'ailleurs.
3. **`?next=` après connexion** : vérifié, rien à changer. `safeNext` (`server/utils/invite.ts`, déjà testée) n'accepte qu'un chemin interne, côté page comme côté route.
4. **Un lien de liste inconnu** répond une erreur avec `no-cache` et non `no-store` : il n'y a rien de personnel dans cette réponse. Le test vérifie donc les en-têtes sur une vraie liste partagée.
5. **L'audit des dépendances** : `pnpm audit --prod --audit-level high` dans `ci.yml` (le projet est en pnpm, pas npm). Aujourd'hui il passe : 3 failles connues, 1 faible et 2 modérées, aucune haute. Dependabot : `.github/dependabot.yml`, une fois par semaine, les mises à jour mineures groupées ; il faut que Dependabot soit activé sur le dépôt GitHub pour qu'il ouvre des demandes.
6. **Le test** est ajouté à `tests/e2e/security.spec.ts`, qui existait déjà.
7. **Reste à Julien** : la double authentification sur Cloudflare, GitHub, Resend et la boîte email du super-admin.

### Lot 24 ter — réordonner en glissant

Écrit le 19 novembre 2026. Points à relire :

1. **L'appui long plutôt qu'une poignée toujours visible** sur téléphone (proposition) : la ligne reste nue, comme dans un document. Si l'appui long se découvre mal à l'essai, afficher la poignée sur la ligne qu'on est en train de modifier.
2. **Une bibliothèque ou du code maison** : à décider en codant. Le critère est le téléphone ; si une bibliothèque est ajoutée, écrire pourquoi (Correction 23 : aucune dépendance sans raison).
3. **Changer une idée de personne en la glissant** : proposé d'office. À retirer si c'est une source d'erreurs.
4. **Une liste sans personne** (lot 27 bis) : seules les idées se déplacent.

Codé le 19 novembre 2026. Tranché seul, à relire :

5. **Du code maison, aucune dépendance ajoutée** (`app/composables/useListDrag.ts`, environ 250 lignes). Les bibliothèques de glisser gèrent mal le mélange « appui long sur téléphone, appui court qui garde son rôle, champ de texte dans la ligne » ; ici le besoin est petit (une colonne, des lignes) et le critère est le téléphone. Événements tactiles pour le doigt, événements souris pour la poignée.
6. **L'appui long : 350 ms**, annulé si le doigt glisse de plus de 10 px (c'est un défilement). Une vibration de 12 ms là où le navigateur le permet (Android ; pas sur iPhone, où Safari ne vibre pas).
7. **Pas de sélection de texte ni de menu du navigateur** : tout le document de la liste est en `user-select: none` et `-webkit-touch-callout: none` ; seuls les champs où l'on écrit gardent la sélection. Conséquence : dans le document, on ne peut plus sélectionner le texte d'une idée pour le copier sans entrer dans la ligne. Le menu contextuel est annulé pendant l'appui.
8. **Le clavier ne s'ouvre pas** : le lâcher du doigt est annulé, aucun appui ne suit. Une ligne qu'on est en train d'écrire ne se soulève pas par son champ (on y sélectionne du texte) ; ses voisines, si.
9. **Le défilement** : une fois la ligne soulevée, la page ne défile plus sous le doigt ; elle défile seule à moins de 72 px du haut ou du bas, plus vite près du bord.
10. **Lâcher hors de la liste** : au-delà de 48 px au-dessus ou en dessous des personnes, rien ne bouge. Échap aussi.
11. **« Annuler » pendant 5 secondes** après un déplacement, dans le message « {Texte} déplacé ».
12. **L'ordre est enregistré en entier** (`PUT /api/lists/[id]/order`), seules les lignes déplacées sont écrites. Si la liste a changé entre-temps (une idée ajoutée ou supprimée par quelqu'un d'autre), rien ne bouge et l'écran dit « La liste a changé entre-temps : réessaie. »
13. **Les cadeaux hors liste ne se déplacent pas** (remarque de Julien à l'essai) : ce ne sont pas des idées, ils n'ont pas de place enregistrée et restent après les idées de leur personne. Les ranger entre eux demanderait une migration ; les changer de personne changerait à qui le cadeau est destiné. **Question** : faut-il pouvoir les ranger ?
14. **`Alt` + flèche au bout d'une personne** fait passer l'idée chez la personne du dessus (à la fin) ou du dessous (au début).
15. **Sur ordinateur, la poignée est à gauche de la ligne**, dans le retrait des idées ; pas de poignée pour une personne : « Monter » et « Descendre » dans son menu « ⋯ », ou l'appui long sur un écran tactile.
16. **La poignée dans la carte soulevée** est à droite, comme dans la maquette ; les autres lignes s'écartent de la hauteur du trait rouge seulement (4 px), pas d'une ligne entière.
17. **« En direct »** : pas fait, le lot 26 n'existe pas. À reprendre avec lui.
18. **Retour de Julien pendant le lot** : « ça fonctionne bien sur mobile ». La ligne « Essayé sur un vrai téléphone » reste à cocher par lui, iPhone et Android.

### Lot 25

Codé le 19 novembre 2026. Tranché seul, à relire :

1. **Chacun garde ses propres proches.** Une liste tenue à plusieurs peut porter des personnes venues des proches de l'un ou de l'autre : dans « Ajouter quelqu'un », chacun voit ses proches à lui. La fiche d'une personne de la liste (ses tailles, ses goûts) s'ouvre et se modifie pour tous ceux qui tiennent la liste ; la supprimer de « Mes proches » et la relier à son compte restent à celui dont elle est le proche.
2. **Une invitation est acceptée en venant** : la liste rejoint celles de l'invité dès qu'il ouvre ses listes, ou la liste elle-même par le lien de l'email, connecté avec l'adresse invitée. Pas de bouton « Accepter ».
3. **« Peut refuser »** : l'email dit d'ignorer le message ; une fois connecté, l'invité peut quitter la liste par « Ne plus tenir cette liste », sur sa propre ligne de « Ceux qui tiennent la liste ». Ce bouton n'est pas dans la maquette `ListeTeneurs` (elle ne montre que « C'est toi ») : il traduit « le dernier ne peut pas se retirer », qui suppose qu'on peut se retirer soi-même. Les boutons « Retirer » disparaissent quand il ne reste qu'une personne.
4. **Retirer est immédiat, sans confirmation ni « Annuler »** : on peut réinviter. À revoir si ça surprend.
5. **Celui qui a créé la liste peut être retiré** comme les autres. La liste garde ses personnes, y compris celles qui venaient de ses proches.
6. **L'email d'invitation** part dans la langue de l'invité s'il a déjà un compte, sinon dans celle de celui qui invite. Si l'envoi échoue, l'invitation reste (elle se voit dans la page, et marchera à la connexion). **Il passera par les contrôles des lots 35 et 36 quand ils existeront** (adresses bloquées, pied d'email).
7. **Relier un proche n'envoie aucun email.** L'adresse le relie tout de suite si un compte existe à cette adresse ; sinon la fiche dit « Pas encore de compte à cette adresse » et le lien se fait quand ce compte vient. **Question** : faut-il le prévenir par email ?
8. **Une personne reliée prend l'icône de son compte**, et la garde : ni son prénom ni son icône ne se changent plus par celui qui tient la liste (ni crayon, ni prénom à toucher), comme pour « Moi ». Son prénom, lui, reste celui que j'ai écrit : il ne suit pas son compte.
9. **La personne reliée voit la liste par son lien**, avec sa section en premier et « C'est toi » ; la liste est dans ses listes dès qu'elle est partagée, avant même de l'avoir ouverte. Une liste pas partagée ne lui apparaît pas. Dans sa section : ses idées à écrire, pas de « J'offre autre chose », pas de lien « ses goûts ».
10. **Quelqu'un qui tient la liste et y figure** est d'abord quelqu'un qui tient la liste : il voit tout, y compris qui lui offre quoi (README 22.20).
11. **Par le lien, « La liste de Camille »** nomme le premier de ceux qui la tiennent (celui qui l'a créée tant qu'il est là), pas tous.
12. **La présence** (« Il est là en ce moment », le point vert) est le lot 26 : la ligne sous la barre dit seulement « Tu tiens cette liste avec Hugo. » Seul, elle dit « Tenir cette liste à plusieurs » : cette entrée n'est dans aucune maquette.
13. **Supprimer un proche relié** est refusé tant que son compte tient une liste avec moi (la règle de la Correction 24, maintenant branchée) : le bouton « Supprimer de mes proches » n'est alors pas affiché.
14. **L'adresse d'un proche** n'est montrée qu'à ceux qui tiennent une liste où il figure, et à moi. Elle ne part jamais vers la page d'une liste ouverte par son lien (testé).
15. **Pas regardé à l'œil** : la vue de la personne reliée (`ListeVueReliee`) ; vérifiée par le test seulement. La page « Ceux qui tiennent la liste » a été comparée à sa maquette.

### Lot 25 bis — niveaux, proches proposés, invitation

Écrit et validé par Julien le 19 novembre 2026 au soir. Ce qui est décidé : deux niveaux qui ne diffèrent que par la gestion ; inviter d'une pastille ; la page d'invitation avec ses boutons « Accepter » ; l'invitation qui vaut 7 jours ; le refus visible ; le mot sur l'application. Points à relire :

1. **Quelqu'un qui tient la liste et y figure voit ce qu'on lui offre**, quel que soit son niveau, comme aujourd'hui (lot 25, point 10). **Question pour Julien, sans réponse** : faut-il lui cacher les prénoms dans sa propre section seulement ? Sinon, inviter son conjoint à tenir la liste de la famille lui dévoile ses cadeaux. Ne rien changer tant qu'il n'a pas répondu.
2. **« Aider à écrire » par défaut** à l'invitation (proposition) : on donne le moins de pouvoir, et on monte si besoin.
3. **7 jours pour une invitation, 30 jours avant d'effacer une ligne expirée ou refusée** : deux chiffres posés seul.
4. **Proposer un proche « qui a un compte »** apprend que cette personne a un compte : la fiche d'un proche le dit déjà.
5. **Créer un compte par le lien d'invitation** : le lien vaut une connexion. Transféré à quelqu'un d'autre, il lui donnerait le compte, comme tout lien de connexion : d'où l'usage unique, les 7 jours, et la ligne « Tu n'es pas Tonton ? ».
6. **Un email de plus vers une adresse saisie à la main** : il passera par les contrôles des lots 35 et 38 A. « Renvoyer » compte comme un envoi.
7. **« Décocher pour quelqu'un » (Correction 25)** est ouvert aux deux niveaux, puisque les deux voient qui offre quoi.
8. **Les liens « Signaler » et « Ne plus recevoir d'emails »** de la page et de l'email n'existent qu'avec les lots 39 et 35 : ne pas les afficher avant.

**Codé le 19 novembre 2026.** Tranché seul en codant, à relire :

9. **« Aide à écrire » change aussi le nom, la date, l'icône et le mot de la liste**, et son message : le lot ne réserve à « Gère la liste » que partager, changer de lien, inviter, changer un niveau, retirer quelqu'un et supprimer.
10. **La barre « Partage par lien », pour « Aide à écrire »** : elle reste affichée, l'interrupteur grisé, avec « Ceux qui gèrent la liste décident du partage. » Le lien ne s'y déplie pas : il ne le copie pas d'ici. Aucune maquette ne le montre.
11. **« Aide à écrire » peut partir de lui-même** (« Ne plus tenir cette liste », dans le menu de sa propre ligne) ; il ne retire personne d'autre. Le seul qui gère n'a pas de menu sur sa ligne : il ne peut ni partir ni baisser son niveau. Les invitations se voient pour les deux niveaux, adresses comprises, comme dans le lot 25.
12. **Une invitation en attente s'annule en touchant son niveau** (« Annuler l'invitation ») : la maquette ne montre que le niveau sur cette ligne. Son niveau ne se change pas : on annule et on réinvite. Une ligne expirée n'a que « Renvoyer » ; elle s'efface d'elle-même au bout de 30 jours.
13. **Les lignes de plus de 30 jours s'effacent à la lecture** de la page « Ceux qui tiennent la liste », pas par une tâche planifiée. Une invitation acceptée garde aussi sa ligne 30 jours, cachée, pour que son lien dise « Tu as déjà accepté cette invitation ».
14. **Une invitation annulée ou remplacée** : son lien dit « Ce lien d'invitation ne marche plus. », sans nommer personne.
15. **« avec elle »** (maquettes) : l'application ne connaît pas le genre. La page dit « Tenir la liste « Noël 2026 » avec Camille », l'email « à tenir à ses côtés ». De même, la ligne en attente garde « Invitée le… » de la maquette, lu comme « invitation envoyée ».
16. **Quelqu'un d'invité est nommé comme je l'ai nommé dans mes proches**, avec son icône ; sinon par son adresse. Rien n'est enregistré pour ça : c'est relu à chaque fois, et chacun de ceux qui gèrent voit ses propres prénoms.
17. **La phrase sur les règles d'usage n'est pas affichée** sur la page d'invitation : la page « Les règles d'usage » est du lot 39, « tes données, en clair » du lot 36. À ajouter avec eux, comme « Signaler » et « Ne plus recevoir d'emails ». L'email n'a pas non plus de pied : aucun email de l'application n'en a avant le lot 35.
18. **Accepter avec un compte ouvre une session sur ce compte**, même si le navigateur était connecté à un autre : c'est le lien de cette adresse. Un compte désactivé est refusé comme un lien usé.
19. **La langue du compte créé par l'invitation** est celle de la page au moment d'accepter ; l'email part dans la langue de l'invité s'il a un compte, sinon dans celle de celui qui invite (lot 25).
20. **« Renvoyer » n'existe que pour une invitation expirée** : une invitation en attente a déjà son email. Les invitations d'avant ce lot passent à « Gère la liste » (elles étaient entre égaux) et à 7 jours depuis leur envoi ; sans lien, elles ne s'acceptent qu'en venant.
21. **La phrase « Ceux qui tiennent la liste voient tout, y compris ce qu'on leur offre s'ils y figurent. »** reste en bas de la page, bien qu'elle ne soit plus dans la maquette : elle répond à la question du point 1 tant que Julien n'a pas tranché.
23. **Repris sur les maquettes après le retour de Julien** (« tu n'es pas iso avec la maquette ») : la page d'invitation (la tuile de la liste, la pastille « Tonton, Camille t'invite », le titre « Tenir la liste… », les pastilles vertes et corail, « Non merci » en bouton bordé, pas de carte) et « Ceux qui tiennent la liste » (le niveau en pastille à toucher, en étiquette quand il ne se touche pas ; « A refusé » et « Invitation expirée » en gras corail ; le menu avec la coche à gauche). **Restent différents, parce que le système de design de l'application le veut ainsi** : les boutons et les champs sont en pilule (16 px d'arrondi dans les maquettes), le bouton radio est celui du navigateur à la couleur de l'application.
22. **Pas testé de bout en bout** : l'expiration (le temps ne passe pas dans les tests `e2e`) ; elle l'est par les tests des fonctions pures. « Là en ce moment » (maquettes) est le lot 26.

### Correction 25 — décocher pour quelqu'un

Codée le 19 novembre 2026. Tranché seul, à relire :

1. **Rien ne part vers le serveur avant la fin de « Annuler »** (6 secondes, comme pour « Retirer de la liste ») : c'est ce qui permet de remettre la coche exactement comme elle était, même anonyme, sans que celui qui tient la liste apprenne qui c'était. Pendant ces 6 secondes, les autres voient encore l'idée cochée. Si on ferme l'onglet ou recharge la page pendant ce temps, la coche reste ; changer de page dans l'application l'envoie.
2. **La phrase « 2 cadeaux déjà prévus »** en haut du document ne baisse qu'une fois la coche vraiment retirée, 6 secondes après.
3. **« Annuler » est le message habituel de l'application** (carte blanche, bouton rouge), pas la barre sombre de `ListeDecocheFait` : tous les « Annuler » de l'application sont ainsi.
4. **Une coche est désignée par son propre identifiant**, qui ne dit rien de son auteur : une coche anonyme part comme les autres. Le bandeau d'une coche anonyme ne reçoit ni prénom ni date du serveur.
5. **Un cadeau à plusieurs** : une ligne par personne, « Mamie, le 12 novembre » et « Retirer » ; ma propre coche n'y est pas (elle garde « Changer »). Le bandeau reste déplié après un « Retirer », pour enchaîner. Si celui qui avait proposé le cadeau est retiré, le suivant le mène, et « au complet » est perdu, comme quand il part de lui-même.
6. **Les deux niveaux décochent** (« Gère la liste » et « Aide à écrire »), comme prévu au lot 25 bis. La personne reliée et le visiteur, non.
8. **La case déplie aussi le bandeau** (retour de Julien, 19 novembre 2026 : « je ne peux pas le décocher ») : toucher la case d'une idée cochée par quelqu'un d'autre fait comme toucher son prénom. Elle ne décoche pas d'elle-même.
9. **Un cadeau hors liste ne se décoche pas par ceux qui tiennent la liste** (tranché par Julien le 19 novembre 2026) : seul celui qui l'a ajouté le retire. Le toucher déplie une notice qui le dit : « Ce cadeau n'est pas une idée de ta liste : Tonton l'a ajouté de son côté, et lui seul peut le retirer. » (« quelqu'un » pour un anonyme).
10. **La barre sombre « … · Annuler »** des maquettes (`ListeDecocheFait`, `ListePersonneRetiree`, `ProcheSupprime`, `ListePartageArrete`) remplace le message blanc à bouton rouge, pour tous les « Annuler » des listes (retour de Julien : « tu n'as pas fait le même que les maquettes »). Le point 3 ci-dessus ne vaut donc plus. Le reste des messages de l'application est la Correction 26.
7. **La nouveauté pour celui qu'on décoche** attend le lot 28. Aujourd'hui il le voit seulement en rouvrant la liste.

### Correction 26 — les messages après une action

Codée le 19 novembre 2026. Tranché seul, à relire :

1. **Les coins font 18 px**, comme dans `StyleMessages` et les quatre maquettes en situation ; la ligne du plan disait 14 px.
2. **Plus d'icône propre à chaque message** : « copié », « email envoyé » et les autres avaient chacun la leur ; tous ont maintenant la même pastille verte à coche. Une erreur a la pastille corail à croix.
3. **Une erreur reste jusqu'à ce qu'on la ferme**, comme demandé ; mais comme il n'y a qu'un message à la fois, le message suivant la remplace.
4. **Le texte des erreurs n'a pas été réécrit** : ce sont les phrases existantes (`useErrorMessage`), avec leur point, en titre, sans ligne « ce qu'il faut faire » séparée. Les réécrire une par une en « titre + quoi faire » est un travail de textes à part. Les messages « c'est fait » étaient déjà au passé et sans point dans les trois langues.
5. **Clavier ouvert** (vu avec Julien le 19 novembre 2026) : le message est en bas, centré, au-dessus de la barre d'onglets ; tant que le clavier est ouvert, il passe en haut, sous la barre du titre. En bas, le clavier le cacherait ; juste au-dessus du clavier, il recouvrirait la ligne qu'on écrit. **Pas vérifiable par les tests** (ils n'ont pas de clavier à l'écran) : à regarder sur iPhone et Android.
6. **Lecteurs d'écran** : c'est le composant de Nuxt UI qui annonce ; une erreur est annoncée tout de suite (`role="alert"`, testé), les autres poliment. Le temps s'arrête au survol et au toucher, et les animations suivent « réduire les animations » : c'est le composant qui le fait, pas vérifié par un test.
7. **« Déplacé · Annuler »** (lot 24 ter) garde ses 5 secondes ; les autres « Annuler » en ont 6.
8. **Le « Copié » de la barre de partage** reste dans son bouton (2 secondes) : ce n'est pas un message passager.
9. **Sur ordinateur** : centré en bas, 420 px de large, vérifié sur capture.
10. **« C'est fait » ne chasse pas un « Annuler »** (vu avec Julien) : un message qui dit seulement que c'est fait attend la fin d'un « Annuler » affiché, au lieu de le remplacer et de valider l'action avant l'heure. Une erreur, elle, s'affiche tout de suite et le remplace. Un second « Annuler » remplace le premier, dont l'action est alors validée.
11. **Lecteurs d'écran** : seule une erreur interrompt (`role="alert"`) ; les deux autres sortes sont dites poliment. Avant, le composant annonçait tout comme une alerte.
12. **Le contenu d'un message est centré dans la hauteur du bandeau** (retour de Julien, 19 novembre 2026) : un message d'une seule ligne était collé en haut.

### Correction 27 — la fiche d'un proche

Écrit le 19 novembre 2026 au soir. Points à relire :

1. **Une page par champ** : choisi par Julien, contre un premier dessin où l'on écrivait directement dans la fiche.
2. **La règle du README 23.3 se précise** : « un seul champ court » restait permis dans un panneau. Désormais un panneau ne sert qu'à choisir et à confirmer ; toute saisie, même d'un mot, a sa page.
3. **La grille des pointures** va de 16 à 50, pointures européennes, sans demi-pointure (proposition). L'application est en français, anglais et allemand : mêmes pointures dans les trois langues.
4. **Plusieurs pointures, sans plafond écrit** : Julien a dit « la ou les pointures ». Au-delà de trois, c'est sans doute une erreur : à voir en essayant.
5. **La date de naissance d'un proche** est une donnée sur quelqu'un d'autre, souvent un enfant : facultative ; ceux qui ouvrent la liste ne voient que l'âge.
6. **Plus de ligne « qui verra ce que j'écris » sur ces pages** : retirée à la demande de Julien, alors que la règle du README 23.3 et le lot 36 la demandent sous tout champ de donnée personnelle. À trancher avec lui au lot 36 : soit ces pages restent une exception, soit l'information va ailleurs (« Tes données, en clair » le dit déjà pour toute l'application).

**Codée le 19 novembre 2026.** Tranché seul en codant, à relire :

7. **Quatre adresses** : `/famille/[id]/naissance`, `/taille`, `/pointure`, `/adresse`, sur un gabarit commun (`ListsMemberFieldPage`).
8. **Les trois listes de la date sont celles du téléphone** (`<select>` natif) : sur iPhone et Android, c'est la roulette ou la liste du système, plus sûre au doigt qu'une liste dessinée. Elles commencent vides (« — ») pour une personne sans date.
9. **Une date à venir ne se valide pas** : « Valider » reste grisé. La liste des années commence à l'année en cours.
10. **Les champs et les listes sont en pilule**, comme tous ceux de l'application ; les maquettes ont 16 px d'arrondi (même écart qu'au lot 25 bis).
11. **La pointure est enregistrée avec le mot de celui qui l'écrit** (« 30 ou 31 »), et **affichée avec le mot de celui qui lit** (« 30 or 31 » en anglais) partout : la fiche, la liste, la page par le lien. Une pointure écrite à la main avant la grille (« 30,5 ») s'affiche telle quelle, en haut de la grille, tant qu'on n'en choisit pas une.
12. **« Tout effacer » et « Effacer la date » enregistrent tout de suite** et ramènent à la fiche, sans passer par « Valider ».
13. **La taille vidée puis validée est effacée** ; pas de lien « Effacer » sur cette page, la maquette n'en a pas.
14. **La page de l'adresse, une fois une adresse donnée** : l'adresse, « Relié à son compte » ou « Pas encore de compte à cette adresse », et « Ne plus relier ». Pas de champ : pour changer d'adresse, on arrête de relier puis on en donne une autre. La phrase « Sur tes listes, Hugo peut écrire ses propres idées… » de `ListePersonneCompte` n'y est pas (aucune phrase d'aide) : **Tranché par Julien le 19 novembre 2026 : on dit à quoi sert l'adresse.** Une phrase sous le champ (« Facultatif. Avec un compte à cette adresse, Léo pourra écrire ses propres idées sur tes listes. »), une autre une fois relié (« Sur tes listes, Léo peut écrire ses propres idées, sans voir qui offre quoi. »). C'est la seule phrase d'aide de ces quatre pages.
15. **Pour « Moi »**, les titres disent « Ma date de naissance », « Ma ou mes pointures », « Ma taille de vêtements ».
16. **Les valeurs vides** disent « Aucune » pour les trois infos pratiques et l'adresse ; les trois textes de « Ses goûts » gardent « Rien ».
17. **Trouvé par une capture, corrigé** : en ouvrant directement la page des pointures, celles déjà enregistrées n'étaient pas cochées (la page écrite par le serveur et celle du navigateur ne disaient pas la même chose). Les champs se remplissent maintenant une fois la page dans le navigateur ; un test le vérifie.
18. **Les autres écrans qui écrivent une valeur courte dans un panneau** (`UiTextSheet`), laissés tels quels comme demandé : le prénom et le nom dans « Mon compte » (`compte.vue`) ; le nom de famille d'une personne d'un groupe (`admin/[slug]/personnes/[id].vue`) ; le budget d'un tirage (`EditionRuleRows`). Et ceux qui choisissent une date dans un calendrier (`AdminDateSheet`) : la date de la fête (`PartyDateSheet`), la date d'une liste (`listes/[id]/index.vue`), la date limite d'un lien d'invitation (`admin/[slug]/invitation/index.vue`). `UiTextSheet` et `AdminDateSheet` servent donc encore : ils ne sont pas supprimés.

### Lot 27 — reprendre une liste

Codé le 19 novembre 2026. Tranché seul, à relire :

1. **On ne repart d'une liste que dans un brouillon vide** (sans personne, jamais partagé) : rien de déjà écrit n'est mélangé avec ce qui arrive. Le bloc « Repartir d'une liste » disparaît dès qu'il y a quelqu'un.
2. **Le bloc propose les cinq listes les plus récentes** que je tiens et qui ont quelqu'un, brouillons et listes sans nom compris (« Liste sans nom »). La maquette en montre deux.
3. **Le mot d'accueil** n'est repris que si je l'avais écrit ; le texte de départ, lui, revient tout seul. Un mot que j'avais effacé reste effacé.
4. **Les personnes sont reprises telles qu'elles sont** dans mes proches (ou ceux d'un autre qui tient la liste) : même fiche, mêmes goûts. Quelqu'un sans idée restante vient quand même.
5. **« Reprendre cette liste »** n'est que sur le document d'une liste passée (partagée, date dépassée), sous le mot d'accueil. Elle crée un brouillon et l'ouvre. Rien sur la carte de l'onglet « Listes ».
6. **La marque est l'icône ↺ grise** au bout du texte ; elle disparaît dès que l'idée est modifiée (texte ou lien), et pour toutes au premier partage, avec la phrase du haut. La liste d'origine n'est plus nommée ensuite : rien n'est gardé.
7. **« Toi seul vois cette marque »** est le texte de la maquette ; en vrai, tous ceux qui tiennent la liste la voient (les deux niveaux). Un visiteur et une personne reliée ne la voient jamais.
8. **Si la liste d'origine est supprimée** avant le partage, la phrase dit « Reprise d'une autre liste. »
9. **Seul celui qui tient l'ancienne liste** peut en repartir (les deux niveaux). Y figurer ou l'avoir ouverte par son lien ne suffit pas.
10. **Quand on ajoute ensuite un proche à la main**, la règle d'avant s'applique toujours : il arrive avec ses idées non offertes de sa dernière liste, sans marque.
11. **Les plafonds du lot 38 A** valent pour la liste créée (100 listes par compte) ; la reprise elle-même copie au plus ce que l'ancienne liste contenait.

### Supprimer une liste

Demandé par Julien le 19 novembre 2026 au soir (« on ne peut pas supprimer une liste ? ») : seul un brouillon vide disparaissait de lui-même. Codé le même soir, sans maquette ni migration, sur le modèle de « Supprimer de mes proches » (Correction 24). À relire :

1. **Une ligne rouge « Supprimer la liste » tout en bas du document**, sous « Ajouter quelqu'un », pour ceux qui gèrent la liste seulement (« Aide à écrire » ne la voit pas, et la route le refuse).
2. **Elle mène à une page** `/listes/[id]/supprimer` qui dit ce qui est perdu avant de supprimer : les idées, les cadeaux déjà prévus (« ceux qui les avaient cochés ne sont pas prévenus »), le lien, « Elle disparaît aussi pour Hugo », et que les personnes restent dans « Mes proches ». Pas de phrase à recopier.
3. **Pas de « Annuler » après coup** : c'est définitif, comme la suppression d'un proche. La confirmation est donc avant, sur la page.
4. **Personne n'est prévenu** : ni ceux qui avaient coché, ni les autres qui tiennent la liste. À reprendre avec les nouveautés (lot 28).
5. **Une liste reprise de celle-ci** (lot 27) dit alors « Reprise d'une autre liste. »
6. **Pas de suppression depuis l'onglet « Listes »** : seulement depuis le document.

### Lot 26 — en direct

Codé le 20 novembre 2026, puis repris le même jour après l'essai de Julien (« je voulais du temps réel », « il manque plein de choses »). Vérifié, tranché seul, laissé de côté :

1. **L'offre gratuite de Cloudflare le permet** (documentation lue le 19 novembre 2026) : les objets durables y sont disponibles à condition d'être à stockage SQLite (`new_sqlite_classes`). Limites par jour : 100 000 requêtes et 13 000 Go-secondes ; au-delà, les opérations échouent jusqu'à minuit UTC, et la page retombe alors sur « sans connexion ». Un message reçu par WebSocket compte pour un vingtième de requête ; un objet endormi ne coûte rien. **Pas encore vérifié sur le compte** : le premier déploiement le dira.
2. **Ce qui coûte une requête** : chaque écriture sur une liste prévient sa salle (une requête, même si personne ne regarde), chaque ouverture de liste en demande une, et **chaque frappe de quelqu'un qui écrit envoie un message** (au plus cinq par seconde, comptés un vingtième). À l'échelle de l'essai, c'est très loin de la limite ; à surveiller au lot 38 B.
3. **Un objet par liste, écrit à la main**, exporté par un point d'entrée qui enveloppe celui de Nitro (`server/live/entry.ts`, `server/live/room.ts`). Le préréglage « durable » de Nitro met toutes les connexions dans un seul objet : pas retenu. L'objet ne stocke rien.
4. **Le direct marche en développement** (`pnpm dev`) : la même salle, gardée dans la mémoire du serveur de développement (`server/live/devRooms.ts`, `server/routes/live/[id].ts`), avec les mêmes règles (`server/utils/live.ts`). **Pour essayer en local** : deux fenêtres, dont une privée, connectées avec deux comptes qui tiennent la même liste (`pnpm seed:lists` crée « Noël 2026 (démo) », tenue avec `hugo-listes-demo@example.com`), et une troisième par le lien de la liste.
5. **Un ticket d'une minute** : le navigateur demande à l'application un ticket signé (qui il est pour cette liste), puis se connecte à la salle, qui le vérifie. Signé avec `NUXT_DATA_KEY`, sous un nom à part ; rien de secret dedans. Un visiteur n'y a ni prénom ni compte, même connecté.
6. **Les bornes** : 30 connexions par liste (la 31e est refusée, la page reste sans direct) ; un message de plus de 2 Ko, ou qui n'est pas l'un des trois attendus, ferme la connexion ; après 30 minutes sans toucher la page, le navigateur ferme la connexion et la rouvre au premier geste, et la salle ferme de son côté celles qui traînent quand elle se réveille. Pas d'alarme programmée : elle coûterait une écriture à chaque fois.
7. **Le signal part d'un seul endroit** (`server/plugins/live.ts`), après chaque écriture réussie sur une liste (par son document ou par son lien) **et sur la fiche d'un proche** : son prénom, son icône, ses tailles arrivent en direct sur toutes les listes où il figure. Arrivent aussi en direct (ajouté le 20 novembre 2026, à la demande de Julien) : un proche supprimé de « Mes proches », qui quitte ses listes chez tout le monde, et le prénom ou l'icône du compte de quelqu'un, sur les listes qu'il tient et celles où il figure.
8. **On voit l'autre écrire, lettre par lettre** (demandé par Julien le 20 novembre 2026) : ce que tape quelqu'un qui tient la liste part vers les autres qui la tiennent, avec la place de son curseur, fin et clignotant comme un vrai. **C'est un écart au README**, qui disait « aucune donnée de la liste ne passe par le canal » : ce texte ne va qu'à ceux qui tiennent la liste, qui voient déjà tout ; un visiteur ne reçoit toujours que « la liste a changé ». README mis à jour.
9. **Ce qui se verrouille** (Julien, 20 novembre 2026) : une idée, le nom de la liste, le mot d'accueil, et le prénom d'une personne écrit sur place. Verrouillé : teinté à la couleur claire de l'icône de celui qui écrit, « Hugo écrit… » dessous, intouchable, et **plus aucune action proposée dessus** (ni case, ni prénom de celui qui offre, ni « Se joindre », ni « Changer »). Une idée nouvelle en cours d'écriture apparaît chez les autres juste au-dessus de « Une autre idée… ». Pas verrouillés : la date et l'icône de la liste, l'icône d'une personne (on les choisit dans un panneau, le dernier qui valide gagne).
10. **Une personne reliée qui écrit ses idées par le lien est en direct aussi** (demandé par Julien le 20 novembre 2026 : elle modifie la liste, sans cela on se marche dessus). Ce qu'elle enregistre arrivait déjà chez tout le monde ; maintenant la ligne qu'elle écrit se verrouille chez ceux qui tiennent la liste, à son prénom, avec ce qu'elle tape, et une ligne de sa partie que quelqu'un qui tient la liste écrit se verrouille chez elle. **Tranché seul** : elle n'apprend rien d'autre (ni qui est là, ni combien, ni ce qui s'écrit ailleurs que dans sa partie : titre, mot, autres personnes) ; elle reste comptée avec les visiteurs et n'apparaît pas dans « là en ce moment » ; elle ne peut verrouiller qu'une ligne de sa propre partie (la salle le vérifie d'après son ticket, et la page de ceux qui tiennent la liste n'applique son verrou que dans cette partie). Un simple visiteur, lui, n'écrit rien dans la liste : il n'est toujours dit de lui que le nombre.
11. **La présence** : sous la ligne « Tu tiens cette liste avec… », « Hugo est là en ce moment. » avec un point vert (pas « Il », l'application ne connaît pas le genre), et « 2 visiteurs en ce moment » ; et « Là en ce moment » sur la page « Ceux qui tiennent la liste ».
12. **Cocher en même temps** : le second ne lit plus « Quelqu'un vient de le cocher » ; sa case passe à « pris » toute seule.
13. **Les animations** : une ligne qui apparaît, se déplace ou disparaît glisse, dans le document et sur la page par le lien ; un texte modifié par quelqu'un d'autre glisse à sa place ; une case change de couleur en douceur. Rien ne bouge si le téléphone demande moins d'animations.
14. **Sans connexion, puis de retour** (repris le 20 novembre 2026, Julien : « il faudrait, si on désynchronise tout ») : la page relit la liste quand elle revient au premier plan, quand le réseau revient, **et à chaque reconnexion à la salle** (avant, ce qui avait changé pendant la coupure restait invisible jusqu'au changement suivant). Elle retente la connexion de moins en moins souvent. **Une connexion morte sans le dire** (téléphone en veille, réseau qui tombe en silence) est détectée : toutes les 25 secondes le navigateur demande « tu es là ? », la salle répond sans se réveiller (réponse automatique, sans coût), et sans réponse en 10 secondes la connexion est refaite. Testé à deux navigateurs, réseau coupé puis rendu.
15. **Trouvé par le test à deux navigateurs, et corrigé** : un défaut d'avant ce lot. Quand on touchait une ligne alors qu'une autre était en cours d'écriture, celle-ci se refermait pendant l'appui, la page se décalait et le toucher était perdu. Une ligne ne se referme maintenant qu'au moment du clic (`usePointerHeld`).
16. **La barre de partage lit le nom en cours de frappe** : activer le partage juste après avoir tapé le nom ne dit plus « il manque un nom ».
17. **La politique de contenu** (lot 38 A) autorise la connexion WebSocket vers le site lui-même.

### Lot 27 ter — pistes et liste

Écrit le 19 novembre 2026. Points à relire :

1. **Rien n'est imposé** (décidé par Julien le 19 novembre 2026) : le mode anonyme est activé par défaut, avec un avertissement, et reste libre.
4. **Le mode anonyme est retenu par liste** (proposition) : je le choisis une fois, il reste.
2. **Une coche anonyme le reste après la fête**, même une fois le tirage dévoilé (proposition) : rien ne la relie au tirage dans la base, sauf ce qu'il faut pour l'anonymat.
3. **Sans compte, pas de lien possible** : seul quelqu'un qui tient une liste peut la relier.
5. **Les limites de la détection** : il faut que le destinataire ait un compte dans la liste (un enfant qui n'est qu'un prénom n'est relié à rien : seul le mode choisi à la main protège) ; une coche « Anonyme » pendant un tirage peut laisser deviner que c'est le Père Noël, sans dire qui ; un tirage annulé ou relancé laisse les coches anonymes telles quelles.

### Correction 29

Codée le 20 novembre 2026. Tranché seul, à relire :

1. **Dans le document de celui qui tient la liste aussi, plus de « Changer »** : c'est la pastille de mon état (« Tu l'offres », « Tu participes ») qui ouvre le panneau. La ligne entière n'est pas le bouton, comme par le lien : dans le document, toucher le texte l'écrit.
1 bis. **La case verte décoche tout de suite, sans panneau** (Julien, 20 novembre 2026, en essayant : par le lien, toucher la coche ne faisait rien, la ligne-bouton passait dessous). Par le lien comme dans le document ; **tranché seul** : aussi pour un cadeau à plusieurs, où elle me retire du groupe. Pas de « Annuler » : on recoche.
2. **Mon état est la même pastille dans le document** : « Tu l'offres », « Tu participes ». « seul » et « à plusieurs » ne sont plus écrits, les pastilles des autres le disent.
3. **« 7 personnes » au-delà de trois autres, seulement pour qui ne peut pas décocher** : ceux qui tiennent la liste gardent une pastille par prénom, puisque chacune décoche sa personne (Correction 25).
4. **« À plusieurs » et « Pris à l'instant »**, cités dans les familles, ne servent pas : les prénoms disent qu'un cadeau est à plusieurs, et une case prise à l'instant passe en « pris » toute seule (lot 26).
5. **Le champ du lien est hors de l'ordre de la touche Tab**, comme l'étaient les liens sous la ligne : Tab va d'une ligne à l'autre. On l'atteint en le touchant ; Échap y revient au texte.
6. **L'adresse s'y lit sans « https:// »** (`shownAddress`), et s'enregistre à l'identique.
7. **Une adresse fausse quand on quitte la ligne** (et non par « Entrée ») : le texte est enregistré, le lien reste comme il était, et un message le dit. Le champ ne peut pas rester ouvert : la ligne se ferme.
8. **L'adresse collée** ne passe dans le champ que s'il est vide : une adresse déjà là n'est pas remplacée sans qu'on le voie.
9. **Entre deux personnes, 64 px** dans le document et environ 68 par le lien (l'écart de la colonne plus 44 px), comme les maquettes ; à régler à l'œil sur un téléphone.
10. **Le contraste**, calculé à la main faute de l'outil axe : information 5,4 ; mon état 4,7 ; anonyme 9,6 ; action et pastille touchée 15,8 ; le lien 7,6 sur la page, 7,0 sur une ligne teintée. Tout passe le niveau AA.
11. **Le guide de style** montre `UiChip` dans ses cinq états.

### Lot 27 ter, en codant

Codé le 20 novembre 2026. Tranché seul, et limites à connaître :

1. **Ce qui est stocké** (migration `0032_anonymous_mode`, trois colonnes, rien de reconstruit) : la liste reliée sur la participation (`participations.gift_list_id`), et sur la visite d'une liste par un compte (`gift_list_visits`) le réglage du mode anonyme et l'état de la note (à lire, lue). **Rien ne relie une coche à un tirage** : une coche anonyme est une coche anonyme, c'est tout.
2. **La détection** : à l'ouverture d'une liste par son lien, pour un compte qui ne la tient pas, le serveur lit les tirages de ce compte (les personnes inscrites avec son adresse, plus la participation portée par le lien, signée), garde ceux qui sont encore secrets (tirés, pas dévoilés, fête pas passée), déchiffre pour chacun à qui il offre, et regarde si cette personne a un compte qui tient la liste ou y figure. Seul « oui » ou « non » en sort. **Elle n'est faite qu'une fois par liste** : après la note, le serveur ne relit plus le tirage, l'interrupteur est à la personne.
3. **Un tirage détecté active le mode même si j'avais choisi « sous mon prénom » avant**, une seule fois, avec la note. Ensuite rien ne le réactive, ni un autre tirage, ni `?anonyme`.
4. **`?anonyme` ne vaut que tant que je n'ai rien choisi** sur cette liste : sinon un lien gardé en favori réactiverait le mode à chaque visite, contre « jamais imposé ».
5. **Toucher l'interrupteur vaut « Compris »** : la note parlait de lui.
6. **Le lien signé** porte l'identifiant de la participation de celui qui offre et sa signature (HMAC avec la clé de l'application, sous un nom à part). Il ne dit pas à qui il offre. Qui possède ce lien obtient le mode anonyme et la note sur les listes de la personne : c'est le lien de celui qui offre, il ne doit pas le donner.
7. **Le lien et la connexion** : sans session, ce que porte l'adresse (`anonyme`, `p`) est gardé sur le téléphone le temps de recevoir son lien de connexion, puis rejoué au retour (l'adresse de retour est trop courte pour le porter).
8. **Sous le résultat, la phrase de la maquette** : « Le mode anonyme y sera activé pour toi. », et non celle du plan (« Ce que tu y coches reste anonyme, même pour {prénom} ») : elle promettait plus que ce qui est vrai si la personne désactive le mode.
9. **Le panneau « Changer » garde son choix « Dire à Camille que c'est moi »**, pour l'exception sur un cadeau ; le réglage de la liste décide de toutes les coches faites depuis la case, et de « J'offre autre chose ». Ce qui est déjà coché ne change pas quand on bascule l'interrupteur.
10. **« Ma liste de cadeaux » demande un compte pour choisir ou retirer**, pas pour lire : avec le seul lien personnel, on voit le nom de la liste reliée, et le bloc dit de se connecter. Modifiable tant que les pistes le sont.
11. **Limites** (en plus de celles déjà écrites) :
    - **Deux personnes qui tiennent la même liste et dont l'une a tiré l'autre** : celui qui tient la liste coche dans son document, sous son nom, sans barre ni mode anonyme. Le cas typique est un couple qui tient « Noël » ensemble. Il lui faut ouvrir la liste par son lien avec un autre compte, ou ne pas cocher. À traiter si Julien le veut (une barre dans le document).
    - La détection passe par les adresses email : une personne du tirage inscrite sans adresse, ou avec une autre adresse que celle de son compte, n'est pas reconnue sur la liste.
    - Une personne reliée à la liste (lot 25) qui est aussi celle à qui j'offre voit, comme tout le monde, qu'une idée de sa partie est prise : pas par qui.
12. **Aucun « Père Noël » dans les textes des listes** : vérifié dans les trois langues, il n'y en avait pas ; les nouveaux textes disent « la personne qui t'offre un cadeau » et « un tirage ».
14. **Le voile derrière la note couvre toute la page** (Julien, 20 novembre 2026, en essayant : « un peu comme une modale ») : la barre du haut et les onglets compris, au lieu du dégradé de la maquette qui s'arrêtait à la colonne de la liste. **Tranché seul** : il ne bloque pas les touchers, la liste reste utilisable dessous comme le README le demande ; seul « Compris » (ou l'interrupteur) le retire.
13. **La couleur aubergine** est un jeton du thème (`--color-incognito`, et `--color-incognito-soft` pour le « ? »).

### Lots 28 à 31 — notifications, code, application installée

Écrits le 19 novembre 2026. Points à relire :

1. **L'heure du résumé** : le matin, à l'heure de Paris pour tout le monde (proposition : 8 h). Un compte n'a pas de fuseau horaire aujourd'hui.
2. **L'attente avant l'email de ce qui presse**, quand un téléphone est prévenu : dix minutes (proposition).
3. **« Aucun email » coupe aussi ce qui presse** : seul l'email de connexion reste (décidé en dessinant `NotifReglage`).
4. **Les participants sans compte** gardent les emails d'aujourd'hui : c'est une raison de plus de les inviter à créer un compte.
5. **Le texte d'une notification du téléphone** ne doit jamais révéler un secret sur un écran verrouillé : « Ton enveloppe t'attend », jamais un prénom tiré.
6. **Pas de mode hors connexion** dans le lot 31 : l'application installée a besoin du réseau.
7. **L'ordre conseillé** : lot 30 (petit, indépendant), lot 28, lot 29, puis lot 31. Les pastilles en direct attendent le lot 26.

### Lot 29 bis — suivre une liste

Écrit le 19 novembre 2026. Points à relire :

1. **Une cloche, pas un mot**, au bout du nom. Validé par Julien le 19 novembre 2026.
2. **Sans suivre, plus de notification ni d'email pour les nouvelles idées** d'une liste simplement ouverte : seules les pastilles restent. C'est un changement par rapport au lot 28 tel qu'il était écrit.
3. **Cocher un cadeau ne fait pas suivre** la personne. Validé par Julien le 19 novembre 2026.
4. **Ceux qui tiennent la liste ne voient pas qui la suit** : pas nécessaire. Validé par Julien le 19 novembre 2026.
5. **Les idées corrigées** ne préviennent pas : seulement les nouvelles.

### Lot 32 — la page de présentation

Écrit le 19 novembre 2026. Points à relire :

1. **Les textes sont une proposition** : ils sont dans la maquette, à relire avant de les traduire.
2. **« Aucun assistant ne saura qui offre à qui »** : confirmé par Julien le 19 novembre 2026 (lot 40 : aucun outil ne renvoie de résultat, pas même le sien).
3. **Le branchement à un assistant (MCP)** est conçu dans le lot 40 (19 novembre 2026).
4. **« Pour organiser un tirage, tu demandes la création de ton groupe »** : la phrase de la maquette date d'avant deux décisions du 19 novembre 2026. L'application est gratuite, et la page le dit ; si le lot 34 est fait, il n'y a plus de demande à faire.
5. **Les deux maquettes** (téléphone, écran large) ont une hauteur estimée, pas mesurée : elles peuvent laisser un vide en bas ou couper la fin. Les captures y sont des maquettes réduites, donc avec des prénoms de maquette.
6. **Le bloc « Et aussi » suppose les lots 29 à 31 faits** (résumé du matin, code, application installée).

### Lot 33 — « Qui a fait ça, et pourquoi ? »

Écrit le 19 novembre 2026. Points à relire :

1. **Les textes** sont à écrire par Julien.
2. **Le service de dons** : à choisir (README 22.24 pour les frais relevés).
3. **L'adresse de contact** : à créer sur le domaine.
4. **« L'application ne montre aucune publicité »** : décidé par Julien le 19 novembre 2026 (section 7.3).
5. **L'icône de Julien** dans la maquette (un Père Noël sur fond ciel) est un choix de dessin, pas le sien.
6. **Des dons sont un revenu** : comment les déclarer est à voir avec un comptable (section 7.4).

### Lot 34 — ouvrir les groupes et les emails

Écrit le 19 novembre 2026. Points à relire :

1. **Le principe est acquis, pas les chiffres** : lever les limites, une soixantaine d'euros par an, gratuit pour tous.
2. **Trois groupes par compte et trente participants par édition, par défaut** : deux chiffres proposés, à confirmer par Julien (il hésite entre 2 et 3 groupes ; il trouve 100 participants énorme). Des défauts assez larges pour que les demandes restent rares : chaque demande est du travail pour lui, en décembre surtout.
5. **Le plafond de participants est porté par le groupe**, pas par le compte (proposition) : c'est un groupe qui grandit, et la demande le nomme. Les groupes d'avant le lot gardent 100, pour ne casser aucune édition en cours.
3. **Les plafonds** (emails par groupe et par jour, participants par groupe, dépense par mois) : à chiffrer ensemble.
4. **Les prix sont en dollars** et ont été relevés le 19 novembre 2026, en partie sur des comparatifs : à revérifier sur les sites de Cloudflare et de Resend avant de s'abonner.

### Lots 35 et 36 — ne plus recevoir d'emails, données personnelles

Écrit le 19 novembre 2026. Points à relire :

1. **Dire à l'organisateur qu'une adresse a bloqué l'application**, c'est lui apprendre quelque chose sur cette personne. Julien le veut ; la phrase reste neutre et ne dit ni quand ni pourquoi.
2. **L'email de connexion part malgré le blocage** (proposition) : la personne vient de le demander.
3. **Une empreinte plutôt que l'adresse** pour une personne sans compte (proposition).
4. **Les plafonds plus bas pour un compte récent** : à chiffrer.
5. **La liste RGPD n'est pas un avis juridique.** Elle a été écrite sans juriste.
6. **« Celui qui héberge pourrait techniquement lire les résultats »** : écrit sur la page publique par souci de transparence, d'après la décision 5 du README. **Validé par Julien le 19 novembre 2026.**
7. **Trois ans sans visite, puis le compte est supprimé, après un email qui prévient ; Julien répond sous un mois** : **validé par Julien le 19 novembre 2026.** Restent à décider : la durée du journal et celle des empreintes de blocage.
8. **La revue des maquettes a porté sur les champs de saisie et les emails** (63 écrans avec un champ, 9 emails), par un script. Les écrans qui affichent des données sans en saisir n'ont pas été relus un par un.
9. **Les mentions légales** demandent de dire qui édite le site. Ce qu'un particulier doit y écrire, et ce qu'il peut taire, est à faire préciser par la relecture : rien n'est écrit dans la maquette.
10. **« Aucun email » et le refus par le lien** sont deux choses voisines (lot 35) : le premier règle les emails automatiques de mon compte, le second interdit tout email vers mon adresse. À relire quand les deux existent.

### Lots 38 A, 38 B et 39 — durcir, modérer

Écrit le 19 novembre 2026. Points à relire :

1. **La liste n'est pas un audit** : elle demande d'abord de vérifier chaque point dans le code.
2. **La limite de dépense arrête l'application** quand elle est atteinte : choix proposé (une panne plutôt qu'une facture). À quel montant ? Proposition : 5 $ par mois au-dessus de l'abonnement.
3. **Les chiffres des plafonds** (liens de connexion par heure, objets par liste) sont à poser en codant, larges.
5. **Les maquettes du lot 39 sont des propositions** dessinées le 19 novembre 2026 ; les textes des règles d'usage et de la décision motivée sont à relire par Julien, puis par un juriste. L'adresse `contact@under-the-tree.party` y est un exemple : elle reste à créer (lot 36). Le lien « Signaler » en bas des pages par lien n'est pas dessiné sur ces pages elles-mêmes.
6. **Le statut de l'application au regard du règlement européen sur les services numériques** (hébergeur, ou plateforme) et ce qu'un particulier doit écrire dans ses mentions légales alors que le site est aussi sa vitrine et reçoit des dons : à faire trancher par la relecture.
7. **Suspendre un compte** : ses groupes et ses listes restent lisibles par les autres (proposition), lui ne peut plus rien écrire ni envoyer.
4. **Un contrôle « je ne suis pas un robot »** (Turnstile de Cloudflare) sur la demande de lien de connexion n'est pas retenu d'emblée : il ajoute un script tiers et une étape. À ressortir si la limitation de débit ne suffit pas.

### Lot 38 A — le filet

Codé le 19 novembre 2026. Ce que la vérification a trouvé, et ce qui a été tranché seul :

1. **La section 8 du README, relue contre le code** : tout ce qui y est coché est vrai, sauf une ligne périmée (« tentatives sur la connexion admin », « échecs purgés » : la connexion par mot de passe a disparu le 14 novembre 2026), réécrite ; et l'étape 8 du déploiement, qui parlait encore de mots de passe. Aucun `console.*` côté serveur, des requêtes paramétrées partout (une seule écrite à la main, paramétrée aussi).
2. **Le cloisonnement des listes tenait déjà** : le test (22 routes, un autre compte et une requête sans session) n'a rien trouvé à corriger. Il reste comme filet.
3. **Le lien de connexion répondait 429 à une adresse qui en avait trop demandé** : la réponse changeait donc selon l'adresse. Désormais elle ne change plus : même réponse, aucun email. Seul un client (une adresse IP) qui demande trop est refusé.
4. **Les chiffres**, tous posés seul : 3 liens par heure et par adresse, 20 demandes par heure et par adresse IP (inchangé), 1 000 liens par jour pour toute l'application ; débit des routes publiques à 10 par minute (demander, invitation) et 120 par minute (écrire par le lien d'une liste) ; 100 listes, 60 personnes et 600 idées par liste, 20 cadeaux hors liste par compte et par liste, 200 proches, 2 000 lignes de journal par groupe et par jour, 20 sessions par compte.
5. **La limitation de débit compte par adresse IP**, ce que la documentation de Cloudflare déconseille (une adresse peut être partagée) : ces routes n'ont pas de session, il n'y a rien d'autre pour compter. Les seuils sont larges pour qu'une famille sur le même wifi ne les touche pas. Elle compte de façon approchée, par centre de données.
6. **Pas vérifié en production** : que l'offre gratuite accepte les liaisons `[[ratelimits]]` (la documentation ne le dit pas), et leur comportement réel. Le premier déploiement le dira ; si Cloudflare les refuse, il suffit de retirer les deux blocs de `wrangler.toml` : le code laisse tout passer sans liaison. Dans les tests, la limitation est coupée ; la notice « Trop de demandes » est testée en simulant le refus.
7. **Le journal plafonné refuse au lieu de se taire** : au-delà de 2 000 lignes par jour dans un groupe, ce qui écrirait une ligne de plus est refusé. Ne plus écrire en silence aurait permis de noyer le journal puis d'agir sans trace.
8. **Trop de sessions : la plus ancienne se ferme**, sans message.
9. **Le nom d'un tirage** (« Noël 2026 ») est contrôlé aussi : il part dans les emails comme le nom du groupe. Le contrôle reconnaît « http », « www. » et les fins d'adresse courantes (.com, .fr, .xyz…) ; « J. Martin » ou « St. Nicolas » passent. Il ne s'applique pas aux idées de cadeaux ni au mot d'accueil d'une liste, qui ne partent dans aucun email.
10. **La politique de contenu garde les styles écrits dans la page** (`style-src 'unsafe-inline'`) : Vue pose des couleurs et des tailles sur les éléments. Les scripts, eux, sont stricts. Pas de point de collecte des rapports : en mode rapport, c'est la console du navigateur qui parle, et le test `csp.spec.ts` qui vérifie. Le test a trouvé Zod, qui essayait `new Function` : réglé.
11. **Les tâches planifiées** : au plus 12 rappels et 12 jeux par passage, parce qu'un passage a un nombre borné de requêtes à la base sur l'offre gratuite. Au-delà, le reste attend le passage suivant (le lendemain pour un rappel).
12. **DMARC est en `p=none`** (observation seule) : il ne protège pas encore le domaine contre l'usurpation. **À Julien** de le passer à `quarantine` dans le DNS de Cloudflare.
13. **Changer la clé des résultats** n'est pas possible sans un script de rechiffrement. **À écrire avant le lot 34.**
14. **Les routes participant (`/p/*`) ne sont pas limitées en débit**, comme avant : le jeton ne se devine pas.

### Lot 40 — brancher un assistant

Écrit le 19 novembre 2026. Points à relire :

1. **Aucun résultat, pas même le mien** : décidé par Julien. Un assistant ne peut donc pas répondre à « à qui j'offre ? ».
2. **La liste des outils** est une proposition. Créer une édition ou un groupe n'y est pas : à ajouter si l'usage le demande.
3. **Les listes où je figure sans les tenir** ne sont pas lisibles par mon assistant (proposition) : seulement celles que je tiens.
4. **Annuler ce qu'un assistant a écrit** : la maquette le promet « depuis la liste » ; le plus simple est de marquer ses écritures et de s'appuyer sur l'annulation existante. À confirmer en codant.
5. **« Mon assistant »** est un nom neutre dans les maquettes : aucune marque d'assistant n'y figure, ni sur la page de présentation.

### Lot 37 — le tableau de bord

Écrit le 19 novembre 2026. Points à relire :

1. **Les chiffres de la maquette sont inventés**, pour montrer la forme.
2. **Les requêtes du jour** : comptées par l'application elle-même ; l'autre voie est de les lire chez Cloudflare, avec une clé d'accès de plus.
3. **La dépense du mois** est une estimation, calculée à partir des emails envoyés et des prix saisis par le super-admin.
4. **Pas de courbes** dans cette première version : des chiffres et des jauges. À ajouter si le besoin se confirme.
5. **Ce qui compte dans la pastille de l'onglet** : demandes en attente, signalements pas vus, plafond passé à 70 %. Pas les erreurs du serveur (proposition).

### Correction 30

Tranché seul en codant, le 20 novembre 2026 (à valider par Julien) :

1. **Un cadeau à plusieurs encore ouvert garde sa case « + »** (se joindre), comme sur `ListeDecocherCase` : la case grise ne décoche que ce qui est fermé, une coche seule ou un groupe « au complet ». Conséquence : celui qui tient la liste ne peut plus retirer quelqu'un d'un groupe encore ouvert (les pastilles ne se touchent plus). À trancher si Julien veut un moyen.
2. **Le message d'un groupe nomme tout le monde** : « Coche de Mamie et Hugo retirée » ; une coche sans prénom est « Coche anonyme retirée ». « Annuler » remet chaque personne ; une fois le message parti, les coches sont retirées l'une après l'autre.
3. **« 7 personnes » vaut aussi pour ceux qui tiennent la liste** (au-delà de trois) : la Correction 29 leur gardait une pastille par prénom parce que chacune décochait sa personne, ce n'est plus le cas.
4. **Le paragraphe des goûts** : « Il lui faudrait … » pour « Ce qui lui servirait », « À éviter : … », puis « Côté cadeaux, Léo préfère … » avec les choix déjà écrits pour celui qui offre (« un objet plutôt qu'un moment »), le prénom plutôt que « il » (rien à accorder), puis les phrases de l'occasion et de la surprise ; une réponse « peu importe » ne dit rien. La première lettre d'un texte passe en minuscule après l'amorce en français et en anglais, sauf un mot en capitales (« PS5 ») ; jamais en allemand. Le point final n'est pas doublé. La phrase de la maquette « Il commence à lire tout seul » n'a pas de champ : elle n'existe pas. La page `/l/[jeton]/gouts/[personne]` est supprimée, plus rien n'y menait.
5. **Le fil s'arrête 26 px au-dessus du bas de la personne**, au centre de la case de sa dernière ligne quand elle tient sur une ligne. Quand on écrit dans la dernière ligne, il descend un peu plus, caché par l'encart blanc. La case de l'idée qu'un autre écrit (« Hugo écrit… ») n'est plus pâlie : elle doit couvrir le fil.
6. **L'espace entre deux personnes** reste de 44 px par le lien et de 64 px dans le document (Correction 29).
7. **En mode anonyme, se joindre est refusé aussi** (le prénom se verrait) : par le serveur, et par le panneau « Se joindre », qui le dit (« Mode anonyme activé : te joindre montrerait ton prénom… ») et grise « Je participe ». Repasser seul depuis un groupe, en mode anonyme, donne une coche anonyme.
8. **Le choix « en anonyme » n'existe que par le lien** : dans le document, celui qui tient la liste lit les prénoms (comme avant). Son « Je l'offre seul » dit seulement « Les autres voient seulement que c'est pris. »
9. **La note de première coche** vaut une fois par appareil, par le lien comme dans le document (et pour la personne reliée qui coche ses propres lignes) ; elle suit une coche par la case, pas « Se joindre » ni « J'offre autre chose ». Elle s'accroche sous la ligne, à 32 px du bord, sa pointe vers la pastille. Elle disparaît si la ligne s'en va.
10. **« › » sur ma pastille aussi par le lien**, où c'est la ligne entière qui ouvre le panneau : la pastille dit qu'on peut agir.
11. **Les teintes** : le filet de « Tu l'offres › » est la menthe 300 ; celui de « Tu l'offres en anonyme › » un aubergine clair `#a5809c` ; le fond du choix « en anonyme » `#f1e6ee` (maquette). Le crayon sur l'icône de 40 px passe à 20 px.
12. **Allemand** : « Im Moment: … », « Nützlich wäre: … », « Lieber nicht: … » (sans accord).

## 7. Tenir la charge, et financer l'application

Écrit le 19 novembre 2026, à la demande de Julien. Ce qui se code est dans les lots 34, 35 et 37 ; cette section en donne les raisons et les chiffres. Les chiffres ont été relevés ce jour-là, en partie sur des comparatifs : à revérifier sur les sites officiels avant toute décision.

### 7.1 Ce qui lâche en premier

| Ressource | Offre gratuite | Ce qui la consomme | Le plus petit palier payant |
|---|---|---|---|
| Emails (Resend) | 3 000 par mois, **100 par jour** | Liens de connexion, envois d'un tirage, rappels, résumé du matin (lot 29) | Pro : 20 $ par mois pour 50 000, sans plafond par jour |
| Requêtes (Workers) | 100 000 par jour, 10 ms de CPU par requête | Chaque page, chaque appel | Workers Paid : 5 $ par mois au minimum, pour tout le compte |
| Base (D1) | 5 millions de lignes lues et 100 000 écrites par jour, 5 Go | Les listes, le journal | Compris dans Workers Paid |
| Temps réel (objets durables, lot 26) | 100 000 requêtes par jour | Chaque liste ouverte en direct | Compris dans Workers Paid |

**Le premier mur est le plafond de 100 emails par jour.** Un groupe de 30 personnes dont on envoie les liens par email en prend 30 : quatre groupes le même soir le dépassent. Le README (8) situe déjà la gêne vers 50 groupes pour le plafond du mois.

### 7.2 Monter en charge, par étapes

1. **Mesurer.** Sur la page du super-admin, les compteurs du jour et du mois en face de chaque plafond (emails, requêtes, lignes écrites), et une alerte à 70 %.
2. **Dépenser moins d'emails.** Le résumé du matin (lot 29) et les notifications du téléphone (lot 31) vont dans ce sens. À ajouter : un envoi groupé qui dépasserait le plafond du jour part en deux fois, et l'organisateur le sait avant d'envoyer.
3. **Garder la porte.** Le quota de groupes par compte existe déjà (0 par défaut, sur demande) : c'est lui qui règle le débit. Le lot 34 propose de l'ouvrir (7.6), avec les garde-fous du lot 35.
4. **Payer le plus petit palier quand un plafond est atteint**, pas avant : Resend Pro si ce sont les emails, Workers Paid si ce sont les requêtes ou le temps réel. Soit de 5 à 25 $ par mois selon ce qui lâche. À vérifier : peut-on ne payer que de novembre à janvier.

### 7.3 Financer

**Décidé par Julien le 19 novembre 2026 : l'application reste gratuite.** Elle coûte peu, et elle est aussi sa vitrine de développeur. Les dons restent possibles (lot 33) ; les autres pistes de ce tableau et l'affiliation ne sont pas retenues.

| Voie | Ce que c'est | Pour | Contre |
|---|---|---|---|
| Les dons | Le bouton du café (lot 33) | Rien à construire, rien à facturer | Irrégulier, ne suit pas l'usage |
| Un prix par groupe et par an | L'organisateur paie une petite somme quand son groupe dépasse une taille | Colle à l'usage, une fois par an ; les participants ne paient jamais | Un paiement à construire, des factures, un statut |
| Faire payer ce qui coûte | L'envoi par email au-delà d'un seuil ; le partage par le téléphone reste gratuit | Le prix suit la dépense réelle | Plus difficile à expliquer |

Ce tableau reste pour mémoire : seule sa première ligne est retenue.

**La publicité : abandonnée par Julien le 19 novembre 2026**, après l'avoir explorée (un soutien affiché, l'affiliation, des idées suggérées, une régie). L'application n'affiche aucune publicité, et le dit.

### 7.4 Ce qu'un paiement entraîne

À voir avec un comptable : ce plan n'est pas un avis juridique ni fiscal.

- Un statut pour encaisser, et la déclaration de ce qui est reçu, dons compris.
- Des conditions de vente, des mentions légales, une politique de confidentialité à jour, des factures.
- Un prestataire de paiement, avec ses frais par paiement.
- Du support : quelqu'un qui paie attend une réponse.

### 7.5 Questions pour Julien

Répondu le 19 novembre 2026 : l'application s'ouvre à tous (lot 34, avec les garde-fous du lot 35) ; Julien y met une soixantaine d'euros par an, cent au plus ; tout reste gratuit, sans publicité.

Reste ouvert :

1. Quel service de dons ?
2. Confirmer 3 groupes par compte et 30 participants par édition sans demande (lot 34), et chiffrer les plafonds d'emails.

### 7.6 Avec 100 € par an, dès maintenant (proposition du 19 novembre 2026)

Julien peut mettre environ 100 € par an. Ce budget suffit pour lever les deux limites, à condition de changer de fournisseur d'emails. Lot 34.

| Poste | Prix relevé | Par an |
|---|---|---|
| Workers Paid (Cloudflare) | 5 $ par mois au minimum | 60 $ |
| Emails par Cloudflare (en bêta, exige Workers Paid) | 3 000 par mois compris, puis 0,35 $ les 1 000 | Quelques dollars : 20 000 emails en décembre coûtent environ 6 $ |
| Resend, gardé en secours | Offre gratuite | 0 |

- **Pourquoi pas Resend Pro** : 20 $ par mois, soit 240 $ par an, hors budget. Ne le prendre que de novembre à janvier coûterait 60 $ de plus.
- **L'autre voie pour les emails** : Amazon SES, autour de 0,10 $ les 1 000 sans abonnement, mais un compte de plus à ouvrir et à faire valider.
- **Ce qui reste incertain** : l'envoi d'emails de Cloudflare est en bêta, son prix peut changer, son quota de départ par jour n'est pas publié, et sa réputation d'expéditeur est jeune. D'où Resend en secours.
- **Lever la limite de groupes n'est pas une question d'argent** : c'est un réglage de l'application (le quota par compte, 0 aujourd'hui). Mais ouvrir à tous un service qui écrit à des adresses saisies à la main expose aux abus : les garde-fous du lot 34 vont avec.

## 8. Ce qui peut coûter cher, et ce qui peut casser

Écrit le 19 novembre 2026, à la demande de Julien, qui veut creuser les risques avant d'ouvrir l'application à tous. Ce qui se code est dans le lot 38. **Ce n'est pas un audit** : la liste vient du README (8.6), de `nuxt.config.ts`, de `wrangler.toml` et de la liste des routes. Les prix et les fonctions de Cloudflare ont été relevés ce jour-là : à revérifier.

### 8.1 Les coûts : d'où peut venir une facture

Aujourd'hui, tout est sur des offres gratuites, qui s'arrêtent au lieu de facturer : aucun risque. Le risque commence le jour de Workers Paid (lot 34).

| Risque | Comment ça arrive | Parade |
|---|---|---|
| Des requêtes en masse | Un robot, ou quelqu'un qui en veut à l'application, frappe des pages dynamiques | La limite de dépense de Cloudflare sur Workers ; la limitation de débit ; les fichiers statiques ne passent pas par le Worker |
| Des emails en masse | La demande de lien de connexion écrit à n'importe quelle adresse, sans compte | Plafonds par adresse, par IP et par jour ; interrupteur d'urgence ; crédit par édition (lot 34) |
| Des écritures en base en boucle | Un bogue dans une tâche planifiée, ou une route publique qui écrit sans limite | Tâches bornées et rejouables ; un plafond par objet ; alerte de budget |
| Des connexions en direct qui restent ouvertes (lot 26) | Un onglet oublié, un robot | Mise en sommeil des connexions, nombre maximal par liste, fermeture après inactivité |
| Le journal et la base qui gonflent | Chaque action écrit une ligne ; une liste ouverte à tous peut être remplie | Plafonds ; purge (lot 36) |

- **Une vraie limite de dépense existe chez Cloudflare** pour Workers et pour les objets durables : au seuil, les requêtes sont refusées jusqu'au cycle suivant, et les visiteurs voient une erreur. C'est le bon choix ici : mieux vaut une application arrêtée quelques jours qu'une facture. Elle ne couvre pas encore tous les produits (la base D1 n'était pas citée le 19 novembre 2026) : d'où l'alerte de budget sur tout le compte, et les plafonds dans l'application.
- **Resend gratuit ne peut pas facturer** : il refuse au-delà de son quota. Le garder en secours ne crée pas de risque.
- **Les emails de Cloudflare se paient au volume** : c'est le plafond de dépense du lot 34, dans l'application, qui protège.
- **La règle générale** : tout compteur qu'un inconnu peut faire monter doit avoir un plafond, et tout plafond doit se voir sur le tableau de bord.

### 8.2 Les failles : par ordre de vraisemblance

1. **La prise d'un compte de Julien** (Cloudflare, GitHub, Resend, sa boîte email). Elle donne tout : la base, la clé, le domaine, l'accès de dernier recours. Double authentification partout.
2. **L'abus des emails** : faire écrire l'application à des inconnus (harcèlement, hameçonnage avec un mot de l'organisateur, réputation du domaine ruinée). Lots 35 et 38.
3. **Lire ou modifier ce qui est à un autre** (un compte qui devine l'identifiant d'une liste, d'un membre de la famille). Les tirages sont testés ; les listes, plus récentes, pas encore de la même façon.
4. **L'injection de script (XSS)**. Vue échappe tout texte affiché et aucun `v-html` n'existe : le risque est faible aujourd'hui. Restent les adresses des liens (limitées à `http` et `https`), les emails en HTML (échappés), et l'absence de politique de contenu stricte, qui serait le filet si une faute passait un jour.
5. **La fuite d'un lien** : un lien de liste ou de participant vaut un mot de passe. Il part dans l'en-tête `Referer` si la page ne l'interdit pas (fait pour `/p`, pas pour `/l`), dans les journaux de Cloudflare (accepté), dans une capture d'écran. D'où « Changer de lien ».
6. **Une dépendance compromise** : le paquet d'un tiers qui lit les secrets au moment de construire. Verrou, audit, peu de dépendances (neuf aujourd'hui).
7. **La falsification de requête (CSRF)** : limitée par `SameSite=Lax` et des corps en JSON ; la vérification de `Origin` ferme la porte.
8. **La perte plutôt que le vol** : la clé des résultats perdue, la base effacée par erreur. Sauvegarde et procédure.

### 8.3 Ce qui est déjà bien

Requêtes paramétrées, entrées validées par Zod, résultats chiffrés, aucune attribution dans les réponses d'administration (testé), limitation des tentatives de connexion par adresse IP réelle, en-têtes contre l'affichage dans un cadre, secrets hors du dépôt, sessions révocables, liens d'idée limités à `http` et `https`.

### 8.4 Ce que ce plan ne couvre pas

Une attaque ciblée par quelqu'un de compétent, et un vrai test d'intrusion. Pour une application gratuite de cette taille, le lot 38 met le niveau au-dessus de l'ordinaire ; il ne remplace pas une revue par un tiers si l'application grandit.

### 8.5 Ce qu'il faut pour publier, côté droit

Écrit le 19 novembre 2026. **Ce n'est pas un avis juridique** : une liste de ce qu'un juriste devra confirmer, avec le lot qui s'en occupe.

| Sujet | Ce qu'il faut | Où |
|---|---|---|
| Mentions légales | Qui édite, comment le joindre, qui héberge (Cloudflare). Un particulier non professionnel peut ne publier que les coordonnées de son hébergeur ; à vérifier ici, le site étant aussi une vitrine et recevant des dons | Lot 36 |
| Données personnelles (RGPD) | La page « Tes données, en clair », les droits (accès, export, suppression), les durées, le registre, la marche à suivre en cas de fuite, les sous-traitants (Cloudflare, Resend) et les transferts hors d'Europe | Lot 36 |
| Contenu hébergé (règlement européen sur les services numériques) | Un moyen simple de signaler un contenu illicite, un accusé de réception, une décision motivée envoyée à celui dont le contenu est retiré, un point de contact, des règles d'usage qui disent comment on modère | Lot 39 |
| Règles d'usage | Ce qui est permis, ce qui ne l'est pas, ce qui arrive en cas d'abus, l'absence de garantie | Lot 39 |
| Emails | Ne pas écrire à qui a refusé ; dire qui a donné l'adresse ; un lien de refus dans chaque email | Lot 35 |
| Cookies | Un seul cookie, de session, nécessaire au service ; aucun traceur : pas de bandeau à afficher, mais le dire | Lot 36 |
| Enfants | Des prénoms et des âges d'enfants sont saisis par leurs parents ; l'âge pour créer un compte seul | Lots 36 et 39 |
| Dons | Ce qu'un particulier doit déclarer | Lot 33, avec un comptable |

Les obligations les plus lourdes du règlement sur les services numériques (rapports, traitement interne des réclamations) visent les plateformes et épargnent les très petites structures ; le signalement et la décision motivée, eux, valent pour tout hébergeur.
