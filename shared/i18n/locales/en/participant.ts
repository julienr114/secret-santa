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
      body: 'Make sure nobody is looking at your screen. Every viewing is recorded in the group journal.',
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
} satisfies Dict<typeof fr>;
