import type fr from '../fr/messages';
import type { Dict } from '../../types';

export default {
  invitation: {
    greeting: 'Hallo {firstName}! 🎁',
    body: 'Du machst beim Wichteln von {groupName} mit ({editionLabel}).',
    cta: 'Öffne deinen Link und hinterlass ein paar Geschenk-Hinweise:',
    subject: '{firstName}, dein Link für das Wichteln ({editionLabel})',
  },
  drawn: {
    greeting: '{firstName}, die Auslosung ist erfolgt! 🎁',
    cta: 'Öffne deinen Link, um zu erfahren, wen du beschenkst:',
    subject: '{firstName}, die Wichtel-Auslosung ist erfolgt',
  },
  reminder: {
    greeting:
      'Kleine Erinnerung, {firstName}: dein Link wartet auf dich, denk daran, ihn zu öffnen.',
    cta: 'Dein Link:',
    subject: '{firstName}, dein Wichtel-Link wartet auf dich',
  },
  redraw: {
    greeting:
      '{firstName}, es gab eine neue Auslosung: dein altes Ergebnis gilt nicht mehr.',
    cta: 'Dein Link bleibt derselbe:',
    subject: '{firstName}, neue Wichtel-Auslosung',
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
    body: 'Zwei Antworten beim Wichteln von {groupName} passen nicht zusammen.',
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
    personal: 'Dieser Link ist persönlich, leite ihn nicht weiter.',
    signature: 'Der Organisator des Wichtelns von {groupName}',
  },
} satisfies Dict<typeof fr>;
