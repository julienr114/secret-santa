import type fr from '../fr/auth';
import type { Dict } from '../../types';

export default {
  login: {
    emailLabel: 'Email address',
    emailInvalid: 'Invalid email address',
    submit: 'Get a login link',
    sentTitle: 'Check your inbox',
    sent: 'If this address is known, a login link has just been sent. It is valid for 15 minutes and works only once.',
    spamHint: 'Remember to look in your spam folder.',
    again: 'Use another address',
    devLink: 'Development mode: open the login link',
  },
  landing: {
    tagline: 'Log in to find your draws or organize one.',
    personalLink:
      'Did you receive a personal link? Just open it, it works without an account.',
  },
  home: {
    title: 'Home',
    draws: 'My draws',
    drawsEmpty:
      'No draw yet. As soon as an organizer adds you to a draw with this address, it shows up here.',
    groups: 'My groups',
    allGroups: 'All groups',
    groupsEmpty: 'No group yet.',
    newGroup: 'New group',
    admin: 'Administration',
  },
  confirm: {
    title: 'Log in',
    body: 'Confirm to log in on this device.',
    action: 'Log in',
    newLink: 'Ask for a new link',
  },
  account: {
    title: 'My account',
    superAdmin: 'Super-admin',
    devices: 'My devices',
    devicesHint:
      'The devices this account is logged in on. A session lasts 30 days.',
    current: 'This device',
    unknownDevice: 'Unknown device',
    lastSeen: 'Seen on {date}',
    revokeAll: 'Log out everywhere',
    revokeAllHint: 'Closes every session, this one included',
    revokeAllConfirm: 'Log out of every device?',
  },
  email: {
    subject: 'Your login link for Under the Tree',
    intro: 'Here is your login link for Under the Tree:',
    validity: 'It is valid for 15 minutes and works only once.',
    ignore:
      'If you did not ask for it, ignore this message: nobody can log in without this link.',
  },
} satisfies Dict<typeof fr>;
