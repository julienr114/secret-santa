import type fr from '../fr/notify';
import type { Dict } from '../../types';

export default {
  joined: {
    subject: '{name} ist „{group}“ beigetreten',
    body: '{name} ist gerade über den Einladungslink der Gruppe „{group}“ beigetreten.',
    next: 'Denk daran, die Person der laufenden Auslosung und ihren Ausschlüssen (Partner, Geschwister) hinzuzufügen.',
  },
  allViewed: {
    subject: 'Alle haben ihre Auslosung in „{group}“ entdeckt',
    body: 'Für {edition} in „{group}“ weiß jetzt jeder, wen er beschenkt.',
  },
  reminder: {
    subject: 'Die Bescherung in „{group}“ naht',
    body: 'Die Bescherung von {edition} ist am {date}.',
    missing: {
      one: '{count} Person hat ihre Auslosung noch nicht entdeckt: {names}.',
      other:
        '{count} Personen haben ihre Auslosung noch nicht entdeckt: {names}.',
    },
    next: 'Du kannst ihnen ihren Link in der Ausgabe erneut senden.',
  },
} satisfies Dict<typeof fr>;
