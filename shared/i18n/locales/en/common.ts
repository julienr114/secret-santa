import type fr from '../fr/common';
import type { Dict } from '../../types';

export default {
  appName: 'Under the Tree',
  /** A row written in place was saved (ticket 162). */
  saved: 'Saved',
  loading: 'Loading',
  loadError: {
    title: 'We cannot load this page',
    body: 'Check your connection, then try again. Nothing was lost.',
    retry: 'Try again',
    home: 'Back to home',
  },
  status: {
    preparing: 'Preparing',
    drawn: 'Draw done',
    closed: 'Closed',
  },
  badge: { sent: 'sent', hints: 'list', viewed: 'envelope opened' },
  messageType: {
    invitation: 'Invitation',
    drawn: 'Draw done',
    reminder: 'Reminder',
    redraw: 'New draw',
    answerRequest: 'Request',
    answerReminder: 'Reminder',
    answerCheck: 'To check',
    guessReminder: 'Game reminder',
  },
  count: {
    participants: { one: '{count} participant', other: '{count} participants' },
  },
  tabs: {
    home: 'Home',
    create: 'Create',
    news: 'What’s new',
    admin: 'Admin',
    label: 'Sections',
  },
  create: {
    title: 'Create',
    secretSanta: 'A Secret Santa',
    list: 'A gift list',
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
  date: {
    outside: 'A date between {from} and {to}.',
    future: 'A date already past.',
    past: 'A date from today on.',
  },
  emailBlock: {
    refused:
      'The person with this address asked to stop receiving emails from Under the Tree.',
    refusedNext:
      'You can keep the address, but no email will go to it. Send them their link another way.',
    unknown: 'This address doesn’t seem to exist: no email will go to it.',
    refusedShort: 'Asked to stop receiving emails',
    unknownShort: 'Address that doesn’t seem to exist',
  },
} satisfies Dict<typeof fr>;
