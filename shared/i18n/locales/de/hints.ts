import type fr from '../fr/hints';
import type { Dict } from '../../types';

export default {
  question: {
    both: 'Beides ist mir recht',
    progress: 'Frage {index} von {count}',
  },
  questions: {
    usefulOrSurprising: {
      title: 'Nützlich oder überraschend?',
      first: 'Nützlich',
      firstHelp: 'Etwas, das wirklich gebraucht wird.',
      second: 'Überraschend',
      secondHelp: 'Etwas, auf das ich nie gekommen wäre.',
    },
    objectOrMoment: {
      title: 'Ein Ding oder ein Erlebnis?',
      first: 'Ein Ding',
      firstHelp: 'Etwas Greifbares zum Auspacken.',
      second: 'Ein Erlebnis',
      secondHelp: 'Ein Ausflug, ein Essen, ein Workshop.',
    },
    keepOrConsume: {
      title: 'Zum Behalten oder zum Verbrauchen?',
      first: 'Zum Behalten',
      firstHelp: 'Etwas, das bleibt.',
      second: 'Zum Verbrauchen',
      secondHelp: 'Zum Essen, zum Trinken, zum Aufbrauchen.',
    },
    selfOrShared: {
      title: 'Für mich oder zum Teilen?',
      first: 'Für mich',
      firstHelp: 'Eine Freude nur für mich.',
      second: 'Zum Teilen',
      secondHelp: 'Ein Spiel, ein Essen, etwas für mehrere.',
    },
    secondHand: {
      title: 'Neu oder gebraucht?',
      first: 'Gebraucht oder selbst gemacht',
      firstHelp: 'Secondhand oder etwas Selbstgemachtes: Das mag ich.',
      second: 'Neu',
      secondHelp: 'Etwas Neues, originalverpackt.',
    },
    surprise: {
      title: 'Überrasch mich, oder lieber wissen?',
      first: 'Überrasch mich',
      firstHelp: 'Ich lasse mich am großen Tag überraschen.',
      second: 'Lieber wissen',
      secondHelp: 'Weiter unten gebe ich eine genaue Idee an.',
    },
  },
  // The answers on the participant's own page, ending the sentence of
  // `me.title`, in lower case.
  tags: {
    usefulOrSurprising: {
      first: 'ein nützliches Geschenk',
      second: 'ein überraschendes Geschenk',
      both: 'nützlich oder überraschend, egal',
    },
    objectOrMoment: {
      first: 'ein Ding',
      second: 'ein Erlebnis',
      both: 'ein Ding oder ein Erlebnis',
    },
    keepOrConsume: {
      first: 'etwas zum Behalten',
      second: 'etwas zum Verbrauchen',
      both: 'behalten oder verbrauchen',
    },
    selfOrShared: {
      first: 'ein Geschenk für mich',
      second: 'ein Geschenk zum Teilen',
      both: 'für mich oder zum Teilen',
    },
    secondHand: {
      first: 'Gebrauchtes oder Selbstgemachtes',
      second: 'Neues',
      both: 'neu oder gebraucht',
    },
    surprise: {
      first: 'die Überraschung',
      second: 'es vorher zu wissen',
      both: 'Überraschung oder nicht',
    },
  },
  giver: {
    prefers: '{name} mag lieber:',
    choices: {
      usefulOrSurprising: {
        first: 'ein nützliches Geschenk statt eines überraschenden',
        second: 'ein überraschendes Geschenk statt eines nützlichen',
      },
      objectOrMoment: {
        first: 'ein Ding statt eines Erlebnisses',
        second: 'ein Erlebnis statt eines Dings',
      },
      keepOrConsume: {
        first: 'etwas zum Behalten statt zum Verbrauchen',
        second: 'etwas zum Verbrauchen statt zum Behalten',
      },
      selfOrShared: {
        first: 'ein Geschenk nur für sich statt zum Teilen',
        second: 'ein Geschenk zum Teilen statt nur für sich',
      },
    },
    secondHand: {
      first: 'Gebraucht oder selbst gemacht, gern.',
      second: 'Lieber neu als gebraucht.',
    },
    surprise: {
      first: '{name} mag Überraschungen.',
      second: '{name} weiß lieber, was es gibt.',
    },
    // The subject of « {subject} : peu importe. ».
    subjects: {
      usefulOrSurprising: 'Nützlich oder überraschend',
      objectOrMoment: 'Ding oder Erlebnis',
      keepOrConsume: 'Behalten oder verbrauchen',
      selfOrShared: 'Für sich oder zum Teilen',
      secondHand: 'Neu oder gebraucht',
      surprise: 'Überraschung oder nicht',
    },
    indifferent: '{subject}: egal.',
  },
  texts: {
    lately: {
      title: 'Gerade',
      empty: 'Sagen, was mich beschäftigt',
      help: 'Was dich gerade beschäftigt oder reizt. Keine genauen Dinge nötig.',
      placeholder: 'Ein neues Hobby, ein Buch, ein Projekt…',
      giver: 'Gerade',
    },
    wouldHelp: {
      title: 'Was mir helfen würde',
      empty: 'Sagen, was mir helfen würde',
      help: 'Was dir im Alltag nützlich wäre.',
      placeholder: 'Was du täglich benutzt, was dir fehlt…',
      giver: 'Was helfen würde',
    },
    avoid: {
      title: 'Lieber nicht, oder schon da',
      empty: 'Sagen, was ich meide',
      help: 'Was man dir besser nicht schenkt.',
      placeholder: 'Eine Allergie, wovon du zu viel hast…',
      giver: 'Lieber nicht',
    },
  },
  ideas: {
    giver: 'Falls nichts einfällt',
  },
  list: {
    title: 'Meine Geschenkliste',
  },
  result: {
    listOf: 'Die Wunschliste von {name}',
    newIdeas: {
      one: '{count} neue Idee seit deinem letzten Besuch',
      other: '{count} neue Ideen seit deinem letzten Besuch',
    },
    nothing: '{name} hat noch nichts geschrieben.',
    listHelp: 'Der anonyme Modus ist dort für dich aktiviert.',
    title: 'Damit du besser wählst',
    ask: 'Um Ideen bitten',
    sentEmailNamed: '{name} hat gerade eine E-Mail bekommen.',
    sentPageNamed: '{name} sieht es beim Öffnen des eigenen Links.',
    askHint: 'Ohne zu verraten, dass es von dir kommt.',
    sent: 'Anfrage gesendet.',
    sentEmail:
      '{name} hat gerade eine E-Mail bekommen, ohne zu wissen, dass sie von dir kommt.',
    sentPage:
      '{name} sieht es beim Öffnen des eigenen Links, ohne zu wissen, dass es von dir kommt.',
    willEmail: 'Du bekommst eine E-Mail, sobald Ideen da sind.',
    willSee:
      'Schau wieder hier vorbei: Die Ideen erscheinen, sobald sie da sind.',
  },
  request: {
    title: '{name} um Ideen bitten?',
    bodyEmail:
      '{name} bekommt eine E-Mail mit der Bitte, Vorlieben zu notieren und was man besser meidet.',
    bodyPage:
      '{name} sieht es auf der eigenen Ideen-Seite, mit der Bitte, Vorlieben zu notieren und was man besser meidet.',
    named: 'Dein Name wird genannt',
    namedHelp:
      'Die Auslosung ist aufgedeckt: {name} weiß, dass die Anfrage von dir kommt.',
    anonymous: 'Dein Name erscheint nirgends',
    anonymousHelp: {
      one: 'Weder in der E-Mail noch im Protokoll noch für den Organisator.',
      other:
        'Weder in der E-Mail noch im Protokoll noch für die Organisatoren.',
    },
    once: 'Eine einzige Anfrage pro Wichteln',
    onceHelp: 'Keine Erinnerung möglich: wir bedrängen niemanden.',
    send: 'Anfrage senden',
    sending: 'Anfrage wird gesendet…',
    cancel: 'Nicht jetzt',
  },
  state: {
    hintsLeft: {
      one: '{count} von {total} hat die Liste geschrieben',
      other: '{count} von {total} haben ihre Liste geschrieben',
    },
    left: 'Hat die Liste geschrieben',
  },
  email: {
    request: {
      subject: 'Wichteln {group}: Jemand sucht eine Geschenkidee für dich',
      greeting: 'Hallo {name},',
      body: 'Die Person, die dich zu {edition} ({group}) beschenkt, weiß nicht, was sie wählen soll. Hilf ihr: Schreib deine Wunschliste, oder ein paar Worte darüber, was du magst.',
      bodyPortrait:
        'Die Person, die dich zu {edition} ({group}) beschenkt, weiß nicht, was sie wählen soll. Hilf ihr: Schreib deine Wunschliste, oder ein paar Worte darüber, was du magst.',
      subjectFrom: 'Wichteln {group}: {from} sucht eine Geschenkidee für dich',
      bodyFrom:
        '{from} beschenkt dich zu {edition} ({group}) und weiß nicht, was es sein soll. Kleine Hilfe? Schreib deine Wunschliste, oder ein paar Worte darüber, was du magst.',
      bodyPortraitFrom:
        '{from} beschenkt dich zu {edition} ({group}) und weiß nicht, was es sein soll. Kleine Hilfe? Schreib deine Wunschliste, oder ein paar Worte darüber, was du magst.',
      cta: 'Meine Liste schreiben:',
      anonymous: 'Wir verraten dir nicht, wer fragt: Es ist Wichteln.',
      once: 'Du bekommst diese Nachricht nur einmal.',
    },
  },
} satisfies Dict<typeof fr>;
