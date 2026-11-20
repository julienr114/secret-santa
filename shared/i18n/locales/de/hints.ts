import type fr from '../fr/hints';
import type { Dict } from '../../types';

export default {
  title: 'Meine Geschenk-Hinweise',
  intro:
    'Greif der Person unter die Arme, die dich beschenkt. Alles ist freiwillig.',
  whoSees:
    'Nur die Person, die dich beschenkt, sieht sie, sobald ausgelost ist.',
  requested: {
    title: 'Die Person, die dich beschenkt, sucht nach Inspiration.',
    body: 'Sechs Auswahlfragen reichen, dreißig Sekunden.',
    bodyPortrait: 'Fünf Auswahlfragen reichen, dreißig Sekunden.',
  },
  readOnly: 'Deine Hinweise stehen fest: für dieses Jahr ist Schluss.',
  until: 'Du kannst sie bis zur Feier ändern.',
  start: {
    label: 'Zum Anfang',
    title: 'Sechs Fragen, dreißig Sekunden',
    titlePortrait: 'Fünf Fragen, dreißig Sekunden',
    examples: 'Nützlich oder überraschend? Ein Ding oder ein Erlebnis?',
    body: 'Ein Tipp pro Antwort, nichts zu schreiben.',
    action: 'Loslegen',
  },
  copy: {
    action: 'Meine Hinweise von {edition} übernehmen',
    hint: 'Du kannst sie danach anpassen',
    done: 'Hinweise von {edition} übernommen',
  },
  me: {
    title: 'Bei Geschenken mag ich lieber…',
    context: 'Ich und Geschenke',
  },
  question: {
    context: 'Frage {index} von {count}',
    clear: 'Meine Antwort löschen',
    later: 'Später',
    both: 'Beides ist mir recht',
    footer: 'Ein Tipp, und weiter geht’s. Du kannst es dir anders überlegen.',
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
      firstHelp: 'Ich lasse mich am Tag der Feier überraschen.',
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
    title: 'Eine genaue Idee, für alle Fälle',
    giver: 'Falls nichts einfällt',
    add: 'Idee hinzufügen',
    addHint: 'Ein Ding, gern mit Link',
    left: {
      one: 'Noch {count} möglich',
      other: 'Noch {count} möglich',
    },
    why: 'Eine genaue Idee schadet nicht: Viele schenken lieber auf Nummer sicher.',
  },
  list: {
    title: 'Meine Geschenkliste',
    help: 'Die Person, die dir etwas schenkt, sieht einen Link dorthin. Was sie dort abhakt, ist anonym: Niemand erfährt, dass sie es ist, auch du nicht.',
    add: 'Eine Geschenkliste verknüpfen',
    addHint: 'Die Person, die dir etwas schenkt, sieht einen Link dorthin',
    change: 'Ändern',
    mine: 'Deine Liste, veröffentlicht',
    figuring: 'Eine Liste, auf der du stehst, veröffentlicht',
    published: 'Veröffentlicht',
    unshared:
      'Sie ist nicht mehr veröffentlicht: Der Link wird nicht mehr angezeigt.',
    login: 'Melde dich an, um eine deiner Geschenklisten zu verknüpfen.',
    loginAction: 'Anmelden',
    sheetTitle: 'Welche Liste?',
    sheetHelp:
      'Die Listen, die du führst, und die, auf denen du stehst. Nur eine veröffentlichte Liste kann verknüpft werden.',
    rowMine: 'Deine Liste · veröffentlicht',
    rowFiguring: 'Die Liste von {name} · du stehst darauf',
    rowDraft: 'Entwurf: Veröffentliche sie zuerst',
    none: 'Keine Liste',
    validate: 'Bestätigen',
    untitled: 'Liste ohne Namen',
    done: 'Liste mit deinen Hinweisen verknüpft',
    removed: 'Keine Liste mehr mit deinen Hinweisen verknüpft',
  },
  result: {
    list: 'Ihre Geschenkliste: {title}',
    listHelp: 'Der anonyme Modus ist dort für dich aktiviert.',
    title: 'Damit du besser wählst',
    isNew: 'Neu',
    updatedOn: 'Hinweise aktualisiert am {date}',
    none: '{name} hat noch keine Hinweise hinterlassen.',
    ask: 'Um Hinweise bitten',
    sentEmailNamed: '{name} hat gerade eine E-Mail bekommen.',
    sentPageNamed: '{name} sieht es auf der eigenen Hinweis-Seite.',
    askHint: 'Ohne zu verraten, dass es von dir kommt.',
    sent: 'Anfrage gesendet.',
    sentEmail:
      '{name} hat gerade eine E-Mail bekommen, ohne zu wissen, dass sie von dir kommt.',
    sentPage:
      '{name} sieht es auf der eigenen Hinweis-Seite, ohne zu wissen, dass es von dir kommt.',
    willEmail: 'Du bekommst eine E-Mail, sobald Hinweise da sind.',
    willSee:
      'Schau wieder hier vorbei: Die Hinweise erscheinen, sobald sie da sind.',
  },
  request: {
    title: '{name} um Hinweise bitten?',
    bodyEmail:
      '{name} bekommt eine E-Mail mit der Bitte, Vorlieben zu notieren und was man besser meidet.',
    bodyPage:
      '{name} sieht es auf der eigenen Hinweis-Seite, mit der Bitte, Vorlieben zu notieren und was man besser meidet.',
    named: 'Dein Name wird genannt',
    namedHelp:
      'Die Auslosung ist aufgedeckt: {name} weiß, dass die Anfrage von dir kommt.',
    anonymous: 'Dein Name erscheint nirgends',
    anonymousHelp: {
      one: 'Weder in der E-Mail noch im Protokoll noch für den Organisator.',
      other:
        'Weder in der E-Mail noch im Protokoll noch für die Organisatoren.',
    },
    once: 'Eine einzige Anfrage pro Auslosung',
    onceHelp: 'Keine Erinnerung möglich: wir bedrängen niemanden.',
    send: 'Anfrage senden',
    sending: 'Anfrage wird gesendet…',
    cancel: 'Nicht jetzt',
  },
  state: {
    hintsLeft: {
      one: '{count} von {total} hat Hinweise hinterlassen',
      other: '{count} von {total} haben Hinweise hinterlassen',
    },
    none: 'Noch nichts',
    filledEditable: 'Ausgefüllt · änderbar bis zur Feier',
    filledLocked: 'Ausgefüllt · nicht mehr änderbar',
    left: 'Hat Hinweise hinterlassen',
  },
  setting: {
    title: 'Geschenk-Hinweise',
    help: 'Was jeder notieren kann, um der Person zu helfen, die ihn beschenkt.',
    full: 'Porträt und genaue Ideen',
    fullHelp: 'Die sechs Fragen, aktuelle Interessen und Geschenkideen',
    portrait: 'Nur Porträt',
    portraitHelp: 'Ohne Geschenkidee: Die Überraschung bleibt ganz',
    none: 'Keine Hinweise',
    noneHelp: 'Jeder kommt allein zurecht',
  },
  email: {
    request: {
      subject: 'Wichteln {group}: Jemand sucht eine Geschenkidee für dich',
      greeting: 'Hallo {name},',
      body: 'Die Person, die dich zu {edition} ({group}) beschenkt, weiß nicht, was sie wählen soll. Hilf ihr: sechs Auswahlfragen, dreißig Sekunden, und ein paar Worte, wenn du magst.',
      bodyPortrait:
        'Die Person, die dich zu {edition} ({group}) beschenkt, weiß nicht, was sie wählen soll. Hilf ihr: fünf Auswahlfragen, dreißig Sekunden, und ein paar Worte, wenn du magst.',
      subjectFrom: 'Wichteln {group}: {from} sucht eine Geschenkidee für dich',
      bodyFrom:
        '{from} beschenkt dich zu {edition} ({group}) und weiß nicht, was es sein soll. Kleine Hilfe? Sechs Auswahlfragen, dreißig Sekunden, und ein paar Worte, wenn du magst.',
      bodyPortraitFrom:
        '{from} beschenkt dich zu {edition} ({group}) und weiß nicht, was es sein soll. Kleine Hilfe? Fünf Auswahlfragen, dreißig Sekunden, und ein paar Worte, wenn du magst.',
      cta: 'Ein paar Hinweise geben:',
      anonymous: 'Wir verraten dir nicht, wer fragt: Es ist Wichteln.',
      once: 'Du bekommst diese Nachricht nur einmal.',
    },
    arrived: {
      subject: 'Wichteln {group}: Geschenkhinweise warten auf dich',
      greeting: 'Hallo {name},',
      body: 'Die Person, die du zu {edition} ({group}) beschenkst, hat Hinweise hinterlassen. Öffne deinen Link, um sie zu lesen:',
    },
  },
} satisfies Dict<typeof fr>;
