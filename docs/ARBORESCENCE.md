# Arborescence des écrans

Ce fichier décrit l'arbre des pages de l'application : qui est le parent de qui, et donc où mène « Retour ». **À tenir à jour à chaque nouvel écran** : une ligne dans le bon tableau, avec son parent, et le `back` de la page qui le dit dans le code.

## Vue d'ensemble

Chaque flèche va d'un écran vers ses enfants ; « Retour » la remonte. Les écrans en pointillés n'ont pas de « Retour » : on y arrive par un lien. Le schéma s'affiche sur GitHub et dans l'aperçu Markdown de VS Code ; les tableaux plus bas donnent les adresses et les panneaux.

```mermaid
flowchart LR
  accueil["Accueil<br/><small>/</small>"]

  subgraph entrees ["Liens directs, sans « Retour »"]
    login["Connexion<br/><small>/login</small>"]:::sans
    lien["Lien de connexion<br/><small>/login/[jeton]</small>"]:::sans
    rejoindre["Rejoindre un groupe<br/><small>/rejoindre/[code]</small>"]:::sans
  end

  accueil --> compte["Mon compte"]
  accueil --> passes["Tirages passés"]

  subgraph admin ["Administration (super-admin)"]
    administration["Administration<br/><small>/admin</small>"]
    administration --> groupes["Tous les groupes"]
    groupes --> nouveauGroupe["Nouveau groupe"]
    administration --> comptes["Comptes"]
    comptes --> unCompte["Un compte"]
    administration --> guide["Guide de style"]
  end
  accueil --> administration

  subgraph groupe ["Un groupe (organisateur)"]
    leGroupe["Le groupe<br/><small>/admin/[groupe]</small>"]
    leGroupe --> membres["Membres"]
    membres --> personne["Une personne"]
    membres --> nouvellePersonne["Nouvelle personne"]
    membres --> invitation["Inviter par lien"]
    leGroupe --> exclusionsGroupe["Exclusions du groupe"]
    leGroupe --> journalGroupe["Journal du groupe"]
    leGroupe --> reglagesGroupe["Réglages du groupe"]
    leGroupe --> nouvelleEdition["Nouvelle édition"]
  end
  accueil --> leGroupe

  subgraph edition ["Une édition (organisateur)"]
    lEdition["L'édition<br/><small>…/editions/[id]</small>"]
    lEdition --> ajouter["Choisir les participants"]
    lEdition --> emails["Envoyer par email"]
    emails --> messagePlusieurs["Personnaliser le message<br/><small>pour plusieurs</small>"]
    lEdition --> messageUne["Personnaliser le message<br/><small>pour une personne</small>"]
    lEdition --> reglagesEdition["Réglages de l'édition"]
    lEdition --> exclusionsEdition["Exclusions de l'édition"]
    lEdition --> annuler["Annuler le tirage"]
    lEdition --> voir["Voir un seul résultat"]
    lEdition --> palmaresOrga["Palmarès Devine qui<br/><small>images</small>"]
  end
  leGroupe --> lEdition

  subgraph tirage ["Un tirage (participant, lien personnel)"]
    page["La page du tirage<br/><small>/p/[jeton]</small>"]
    page --> pistes["Mes pistes de cadeaux"]
    pistes --> question["Une question"]
    page --> devine["Devine qui"]
    devine --> palmares["Palmarès Devine qui<br/><small>images</small>"]
    page --> tout["Qui offre à qui<br/><small>une fois dévoilé</small>"]
    page --> journal["Journal du groupe"]
  end
  accueil -. "seulement si ouverte depuis l'accueil" .-> page

  classDef sans stroke-dasharray: 5 5
```

## La règle du bouton « Retour »

Décidée par Julien le 18 novembre 2026.

- « Retour » remonte d'un cran dans cet arbre, vers le **parent logique** de l'écran. Ce n'est pas le retour du navigateur : un écran ouvert depuis l'accueil, un email ou un lien partagé remonte quand même à son parent.
- Chaque page déclare son parent dans `back` (`AdminScreen`, `ParticipantScreen`), et les actions qui ramènent après un enregistrement (« Valider », « Enregistrer ») vont au même parent.
- `useGoBack` (`app/composables/useGoBack.ts`) applique la règle avec `backMove` (`shared/utils/navigation.ts`, testé) : si la page précédente de l'historique est justement ce parent, le navigateur revient en arrière, pour ne pas empiler deux fois la même page ; sinon le parent s'ouvre.
- Les panneaux du bas (`UiSheet`) ne sont pas des écrans : ils se ferment, ils ne remontent pas. Ils sont indiqués sous l'écran qui les ouvre.
- Le retour du navigateur, lui, garde son comportement habituel.

## Accueil et compte

