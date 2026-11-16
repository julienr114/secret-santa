import type fr from '../fr/adminEdition';
import type { Dict } from '../../types';

export default {
  general: {
    editionFallback: 'Ausgabe',
    tickToConfirm: 'Zum Bestätigen ankreuzen',
  },
  newEdition: {
    dateLabel: 'Datum der Bescherung',
    dateHelp: 'Der Tag, an dem ihr die Geschenke austauscht. Später änderbar.',
    dateRequired: 'Wähle das Datum der Bescherung',
    title: 'Neue Ausgabe',
    intro:
      'Die noch aktiven Teilnehmer der letzten Ausgabe werden übernommen; die Liste kannst du danach anpassen.',
    nameRequired: 'Name erforderlich',
    nameLabel: 'Name der Ausgabe',
    yearLabel: 'Jahr',
    submit: 'Ausgabe erstellen',
  },
  cockpit: {
    startDraw: 'Auslosung starten',
    missing: {
      one: '{names} nimmt noch nicht teil',
      other: '{names} nehmen noch nicht teil',
    },
    drawDone: 'Auslosung durchgeführt',
    email: {
      sent: {
        one: '{count} E-Mail gesendet',
        other: '{count} E-Mails gesendet',
      },
    },
    sendLinkOf: 'Link von {name} senden',
    resendLinkOf: 'Link von {name} erneut senden',
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
    added: '{name} nimmt teil',
    everyoneIn:
      'Alle nehmen bereits teil. Jemand Neues legst du zuerst unter {people} an.',
    peopleLink: 'Personen',
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
    language: 'Sprache der Nachricht',
    languageHint: 'Auch die persönliche Seite wechselt in diese Sprache.',
    emailMessage: 'Per E-Mail senden',
    noEmail: 'Keine E-Mail-Adresse im Profil',
    emailSent: 'E-Mail an {name} gesendet',
    copied: 'Nachricht kopiert',
    copiedDescription: 'Füge sie in die App deiner Wahl ein.',
  },
  invite: {
    title: 'Einladungslink',
    off: 'Inaktiv',
    description:
      'Teile ihn: Jeder meldet sich mit seiner E-Mail-Adresse an und tritt der Gruppe bei, und ihrer laufenden Auslosung, solange sie nicht stattgefunden hat.',
    share: 'Teilen',
    copied: 'Link kopiert',
    until: 'Frist',
    untilHelp: 'Optional. Nach diesem Tag funktioniert der Link nicht mehr.',
    places: 'Plätze',
    placesHelp:
      'Wie viele Personen über diesen Link noch beitreten können. Standardmäßig die freien Plätze der Gruppe.',
    placesLeft: { one: '{count} Platz frei', other: '{count} Plätze frei' },
    untilShort: 'bis {date}',
    messageLabel: 'Deine Worte auf der Einladungsseite',
    messageHelp: 'Optional. Was die Gäste beim Öffnen des Links lesen.',
    create: 'Link erstellen',
    save: 'Speichern',
    close: 'Link deaktivieren',
    saved: 'Link gespeichert',
    shareTitle: 'Nachricht zum Teilen',
    copyMessage: 'Nachricht kopieren',
    message: {
      intro: 'Hallo! Du bist zum Wichteln „{group}“ eingeladen 🎁',
      how: 'Melde dich mit deiner E-Mail-Adresse über diesen Link an:',
      until: 'Du hast Zeit bis zum {date}.',
    },
    renew: 'Neuer Link (der alte funktioniert dann nicht mehr)',
  },
  screen: {
    lists: {
      collapseSeries: {
        toNotify: 'Die noch zu Benachrichtigenden einklappen',
        notOpened: 'Die noch nicht Geöffneten einklappen',
        viewed: 'Die Entdeckten einklappen',
      },
      collapse: 'Liste einklappen',
      series: {
        toNotify: 'Noch nicht gesendet',
        notOpened: 'Gesendet, noch nicht angesehen',
        viewed: 'Ergebnis angesehen',
      },
      search: 'Einen Vornamen suchen',
      clear: 'Suche leeren',
      more: {
        one: 'Die andere Person ansehen',
        other: 'Die {count} anderen ansehen',
      },
      noMatch: 'Kein Vorname passt.',
    },
    empty: {
      title: 'Füge die Teilnehmer hinzu',
      body: 'Für eine Auslosung braucht es mindestens zwei. Wähle sie unter den Mitgliedern der Gruppe aus oder schicke einen Link, damit sie sich eintragen.',
      invite: 'Per Link einladen',
      list: 'Kein Teilnehmer',
      none: 'Noch niemand.',
    },
    impossible: {
      eyebrow: 'Vor der Auslosung zu beheben',
      title: 'Die Auslosung ist im Moment nicht möglich',
      blocked: 'niemand zum Beschenken.',
      constrained: 'sehr wenig Auswahl.',
      help: {
        one: 'Es gibt zu viele Ausschlüsse für {count} Teilnehmer. Entferne einen oder füge jemanden hinzu.',
        other:
          'Es gibt zu viele Ausschlüsse für {count} Teilnehmer. Entferne einen oder füge jemanden hinzu.',
      },
      exclusions: 'Ausschlüsse ansehen',
    },
    notifyCount: {
      one: 'Per E-Mail benachrichtigen',
      other: 'Die {count} per E-Mail benachrichtigen',
    },
    sentTo: {
      one: '{names} ist benachrichtigt.',
      other: '{names} sind benachrichtigt.',
    },
    closed: {
      partyDone: 'Gefeiert',
      partedOn: 'gefeiert am {date}',
      title: 'Ausgabe abgeschlossen',
      body: 'Schreibgeschützt. Die Auslosung dient dazu, dieselben Paare in den folgenden Jahren zu vermeiden.',
      exclusions: 'Bei der Auslosung angewandte Ausschlüsse',
      exclusionsNone: 'Keine',
      journal: 'Protokoll der Gruppe',
      journalHint: 'Alles, was passiert ist, für alle sichtbar',
      next: 'Die nächste Ausgabe vorbereiten',
    },
    steps: {
      label: 'Schritte der Ausgabe',
      prepare: 'Vorbereiten',
      draw: 'Auslosen',
      party: 'Feiern',
    },
    partyOn: 'Bescherung am {date}',
    changeDate: 'Bescherung am {date}. Datum ändern',
    budget: 'Budget {budget}',
    now: 'Jetzt zu tun',
    prepare: {
      title: 'Prüfe die Liste, dann starte die Auslosung',
      ready: {
        one: '{count} Teilnehmer, alle Regeln sind eingehalten.',
        other: '{count} Teilnehmende, alle Regeln sind eingehalten.',
      },
      action: 'Auslosung starten',
      help: 'Gleich danach benachrichtigst du alle per E-Mail.',
      add: 'Teilnehmende hinzufügen',
      optional: 'Wenn du möchtest',
      notifyBefore: 'Vor der Auslosung benachrichtigen',
      notifyBeforeHint: 'Optional: Alle können schon ihre Ideen notieren',
      exclusions: 'Ausschlüsse',
      exclusionsCount: {
        one: '{count} Ausschluss',
        other: '{count} Ausschlüsse',
      },
      exclusionsNone: 'Noch keine',
      messagesIn: {
        fr: 'Nachrichten auf Französisch',
        en: 'Nachrichten auf Englisch',
        de: 'Nachrichten auf Deutsch',
      },
    },
    drawSheet: {
      title: 'Auslosung starten?',
      description: 'Ein letzter Blick vor der Auslosung.',
      people: { one: '{count} Teilnehmer', other: '{count} Teilnehmende' },
      rules: 'Alle Regeln sind eingehalten',
      rulesDetail: {
        one: '{count} Ausschluss · niemand zieht sich selbst',
        other: '{count} Ausschlüsse · niemand zieht sich selbst',
      },
      rulesDetailNone: 'Kein Ausschluss · niemand zieht sich selbst',
      missingOne: '{name} macht noch nicht mit',
      missingMany: '{count} Personen machen noch nicht mit',
      missingOneDetail:
        'Diese Person ist in der Gruppe, aber nicht in dieser Ausgabe. Nach der Auslosung müsste sie annulliert werden, um sie hinzuzufügen.',
      missingManyDetail:
        '{names} sind in der Gruppe, aber nicht in dieser Ausgabe.',
      andOthers: {
        one: '{names} und {count} weitere Person',
        other: '{names} und {count} weitere',
      },
      seeAndAdd: 'Ansehen und hinzufügen',
      final:
        'Die Auslosung ist endgültig: Die Teilnehmerliste wird gesperrt. Niemand, auch du nicht, sieht die Ergebnisse.',
      confirm: 'Auslosen',
      notYet: 'Noch nicht',
    },
    follow: {
      title: 'Sag allen, dass die Auslosung stattgefunden hat',
      titleDone: 'Alle haben ihren Link',
      toNotify: 'zu benachrichtigen',
      notOpened: { one: 'noch nicht geöffnet', other: 'noch nicht geöffnet' },
      viewed: { one: 'hat entdeckt', other: 'haben entdeckt' },
      actionReminder: 'Per E-Mail erinnern',
      help: 'Keine E-Mail-Adresse? Der Knopf jeder Zeile teilt den Link per WhatsApp oder SMS.',
      firstFootnote: 'Wer noch zu benachrichtigen ist, steht oben.',
      state: {
        toNotify: 'Noch nicht gesendet',
        notOpened: 'Gesendet, noch nicht angesehen',
        viewed: 'Ergebnis angesehen · {count}×',
      },
      later: 'Später, oder wenn etwas schiefgeht',
      closeRow: 'Ausgabe abschließen',
      closeRowLater: 'Möglich nach der Bescherung, am {date}',
      closeRowHint: 'Die Ausgabe ist dann nur noch lesbar',
      closeConfirm:
        'Nach dem Abschluss ist die Ausgabe nicht mehr änderbar; sie dient nächstes Jahr als Verlauf.',
      revealOne: 'Ein einzelnes Ergebnis ansehen',
      revealOneHint: 'Letzter Ausweg, im Journal vermerkt',
      cancel: 'Auslosung annullieren und neu starten',
      cancelHint: 'Absage, jemand vergessen… im Journal vermerkt',
      noResults:
        'Niemand, auch der Organisator nicht, sieht hier die Ergebnisse.',
      partyTitle: 'Die Bescherung ist vorbei: Schließe die Ausgabe ab',
      partyHelp:
        'Wunschlisten sind dann nur noch lesbar; die Auslosung dient den Ausschlüssen der nächsten Jahre.',
    },
    missingDate: {
      title: 'Wann ist die Bescherung?',
      body: 'Ohne Datum haben die Teilnehmenden keinen Countdown, und der Abschluss wartet nicht auf die Bescherung.',
      validate: 'Bestätigen',
    },
    dateSheet: {
      title: 'Datum der Bescherung',
      description: 'Der Tag, an dem ihr die Geschenke austauscht.',
      seen: 'Die Teilnehmenden sehen es auf ihrer Seite, mit dem Countdown.',
      journal: 'Die Änderung wird im Journal der Gruppe vermerkt.',
      saved: 'Datum der Bescherung gespeichert',
    },
    emails: {
      title: 'Per E-Mail senden',
      message: 'Nachricht',
      selected: {
        one: '{count} von {total} ausgewählt',
        other: '{count} von {total} ausgewählt',
      },
      selectAll: 'Alle auswählen',
      selectNone: 'Keine auswählen',
      noEmail: 'Keine E-Mail-Adresse',
      addEmail: 'Hinzufügen',
      addEmailLabel: 'Adresse von {name} hinzufügen',
      select: '{name} auswählen',
      previewFor: 'Vorschau, für {name}',
      addNote: 'Ein paar Worte hinzufügen',
      each: 'Jede Person bekommt sie mit ihrem Vornamen, ihrem Link und in ihrer Sprache.',
      send: { one: '{count} E-Mail senden', other: '{count} E-Mails senden' },
      spam: 'E-Mails landen oft im Spam: Erinnere per Telefon, wer seinen Link nicht öffnet.',
    },
    sheet: {
      sendTo: 'An {name} senden',
      resendTo: 'Erneut an {name} senden',
      left: {
        one: 'Noch {count} Person zu benachrichtigen',
        other: 'Noch {count} Personen zu benachrichtigen',
      },
      close: 'Schließen',
      addNote: 'Ein paar Worte hinzufügen',
      language: 'Sprache der Nachricht: {language}. Ändern',
      byEmail: 'Per E-Mail senden',
      resendByEmail: 'Erneut per E-Mail senden',
      share: 'Teilen',
      copy: 'Kopieren',
      next: 'Nach dem Senden geht es weiter mit {name}.',
      skip: 'Überspringen',
      wrongAddress: 'Nicht die richtige Adresse? Korrigieren',
      other: 'Die E-Mail kommt nicht an? Nimm einen anderen Weg',
      copyMessage: 'Nachricht kopieren',
      copyLink: 'Nur den Link kopieren',
      otherHint:
        'Teilen öffnet WhatsApp, SMS… Der Link von {name} ändert sich nicht: Nichts davon verrät das Ergebnis.',
      emailSent: 'E-Mail an {name} gesendet',
    },
  },
} satisfies Dict<typeof fr>;
