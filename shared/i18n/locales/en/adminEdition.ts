import type fr from '../fr/adminEdition';
import type { Dict } from '../../types';

export default {
  general: {
    editionFallback: 'Edition',
    tickToConfirm: 'Tick the box to confirm',
  },
  newEdition: {
    title: 'New edition',
    intro:
      'Participants of the previous edition who are still active are carried over; you can adjust the list afterwards.',
    nameRequired: 'Name required',
    nameLabel: 'Edition name',
    yearLabel: 'Year',
    submit: 'Create the edition',
  },
  cockpit: {
    closeLater: 'You will be able to close after the party ({date}).',
    messageLanguage: 'Message language: {language}',
    budget: 'Budget {budget}',
    eventDate: 'on {date}',
    draftIntro:
      'Check the list of participants, then open the invitations to be able to share the links.',
    openInvitations: 'Open the invitations',
    checkTitle: 'Check',
    drawPossible: 'The draw is possible',
    drawPossibleDescription: {
      one: '{count} participant, all the rules are met.',
      other: '{count} participants, all the rules are met.',
    },
    blocked: 'Nobody can be drawn for: {names}.',
    constrained: 'Very few options for: {names}.',
    startDraw: 'Start the draw',
    missing: {
      one: '{names} is not taking part yet',
      other: '{names} are not taking part yet',
    },
    missingWarning: 'Heads up: {text}.',
    drawIsFinal: 'The draw is final: the list will be locked. Shall we?',
    drawNow: 'Draw now',
    notYet: 'Not yet',
    drawDone: 'Draw done',
    drawDoneToast: 'Now share the “{message}” message with everyone.',
    drawnDescription:
      '{viewed}/{total} have viewed their result. Nobody, not even the organizer, can see the results here.',
    closeAfterParty: 'Close after the party',
    closeExplanation:
      'Closing makes the edition read-only; it will serve as history next year.',
    close: 'Close',
    closedNotice: 'Edition closed, read-only.',
    messageTitle: 'Message to share',
    sharedCount: {
      one: '{count}/{total} shared.',
      other: '{count}/{total} shared.',
    },
    shareHelp:
      'The button opens your phone’s share sheet (WhatsApp, SMS…) with the message and the personal link.',
    email: {
      bulkTitle: 'Send to several',
      bulkHint: 'By email, all at once',
      noAddress:
        'Sending by email: no participant has an address. Add them in People.',
      select: 'Send by email to several people',
      selected: { one: '{count} selected', other: '{count} selected' },
      selectAll: 'Select all',
      selectNone: 'Deselect all',
      selectPerson: 'Select {name}',
      chooseMessage: 'Choose the message',
      sheetTitle: {
        one: 'Send an email to {count} person',
        other: 'Send an email to {count} people',
      },
      sendCount: { one: 'Send {count} email', other: 'Send {count} emails' },
      spamTip:
        'Emails often land in spam: follow up by phone with those who do not open their link.',
      sent: {
        one: '{count} email sent',
        other: '{count} emails sent',
      },
      left: '{count} still to send: run the sending again.',
    },
    empty: 'Nobody yet.',
    send: 'Send',
    resend: 'Resend',
    sendLinkOf: 'Send {name}’s link',
    resendLinkOf: 'Resend {name}’s link',
    addParticipants: 'Add participants',
    cancelAndRedraw: 'Cancel and redo the draw',
    cancelAndRedrawHint:
      'Withdrawal, someone forgotten… recorded in the journal',
    revealOne: 'View a result',
    revealOneHint: 'Last resort, one person at a time, recorded in the journal',
    resultsTitle: {
      one: 'The draw · {count} participant',
      other: 'The draw · {count} participants',
    },
    exclusionsAppliedTitle: 'Exclusions applied at the draw',
    exclusionsTitle: 'Exclusions',
    pendingExclusions: {
      one: '+ {count} exclusion from a draw that is not closed yet, kept secret.',
      other:
        '+ {count} exclusions from a draw that is not closed yet, kept secret.',
    },
    previousDrawReason: 'Previous draw: {edition}',
    previousDraws: 'Previous draws',
    previousDrawsFooter:
      'Nobody will get the same person again. The × lifts an exclusion for this edition only.',
    waive: 'Lift',
    waiveLabel: 'Lift the exclusion {giver} → {receiver} for this edition',
    waived: {
      one: '{count} exclusion from previous years lifted for this edition.',
      other: '{count} exclusions from previous years lifted for this edition.',
    },
    restoreAll: 'Restore all',
  },
  participant: {
    fallbackTitle: 'Participant',
    notFound: 'Participant not found.',
    waiting: 'pending',
    notViewed: 'Has not viewed their result yet',
    viewed: {
      one: 'Viewed their result once',
      other: 'Viewed their result {count} times',
    },
    viewedWithLast: {
      one: 'Viewed their result once · last time {date}',
      other: 'Viewed their result {count} times · last time {date}',
    },
    linkCopied: 'Link copied',
    linkRegenerated: 'New link created, the old one no longer works',
    linkRegeneratedDescription: 'Remember to share it again.',
    messageTitle: 'Message',
    shareMessage: 'Share the message',
    shareMessageHint: 'WhatsApp, SMS… from your phone',
    copyMessage: 'Copy the message',
    copyLink: 'Copy the link only',
    unsend: 'Not sent after all?',
    unsendHint: 'Removes the “{badge}” badge',
    unsendDone: 'Badge removed',
    troubleshooting: 'Troubleshooting',
    troubleshootingFooter:
      'None of these actions reveals the result. All of them are recorded in the group journal.',
    regenerate: 'Regenerate the link',
    regenerateHint: 'Link forwarded by mistake',
    regenerateConfirm: '{name}’s old link will stop working. Continue?',
    regenerateAction: 'Regenerate',
    remove: 'Remove from the edition',
    removeConfirm: 'Remove {name} from this edition?',
    removeAction: 'Remove',
  },
  addParticipants: {
    title: 'Add participants',
    crumb: 'Add',
    added: '{name} is taking part',
    everyoneIn:
      'Everyone is already taking part. For someone new, create them first in {people}.',
    peopleLink: 'People',
    footer: 'Deactivated people do not appear here.',
  },
  cancelDraw: {
    title: 'Cancel the draw',
    reasonRequired: 'Explain in a few words',
    done: 'Draw cancelled',
    doneDescription: 'Adjust the list, then run the draw again.',
    effectResults:
      'All results are erased and the list becomes editable again.',
    effectLinks: 'Links and codes remain valid.',
    effectJournal:
      'The reason is shown in the journal, visible to the whole group.',
    effectMessage: 'After the new draw, send everyone the “{message}” message.',
    reasonLabel: 'Reason',
    reasonPlaceholder: 'Tom dropped out',
    understood: 'I understand that the current results will be lost',
    submit: 'Cancel the draw',
  },
  reveal: {
    title: 'View a result',
    personRequired: 'Choose a person',
    passwordRequired: 'Password required',
    sentenceRequired: 'Type “{sentence}”',
    shownNotice:
      'Your viewing is recorded in the group journal. The result disappears when you leave this screen.',
    another: 'View another result',
    warningLastResort:
      'Only use this as a last resort (disagreement, suspected bug…). You only see one result at a time.',
    warningJournal:
      'The group journal will show, to all participants: “The organizer looked at Léa’s result”, with the person’s first name.',
    warningEphemeral:
      'The result is only shown here and disappears when you leave the screen.',
    personLabel: 'Whose result?',
    personPlaceholder: 'Choose…',
    passwordLabel: 'Your password',
    sentenceLabel: 'Type: {sentence}',
    understood: 'I understand that the whole group will know I looked',
    submit: 'View this result',
  },
  drawPairs: {
    gives: 'gives to {name}',
    gave: 'gave to {name}',
  },
  results: {
    title: 'The draw',
    footer: 'The edition is closed: its results are no longer secret.',
  },
  share: {
    notePlace: 'Where the note goes',
    noteBefore: 'Above the message',
    noteAfter: 'Below the message',
    note: 'Add a note (optional)',
    noteHint: 'Sent as written, whatever the language of the message.',
    preview: 'Message preview',
    previewFor: 'Preview, for {name}',
    previewEmailNote:
      'Everyone gets it with their own first name, link and language. The email adds a subject and a signature.',
    language: 'Message language',
    languageHint: 'Their page will switch to this language too.',
    emailMessage: 'Send by email',
    noEmail: 'No email address on their profile',
    emailSent: 'Email sent to {name}',
    sheetTitle: 'Send to {name}',
    copied: 'Message copied',
    copiedDescription: 'Paste it into the app of your choice.',
  },
} satisfies Dict<typeof fr>;
