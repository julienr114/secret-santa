import type fr from '../fr/hints';
import type { Dict } from '../../types';

export default {
  question: {
    both: 'Either is fine',
    progress: 'Question {index} of {count}',
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
      firstHelp: 'Something concrete, to unwrap.',
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
      firstHelp: 'A treat for myself.',
      second: 'To share',
      secondHelp: 'A game, a meal, something to enjoy together.',
    },
    secondHand: {
      title: 'New, or second-hand?',
      first: 'Second-hand or handmade',
      firstHelp: 'Second-hand, or something homemade: I like that.',
      second: 'New',
      secondHelp: 'Something new, in its box.',
    },
    surprise: {
      title: 'Surprise me, or I’d rather know?',
      first: 'Surprise me',
      firstHelp: 'I’ll find out on the big day.',
      second: 'I’d rather know',
      secondHelp: 'I give a precise idea further down.',
    },
  },
  // The answers on the participant's own page, ending the sentence of
  // `me.title`, in lower case.
  tags: {
    usefulOrSurprising: {
      first: 'a useful present',
      second: 'a surprising present',
      both: 'useful or surprising, either way',
    },
    objectOrMoment: {
      first: 'a thing',
      second: 'a moment',
      both: 'a thing or a moment',
    },
    keepOrConsume: {
      first: 'something to keep',
      second: 'something to use up',
      both: 'to keep or to use up',
    },
    selfOrShared: {
      first: 'a present just for me',
      second: 'a present to share',
      both: 'just for me or to share',
    },
    secondHand: {
      first: 'second-hand or handmade',
      second: 'something new',
      both: 'new or second-hand',
    },
    surprise: {
      first: 'a surprise',
      second: 'knowing in advance',
      both: 'surprise or not',
    },
  },
  giver: {
    prefers: '{name} prefers:',
    choices: {
      usefulOrSurprising: {
        first: 'a useful present rather than a surprising one',
        second: 'a surprising present rather than a useful one',
      },
      objectOrMoment: {
        first: 'a thing rather than a moment',
        second: 'a moment rather than a thing',
      },
      keepOrConsume: {
        first: 'something to keep rather than to use up',
        second: 'something to use up rather than to keep',
      },
      selfOrShared: {
        first: 'a present just for them rather than to share',
        second: 'a present to share rather than just for them',
      },
    },
    secondHand: {
      first: 'Second-hand or handmade, gladly.',
      second: 'Rather new than second-hand.',
    },
    surprise: {
      first: '{name} loves surprises.',
      second: '{name} would rather know what they get.',
    },
    // The subject of « {subject} : peu importe. ».
    subjects: {
      usefulOrSurprising: 'Useful or surprising',
      objectOrMoment: 'A thing or a moment',
      keepOrConsume: 'To keep or to use up',
      selfOrShared: 'Just for oneself or to share',
      secondHand: 'New or second-hand',
      surprise: 'Surprise or not',
    },
    indifferent: '{subject}: either is fine.',
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
      placeholder: 'What you don’t like, what you have too much of…',
      giver: 'To avoid',
    },
  },
  ideas: {
    giver: 'If you’re stuck',
  },
  list: {
    title: 'My gift list',
  },
  result: {
    listOf: '{name}’s gift list',
    newIdeas: {
      one: '{count} new idea since your last visit',
      other: '{count} new ideas since your last visit',
    },
    nothing: '{name} hasn’t written anything yet.',
    listHelp: 'Anonymous mode will be on for you there.',
    title: 'To help you choose',
    ask: 'Ask for ideas',
    askHint: 'Without saying it comes from you.',
    sent: 'Request sent.',
    sentEmail: '{name} just got an email, without knowing it comes from you.',
    sentPage:
      '{name} will see it when opening their link, without knowing it comes from you.',
    willEmail: 'You will get an email as soon as ideas arrive.',
    willSee: 'Come back here: the ideas will show as soon as they arrive.',
  },
  request: {
    title: 'Ask {name} for ideas?',
    bodyEmail:
      '{name} gets an email inviting them to note their tastes and what is better avoided.',
    bodyPage:
      '{name} will see it on their ideas page, inviting them to note their tastes and what is better avoided.',
    anonymous: 'Your name appears nowhere',
    anonymousHelp: {
      one: 'Not in the email, not in the journal, not to the organizer.',
      other: 'Not in the email, not in the journal, not to the organizers.',
    },
    once: 'One request per Secret Santa',
    onceHelp: 'No reminders: we don’t pester anyone.',
    send: 'Send the request',
    sending: 'Sending the request…',
    cancel: 'Not now',
  },
  state: {
    hintsLeft: {
      one: '{count} of {total} wrote their list',
      other: '{count} of {total} wrote their list',
    },
    left: 'Wrote their list',
  },
  email: {
    request: {
      subject: 'someone is looking for a gift idea for you',
      greeting: 'Hello {name},',
      body: 'The person who gives you a present for {edition} ({group}) doesn’t know what to choose.',
      help: 'Help them: write your gift list, or a few words about what you like.',
      cta: 'Write my list',
      anonymous:
        'We won’t tell you who is asking: it’s a Secret Santa. You will only get this message once.',
    },
  },
} satisfies Dict<typeof fr>;
