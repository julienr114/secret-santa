import type fr from '../fr/participant';
import type { Dict } from '../../types';

export default {
  home: {
    greeting: 'Hallo {firstName}!',
    changeAvatar: 'Mein Symbol ändern',
    waiting: {
      title: 'Die Auslosung hat noch nicht stattgefunden',
      body: 'Dein Organisator gibt dir Bescheid. Behalte diesen Link: hier erfährst du, wen du beschenkst.',
      wishes:
        'Notiere in der Zwischenzeit ein paar Geschenkideen für die Person, die dich ziehen wird.',
    },
    ready: {
      title: 'Die Auslosung ist erfolgt!',
      body: 'Achte darauf, dass niemand auf deinen Bildschirm schaut.',
      revealAgain: 'Noch einmal sehen, wen ich beschenke',
      ideasWaiting: {
        one: 'Die Liste enthält {count} Geschenkidee.',
        other: 'Die Liste enthält {count} Geschenkideen.',
      },
      reveal: 'Erfahren, wen ich beschenke',
      hide: 'Mein Ergebnis verbergen',
    },
    closed: 'Diese Ausgabe ist abgeschlossen.',
    wishes: {
      title: 'Meine Wunschliste',
      help: 'Hilf der Person, die dich gezogen hat',
      none: 'Keine Ideen',
    },
    journal: {
      title: 'Protokoll der Gruppe',
      subtitle: 'Alles, was passiert ist, für alle sichtbar',
    },
    avatar: {
      title: 'Mein Symbol',
      description: 'Wähle dein Emoji und deine Farbe.',
    },
  },
  reveal: {
    youGiveTo: 'Du beschenkst',
    budget: 'Budget',
    date: 'Datum',
    ideas: 'Geschenkideen dieser Person',
    noIdeas: '{name} hat noch keine Ideen angegeben.',
  },
  wishes: {
    title: 'Meine Wunschliste',
    intro:
      'Ein paar Ideen für die Person, die dich beschenkt. Nur sie wird sie sehen.',
    readOnly: 'Die Liste kann für diese Ausgabe nicht mehr geändert werden.',
    max: 'Höchstens {count} Ideen.',
    empty: 'Noch keine Ideen.',
    emptyReadOnly: 'Du hattest keine Ideen notiert.',
    openLink: 'Link von „{label}“ öffnen',
    add: 'Idee hinzufügen',
    sheet: {
      new: 'Neue Idee',
      edit: 'Idee bearbeiten',
      description: 'Eine kurze Idee und ein Link, falls du einen hast.',
      idea: 'Idee',
      ideaPlaceholder: 'Ein Buch, Socken…',
      link: 'Link (optional)',
      remove: 'Idee löschen',
    },
  },
  journal: {
    title: 'Protokoll der Gruppe',
    intro: 'Alle sehen dieses Protokoll. Es verrät nie, wer wen beschenkt.',
    allEditions: 'Alle Ausgaben',
    edition: 'Ausgabe',
    empty: 'Noch nichts zu berichten.',
  },
  invalid: { title: 'Hoppla' },
} satisfies Dict<typeof fr>;
