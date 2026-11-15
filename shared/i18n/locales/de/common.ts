import type fr from '../fr/common';
import type { Dict } from '../../types';

export default {
  appName: 'Under the Tree',
  loading: 'Wird geladen',
  status: {
    preparing: 'In Vorbereitung',
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
