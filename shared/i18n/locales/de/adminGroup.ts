import type fr from '../fr/adminGroup';
import type { Dict } from '../../types';

export default {
  newGroup: {
    organizerLabel: 'Adresse des ersten Organisators',
    organizerHelp: 'Optional. Weitere kannst du in der Gruppe hinzufügen.',
    title: 'Neue Gruppe',
    nameLabel: 'Name der Gruppe',
    namePlaceholder: 'Familie Müller',
    nameRequired: 'Name erforderlich',
    submit: 'Gruppe erstellen',
    created: 'Gruppe erstellt',
  },
  organizers: {
    title: 'Organisatoren',
    summary: 'Wer diese Gruppe verwalten kann',
    intro:
      'Die Personen, die {name} verwalten. Jede meldet sich mit einem Link an, der an ihre Adresse gesendet wird: kein Passwort weiterzugeben.',
    superNote:
      'Ein Super-Admin kann die Gruppe ebenfalls verwalten, ohne hier zu stehen.',
    empty: 'Noch kein Organisator.',
    you: 'Das bist du',
    add: 'Organisator hinzufügen',
    addTitle: 'Neuer Organisator',
    addDescription:
      'Seine E-Mail-Adresse. Er muss nur mit dieser Adresse einen Anmeldelink anfordern.',
    remove: 'Entfernen',
    removeLabel: '{email} aus den Organisatoren entfernen',
  },
  dashboard: {
    deleteGroup: 'Gruppe löschen',
    deleteGroupHint: 'Mit ihren Personen, Ausgaben und Auslosungen',
    deleteTitle: '{name} löschen?',
    deleteDescription:
      'Das lässt sich nicht rückgängig machen: Personen, Ausschlüsse, Ausgaben, Auslosungen, Wunschlisten und Protokoll werden gelöscht.',
    deleteConfirmLabel: 'Gib die Gruppenkennung ein: {slug}',
    deleteAction: 'Endgültig löschen',
    deleteDone: 'Gruppe gelöscht',
    editionSection: 'Ausgabe',
    newEdition: 'Neue Ausgabe',
    newEditionHint: 'Übernimmt die Teilnehmer vom letzten Jahr',
    groupSection: 'Gruppe',
    superSection: 'Super-admin',
    pastEditions: 'Frühere Ausgaben',
  },
  people: {
    title: 'Personen',
    empty: 'Füge zuerst die Mitglieder der Gruppe hinzu.',
    hint: 'Tippe auf eine Person, um sie zu bearbeiten oder zu deaktivieren.',
    inactive: 'deaktiviert',
  },
  newPerson: {
    title: 'Neue Person',
    added: '{name} hinzugefügt',
  },
  person: {
    fallbackTitle: 'Person',
    notFound: 'Person nicht gefunden.',
    saved: 'Gespeichert',
    doesNotDraw: 'Zieht nicht',
    noExclusion: 'Kein Ausschluss',
    manageExclusions: 'Ausschlüsse verwalten',
    participation: 'Teilnahme',
    deactivateHelp:
      'Eine deaktivierte Person wird in künftige Ausgaben nicht übernommen. Ihr Verlauf bleibt erhalten.',
    deactivate: 'Deaktivieren',
    reactivate: 'Wieder aktivieren',
    deleteForever: 'Endgültig löschen',
    deleteHint: 'Nur, wenn sie noch nie teilgenommen hat',
    deleteConfirm: '{name} endgültig löschen?',
  },
  personForm: {
    changeAvatar: 'Avatar ändern',
    firstNameLabel: 'Vorname',
    firstNameRequired: 'Vorname erforderlich',
    lastNameLabel: 'Nachname',
    lastNameHelp:
      'Optional, dient nur dazu, zwei gleiche Vornamen zu unterscheiden.',
    emailLabel: 'E-Mail',
    emailHelp:
      'Optional. Damit wird der Link per E-Mail verschickt, und die Person kann sich anmelden, um ihre Auslosungen zu finden. Ohne Adresse teilst du den Link vom Handy aus.',
    emailInvalid: 'Ungültige E-Mail-Adresse',
    languageHelp:
      'Die Seite, die Nachrichten und die E-Mails dieser Person sind in dieser Sprache.',
  },
  avatar: {
    title: 'Avatar',
    description: 'Ein Weihnachts-Emoji und eine Farbe.',
    emoji: 'Emoji',
    color: 'Farbe',
    colors: {
      brick: 'Ziegelrot',
      pine: 'Tannengrün',
      mustard: 'Senfgelb',
      kraft: 'Kraftpapier',
      frost: 'Frost',
      plum: 'Pflaume',
    },
  },
  exclusions: {
    title: 'Ausschlüsse',
    summary: 'Paare, die sich nie gegenseitig ziehen',
    intro:
      'Personen, die sich nicht gegenseitig ziehen sollen: ein Paar, Geschwister, ein Elternteil und sein Kind …',
    empty: 'Kein Ausschluss.',
    reciprocal: 'Ziehen sich nicht, in beide Richtungen',
    reciprocalPast: 'Haben sich nicht gezogen, in beide Richtungen',
    oneWay: '{giver} zieht {receiver} nicht',
    oneWayPast: '{giver} hat {receiver} nicht gezogen',
    remove: 'Entfernen',
    removeLabel: 'Ausschluss zwischen {giver} und {receiver} entfernen',
    add: 'Ausschluss hinzufügen',
    sheetTitle: 'Neuer Ausschluss',
    sheetDescription:
      'Zwei Personen, die sich nicht ziehen sollen: ein Paar, Geschwister …',
    giverLabel: 'Wer',
    receiverLabel: 'Zieht nicht',
    choose: 'Auswählen …',
    bothWays: 'In beide Richtungen',
    submit: 'Ausschluss hinzufügen',
  },
  rules: {
    title: 'Regeln der Auslosung',
    shortTitle: 'Regeln',
    intro:
      'Standardwerte für jede Ausgabe; eine Ausgabe kann sie überschreiben.',
    saved: 'Regeln gespeichert',
    drawSection: 'Auslosung',
    resultSection: 'Wird mit dem Ergebnis angezeigt',
    wishlistSection: 'Wunschlisten',
    excludePreviousYears: 'Nicht wieder dieselbe Person ziehen',
    excludePreviousYearsHelp:
      'Niemand beschenkt jemanden, den er in den letzten Jahren schon hatte. Je länger der Zeitraum, desto eingeschränkter die Auslosung.',
    previousYears: {
      none: 'Nein, egal',
      lastYear: 'Nicht dieselbe Person wie letztes Jahr',
      lastYears: 'Nicht dieselbe wie in den letzten {count} Jahren',
    },
    budget: 'Budget (Freitext)',
    budgetPlaceholder: 'max. 20 €',
    eventDate: 'Datum der Feier',
    eventDatePick: 'Datum wählen',
    eventDateHelp: 'Das Abschließen wird erst nach diesem Datum angeboten.',
    eventDateSuggest: '{date} vorschlagen',
    eventDateClear: 'Datum löschen',
    guardianMessage: 'Ein paar Worte vom Organisator',
    messageNote: 'Zusatz zu den Nachrichten',
    messageNoteHelp:
      'Wird unverändert zu jeder Nachricht und E-Mail an die Teilnehmer hinzugefügt, über oder unter dem Standardtext. Du kannst ihn beim Senden noch ändern.',
    wishlist: 'Wunschlisten aktivieren',
    maxWishes: 'Maximale Anzahl Ideen pro Liste',
  },
} satisfies Dict<typeof fr>;
