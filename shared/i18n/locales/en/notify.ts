import type fr from '../fr/notify';
import type { Dict } from '../../types';

export default {
  reminder: {
    subject: 'the big day is near',
    body: '{edition} is on {date}.',
    missing: {
      one: '{count} person hasn’t opened their envelope yet: {names}.',
      other: '{count} people haven’t opened their envelope yet: {names}.',
    },
    next: 'You can send them their link again from the Secret Santa.',
  },
  hello: 'Hello {firstName},',
  helloNoName: 'Hello,',
  settings: 'Change this setting',
  news: {
    subject: {
      envelope: 'your envelope is waiting',
      ticked: {
        one: '{count} gift was ticked on your list',
        other: '{count} gifts were ticked on your list',
      },
      joined_gift: '{name} joins your group gift',
      revealed: 'the draw is revealed',
      palmares: 'the Devine qui palmarès is here',
      joined: '{name} signed up with the link',
      all_viewed: 'everyone has seen their draw',
      santa_added: '{name} added you to the Secret Santa',
      list_shared: '{name} shared their list with you',
      game_open: 'your turn to play Devine qui',
    },
    footer: 'One email for each piece of news.',
  },
  summary: {
    subject: {
      one: 'Under the Tree: {count} piece of news since yesterday',
      other: 'Under the Tree: {count} pieces of news since yesterday',
    },
    intro: 'Here’s what’s waiting for you.',
    openParty: 'Open the event',
    openList: 'Open the list',
    footer: 'Only one summary a day, and only when there’s something new.',
  },
} satisfies Dict<typeof fr>;
