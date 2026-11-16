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
- [x] **Par paquets.** Déplier ajoute 50 lignes à la fois (constante nommée), pas tout d'un coup. S'il en reste, une seconde ligne « Voir les N autres » apparaît en bas de ce qui est affiché. Faire évoluer `foldList` (fonction pure, testée) pour prendre le nombre de lignes déjà dépliées.
- [x] La recherche montre toujours tous les résultats, sans repli.
- [x] Appliquer aux écrans déjà faits (édition à préparer, suivi après tirage, envoi par email) et mettre à jour le guide de style et leurs tests.

Pas de virtualisation : avec le repli par paquets, jamais plus de quelques dizaines de lignes ne sont ajoutées d'un coup, même pour un groupe de 300.

### Correction 2 — la ligne « Replier », et les noms de famille

Demandé par Julien le 16 novembre 2026, après avoir vu la première correction. À faire avant le lot 2. Références : `GroupeMembres100Deplie`, `Preparer100Deplie`, `Suivi100Deplie` (les trois montrent la page défilée jusqu'à la fin de la liste dépliée).

**La ligne « Replier »** (remplace ce qui a été fait dans la « Correction du lot 0 »)

- [x] **Du même type que la ligne qui a déplié** : fond blanc, même hauteur, titre en brique, même chevron mais vers le haut, et le petit espace en dessous. Sans les trois petites icônes et sans nombre : le texte est « Replier la liste ». Plus de fond teinté.
- [x] **Au même endroit** : en dernière ligne de la liste, après les personnes dépliées. Elle ne reste pas en haut de la partie dépliée.
- [x] Dans le suivi après tirage, la ligne garde sous son titre l'état de sa série (« Pas encore envoyé »…), comme la ligne « Voir les N autres ». La case « Dans le suivi après tirage » de la correction précédente est remplacée par celle-ci.
- [x] Par paquets de 50 : tant qu'il reste des personnes à afficher, la ligne « Voir les N autres » est juste au-dessus de la ligne « Replier ».
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

### Lot 2 — Édition : sous-écrans

- [ ] `AjouterParticipants` (`ajouter.vue`) : membres absents à cocher, « Créer une personne », « Inviter par lien », bouton collant « Ajouter N personnes ».
- [ ] `FicheParticipant` (`participants/[pid].vue`) : état en tête, action principale « Renvoyer son lien » (ouvre `AdminSendSheet`), informations, puis « Dépannage ».
- [ ] `PanneauRegenerer` : la confirmation de la régénération passe dans un `UiSheet`.
- [ ] `AnnulerTirage` (`annuler.vue`) : conséquences en liste, motif, aperçu de la ligne du journal, case à cocher, bouton sûr « Garder ce tirage » mis en avant.
- [ ] `VoirResultat`, `ChoisirPersonne`, `ChoisirPersonneRecherche`, `VoirResultatAffiche` (`voir-le-tirage.vue`) : avertissement, choix de la personne par `UiPersonPicker` (qui existe et n'est pas encore branché), aperçu du journal, phrase à recopier ; puis le résultat avec « Cacher et revenir à l'édition ». Libellé « Voir un seul résultat ».

**Fini quand** : les parcours de `tests/e2e/admin-edition.spec.ts` passent sur les nouveaux écrans.

### Lot 3 — Groupe : accueil et nouvelle édition

- [ ] `Groupe` (`admin/[slug]/index.vue`) : carte de l'édition en cours avec `UiStepper` et une phrase d'état, bouton « Ouvrir l'édition » ; section « Le groupe » en quatre lignes : Membres, **Exclusions** (ligne à part, avec le nombre de paires), Journal (dernier événement), Réglages ; puis les éditions passées.
- [ ] `GroupeSansEdition` : `UiActionCard` « Prépare le tirage de cette année ».
- [ ] `EditionNouvelle` (`editions/nouvelle.vue`) : voir « Partiel ».

### Lot 4 — Groupe : membres et exclusions

- [ ] `GroupeMembres`, `GroupeMembres100`, `GroupeMembres100Deplie` (`personnes/index.vue`) : une liste, exclusions rappelées sous le prénom, « Ajouter une personne » en bas, pied « L'historique de ceux qui ne participent plus est conservé », puis « Inviter par lien ». Recherche et repli du lot 0.
- [ ] `GroupePersonne`, `PersonneNouvelle` (`personnes/[id].vue`, `nouvelle.vue`, `AdminPersonForm.vue`) : formulaire, section « Ne tire pas », « Retirer du groupe » en bas ; « Ajouter, puis en créer une autre ».
- [ ] `GroupeExclusions`, `PanneauExclusion` (`exclusions.vue`, `AdminExclusions.vue`) : « Ajouter une exclusion » en haut, paires avec deux icônes, règles automatiques en lecture seule ; ajout dans un `UiSheet` avec `UiPersonPicker`.
- [ ] `GroupeInvitation` (`invitation.vue`) : message et lien, « Partager le lien », réglages du lien par les panneaux du lot 0 (`PanneauNombre`, `PanneauDate`, `PanneauTexte`).

### Lot 5 — Groupe : réglages

- [ ] `GroupeReglages` (`reglages.vue`) : lignes de réglage par section (Tirage, Participants, M'écrire par email, Organisateurs), chaque valeur modifiée dans son panneau (`PanneauChoix`, `PanneauTexte`).
- [ ] `PanneauOrganisateur` : la page `organisateurs.vue` devient une section des réglages ; garder la route en redirection.
- [ ] `PanneauSupprimerGroupe` : suppression (super-admin) dans un panneau, identifiant à recopier, « Garder le groupe » mis en avant.

- [ ] **Pas de bouton « Enregistrer » en bas de page** (validé par Julien le 16 novembre 2026) : chaque réglage s'enregistre quand on valide son panneau, un interrupteur s'enregistre dès qu'on le bascule. Une mutation par réglage, avec mise à jour optimiste et retour à l'ancienne valeur en cas d'erreur (toast). Retirer l'état « modifié, non enregistré » de la page. Même règle pour les réglages du lien d'invitation (lot 4). Ajouter la règle au README 23.3, qui dit aujourd'hui qu'un panneau enregistre avec « Valider ».

### Lot 6 — Journal

Fichiers : `JournalList.vue`, `JournalView.vue`, `admin/[slug]/journal.vue`, `p/[token]/journal.vue`.

- [ ] `Journal`, `JournalTout` : deux vues, « L'essentiel » et « Tout » ; par jour ; les événements répétés d'un même type regroupés en une ligne dépliable (« 5 personnes ont découvert leur résultat »). Fonctions pures `essentialEvents` et `groupEvents`, testées.
- [ ] `JournalPersonne` : filtre « Moi », seulement si les événements portent déjà la personne concernée ; sinon section 6.
- [ ] `JournalDetail` : « Qu'est-ce que ça veut dire ? » ouvre un panneau qui explique l'alerte.
- [ ] `JournalAide` : panneau « À quoi sert le journal ? ».

### Lot 7 — supprimé

Supprimé le 16 novembre 2026. Les quatre écrans de la liste de souhaits (`Souhaits`, `SouhaitsVide`, `SouhaitsIdee`, `SouhaitsFigee`) sont remplacés par la fonctionnalité « Pistes de cadeaux » (README 22.11), qui sera codée à part : ne pas les refaire ici, et ne pas se servir de ces quatre maquettes. Les écrans « Rejoindre » passent au lot 8.

### Lot 8 — Connexion, compte, demandes, invitation

- [ ] `Rejoindre`, `RejoindreConnecte`, `RejoindreFait`, `RejoindreFerme` (`rejoindre/[code].vue`) : les quatre états. `RejoindreFerme` montre le cas « plus de place » ; même écran, autre phrase, pour un lien expiré (« Ce lien d'invitation n'est plus valable depuis le 10 décembre. ») et pour un lien désactivé ou inconnu (« Ce lien d'invitation ne marche plus. »). Si le tirage est déjà fait, la personne rejoint le groupe, pas le tirage en cours : le dire sur `RejoindreFait`.
- [ ] `ConnexionEnvoye`, `ConnexionConfirmer`, `ConnexionLienInvalide` (`AuthEmailLogin.vue`, `login/[token].vue`) : logo à la place de l'emoji clé, textes des maquettes.
- [ ] `Compte` (`compte.vue`) : profil en lignes modifiables, appareils, déconnexion.
- [ ] `AccueilMenu`, `AccueilDemandeAttente`, `AccueilDemandeRefusee` : voir « Partiel ».

### Lot 9 — Administration (super-admin)

- [ ] `AdminAcces`, `AdminAccesMenu` : la barre du bas (`AdminBottomNav`) disparaît ; l'accès se fait par une ligne « Administration » en bas de l'accueil et par le menu, avec le nombre de demandes en attente.
- [ ] `Admin`, `AdminPlusieursDemandes` : accueil de l'administration ; la demande la plus ancienne dans la carte, les suivantes en lignes.
- [ ] `AdminDemande` : réponse dans un panneau, avec l'effet sur le quota (sans le champ « Un mot pour elle »).
- [ ] `AdminComptes`, `AdminCompte`, `AdminGroupes` (`admin/comptes/*`, `admin/groupes/index.vue`).

- [ ] Validé par Julien le 16 novembre 2026 : le super-admin ne modifie plus le profil d'un compte (prénom, icône, langue), il le lit seulement ; « Accepter » et « Refuser » ont le même poids visuel. Retirer du client le formulaire de profil de `admin/comptes/[id].vue` ; la route d'API reste en place.

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
2. **`PreparerVide` : « au moins trois ».** La maquette dit qu'il faut au moins trois participants ; le tirage en accepte deux (`too_few_participants`). Le texte dit « deux ». Faut-il relever le minimum à trois ?
3. **`EtatConfirmation` : les prénoms.** L'API d'envoi renvoie le nombre d'emails partis, pas les prénoms. Le message nomme les personnes cochées seulement quand tout est parti en un appel (50 au plus) ; au-delà, il donne le nombre seul. Le test de bout en bout ne peut pas le vérifier : le serveur de test n'a pas de clé d'envoi.
4. **Démo à 100.** `seed:demo` crée « comite-demo » (à préparer) et « grand-tirage-demo » (tirage fait) avec 99 prénoms : l'organisatrice, personne du groupe, fait la centième. Une édition ne peut pas dépasser 100 participants.
