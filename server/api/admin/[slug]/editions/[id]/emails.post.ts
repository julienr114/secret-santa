import { findAccountById } from '#server/database/accounts';
import { z } from 'zod';
import { eq, inArray } from 'drizzle-orm';
import { listParticipants } from '#server/database/editions';
import { personalLink } from '#server/database/participations';
import { auditLog, participations } from '#server/database/schema';
import { auditInsert } from '#server/database/audit';
import { requireEdition } from '#server/http/edition';
import { dataKeyOf, newId, nowIso } from '#server/http/context';
import { emailConfigured, sendEmails } from '#server/http/email';
import { unwrap } from '#server/http/errors';
import { validatedBody } from '#server/http/validate';
import { auditEvent } from '#server/utils/audit';
import { all } from '#server/utils/result';
import {
  EMAIL_AUDIENCES,
  EMAIL_BATCH_MAX,
  MESSAGE_TYPES,
  NOTE_MAX,
  NOTE_POSITIONS,
  buildEmail,
  emailTargets,
  messageTypesFor,
} from '#server/utils/messages';

// Bulk sending by email. Sharing from the phone stays the default way; this only saves the
// guardian from sharing every link by hand. Sent to people with an
// address, marked "sent" and journaled like any other message. With
// `participationIds`, to the chosen people only.
const bodySchema = z.object({
  type: z.enum(MESSAGE_TYPES),
  audience: z.enum(EMAIL_AUDIENCES).default('unsent'),
  // The chosen participants only, whether already marked as sent or not.
  participationIds: z
    .array(z.string().min(1))
    .min(1)
    .max(EMAIL_BATCH_MAX)
    .optional(),
  // The organiser's own words, added to every email of this send.
  note: z.string().max(NOTE_MAX).default(''),
  notePosition: z.enum(NOTE_POSITIONS).default('after'),
});

export default defineEventHandler(async (event) => {
  const { user, group, db, edition, rules } = await requireEdition(event);
  const { type, audience, participationIds, note, notePosition } =
    await validatedBody(event, bodySchema);
  if (!messageTypesFor(edition.status, edition.drawMode).includes(type)) {
    throw createError({
      statusCode: 409,
      statusMessage: 'message_not_available',
    });
  }
  if (!emailConfigured(event)) {
    throw createError({
      statusCode: 503,
      statusMessage: 'email_not_configured',
    });
  }
  const [people, rows] = await Promise.all([
    listParticipants(db, edition.id),
    db
      .select()
      .from(participations)
      .where(eq(participations.secretSantaId, edition.id)),
  ]);
  const { targets, withoutEmail, left } = emailTargets(
    people,
    audience,
    participationIds,
  );
  if (participationIds && targets.length === 0) {
    throw createError({ statusCode: 409, statusMessage: 'email_missing' });
  }
  if (targets.length === 0) return { sent: 0, withoutEmail, left };

  // The email is signed by the organiser who sends it (their first name).
  const sender = (await findAccountById(db, user.accountId))?.firstName ?? null;
  const dataKey = await dataKeyOf(event);
  const emails = await Promise.all(
    targets.map(async (person) => {
      const row = rows.find((r) => r.id === person.participationId);
      if (!row) throw createError({ statusCode: 500 });
      const email = unwrap(
        buildEmail(
          type,
          {
            firstName: person.firstName,
            groupName: group.name,
            sender,
            editionLabel: edition.label,
            link: await personalLink(event, row, dataKey),
            budget: rules.budget,
            eventDate: rules.eventDate,
            // « Devine qui » is on: a line in « Tirage fait » (22.17).
            guessEndsAt:
              edition.guessMode === 'none' ? null : edition.guessEndsAt,
            guessTimeZone: edition.guessTimeZone,
            guessMode: edition.guessMode as 'none' | 'santa' | 'all',
            christmas: group.category === 'christmas',
          },
          person.language,
          note,
          notePosition,
        ),
      );
      return { ...email, to: person.email };
    }),
  );
  unwrap(await sendEmails(event, emails));

  const events = unwrap(
    all(
      targets.map((person) =>
        auditEvent(
          {
            type: 'message_sent',
            groupId: group.id,
            editionId: edition.id,
            personId: person.id,
            actor: user.role,
            meta: { messageType: type, via: 'email' },
          },
          { id: newId, now: nowIso },
        ),
      ),
    ),
  );
  // One statement per row: D1 caps a statement at 100 bound parameters.
  await db.batch([
    db
      .update(participations)
      .set({ messageSentAt: nowIso() })
      .where(
        inArray(
          participations.id,
          targets.map((p) => p.participationId),
        ),
      ),
    ...events.map((row) => db.insert(auditLog).values(auditInsert(row))),
  ]);
  return { sent: targets.length, withoutEmail, left };
});
