import type fr from '../fr/messages';
import type { Dict } from '../../types';

export default {
  invitation: {
    greeting: 'Hi {firstName}! 🎁',
    body: "You're taking part in the Secret Santa of {groupName} ({editionLabel}).",
    cta: 'Open your link and leave a few gift hints:',
    subject: '{firstName}, your link for the Secret Santa ({editionLabel})',
  },
  drawn: {
    greeting: '{firstName}, the draw is done! 🎁',
    cta: 'Open your link to find out who you are giving a gift to:',
    subject: '{firstName}, the Secret Santa draw is done',
  },
  reminder: {
    greeting:
      'A quick reminder, {firstName}: your link is waiting, remember to open it.',
    cta: 'Your link:',
    subject: '{firstName}, your Secret Santa link is waiting',
  },
  redraw: {
    greeting:
      '{firstName}, a new draw has taken place: your previous result is no longer valid.',
    cta: 'Your link stays the same:',
    subject: '{firstName}, new Secret Santa draw',
  },
  answerRequest: {
    greeting: 'Hi {firstName}! 🎁',
    body: 'The Secret Santa draw of {groupName} ({editionLabel}) was made outside the app.',
    cta: "Say on your page who you're giving a gift to, to see their gift hints:",
    subject: '{firstName}, who are you giving a gift to? ({editionLabel})',
  },
  answerReminder: {
    greeting: "{firstName}, we're only waiting for you! 🎁",
    cta: "Say who you're giving a gift to: once everyone has answered, each one sees their person's gift hints.",
    subject: '{firstName}, we are waiting for your Secret Santa answer',
  },
  answerCheck: {
    greeting: '{firstName}, could you check your answer? 🎁',
    body: "Two answers of the Secret Santa of {groupName} don't fit together.",
    cta: "Check who you're giving a gift to, and correct it if needed:",
    subject: '{firstName}, check your Secret Santa answer',
  },
  budget: 'Budget: {budget}.',
  eventDate: 'See you on {eventDate}.',
  email: {
    personal: 'This link is personal, do not forward it.',
    signature: 'The organizer of the Secret Santa of {groupName}',
  },
} satisfies Dict<typeof fr>;
