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
    tiles: {
      hintsTodo: 'Auszufüllen',
      hintsEditable: 'Ausgefüllt, änderbar bis zur Feier',
      hintsLocked: 'Ausgefüllt, nicht mehr änderbar',
      hintsShort: 'Ausgefüllt',
      hintsShortLocked: 'Nicht mehr änderbar',
      game: {
        play: 'Gib deinen Tipp ab',
        played: 'Tipp abgegeben',
        waiting: 'Antwort bei der Feier',
        palmares: 'Die Rangliste wartet',
        answers: 'Die Antworten ansehen',
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
  game: {
    title: 'Devine qui',
    introSanta: 'Ein einziger Tipp, den du bis {end} ändern kannst.',
    introAll: 'Wer beschenkt wen? So viele Tipps, wie du willst, bis {end}.',
    closedSince: 'Die Tipps sind seit {end} geschlossen.',
    whoGivesMeCaps: 'Wer beschenkt dich?',
    whoGivesMe: 'Wer beschenkt dich?',
    whoGivesMeShort: 'Wer beschenkt dich?',
    whoGivesTo: 'Wer beschenkt {name}?',
    myGuess: 'Mein Tipp',
    makeGuess: 'Meinen Tipp abgeben',
    changeMind: 'Meine Meinung ändern',
    secret: 'Niemand sieht deinen Tipp vor der Feier.',
    mySanta: 'Mein Wichtel',
    others: 'Die anderen',
    mine: 'Meine Tipps',
    choose: '+ Wählen',
    changeFor: 'Den Tipp für {name} ändern',
    you: 'dich',
    noGuess: 'Kein Tipp',
    count: {
      one: '{count} Tipp. Niemand sieht ihn vor der Feier.',
      other: '{count} Tipps. Niemand sieht sie vor der Feier.',
    },
    canChange: 'Du kannst deine Meinung ändern.',
    oneGift: 'Eine Person macht nur ein Geschenk.',
    movedFrom: 'Dein Tipp für {name}: Ihn zu wählen verschiebt ihn hierher',
    movedFromMe: 'Dein Tipp für dich: Ihn zu wählen verschiebt ihn hierher',
    clear: 'Diesen Tipp löschen',
    atParty: 'Antwort bei der Feier',
    atPartyBody:
      'Die Ergebnisse und die Rangliste kommen, wenn dein Organisator die Auslosung aufdeckt.',
    answersTitle: 'Devine qui: die Antworten',
    answersWaiting:
      'Die Auslosung ist aufgedeckt. Die Antworten warten auf dich.',
    answersSeen: 'Die Auslosung ist aufgedeckt. Das waren deine Tipps wert.',
    organizerFew:
      'Weniger als drei Personen haben gespielt: diesmal keine Rangliste.',
    answersFew:
      'Die Auslosung ist aufgedeckt. Ihr wart weniger als drei Spieler: diesmal keine Rangliste, aber das waren deine Tipps wert.',
    discover: 'Die Rangliste entdecken',
    rewatch: 'Die Rangliste noch einmal ansehen',
    palmaresHint: 'Dein Wichtel, der Detektiv, die am besten Versteckten…',
    mineScore: {
      one: 'Meine Tipps · {right} richtig von {count}',
      other: 'Meine Tipps · {right} richtig von {count}',
    },
    mySantaWas: 'Dein Wichtel: {name}',
    theirSantaWas: 'Der von {name}: {giver}',
    right: 'Gut erkannt',
    youSaid: 'Du sagtest {name}',
    arrived: 'Die Rangliste von Devine qui ist da',
    arrivedBody: 'Wer hat wen beschenkt, und wer hatte es erraten?',
    seeMyResult: 'Noch einmal sehen, wen ich beschenkt habe',
    discoverMyResult: 'Entdecken, wen ich beschenkt habe',
    awards: {
      unmasked: {
        title: 'Enttarnt',
        titleMany: 'Enttarnt',
        body: 'Hat den eigenen Wichtel erraten.',
        bodyMany: 'Haben den eigenen Wichtel erraten.',
        crowd: '{count} Personen',
      },
      detective: {
        title: 'Der Detektiv',
        titleMany: 'Die Detektive',
        body: {
          one: '{count} richtiger Tipp von {total}. Niemand war besser.',
          other: '{count} richtige Tipps von {total}. Niemand war besser.',
        },
        bodyMany: {
          one: '{count} richtiger Tipp von {total}, gleichauf.',
          other: '{count} richtige Tipps von {total}, gleichauf.',
        },
        crowd: '{count} Detektive',
      },
      transparent: {
        title: 'Der Durchschaubarste',
        titleMany: 'Die Durchschaubarsten',
        body: {
          one: 'Von {count} Person enttarnt.',
          other: 'Von {count} Personen enttarnt.',
        },
        bodyMany: {
          one: 'Jeweils von {count} Person enttarnt.',
          other: 'Jeweils von {count} Personen enttarnt.',
        },
        crowd: '{count} Personen',
      },
      hidden: {
        title: 'Am besten versteckt',
        titleMany: 'Am besten versteckt',
        body: 'Niemand hat sie enttarnt. Große Kunst.',
        bodyMany: 'Niemand hat sie enttarnt. Große Kunst.',
        crowd: '{count} Personen',
      },
      suspect: {
        title: 'Der ideale Verdächtige',
        titleMany: 'Die idealen Verdächtigen',
        body: '{count}-mal zu Unrecht genannt. Man fragt sich, warum.',
        bodyMany:
          'Jeweils {count}-mal zu Unrecht genannt. Man fragt sich, warum.',
        crowd: '{count} Personen',
      },
    },
    story: {
      header: 'Devine qui · {label}',
      progress: 'Bild {index} von {count}',
      close: 'Schließen',
      openingEyebrow: 'Die Antworten sind da',
      openingTitle: 'Wer hat wen\nbeschenkt?',
      openingBody:
        '{players} Spieler, {guesses} Tipps. Mal sehen, was sie wert waren.',
      mySanta: 'Dein Wichtel',
      youSaid: 'Du hattest\n{name} gesagt…',
      noGuess: 'Und dein Wichtel war…',
      soWell: 'Und, gut erkannt?',
      right: 'Es war\ntatsächlich {name}!',
      was: 'Es war {name}.',
      rightBody:
        'Enttarnt. Du gehörst zu den {count} von {total}, die es erraten haben.',
      wrongBody: 'Daneben: Du hattest {name} gesagt.',
      noGuessBody: 'Du hattest keinen Tipp abgegeben.',
      endEyebrow: 'Das war es für dieses Jahr',
      endTitle: 'Frohe Weihnachten,\n{name}',
      endTitleAlone: 'Frohe Weihnachten!',
      allResults: 'Alle Ergebnisse ansehen',
      again: 'Von vorne ansehen',
      tapNext: 'Tippe, um weiterzumachen',
    },
  },
} satisfies Dict<typeof fr>;
