import type fr from '../fr/journal';
import type { Dict } from '../../types';

export default {
  someone: 'Jemand',
  unknown: 'Unbekanntes Ereignis',
  events: {
    edition_created: 'Die Ausgabe {label} wurde erstellt',
    participant_added: '{name} ist dabei',
    participant_removed: '{name} macht nicht mehr mit',
    rules_changed: 'Der Organisator hat die Regeln der Auslosung geändert',
    message_sent: 'Der Organisator hat {what} an {name}{via} gesendet',
    link_copied: 'Der Organisator hat den Link von {name} kopiert',
    link_shared: 'Der Organisator hat den Link von {name} geteilt',
    link_regenerated: 'Der Link von {name} wurde neu erzeugt',
    draw_done: {
      one: 'Die Auslosung ist erfolgt, für {count} Teilnehmer',
      other: 'Die Auslosung ist erfolgt, für {count} Teilnehmer',
    },
    draw_cancelled: 'Die Auslosung wurde aufgehoben. Grund: {reason}',
    results_revealed:
      'Der Organisator hat die Ergebnisse vor der Feier aufgedeckt',
    result_revealed:
      'Der Organisator hat das Ergebnis von {name} eingesehen (Notzugriff)',
    result_viewed: '{name} hat den eigenen Umschlag geöffnet',
    avatar_changed: '{name} hat das eigene Symbol geändert',
    language_changed: '{name} hat die eigene Sprache geändert ({language})',
    edition_closed: 'Die Ausgabe {label} ist abgeschlossen',
    draw_revealed:
      'Der Organisator hat die Ergebnisse der Auslosung aufgedeckt',
    answers_started:
      'Der Organisator hat angegeben, dass die Auslosung woanders stattfand: Jeder gibt seine Antwort',
    answer_given: '{name} hat die eigene Antwort gegeben',
    answer_changed: '{name} hat die eigene Antwort geändert',
    answers_validated: {
      one: 'Der Organisator hat die Antworten bestätigt: Die Auslosung gilt für {count} Teilnehmer',
      other:
        'Der Organisator hat die Antworten bestätigt: Die Auslosung gilt für {count} Teilnehmer',
    },
    answers_abandoned:
      'Der Organisator hat die Antworten verworfen, um mit der App auszulosen',
    guesses_enabled: 'Devine qui: Das Tippspiel ist eröffnet',
    guesses_closed: 'Devine qui: Die Tipps sind geschlossen',
    guess_results_ready: 'Devine qui: Die Rangliste ist da',
    guess_auto_reminder_sent: {
      one: 'Devine qui: Eine automatische Erinnerung ging an {count} Person',
      other:
        'Devine qui: Eine automatische Erinnerung ging an {count} Personen',
    },
    guess_reminder_sent: {
      one: 'Der Organisator hat {count} Person an das Spiel erinnert',
      other: 'Der Organisator hat {count} Personen an das Spiel erinnert',
    },
  },
  noReason: 'nicht angegeben',
  what: {
    invitation: '„Einladung“',
    drawn: '„Auslosung erfolgt“',
    reminder: '„Erinnerung“',
    redraw: '„Neue Auslosung“',
    answerRequest: '„Anfrage“',
    answerReminder: '„Erinnerung“',
    answerCheck: '„Zu prüfen“',
    other: 'eine Nachricht',
  },
  via: {
    copy: ' als kopierte Nachricht',
    share: ' durch Teilen',
    email: ' per E-Mail',
  },
  own: {
    participant_added: 'Du bist dabei',
    participant_removed: 'Du machst nicht mehr mit',
    message_sent: 'Der Organisator hat dir {what}{via} gesendet',
    link_copied: 'Der Organisator hat deinen Link kopiert',
    link_shared: 'Der Organisator hat deinen Link geteilt',
    link_regenerated: 'Dein Link wurde neu erzeugt',
    result_revealed:
      'Der Organisator hat in deinen Umschlag geschaut (Notzugriff)',
    result_viewed: 'Du hast deinen Umschlag geöffnet',
    avatar_changed: 'Du hast dein Symbol geändert',
    language_changed: 'Du hast deine Sprache geändert ({language})',
    answer_given: 'Du hast deine Antwort gegeben',
    answer_changed: 'Du hast deine Antwort geändert',
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
    person: 'Betroffene Person',
    everyone: 'Alle',
    me: 'Ich ({name})',
    meNote: {
      one: 'Alles, was deinen Link und deinen Umschlag betrifft. Kommt eine Zeile nicht von dir, sag es deinem Organisator.',
      other:
        'Alles, was deinen Link und deinen Umschlag betrifft. Kommt eine Zeile nicht von dir, sag es deinen Organisatoren.',
    },
  },
  grouped: {
    result_viewed: '{strong} haben ihren Umschlag geöffnet',
    message_sent: 'Der Organisator hat {what} an {strong}{via} gesendet',
    link_copied: 'Der Organisator hat {strong} kopiert',
    link_shared: 'Der Organisator hat {strong} geteilt',
    participant_added: '{strong} sind dabei',
  },
  groupedCount: {
    result_viewed: { one: '{count} Person', other: '{count} Personen' },
    message_sent: { one: '{count} Person', other: '{count} Personen' },
    link_copied: { one: '{count} Link', other: '{count} Links' },
    link_shared: { one: '{count} Link', other: '{count} Links' },
    participant_added: { one: '{count} Person', other: '{count} Personen' },
  },
  help: {
    title: 'Wozu dient das Protokoll?',
    warning: {
      one: 'Eine Zeile betrifft dich und kommt nicht von dir? Sag es deinem Organisator: Er kann deinen Link erneuern.',
      other:
        'Eine Zeile betrifft dich und kommt nicht von dir? Sag es deinen Organisatoren: Sie können deinen Link erneuern.',
    },
    intro:
      'Damit die Auslosung ehrlich bleibt. Schummeln bleibt möglich, aber man sieht es.',
    notes: 'Es notiert',
    notesBody:
      'Die Auslosung, jeden gesendeten oder erneuerten Link, jeden geöffneten Umschlag und jeden Blick des Organisators in einen Umschlag.',
    never: 'Es verrät nie',
    neverBody: 'Wer wen beschenkt, noch die Geschenk-Hinweise der anderen.',
    who: 'Die ganze Gruppe sieht es',
    whoBody: 'Teilnehmer und Organisatoren, mit denselben Zeilen.',
  },
  alert: {
    at: '{day} um {time}',
    happened: 'Was passiert ist.',
    why: 'Warum das erlaubt ist.',
    changes: 'Was sich ändert.',
    changesYou: 'Was sich für dich ändert.',
    result_revealed: {
      title: 'Zugriff im Notfall',
      happened:
        'Der Organisator hat nachgesehen, wen {name} beschenkt. Er hat nur dieses eine Ergebnis gesehen.',
      forOthers:
        'Nichts: Dein Umschlag und deine Hinweise wurden nicht gesehen.',
      forMe:
        'Er weiß, wen du beschenkst. Sonst hat es niemand gesehen, und dein Umschlag ändert sich nicht.',
      why: 'Bei Zweifel oder Streit muss man nachprüfen können. Der Organisator muss einen Satz abschreiben und akzeptieren, dass die ganze Gruppe es erfährt.',
      changes:
        'Die anderen Ergebnisse und die Geschenk-Hinweise wurden nicht gesehen.',
    },
    results_revealed: {
      title: 'Ergebnisse vor der Feier aufgedeckt',
      happened:
        'Der Organisator hat aufgedeckt, wer wen beschenkt, noch vor der Feier.',
      why: 'Aufdecken ist ab dem Tag der Feier erlaubt. Früher muss der Organisator einen Satz abschreiben und akzeptieren, dass die ganze Gruppe es erfährt.',
      changes:
        'Dein Umschlag ändert sich nicht, und die ganze Gruppe sieht, wer wen beschenkt. Die Auslosung kann nicht mehr aufgehoben werden.',
    },
    draw_cancelled: {
      title: 'Auslosung abgesagt',
      happened:
        'Der Organisator hat die Auslosung abgesagt, aus dem oben genannten Grund. Die alten Ergebnisse sind gelöscht.',
      why: 'Eine Absage, ein Vergessener: Lieber neu auslosen als eine falsche Auslosung behalten. Der Grund steht für die ganze Gruppe im Protokoll.',
      changes:
        'Alle bekommen eine neue Nachricht und öffnen einen neuen Umschlag. Die Links und die Geschenk-Hinweise bleiben gleich.',
    },
  },
} satisfies Dict<typeof fr>;
