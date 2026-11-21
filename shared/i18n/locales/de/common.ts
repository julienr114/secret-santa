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
  badge: { sent: 'gesendet', hints: 'Liste', viewed: 'Umschlag geöffnet' },
  messageType: {
    invitation: 'Einladung',
    drawn: 'Auslosung erfolgt',
    reminder: 'Erinnerung',
    redraw: 'Neue Auslosung',
    answerRequest: 'Anfrage',
    answerReminder: 'Erinnerung',
    answerCheck: 'Zu prüfen',
    guessReminder: 'Spiel-Erinnerung',
  },
  count: {
    participants: { one: '{count} Teilnehmer', other: '{count} Teilnehmer' },
  },
  tabs: {
    home: 'Start',
    create: 'Erstellen',
    news: 'Neuigkeiten',
    admin: 'Admin',
    label: 'Bereiche',
  },
  create: {
    title: 'Erstellen',
    secretSanta: 'Ein Wichteln',
    list: 'Eine Liste',
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
