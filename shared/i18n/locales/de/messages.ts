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
  budget: 'Budget: {budget}.',
  eventDate: 'Wir sehen uns am {eventDate}.',
  email: {
    personal: 'Dieser Link ist persönlich, leite ihn nicht weiter.',
    signature: 'Der Organisator des Wichtelns von {groupName}',
  },
} satisfies Dict<typeof fr>;
