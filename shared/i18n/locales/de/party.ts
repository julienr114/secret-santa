import type fr from '../fr/party';
import type { Dict } from '../../types';

export default {
  category: {
    christmas: 'Weihnachten',
    birthday: 'Geburtstag',
    birth: 'Geburt',
    wedding: 'Hochzeit',
    housewarming: 'Einweihung',
    other: 'Anderes',
  },
  everyYear: 'jedes Jahr',
  inDays: { one: 'in {count} Tag', other: 'in {count} Tagen' },
  today: 'heute',
  // A birthday made for one of my people (ticket 118): their age.
  age: {
    theirs: { one: 'wird {count}', other: 'wird {count}' },
    mine: { one: 'du wirst {count}', other: 'du wirst {count}' },
    pastTheirs: { one: 'Wurde {count}', other: 'Wurde {count}' },
    pastMine: { one: 'Du wurdest {count}', other: 'Du wurdest {count}' },
  },
  members: { one: '{count} Mitglied', other: '{count} Mitglieder' },
  settings: 'Einstellungen des Events',
  secretSantaTitle: { one: 'Das Wichteln', other: 'Die Wichteln' },
  full: {
    count: '{count} von {max}',
    title: 'Das Event ist voll',
    text: '{max} Mitglieder sind das Maximum',
    paused: 'Pausiert · das Event ist voll',
  },
  secretSanta: {
    row: 'Das Wichteln {year}',
    another: 'Noch ein Wichteln',
    organise: 'Ein Secret Santa erstellen',
    context: 'Wichteln {year}',
    settings: 'Einstellungen',
    drawSection: 'Die Auslosung',
    guessRow: 'Tipps',
    messagesSection: 'Die Nachrichten',
    joined: 'Jemand meldet sich über den Link an',
    allViewed: 'Alle haben ihr Los entdeckt',
    whichParty: 'Das Event des Wichtelns',
    otherOccasion: 'Ein anderer Anlass',
    already: 'dieses Jahr schon ein Wichteln',
    paused: {
      title: 'Neue Wichteln sind pausiert',
      text: 'Die bestehenden laufen weiter. Schau in ein paar Tagen wieder vorbei.',
    },
    limit: {
      title: 'Du organisierst schon {count} Wichteln',
      text: 'Mehr geht mit einem Konto nicht.',
      drawn: 'ausgelost',
      preparing: 'noch nicht ausgelost',
    },
  },
  lists: {
    title: 'Die Listen',
    titleSomeone: 'Die Liste',
    none: 'Noch niemand hat eine Liste in dieses Event gestellt.',
    new: 'Eine Geschenkliste erstellen',
    resume: 'Meine Liste vom letzten Jahr übernehmen',
  },
  // The years over (ticket 108, V3FetesPassees, V3FeteAnneePassee).
  past: {
    years: 'Vergangene Jahre',
    empty: 'Noch kein vergangenes Event.',
    gaveTo: 'Du hast {name} beschenkt',
    gaveToTwo: 'Du hast {name} und {other} beschenkt',
    offered: {
      one: 'Du hast {count} Geschenk verschenkt',
      other: 'Du hast {count} Geschenke verschenkt',
    },
    received: {
      one: '{count} Geschenk verschenkt',
      other: '{count} Geschenke verschenkt',
    },
    receivedFor: {
      one: '{count} Geschenk an {name} verschenkt',
      other: '{count} Geschenke an {name} verschenkt',
    },
    game: 'Devine qui',
    palmares: 'Die Rangliste',
  },
  leave: {
    row: 'Dieses Event verlassen',
    title: '„{name}“ verlassen?',
    listsElsewhere: {
      one: 'Deine Liste verlässt dieses Event. Sie bleibt in deinen anderen Events.',
      other:
        'Deine Listen verlassen dieses Event. Sie bleiben in deinen anderen Events.',
    },
    listsAlone: {
      one: 'Deine Liste verlässt dieses Event. Nur du siehst sie, bis du sie woanders teilst.',
      other:
        'Deine Listen verlassen dieses Event. Nur du siehst sie, bis du sie woanders teilst.',
    },
    ticks: 'Die Geschenke, die du abgehakt hast, bleiben geplant.',
    secretSanta: 'Beim nächsten Wichteln bist du nicht mehr dabei.',
    confirm: 'Event verlassen',
    stay: 'Bleiben',
    done: 'Du hast „{name}“ verlassen',
  },
  create: {
    title: 'Zu welchem Anlass?',
    forWhom: 'Für wen?',
    me: 'Ich',
    someoneElse: 'Jemand anderes',
    name: 'Name',
    date: 'Datum',
    recurring: 'Jedes Jahr wieder',
    continue: 'Weiter',
    birthdayOf: 'Der Geburtstag von {name}',
    myBirthday: 'Mein Geburtstag',
  },
  // « Qui reprendre ? » (V3FeteMembresReprendre, ticket 117): for a Secret
  // Santa or a list, never for the event alone.
  take: {
    row: 'Aus einem anderen Event übernehmen',
    rowHint: 'Du hakst an, wen',
    title: 'Wen übernehmen?',
    from: 'Personen aus',
    noEmail: 'Keine E-Mail-Adresse',
    choose: '{name} übernehmen',
    submit: {
      one: 'Hinzufügen · {count} Person',
      other: 'Hinzufügen · {count} Personen',
    },
    done: {
      one: '{count} Person hinzugefügt',
      other: '{count} Personen hinzugefügt',
    },
    none: 'Niemand Neues hinzuzufügen',
  },
  reglages: {
    party: 'Das Event',
    category: 'Kategorie',
    forWhom: 'Für',
    nobody: 'Niemand',
    date: 'Datum',
    dateValue: 'Am {date} · jedes Jahr vorgeschlagen',
    dateValueOnce: 'Am {date}',
    recurring: 'Jedes Jahr wieder',
    secretSanta: 'Wichteln',
    secretSantaRow: 'Einstellungen des Wichtelns {year}',
  },
} satisfies Dict<typeof fr>;
