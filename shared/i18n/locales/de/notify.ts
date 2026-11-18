import type fr from '../fr/notify';
import type { Dict } from '../../types';

export default {
  joined: {
    subject: '{name} ist „{group}“ beigetreten',
    body: '{name} ist gerade über den Einladungslink der Gruppe „{group}“ beigetreten.',
    next: 'Denk daran, die Person der laufenden Auslosung und ihren Ausschlüssen (Partner, Geschwister) hinzuzufügen.',
  },
  allViewed: {
    subject: 'Alle Umschläge in „{group}“ sind geöffnet',
    body: 'Für {edition} in „{group}“ weiß jetzt jeder, wen er beschenkt. Jetzt fehlen nur noch die Geschenke.',
  },
  reminder: {
    subject: 'Die Feier in „{group}“ naht',
    body: 'Die Feier von {edition} ist am {date}.',
    missing: {
      one: '{count} Person hat ihren Umschlag noch nicht geöffnet: {names}.',
      other:
        '{count} Personen haben ihren Umschlag noch nicht geöffnet: {names}.',
    },
    next: 'Du kannst ihnen ihren Link in der Ausgabe erneut senden.',
  },
} satisfies Dict<typeof fr>;
