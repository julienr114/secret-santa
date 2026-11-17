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
    invitation: '“Invitation”',
    drawn: '“Draw done”',
    reminder: '“Reminder”',
    redraw: '“New draw”',
    other: 'a message',
  },
  via: {
    copy: ' as a copied message',
    share: ' by sharing',
    email: ' by email',
  },
  own: {
    participant_added: 'You join the edition',
    participant_removed: 'You leave the edition',
    message_sent: 'The organizer sent you {what}{via}',
    link_copied: 'The organizer copied your link',
    link_shared: 'The organizer shared your link',
    link_regenerated: 'Your link was regenerated',
    result_revealed: 'The organizer looked at your result (last-resort access)',
    result_viewed: 'You discovered your result',
    wishes_updated: {
      one: 'You updated your wish list ({count} idea)',
      other: 'You updated your wish list ({count} ideas)',
    },
    avatar_changed: 'You changed your icon',
    language_changed: 'You changed your language ({language})',
  },
  screen: {
    helpLink: 'What is it for?',
    views: 'What the journal shows',
    essential: 'The essentials',
    all: 'Everything',
    showDetail: 'Show the details',
    hideDetail: 'Fold',
    whatMeans: 'What does this mean?',
    understood: 'Got it',
    person: 'Who it is about',
    everyone: 'Everyone',
    me: 'Me ({name})',
    meNote:
      'Everything about your link and your result. If a line did not come from you, tell your organiser.',
  },
  grouped: {
    result_viewed: '{strong} discovered their result',
    message_sent: 'The organiser sent {what} to {strong}{via}',
    link_copied: 'The organiser copied {strong}',
    link_shared: 'The organiser shared {strong}',
    participant_added: '{strong} join the edition',
  },
  groupedCount: {
    result_viewed: { one: '{count} person', other: '{count} people' },
    message_sent: { one: '{count} person', other: '{count} people' },
    link_copied: { one: '{count} link', other: '{count} links' },
    link_shared: { one: '{count} link', other: '{count} links' },
    participant_added: { one: '{count} person', other: '{count} people' },
  },
  help: {
    title: 'What is the journal for?',
    warning:
      'A line is about you and you did not do it? Tell your organiser: they can renew your link.',
    intro: 'To keep the draw honest. Cheating is still possible, but it shows.',
    notes: 'It records',
    notesBody:
      'The draw, each link sent or renewed, each result discovered, wish lists that change, and any look by the organiser at a result.',
    never: 'It never says',
    neverBody: 'Who gives to whom, nor what the wish lists contain.',
    who: 'The whole group sees it',
    whoBody: 'Participants and organiser, with the same lines.',
  },
  alert: {
    at: '{day} at {time}',
    happened: 'What happened.',
    why: 'Why it is allowed.',
    changes: 'What it changes.',
    changesYou: 'What it changes for you.',
    result_revealed: {
      title: 'Last-resort access',
      happened:
        'The organiser looked at who {name} gives a gift to. They saw only that result.',
      forOthers: 'Nothing: your result and your list were not seen.',
      forMe:
        'They know who you give a gift to. Nobody else saw it, and your result does not change.',
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
