import type fr from '../fr/auth';
import type { Dict } from '../../types';

export default {
  login: {
    tooMany: 'Too many requests at once.',
    tooManyHelp:
      'Wait a few minutes before trying again. If you already asked for a link, look in your emails: it is good for 15 minutes.',
    emailLabel: 'Email address',
    emailHelp: 'No password: you get a link valid for 15 minutes.',
    emailInvalid: 'This address looks incomplete',
    submit: 'Get a login link',
    sentTitle: 'Check your inbox',
    again: 'Use another address',
    devLink: 'Development mode: open the login link',
    tabLogin: 'Log in',
    tabSignup: 'Create an account',
    signupSubmit: 'Create my account',
    sentTo:
      'Link sent to {email}. It is valid for 15 minutes and works only once.',
    spamHint: 'Nothing came? Look in your spam folder.',
    sameDevice:
      'Open the link on this device: it is the one that will be logged in.',
    submitMine: 'Get my link',
    sending: 'Sending the link…',
    emailPlaceholder: 'you@example.com',
  },
  landing: {
    tagline:
      'Secret Santa with family, friends or colleagues: everyone finds out in secret who they are giving a gift to.',
    personalLink:
      'Did you receive a personal link? Open it directly: it works without an account.',
  },
  home: {
    party: {
      today: 'party today',
      in: { one: 'party tomorrow', other: 'party in {count} days' },
      on: 'party on {date}',
    },
    drawCard: {
      partyOn: 'Party on {date}',
      partyOnIn: {
        one: 'Party on {date}, tomorrow',
        other: 'Party on {date}, in {count} days',
      },
      partyToday: 'Party today',
    },
    past: {
      title: 'Past draws',
      empty: 'No past draw yet.',
    },
    journalSignal: {
      lead: 'New in the journal.',
      row: 'New in the journal',
      link_regenerated: 'Your link was renewed on {date}.',
      result_revealed: 'The organizer looked in an envelope on {date}.',
      results_revealed:
        'The results were revealed before the party, on {date}.',
      draw_cancelled: 'The draw was cancelled on {date}.',
      several: '{count} alerts since your last visit.',
    },
  },
  admin: {
    accountsTitle: 'Accounts',
    accounts: { one: '{count} account', other: '{count} accounts' },
    disabled: 'Disabled',
    neverLoggedIn: 'Never logged in',
    quotaLabel: 'Secret Santas it can organise',
    disabledHelp: 'It will no longer be able to log in',
    groupsEmpty: 'No group yet.',
    search: 'Search a name or an address',
    noMatch: 'No account.',
    groupsCount: { one: '{count} group', other: '{count} groups' },
    seenOn: 'seen on {date}',
    load: {
      near: 'The app is nearing its free capacity (about 50 groups: 3,000 emails a month at Resend).',
      over: 'One more group goes past the free capacity (about 50 groups: 3,000 emails a month at Resend). Emails may stop going out.',
    },
    quotaLess: 'One Secret Santa less',
    quotaMore: 'One Secret Santa more',
    disable: 'Disable the account',
    disableConfirm:
      'It will no longer be able to log in and its sessions will be closed. Disable?',
    restore: 'Restore the account',
    restoreHelp: 'It will be able to log in again',
    disabledDone: 'Account disabled',
    restored: 'Account restored',
    access: 'Access',
    loadOk: '{count} of about {max} groups covered by the free plans.',
    title: 'Administration',
    reserved: 'For super-admins only',
    capacity: 'Capacity',
    capacityCount: {
      one: '{count} group out of about {max}',
      other: '{count} groups out of about {max}',
    },
    capacityHint:
      'Beyond that, the free plans are no longer enough (3,000 emails a month).',
    seeAll: 'See everything',
    groupsShort: 'Groups',
    disabledCount: { one: '{count} disabled', other: '{count} disabled' },
    activeDraws: {
      one: '{count} draw in progress',
      other: '{count} draws in progress',
    },
    styleGuide: 'Style guide',
    styleGuideHint: 'Developer tool',
    lastVisit: 'Last visit on {date}',
    left: { one: '{count} left', other: '{count} left' },
    mayOrganise: {
      one: 'May organise {count}',
      other: 'May organise {count}',
    },
    inProgress: { one: '{count} in progress', other: '{count} in progress' },
    atLimit: 'at its Secret Santa limit',
    members: { one: '{count} member', other: '{count} members' },
    draw: {
      preparing: 'to prepare',
      drawn: 'drawn',
      none: 'no draw in progress',
      viewed: {
        one: '{count} of {total} has opened their envelope',
        other: '{count} of {total} have opened their envelope',
      },
    },
    role: { organizer: 'Organises', participant: 'Takes part' },
    profileOwn:
      'Their profile (first name, icon, language) is theirs: it is not changed from here.',
    activeAccounts: {
      one: '{count} active account',
      other: '{count} active accounts',
    },
    noGroup: 'no group',
    disabledRow: 'Disabled accounts',
    searchGroups: 'Search a group or an organizer',
    noGroupMatch: 'No group.',
    noOrganizer: 'No organizer yet',
    createFor: 'Create a group for someone',
    createForHint: 'With the address of its organizer',
  },
  confirm: {
    title: 'Log in',
    action: 'Log in',
    newLink: 'Ask for a new link',
    question: 'Log in on this device?',
    bodyWith: 'You will be logged in as {email} for 30 days.',
    notYours: 'Not your device? Just close this page.',
    connecting: 'Logging in…',
    invalidTitle: 'This link no longer works',
    invalidBody:
      'A login link is valid for 15 minutes and works only once. Ask for a new one, it takes ten seconds.',
  },
  account: {
    profile: 'My profile',
    languageHelp: 'The language of your emails.',
    title: 'My account',
    superAdmin: 'Super-admin',
    devices: 'My devices',
    devicesHint: 'A login lasts 30 days.',
    current: 'This device',
    unknownDevice: 'Unknown device',
    lastSeen: 'Seen on {date}',
    revokeAll: 'Log out everywhere',
    revokeOne: 'Log {device} out',
    revoked: 'Device logged out',
    revokeAllHint: 'This device included',
    revokeAllConfirm: 'Log out of every device?',
    firstNameHelp: 'Reused when you create a group.',
    lastNameHelp: 'Optional. Tells you apart from a namesake.',
    profileHint:
      'Your first name and your icon are used when you join or create a group. The language is the one of your emails.',
    language: 'Language',
    connectedOn: 'Logged in on {date}',
    revokeShort: 'Log out',
    logoutHere: 'Log out of this device',
  },
  email: {
    subject: 'Your login link for Under the Tree',
    intro: 'Here is your login link for Under the Tree:',
    validity: 'It is valid for 15 minutes and works only once.',
    ignore:
      'Did not ask for it? Ignore this message: without this link, nobody can log in.',
  },
  invite: {
    intro: 'You are invited to the party',
    party: 'on {date}',
    nameHelp: 'The first name the others will see.',
    loginFirst:
      'Log in with your email address to join. No account yet? It is created on the way.',
    joinGroup: 'Join the party',
    signedAs: 'Logged in as {email}',
    notMe: 'Not me',
    organiserWord: {
      one: 'The organizer’s word',
      other: 'The organizers’ word',
    },
    welcome: 'Welcome to {group}',
    inDraw: 'You take part in {label}.',
    notDrawnYet: {
      one: 'The draw hasn’t happened yet: your organizer will give you a shout.',
      other:
        'The draw hasn’t happened yet: your organizers will give you a shout.',
    },
    addLater: {
      one: 'You are in the party. Your organizer will add you to the draw of {label}.',
      other:
        'You are in the party. Your organizers will add you to the draw of {label}.',
    },
    drawnAlready:
      'You are in the party. The draw of {label} is already done: you will be in the next one.',
    nextDraw: {
      one: 'You’re in the party. Your organizer will give you a shout for the next draw.',
      other:
        'You’re in the party. Your organizers will give you a shout for the next draw.',
    },
    meanwhile: 'Meanwhile',
    hints: 'Leave my gift hints',
    seeDraw: 'See my draw',
    goHome: 'Go to my home',
    findIt: 'You will find it on your home by logging in with {email}.',
    joining: 'Joining…',
    full: {
      title: 'No place left with this link',
      body: {
        one: 'Tell the organizer of {group}: they can open more places or add you themselves.',
        other:
          'Tell the organizers of {group}: they can open more places or add you themselves.',
      },
    },
    expired: {
      title: 'This invitation link is no longer valid',
      titleSince: 'This invitation link has not been valid since {date}',
      body: {
        one: 'Tell the organizer of {group}: they can extend it or add you themselves.',
        other:
          'Tell the organizers of {group}: they can extend it or add you themselves.',
      },
    },
    invalid: {
      title: 'This invitation link no longer works',
      body: 'Ask the person who sent it to you for a new link.',
    },
  },
} satisfies Dict<typeof fr>;
