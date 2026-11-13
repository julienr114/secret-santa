// Public journal (README section 9): one sentence per event. `{name}` is
// the person concerned. Never who drew whom.
export default {
  someone: "Quelqu'un",
  unknown: 'Événement inconnu',
  events: {
    edition_created: "L'édition {label} a été créée",
    participant_added: "{name} rejoint l'édition",
    participant_removed: "{name} quitte l'édition",
    rules_changed: 'Le gardien a modifié les règles du tirage',
    message_sent: 'Le gardien a envoyé {what} à {name}{via}',
    link_copied: 'Le gardien a copié le lien de {name}',
    link_shared: 'Le gardien a partagé le lien de {name}',
    link_regenerated: 'Le lien de {name} a été régénéré',
    draw_done: {
      one: 'Le tirage a été effectué pour {count} participant',
      other: 'Le tirage a été effectué pour {count} participants',
    },
    draw_cancelled: 'Le tirage a été annulé. Motif : {reason}',
    results_revealed:
      'Le gardien a consulté les résultats du tirage (accès de dernier recours)',
    result_revealed:
      'Le gardien a consulté le résultat de {name} (accès de dernier recours)',
    result_viewed: '{name} a consulté son résultat ({nth} fois)',
    wishes_updated: {
      one: '{name} a mis à jour sa liste de souhaits ({count} idée)',
      other: '{name} a mis à jour sa liste de souhaits ({count} idées)',
    },
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
  // Ordinal of a count, by Intl ordinal category (`rest` is "other").
  nth: { one: '{n}ʳᵉ', two: '{n}ᵉ', few: '{n}ᵉ', rest: '{n}ᵉ' },
};
