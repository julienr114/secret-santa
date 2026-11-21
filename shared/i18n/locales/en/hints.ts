import type fr from '../fr/hints';
import type { Dict } from '../../types';

export default {
  title: 'My gift ideas',
  intro: 'Give a hand to the person giving you a gift. Everything is optional.',
  whoSees:
    'Only the person who gives you a present will see them, once the draw is done.',
  requested: {
    title: 'The person who gives you a present is looking for inspiration.',
    body: 'Six multiple-choice questions are enough: thirty seconds.',
    bodyPortrait: 'Five multiple-choice questions are enough: thirty seconds.',
  },
  readOnly: 'Your ideas are set: that’s a wrap for this year.',
  until: 'You can change them until the big day.',
  start: {
    label: 'To begin',
    title: 'Six questions, thirty seconds',
    titlePortrait: 'Five questions, thirty seconds',
    examples: 'Useful or surprising? A thing or a moment?',
    body: 'One tap per answer, nothing to write.',
    action: 'Start',
  },
  copy: {
    action: 'Reuse my ideas from {edition}',
    hint: 'You can touch them up',
    done: 'Ideas from {edition} reused',
  },
  me: {
    title: 'When it comes to presents, I prefer…',
    context: 'Me and presents',
  },
  question: {
    context: 'question {index} of {count}',
    clear: 'Clear my answer',
    later: 'Later',
    both: 'Either is fine',
    footer: 'One tap, and on to the next. You can change your mind.',
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
      placeholder: 'An allergy, what you have too much of…',
      giver: 'To avoid',
    },
  },
  ideas: {
    title: 'A specific idea, just in case',
    giver: 'If you’re stuck',
    add: 'Add an idea',
    addHint: 'An item, with a link if you like',
    left: {
      one: '{count} more possible',
      other: '{count} more possible',
    },
    why: 'A precise idea spoils nothing: many prefer a safe bet.',
  },
  list: {
    title: 'My gift list',
    help: 'The person giving you a gift will see a link to it. What they tick there is anonymous: nobody will know it is them, not even you.',
    add: 'Link a gift list',
    addHint: 'The person giving you a gift will see a link to it',
    change: 'Change',
    mine: 'Your list, published',
    figuring: 'A list you are on, published',
    published: 'Published',
    unshared: 'It is no longer published: the link no longer shows.',
    login: 'Log in to link one of your gift lists.',
    loginAction: 'Log in',
    sheetTitle: 'Which list?',
    sheetHelp:
      'The lists you hold, and those you are on. Only a published list can be linked.',
    rowMine: 'Your list · published',
    rowFiguring: '{name}’s list · you are on it',
    rowDraft: 'Draft: publish it first',
    none: 'No list',
    validate: 'Confirm',
    untitled: 'Untitled list',
    done: 'List linked to your ideas',
    removed: 'No list linked to your ideas any more',
  },
  result: {
    listOf: '{name}’s gift list',
    newIdeas: {
      one: '{count} new idea since your last visit',
      other: '{count} new ideas since your last visit',
    },
    nothing: '{name} hasn’t written anything yet.',
    list: 'Their gift list: {title}',
    listHelp: 'Anonymous mode will be on for you there.',
    title: 'To help you choose',
    isNew: 'New',
    updatedOn: 'Ideas updated on {date}',
    none: '{name} hasn’t left any ideas yet.',
    ask: 'Ask for ideas',
    sentEmailNamed: '{name} just got an email.',
    sentPageNamed: '{name} will see it on their ideas page.',
    askHint: 'Without saying it comes from you.',
    sent: 'Request sent.',
    sentEmail: '{name} just got an email, without knowing it comes from you.',
    sentPage:
      '{name} will see it on their ideas page, without knowing it comes from you.',
    willEmail: 'You will get an email as soon as ideas arrive.',
    willSee: 'Come back here: the ideas will show as soon as they arrive.',
  },
  request: {
    title: 'Ask {name} for ideas?',
    bodyEmail:
      '{name} gets an email inviting them to note their tastes and what is better avoided.',
    bodyPage:
      '{name} will see it on their ideas page, inviting them to note their tastes and what is better avoided.',
    named: 'Your name is given',
    namedHelp:
      'The draw is revealed: {name} will know the request comes from you.',
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
      one: '{count} of {total} left ideas',
      other: '{count} of {total} left ideas',
    },
    none: 'Nothing yet',
    filledEditable: 'Filled in · can be changed until the big day',
    filledLocked: 'Filled in · can no longer be changed',
    left: 'Left ideas',
  },
  setting: {
    title: 'Gift ideas',
    help: 'What everyone can note to help the person who gives them a present.',
    full: 'Portrait and precise ideas',
    fullHelp: 'The six questions, current interests, and item ideas',
    portrait: 'Portrait only',
    portraitHelp: 'No item idea: the surprise stays whole',
    none: 'No ideas',
    noneHelp: 'Everyone manages on their own',
  },
  email: {
    request: {
      subject:
        '{group} Secret Santa: someone is looking for a gift idea for you',
      greeting: 'Hello {name},',
      body: 'The person who gives you a present for {edition} ({group}) doesn’t know what to choose. Help them: six multiple-choice questions, thirty seconds, and a few words if you like.',
      bodyPortrait:
        'The person who gives you a present for {edition} ({group}) doesn’t know what to choose. Help them: five multiple-choice questions, thirty seconds, and a few words if you like.',
      subjectFrom:
        '{group} Secret Santa: {from} is looking for a gift idea for you',
      bodyFrom:
        '{from} gives you a present for {edition} ({group}) and doesn’t know what to choose. Help them: six multiple-choice questions, thirty seconds, and a few words if you like.',
      bodyPortraitFrom:
        '{from} gives you a present for {edition} ({group}) and doesn’t know what to choose. Help them: five multiple-choice questions, thirty seconds, and a few words if you like.',
      cta: 'Leave a few ideas:',
      anonymous: 'We won’t tell you who is asking: it’s a Secret Santa.',
      once: 'You will only get this message once.',
    },
    arrived: {
      subject: '{group} Secret Santa: gift hints are waiting for you',
      greeting: 'Hello {name},',
      body: 'The person you give a present to for {edition} ({group}) left some ideas. Open your link to read them:',
    },
  },
} satisfies Dict<typeof fr>;
