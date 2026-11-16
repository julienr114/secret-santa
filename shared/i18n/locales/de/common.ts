import type fr from '../fr/common';
import type { Dict } from '../../types';

export default {
  appName: 'Under the Tree',
  loading: 'Wird geladen',
  loadError: {
    title: 'Diese Seite lässt sich nicht laden',
    body: 'Prüfe deine Verbindung und versuche es dann erneut. Nichts ist verloren.',
    retry: 'Erneut versuchen',
    home: 'Zurück zur Startseite',
  },
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
  context: 'Du bist hier',
  actions: {
    back: 'Zurück',
    cancel: 'Abbrechen',
    delete: 'Löschen',
    validate: 'Bestätigen',
    add: 'Hinzufügen',
    save: 'Speichern',
    saving: 'Wird gespeichert…',
    logout: 'Abmelden',
  },
  languageIn: { fr: 'auf Französisch', en: 'auf Englisch', de: 'auf Deutsch' },
  language: {
    label: 'Sprache',
    fr: 'Français',
    en: 'English',
    de: 'Deutsch',
  },
} satisfies Dict<typeof fr>;
