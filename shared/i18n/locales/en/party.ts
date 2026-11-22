import type fr from '../fr/party';
import type { Dict } from '../../types';

export default {
  category: {
    christmas: 'Christmas',
    birthday: 'Birthday',
    birth: 'Birth',
    wedding: 'Wedding',
    housewarming: 'Housewarming',
    other: 'Other',
  },
  everyYear: 'every year',
  inDays: { one: 'in {count} day', other: 'in {count} days' },
  today: 'today',
  members: { one: '{count} member', other: '{count} members' },
  settings: 'Event settings',
  secretSantaTitle: { one: 'The Secret Santa', other: 'The Secret Santas' },
  full: {
    count: '{count} of {max}',
    title: 'The event is full',
    text: '{max} members is the most',
    paused: 'Paused · the event is full',
  },
  secretSanta: {
    row: 'The Secret Santa {year}',
    another: 'Another Secret Santa',
    organise: 'Organise a Secret Santa',
    context: 'Secret Santa {year}',
    settings: 'Settings',
    drawSection: 'The draw',
    guessRow: 'Guesses',
    messagesSection: 'The messages',
    joined: 'Someone signs up with the link',
    allViewed: 'Everyone has found out who they drew',
    whichParty: 'The event of the Secret Santa',
    otherOccasion: 'Another occasion',
    already: 'already a Secret Santa this year',
    paused: {
      title: 'New Secret Santas are paused',
      text: 'Those that exist carry on. Come back in a few days.',
    },
    limit: {
      title: 'You already organise {count} Secret Santas',
      text: 'That’s the most for one account.',
      drawn: 'drawn',
      preparing: 'not drawn yet',
    },
  },
  lists: {
    title: 'The lists',
    titleSomeone: 'Their list',
    none: 'Nobody has put a list in this event yet.',
    new: 'New list',
    resume: 'Take up my list from last year',
  },
  // The years over (ticket 108, V3FetesPassees, V3FeteAnneePassee).
  past: {
    years: 'Past years',
    empty: 'No past event yet.',
    gaveTo: 'You gave to {name}',
    gaveToTwo: 'You gave to {name} and {other}',
    offered: {
      one: 'You gave {count} gift',
      other: 'You gave {count} gifts',
    },
    received: {
      one: '{count} gift given',
      other: '{count} gifts given',
    },
    game: 'Devine qui',
    palmares: 'The palmarès',
  },
  leave: {
    row: 'Leave this event',
    title: 'Leave “{name}”?',
    listsElsewhere: {
      one: 'Your list will leave this event. It stays in your other events.',
      other:
        'Your lists will leave this event. They stay in your other events.',
    },
    listsAlone: {
      one: 'Your list will leave this event. Only you will see it, until you put it somewhere else.',
      other:
        'Your lists will leave this event. Only you will see them, until you put them somewhere else.',
    },
    ticks: 'The gifts you ticked stay planned.',
    secretSanta: 'You will not take part in its Secret Santa next year.',
    confirm: 'Leave the event',
    stay: 'Stay',
    done: 'You left “{name}”',
  },
  create: {
    title: 'What is the occasion?',
    forWhom: 'For whom?',
    me: 'Me',
    someoneElse: 'Someone else',
    name: 'Its name',
    date: 'Its date',
    recurring: 'It comes back every year',
    continue: 'Continue',
    birthdayOf: '{name}’s birthday',
    myBirthday: 'My birthday',
  },
  // « Qui reprendre ? » (V3FeteMembresReprendre, ticket 117): for a Secret
  // Santa or a list, never for the event alone.
  take: {
    row: 'Bring in people from another event',
    rowHint: 'You tick who',
    title: 'Who to bring in?',
    from: 'People from',
    noEmail: 'No email address',
    choose: 'Bring in {name}',
    submit: {
      one: 'Add · {count} person',
      other: 'Add · {count} people',
    },
    done: {
      one: '{count} person added',
      other: '{count} people added',
    },
    none: 'Nobody new to add',
  },
  reglages: {
    party: 'The event',
    category: 'Category',
    date: 'Date',
    dateValue: '{date} · offered every year',
    dateValueOnce: '{date}',
    recurring: 'Comes back every year',
    secretSanta: 'Secret Santa',
    secretSantaRow: 'Settings of the Secret Santa {year}',
  },
} satisfies Dict<typeof fr>;
