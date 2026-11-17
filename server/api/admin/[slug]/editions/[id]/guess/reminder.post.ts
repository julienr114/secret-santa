import { z } from 'zod';
import { and, eq, isNull } from 'drizzle-orm';
import { editions, participations } from '#server/database/schema';
import { listParticipants } from '#server/database/editions';
import { playersOf } from '#server/database/guesses';
import { personalLink } from '#server/database/participations';
import { recordEvent } from '#server/database/audit';
import { requireEdition } from '#server/http/edition';
import { dataKeyOf, nowIso } from '#server/http/context';
import { emailConfigured, sendEmails } from '#server/http/email';
import { unwrap } from '#server/http/errors';
import { validatedBody } from '#server/http/validate';
import { guessesOpen } from '#server/utils/guesses';
import { NOTE_MAX, buildEmail } from '#server/utils/messages';

// « Envoyer un rappel » (README 22.17, DevineRappel): once per edition,
// an email to those who have not made a guess yet and have an address,
// with the organiser's word if any. Who has played is known, never what.
const bodySchema = z.object({ note: z.string().max(NOTE_MAX).default('') });

export default defineEventHandler(async (event) => {
  const { user, group, db, edition, rules } = await requireEdition(event);
  if (!guessesOpen(edition, nowIso())) {
    throw createError({ statusCode: 409, statusMessage: 'guesses_closed' });
  }
  if (edition.guessReminderSentAt) {
    throw createError({
      statusCode: 409,
      statusMessage: 'guess_reminder_sent',
    });
  }
  if (!emailConfigured(event)) {
    throw createError({
      statusCode: 503,
      statusMessage: 'email_not_configured',
    });
  }
  const { note } = await validatedBody(event, bodySchema);
  const [people, players, rows] = await Promise.all([
    listParticipants(db, edition.id),
    playersOf(db, edition.id),
    db
      .select()
      .from(participations)
      .where(eq(participations.editionId, edition.id)),
  ]);
  const targets = people.filter((p) => p.email && !players.has(p.id));
  if (targets.length === 0) {
    throw createError({ statusCode: 409, statusMessage: 'email_missing' });
  }
  // Only once: two organisers cannot both send it.
  const claimed = await db
    .update(editions)
    .set({ guessReminderSentAt: nowIso() })
    .where(
      and(eq(editions.id, edition.id), isNull(editions.guessReminderSentAt)),
    )
    .returning({ id: editions.id });
  if (claimed.length === 0) {
    throw createError({
      statusCode: 409,
      statusMessage: 'guess_reminder_sent',
    });
  }
  const dataKey = await dataKeyOf(event);
  const emails = await Promise.all(
    targets.map(async (person) => {
      const row = rows.find((r) => r.id === person.participationId)!;
      return {
        ...unwrap(
          buildEmail(
            'guessReminder',
            {
              firstName: person.firstName,
              groupName: group.name,
              editionLabel: edition.label,
              link: await personalLink(event, row, dataKey),
              guessEndsAt: edition.guessEndsAt,
              guessTimeZone: edition.guessTimeZone,
            },
            person.language,
            note,
            rules.messageNotePosition,
          ),
        ),
        to: person.email!,
      };
    }),
  );
  const sent = await sendEmails(event, emails);
  if (!sent.ok) {
    // Nothing went: the reminder can be sent again.
    await db
      .update(editions)
      .set({ guessReminderSentAt: null })
      .where(eq(editions.id, edition.id));
    unwrap(sent);
  }
  await recordEvent(db, {
    type: 'guess_reminder_sent',
    groupId: group.id,
    editionId: edition.id,
    actor: user.role,
    meta: { count: emails.length },
  });
  return { sent: emails.length };
});
