import type fr from '../fr/errors';
import type { Dict } from '../../types';

export default {
  unknown: 'Ein Fehler ist aufgetreten.',
  other: 'Fehler: {reason}',
  validation: 'Überprüfe die Felder des Formulars.',
  unauthorized: 'Melde dich an, um fortzufahren.',
  forbidden: 'Du hast keinen Zugriff auf diese Gruppe.',
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
  results_already_revealed: 'Die Ergebnisse sind bereits aufgedeckt.',
  results_revealed:
    'Die Ergebnisse sind aufgedeckt: Die Auslosung kann nicht mehr aufgehoben werden.',
  party_date_missing:
    'Trag zuerst das Datum der Feier ein, um die Ergebnisse aufzudecken.',
  party_not_reached: 'Die Feier hat noch nicht stattgefunden.',
  invalid_transition: 'Diese Aktion ist in dieser Phase nicht möglich.',
  no_solution:
    'Mit diesen Regeln ist keine Auslosung möglich: lockere einen Ausschluss.',
  too_many_participants: 'Eine Ausgabe kann höchstens 100 Teilnehmer haben.',
  too_few_participants: 'Es braucht mindestens drei Teilnehmer.',
  participants_locked: 'Die Liste ist nach der Auslosung gesperrt.',
  already_participating: 'Diese Person nimmt bereits teil.',
  message_not_available: 'Diese Nachricht passt nicht zur Phase der Ausgabe.',
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
  login_link_invalid:
    'Dieser Anmeldelink ist nicht mehr gültig: fordere einen neuen an.',
  cannot_remove_self:
    'Du kannst dich nicht selbst entfernen: bitte einen anderen Organisator.',
  organizer_not_found: 'Organisator nicht gefunden.',
  link_invalid:
    'Dieser Link ist nicht mehr gültig, bitte deinen Organisator um einen neuen.',
  draw_not_done: 'Die Auslosung hat noch nicht stattgefunden.',
  result_not_found:
    'Dein Ergebnis wurde nicht gefunden, sag deinem Organisator Bescheid.',
  gift_hints_disabled: 'Diese Gruppe verwendet keine Geschenk-Hinweise.',
  ideas_disabled: 'Diese Gruppe verwendet keine genauen Ideen.',
  invalid_hints: 'Eine deiner Antworten konnte nicht gespeichert werden.',
  hints_already_requested:
    'Du hast für diese Auslosung schon um Hinweise gebeten.',
  hints_already_given: 'Es sind schon Hinweise da.',
  result_not_seen: 'Finde zuerst heraus, wen du beschenkst.',
  no_previous_hints: 'Keine Hinweise zum Übernehmen.',
  too_many_wishes: 'Deine Liste enthält zu viele Ideen.',
  invalid_wish:
    'Eine Idee ist ungültig: höchstens 200 Zeichen und ein Link, der mit http:// oder https:// beginnt.',
  group_quota_reached:
    'Du kannst im Moment keine Gruppe erstellen: Frag auf der Startseite danach.',
  group_request_pending: 'Du hast bereits eine offene Anfrage.',
  group_request_useless: 'Du kannst bereits eine Gruppe erstellen.',
  cannot_disable_self: 'Du kannst dein eigenes Konto nicht deaktivieren.',
  account_not_found: 'Konto nicht gefunden.',
  request_not_found: 'Anfrage nicht gefunden.',
  request_decided: 'Diese Anfrage wurde bereits beantwortet.',
  session_current:
    'Das ist das Gerät, das du gerade nutzt: Melde dich über das Menü ab.',
  session_not_found: 'Sitzung nicht gefunden.',
  person_is_organizer:
    'Diese Person organisiert die Gruppe: Entferne sie zuerst aus den Organisatoren.',
  invite_invalid:
    'Dieser Einladungslink ist nicht mehr gültig: Bitte den Organisator um einen neuen.',
  person_has_other_email:
    'Diese Auslosung ist bereits mit einer anderen Adresse verknüpft.',
  invite_expired:
    'Dieser Einladungslink ist abgelaufen: Bitte den Organisator um einen neuen.',
  invite_full:
    'Über diesen Link ist kein Platz mehr frei: Sag dem Organisator Bescheid.',
  collecting_answers:
    'Die Auslosung fand woanders statt: Jeder gibt seine Antwort. Verwirf die Antworten, um mit der App auszulosen.',
  not_collecting_answers: 'Diese Ausgabe sammelt keine Antworten.',
  answers_not_ready:
    'Die Antworten sind noch nicht vollständig oder passen nicht zusammen.',
  invalid_answer: 'Wähle eine andere Person der Ausgabe.',
} satisfies Dict<typeof fr>;
