// Public journal (README section 9): one sentence per event. `{name}` is
// the person concerned. Never who drew whom.
export default {
  someone: "Quelqu'un",
  unknown: 'Événement inconnu',
  events: {
    edition_created: "L'édition {label} a été créée",
    participant_added: '{name} est de la partie',
    participant_removed: '{name} ne participe plus',
    rules_changed: "L'organisateur a modifié les règles du tirage",
    message_sent: "L'organisateur a envoyé {what} à {name}{via}",
    link_copied: "L'organisateur a copié le lien de {name}",
    link_shared: "L'organisateur a partagé le lien de {name}",
    link_regenerated: 'Le lien de {name} a été régénéré',
    draw_done: {
      one: 'Le tirage est fait, pour {count} participant',
      other: 'Le tirage est fait, pour {count} participants',
    },
    draw_cancelled: 'Le tirage a été annulé. Motif : {reason}',
    results_revealed: "L'organisateur a dévoilé les résultats avant la fête",
    result_revealed:
      "L'organisateur a consulté le résultat de {name} (accès de dernier recours)",
    result_viewed: '{name} a ouvert son enveloppe',
    avatar_changed: '{name} a changé son icône',
    language_changed: '{name} a changé sa langue ({language})',
    edition_closed: "L'édition {label} est clôturée",
    draw_revealed: "L'organisateur a dévoilé les résultats du tirage",
    answers_started:
      "L'organisateur a indiqué que le tirage a été fait ailleurs : chacun donne sa réponse",
    answer_given: '{name} a donné sa réponse',
    answer_changed: '{name} a changé sa réponse',
    answers_validated: {
      one: "L'organisateur a validé les réponses : le tirage compte pour {count} participant",
      other:
        "L'organisateur a validé les réponses : le tirage compte pour {count} participants",
    },
    answers_abandoned:
      "L'organisateur a abandonné les réponses pour tirer avec l'application",
    guesses_enabled: 'Devine qui : le jeu de pronostics est ouvert',
    guesses_closed: 'Devine qui : les pronostics sont fermés',
    guess_results_ready: 'Devine qui : le palmarès est arrivé',
    guess_auto_reminder_sent: {
      one: 'Devine qui : un rappel automatique est parti à {count} personne',
      other: 'Devine qui : un rappel automatique est parti à {count} personnes',
    },
    guess_reminder_sent: {
      one: "L'organisateur a rappelé le jeu à {count} personne",
      other: "L'organisateur a rappelé le jeu à {count} personnes",
    },
  },
  noReason: 'non précisé',
  what: {
    invitation: '« Invitation »',
    drawn: '« Tirage fait »',
    reminder: '« Relance »',
    redraw: '« Nouveau tirage »',
    answerRequest: '« Demande »',
    answerReminder: '« Relance »',
    answerCheck: '« À vérifier »',
    other: 'un message',
  },
  via: {
    copy: ' par message copié',
    share: ' par partage',
    email: ' par email',
  },
  // The same events, told to the person they are about (filter « Moi »).
  own: {
    participant_added: 'Tu es de la partie',
    participant_removed: 'Tu ne participes plus',
    message_sent: 'L’organisateur t’a envoyé {what}{via}',
    link_copied: 'L’organisateur a copié ton lien',
    link_shared: 'L’organisateur a partagé ton lien',
    link_regenerated: 'Ton lien a été régénéré',
    result_revealed:
      'L’organisateur a regardé dans ton enveloppe (accès de dernier recours)',
    result_viewed: 'Tu as ouvert ton enveloppe',
    avatar_changed: 'Tu as changé ton icône',
    language_changed: 'Tu as changé ta langue ({language})',
    answer_given: 'Tu as donné ta réponse',
    answer_changed: 'Tu as changé ta réponse',
  },
  screen: {
    helpLink: 'À quoi sert-il ?',
    views: 'Ce que montre le journal',
    essential: 'L’essentiel',
    all: 'Tout',
    showDetail: 'Voir le détail',
    hideDetail: 'Replier',
    whatMeans: 'Qu’est-ce que ça veut dire ?',
    understood: 'J’ai compris',
    person: 'Personne concernée',
    everyone: 'Tout le monde',
    me: 'Moi ({name})',
    meNote: {
      one: 'Tout ce qui touche ton lien et ton enveloppe. Si une ligne ne vient pas de toi, préviens ton organisateur.',
      other:
        'Tout ce qui touche ton lien et ton enveloppe. Si une ligne ne vient pas de toi, préviens tes organisateurs.',
    },
  },
  grouped: {
    result_viewed: '{strong} ont ouvert leur enveloppe',
    message_sent: 'L’organisateur a envoyé {what} à {strong}{via}',
    link_copied: 'L’organisateur a copié {strong}',
    link_shared: 'L’organisateur a partagé {strong}',
    participant_added: '{strong} sont de la partie',
  },
  groupedCount: {
    result_viewed: { one: '{count} personne', other: '{count} personnes' },
    message_sent: { one: '{count} personne', other: '{count} personnes' },
    link_copied: { one: '{count} lien', other: '{count} liens' },
    link_shared: { one: '{count} lien', other: '{count} liens' },
    participant_added: { one: '{count} personne', other: '{count} personnes' },
  },
  help: {
    title: 'À quoi sert le journal ?',
    warning: {
      one: 'Une ligne te concerne et ne vient pas de toi ? Préviens ton organisateur : il peut régénérer ton lien.',
      other:
        'Une ligne te concerne et ne vient pas de toi ? Préviens tes organisateurs : ils peuvent régénérer ton lien.',
    },
    intro:
      'À garder le tirage honnête. Tricher reste possible, mais ça se voit.',
    notes: 'Il note',
    notesBody:
      'Le tirage, chaque lien envoyé ou régénéré, chaque enveloppe ouverte, et tout accès de l’organisateur à une enveloppe.',
    never: 'Il ne dit jamais',
    neverBody: 'Qui offre à qui, ni les pistes de cadeaux de chacun.',
    who: 'Tout le groupe le voit',
    whoBody: 'Participants et organisateurs, avec les mêmes lignes.',
  },
  alert: {
    at: '{day} à {time}',
    happened: 'Ce qui s’est passé.',
    why: 'Pourquoi c’est permis.',
    changes: 'Ce que ça change.',
    changesYou: 'Ce que ça change pour toi.',
    result_revealed: {
      title: 'Accès de dernier recours',
      happened:
        'L’organisateur a regardé à qui {name} offre un cadeau. Il n’a vu que ce résultat-là.',
      forOthers: 'Rien : ton enveloppe et tes pistes n’ont pas été vues.',
      forMe:
        'Il sait à qui tu offres un cadeau. Personne d’autre ne l’a vu, et ton enveloppe ne change pas.',
      why: 'En cas de doute ou de désaccord, il faut pouvoir vérifier. L’organisateur doit recopier une phrase et accepter que tout le groupe le sache.',
      changes:
        'Les autres résultats et les pistes de cadeaux n’ont pas été vus.',
    },
    results_revealed: {
      title: 'Résultats dévoilés avant la fête',
      happened: 'L’organisateur a dévoilé qui offre à qui, avant la fête.',
      why: 'Dévoiler est permis dès le jour de la fête. Plus tôt, l’organisateur doit recopier une phrase et accepter que tout le groupe le sache.',
      changes:
        'Ton enveloppe ne change pas, et tout le groupe peut voir qui offre à qui. Le tirage ne peut plus être annulé.',
    },
    draw_cancelled: {
      title: 'Tirage annulé',
      happened:
        'L’organisateur a annulé le tirage, pour le motif écrit ci-dessus. Les anciens résultats sont effacés.',
      why: 'Un désistement, un oubli : mieux vaut relancer que garder un tirage faux. Le motif est écrit au journal pour tout le groupe.',
      changes:
        'Chacun recevra un nouveau message et ouvrira une nouvelle enveloppe. Les liens et les pistes de cadeaux ne changent pas.',
    },
  },
};
