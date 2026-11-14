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
};
