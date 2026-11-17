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
