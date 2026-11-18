import type fr from '../fr/messages';
import type { Dict } from '../../types';

export default {
  invitation: {
    greeting: 'Hallo {firstName}! 🎁',
    body: 'Du bist dabei: das Wichteln von {groupName} ({editionLabel}).',
    cta: 'Öffne deinen Link und hinterlass ein paar Geschenk-Hinweise:',
    subject: 'Wichteln {groupName}: dein Link, {firstName}',
  },
  drawn: {
    greeting:
      '{firstName}, beim Wichteln von {groupName} sind die Lose gezogen! 🎁',
    cta: 'Öffne deinen Link, um zu erfahren, wen du beschenkst:',
    subject:
      'Wichteln {groupName}: {firstName}, die Lose sind gezogen, dein Umschlag wartet',
  },
  reminder: {
    greeting:
      '{firstName}, dein Umschlag beim Wichteln von {groupName} setzt Staub an. Mach ihn schnell auf!',
    cta: 'Dein Link:',
    subject:
      'Wichteln {groupName}: {firstName}, dein Umschlag wartet immer noch',
  },
  redraw: {
    greeting:
      '{firstName}, beim Wichteln von {groupName} werden die Karten neu gemischt. Es gab eine neue Auslosung: vergiss die alte.',
    cta: 'Dein Link bleibt derselbe:',
    subject:
      'Wichteln {groupName}: {firstName}, die Karten werden neu gemischt, neue Auslosung',
  },
  answerRequest: {
    greeting: 'Hallo {firstName}! 🎁',
    body: 'Die Auslosung beim Wichteln von {groupName} ({editionLabel}) ist schon gemacht, außerhalb der App. Für alles Weitere treffen wir uns in der App.',
    how: 'So geht’s: Auf deiner Seite sagst du, wen du beschenkst. Deine Antwort bleibt geheim, niemand sonst sieht sie.',
    hints:
      'Du kannst schon jetzt deine Geschenk-Hinweise für die Person hinterlassen, die dich beschenkt. Sobald alle geantwortet haben, liest jeder die Hinweise der Person, die er beschenkt: Fehlt eine einzige Antwort, bleiben sie zu.',
    game: '🔍 Und zum Spaß: Devine qui, ein Tippspiel, bei dem jeder rät, wer ihn beschenkt. Antwort bei der Feier!',
    cta: 'Dein persönlicher Link, zum Antworten:',
    subject: 'Wichteln {groupName}: Wen beschenkst du, {firstName}?',
  },
  answerReminder: {
    greeting:
      '{firstName}, beim Wichteln von {groupName} fehlt nur noch deine Antwort! 🎁',
    cta: 'Sag, wen du beschenkst: Sobald alle geantwortet haben, sieht jeder die Geschenk-Hinweise seiner Person.',
    subject: 'Wichteln {groupName}: Wir warten auf deine Antwort, {firstName}',
  },
  answerCheck: {
    greeting: '{firstName}, kannst du deine Antwort prüfen? 🎁',
    body: 'Beim Wichteln von {groupName} hat sich ein Knoten gebildet: zwei Antworten passen nicht zusammen.',
    cta: 'Prüfe, wen du beschenkst, und korrigiere es bei Bedarf:',
    subject:
      'Wichteln {groupName}: Kannst du deine Antwort prüfen, {firstName}?',
  },
  guessLine:
    '🔍 Devine qui, das Tippspiel zum Wichteln: Wer beschenkt dich? Deine Tipps bis {guessEnd}.',
  guessReminder: {
    greeting: 'Hallo {firstName}! 🔍',
    body: 'Devine qui, das Tippspiel zum Wichteln von {groupName}: Wer beschenkt dich dieses Jahr? Du hast bis {guessEnd} Zeit für deinen Tipp. Antwort bei der Feier!',
    subject: 'Wichteln {groupName}: Rate, wer dich beschenkt, {firstName}',
  },
  guessAuto: {
    subject:
      'Wichteln {groupName}: Nur noch {days} Tage, um zu erraten, wer dich beschenkt',
    greeting: 'Hallo {firstName},',
    body: {
      one: 'Beim Wichteln von {groupName} ({editionLabel}) spielen wir Devine qui: raten, wer wen beschenkt. {count} von {total} Personen hat schon getippt. Und du: Wer beschenkt dich?',
      other:
        'Beim Wichteln von {groupName} ({editionLabel}) spielen wir Devine qui: raten, wer wen beschenkt. {count} von {total} Personen haben schon getippt. Und du: Wer beschenkt dich?',
    },
    nobody:
      'Beim Wichteln von {groupName} ({editionLabel}) spielen wir Devine qui: raten, wer wen beschenkt. Noch niemand hat getippt. Und du: Wer beschenkt dich?',
    until:
      'Du hast Zeit bis {guessEnd}. Antwort bei der Feier, mit einer Überraschung.',
    cta: 'Meinen Tipp abgeben',
    skipBefore: 'Keine Lust zu spielen? ',
    skip: 'Ich setze aus',
    skipAfter: ', und wir erinnern dich nicht mehr.',
    once: 'Das ist die einzige automatische Erinnerung, die du bekommst.',
    signature: 'Das Wichteln von {groupName}',
  },
  guessMore: {
    subject: 'Wichteln {groupName}: Noch ein paar Tipps vor dem Ende?',
    greeting: 'Hallo {firstName},',
    body: 'Du hast bei Devine qui, dem Spiel zum Wichteln von {groupName} ({editionLabel}), deinen Tipp zu deinem Wichtel abgegeben. Gut gemacht.',
    more: 'Dir bleiben {days} Tage, um auch zu erraten, wer die anderen beschenkt. Je mehr Tipps, desto schöner die Überraschung bei der Feier.',
    cta: 'Weiter tippen',
  },
  guessPoint: {
    subject: {
      one: 'Devine qui, {groupName}: {count} Person hat noch nicht gespielt',
      other:
        'Devine qui, {groupName}: {count} Personen haben noch nicht gespielt',
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
    signature: 'Under the Tree, die App für euer Wichteln',
  },
  guessEnd: {
    subject: 'Devine qui, {groupName}: Die Tipps sind geschlossen',
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
    signature: 'Under the Tree, die App für euer Wichteln',
  },
  guessResults: {
    subject: 'Wichteln {groupName}: Die Rangliste von Devine qui ist da',
    greeting: 'Hallo {firstName},',
    body: 'Die Auslosung beim Wichteln von {groupName} ({editionLabel}) ist aufgedeckt, und Devine qui, das Tippspiel, hat seine Rangliste. Endlich erfährst du, wer dich beschenkt hat und wer es erraten hatte.',
    giftFirst:
      'Wenn du dein Geschenk noch nicht geöffnet hast, mach das zuerst.',
    cta: 'Die Rangliste entdecken',
    once: 'Du bekommst diese Nachricht nur einmal.',
    signature: 'Das Wichteln von {groupName}',
  },
  budget: 'Budget: {budget}.',
  eventDate: 'Wir sehen uns am {eventDate}.',
  email: {
    signatureFrom: '{sender}, fürs Wichteln von {groupName}',
    personal: 'Dieser Link gehört nur dir: leite ihn nicht weiter.',
    signature: 'Das Wichteln von {groupName}',
  },
} satisfies Dict<typeof fr>;
