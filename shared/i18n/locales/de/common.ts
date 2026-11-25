import type fr from '../fr/common';
import type { Dict } from '../../types';

export default {
  appName: 'Under the Tree',
  /** A row written in place was saved (ticket 162). */
  saved: 'Gespeichert',
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
    list: 'Eine Geschenkliste',
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
  date: {
    outside: 'Ein Datum zwischen {from} und {to}.',
    future: 'Ein Datum, das schon vorbei ist.',
    past: 'Ein Datum ab heute.',
  },
  emailBlock: {
    refused:
      'Die Person mit dieser Adresse möchte keine E-Mails mehr von Under the Tree erhalten.',
    refusedNext:
      'Du kannst die Adresse behalten, aber es geht keine E-Mail an sie. Schick ihr den Link auf anderem Weg.',
    unknown:
      'Diese Adresse scheint nicht zu existieren: Es geht keine E-Mail an sie.',
    refusedShort: 'Möchte keine E-Mails mehr erhalten',
    unknownShort: 'Adresse scheint nicht zu existieren',
  },
} satisfies Dict<typeof fr>;
