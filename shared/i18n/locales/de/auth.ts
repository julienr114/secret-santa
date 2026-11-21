import type fr from '../fr/auth';
import type { Dict } from '../../types';

export default {
  login: {
    tooMany: 'Zu viele Anfragen auf einmal.',
    tooManyHelp:
      'Warte ein paar Minuten, bevor du es erneut versuchst. Wenn du schon einen Link angefordert hast, sieh in deinen E-Mails nach: Er gilt 15 Minuten.',
    emailLabel: 'E-Mail-Adresse',
    emailHelp:
      'Kein Passwort: Du erhältst einen Link, der 15 Minuten gültig ist.',
    emailInvalid: 'Diese Adresse sieht unvollständig aus',
    submit: 'Anmeldelink erhalten',
    sentTitle: 'Schau in dein Postfach',
    again: 'Andere Adresse verwenden',
    devLink: 'Entwicklungsmodus: Anmeldelink öffnen',
    tabLogin: 'Anmelden',
    tabSignup: 'Konto erstellen',
    signupSubmit: 'Mein Konto erstellen',
    sentTo:
      'Link an {email} gesendet. Er ist 15 Minuten gültig und funktioniert nur einmal.',
    spamHint: 'Nichts angekommen? Schau im Spam-Ordner nach.',
    sameDevice: 'Öffne den Link auf diesem Gerät: Es wird angemeldet.',
    submitMine: 'Meinen Link erhalten',
    sending: 'Link wird gesendet…',
    emailPlaceholder: 'du@beispiel.de',
  },
  landing: {
    tagline:
      'Wichteln in der Familie, unter Freunden oder unter Kollegen: Alle erfahren heimlich, wen sie beschenken.',
    personalLink:
      'Du hast einen persönlichen Link erhalten? Öffne ihn direkt: Er funktioniert ohne Konto.',
  },
  home: {
    party: {
      today: 'Fest heute',
      in: { one: 'Fest morgen', other: 'Fest in {count} Tagen' },
      on: 'Fest am {date}',
    },
    drawCard: {
      partyOn: 'Fest am {date}',
      partyOnIn: {
        one: 'Fest am {date}, morgen',
        other: 'Fest am {date}, in {count} Tagen',
      },
      partyToday: 'Fest heute',
    },
    past: {
      title: 'Vergangene Auslosungen',
      empty: 'Noch keine vergangene Auslosung.',
    },
    journalSignal: {
      lead: 'Neues im Protokoll.',
      row: 'Neues im Protokoll',
      link_regenerated: 'Dein Link wurde am {date} erneuert.',
      result_revealed:
        'Der Organisator hat am {date} in einen Umschlag geschaut.',
      results_revealed:
        'Die Ergebnisse wurden am {date} vor der Feier aufgedeckt.',
      draw_cancelled: 'Die Auslosung wurde am {date} aufgehoben.',
      several: '{count} Hinweise seit deinem letzten Besuch.',
    },
  },
  admin: {
    accountsTitle: 'Konten',
    accounts: { one: '{count} Konto', other: '{count} Konten' },
    disabled: 'Deaktiviert',
    neverLoggedIn: 'Nie angemeldet',
    quotaLabel: 'Wichteln, die es organisieren darf',
    disabledHelp: 'Es kann sich nicht mehr anmelden',
    groupsEmpty: 'Noch keine Gruppe.',
    search: 'Name oder Adresse suchen',
    noMatch: 'Kein Konto.',
    groupsCount: { one: '{count} Gruppe', other: '{count} Gruppen' },
    seenOn: 'gesehen am {date}',
    load: {
      near: 'Die App nähert sich ihrer kostenlosen Kapazität (etwa 50 Gruppen: 3.000 E-Mails im Monat bei Resend).',
      over: 'Eine weitere Gruppe überschreitet die kostenlose Kapazität (etwa 50 Gruppen: 3.000 E-Mails im Monat bei Resend). E-Mails könnten ausbleiben.',
    },
    quotaLess: 'Ein Wichteln weniger',
    quotaMore: 'Ein Wichteln mehr',
    disable: 'Konto deaktivieren',
    disableConfirm:
      'Es kann sich nicht mehr anmelden, seine Sitzungen werden geschlossen. Deaktivieren?',
    restore: 'Konto reaktivieren',
    restoreHelp: 'Es kann sich wieder anmelden',
    disabledDone: 'Konto deaktiviert',
    restored: 'Konto reaktiviert',
    access: 'Zugang',
    loadOk: '{count} von etwa {max} Gruppen, die die Gratisangebote abdecken.',
    title: 'Verwaltung',
    reserved: 'Nur für Super-Admins',
    capacity: 'Kapazität',
    capacityCount: {
      one: '{count} Gruppe von etwa {max}',
      other: '{count} Gruppen von etwa {max}',
    },
    capacityHint:
      'Darüber reichen die kostenlosen Angebote nicht mehr (3.000 E-Mails im Monat).',
    seeAll: 'Alles ansehen',
    groupsShort: 'Gruppen',
    disabledCount: { one: '{count} deaktiviert', other: '{count} deaktiviert' },
    activeDraws: {
      one: '{count} laufende Auslosung',
      other: '{count} laufende Auslosungen',
    },
    styleGuide: 'Styleguide',
    styleGuideHint: 'Werkzeug für Entwickler',
    lastVisit: 'Letzter Besuch am {date}',
    left: { one: 'noch {count} übrig', other: 'noch {count} übrig' },
    mayOrganise: {
      one: 'Darf {count} organisieren',
      other: 'Darf {count} organisieren',
    },
    inProgress: { one: '{count} läuft', other: '{count} laufen' },
    atLimit: 'am Limit für Wichteln',
    members: { one: '{count} Mitglied', other: '{count} Mitglieder' },
    draw: {
      preparing: 'in Vorbereitung',
      drawn: 'ausgelost',
      none: 'keine laufende Auslosung',
      viewed: {
        one: '{count} von {total} hat den Umschlag geöffnet',
        other: '{count} von {total} haben ihren Umschlag geöffnet',
      },
    },
    role: { organizer: 'Organisiert', participant: 'Nimmt teil' },
    profileOwn:
      'Das Profil (Vorname, Symbol, Sprache) gehört der Person: Es wird hier nicht geändert.',
    activeAccounts: {
      one: '{count} aktives Konto',
      other: '{count} aktive Konten',
    },
    noGroup: 'keine Gruppe',
    disabledRow: 'Deaktivierte Konten',
    searchGroups: 'Eine Gruppe oder einen Organisator suchen',
    noGroupMatch: 'Keine Gruppe.',
    noOrganizer: 'Noch kein Organisator',
    createFor: 'Eine Gruppe für jemanden erstellen',
    createForHint: 'Mit der Adresse des Organisators',
  },
  confirm: {
    title: 'Anmeldung',
    action: 'Anmelden',
    newLink: 'Neuen Link anfordern',
    question: 'Auf diesem Gerät anmelden?',
    bodyWith: 'Du bleibst 30 Tage als {email} angemeldet.',
    notYours: 'Nicht dein Gerät? Schließ einfach diese Seite.',
    connecting: 'Anmeldung läuft…',
    invalidTitle: 'Dieser Link funktioniert nicht mehr',
    invalidBody:
      'Ein Anmeldelink ist 15 Minuten gültig und funktioniert nur einmal. Fordere einen neuen an, das dauert zehn Sekunden.',
  },
  account: {
    profile: 'Mein Profil',
    languageHelp: 'Die Sprache deiner E-Mails.',
    title: 'Mein Konto',
    superAdmin: 'Super-Admin',
    devices: 'Meine Geräte',
    devicesHint: 'Eine Anmeldung gilt 30 Tage.',
    current: 'Dieses Gerät',
    unknownDevice: 'Unbekanntes Gerät',
    lastSeen: 'Zuletzt gesehen am {date}',
    revokeAll: 'Überall abmelden',
    revokeOne: '{device} abmelden',
    revoked: 'Gerät abgemeldet',
    revokeAllHint: 'Dieses Gerät eingeschlossen',
    revokeAllConfirm: 'Von allen Geräten abmelden?',
    firstNameHelp: 'Wird übernommen, wenn du eine Gruppe erstellst.',
    lastNameHelp:
      'Optional. Unterscheidet dich von einer Person gleichen Namens.',
    profileHint:
      'Dein Vorname und dein Symbol werden übernommen, wenn du einer Gruppe beitrittst oder eine erstellst. Die Sprache ist die deiner E-Mails.',
    language: 'Sprache',
    connectedOn: 'Angemeldet am {date}',
    revokeShort: 'Abmelden',
    logoutHere: 'Von diesem Gerät abmelden',
  },
  email: {
    subject: 'Dein Anmeldelink für Under the Tree',
    intro: 'Hier ist dein Anmeldelink für Under the Tree:',
    validity: 'Er ist 15 Minuten gültig und funktioniert nur einmal.',
    ignore:
      'Nichts angefordert? Ignoriere diese Nachricht: Ohne diesen Link kann sich niemand anmelden.',
  },
  invite: {
    intro: 'Du bist zur Feier eingeladen',
    party: 'am {date}',
    nameHelp: 'Der Vorname, den die anderen sehen.',
    loginFirst:
      'Melde dich mit deiner E-Mail-Adresse an, um beizutreten. Noch kein Konto? Es wird dabei erstellt.',
    joinGroup: 'Der Feier beitreten',
    signedAs: 'Angemeldet als {email}',
    notMe: 'Das bin nicht ich',
    organiserWord: {
      one: 'Das Wort des Organisators',
      other: 'Das Wort der Organisatoren',
    },
    welcome: 'Willkommen in {group}',
    inDraw: 'Du machst bei {label} mit.',
    notDrawnYet: {
      one: 'Die Auslosung steht noch aus: Dein Organisator meldet sich.',
      other: 'Die Auslosung steht noch aus: Deine Organisatoren melden sich.',
    },
    addLater: {
      one: 'Du gehörst zur Feier. Dein Organisator nimmt dich in die Auslosung von {label} auf.',
      other:
        'Du gehörst zur Feier. Deine Organisatoren nehmen dich in die Auslosung von {label} auf.',
    },
    drawnAlready:
      'Du gehörst zur Feier. Die Auslosung von {label} ist schon gemacht: Du bist bei der nächsten dabei.',
    nextDraw: {
      one: 'Du gehörst zur Feier. Dein Organisator meldet sich zur nächsten Auslosung.',
      other:
        'Du gehörst zur Feier. Deine Organisatoren melden sich zur nächsten Auslosung.',
    },
    meanwhile: 'In der Zwischenzeit',
    hints: 'Meine Geschenk-Hinweise hinterlassen',
    seeDraw: 'Meine Auslosung ansehen',
    goHome: 'Zu meiner Startseite',
    findIt:
      'Du findest sie auf deiner Startseite, wenn du dich mit {email} anmeldest.',
    joining: 'Beitritt läuft…',
    full: {
      title: 'Über diesen Link ist kein Platz mehr frei',
      body: {
        one: 'Sag dem Organisator von {group} Bescheid: Er kann Plätze freigeben oder dich selbst hinzufügen.',
        other:
          'Sag den Organisatoren von {group} Bescheid: Sie können Plätze freigeben oder dich selbst hinzufügen.',
      },
    },
    expired: {
      title: 'Dieser Einladungslink ist nicht mehr gültig',
      titleSince: 'Dieser Einladungslink ist seit dem {date} nicht mehr gültig',
      body: {
        one: 'Sag dem Organisator von {group} Bescheid: Er kann ihn verlängern oder dich selbst hinzufügen.',
        other:
          'Sag den Organisatoren von {group} Bescheid: Sie können ihn verlängern oder dich selbst hinzufügen.',
      },
    },
    invalid: {
      title: 'Dieser Einladungslink funktioniert nicht mehr',
      body: 'Bitte die Person, die ihn dir geschickt hat, um einen neuen Link.',
    },
  },
} satisfies Dict<typeof fr>;
