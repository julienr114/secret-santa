// Organizer screens of one edition: creation, cockpit, participant,
// adding people, cancelling the draw and the last-resort reveal.
export default {
  general: {
    editionFallback: 'Édition',
    tickToConfirm: 'Coche pour confirmer',
  },
  newEdition: {
    dateLabel: 'Date de la fête',
    dateHelp: 'Le jour où vous échangez les cadeaux. Modifiable ensuite.',
    dateRequired: 'Choisis la date de la fête',
    title: 'Nouvelle édition',
    intro:
      "Les participants de l'édition précédente encore actifs sont repris ; tu pourras ajuster la liste ensuite.",
    nameRequired: 'Nom requis',
    nameLabel: "Nom de l'édition",
    yearLabel: 'Année',
    submit: "Créer l'édition",
  },
  cockpit: {
    closeLater: 'Tu pourras clôturer après la fête ({date}).',
    messageLanguage: 'Langue des messages : {language}',
    budget: 'Budget {budget}',
    eventDate: 'le {date}',
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
      '{viewed}/{total} ont consulté leur résultat. Personne, organisateur compris, ne voit les résultats ici.',
    closeAfterParty: 'Clôturer après la fête',
    closeExplanation:
      "Clôturer rend l'édition non modifiable ; elle servira d'historique l'an prochain.",
    close: 'Clôturer',
    closedNotice: 'Édition clôturée, en lecture seule.',
    messageTitle: 'Message à partager',
    email: {
      bulkTitle: 'Envoyer à plusieurs',
      bulkHint: 'Par email, en une seule fois',
      noAddress:
        "Envoi par email : aucun participant n'a d'adresse. Ajoute-les dans Personnes.",
      select: 'Envoyer par email à plusieurs personnes',
      selected: { one: '{count} sélectionné', other: '{count} sélectionnés' },
      selectAll: 'Tout sélectionner',
      selectNone: 'Tout désélectionner',
      selectPerson: 'Sélectionner {name}',
      chooseMessage: 'Choisir le message',
      sheetTitle: {
        one: 'Envoyer un email à {count} personne',
        other: 'Envoyer un email à {count} personnes',
      },
      sendCount: {
        one: 'Envoyer {count} email',
        other: 'Envoyer {count} emails',
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
    exclusionsAppliedTitle: 'Exclusions appliquées au tirage',
    exclusionsTitle: 'Exclusions',
    pendingExclusions: {
      one: "+ {count} exclusion d'un tirage pas encore clôturé, gardées secrètes.",
      other:
        "+ {count} exclusions d'un tirage pas encore clôturé, gardées secrètes.",
    },
    previousDrawReason: 'Tirage précédent : {edition}',
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
    sentenceRequired: 'Recopie « {sentence} »',
    shownNotice:
      'Ta consultation est inscrite au journal du groupe. Le résultat disparaît quand tu quittes cet écran.',
    another: 'Voir un autre résultat',
    warningLastResort:
      "À n'utiliser qu'en dernier recours (désaccord, doute sur un bug…). Tu ne vois qu'un résultat à la fois.",
    warningJournal:
      "Le journal du groupe affichera, pour tous les participants : « L'organisateur a consulté le résultat de Léa », avec le prénom de la personne.",
    warningEphemeral:
      "Le résultat ne s'affiche qu'ici, et disparaît quand tu quittes l'écran.",
    personLabel: 'Le résultat de qui ?',
    personPlaceholder: 'Choisir…',
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
    notePlace: 'Placement du mot',
    noteBefore: 'Au-dessus du message',
    noteAfter: 'En dessous du message',
    note: 'Ajouter un mot (facultatif)',
    noteHint: 'Envoyé tel quel, quelle que soit la langue du message.',
    preview: 'Aperçu du message',
    previewFor: 'Aperçu, pour {name}',
    previewEmailNote:
      'Chacun le reçoit avec son prénom, son lien et dans sa langue. L’email ajoute un objet et une signature.',
    language: 'Langue du message',
    languageHint: 'Sa page passera aussi dans cette langue.',
    emailMessage: 'Envoyer par email',
    noEmail: "Pas d'adresse email sur sa fiche",
    emailSent: 'Email envoyé à {name}',
    sheetTitle: 'Envoyer à {name}',
    copied: 'Message copié',
    copiedDescription: "Colle-le dans l'application de ton choix.",
  },
  invite: {
    title: 'Lien d’invitation',
    off: 'Désactivé',
    description:
      'Partage-le : chacun se connecte avec son adresse email et rejoint le groupe, et son tirage en cours tant qu’il n’a pas eu lieu.',
    share: 'Partager',
    copied: 'Lien copié',
    until: 'Date limite',
    untilHelp: 'Facultatif. Le lien ne marche plus après ce jour.',
    places: 'Places',
    placesHelp:
      'Combien de personnes peuvent encore rejoindre par ce lien. Par défaut, les places qui restent dans le groupe.',
    placesLeft: {
      one: '{count} place restante',
      other: '{count} places restantes',
    },
    untilShort: 'jusqu’au {date}',
    messageLabel: 'Ton mot sur la page d’invitation',
    messageHelp: 'Facultatif. Ce que les invités liront en ouvrant le lien.',
    create: 'Créer le lien',
    save: 'Enregistrer',
    close: 'Désactiver le lien',
    saved: 'Lien enregistré',
    shareTitle: 'Message à partager',
    copyMessage: 'Copier le message',
    message: {
      intro: 'Salut ! Tu es invité au Secret Santa « {group} » 🎁',
      how: 'Inscris-toi avec ton adresse email en ouvrant ce lien :',
      until: 'Tu as jusqu’au {date}.',
    },
    renew: 'Nouveau lien (l’ancien ne marchera plus)',
  },
};
