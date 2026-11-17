import type fr from '../fr/participant';
import type { Dict } from '../../types';

export default {
  home: {
    greeting: 'Hi {firstName}!',
    facts: { budget: 'Budget', party: 'Party on' },
    note: { title: "The organizer's note", more: 'Read more' },
    changeAvatar: 'Change my icon',
    steps: {
      label: 'Steps of the draw',
      invitation: 'Invitation',
      drawSoon: 'Draw · soon',
      drawDone: 'Draw done',
      party: 'Party',
      partyIn: {
        one: 'Party · in {count} day',
        other: 'Party · in {count} days',
      },
      partyToday: 'Party · today',
      partyOver: 'Party over',
    },
    waiting: {
      title: 'The draw has not taken place yet',
      body: 'Your organizer will let you know. Keep this link: this is where you will find out who you are giving a gift to.',
      action: 'Leave my gift hints',
      hint: 'In the meantime, help the person who will draw your name.',
    },
    ready: {
      title: 'Your envelope is waiting',
      body: 'The draw is done. Make sure nobody is looking at your screen before you open it.',
      bodyHints:
        'The draw is done, and gift hints are waiting for you inside. Make sure nobody is looking at your screen before you open it.',
      reveal: 'Find out who I am giving a gift to',
      revealing: 'Opening the envelope…',
      hint: 'Your result closes as soon as you leave the page.',
    },
    shown: {
      hide: 'Hide my result',
      hint: 'It closes by itself when you leave the page.',
    },
    seen: {
      title: 'You already know who you are giving to',
      body: 'A memory lapse? Make sure nobody is looking at your screen.',
      bodyHints:
        'Their gift hints are waiting for you inside. Make sure nobody is looking at your screen.',
      newTitle: 'New hints are waiting for you',
      newBody:
        'The person you give to left some since your last visit. Make sure nobody is looking at your screen.',
      revealWithHints: 'See my result and their hints again',
      noHintsYet: 'No hints yet. You can ask them for some.',
      revealAgain: 'See who I am giving to again',
    },
    closed: {
      title: 'The party is over',
      body: 'This edition is closed. You can still see who you gave a gift to.',
      bodyNotSeen:
        'This edition is closed. You can still find out who you were giving a gift to.',
    },
    journal: {
      title: 'Group journal',
      subtitle: 'Everything that happened, for all to see',
      alerts: {
        one: '{count} alert since your last visit',
        other: '{count} alerts since your last visit',
      },
    },
  },
  reveal: {
    youGiveTo: 'You are giving a gift to',
    seeLink: 'See the link',
  },
  wishes: {
    openLink: 'Open the link of "{label}"',
    sheet: {
      new: 'New idea',
      edit: 'Edit the idea',
      description: 'A short idea, and a link if you have one.',
      idea: 'Idea',
      ideaPlaceholder: 'A book, some socks…',
      link: 'Link (optional)',
      remove: 'Delete the idea',
    },
  },
  journal: {
    title: 'Group journal',
    intro: 'Everyone can see this journal. It never says who gives to whom.',
    allEditions: 'All editions',
    edition: 'Edition',
    empty: 'Nothing to report yet.',
  },
  invalid: { title: 'Oops, this link no longer works' },
  account: {
    title: 'Keep your draws in one place',
    body: 'Create an account with your email address: you will find this draw, and the next ones, without looking for the link.',
    bodyClaim: 'Add this draw to your account to find it from your home page.',
    create: 'Create my account',
    claim: 'Add to my account',
    added: 'Draw added to your account',
    sendTo: 'Get my link at {email}',
    sent: 'Link sent to {email}: open it to create your account. Remember to look in your spam folder.',
  },
} satisfies Dict<typeof fr>;
