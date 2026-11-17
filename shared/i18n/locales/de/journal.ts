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
    result_viewed: '{name} hat das eigene Ergebnis entdeckt',
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
  screen: {
    helpLink: 'Wozu dient es?',
    views: 'Was das Protokoll zeigt',
    essential: 'Das Wichtigste',
    all: 'Alles',
    showDetail: 'Details zeigen',
    hideDetail: 'Einklappen',
    whatMeans: 'Was bedeutet das?',
    understood: 'Verstanden',
  },
  grouped: {
    result_viewed: '{strong} haben ihr Ergebnis entdeckt',
    message_sent: 'Der Organisator hat {strong} gesendet',
    link_copied: 'Der Organisator hat {strong} kopiert',
    link_shared: 'Der Organisator hat {strong} geteilt',
    participant_added: '{strong} sind der Ausgabe beigetreten',
  },
  groupedCount: {
    result_viewed: { one: '{count} Person', other: '{count} Personen' },
    message_sent: { one: '{count} Nachricht', other: '{count} Nachrichten' },
    link_copied: { one: '{count} Link', other: '{count} Links' },
    link_shared: { one: '{count} Link', other: '{count} Links' },
    participant_added: { one: '{count} Person', other: '{count} Personen' },
  },
  help: {
    title: 'Wozu dient das Protokoll?',
    warning:
      'Eine Zeile betrifft dich und kommt nicht von dir? Sag es deinem Organisator: Er kann deinen Link erneuern.',
    intro:
      'Damit die Auslosung ehrlich bleibt. Schummeln bleibt möglich, aber man sieht es.',
    notes: 'Es notiert',
    notesBody:
      'Die Auslosung, jeden gesendeten oder erneuerten Link, jedes entdeckte Ergebnis, geänderte Wunschlisten und jeden Blick des Organisators auf ein Ergebnis.',
    never: 'Es verrät nie',
    neverBody: 'Wer wen beschenkt, noch was in den Wunschlisten steht.',
    who: 'Die ganze Gruppe sieht es',
    whoBody: 'Teilnehmer und Organisator, mit denselben Zeilen.',
  },
  alert: {
    at: '{day} um {time}',
    happened: 'Was passiert ist.',
    why: 'Warum das erlaubt ist.',
    changes: 'Was sich ändert.',
    result_revealed: {
      title: 'Zugriff im Notfall',
      happened:
        'Der Organisator hat nachgesehen, wen die genannte Person beschenkt. Er hat nur dieses eine Ergebnis gesehen.',
      why: 'Bei Zweifel oder Streit muss man nachprüfen können. Der Organisator muss einen Satz abschreiben und akzeptieren, dass die ganze Gruppe es erfährt.',
      changes:
        'Die anderen Ergebnisse und die Wunschlisten wurden nicht gesehen.',
    },
    results_revealed: {
      title: 'Zugriff im Notfall',
      happened: 'Der Organisator hat die Ergebnisse der Auslosung angesehen.',
      why: 'Bei Zweifel oder Streit muss man nachprüfen können. Der Organisator muss akzeptieren, dass die ganze Gruppe es erfährt.',
      changes:
        'Er weiß, wer wen beschenkt. Wenn die Gruppe es wünscht, kann die Auslosung abgesagt und neu gestartet werden.',
    },
    draw_cancelled: {
      title: 'Auslosung abgesagt',
      happened:
        'Der Organisator hat die Auslosung abgesagt, aus dem oben genannten Grund. Die alten Ergebnisse sind gelöscht.',
      why: 'Eine Absage, ein Vergessener: Lieber neu auslosen als eine falsche Auslosung behalten. Der Grund steht für die ganze Gruppe im Protokoll.',
      changes:
        'Alle bekommen eine neue Nachricht und entdecken ein neues Ergebnis. Die Links und die Wunschlisten bleiben gleich.',
    },
  },
} satisfies Dict<typeof fr>;
