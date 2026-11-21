import type fr from '../fr/messages';
import type { Dict } from '../../types';

export default {
  invitation: {
    greeting: 'Hi {firstName}! 🎁',
    body: 'You’re in: the Secret Santa of {groupName} ({editionLabel}).',
    cta: 'Open your link and write your gift list:',
    subject: '{groupName} Secret Santa: your link, {firstName}',
  },
  drawn: {
    greeting:
      '{firstName}, the names are drawn for the {groupName} Secret Santa! 🎁',
    cta: 'Open your link to find out who you are giving a gift to:',
    subject:
      '{groupName} Secret Santa: {firstName}, the names are drawn, your envelope is waiting',
  },
  reminder: {
    greeting:
      '{firstName}, your envelope for the {groupName} Secret Santa is gathering dust. Open it soon!',
    cta: 'Your link:',
    subject:
      '{groupName} Secret Santa: {firstName}, your envelope is still waiting',
  },
  redraw: {
    greeting:
      '{firstName}, we’re reshuffling the {groupName} Secret Santa. There’s been a new draw: forget the old one.',
    cta: 'Your link stays the same:',
    subject:
      '{groupName} Secret Santa: {firstName}, we’re reshuffling, new draw',
  },
  answerRequest: {
    greeting: 'Hi {firstName}! 🎁',
    body: 'The draw of the {groupName} Secret Santa ({editionLabel}) is already done, outside the app. For what comes next, we meet in the app.',
    how: 'How it works: on your page, you say who you’re giving a gift to. Your answer stays secret, nobody else sees it.',
    hints:
      'You can already write your gift list for the person giving to you. Once everyone has answered, each of us reads the list of the person they give to: a single missing answer keeps the lists closed.',
    game: '🔍 And for fun: Devine qui, a guessing game where everyone tries to guess who gives them their present. Answer on the big day!',
    cta: 'Your personal link, to answer:',
    subject: '{groupName} Secret Santa: who are you giving to, {firstName}?',
  },
  answerReminder: {
    greeting:
      '{firstName}, the {groupName} Secret Santa is only waiting for you! 🎁',
    cta: 'Say who you’re giving a gift to: once everyone has answered, each one sees their person’s gift list.',
    subject:
      '{groupName} Secret Santa: we’re waiting for your answer, {firstName}',
  },
  answerCheck: {
    greeting: '{firstName}, could you check your answer? 🎁',
    body: 'There’s a knot in the Secret Santa of {groupName}: two answers don’t fit together.',
    cta: "Check who you're giving a gift to, and correct it if needed:",
    subject:
      '{groupName} Secret Santa: can you check your answer, {firstName}?',
  },
  guessLine:
    '🔍 Devine qui, the Secret Santa guessing game: who gives you your present? Your guesses until {guessEnd}.',
  guessReminder: {
    greeting: 'Hi {firstName}! 🔍',
    body: 'In the {groupName} Secret Santa ({editionLabel}), we’re playing Devine qui, a little guessing game.',
    howSanta:
      'How it works: you try to guess who gives you your present. One guess, which you can change until {guessEnd}.',
    howAll:
      'How it works: you try to guess who gives to whom, starting with your own Secret Santa. As many guesses as you like, until {guessEnd}.',
    howAllNeutral:
      'How it works: you try to guess who gives to whom, starting with who gives to you. As many guesses as you like, until {guessEnd}.',
    secret:
      'Nobody sees your guesses before the big day. The answers come when the draw is revealed, with a surprise for all the members: the more of you play, the better it will be.',
    cta: 'Your link, to play:',
    subject:
      '{groupName} Secret Santa: guess who gives you your present, {firstName}',
  },
  guessAuto: {
    subject:
      '{groupName} Secret Santa: only {days} days left to guess who gives you your present',
    greeting: 'Hello {firstName},',
    body: {
      one: 'In the {groupName} Secret Santa ({editionLabel}), we’re playing Devine qui: guessing who gives to whom. {count} person out of {total} has already made a guess. What about you: who gives you your present?',
      other:
        'In the {groupName} Secret Santa ({editionLabel}), we’re playing Devine qui: guessing who gives to whom. {count} people out of {total} have already made a guess. What about you: who gives you your present?',
    },
    nobody:
      'In the {groupName} Secret Santa ({editionLabel}), we’re playing Devine qui: guessing who gives to whom. Nobody has made a guess yet. What about you: who gives you your present?',
    until: 'You have until {guessEnd}. Answer on the big day, with a surprise.',
    cta: 'Make my guess',
    skipBefore: 'Don’t feel like playing? ',
    skip: 'I’ll sit this one out',
    skipAfter: ', and we won’t remind you again.',
    once: 'This is the only automatic reminder you will get.',
    signature: 'The {groupName} Secret Santa',
  },
  guessMore: {
    subject: '{groupName} Secret Santa: a few more guesses before the end?',
    greeting: 'Hello {firstName},',
    body: 'You made your guess about your Secret Santa in Devine qui, the game of the {groupName} Secret Santa ({editionLabel}). Well played.',
    bodyNeutral:
      'You made your guess about who gives to you in Devine qui, the game of the {groupName} Secret Santa ({editionLabel}). Well played.',
    more: 'You have {days} days left to guess who gives to the others too. The more guesses, the better the surprise on the big day.',
    cta: 'Continue my guesses',
  },
  guessPoint: {
    subject: {
      one: 'Devine qui, {groupName}: {count} person hasn’t played yet',
      other: 'Devine qui, {groupName}: {count} people haven’t played yet',
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
    signature: 'Under the Tree, the app of your Secret Santa',
  },
  guessEnd: {
    subject: 'Devine qui, {groupName}: the guesses are closed',
    greeting: 'Hello {firstName},',
    body: {
      one: 'For {editionLabel} ({groupName}), {count} person out of {total} played. The palmarès is ready: it starts as soon as you reveal the draw.',
      other:
        'For {editionLabel} ({groupName}), {count} people out of {total} played. The palmarès is ready: it starts as soon as you reveal the draw.',
    },
    cta: 'Reveal the draw',
    alone: 'If you don’t, it will reveal itself tomorrow at {time}.',
    off: 'You can turn these emails off in the game settings.',
    signature: 'Under the Tree, the app of your Secret Santa',
  },
  guessResults: {
    subject: '{groupName} Secret Santa: the Devine qui palmarès is here',
    greeting: 'Hello {firstName},',
    body: 'The draw of the {groupName} Secret Santa ({editionLabel}) is revealed, and Devine qui, the guessing game, has its palmarès. You can finally find out who gave you your present, and who had guessed.',
    giftFirst: "If you haven't opened your gift yet, do it first.",
    cta: 'Discover the results',
    once: "You'll only receive this message once.",
    signature: 'The {groupName} Secret Santa',
  },
  budget: 'Budget: {budget}.',
  eventDate: 'See you on {eventDate}.',
  email: {
    signatureFrom: '{sender}, for the {groupName} Secret Santa',
    personal: 'This link is yours alone: don’t forward it.',
    signature: 'The {groupName} Secret Santa',
  },
} satisfies Dict<typeof fr>;
