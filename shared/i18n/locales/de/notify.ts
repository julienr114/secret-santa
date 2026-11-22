import type fr from '../fr/notify';
import type { Dict } from '../../types';

export default {
  joined: {
    subject: '{name} hat sich über den Link angemeldet',
    body: '{name} hat sich gerade über den Einladungslink zum Wichteln „{group}“ angemeldet.',
    next: 'Denk an die Ausschlüsse (Paar, Geschwister).',
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
