import type fr from '../fr/journal';
import type { Dict } from '../../types';

export default {
  someone: 'Someone',
  unknown: 'Unknown event',
  events: {
    edition_created: 'The edition {label} was created',
    participant_added: '{name} joins the edition',
    participant_removed: '{name} leaves the edition',
    rules_changed: 'The organizer changed the rules of the draw',
    message_sent: 'The organizer sent {what} to {name}{via}',
    link_copied: "The organizer copied {name}'s link",
    link_shared: "The organizer shared {name}'s link",
    link_regenerated: "{name}'s link was regenerated",
    draw_done: {
      one: 'The draw was done for {count} participant',
      other: 'The draw was done for {count} participants',
    },
    draw_cancelled: 'The draw was cancelled. Reason: {reason}',
    results_revealed:
      'The organizer looked at the results of the draw (last-resort access)',
    result_revealed:
      "The organizer looked at {name}'s result (last-resort access)",
    result_viewed: '{name} viewed their result ({nth} time)',
    wishes_updated: {
      one: '{name} updated their wish list ({count} idea)',
      other: '{name} updated their wish list ({count} ideas)',
    },
    avatar_changed: '{name} changed their icon',
    language_changed: '{name} changed their language ({language})',
    edition_closed: 'The edition {label} is closed',
  },
  noReason: 'not given',
  what: {
    invitation: 'the invitation',
    drawn: 'the "draw done" message',
    reminder: 'the reminder',
    redraw: 'the "new draw" message',
    other: 'a message',
  },
  via: { copy: ' (message copied)', share: ' (shared)', email: ' (email)' },
  nth: { one: '{n}st', two: '{n}nd', few: '{n}rd', rest: '{n}th' },
} satisfies Dict<typeof fr>;
