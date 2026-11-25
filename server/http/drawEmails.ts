import type { H3Event } from 'h3';
import { inArray } from 'drizzle-orm';
import type { Db } from '#server/database/client';
import {
  listParticipants,
  santaNameForSubject,
  type Participant,
} from '#server/database/editions';
import { emailChoicesOf } from '#server/database/news';
import { personalLink } from '#server/database/participations';
import { auditLog, participations } from '#server/database/schema';
import type { PartyRow, SecretSantaRow } from '#server/database/schema';
import { auditInsert } from '#server/database/audit';
import { dataKeyOf, newId, nowIso } from './context';
import { sendEmails } from './email';
import { blockedAddresses } from './emailStatus';
import { unwrap } from './errors';
import { auditEvent } from '#server/utils/audit';
import { all } from '#server/utils/result';
import { buildEmail, EMAIL_BATCH_MAX } from '#server/utils/messages';
import type { Rules } from '#server/utils/rules';
import {
  drawEmailTargets,
  reachOf,
  type Reach,
} from '#server/utils/drawEmails';

// Au tirage, l'application prévient chacun (ticket 169): the message of
// the draw, from the app, to each participant it reaches by email, in
// their language, with the organiser's word of the settings; signed « Le
// Secret Santa de {événement} ». Marked « envoyé » and journaled as sent
// by the app. A sending that fails leaves the draw made: the follow-up
// says so, and the organiser sends again.

/**
 * How each participant gets their link after the draw.
 * @param event - The request.
 * @param db - The database.
 * @param people - The participants.
 * @returns Each one's way, by person id.
 */
export const reachesOf = async (
  event: H3Event,
  db: Db,
  people: readonly Pick<Participant, 'id' | 'email'>[],
): Promise<Map<string, Reach>> => {
  const emails = people.map((person) => person.email);
  const [blocked, choices] = await Promise.all([
    blockedAddresses(event, db, emails),
    emailChoicesOf(db, emails),
  ]);
  return new Map(
    people.map((person) => {
      const plain = person.email?.trim().toLowerCase() ?? null;
      return [
        person.id,
        reachOf({
          email: person.email,
          blocked: plain ? blocked.has(plain) : false,
          choice: plain ? (choices.get(plain) ?? null) : null,
        }),
      ];
    }),
  );
};

/** What a sending of the draw emails did. */
export type DrawEmailsResult = { sent: number; failed: string | null };

/**
 * Sends the message of the draw to those it reaches and has not written
 * to yet (the chosen ones only, when given), in batches.
 * @param event - The request.
 * @param input - The event, the Secret Santa, its rules, the message.
 * @param input.db - The database.
 * @param input.group - The event.
 * @param input.edition - The Secret Santa.
 * @param input.rules - Its rules: budget, date, the organiser's word.
 * @param input.type - « Le tirage est fait », or « Un nouveau tirage ».
 * @param input.only - The participations to write to, if not all.
 * @param input.accountId - The organiser who drew.
 * @returns How many left, and why the rest did not.
 */
export const sendDrawEmails = async (
  event: H3Event,
  input: {
    db: Db;
    group: PartyRow;
    edition: SecretSantaRow;
    rules: Rules;
    type: 'drawn' | 'redraw';
    only?: readonly string[];
    /** The organiser who drew, for « Signaler cet envoi ». */
    accountId: string | null;
  },
): Promise<DrawEmailsResult> => {
  const { db, group, edition, rules, type } = input;
  const people = await listParticipants(db, edition.id);
  const reaches = await reachesOf(event, db, people);
  const targets = drawEmailTargets(
    people.map((person) => ({
      ...person,
      reach: reaches.get(person.id) ?? 'noAddress',
    })),
    input.only,
  );
  if (targets.length === 0) return { sent: 0, failed: null };
  const rows = await db
    .select()
    .from(participations)
    .where(
      inArray(
        participations.id,
        targets.map((person) => person.participationId),
      ),
    );
  const santaName = await santaNameForSubject(db, edition);
  const dataKey = await dataKeyOf(event);
  const batches = Array.from(
    { length: Math.ceil(targets.length / EMAIL_BATCH_MAX) },
    (_, index) =>
      targets.slice(index * EMAIL_BATCH_MAX, (index + 1) * EMAIL_BATCH_MAX),
  );
  /** Sends one batch, then marks and journals it. */
  const sendBatch = async (batch: typeof targets): Promise<string | null> => {
    const emails = await Promise.all(
      batch.map(async (person) => {
        const row = rows.find((one) => one.id === person.participationId);
        if (!row || !person.email) throw createError({ statusCode: 500 });
        const email = unwrap(
          buildEmail(
            type,
            {
              firstName: person.firstName,
              groupName: group.name,
              // The app sends it: signed by the Secret Santa.
              sender: null,
              santaName,
              editionLabel: edition.label,
              link: await personalLink(event, row, dataKey),
              budget: rules.budget,
              eventDate: rules.eventDate,
              guessEndsAt:
                edition.guessMode === 'none' ? null : edition.guessEndsAt,
              guessTimeZone: edition.guessTimeZone,
              guessMode: edition.guessMode as 'none' | 'santa' | 'all',
              christmas: group.category === 'christmas',
            },
            person.language,
            rules.messageNote,
            rules.messageNotePosition,
          ),
        );
        return {
          ...email,
          to: person.email,
          locale: person.language,
          by: null,
          sentBy: { partyId: group.id, accountId: input.accountId, name: null },
        };
      }),
    );
    const sent = await sendEmails(event, emails, { db });
    if (!sent.ok) return sent.reason;
    const now = nowIso();
    const events = unwrap(
      all(
        batch.map((person) =>
          auditEvent(
            {
              type: 'message_sent',
              groupId: group.id,
              editionId: edition.id,
              personId: person.id,
              actor: 'system',
              meta: { messageType: type, via: 'email' },
            },
            { id: newId, now: () => now },
          ),
        ),
      ),
    );
    await db.batch([
      db
        .update(participations)
        .set({ messageSentAt: now })
        .where(
          inArray(
            participations.id,
            batch.map((person) => person.participationId),
          ),
        ),
      ...events.map((one) => db.insert(auditLog).values(auditInsert(one))),
    ]);
    return null;
  };
  const outcome = await batches.reduce<
    Promise<{ sent: number; failed: string | null }>
  >(
    async (previous, batch) => {
      const done = await previous;
      if (done.failed) return done;
      const failed = await sendBatch(batch).catch(() => 'email_failed');
      return failed
        ? { ...done, failed }
        : { ...done, sent: done.sent + batch.length };
    },
    Promise.resolve({ sent: 0, failed: null }),
  );
  return outcome;
};
