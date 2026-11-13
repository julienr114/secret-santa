import type fr from '../fr/errors';
import type { Dict } from '../../types';

export default {
  unknown: 'Something went wrong.',
  other: 'Error: {reason}',
  validation: 'Check the fields of the form.',
  unauthorized: 'Log in to continue.',
  forbidden: 'You do not have access to this group.',
  invalid_credentials: 'Wrong password.',
  too_many_attempts: 'Too many attempts, try again in a few minutes.',
  slug_taken: 'This group identifier is already taken.',
  group_not_found: 'Group not found.',
  person_not_found: 'Person not found.',
  person_has_participations:
    'This person has already taken part: deactivate them instead.',
  exclusion_not_found: 'Exclusion not found.',
  edition_not_found: 'Edition not found.',
  edition_in_progress: 'Close the current edition first.',
  edition_closed: 'This edition is closed.',
  invalid_rules: 'Invalid rules.',
  invalid_transition: 'This action is not possible at this stage.',
  no_solution: 'No draw is possible with these rules: relax an exclusion.',
  too_few_participants: 'At least two participants are needed.',
  participants_locked: 'The list is locked after the draw.',
  already_participating: 'This person is already taking part.',
  links_not_open: 'Open the invitations first.',
  message_not_available: 'This message does not fit the stage of the edition.',
  email_disabled: 'Sending by email is not enabled for this group.',
  email_not_configured:
    'Sending by email is not set up on the server. Share the links from your phone.',
  email_failed:
    'The emails were not sent. Try again, or share the links from your phone.',
  email_missing: 'This person has no email address.',
  participation_not_found: 'Participant not found.',
  wrong_confirmation: 'Type the group identifier exactly.',
  wrong_sentence: 'Copy the requested sentence exactly.',
  results_secret: 'Results stay secret until the edition is closed.',
  link_invalid:
    'This link is no longer valid, ask your organizer for a new one.',
  draw_not_done: 'The draw has not taken place yet.',
  result_not_found:
    'Your result cannot be found, tell your organizer something is wrong.',
  wishlist_disabled: 'This group does not use wish lists.',
  too_many_wishes: 'There are too many ideas in your list.',
  invalid_wish:
    'An idea is invalid: 200 characters at most, and a link starting with http:// or https://.',
} satisfies Dict<typeof fr>;
