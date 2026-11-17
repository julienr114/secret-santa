import type fr from '../fr/participant';
import type { Dict } from '../../types';

export default {
  home: {
    greeting: 'Hallo {firstName}!',
    facts: { budget: 'Budget:', party: 'Feier am' },
    note: { title: 'Die Nachricht des Organisators', more: 'Weiterlesen' },
    changeAvatar: 'Mein Symbol ändern',
    steps: {
      label: 'Schritte der Auslosung',
      invitation: 'Einladung',
      drawSoon: 'Auslosung · bald',
      answer: 'Deine Antwort',
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
      action: 'Meine Geschenk-Hinweise hinterlassen',
      hint: 'Hilf in der Zwischenzeit der Person, die dich ziehen wird.',
    },
    ready: {
      title: 'Dein Umschlag wartet auf dich',
      body: 'Die Auslosung ist erfolgt. Achte darauf, dass niemand auf deinen Bildschirm schaut, bevor du ihn öffnest.',
      bodyHints:
        'Die Auslosung ist erfolgt, und drinnen warten Geschenk-Hinweise auf dich. Achte darauf, dass niemand auf deinen Bildschirm schaut, bevor du ihn öffnest.',
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
      bodyHints:
        'Drinnen warten die Geschenk-Hinweise auf dich. Achte darauf, dass niemand auf deinen Bildschirm schaut.',
      newTitle: 'Neue Hinweise warten auf dich',
      newBody:
        'Die Person, die du beschenkst, hat seit deinem letzten Besuch welche hinterlassen. Achte darauf, dass niemand auf deinen Bildschirm schaut.',
      revealWithHints: 'Mein Ergebnis und die Hinweise noch einmal sehen',
      noHintsYet: 'Noch keine Hinweise. Du kannst darum bitten.',
      revealAgain: 'Noch einmal sehen, wen ich beschenke',
    },
    closed: {
      title: 'Das Fest ist vorbei',
      body: 'Diese Ausgabe ist abgeschlossen. Du kannst noch sehen, wen du beschenkt hast.',
      bodyNotSeen:
        'Diese Ausgabe ist abgeschlossen. Du kannst noch erfahren, wen du beschenken solltest.',
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
    seeLink: 'Link ansehen',
  },
  wishes: {
    openLink: 'Link von „{label}“ öffnen',
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
  answer: {
    card: {
      title: 'Wen beschenkst du?',
      body: 'Die Auslosung fand außerhalb der App statt. Sag es hier, um die Geschenk-Hinweise deiner Person zu sehen. Achte darauf, dass niemand auf deinen Bildschirm schaut.',
      action: 'Sagen, wen ich beschenke',
      hint: 'Deine Antwort bleibt geheim, selbst für den Organisator.',
      savedTitle: 'Antwort gespeichert',
      savedBody: {
        one: 'Du siehst die Geschenk-Hinweise deiner Person, sobald alle geantwortet haben. Bisher {count} Antwort von {total}.',
        other:
          'Du siehst die Geschenk-Hinweise deiner Person, sobald alle geantwortet haben. Bisher {count} Antworten von {total}.',
      },
      review: 'Meine Antwort ansehen oder korrigieren',
      savedHint:
        'Deine Antwort bleibt verborgen: Sie erscheint nur, wenn du danach fragst.',
    },
    choose: {
      title: 'Wen beschenkst du?',
      description:
        'Die Person, die du gezogen hast, auf Papier oder in der anderen App.',
      search: 'Einen Vornamen suchen',
      results: {
        one: '{shown} Vorname von {total}',
        other: '{shown} Vornamen von {total}',
      },
    },
    confirm: {
      title: 'Du beschenkst {name}?',
      description:
        'Prüf es gut: Es ist die Person, die du gezogen hast, auf Papier oder in der anderen App.',
      note: 'Du kannst deine Antwort korrigieren, bis der Organisator die Auslosung bestätigt. Niemand sonst sieht sie.',
      yes: 'Ja, es ist {name}',
      other: 'Jemand anderen wählen',
    },
    saved: 'Antwort gespeichert',
  },
} satisfies Dict<typeof fr>;
