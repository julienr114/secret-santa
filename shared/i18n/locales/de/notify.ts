import type fr from '../fr/notify';
import type { Dict } from '../../types';

export default {
  joined: {
    subject: '{name} ist dem Event beigetreten',
    body: '{name} ist gerade über den Einladungslink dem Event „{group}“ beigetreten.',
    next: 'Denk daran, die Person dem laufenden Wichteln und ihren Ausschlüssen (Partner, Geschwister) hinzuzufügen.',
  },
  allViewed: {
    subject: 'Alle Umschläge sind geöffnet',
    body: 'Für {edition} in „{group}“ weiß jetzt jeder, wen er beschenkt. Jetzt fehlen nur noch die Geschenke.',
  },
  reminder: {
    subject: 'Der große Tag naht',
    body: '{edition} ist am {date}.',
    missing: {
      one: '{count} Person hat ihren Umschlag noch nicht geöffnet: {names}.',
      other:
        '{count} Personen haben ihren Umschlag noch nicht geöffnet: {names}.',
    },
    next: 'Du kannst ihnen ihren Link im Wichteln erneut senden.',
  },
} satisfies Dict<typeof fr>;
