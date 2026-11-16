import type fr from '../fr/common';
import type { Dict } from '../../types';

export default {
  appName: 'Under the Tree',
  loading: 'Loading',
  loadError: {
    title: 'We cannot load this page',
    body: 'Check your connection, then try again. Nothing was lost.',
    retry: 'Try again',
    home: 'Back to home',
  },
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
  context: 'You are here',
  actions: {
    back: 'Back',
    cancel: 'Cancel',
    delete: 'Delete',
    validate: 'Confirm',
    add: 'Add',
    save: 'Save',
    saving: 'Saving…',
    logout: 'Log out',
  },
  languageIn: { fr: 'in French', en: 'in English', de: 'in German' },
  language: {
    label: 'Language',
    fr: 'Français',
    en: 'English',
    de: 'Deutsch',
  },
} satisfies Dict<typeof fr>;
