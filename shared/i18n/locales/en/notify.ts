import type fr from '../fr/notify';
import type { Dict } from '../../types';

export default {
  joined: {
    subject: '{name} joined “{group}”',
    body: '{name} just joined the group “{group}” with the invitation link.',
    next: 'Remember to add them to the current draw and to their exclusions (partner, siblings).',
  },
  allViewed: {
    subject: 'Everyone has discovered their draw in “{group}”',
    body: 'For {edition} in “{group}”, every participant now knows who they give to.',
  },
  reminder: {
    subject: 'The exchange is near in “{group}”',
    body: 'The exchange of {edition} takes place on {date}.',
    missing: {
      one: '{count} person has not discovered their draw yet: {names}.',
      other: '{count} people have not discovered their draw yet: {names}.',
    },
    next: 'You can send them their link again from the edition.',
  },
} satisfies Dict<typeof fr>;
