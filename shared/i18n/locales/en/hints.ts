import type fr from '../fr/hints';
import type { Dict } from '../../types';

export default {
  title: 'My gift hints',
  intro: 'Help the person who gives you a present. Everything is optional.',
  whoSees:
    'Only the person who gives you a present will see them, once the draw is done.',
  requested:
    'The person who gives you a present is looking for inspiration. Six multiple-choice questions are enough: thirty seconds.',
  readOnly: 'Your hints can no longer be changed for this edition.',
  until: 'You can change them until the party.',
  start: {
    label: 'To begin',
    title: 'Six questions, thirty seconds',
    examples: 'Useful or surprising? A thing or a moment?',
    body: 'One tap per answer, nothing to write.',
    action: 'Start',
  },
  copy: {
    action: 'Reuse my hints from {edition}',
    hint: 'You can touch them up',
    done: 'Hints from {edition} reused',
  },
  me: { title: 'Me and presents', edit: 'Change' },
  question: {
    context: 'question {index} of 6',
    later: 'Later',
    both: 'Either is fine',
    footer: 'One tap, and on to the next. You can change your mind.',
    progress: 'Question {index} of 6',
  },
  questions: {
    usefulOrSurprising: {
      title: 'Useful, or surprising?',
      first: 'Useful',
      firstHelp: 'Something that will really be used.',
      second: 'Surprising',
      secondHelp: 'Something I would never have thought of.',
    },
    objectOrMoment: {
      title: 'A thing, or a moment?',
      first: 'A thing',
      firstHelp: 'Something to keep or to use.',
      second: 'A moment',
      secondHelp: 'An outing, a meal, a workshop.',
    },
    keepOrConsume: {
      title: 'To keep, or to use up?',
      first: 'To keep',
      firstHelp: 'Something that lasts.',
      second: 'To use up',
      secondHelp: 'To eat, to drink, to use until it is gone.',
    },
    selfOrShared: {
      title: 'Just for me, or to share?',
      first: 'Just for me',
      firstHelp: 'All mine.',
      second: 'To share',
      secondHelp: 'With my loved ones, together.',
    },
    secondHand: {
      title: 'Second-hand or handmade: fine with you?',
      first: 'Yes, that’s fine',
      firstHelp: 'Second-hand, or something homemade.',
      second: 'Rather new',
      secondHelp: 'Something new, in its box.',
    },
    surprise: {
      title: 'Surprise me, or I’d rather know?',
      first: 'Surprise me',
      firstHelp: 'I’ll find out on the day of the party.',
      second: 'I’d rather know',
      secondHelp: 'A precise idea, no bad surprise.',
    },
  },
  tags: {
    usefulOrSurprising: {
      first: 'Rather useful',
      second: 'Rather surprising',
      both: 'Useful or surprising',
    },
    objectOrMoment: {
      first: 'A thing',
      second: 'A moment',
      both: 'A thing or a moment',
    },
    keepOrConsume: {
      first: 'To keep',
      second: 'To use up',
      both: 'To keep or to use up',
    },
    selfOrShared: {
      first: 'Just for them',
      second: 'To share',
      both: 'Just for them or to share',
    },
    secondHand: {
      first: 'Second-hand is fine',
      second: 'Rather new',
      both: 'New or second-hand',
    },
    surprise: {
      first: 'Loves surprises',
      second: 'Would rather know',
      both: 'Surprise or not',
    },
  },
  texts: {
    lately: {
      title: 'These days',
      empty: 'Say what keeps me busy',
      help: 'What keeps you busy or tempts you these days. No need for precise items.',
      placeholder: 'A new hobby, a book, a project…',
      giver: 'These days',
    },
    wouldHelp: {
      title: 'What would help me',
      empty: 'Say what would help me',
      help: 'What would come in handy in your daily life.',
      placeholder: 'What you use every day, what you are missing…',
      giver: 'What would help them',
    },
    avoid: {
      title: 'I avoid, or already have',
      empty: 'Say what I avoid',
      help: 'What is better not to give you.',
      placeholder: 'An allergy, what you have too much of…',
      giver: 'To avoid',
    },
  },
  ideas: {
    title: 'A precise idea, if you’re stuck',
    giver: 'If you’re stuck',
    add: 'Add an idea',
    addHint: 'An item, with a link if you like',
    left: {
      one: '{count} more possible',
      other: '{count} more possible',
    },
    why: 'A precise idea spoils nothing: many prefer a safe bet.',
  },
  result: {
    title: 'To help you choose',
    none: '{name} hasn’t left any hints yet.',
    ask: 'Ask for hints',
    askHint: 'Without saying it comes from you.',
    sent: 'Request sent.',
    sentEmail: '{name} just got an email, without knowing it comes from you.',
    sentPage:
      '{name} will see it on their hints page, without knowing it comes from you.',
    willEmail: 'You will get an email as soon as hints arrive.',
    willSee: 'Come back here: the hints will show as soon as they arrive.',
    waiting: 'Gift hints are waiting for you.',
  },
  request: {
    title: 'Ask {name} for hints?',
    bodyEmail:
      '{name} gets an email inviting them to note their tastes and what is better avoided.',
    bodyPage:
      '{name} will see it on their hints page, inviting them to note their tastes and what is better avoided.',
    anonymous: 'Your name appears nowhere',
    anonymousHelp:
      'Not in the email, not in the journal, not to the organizer.',
    once: 'One request per draw',
    onceHelp: 'No reminder possible: nobody gets pestered.',
    send: 'Send the request',
    sending: 'Sending the request…',
    cancel: 'Not now',
  },
  state: {
    none: 'Nothing yet',
    filledEditable: 'Filled in · can be changed until the party',
    filledLocked: 'Filled in · can no longer be changed',
    left: 'Left hints',
  },
  setting: {
    title: 'Gift hints',
    help: 'What everyone can note to help the person who gives them a present.',
    full: 'Portrait and precise ideas',
    fullHelp: 'The six questions, current interests, and item ideas',
    portrait: 'Portrait only',
    portraitHelp: 'No item idea: the surprise stays whole',
    none: 'No hints',
    noneHelp: 'Everyone manages on their own',
  },
  email: {
    request: {
      subject: 'Someone is looking for a gift idea for you',
      greeting: 'Hello {name},',
      body: 'The person who gives you a present for {edition} ({group}) doesn’t know what to choose. Help them: six multiple-choice questions, thirty seconds, and a few words if you like.',
      cta: 'Leave a few hints:',
      anonymous: 'We won’t tell you who is asking: it’s a Secret Santa.',
      once: 'You will only get this message once.',
    },
    arrived: {
      subject: 'Gift hints are waiting for you',
      greeting: 'Hello {name},',
      body: 'The person you give a present to for {edition} ({group}) left some hints. Open your link to read them:',
    },
  },
} satisfies Dict<typeof fr>;
