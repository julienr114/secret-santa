import { z } from 'zod';
import { eq, inArray } from 'drizzle-orm';
import { listParticipants } from '#server/database/editions';
import { personalLink } from '#server/database/participations';
import { auditLog, participations } from '#server/database/schema';
import { requireEdition } from '#server/http/edition';
import { dataKeyOf, newId, nowIso } from '#server/http/context';
import { emailConfigured, sendEmails } from '#server/http/email';
import { unwrap } from '#server/http/errors';
import { validatedBody } from '#server/http/validate';
import { auditEvent } from '#server/utils/audit';
import { all } from '#server/utils/result';
import {
  EMAIL_AUDIENCES,
  MESSAGE_TYPES,
  buildEmail,
  emailTargets,
  messageTypesFor,
} from '#server/utils/messages';

// Bulk sending by email, for groups where the super-admin switched it on.
// Sharing from the phone stays the default way; this only saves the
// guardian from sharing every link by hand. Sent to people with an
// address, marked "sent" and journaled like any other message.
const bodySchema = z.object({
  type: z.enum(MESSAGE_TYPES),
  audience: z.enum(EMAIL_AUDIENCES).default('unsent'),
});

export default defineEventHandler(async (event) => {
  const { user, group, db, edition, rules } = await requireEdition(event);
  if (!group.emailSending) {
    throw createError({ statusCode: 403, statusMessage: 'email_disabled' });
  }
  const { type, audience } = await validatedBody(event, bodySchema);
  if (!messageTypesFor(edition.status).includes(type)) {
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
      .where(eq(participations.editionId, edition.id)),
  ]);
  const { targets, withoutEmail, left } = emailTargets(people, audience);
  if (targets.length === 0) return { sent: 0, withoutEmail, left };

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
            editionLabel: edition.label,
            link: await personalLink(event, row, dataKey),
            budget: rules.budget,
            eventDate: rules.eventDate,
          },
          person.language,
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
    ...events.map((row) => db.insert(auditLog).values(row)),
  ]);
  return { sent: targets.length, withoutEmail, left };
});
