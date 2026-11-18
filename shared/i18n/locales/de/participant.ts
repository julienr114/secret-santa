import type fr from '../fr/participant';
import type { Dict } from '../../types';

export default {
  revealed: {
    bannerTitle: 'Die Auslosung ist kein Geheimnis mehr.',
    bannerBy:
      '{name} hat sie am {date} aufgedeckt: Alle sehen, wer wen beschenkt.',
    bannerOrganizer:
      'Dein Organisator hat sie am {date} aufgedeckt: Alle sehen, wer wen beschenkt.',
    bannerMe:
      'Du hast sie am {date} aufgedeckt: Alle sehen, wer wen beschenkt.',
    journal: 'Im Protokoll ansehen',
    santaTitle: 'Wer beschenkt mich?',
    santaTitlePast: 'Wer hat mich beschenkt?',
    santaShow: 'Tippe, um es zu sehen, oder bewahre die Überraschung',
    santaShowPast: 'Tippe, um es zu sehen',
    santaHide: 'Tippe, um es zu verbergen',
    santaIs: { before: 'Dein Geschenk kommt von', after: '.' },
    santaIsPast: { before: 'Dein Geschenk kam von', after: '.' },
    all: 'Die ganze Auslosung ansehen',
    allHint: 'Wer wen beschenkt, für die ganze Gruppe',
    allHintPast: 'Wer wen beschenkt hat, in der ganzen Gruppe',
    gaveTo: 'Du hast beschenkt:',
    afterBody:
      'Die Feier ist vorbei. Die Auslosung ist aufgedeckt: Alle sehen, wer wen beschenkt hat.',
    closedBody: 'Für dieses Jahr ist Schluss. Bis nächstes Jahr?',
    pageTitle: 'Wer beschenkt wen',
    pageBody:
      'Die Auslosung wurde am {date} aufgedeckt. Alle Teilnehmenden sehen diese Liste.',
    listTitle: {
      one: 'Die Auslosung · {count} Teilnehmende',
      other: 'Die Auslosung · {count} Teilnehmende',
    },
    you: 'du',
    givesTo: 'beschenkt {name}',
  },
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
      drawRevealed: 'Auslosung aufgedeckt',
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
      title: 'Noch ein wenig Geduld',
      body: 'Die Auslosung steht noch aus. Dein Organisator meldet sich; behalte diesen Link, hier spielt sich alles ab.',
      action: 'Meine Geschenk-Hinweise hinterlassen',
      hint: 'Greif in der Zwischenzeit der Person unter die Arme, die dich ziehen wird.',
    },
    ready: {
      title: 'Dein Umschlag wartet auf dich',
      body: 'Die Auslosung ist erfolgt. Schau kurz, ob dir niemand über die Schulter guckt, und öffne ihn dann.',
      bodyHints:
        'Die Auslosung ist erfolgt, und drinnen warten Geschenk-Hinweise auf dich. Schau kurz, ob dir niemand über die Schulter guckt, und öffne ihn dann.',
      reveal: 'Erfahren, wen ich beschenke',
      revealing: 'Umschlag wird geöffnet…',
      hint: 'Dein Umschlag schließt sich von selbst, sobald du die Seite verlässt.',
    },
    shown: {
      hide: 'Meinen Umschlag schließen',
      hint: 'Sonst schließt sich dein Umschlag von selbst, wenn du die Seite verlässt.',
    },
    seen: {
      title: 'Gedächtnislücke?',
      body: 'Dein Umschlag ist noch da. Schau kurz, ob dir niemand über die Schulter guckt.',
      bodyHints:
        'Dein Umschlag ist noch da, samt Geschenk-Hinweisen. Schau kurz, ob dir niemand über die Schulter guckt.',
      newTitle: 'Neue Hinweise warten auf dich',
      newBody:
        'Die Person, die du beschenkst, hat seit deinem letzten Besuch welche hinterlassen. Schau kurz, ob dir niemand über die Schulter guckt.',
      revealWithHints: 'Noch einmal sehen, wen ich beschenke, samt Hinweisen',
      noHintsYet:
        'Noch keine Hinweise. Du kannst darum bitten, ohne dich zu verraten.',
      revealAgain: 'Noch einmal sehen, wen ich beschenke',
    },
    closed: {
      title: 'Das Fest ist vorbei',
      body: 'Für dieses Jahr ist Schluss. Du kannst noch sehen, wen du beschenkt hast.',
      bodyNotSeen:
        'Für dieses Jahr ist Schluss. Du kannst noch erfahren, wen du beschenken solltest.',
    },
    tiles: {
      hintsTodo: 'Auszufüllen',
      hintsEditable: 'Ausgefüllt, änderbar bis zur Feier',
      hintsLocked: 'Ausgefüllt, nicht mehr änderbar',
      hintsShort: 'Ausgefüllt',
      hintsShortLocked: 'Nicht mehr änderbar',
      game: {
        skipped: 'Du setzt aus',
        count: {
          one: '{count} von {total} hat gespielt',
          other: '{count} von {total} haben gespielt',
        },
        days: {
          one: 'Nur noch ein Tag',
          other: 'Nur noch {count} Tage',
        },
        lastDay: 'Letzter Tag',
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
    empty: 'Alles ruhig. Ein gutes Zeichen.',
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
      body: 'Die Auslosung fand außerhalb der App statt. Sag hier, wen du beschenkst, um die Geschenk-Hinweise zu sehen. Schau kurz, ob dir niemand über die Schulter guckt.',
      action: 'Sagen, wen ich beschenke',
      hint: 'Deine Antwort bleibt geheim, selbst für den Organisator.',
      savedTitle: 'Ist notiert',
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
    saved: 'Ist notiert',
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
    surprise: 'Bei der Feier wartet eine Überraschung auf die Gruppe.',
    surpriseMore: 'Je mehr von euch spielen, desto schöner wird sie.',
    challenge: {
      one: 'Letztes Jahr hat {count} von {total} Personen den eigenen Wichtel erraten. Zu schlagen.',
      other:
        'Letztes Jahr haben {count} von {total} Personen ihren Wichtel erraten. Zu schlagen.',
    },
    challengeNone:
      'Letztes Jahr hat niemand den eigenen Wichtel erraten. Zu schlagen.',
    skip: 'Ich setze aus',
    skippedTitle: 'Du setzt aus',
    skippedBody:
      'Wir erinnern dich nicht an das Spiel. Die Überraschung siehst du bei der Feier trotzdem.',
    unskip: 'Doch, ich spiele',
    unskipUntil: 'Möglich bis {end}.',
    skipConfirm: 'Aussetzen?',
    skipConfirmBody:
      'Wir erinnern dich nicht mehr an das Spiel. Du kannst bis {end} zurückkommen.',
    skipCancel: 'Doch nicht',
    progress: {
      one: '{count} Tipp von {total}.',
      other: '{count} Tipps von {total}.',
    },
    progressLeft: {
      one: 'Noch einer, und du hast die Runde gemacht: Die Überraschung bei der Feier wird umso schöner.',
      other:
        'Noch {n}, und du hast die Runde gemacht: Die Überraschung bei der Feier wird umso schöner.',
    },
    progressDone:
      'Du hast die Runde gemacht: Die Überraschung bei der Feier wird umso schöner.',
    inviteTitle: 'Und du: Wer beschenkt dich?',
    inviteCount: {
      one: '{count} von {total} hat schon getippt. Antwort bei der Feier.',
      other: '{count} von {total} haben schon getippt. Antwort bei der Feier.',
    },
    inviteNone: 'Antwort bei der Feier.',
    makeGuess: 'Meinen Tipp abgeben',
    changeMind: 'Meine Meinung ändern',
    secret: 'Niemand sieht deinen Tipp vor der Feier.',
    mySanta: 'Mein Wichtel',
    others: 'Die anderen',
    mine: 'Meine Tipps',
    choose: '+ Wählen',
    changeFor: 'Den Tipp für {name} ändern',
    me: 'Ich',
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
      'Die Antworten kommen, wenn dein Organisator die Auslosung aufdeckt. Mit einer Überraschung.',
    answersTitle: 'Devine qui: die Antworten',
    answersWaiting:
      'Die Auslosung ist aufgedeckt. Die Antworten warten auf dich.',
    answersSeen: 'Die Auslosung ist aufgedeckt. Das waren deine Tipps wert.',
    discover: 'Die Rangliste entdecken',
    rewatch: 'Die Rangliste noch einmal ansehen',
    palmaresHint: 'Dein Wichtel, der Detektiv, die am besten Versteckten…',
    palmaresHintSmall: 'Dein Wichtel, endlich enttarnt',
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
      crowd: '{count} Personen gleichauf',
      unmasked: {
        title: 'Enttarnt',
        titleMany: 'Enttarnt',
        body: 'Hat den eigenen Wichtel erraten.',
        bodyMany: 'Sie haben ihren Wichtel erraten.',
        share: '{n} von {m}',
        crowdOf: 'Personen von {total}',
        shareBody: 'haben ihren Wichtel erraten.',
        all: 'Die Wichtel konnten nichts verbergen.',
        most: 'Ein gutes Jahr für Detektive.',
      },
      detective: {
        title: 'Der Detektiv',
        titleMany: 'Die Detektive',
        body: '{right} richtige Tipps von {made}.',
        bodyAlone: {
          one: '{right} richtige Tipps von {made}, davon einer, den sonst niemand gefunden hat.',
          other:
            '{right} richtige Tipps von {made}, davon {n}, die sonst niemand gefunden hat.',
        },
        bodyMany: 'Je {right} richtige Tipps von {made}.',
      },
      flawless: {
        title: 'Fehlerfrei',
        titleMany: 'Fehlerfrei',
        body: '{N} Tipps, {n} richtig. Nichts zu meckern.',
        bodyMany: '{N} Tipps pro Person, alle richtig. Nichts zu meckern.',
      },
      transparent: {
        title: 'Der Durchschaubarste',
        titleMany: 'Die Durchschaubarsten',
        body: '{N} von {m} Personen haben ihn enttarnt. Ein Geheimnis zu wahren ist nicht leicht.',
        bodyMany:
          '{N} von {m} Personen haben jeden von ihnen enttarnt. Ein Geheimnis zu wahren ist nicht leicht.',
      },
      hidden: {
        title: 'Der am besten Versteckte',
        titleMany: 'Die am besten Versteckten',
        none: '{N} Personen haben ihn gesucht, keine hat ihn gefunden. Große Kunst.',
        one: '{N} Personen haben ihn gesucht, nur eine hat ihn gefunden.',
        some: '{N} Personen haben ihn gesucht, nur {f} haben ihn gefunden.',
        manyNone:
          '{N} Personen haben jeden von ihnen gesucht, keine hat sie gefunden. Große Kunst.',
        manySome:
          '{N} Personen haben jeden von ihnen gesucht, wenige haben sie gefunden.',
      },
      rumour: {
        title: 'Das Gerücht',
        titleMany: 'Das Gerücht',
        claim: '{giver} beschenkte\n{recipient}?',
        body: '{N} von euch waren sich sicher. Es war falsch.',
      },
      suspect: {
        title: 'Der ideale Verdächtige',
        titleMany: 'Die idealen Verdächtigen',
        never: '{count}-mal als Wichtel genannt. Jedes Mal zu Unrecht.',
        body: '{count}-mal zu Unrecht als Wichtel genannt.',
        bodyMany: 'Je {count}-mal zu Unrecht als Wichtel genannt.',
      },
      twins: {
        title: 'Die Zwillinge',
        titleMany: 'Die Zwillinge',
        noError: '{N} gleiche Tipps von {m}. Habt ihr euch abgesprochen?',
        oneError:
          '{N} gleiche Tipps von {m}, davon ein Fehler. Habt ihr euch abgesprochen?',
        errors:
          '{N} gleiche Tipps von {m}, davon {e} Fehler. Habt ihr euch abgesprochen?',
      },
      triplets: {
        title: 'Die Drillinge',
        titleMany: 'Die Drillinge',
        body: 'Dieselben Tipps, zu dritt. Da wurde getuschelt.',
      },
      lastMinute: {
        title: 'Auf den letzten Drücker',
        titleMany: 'Auf den letzten Drücker',
        last: 'Hat sich in der allerletzten Minute entschieden.',
        body: {
          one: 'Hat sich eine Minute vor dem Ende der Tipps entschieden.',
          other: 'Hat sich {n} Minuten vor dem Ende der Tipps entschieden.',
        },
      },
      weathervane: {
        title: 'Die Wetterfahne',
        titleMany: 'Die Wetterfahnen',
        body: 'Hat {n}-mal die Meinung geändert, bevor die Entscheidung fiel.',
        bodyMany: 'Haben je {n}-mal die Meinung geändert.',
      },
      group: {
        title: 'Ihr alle',
        titleMany: 'Ihr alle',
        score: '{right} von {total}',
        scoreLabel: 'richtige Tipps',
        better: 'Per Zufall hättet ihr {chance} gehabt. Gar nicht schlecht.',
        same: 'Per Zufall hättet ihr {chance} gehabt. Der Zufall hätte es genauso gut gemacht.',
        worse:
          'Per Zufall hättet ihr {chance} gehabt. Die Wichtel waren gut versteckt.',
      },
      closeCall: {
        title: 'So knapp',
        big: 'Fast!',
        body: 'Du hattest den Wichtel von {name} gefunden… und dann umentschieden. Das Bauchgefühl hatte recht.',
        bodyMe:
          'Du hattest deinen Wichtel gefunden… und dann umentschieden. Das Bauchgefühl hatte recht.',
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
      rightSmall: {
        alone: 'Enttarnt. Sonst hat niemand gespielt, und du lagst richtig.',
        two: 'Enttarnt. Ihr wart zu zweit beim Spielen, und du lagst richtig.',
        three:
          'Enttarnt. Ihr wart zu dritt beim Spielen, und du lagst richtig.',
      },
      wrongBody: 'Daneben: Du hattest {name} gesagt.',
      noGuessBody: 'Du hattest keinen Tipp abgegeben. Nächstes Jahr?',
      endEyebrow: 'Das war es für dieses Jahr',
      endTitle: 'Frohe Weihnachten,\n{name}',
      endTitleAlone: 'Frohe Weihnachten!',
      allResults: 'Alle Ergebnisse ansehen',
      again: 'Von vorne ansehen',
      tapNext: 'Tippe, um weiterzumachen',
    },
  },
} satisfies Dict<typeof fr>;
