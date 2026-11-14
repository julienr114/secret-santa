import type fr from '../fr/auth';
import type { Dict } from '../../types';

export default {
  login: {
    emailLabel: 'E-Mail-Adresse',
    emailInvalid: 'Ungültige E-Mail-Adresse',
    submit: 'Anmeldelink erhalten',
    sentTitle: 'Schau in dein Postfach',
    sent: 'Wenn diese Adresse bekannt ist, wurde gerade ein Anmeldelink gesendet. Er ist 15 Minuten gültig und funktioniert nur einmal.',
    spamHint: 'Schau auch im Spam-Ordner nach.',
    again: 'Andere Adresse verwenden',
    devLink: 'Entwicklungsmodus: Anmeldelink öffnen',
  },
  landing: {
    tagline:
      'Melde dich an, um deine Auslosungen zu finden oder eine zu organisieren.',
    personalLink:
      'Hast du einen persönlichen Link erhalten? Öffne ihn einfach, er funktioniert ohne Konto.',
  },
  home: {
    title: 'Startseite',
    draws: 'Meine Auslosungen',
    drawsEmpty:
      'Noch keine Auslosung. Sobald dich ein Organisator mit dieser Adresse zu einer Auslosung hinzufügt, erscheint sie hier.',
    groups: 'Meine Gruppen',
    allGroups: 'Alle Gruppen',
    groupsEmpty: 'Noch keine Gruppe.',
    newGroup: 'Neue Gruppe',
    admin: 'Verwaltung',
  },
  confirm: {
    title: 'Anmeldung',
    body: 'Bestätige, um dich auf diesem Gerät anzumelden.',
    action: 'Anmelden',
    newLink: 'Neuen Link anfordern',
  },
  account: {
    title: 'Mein Konto',
    superAdmin: 'Super-Admin',
    devices: 'Meine Geräte',
    devicesHint:
      'Die Geräte, auf denen dieses Konto angemeldet ist. Eine Sitzung dauert 30 Tage.',
    current: 'Dieses Gerät',
    unknownDevice: 'Unbekanntes Gerät',
    lastSeen: 'Zuletzt gesehen am {date}',
    revokeAll: 'Überall abmelden',
    revokeAllHint: 'Beendet alle Sitzungen, auch diese',
    revokeAllConfirm: 'Von allen Geräten abmelden?',
  },
  email: {
    subject: 'Dein Anmeldelink für Under the Tree',
    intro: 'Hier ist dein Anmeldelink für Under the Tree:',
    validity: 'Er ist 15 Minuten gültig und funktioniert nur einmal.',
    ignore:
      'Falls du nichts angefordert hast, ignoriere diese Nachricht: Ohne diesen Link kann sich niemand anmelden.',
  },
} satisfies Dict<typeof fr>;
