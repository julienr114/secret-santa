// Organizer screens of one edition: creation, cockpit, participant,
// adding people, cancelling the draw and the last-resort reveal.
export default {
  general: {
    editionFallback: 'Édition',
    tickToConfirm: 'Coche pour confirmer',
  },
  newEdition: {
    title: 'Nouvelle édition',
    intro:
      "Les participants de l'édition précédente encore actifs sont repris ; tu pourras ajuster la liste ensuite.",
    nameRequired: 'Nom requis',
    nameLabel: "Nom de l'édition",
    yearLabel: 'Année',
    submit: "Créer l'édition",
  },
  cockpit: {
    budget: 'Budget {budget}',
    eventDate: 'le {date}',
    draftIntro:
      'Vérifie la liste des participants, puis ouvre les invitations pour pouvoir partager les liens.',
    openInvitations: 'Ouvrir les invitations',
    checkTitle: 'Vérification',
    drawPossible: 'Le tirage est possible',
    drawPossibleDescription: {
      one: '{count} participant, toutes les règles sont respectées.',
      other: '{count} participants, toutes les règles sont respectées.',
    },
    blocked: 'Personne ne peut être tiré pour : {names}.',
    constrained: 'Très peu de choix pour : {names}.',
    startDraw: 'Lancer le tirage',
    missing: {
      one: '{names} ne participe pas encore',
      other: '{names} ne participent pas encore',
    },
    missingWarning: 'Attention : {text}.',
    drawIsFinal:
      'Le tirage est définitif : la liste sera verrouillée. On y va ?',
    drawNow: 'Tirer au sort',
    notYet: 'Pas encore',
    drawDone: 'Tirage effectué',
    drawDoneToast: 'Partage maintenant le message « {message} » à chacun.',
    drawnDescription:
      '{viewed}/{total} ont consulté leur résultat. Personne, gardien compris, ne voit les résultats ici.',
    closeAfterParty: 'Clôturer après la fête',
    closeExplanation:
      "Clôturer rend l'édition non modifiable ; elle servira d'historique l'an prochain.",
    close: 'Clôturer',
    closedNotice: 'Édition clôturée, en lecture seule.',
    messageTitle: 'Message à partager',
    sharedCount: {
      one: '{count}/{total} partagé.',
      other: '{count}/{total} partagés.',
    },
    shareHelp:
      'Le bouton ouvre le partage du téléphone (WhatsApp, SMS…) avec le message et le lien personnel.',
    email: {
      noAddress:
        "Envoi par email : aucun participant n'a d'adresse. Ajoute-les dans Personnes.",
      confirm: "Confirmer l'envoi à {count}",
      send: {
        one: 'Envoyer par email à {count} personne',
        other: 'Envoyer par email à {count} personnes',
      },
      resend: {
        one: 'Renvoyer par email à {count} personne',
        other: 'Renvoyer par email à {count} personnes',
      },
      recipients: '« {message} » part aux personnes qui ont une adresse.',
      recipientsPartial: {
        one: '« {message} » part aux personnes qui ont une adresse ; {count} sans adresse, à joindre par téléphone.',
        other:
          '« {message} » part aux personnes qui ont une adresse ; {count} sans adresse, à joindre par téléphone.',
      },
      spamTip:
        "Les emails arrivent souvent en spam : relance par téléphone ceux qui n'ouvrent pas leur lien.",
      sent: {
        one: '{count} email envoyé',
        other: '{count} emails envoyés',
      },
      left: "Encore {count} à envoyer : relance l'envoi.",
    },
    empty: "Personne pour l'instant.",
    send: 'Envoyer',
    resend: 'Renvoyer',
    sendLinkOf: 'Envoyer le lien de {name}',
    resendLinkOf: 'Renvoyer le lien de {name}',
    addParticipants: 'Ajouter des participants',
    cancelAndRedraw: 'Annuler et relancer le tirage',
    cancelAndRedrawHint: 'Désistement, oubli… journalisé',
    revealOne: 'Voir un résultat',
    revealOneHint:
      'Dernier recours, une personne à la fois, inscrit au journal',
    resultsTitle: {
      one: 'Le tirage · {count} participant',
      other: 'Le tirage · {count} participants',
    },
    exclusionsTitle: 'Exclusions',
    pendingExclusions: {
      one: "+ {count} exclusion d'un tirage pas encore clôturé, gardées secrètes.",
      other:
        "+ {count} exclusions d'un tirage pas encore clôturé, gardées secrètes.",
    },
    previousDraws: 'Tirages précédents',
    previousDrawsFooter:
      'Personne ne retombera sur la même personne. Le × lève une exclusion pour cette édition seulement.',
    waive: 'Lever',
    waiveLabel: "Lever l'exclusion {giver} → {receiver} pour cette édition",
    waived: {
      one: '{count} exclusion des années précédentes levée pour cette édition.',
      other:
        '{count} exclusions des années précédentes levées pour cette édition.',
    },
    restoreAll: 'Tout rétablir',
  },
  participant: {
    fallbackTitle: 'Participant',
    notFound: 'Participant introuvable.',
    waiting: 'en attente',
    notViewed: "N'a pas encore consulté son résultat",
    viewed: {
      one: 'A consulté son résultat une fois',
      other: 'A consulté son résultat {count} fois',
    },
    viewedWithLast: {
      one: 'A consulté son résultat une fois · dernière fois {date}',
      other: 'A consulté son résultat {count} fois · dernière fois {date}',
    },
    linkCopied: 'Lien copié',
    linkRegenerated: "Nouveau lien créé, l'ancien ne marche plus",
    linkRegeneratedDescription: 'Pense à le repartager.',
    messageTitle: 'Message',
    shareMessage: 'Partager le message',
    shareMessageHint: 'WhatsApp, SMS… via le téléphone',
    copyMessage: 'Copier le message',
    copyLink: 'Copier le lien seul',
    unsend: 'Pas envoyé finalement ?',
    unsendHint: 'Retire la pastille « {badge} »',
    unsendDone: 'Pastille retirée',
    troubleshooting: 'Dépannage',
    troubleshootingFooter:
      'Aucune de ces actions ne révèle le résultat. Toutes sont inscrites au journal du groupe.',
    regenerate: 'Régénérer le lien',
    regenerateHint: 'Lien transféré par erreur',
    regenerateConfirm: "L'ancien lien de {name} ne marchera plus. Continuer ?",
    regenerateAction: 'Régénérer',
    remove: "Retirer de l'édition",
    removeConfirm: 'Retirer {name} de cette édition ?',
    removeAction: 'Retirer',
  },
  addParticipants: {
    title: 'Ajouter des participants',
    crumb: 'Ajouter',
    added: '{name} participe',
    // `{people}` is replaced by a link labelled with `peopleLink`.
    everyoneIn:
      "Tout le monde participe déjà. Pour quelqu'un de nouveau, crée-le d'abord dans {people}.",
    peopleLink: 'Personnes',
    footer: "Les personnes désactivées n'apparaissent pas ici.",
  },
  cancelDraw: {
    title: 'Annuler le tirage',
    reasonRequired: 'Explique en quelques mots',
    done: 'Tirage annulé',
    doneDescription: 'Ajuste la liste puis relance le tirage.',
    effectResults:
      'Tous les résultats sont effacés, la liste redevient modifiable.',
    effectLinks: 'Les liens et les codes restent valables.',
    effectJournal:
      'Le motif est affiché dans le journal, visible de tout le groupe.',
    effectMessage:
      'Après le nouveau tirage, envoie à chacun le message « {message} ».',
    reasonLabel: 'Motif',
    reasonPlaceholder: 'Désistement de Tom',
    understood: 'Je comprends que les résultats actuels seront perdus',
    submit: 'Annuler le tirage',
  },
  reveal: {
    title: 'Voir un résultat',
    personRequired: 'Choisis une personne',
    passwordRequired: 'Mot de passe requis',
    sentenceRequired: 'Recopie « {sentence} »',
    shownNotice:
      'Ta consultation est inscrite au journal du groupe. Le résultat disparaît quand tu quittes cet écran.',
    another: 'Voir un autre résultat',
    warningLastResort:
      "À n'utiliser qu'en dernier recours (désaccord, doute sur un bug…). Tu ne vois qu'un résultat à la fois.",
    warningJournal:
      'Le journal du groupe affichera, pour tous les participants : « Le gardien a consulté le résultat de Léa », avec le prénom de la personne.',
    warningEphemeral:
      "Le résultat ne s'affiche qu'ici, et disparaît quand tu quittes l'écran.",
    personLabel: 'Le résultat de qui ?',
    personPlaceholder: 'Choisir…',
    passwordLabel: 'Ton mot de passe',
    sentenceLabel: 'Recopie : {sentence}',
    understood: "Je comprends que tout le groupe saura que j'ai regardé",
    submit: 'Voir ce résultat',
  },
  drawPairs: {
    gives: 'offre à {name}',
    gave: 'a offert à {name}',
  },
  results: {
    title: 'Le tirage',
    footer: "L'édition est clôturée : ses résultats ne sont plus secrets.",
  },
  share: {
    copied: 'Message copié',
    copiedDescription: "Colle-le dans l'application de ton choix.",
  },
};
