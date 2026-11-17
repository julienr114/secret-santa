// Public journal (README section 9): one sentence per event. `{name}` is
// the person concerned. Never who drew whom.
export default {
  someone: "Quelqu'un",
  unknown: 'Événement inconnu',
  events: {
    edition_created: "L'édition {label} a été créée",
    participant_added: "{name} rejoint l'édition",
    participant_removed: "{name} quitte l'édition",
    rules_changed: "L'organisateur a modifié les règles du tirage",
    message_sent: "L'organisateur a envoyé {what} à {name}{via}",
    link_copied: "L'organisateur a copié le lien de {name}",
    link_shared: "L'organisateur a partagé le lien de {name}",
    link_regenerated: 'Le lien de {name} a été régénéré',
    draw_done: {
      one: 'Le tirage a été effectué pour {count} participant',
      other: 'Le tirage a été effectué pour {count} participants',
    },
    draw_cancelled: 'Le tirage a été annulé. Motif : {reason}',
    results_revealed:
      "L'organisateur a consulté les résultats du tirage (accès de dernier recours)",
    result_revealed:
      "L'organisateur a consulté le résultat de {name} (accès de dernier recours)",
    result_viewed: '{name} a découvert son résultat',
    wishes_updated: {
      one: '{name} a mis à jour sa liste de souhaits ({count} idée)',
      other: '{name} a mis à jour sa liste de souhaits ({count} idées)',
    },
    avatar_changed: '{name} a changé son icône',
    language_changed: '{name} a changé sa langue ({language})',
    edition_closed: "L'édition {label} est clôturée",
  },
  noReason: 'non précisé',
  what: {
    invitation: "l'invitation",
    drawn: 'le message « tirage fait »',
    reminder: 'la relance',
    redraw: 'le message « nouveau tirage »',
    other: 'un message',
  },
  via: { copy: ' (message copié)', share: ' (partagé)', email: ' (email)' },
  screen: {
    helpLink: 'À quoi sert-il ?',
    views: 'Ce que montre le journal',
    essential: 'L’essentiel',
    all: 'Tout',
    showDetail: 'Voir le détail',
    hideDetail: 'Replier',
    whatMeans: 'Qu’est-ce que ça veut dire ?',
    understood: 'J’ai compris',
  },
  grouped: {
    result_viewed: '{strong} ont découvert leur résultat',
    message_sent: 'L’organisateur a envoyé {strong}',
    link_copied: 'L’organisateur a copié {strong}',
    link_shared: 'L’organisateur a partagé {strong}',
    participant_added: '{strong} rejoignent l’édition',
  },
  groupedCount: {
    result_viewed: { one: '{count} personne', other: '{count} personnes' },
    message_sent: { one: '{count} message', other: '{count} messages' },
    link_copied: { one: '{count} lien', other: '{count} liens' },
    link_shared: { one: '{count} lien', other: '{count} liens' },
    participant_added: { one: '{count} personne', other: '{count} personnes' },
  },
  help: {
    title: 'À quoi sert le journal ?',
    warning:
      'Une ligne te concerne et ne vient pas de toi ? Préviens ton organisateur : il peut régénérer ton lien.',
    intro:
      'À garder le tirage honnête. Tricher reste possible, mais ça se voit.',
    notes: 'Il note',
    notesBody:
      'Le tirage, chaque lien envoyé ou régénéré, chaque résultat découvert, les listes de souhaits modifiées, et tout accès de l’organisateur à un résultat.',
    never: 'Il ne dit jamais',
    neverBody: 'Qui offre à qui, ni le contenu des listes de souhaits.',
    who: 'Tout le groupe le voit',
    whoBody: 'Participants et organisateur, avec les mêmes lignes.',
  },
  alert: {
    at: '{day} à {time}',
    happened: 'Ce qui s’est passé.',
    why: 'Pourquoi c’est permis.',
    changes: 'Ce que ça change.',
    result_revealed: {
      title: 'Accès de dernier recours',
      happened:
        'L’organisateur a regardé à qui la personne nommée offre un cadeau. Il n’a vu que ce résultat-là.',
      why: 'En cas de doute ou de désaccord, il faut pouvoir vérifier. L’organisateur doit recopier une phrase et accepter que tout le groupe le sache.',
      changes:
        'Les autres résultats et les listes de souhaits n’ont pas été vus.',
    },
    results_revealed: {
      title: 'Accès de dernier recours',
      happened: 'L’organisateur a regardé les résultats du tirage.',
      why: 'En cas de doute ou de désaccord, il faut pouvoir vérifier. L’organisateur doit accepter que tout le groupe le sache.',
      changes:
        'Il sait qui offre à qui. Si le groupe le souhaite, le tirage peut être annulé et relancé.',
    },
    draw_cancelled: {
      title: 'Tirage annulé',
      happened:
        'L’organisateur a annulé le tirage, pour le motif écrit ci-dessus. Les anciens résultats sont effacés.',
      why: 'Un désistement, un oubli : mieux vaut relancer que garder un tirage faux. Le motif est écrit au journal pour tout le groupe.',
      changes:
        'Chacun recevra un nouveau message et découvrira un nouveau résultat. Les liens et les listes de souhaits ne changent pas.',
    },
  },
};
