import type fr from '../fr/errors';
import type { Dict } from '../../types';

export default {
  unknown: 'Ouch, something got stuck. Try again in a moment.',
  year_over: 'This year is over: nothing changes in it any more.',
  secret_santa_drawn:
    'This Secret Santa is drawn: it can no longer be deleted.',
  nothing_to_prepare: 'There is nothing to prepare yet.',
  other: 'Something got stuck ({reason}).',
  validation: 'Something’s missing: check the fields.',
  unauthorized: 'Log in to continue.',
  forbidden: 'You do not have access to this event.',
  too_many_attempts: 'Easy now. Try again in a few minutes.',
  too_many_requests:
    'Too many requests at once. Wait a few minutes before trying again.',
  web_address:
    'A name cannot contain a web address. Remove it, then try again.',
  limit_lists: 'You already hold a lot of lists. Delete one to create another.',
  limit_people: 'This list already has a lot of people: no more can be added.',
  limit_ideas: 'This list already has a lot of ideas: no more can be added.',
  limit_off_list:
    'You already announced a lot of gifts off the list here. Remove one to add another.',
  limit_family: 'You already have a lot of people. Delete one to add another.',
  limit_journal: 'This event has been very busy today: try again tomorrow.',
  list_not_empty:
    'This list already has people on it: one only starts from another list in an empty one.',
  anonymous_mode:
    'Anonymous mode is on: you can only give it alone, anonymously. Turn it off at the top of the list for another choice.',
  list_shared:
    'This list is already shared: it stays without people. Stop sharing it to sort it by person.',
  several_people:
    'There are several people on the list: their ideas cannot be mixed.',
  list_not_linkable:
    'This list cannot be linked: it must be published, and yours.',
  slug_taken: 'This event identifier is already taken.',
  group_not_found:
    'Event not found. Reload the page: the list may have changed.',
  person_not_found:
    'Person not found. Reload the page: the list may have changed.',
  person_has_participations:
    'This person has already taken part: deactivate them instead.',
  exclusion_not_found:
    'Exclusion not found. Reload the page: the list may have changed.',
  edition_not_found:
    'Secret Santa not found. Reload the page: the list may have changed.',
  edition_closed: 'This Secret Santa is closed.',
  invalid_rules: 'These rules don’t fit together. Check them.',
  results_already_revealed: 'The results are already revealed.',
  results_revealed:
    'The results are revealed: the draw can no longer be cancelled.',
  party_date_missing: 'Add the date first to reveal the results.',
  party_not_reached: 'The big day has not come yet.',
  invalid_transition:
    'Too early, or too late: this can’t be done at this stage.',
  no_solution: 'No draw is possible with these rules: relax an exclusion.',
  too_many_participants:
    'A Secret Santa cannot have more than 100 participants.',
  too_few_participants: 'You need at least three: with two, there’s no secret.',
  participants_locked: 'The draw is done: the list is set.',
  already_participating: 'This person is already taking part.',
  message_not_available:
    'This message does not fit the stage of the Secret Santa.',
  email_not_configured:
    'Sending by email is not set up on the server. Share the links from your phone.',
  email_failed:
    'The emails were not sent. Try again, or share the links from your phone.',
  email_missing: 'This person has no email address.',
  participation_not_found:
    'Participant not found. Reload the page: the list may have changed.',
  wrong_confirmation: 'Type the event identifier exactly.',
  wrong_sentence: 'Copy the requested sentence exactly.',
  results_secret: 'Results stay secret until the Secret Santa is closed.',
  login_link_invalid: 'This login link is no longer valid: ask for a new one.',
  login_code_invalid:
    'This code doesn’t work: check the six digits, or ask for another one.',
  cannot_remove_self: 'You cannot remove yourself: ask another organizer.',
  organizer_not_found:
    'Organizer not found. Reload the page: the list may have changed.',
  link_invalid:
    'This link is no longer valid, ask your organizer for a new one.',
  draw_not_done: 'The draw has not taken place yet.',
  result_not_found:
    'Your envelope can’t be found. Tell your organizer: something’s wrong.',
  gift_hints_disabled: 'This Secret Santa does not use gift ideas.',
  ideas_disabled: 'This Secret Santa does not use precise ideas.',
  invalid_hints: 'One of your answers could not be saved.',
  hints_already_requested: 'You already asked for ideas in this Secret Santa.',
  hints_already_given: 'Ideas have already arrived.',
  result_not_seen: 'Open your envelope first.',
  no_previous_hints: 'No ideas to reuse.',
  too_many_wishes: 'There are too many ideas in your list.',
  invalid_wish:
    'An idea is invalid: 200 characters at most, and a link starting with http:// or https://.',
  secret_santa_limit_reached:
    'You already organise 3 Secret Santas: that’s the most for one account.',
  secret_santa_paused:
    'New Secret Santas are paused. Those that exist carry on.',
  emails_paused:
    'Sending emails is paused for everyone. Send each person their link from your phone.',
  date_past: 'A date from today on.',
  signups_paused:
    'Sign-ups are paused: no new account or new event for now. Come back in a few days.',
  already_member:
    'This address is already that of a member of the event: the list is open to them.',
  list_not_open: 'Your list is not shared with all the members of its event.',
  too_many_members: 'The event is full: 30 members is the most it can have.',
  cannot_disable_self: 'You cannot disable your own account.',
  account_not_found:
    'Account not found. Reload the page: the list may have changed.',
  session_current: 'This is the device you are using: log out from the menu.',
  session_not_found:
    'Session not found. Reload the page: the list may have changed.',
  person_is_organizer:
    'This is an organizer of the event: remove them from the organizers first.',
  invite_invalid:
    'This invitation link is no longer valid: ask the organizer for a new one.',
  person_has_other_email:
    'This Secret Santa is already linked to another address.',
  invite_expired:
    'This invitation link has expired: ask the organizer for a new one.',
  invite_drawn:
    'The draw has already taken place: nobody can sign up with this link any more.',
  invite_full:
    'There is no place left through this link: let the organizer know.',
  collecting_answers:
    'The draw was made elsewhere: everyone gives their answer. Give up on the answers to draw with the app.',
  not_collecting_answers: 'This Secret Santa is not collecting answers.',
  answers_not_ready: "The answers aren't complete yet, or don't fit together.",
  invalid_answer: 'Choose another person of the Secret Santa.',
  game_needs_four:
    'The game needs at least four players: with three, there’s nothing to guess.',
  draw_not_revealed: 'The draw is not revealed yet.',
  already_played: 'You already made a guess: take it back first.',
  email_taken: 'This address already belongs to another person of the event.',
  idea_claimed: 'Someone already gives it.',
} satisfies Dict<typeof fr>;
