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
  capWarning: {
    subject: {
      day: 'Under the Tree: 70 % der E-Mails von heute',
      month: 'Under the Tree: 70 % der E-Mails dieses Monats',
    },
    body: {
      day: '{used} E-Mails heute gesendet, von {cap}.',
      month: '{used} E-Mails diesen Monat gesendet, von {cap}.',
    },
    next: 'Bei 100 % des Monats werden E-Mails von selbst ausgesetzt, außer Anmeldelinks.',
  },
  unfollow: 'Einer Liste nicht mehr folgen',
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
      followed_ideas: {
        one: '{count} neue Idee für {name}',
        other: '{count} neue Ideen für {name}',
      },
      followed_ideasList: {
        one: '{count} neue Idee auf der Liste',
        other: '{count} neue Ideen auf der Liste',
      },
      followed_person: '{name} steht auf der Liste',
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
