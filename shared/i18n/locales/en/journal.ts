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
    result_viewed: '{name} discovered their result',
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
  screen: {
    helpLink: 'What is it for?',
    views: 'What the journal shows',
    essential: 'The essentials',
    all: 'Everything',
    showDetail: 'Show the details',
    hideDetail: 'Fold',
    whatMeans: 'What does this mean?',
    understood: 'Got it',
  },
  grouped: {
    result_viewed: '{strong} discovered their result',
    message_sent: 'The organiser sent {strong}',
    link_copied: 'The organiser copied {strong}',
    link_shared: 'The organiser shared {strong}',
    participant_added: '{strong} join the edition',
  },
  groupedCount: {
    result_viewed: { one: '{count} person', other: '{count} people' },
    message_sent: { one: '{count} message', other: '{count} messages' },
    link_copied: { one: '{count} link', other: '{count} links' },
    link_shared: { one: '{count} link', other: '{count} links' },
    participant_added: { one: '{count} person', other: '{count} people' },
  },
  help: {
    title: 'What is the journal for?',
    intro:
      'To keep the draw honest: everything that touches the secret is written here, for the whole group to see. Cheating is still possible, but it shows.',
    notes: 'What it records',
    note1: 'The draw, its cancellation, the closing',
    note2: 'Each link sent, copied or renewed',
    note3: 'The first time each person discovers their result',
    note4: 'Wish lists that change',
    note5: 'Any look by the organiser at a result',
    never: 'What it never says',
    never1: 'Who gives to whom',
    never2: 'What the wish lists contain',
    who: 'Who sees it',
    who1: 'Every participant of the group and the organiser, with the same lines',
    warning:
      'A line is about you and you did not do it? Tell your organiser: they can renew your link.',
  },
  alert: {
    at: '{day} at {time}',
    happened: 'What happened.',
    why: 'Why it is allowed.',
    changes: 'What it changes.',
    result_revealed: {
      title: 'Last-resort access',
      happened:
        'The organiser looked at who the person named gives a gift to. They saw only that result.',
      why: 'In case of doubt or disagreement, it must be possible to check. The organiser has to copy a sentence and accept that the whole group will know.',
      changes: 'The other results and the wish lists were not seen.',
    },
    results_revealed: {
      title: 'Last-resort access',
      happened: 'The organiser looked at the results of the draw.',
      why: 'In case of doubt or disagreement, it must be possible to check. The organiser has to accept that the whole group will know.',
      changes:
        'They know who gives to whom. If the group wishes, the draw can be cancelled and run again.',
    },
    draw_cancelled: {
      title: 'Draw cancelled',
      happened:
        'The organiser cancelled the draw, for the reason written above. The old results are erased.',
      why: 'Someone dropping out, someone forgotten: better to run it again than keep a wrong draw. The reason is written in the journal for the whole group.',
      changes:
        'Everyone will get a new message and discover a new result. The links and the wish lists do not change.',
    },
  },
} satisfies Dict<typeof fr>;
