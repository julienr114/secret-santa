import type fr from '../fr/common';
import type { Dict } from '../../types';

export default {
  appName: 'Under the Tree',
  loading: 'Loading',
  status: {
    preparing: 'Preparing',
    drawn: 'Drawn',
    closed: 'Closed',
  },
  badge: { sent: 'sent', wishes: 'wishes', viewed: 'viewed' },
  messageType: {
    invitation: 'Invitation',
    drawn: 'Draw done',
    reminder: 'Reminder',
    redraw: 'New draw',
  },
  count: {
    participants: { one: '{count} participant', other: '{count} participants' },
    ideas: { one: '{count} idea', other: '{count} ideas' },
    exclusions: { one: '{count} exclusion', other: '{count} exclusions' },
  },
  actions: {
    back: 'Back',
    cancel: 'Cancel',
    delete: 'Delete',
    validate: 'Confirm',
    add: 'Add',
    save: 'Save',
    logout: 'Log out',
  },
  language: {
    label: 'Language',
    fr: 'Français',
    en: 'English',
    de: 'Deutsch',
  },
} satisfies Dict<typeof fr>;
