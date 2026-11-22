import type fr from '../fr/notify';
import type { Dict } from '../../types';

export default {
  joined: {
    subject: '{name} signed up with the link',
    body: '{name} just signed up to the Secret Santa “{group}” with the invitation link.',
    next: 'Remember their exclusions (partner, siblings).',
  },
  allViewed: {
    subject: 'every envelope is open',
    body: 'For {edition} in “{group}”, everyone now knows who they’re giving to. All that’s left is finding the gifts.',
  },
  reminder: {
    subject: 'the big day is near',
    body: '{edition} is on {date}.',
    missing: {
      one: '{count} person hasn’t opened their envelope yet: {names}.',
      other: '{count} people haven’t opened their envelope yet: {names}.',
    },
    next: 'You can send them their link again from the Secret Santa.',
  },
} satisfies Dict<typeof fr>;
