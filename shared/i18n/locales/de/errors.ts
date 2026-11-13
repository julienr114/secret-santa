import type fr from '../fr/errors';
import type { Dict } from '../../types';

export default {
  unknown: 'Ein Fehler ist aufgetreten.',
  other: 'Fehler: {reason}',
  validation: 'Überprüfe die Felder des Formulars.',
  unauthorized: 'Melde dich an, um fortzufahren.',
  forbidden: 'Du hast keinen Zugriff auf diese Gruppe.',
  invalid_credentials: 'Falsches Passwort.',
  too_many_attempts:
    'Zu viele Versuche, probiere es in ein paar Minuten erneut.',
  slug_taken: 'Diese Gruppenkennung ist bereits vergeben.',
  group_not_found: 'Gruppe nicht gefunden.',
  person_not_found: 'Person nicht gefunden.',
  person_has_participations:
    'Diese Person hat bereits teilgenommen: deaktiviere sie stattdessen.',
  exclusion_not_found: 'Ausschluss nicht gefunden.',
  edition_not_found: 'Ausgabe nicht gefunden.',
  edition_in_progress: 'Schließe zuerst die laufende Ausgabe ab.',
  edition_closed: 'Diese Ausgabe ist abgeschlossen.',
  invalid_rules: 'Ungültige Regeln.',
  invalid_transition: 'Diese Aktion ist in dieser Phase nicht möglich.',
  no_solution:
    'Mit diesen Regeln ist keine Auslosung möglich: lockere einen Ausschluss.',
  too_few_participants: 'Es braucht mindestens zwei Teilnehmer.',
  participants_locked: 'Die Liste ist nach der Auslosung gesperrt.',
  already_participating: 'Diese Person nimmt bereits teil.',
  links_not_open: 'Öffne zuerst die Einladungen.',
  message_not_available: 'Diese Nachricht passt nicht zur Phase der Ausgabe.',
  email_disabled:
    'Der Versand per E-Mail ist für diese Gruppe nicht aktiviert.',
  email_not_configured:
    'Der Versand per E-Mail ist auf dem Server nicht eingerichtet. Teile die Links von deinem Handy aus.',
  email_failed:
    'Die E-Mails wurden nicht gesendet. Versuche es erneut oder teile die Links von deinem Handy aus.',
  email_missing: 'Diese Person hat keine E-Mail-Adresse.',
  participation_not_found: 'Teilnehmer nicht gefunden.',
  wrong_confirmation: 'Gib die Gruppenkennung genau ein.',
  wrong_sentence: 'Schreibe den verlangten Satz genau ab.',
  results_secret:
    'Die Ergebnisse bleiben geheim, bis die Ausgabe abgeschlossen ist.',
  link_invalid:
    'Dieser Link ist nicht mehr gültig, bitte deinen Organisator um einen neuen.',
  draw_not_done: 'Die Auslosung hat noch nicht stattgefunden.',
  result_not_found:
    'Dein Ergebnis wurde nicht gefunden, sag deinem Organisator Bescheid.',
  wishlist_disabled: 'Diese Gruppe verwendet keine Wunschlisten.',
  too_many_wishes: 'Deine Liste enthält zu viele Ideen.',
  invalid_wish:
    'Eine Idee ist ungültig: höchstens 200 Zeichen und ein Link, der mit http:// oder https:// beginnt.',
} satisfies Dict<typeof fr>;
