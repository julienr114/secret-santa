import type fr from '../fr/participant';
import type { Dict } from '../../types';

export default {
  home: {
    greeting: 'Hallo {firstName}!',
    changeAvatar: 'Mein Symbol ändern',
    steps: {
      label: 'Schritte der Auslosung',
      invitation: 'Einladung',
      drawSoon: 'Auslosung · bald',
      drawDone: 'Auslosung erfolgt',
      party: 'Fest',
      partyIn: {
        one: 'Fest · in {count} Tag',
        other: 'Fest · in {count} Tagen',
      },
      partyToday: 'Fest · heute',
      partyOver: 'Fest vorbei',
    },
    waiting: {
      title: 'Die Auslosung hat noch nicht stattgefunden',
      body: 'Dein Organisator gibt dir Bescheid. Behalte diesen Link: hier erfährst du, wen du beschenkst.',
      action: 'Meine Geschenkideen notieren',
      hint: 'Hilf in der Zwischenzeit der Person, die dich ziehen wird.',
    },
    ready: {
      title: 'Dein Umschlag wartet auf dich',
      body: 'Die Auslosung ist erfolgt. Achte darauf, dass niemand auf deinen Bildschirm schaut, bevor du ihn öffnest.',
      reveal: 'Erfahren, wen ich beschenke',
      revealing: 'Umschlag wird geöffnet…',
      hint: 'Dein Ergebnis schließt sich, sobald du die Seite verlässt.',
    },
    shown: {
      hide: 'Mein Ergebnis verbergen',
      hint: 'Es schließt sich von selbst, wenn du die Seite verlässt.',
    },
    seen: {
      title: 'Du weißt schon, wen du beschenkst',
      body: 'Vergessen? Achte darauf, dass niemand auf deinen Bildschirm schaut.',
      revealAgain: 'Noch einmal sehen, wen ich beschenke',
      ideasWaiting: {
        one: 'Die Liste enthält {count} Geschenkidee.',
        other: 'Die Liste enthält {count} Geschenkideen.',
      },
    },
    closed: {
      title: 'Das Fest ist vorbei',
      body: 'Diese Ausgabe ist abgeschlossen. Du kannst noch sehen, wen du beschenkt hast.',
      bodyNotSeen:
        'Diese Ausgabe ist abgeschlossen. Du kannst noch erfahren, wen du beschenken solltest.',
    },
    wishes: {
      title: 'Meine Wunschliste',
      help: 'Hilf der Person, die dich gezogen hat',
      none: 'Keine Ideen',
      editable: {
        one: '{count} Idee · bis zum Fest änderbar',
        other: '{count} Ideen · bis zum Fest änderbar',
      },
      locked: {
        one: '{count} Idee · nicht mehr änderbar',
        other: '{count} Ideen · nicht mehr änderbar',
      },
    },
    journal: {
      title: 'Protokoll der Gruppe',
      subtitle: 'Alles, was passiert ist, für alle sichtbar',
      alerts: {
        one: '{count} Hinweis seit deinem letzten Besuch',
        other: '{count} Hinweise seit deinem letzten Besuch',
      },
    },
  },
  reveal: {
    youGiveTo: 'Du beschenkst',
    budget: 'Budget',
    date: 'Datum',
    guardianMessage: 'Die Nachricht des Organisators',
    ideas: 'Geschenkideen dieser Person',
    noIdeas: '{name} hat noch keine Ideen angegeben.',
    seeLink: 'Link ansehen',
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
  invalid: { title: 'Hoppla, dieser Link funktioniert nicht mehr' },
  account: {
    title: 'Behalte deine Auslosungen an einem Ort',
    body: 'Erstelle ein Konto mit deiner E-Mail-Adresse: Du findest diese Auslosung und die nächsten, ohne den Link zu suchen.',
    bodyClaim:
      'Füge diese Auslosung deinem Konto hinzu, um sie auf deiner Startseite zu finden.',
    create: 'Mein Konto erstellen',
    claim: 'Zu meinem Konto hinzufügen',
    added: 'Auslosung zu deinem Konto hinzugefügt',
    sendTo: 'Meinen Link an {email} senden',
    sent: 'Link an {email} gesendet: Öffne ihn, um dein Konto zu erstellen. Schau auch im Spam-Ordner nach.',
  },
} satisfies Dict<typeof fr>;
