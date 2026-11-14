import type fr from '../fr/participant';
import type { Dict } from '../../types';

export default {
  home: {
    greeting: 'Hi {firstName}!',
    changeAvatar: 'Change my icon',
    waiting: {
      title: 'The draw has not taken place yet',
      body: 'Your organizer will let you know. Keep this link: this is where you will find out who you are giving a gift to.',
      wishes:
        'In the meantime, write down a few gift ideas for the person who will draw your name.',
    },
    ready: {
      title: 'The draw is done!',
      body: 'Make sure nobody is looking at your screen.',
      revealAgain: 'See who I am giving to again',
      ideasWaiting: {
        one: 'Their list has {count} gift idea.',
        other: 'Their list has {count} gift ideas.',
      },
      reveal: 'Find out who I am giving a gift to',
      hide: 'Hide my result',
    },
    closed: 'This edition is closed.',
    wishes: {
      title: 'My wish list',
      help: 'Help the person who drew your name',
      none: 'No ideas',
    },
    journal: {
      title: 'Group journal',
      subtitle: 'Everything that happened, for all to see',
    },
    avatar: {
      title: 'My icon',
      description: 'Choose your emoji and your colour.',
    },
  },
  reveal: {
    youGiveTo: 'You are giving a gift to',
    budget: 'Budget',
    date: 'Date',
    ideas: 'Their gift ideas',
    noIdeas: '{name} has not given any ideas yet.',
  },
  wishes: {
    title: 'My wish list',
    intro:
      'A few ideas to help the person giving you a gift. Only they will see them.',
    readOnly: 'The list can no longer be changed for this edition.',
    max: '{count} ideas at most.',
    empty: 'No ideas yet.',
    emptyReadOnly: 'You had not written down any ideas.',
    openLink: 'Open the link of "{label}"',
    add: 'Add an idea',
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
  invalid: { title: 'Oops' },
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