| Écran | Adresse | Parent (« Retour ») | Panneaux |
|---|---|---|---|
| Accueil, ou connexion sans session | `/` | — | Mon icône, demande de groupe |
| Connexion | `/login` | — | |
| Le lien de connexion | `/login/[jeton]` | — | |
| Mon compte | `/compte` | Accueil | Prénom, nom, langue des emails, icône |
| Tirages passés | `/tirages-passes` | Accueil | |
| Rejoindre un groupe (lien d'invitation) | `/rejoindre/[code]` | — | |

## Administration (super-admin)

| Écran | Adresse | Parent | Panneaux |
|---|---|---|---|
| Administration | `/admin` | Accueil | Décider d'une demande |
| Tous les groupes | `/admin/groupes` | Administration | |
| Nouveau groupe | `/admin/groupes/nouveau` | Tous les groupes (super-admin), sinon Accueil | |
| Comptes | `/admin/comptes` | Administration ; les comptes désactivés : Comptes | |
| Un compte | `/admin/comptes/[id]` | Comptes | Quota, désactivation |
| Guide de style | `/admin/guide-de-style` | Administration | |

## Un groupe (organisateur)

| Écran | Adresse | Parent | Panneaux |
|---|---|---|---|
| Le groupe | `/admin/[groupe]` | Accueil | |
| Membres | `/admin/[groupe]/personnes` | Le groupe | |
| Une personne | `/admin/[groupe]/personnes/[id]` | Membres | Mon icône, exclusion |
| Nouvelle personne | `/admin/[groupe]/personnes/nouvelle` | Membres | |
| Inviter par lien | `/admin/[groupe]/invitation` | Membres | Places, date limite, mot |
| Exclusions du groupe | `/admin/[groupe]/exclusions` | Le groupe | Ajouter une exclusion |
| Journal du groupe | `/admin/[groupe]/journal` | Le groupe | À quoi sert-il ?, une alerte |
| Réglages du groupe | `/admin/[groupe]/reglages` | Le groupe | Chaque réglage, organisateur, suppression du groupe |
| (ancienne adresse) | `/admin/[groupe]/organisateurs` | mène aux Réglages du groupe | |

## Une édition (organisateur)

| Écran | Adresse | Parent | Panneaux |
|---|---|---|---|
| Nouvelle édition | `/admin/[groupe]/editions/nouvelle` | Le groupe | |
| L'édition (Préparer, Réponses, Tirage fait, Fêter, Clôturée) | `/admin/[groupe]/editions/[id]` | Le groupe | Lancer le tirage, Le tirage a déjà été fait ?, Valider le tirage, Un souci ?, Envoi à une personne, Dévoiler, Date de la fête, Rappeler le jeu, Devine qui |
| Choisir les participants | `…/editions/[id]/ajouter` | L'édition | |
| Envoyer par email | `…/editions/[id]/emails` | L'édition | |
| Personnaliser le message | `…/editions/[id]/message?pour=` | L'édition, panneau d'envoi rouvert (`?envoyer=`) pour une personne ; Envoyer par email pour plusieurs | Langue du message |
| Réglages de l'édition | `…/editions/[id]/reglages` | L'édition | Date, budget, petit mot, Devine qui |
| Exclusions de l'édition | `…/editions/[id]/exclusions` | L'édition | |
| Annuler le tirage | `…/editions/[id]/annuler` | L'édition | |
| Voir un seul résultat | `…/editions/[id]/voir-le-tirage` | L'édition | Le résultat de qui ? |
| Le palmarès de Devine qui (images) | `…/editions/[id]/palmares` | L'édition (la croix et « Voir tous les résultats ») | |
| (ancienne adresse) | `…/editions/[id]/participants/[pid]` | mène à l'édition, panneau d'envoi ouvert | |

## Un tirage (participant, par son lien personnel)

| Écran | Adresse | Parent | Panneaux |
|---|---|---|---|
| La page du tirage | `/p/[jeton]` | Accueil, seulement si ouverte depuis l'accueil ; sinon pas de « Retour » | Mon icône, À qui offres-tu un cadeau ? |
| Mes pistes de cadeaux | `/p/[jeton]/pistes` | La page du tirage | Chaque texte |
| Une question de « Moi et les cadeaux » | `/p/[jeton]/pistes/question?n=` | Mes pistes de cadeaux | |
| Devine qui (pronostics, puis les réponses) | `/p/[jeton]/devine` | La page du tirage | Choisir un pronostic |
| Le palmarès de Devine qui (images) | `/p/[jeton]/devine/palmares` | Devine qui (la croix et « Voir tous les résultats ») | |
| Qui offre à qui (une fois le tirage dévoilé) | `/p/[jeton]/tirage` | La page du tirage | |
| Journal du groupe | `/p/[jeton]/journal` | La page du tirage | À quoi sert-il ?, une alerte |
| (ancienne adresse) | `/p/[jeton]/souhaits` | mène à Mes pistes de cadeaux | |
