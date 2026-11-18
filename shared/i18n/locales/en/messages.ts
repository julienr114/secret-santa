import type fr from '../fr/messages';
import type { Dict } from '../../types';

export default {
  invitation: {
    greeting: 'Hi {firstName}! 🎁',
    body: 'You’re in: the Secret Santa of {groupName} ({editionLabel}).',
    cta: 'Open your link and leave a few gift hints:',
    subject: '{firstName}, your link for the Secret Santa ({editionLabel})',
  },
  drawn: {
    greeting: '{firstName}, the names are drawn! 🎁',
    cta: 'Open your link to find out who you are giving a gift to:',
    subject: '{firstName}, the names are drawn: your envelope is waiting',
  },
  reminder: {
    greeting: '{firstName}, your envelope is gathering dust. Open it soon!',
    cta: 'Your link:',
    subject: '{firstName}, your envelope is still waiting',
  },
  redraw: {
    greeting:
      '{firstName}, we’re reshuffling. There’s been a new draw: forget the old one.',
    cta: 'Your link stays the same:',
    subject: '{firstName}, we’re reshuffling: new draw',
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
    body: 'There’s a knot in the Secret Santa of {groupName}: two answers don’t fit together.',
    cta: "Check who you're giving a gift to, and correct it if needed:",
    subject: '{firstName}, check your Secret Santa answer',
  },
  guessLine: "🔍 Guess who's giving you a gift: your guesses until {guessEnd}.",
  guessReminder: {
    greeting: 'Hi {firstName}! 🔍',
    body: "Guess who's giving you a gift this year: you have until {guessEnd} to make your guess. The answer comes at the party!",
    subject: "{firstName}, guess who's giving you a gift",
  },
  guessAuto: {
    subject: 'Only {days} days left to guess who gives you your present',
    greeting: 'Hello {firstName},',
    body: {
      one: 'For {editionLabel} ({groupName}), {count} person out of {total} has already made a guess. What about you: who gives you your present?',
      other:
        'For {editionLabel} ({groupName}), {count} people out of {total} have already made a guess. What about you: who gives you your present?',
    },
    nobody:
      'For {editionLabel} ({groupName}), nobody has made a guess yet. What about you: who gives you your present?',
    until: 'You have until {guessEnd}. Answer at the party, with a surprise.',
    cta: 'Make my guess',
    skipBefore: 'Don’t feel like playing? ',
    skip: 'I’ll sit this one out',
    skipAfter: ', and we won’t remind you again.',
    once: 'This is the only automatic reminder you will get.',
    signature: 'Under the Tree',
  },
  guessMore: {
    subject: 'A few more guesses before the end?',
    greeting: 'Hello {firstName},',
    body: 'You made your guess about your Secret Santa for {editionLabel} ({groupName}). Well played.',
    more: 'You have {days} days left to guess who gives to the others too. The more guesses, the better the surprise at the party.',
    cta: 'Continue my guesses',
  },
  guessPoint: {
    subject: {
      one: 'Devine qui: {count} person hasn’t played yet',
      other: 'Devine qui: {count} people haven’t played yet',
    },
    greeting: 'Hello {firstName},',
    body: 'For {editionLabel} ({groupName}), {played} people out of {total} have made a guess.',
    missing: {
      one: '{names} hasn’t played yet;',
      other: '{names} haven’t played yet;',
    },
    noEmail: {
      one: '{noEmail} has no email address.',
      other: '{noEmail} have no email address.',
    },
    closes: 'The guesses close on {guessEnd}, in {days} days.',
    auto: {
      one: 'An automatic reminder will go tomorrow to those with an address.',
      other:
        'An automatic reminder will go in {count} days to those with an address.',
    },
    cta: 'Remind them now',
    off: 'You can turn these emails off in the game settings.',
    signature: 'Under the Tree',
  },
  guessEnd: {
    subject: 'Devine qui: the guesses are closed',
    greeting: 'Hello {firstName},',
    body: {
      one: 'For {editionLabel} ({groupName}), {count} person out of {total} played. The palmarès is ready: it starts as soon as you reveal the draw.',
      other:
        'For {editionLabel} ({groupName}), {count} people out of {total} played. The palmarès is ready: it starts as soon as you reveal the draw.',
    },
    cta: 'Reveal the draw',
    alone: 'If you don’t, it will reveal itself tomorrow at {time}.',
    off: 'You can turn these emails off in the game settings.',
    signature: 'Under the Tree',
  },
  guessResults: {
    subject: 'The Devine qui results are in',
    greeting: 'Hello {firstName},',
    body: 'The draw of {editionLabel} ({groupName}) is revealed. You can finally find out who gave you your gift, and who had guessed.',
    giftFirst: "If you haven't opened your gift yet, do it first.",
    cta: 'Discover the results',
    once: "You'll only receive this message once.",
    signature: 'Under the Tree',
  },
  budget: 'Budget: {budget}.',
  eventDate: 'See you on {eventDate}.',
  email: {
    personal: 'This link is yours alone: don’t forward it.',
    signature: 'The organizer of the Secret Santa of {groupName}',
  },
} satisfies Dict<typeof fr>;
