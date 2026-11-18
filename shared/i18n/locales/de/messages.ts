import type fr from '../fr/messages';
import type { Dict } from '../../types';

export default {
  invitation: {
    greeting: 'Hallo {firstName}! 🎁',
    body: 'Du bist dabei: das Wichteln von {groupName} ({editionLabel}).',
    cta: 'Öffne deinen Link und hinterlass ein paar Geschenk-Hinweise:',
    subject: '{firstName}, dein Link für das Wichteln ({editionLabel})',
  },
  drawn: {
    greeting: '{firstName}, die Lose sind gezogen! 🎁',
    cta: 'Öffne deinen Link, um zu erfahren, wen du beschenkst:',
    subject: '{firstName}, die Lose sind gezogen: dein Umschlag wartet',
  },
  reminder: {
    greeting:
      '{firstName}, dein Umschlag setzt Staub an. Mach ihn schnell auf!',
    cta: 'Dein Link:',
    subject: '{firstName}, dein Umschlag wartet immer noch',
  },
  redraw: {
    greeting:
      '{firstName}, die Karten werden neu gemischt. Es gab eine neue Auslosung: vergiss die alte.',
    cta: 'Dein Link bleibt derselbe:',
    subject: '{firstName}, die Karten werden neu gemischt: neue Auslosung',
  },
  answerRequest: {
    greeting: 'Hallo {firstName}! 🎁',
    body: 'Die Wichtel-Auslosung von {groupName} ({editionLabel}) wurde außerhalb der App gemacht.',
    cta: 'Sag auf deiner Seite, wen du beschenkst, um seine Geschenk-Hinweise zu sehen:',
    subject: '{firstName}, wen beschenkst du? ({editionLabel})',
  },
  answerReminder: {
    greeting: '{firstName}, wir warten nur noch auf dich! 🎁',
    cta: 'Sag, wen du beschenkst: Sobald alle geantwortet haben, sieht jeder die Geschenk-Hinweise seiner Person.',
    subject: '{firstName}, wir warten auf deine Wichtel-Antwort',
  },
  answerCheck: {
    greeting: '{firstName}, kannst du deine Antwort prüfen? 🎁',
    body: 'Beim Wichteln von {groupName} hat sich ein Knoten gebildet: zwei Antworten passen nicht zusammen.',
    cta: 'Prüfe, wen du beschenkst, und korrigiere es bei Bedarf:',
    subject: '{firstName}, prüf deine Wichtel-Antwort',
  },
  guessLine: '🔍 Rate, wer dich beschenkt: deine Tipps bis {guessEnd}.',
  guessReminder: {
    greeting: 'Hallo {firstName}! 🔍',
    body: 'Rate, wer dich dieses Jahr beschenkt: Du hast bis {guessEnd} Zeit für deinen Tipp. Die Antwort gibt es bei der Feier!',
    subject: '{firstName}, rate, wer dich beschenkt',
  },
  guessAuto: {
    subject: 'Nur noch {days} Tage, um zu erraten, wer dich beschenkt',
    greeting: 'Hallo {firstName},',
    body: {
      one: 'Für {editionLabel} ({groupName}) hat schon {count} von {total} Personen getippt. Und du: Wer beschenkt dich?',
      other:
        'Für {editionLabel} ({groupName}) haben schon {count} von {total} Personen getippt. Und du: Wer beschenkt dich?',
    },
    nobody:
      'Für {editionLabel} ({groupName}) hat noch niemand getippt. Und du: Wer beschenkt dich?',
    until:
      'Du hast Zeit bis {guessEnd}. Antwort bei der Feier, mit einer Überraschung.',
    cta: 'Meinen Tipp abgeben',
    skipBefore: 'Keine Lust zu spielen? ',
    skip: 'Ich setze aus',
    skipAfter: ', und wir erinnern dich nicht mehr.',
    once: 'Das ist die einzige automatische Erinnerung, die du bekommst.',
    signature: 'Under the Tree',
  },
  guessMore: {
    subject: 'Noch ein paar Tipps vor dem Ende?',
    greeting: 'Hallo {firstName},',
    body: 'Du hast deinen Tipp zu deinem Wichtel für {editionLabel} ({groupName}) abgegeben. Gut gemacht.',
    more: 'Dir bleiben {days} Tage, um auch zu erraten, wer die anderen beschenkt. Je mehr Tipps, desto schöner die Überraschung bei der Feier.',
    cta: 'Weiter tippen',
  },
  guessPoint: {
    subject: {
      one: 'Devine qui: {count} Person hat noch nicht gespielt',
      other: 'Devine qui: {count} Personen haben noch nicht gespielt',
    },
    greeting: 'Hallo {firstName},',
    body: 'Für {editionLabel} ({groupName}) haben {played} von {total} Personen getippt.',
    missing: {
      one: '{names} hat noch nicht gespielt;',
      other: '{names} haben noch nicht gespielt;',
    },
    noEmail: {
      one: '{noEmail} hat keine E-Mail-Adresse.',
      other: '{noEmail} haben keine E-Mail-Adresse.',
    },
    closes: 'Die Tipps schließen am {guessEnd}, in {days} Tagen.',
    auto: {
      one: 'Morgen geht eine automatische Erinnerung an alle mit Adresse.',
      other:
        'In {count} Tagen geht eine automatische Erinnerung an alle mit Adresse.',
    },
    cta: 'Jetzt erinnern',
    off: 'Du kannst diese E-Mails in den Einstellungen des Spiels abschalten.',
    signature: 'Under the Tree',
  },
  guessEnd: {
    subject: 'Devine qui: Die Tipps sind geschlossen',
    greeting: 'Hallo {firstName},',
    body: {
      one: 'Für {editionLabel} ({groupName}) hat {count} von {total} Personen gespielt. Die Rangliste ist bereit: Sie startet, sobald du die Auslosung aufdeckst.',
      other:
        'Für {editionLabel} ({groupName}) haben {count} von {total} Personen gespielt. Die Rangliste ist bereit: Sie startet, sobald du die Auslosung aufdeckst.',
    },
    cta: 'Die Auslosung aufdecken',
    alone:
      'Wenn du es nicht tust, wird sie morgen um {time} von selbst aufgedeckt.',
    off: 'Du kannst diese E-Mails in den Einstellungen des Spiels abschalten.',
    signature: 'Under the Tree',
  },
  guessResults: {
    subject: 'Die Rangliste von Devine qui ist da',
    greeting: 'Hallo {firstName},',
    body: 'Die Auslosung von {editionLabel} ({groupName}) ist aufgedeckt. Du kannst endlich erfahren, wer dich beschenkt hat und wer es erraten hatte.',
    giftFirst:
      'Wenn du dein Geschenk noch nicht geöffnet hast, mach das zuerst.',
    cta: 'Die Rangliste entdecken',
    once: 'Du bekommst diese Nachricht nur einmal.',
    signature: 'Under the Tree',
  },
  budget: 'Budget: {budget}.',
  eventDate: 'Wir sehen uns am {eventDate}.',
  email: {
    personal: 'Dieser Link gehört nur dir: leite ihn nicht weiter.',
    signature: 'Der Organisator des Wichtelns von {groupName}',
  },
} satisfies Dict<typeof fr>;
