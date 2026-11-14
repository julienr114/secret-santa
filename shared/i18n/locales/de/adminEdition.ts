import type fr from '../fr/adminEdition';
import type { Dict } from '../../types';

export default {
  general: {
    editionFallback: 'Ausgabe',
    tickToConfirm: 'Zum Bestätigen ankreuzen',
  },
  newEdition: {
    title: 'Neue Ausgabe',
    intro:
      'Die noch aktiven Teilnehmer der letzten Ausgabe werden übernommen; die Liste kannst du danach anpassen.',
    nameRequired: 'Name erforderlich',
    nameLabel: 'Name der Ausgabe',
    yearLabel: 'Jahr',
    submit: 'Ausgabe erstellen',
  },
  cockpit: {
    closeLater: 'Du kannst nach dem Fest abschließen ({date}).',
    messageLanguage: 'Sprache der Nachrichten: {language}',
    budget: 'Budget {budget}',
    eventDate: 'am {date}',
    draftIntro:
      'Prüfe die Teilnehmerliste und öffne dann die Einladungen, um die Links teilen zu können.',
    openInvitations: 'Einladungen öffnen',
    drawPossible: 'Die Auslosung ist möglich',
    drawPossibleDescription: {
      one: '{count} Teilnehmer, alle Regeln sind erfüllt.',
      other: '{count} Teilnehmer, alle Regeln sind erfüllt.',
    },
    blocked: 'Niemand kann zugelost werden für: {names}.',
    constrained: 'Sehr wenig Auswahl für: {names}.',
    startDraw: 'Auslosung starten',
    missing: {
      one: '{names} nimmt noch nicht teil',
      other: '{names} nehmen noch nicht teil',
    },
    missingWarning: 'Achtung: {text}.',
    drawIsFinal:
      'Die Auslosung ist endgültig: Die Liste wird gesperrt. Los geht’s?',
    drawNow: 'Jetzt auslosen',
    notYet: 'Noch nicht',
    drawDone: 'Auslosung durchgeführt',
    drawDoneToast: 'Teile jetzt die Nachricht „{message}“ mit allen.',
    drawnDescription:
      '{viewed}/{total} haben ihr Ergebnis angesehen. Niemand, auch der Organisator nicht, sieht die Ergebnisse hier.',
    closeAfterParty: 'Nach dem Fest abschließen',
    closeExplanation:
      'Nach dem Abschließen lässt sich die Ausgabe nicht mehr ändern; sie dient nächstes Jahr als Verlauf.',
    close: 'Abschließen',
    closedNotice: 'Ausgabe abgeschlossen, nur lesbar.',
    messageTitle: 'Nachricht zum Teilen',
    email: {
      bulkTitle: 'An mehrere senden',
      bulkHint: 'Per E-Mail, alle auf einmal',
      noAddress:
        'Versand per E-Mail: Kein Teilnehmer hat eine Adresse. Trage sie unter Personen ein.',
      select: 'Per E-Mail an mehrere Personen senden',
      selected: { one: '{count} ausgewählt', other: '{count} ausgewählt' },
      selectAll: 'Alle auswählen',
      selectNone: 'Alle abwählen',
      selectPerson: '{name} auswählen',
      chooseMessage: 'Nachricht wählen',
      sheetTitle: {
        one: 'E-Mail an {count} Person senden',
        other: 'E-Mail an {count} Personen senden',
      },
      sendCount: {
        one: '{count} E-Mail senden',
        other: '{count} E-Mails senden',
      },
      spamTip:
        'E-Mails landen oft im Spam: Hake per Telefon bei denen nach, die ihren Link nicht öffnen.',
      sent: {
        one: '{count} E-Mail gesendet',
        other: '{count} E-Mails gesendet',
      },
      left: 'Noch {count} zu senden: Starte den Versand erneut.',
    },
    empty: 'Noch niemand.',
    sendLinkOf: 'Link von {name} senden',
    resendLinkOf: 'Link von {name} erneut senden',
    addParticipants: 'Teilnehmer hinzufügen',
    cancelAndRedraw: 'Auslosung aufheben und wiederholen',
    cancelAndRedrawHint: 'Absage, jemand vergessen… wird protokolliert',
    revealOne: 'Ein Ergebnis ansehen',
    revealOneHint:
      'Letzter Ausweg, eine Person nach der anderen, steht im Protokoll',
    resultsTitle: {
      one: 'Die Auslosung · {count} Teilnehmer',
      other: 'Die Auslosung · {count} Teilnehmer',
    },
    exclusionsAppliedTitle: 'Bei der Auslosung angewandte Ausschlüsse',
    exclusionsTitle: 'Ausschlüsse',
    pendingExclusions: {
      one: '+ {count} Ausschluss aus einer noch nicht abgeschlossenen Auslosung, bleibt geheim.',
      other:
        '+ {count} Ausschlüsse aus einer noch nicht abgeschlossenen Auslosung, bleiben geheim.',
    },
    previousDrawReason: 'Frühere Auslosung: {edition}',
    previousDrawsFooter:
      'Niemand bekommt wieder dieselbe Person. Das × hebt einen Ausschluss nur für diese Ausgabe auf.',
    waive: 'Aufheben',
    waiveLabel: 'Ausschluss {giver} → {receiver} für diese Ausgabe aufheben',
    waived: {
      one: '{count} Ausschluss aus den Vorjahren für diese Ausgabe aufgehoben.',
      other:
        '{count} Ausschlüsse aus den Vorjahren für diese Ausgabe aufgehoben.',
    },
    restoreAll: 'Alle wiederherstellen',
  },
  participant: {
    fallbackTitle: 'Teilnehmer',
    notFound: 'Teilnehmer nicht gefunden.',
    waiting: 'ausstehend',
    notViewed: 'Hat das Ergebnis noch nicht angesehen',
    viewed: {
      one: 'Hat das Ergebnis einmal angesehen',
      other: 'Hat das Ergebnis {count}-mal angesehen',
    },
    viewedWithLast: {
      one: 'Hat das Ergebnis einmal angesehen · zuletzt {date}',
      other: 'Hat das Ergebnis {count}-mal angesehen · zuletzt {date}',
    },
    linkCopied: 'Link kopiert',
    linkRegenerated: 'Neuer Link erstellt, der alte funktioniert nicht mehr',
    linkRegeneratedDescription: 'Denk daran, ihn erneut zu teilen.',
    messageTitle: 'Nachricht',
    shareMessage: 'Nachricht teilen',
    shareMessageHint: 'WhatsApp, SMS… über das Handy',
    copyMessage: 'Nachricht kopieren',
    copyLink: 'Nur den Link kopieren',
    unsend: 'Doch nicht gesendet?',
    unsendHint: 'Entfernt die Markierung „{badge}“',
    unsendDone: 'Markierung entfernt',
    troubleshooting: 'Hilfe bei Problemen',
    troubleshootingFooter:
      'Keine dieser Aktionen verrät das Ergebnis. Alle werden im Protokoll der Gruppe festgehalten.',
    regenerate: 'Link neu erzeugen',
    regenerateHint: 'Link versehentlich weitergeleitet',
    regenerateConfirm:
      'Der alte Link von {name} funktioniert dann nicht mehr. Fortfahren?',
    regenerateAction: 'Neu erzeugen',
    remove: 'Aus der Ausgabe entfernen',
    removeConfirm: '{name} aus dieser Ausgabe entfernen?',
    removeAction: 'Entfernen',
  },
  addParticipants: {
    title: 'Teilnehmer hinzufügen',
    crumb: 'Hinzufügen',
    added: '{name} nimmt teil',
    everyoneIn:
      'Alle nehmen bereits teil. Jemand Neues legst du zuerst unter {people} an.',
    peopleLink: 'Personen',
    footer: 'Deaktivierte Personen erscheinen hier nicht.',
  },
  cancelDraw: {
    title: 'Auslosung aufheben',
    reasonRequired: 'Erkläre es in ein paar Worten',
    done: 'Auslosung aufgehoben',
    doneDescription: 'Passe die Liste an und starte die Auslosung erneut.',
    effectResults:
      'Alle Ergebnisse werden gelöscht, die Liste lässt sich wieder ändern.',
    effectLinks: 'Die Links und Codes bleiben gültig.',
    effectJournal:
      'Der Grund steht im Protokoll und ist für die ganze Gruppe sichtbar.',
    effectMessage:
      'Schicke nach der neuen Auslosung allen die Nachricht „{message}“.',
    reasonLabel: 'Grund',
    reasonPlaceholder: 'Tom hat abgesagt',
    understood: 'Ich verstehe, dass die aktuellen Ergebnisse verloren gehen',
    submit: 'Auslosung aufheben',
  },
  reveal: {
    title: 'Ein Ergebnis ansehen',
    personRequired: 'Wähle eine Person',
    passwordRequired: 'Passwort erforderlich',
    sentenceRequired: 'Tippe „{sentence}“ ab',
    shownNotice:
      'Dein Einblick steht im Protokoll der Gruppe. Das Ergebnis verschwindet, sobald du diesen Bildschirm verlässt.',
    another: 'Ein weiteres Ergebnis ansehen',
    warningLastResort:
      'Nur als letzter Ausweg (Unstimmigkeit, Verdacht auf einen Fehler…). Du siehst immer nur ein Ergebnis.',
    warningJournal:
      'Im Protokoll der Gruppe steht dann für alle Teilnehmer: „Der Organisator hat das Ergebnis von Léa eingesehen“, mit dem Vornamen der Person.',
    warningEphemeral:
      'Das Ergebnis wird nur hier angezeigt und verschwindet, sobald du den Bildschirm verlässt.',
    personLabel: 'Wessen Ergebnis?',
    personPlaceholder: 'Auswählen…',
    passwordLabel: 'Dein Passwort',
    sentenceLabel: 'Tippe ab: {sentence}',
    understood:
      'Ich verstehe, dass die ganze Gruppe erfährt, dass ich nachgesehen habe',
    submit: 'Dieses Ergebnis ansehen',
  },
  drawPairs: {
    gives: 'beschenkt {name}',
    gave: 'hat {name} beschenkt',
  },
  results: {
    title: 'Die Auslosung',
    footer:
      'Die Ausgabe ist abgeschlossen: Ihre Ergebnisse sind nicht mehr geheim.',
  },
  share: {
    notePlace: 'Platz des Zusatzes',
    noteBefore: 'Über der Nachricht',
    noteAfter: 'Unter der Nachricht',
    note: 'Zusatz hinzufügen (optional)',
    noteHint:
      'Wird unverändert gesendet, unabhängig von der Sprache der Nachricht.',
    preview: 'Vorschau der Nachricht',
    previewFor: 'Vorschau für {name}',
    previewEmailNote:
      'Jede Person erhält sie mit eigenem Vornamen, Link und in ihrer Sprache. Die E-Mail ergänzt Betreff und Signatur.',
    language: 'Sprache der Nachricht',
    languageHint: 'Auch die persönliche Seite wechselt in diese Sprache.',
    emailMessage: 'Per E-Mail senden',
    noEmail: 'Keine E-Mail-Adresse im Profil',
    emailSent: 'E-Mail an {name} gesendet',
    sheetTitle: 'An {name} senden',
    copied: 'Nachricht kopiert',
    copiedDescription: 'Füge sie in die App deiner Wahl ein.',
  },
} satisfies Dict<typeof fr>;
