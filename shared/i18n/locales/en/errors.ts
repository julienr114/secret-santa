import type fr from '../fr/errors';
import type { Dict } from '../../types';

export default {
  unknown: 'Something went wrong.',
  other: 'Error: {reason}',
  validation: 'Check the fields of the form.',
  unauthorized: 'Log in to continue.',
  forbidden: 'You do not have access to this group.',
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
  results_already_revealed: 'The results are already revealed.',
  results_revealed:
    'The results are revealed: the draw can no longer be cancelled.',
  party_date_missing: 'Add the date of the party first to reveal the results.',
  party_not_reached: 'The party has not happened yet.',
  invalid_transition: 'This action is not possible at this stage.',
  no_solution: 'No draw is possible with these rules: relax an exclusion.',
  too_many_participants: 'An edition cannot have more than 100 participants.',
  too_few_participants: 'At least three participants are needed.',
  participants_locked: 'The list is locked after the draw.',
  already_participating: 'This person is already taking part.',
  message_not_available: 'This message does not fit the stage of the edition.',
  email_not_configured:
    'Sending by email is not set up on the server. Share the links from your phone.',
  email_failed:
    'The emails were not sent. Try again, or share the links from your phone.',
  email_missing: 'This person has no email address.',
  participation_not_found: 'Participant not found.',
  wrong_confirmation: 'Type the group identifier exactly.',
  wrong_sentence: 'Copy the requested sentence exactly.',
  results_secret: 'Results stay secret until the edition is closed.',
  login_link_invalid: 'This login link is no longer valid: ask for a new one.',
  cannot_remove_self: 'You cannot remove yourself: ask another organizer.',
  organizer_not_found: 'Organizer not found.',
  link_invalid:
    'This link is no longer valid, ask your organizer for a new one.',
  draw_not_done: 'The draw has not taken place yet.',
  result_not_found:
    'Your result cannot be found, tell your organizer something is wrong.',
  gift_hints_disabled: 'This group does not use gift hints.',
  ideas_disabled: 'This group does not use precise ideas.',
  invalid_hints: 'One of your answers could not be saved.',
  hints_already_requested: 'You already asked for hints in this draw.',
  hints_already_given: 'Hints have already arrived.',
  result_not_seen: 'First discover who you give a present to.',
  no_previous_hints: 'No hints to reuse.',
  too_many_wishes: 'There are too many ideas in your list.',
  invalid_wish:
    'An idea is invalid: 200 characters at most, and a link starting with http:// or https://.',
  group_quota_reached:
    'You cannot create a group for now: ask for one from the home page.',
  group_request_pending: 'You already have a pending request.',
  group_request_useless: 'You can already create a group.',
  cannot_disable_self: 'You cannot disable your own account.',
  account_not_found: 'Account not found.',
  request_not_found: 'Request not found.',
  request_decided: 'This request has already been answered.',
  session_current: 'This is the device you are using: log out from the menu.',
  session_not_found: 'Session not found.',
  person_is_organizer:
    'This is an organizer of the group: remove them from the organizers first.',
  invite_invalid:
    'This invitation link is no longer valid: ask the organizer for a new one.',
  person_has_other_email: 'This draw is already linked to another address.',
  invite_expired:
    'This invitation link has expired: ask the organizer for a new one.',
  invite_full:
    'There is no place left through this link: let the organizer know.',
  collecting_answers:
    'The draw was made elsewhere: everyone gives their answer. Give up on the answers to draw with the app.',
  not_collecting_answers: 'This edition is not collecting answers.',
  answers_not_ready: "The answers aren't complete yet, or don't fit together.",
  invalid_answer: 'Choose another person of the edition.',
} satisfies Dict<typeof fr>;
