import type fr from '../fr/notify';
import type { Dict } from '../../types';

export default {
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
  hello: 'Hallo {firstName},',
  helloNoName: 'Hallo,',
  settings: 'Diese Einstellung ändern',
  news: {
    subject: {
      envelope: 'Dein Umschlag wartet auf dich',
      ticked: {
        one: '{count} Geschenk wurde auf deiner Liste abgehakt',
        other: '{count} Geschenke wurden auf deiner Liste abgehakt',
      },
      joined_gift: '{name} beteiligt sich an deinem Gemeinschaftsgeschenk',
      revealed: 'Die Auslosung ist aufgedeckt',
      palmares: 'Die Rangliste von Devine qui ist da',
      joined: '{name} hat sich über den Link angemeldet',
      all_viewed: 'Alle haben ihre Auslosung gesehen',
      santa_added: '{name} hat dich zum Wichteln hinzugefügt',
      list_shared: '{name} hat die eigene Liste mit dir geteilt',
      game_open: 'Du bist dran bei Devine qui',
    },
    footer: 'Eine E-Mail für jede Neuigkeit.',
  },
  summary: {
    subject: {
      one: 'Under the Tree: {count} Neuigkeit seit gestern',
      other: 'Under the Tree: {count} Neuigkeiten seit gestern',
    },
    intro: 'Das wartet auf dich.',
    openParty: 'Veranstaltung öffnen',
    openList: 'Liste öffnen',
    footer: 'Nur eine Zusammenfassung am Tag, und nur wenn es Neues gibt.',
  },
} satisfies Dict<typeof fr>;
