import type fr from '../fr/common';
import type { Dict } from '../../types';

export default {
  appName: 'Under the Tree',
  loading: 'Wird geladen',
  status: {
    draft: 'Entwurf',
    invitations: 'Einladungen',
    drawn: 'Ausgelost',
    closed: 'Abgeschlossen',
  },
  badge: { sent: 'gesendet', wishes: 'Wünsche', viewed: 'angesehen' },
  messageType: {
    invitation: 'Einladung',
    drawn: 'Auslosung erfolgt',
    reminder: 'Erinnerung',
    redraw: 'Neue Auslosung',
  },
  count: {
    participants: { one: '{count} Teilnehmer', other: '{count} Teilnehmer' },
    ideas: { one: '{count} Idee', other: '{count} Ideen' },
    people: { one: '{count} Person', other: '{count} Personen' },
    emails: { one: '{count} E-Mail', other: '{count} E-Mails' },
    exclusions: { one: '{count} Ausschluss', other: '{count} Ausschlüsse' },
  },
  actions: {
    back: 'Zurück',
    cancel: 'Abbrechen',
    delete: 'Löschen',
    validate: 'Bestätigen',
    add: 'Hinzufügen',
    save: 'Speichern',
    logout: 'Abmelden',
  },
  participantStatus: {
    viewed: 'Ergebnis angesehen',
    viewedTimes: 'Ergebnis angesehen · {count}×',
    invitationSent: 'Einladung gesendet',
    notSent: 'Noch nicht gesendet',
    sentNotViewed: 'Gesendet, noch nicht angesehen',
  },
  language: {
    label: 'Sprache',
    fr: 'Français',
    en: 'English',
    de: 'Deutsch',
  },
} satisfies Dict<typeof fr>;
