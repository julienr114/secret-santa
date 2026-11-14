import type fr from '../fr/journal';
import type { Dict } from '../../types';

export default {
  someone: 'Jemand',
  unknown: 'Unbekanntes Ereignis',
  events: {
    edition_created: 'Die Ausgabe {label} wurde erstellt',
    participant_added: '{name} nimmt an der Ausgabe teil',
    participant_removed: '{name} verlässt die Ausgabe',
    rules_changed: 'Der Organisator hat die Regeln der Auslosung geändert',
    message_sent: 'Der Organisator hat {what} an {name} gesendet{via}',
    link_copied: 'Der Organisator hat den Link von {name} kopiert',
    link_shared: 'Der Organisator hat den Link von {name} geteilt',
    link_regenerated: 'Der Link von {name} wurde neu erzeugt',
    draw_done: {
      one: 'Die Auslosung wurde für {count} Teilnehmer durchgeführt',
      other: 'Die Auslosung wurde für {count} Teilnehmer durchgeführt',
    },
    draw_cancelled: 'Die Auslosung wurde aufgehoben. Grund: {reason}',
    results_revealed:
      'Der Organisator hat die Ergebnisse der Auslosung eingesehen (Notzugriff)',
    result_revealed:
      'Der Organisator hat das Ergebnis von {name} eingesehen (Notzugriff)',
    result_viewed: '{name} hat das eigene Ergebnis angesehen (zum {nth} Mal)',
    wishes_updated: {
      one: '{name} hat die Wunschliste aktualisiert ({count} Idee)',
      other: '{name} hat die Wunschliste aktualisiert ({count} Ideen)',
    },
    avatar_changed: '{name} hat das eigene Symbol geändert',
    language_changed: '{name} hat die eigene Sprache geändert ({language})',
    edition_closed: 'Die Ausgabe {label} ist abgeschlossen',
  },
  noReason: 'nicht angegeben',
  what: {
    invitation: 'die Einladung',
    drawn: 'die Nachricht „Auslosung erfolgt“',
    reminder: 'die Erinnerung',
    redraw: 'die Nachricht „Neue Auslosung“',
    other: 'eine Nachricht',
  },
  via: {
    copy: ' (Nachricht kopiert)',
    share: ' (geteilt)',
    email: ' (E-Mail)',
  },
  nth: { one: '{n}.', two: '{n}.', few: '{n}.', rest: '{n}.' },
} satisfies Dict<typeof fr>;
