import type fr from '../fr/participant';
import type { Dict } from '../../types';

export default {
  myList: {
    ideaLabel: 'Eine Geschenkidee',
    add: 'Hinzufügen',
    accountNote:
      'Mit deiner Adresse {email} wird ein Konto erstellt, damit du deine Liste wiederfindest.',
    title: 'Deine E-Mail-Adresse, um deine Liste zu schreiben',
    label: 'Deine E-Mail-Adresse',
    submit: 'Bestätigen',
    confirm: 'Du bekommst einen Link, um sie zu bestätigen.',
    sent: 'Link an {email} gesendet: Öffne ihn, um deine Liste zu schreiben. Schau auch im Spam nach.',
  },
  revealed: {
    bannerTitle: 'Die Auslosung ist kein Geheimnis mehr.',
    bannerBy:
      '{name} hat sie am {date} aufgedeckt: Alle sehen, wer wen beschenkt.',
    bannerOrganizer: {
      one: 'Dein Organisator hat sie am {date} aufgedeckt: Alle sehen, wer wen beschenkt.',
      other:
        'Einer deiner Organisatoren hat sie am {date} aufgedeckt: Alle sehen, wer wen beschenkt.',
    },
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
    allHint: 'Wer wen beschenkt, für alle Teilnehmenden',
    allHintPast: 'Wer wen beschenkt hat, für alle Teilnehmenden',
    gaveTo: 'Du hast beschenkt:',
    afterBody:
      'Der große Tag ist vorbei. Die Auslosung ist aufgedeckt: Alle sehen, wer wen beschenkt hat.',
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
    facts: { budget: 'Budget:', party: 'Großer Tag' },
    note: {
      title: {
        one: 'Die Nachricht des Organisators',
        other: 'Die Nachricht der Organisatoren',
      },
      more: 'Weiterlesen',
    },
    changeAvatar: 'Mein Symbol ändern',
    steps: {
      label: 'Schritte des Wichtelns',
      invitation: 'Einladung',
      drawSoon: 'Auslosung · bald',
      answer: 'Deine Antwort',
      drawRevealed: 'Auslosung aufgedeckt',
      drawDone: 'Auslosung erfolgt',
      party: 'Großer Tag',
      partyIn: {
        one: 'Großer Tag · in {count} Tag',
        other: 'Großer Tag · in {count} Tagen',
      },
      partyToday: 'Großer Tag · heute',
      partyOver: 'Großer Tag vorbei',
    },
    waiting: {
      title: 'Noch ein wenig Geduld',
      body: {
        one: 'Die Auslosung steht noch aus. Dein Organisator meldet sich; behalte diesen Link, hier spielt sich alles ab.',
        other:
          'Die Auslosung steht noch aus. Deine Organisatoren melden sich; behalte diesen Link, hier spielt sich alles ab.',
      },
      action: 'Meine Wunschliste schreiben',
      hint: 'Greif in der Zwischenzeit der Person unter die Arme, die dich ziehen wird.',
    },
    ready: {
      title: 'Dein Umschlag wartet auf dich',
      body: 'Die Auslosung ist erfolgt. Schau kurz, ob dir niemand über die Schulter guckt, und öffne ihn dann.',
      bodyHints:
        'Die Auslosung ist erfolgt, und drinnen warten Geschenkideen auf dich. Schau kurz, ob dir niemand über die Schulter guckt, und öffne ihn dann.',
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
        'Dein Umschlag ist noch da, samt Geschenkideen. Schau kurz, ob dir niemand über die Schulter guckt.',
      newTitle: 'Neue Ideen warten auf dich',
      newBody:
        'Die Person, die du beschenkst, hat seit deinem letzten Besuch welche hinterlassen. Schau kurz, ob dir niemand über die Schulter guckt.',
      revealWithHints: 'Noch einmal sehen, wen ich beschenke, samt Ideen',
      noHintsYet:
        'Noch keine Ideen. Du kannst darum bitten, ohne dich zu verraten.',
      revealAgain: 'Noch einmal sehen, wen ich beschenke',
    },
    closed: {
      title: 'Der große Tag ist vorbei',
      body: 'Für dieses Jahr ist Schluss. Du kannst noch sehen, wen du beschenkt hast.',
      bodyNotSeen:
        'Für dieses Jahr ist Schluss. Du kannst noch erfahren, wen du beschenken solltest.',
    },
    tiles: {
      list: {
        none: 'Noch nicht geschrieben',
        draft: 'Entwurf, nur du siehst sie',
        giver: 'Nur sichtbar für die Person, die mich gezogen hat',
        parties: 'Sichtbar für die Mitglieder des Events',
        public: 'Sichtbar für alle mit dem Link',
      },
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
        waiting: 'Antwort am großen Tag',
        palmares: 'Die Rangliste wartet',
        answers: 'Die Antworten ansehen',
      },
    },
    journal: {
      title: 'Protokoll des Events',
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
  },
  journal: {
    title: 'Protokoll des Events',
    intro:
      'Alle Mitglieder sehen dieses Protokoll. Es verrät nie, wer wen beschenkt.',
    allEditions: 'Alle Wichteln',
    edition: 'Wichteln',
    empty: 'Alles ruhig. Ein gutes Zeichen.',
  },
  invalid: { title: 'Hoppla, dieser Link funktioniert nicht mehr' },
  account: {
    title: 'Behalte deine Wichteln an einem Ort',
    body: 'Erstelle ein Konto mit deiner E-Mail-Adresse: Du findest dieses Wichteln und die nächsten, ohne den Link zu suchen.',
    bodyClaim:
      'Füge dieses Wichteln deinem Konto hinzu, um es auf deiner Startseite zu finden.',
    create: 'Mein Konto erstellen',
    claim: 'Zu meinem Konto hinzufügen',
    added: 'Wichteln zu deinem Konto hinzugefügt',
    sendTo: 'Meinen Link an {email} senden',
    sent: 'Link an {email} gesendet: Öffne ihn, um dein Konto zu erstellen. Schau auch im Spam-Ordner nach.',
  },
  answer: {
    card: {
      title: 'Wen beschenkst du?',
      body: 'Die Auslosung fand außerhalb der App statt. Sag hier, wen du beschenkst, um die Geschenkideen zu sehen. Schau kurz, ob dir niemand über die Schulter guckt.',
      action: 'Sagen, wen ich beschenke',
      hint: {
        one: 'Deine Antwort bleibt geheim, selbst für den Organisator.',
        other: 'Deine Antwort bleibt geheim, selbst für die Organisatoren.',
      },
      savedTitle: 'Ist notiert',
      savedBody: {
        one: 'Du siehst die Geschenkideen deiner Person, sobald alle geantwortet haben. Bisher {count} Antwort von {total}.',
        other:
          'Du siehst die Geschenkideen deiner Person, sobald alle geantwortet haben. Bisher {count} Antworten von {total}.',
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
      note: {
        one: 'Du kannst deine Antwort korrigieren, bis der Organisator die Auslosung bestätigt. Niemand sonst sieht sie.',
        other:
          'Du kannst deine Antwort korrigieren, bis die Organisatoren die Auslosung bestätigen. Niemand sonst sieht sie.',
      },
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
    surprise: 'Am großen Tag wartet eine Überraschung auf alle.',
    surpriseMore: 'Je mehr von euch spielen, desto schöner wird sie.',
    challenge: {
      one: 'Letztes Jahr hat {count} von {total} Personen den eigenen Wichtel erraten. Zu schlagen.',
      other:
        'Letztes Jahr haben {count} von {total} Personen ihren Wichtel erraten. Zu schlagen.',
    },
    challengeNeutral: {
      one: 'Letztes Jahr hat {count} von {total} Personen erraten, von wem das eigene Geschenk kam. Zu schlagen.',
      other:
        'Letztes Jahr haben {count} von {total} Personen erraten, von wem das eigene Geschenk kam. Zu schlagen.',
    },
    challengeNone:
      'Letztes Jahr hat niemand den eigenen Wichtel erraten. Zu schlagen.',
    challengeNoneNeutral:
      'Letztes Jahr hat niemand erraten, von wem das eigene Geschenk kam. Zu schlagen.',
    skip: 'Ich setze aus',
    skippedTitle: 'Du setzt aus',
    skippedBody:
      'Wir erinnern dich nicht an das Spiel. Die Überraschung siehst du am großen Tag trotzdem.',
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
      one: 'Noch einer, und du hast die Runde gemacht: Die Überraschung am großen Tag wird umso schöner.',
      other:
        'Noch {n}, und du hast die Runde gemacht: Die Überraschung am großen Tag wird umso schöner.',
    },
    progressDone:
      'Du hast die Runde gemacht: Die Überraschung am großen Tag wird umso schöner.',
    inviteTitle: 'Und du: Wer beschenkt dich?',
    inviteCount: {
      one: '{count} von {total} hat schon getippt. Antwort am großen Tag.',
      other: '{count} von {total} haben schon getippt. Antwort am großen Tag.',
    },
    inviteNone: 'Antwort am großen Tag.',
    makeGuess: 'Meinen Tipp abgeben',
    changeMind: 'Meine Meinung ändern',
    secret: 'Niemand sieht deinen Tipp vor dem großen Tag.',
    mySanta: 'Mein Wichtel',
    mySantaNeutral: 'Wer mich beschenkt',
    others: 'Die anderen',
    mine: 'Meine Tipps',
    choose: '+ Wählen',
    changeFor: 'Den Tipp für {name} ändern',
    me: 'Ich',
    you: 'dich',
    noGuess: 'Kein Tipp',
    count: {
      one: '{count} Tipp. Niemand sieht ihn vor dem großen Tag.',
      other: '{count} Tipps. Niemand sieht sie vor dem großen Tag.',
    },
    canChange: 'Du kannst deine Meinung ändern.',
    oneGift: 'Eine Person macht nur ein Geschenk.',
    movedFrom: 'Dein Tipp für {name}: Ihn zu wählen verschiebt ihn hierher',
    movedFromMe: 'Dein Tipp für dich: Ihn zu wählen verschiebt ihn hierher',
    clear: 'Diesen Tipp löschen',
    atParty: 'Antwort am großen Tag',
    atPartyBody: {
      one: 'Die Antworten kommen, wenn dein Organisator die Auslosung aufdeckt. Mit einer Überraschung.',
      other:
        'Die Antworten kommen, wenn deine Organisatoren die Auslosung aufdecken. Mit einer Überraschung.',
    },
    answersTitle: 'Devine qui: die Antworten',
    answersWaiting:
      'Die Auslosung ist aufgedeckt. Die Antworten warten auf dich.',
    answersSeen: 'Die Auslosung ist aufgedeckt. Das waren deine Tipps wert.',
    discover: 'Die Rangliste entdecken',
    rewatch: 'Die Rangliste noch einmal ansehen',
    palmaresHint: 'Dein Wichtel, der Detektiv, die am besten Versteckten…',
    palmaresHintNeutral:
      'Wer dich beschenkt, der Detektiv, die am besten Versteckten…',
    palmaresHintSmall: 'Dein Wichtel, endlich enttarnt',
    palmaresHintSmallNeutral: 'Wer dich beschenkt, endlich enttarnt',
    mineScore: {
      one: 'Meine Tipps · {right} richtig von {count}',
      other: 'Meine Tipps · {right} richtig von {count}',
    },
    mySantaWas: 'Dein Wichtel: {name}',
    mySantaWasNeutral: 'Wer dich beschenkt: {name}',
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
        bodyNeutral: 'Hat erraten, von wem das eigene Geschenk kam.',
        bodyMany: 'Sie haben ihren Wichtel erraten.',
        bodyManyNeutral: 'Sie haben erraten, von wem ihr Geschenk kam.',
        share: '{n} von {m}',
        crowdOf: 'Personen von {total}',
        shareBody: 'haben ihren Wichtel erraten.',
        shareBodyNeutral: 'haben erraten, von wem ihr Geschenk kam.',
        all: 'Die Wichtel konnten nichts verbergen.',
        allNeutral: 'Niemand konnte etwas verbergen.',
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
        neverNeutral: '{count}-mal genannt. Jedes Mal zu Unrecht.',
        body: '{count}-mal zu Unrecht als Wichtel genannt.',
        bodyNeutral: '{count}-mal zu Unrecht genannt.',
        bodyMany: 'Je {count}-mal zu Unrecht als Wichtel genannt.',
        bodyManyNeutral: 'Je {count}-mal zu Unrecht genannt.',
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
        worseNeutral:
          'Per Zufall hättet ihr {chance} gehabt. Alle waren gut versteckt.',
      },
      closeCall: {
        title: 'So knapp',
        big: 'Fast!',
        body: 'Du hattest den Wichtel von {name} gefunden… und dann umentschieden. Das Bauchgefühl hatte recht.',
        bodyNeutral:
          'Du hattest gefunden, wer {name} beschenkt… und dann umentschieden. Das Bauchgefühl hatte recht.',
        bodyMe:
          'Du hattest deinen Wichtel gefunden… und dann umentschieden. Das Bauchgefühl hatte recht.',
        bodyMeNeutral:
          'Du hattest gefunden, wer dich beschenkt… und dann umentschieden. Das Bauchgefühl hatte recht.',
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
      mySantaNeutral: 'Wer dich beschenkt',
      youSaid: 'Du hattest\n{name} gesagt…',
      noGuess: 'Und dein Wichtel war…',
      noGuessNeutral: 'Und dich beschenkt hat…',
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
      endEyebrowOnce: 'Das war es',
      endTitle: 'Frohe Weihnachten,\n{name}',
      endTitleAlone: 'Frohe Weihnachten!',
      endTitleNeutral: 'Danke fürs Mitspielen,\n{name}',
      endTitleAloneNeutral: 'Danke an alle!',
      allResults: 'Alle Ergebnisse ansehen',
      again: 'Von vorne ansehen',
      tapNext: 'Tippe, um weiterzumachen',
    },
  },
} satisfies Dict<typeof fr>;
