import type fr from '../fr/notify';
import type { Dict } from '../../types';

export default {
  joined: {
    subject: '{name} joined “{group}”',
    body: '{name} just joined the group “{group}” with the invitation link.',
    next: 'Remember to add them to the current draw and to their exclusions (partner, siblings).',
  },
  allViewed: {
    subject: 'Every envelope is open in “{group}”',
    body: 'For {edition} in “{group}”, everyone now knows who they’re giving to. All that’s left is finding the gifts.',
  },
  reminder: {
    subject: 'The party is near in “{group}”',
    body: 'The party for {edition} is on {date}.',
    missing: {
      one: '{count} person hasn’t opened their envelope yet: {names}.',
      other: '{count} people haven’t opened their envelope yet: {names}.',
    },
    next: 'You can send them their link again from the edition.',
  },
} satisfies Dict<typeof fr>;
