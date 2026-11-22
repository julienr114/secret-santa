import type fr from '../fr/errors';
import type { Dict } from '../../types';

export default {
  unknown: 'Autsch, da hat etwas gehakt. Versuch es gleich noch einmal.',
  year_over: 'Dieses Jahr ist vorbei: Daran ändert sich nichts mehr.',
  secret_santa_drawn:
    'Dieses Secret Santa ist ausgelost: Es lässt sich nicht mehr löschen.',
  nothing_to_prepare: 'Gerade gibt es nichts vorzubereiten.',
  other: 'Da hat etwas gehakt ({reason}).',
  validation: 'Da fehlt noch etwas: prüfe die Felder.',
  unauthorized: 'Melde dich an, um fortzufahren.',
  forbidden: 'Du hast keinen Zugriff auf dieses Event.',
  too_many_attempts:
    'Immer mit der Ruhe. Versuch es in ein paar Minuten noch einmal.',
  too_many_requests:
    'Zu viele Anfragen auf einmal. Warte ein paar Minuten, bevor du es erneut versuchst.',
  web_address:
    'Ein Name darf keine Webadresse enthalten. Entferne sie und versuche es erneut.',
  limit_lists:
    'Du führst schon sehr viele Listen. Lösche eine, um eine neue anzulegen.',
  limit_people:
    'Auf dieser Liste stehen schon sehr viele Personen: Es können keine weiteren dazu.',
  limit_ideas:
    'Diese Liste hat schon sehr viele Ideen: Es können keine weiteren dazu.',
  limit_off_list:
    'Du hast hier schon sehr viele Geschenke außerhalb der Liste angekündigt. Entferne eines, um ein weiteres hinzuzufügen.',
  limit_family:
    'Du hast schon sehr viele Personen. Lösche eine, um eine weitere hinzuzufügen.',
  limit_journal:
    'In diesem Event war heute sehr viel los: Versuche es morgen noch einmal.',
  list_not_empty:
    'Auf dieser Liste steht schon jemand: Von einer anderen Liste geht man nur in einer leeren aus.',
  anonymous_mode:
    'Anonymer Modus ist an: Du kannst es nur allein und anonym schenken. Schalte ihn oben in der Liste aus, um anders zu wählen.',
  list_shared:
    'Diese Liste ist schon geteilt: Sie bleibt ohne Personen. Beende das Teilen, um sie nach Personen zu ordnen.',
  several_people:
    'Auf der Liste stehen mehrere Personen: Ihre Ideen lassen sich nicht mischen.',
  list_not_linkable:
    'Diese Liste kann nicht verknüpft werden: Sie muss veröffentlicht sein und dir gehören.',
  slug_taken: 'Diese Event-Kennung ist bereits vergeben.',
  group_not_found:
    'Event nicht gefunden. Lade die Seite neu: die Liste hat sich vielleicht geändert.',
  person_not_found:
    'Person nicht gefunden. Lade die Seite neu: die Liste hat sich vielleicht geändert.',
  person_has_participations:
    'Diese Person hat bereits teilgenommen: deaktiviere sie stattdessen.',
  exclusion_not_found:
    'Ausschluss nicht gefunden. Lade die Seite neu: die Liste hat sich vielleicht geändert.',
  edition_not_found:
    'Wichteln nicht gefunden. Lade die Seite neu: die Liste hat sich vielleicht geändert.',
  edition_closed: 'Dieses Wichteln ist abgeschlossen.',
  invalid_rules: 'Diese Regeln passen nicht zusammen. Prüfe sie.',
  results_already_revealed: 'Die Ergebnisse sind bereits aufgedeckt.',
  results_revealed:
    'Die Ergebnisse sind aufgedeckt: Die Auslosung kann nicht mehr aufgehoben werden.',
  party_date_missing:
    'Trag zuerst das Datum ein, um die Ergebnisse aufzudecken.',
  party_not_reached: 'Der große Tag ist noch nicht da.',
  invalid_transition: 'Zu früh oder zu spät: das geht in dieser Phase nicht.',
  no_solution:
    'Mit diesen Regeln ist keine Auslosung möglich: lockere einen Ausschluss.',
  too_many_participants: 'Ein Wichteln kann höchstens 100 Teilnehmer haben.',
  too_few_participants:
    'Ihr müsst mindestens zu dritt sein: zu zweit hält kein Geheimnis.',
  participants_locked: 'Die Auslosung ist erfolgt: die Liste steht fest.',
  already_participating: 'Diese Person nimmt bereits teil.',
  message_not_available: 'Diese Nachricht passt nicht zur Phase des Wichtelns.',
  email_not_configured:
    'Der Versand per E-Mail ist auf dem Server nicht eingerichtet. Teile die Links von deinem Handy aus.',
  email_failed:
    'Die E-Mails wurden nicht gesendet. Versuche es erneut oder teile die Links von deinem Handy aus.',
  email_missing: 'Diese Person hat keine E-Mail-Adresse.',
  participation_not_found:
    'Teilnehmer nicht gefunden. Lade die Seite neu: die Liste hat sich vielleicht geändert.',
  wrong_confirmation: 'Gib die Event-Kennung genau ein.',
  wrong_sentence: 'Schreibe den verlangten Satz genau ab.',
  results_secret:
    'Die Ergebnisse bleiben geheim, bis das Wichteln abgeschlossen ist.',
  login_link_invalid:
    'Dieser Anmeldelink ist nicht mehr gültig: fordere einen neuen an.',
  cannot_remove_self:
    'Du kannst dich nicht selbst entfernen: bitte einen anderen Organisator.',
  organizer_not_found:
    'Organisator nicht gefunden. Lade die Seite neu: die Liste hat sich vielleicht geändert.',
  link_invalid:
    'Dieser Link ist nicht mehr gültig, bitte deinen Organisator um einen neuen.',
  draw_not_done: 'Die Auslosung hat noch nicht stattgefunden.',
  result_not_found:
    'Dein Umschlag ist nicht auffindbar. Sag deinem Organisator Bescheid: da stimmt etwas nicht.',
  gift_hints_disabled: 'Dieses Wichteln verwendet keine Geschenkideen.',
  ideas_disabled: 'Dieses Wichteln verwendet keine genauen Ideen.',
  invalid_hints: 'Eine deiner Antworten konnte nicht gespeichert werden.',
  hints_already_requested: 'Du hast in diesem Wichteln schon um Ideen gebeten.',
  hints_already_given: 'Es sind schon Ideen da.',
  result_not_seen: 'Öffne zuerst deinen Umschlag.',
  no_previous_hints: 'Keine Ideen zum Übernehmen.',
  too_many_wishes: 'Deine Liste enthält zu viele Ideen.',
  invalid_wish:
    'Eine Idee ist ungültig: höchstens 200 Zeichen und ein Link, der mit http:// oder https:// beginnt.',
  secret_santa_limit_reached:
    'Du organisierst schon 3 Wichteln: Mehr geht mit einem Konto nicht.',
  secret_santa_paused:
    'Neue Wichteln sind pausiert. Die bestehenden laufen weiter.',
  too_many_members: 'Das Event ist voll: 30 Mitglieder sind das Maximum.',
  cannot_disable_self: 'Du kannst dein eigenes Konto nicht deaktivieren.',
  account_not_found:
    'Konto nicht gefunden. Lade die Seite neu: die Liste hat sich vielleicht geändert.',
  session_current:
    'Das ist das Gerät, das du gerade nutzt: Melde dich über das Menü ab.',
  session_not_found:
    'Sitzung nicht gefunden. Lade die Seite neu: die Liste hat sich vielleicht geändert.',
  person_is_organizer:
    'Diese Person organisiert das Event: Entferne sie zuerst aus den Organisatoren.',
  invite_invalid:
    'Dieser Einladungslink ist nicht mehr gültig: Bitte den Organisator um einen neuen.',
  person_has_other_email:
    'Dieses Wichteln ist bereits mit einer anderen Adresse verknüpft.',
  invite_expired:
    'Dieser Einladungslink ist abgelaufen: Bitte den Organisator um einen neuen.',
  invite_drawn:
    'Die Auslosung hat schon stattgefunden: Über diesen Link kann sich niemand mehr anmelden.',
  invite_full:
    'Über diesen Link ist kein Platz mehr frei: Sag dem Organisator Bescheid.',
  collecting_answers:
    'Die Auslosung fand woanders statt: Jeder gibt seine Antwort. Verwirf die Antworten, um mit der App auszulosen.',
  not_collecting_answers: 'Dieses Wichteln sammelt keine Antworten.',
  answers_not_ready:
    'Die Antworten sind noch nicht vollständig oder passen nicht zusammen.',
  invalid_answer: 'Wähle eine andere Person des Wichtelns.',
  game_needs_four:
    'Das Spiel braucht mindestens vier: zu dritt gibt es nichts zu erraten.',
  draw_not_revealed: 'Die Auslosung ist noch nicht aufgedeckt.',
  already_played: 'Du hast schon getippt: Nimm den Tipp erst zurück.',
  email_taken: 'Diese Adresse gehört schon einer anderen Person des Events.',
} satisfies Dict<typeof fr>;
