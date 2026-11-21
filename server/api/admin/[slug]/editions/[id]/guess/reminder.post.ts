import { findAccountById } from '#server/database/accounts';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { secretSantas, participations } from '#server/database/schema';
import { listParticipants } from '#server/database/editions';
import { gameMembers } from '#server/database/guesses';
import { toRemind } from '#server/utils/nudges';
import { personalLink } from '#server/database/participations';
import { recordEvent } from '#server/database/audit';
import { requireEdition } from '#server/http/edition';
import { dataKeyOf, nowIso } from '#server/http/context';
import { emailConfigured, sendEmails } from '#server/http/email';
import { unwrap } from '#server/http/errors';
import { validatedBody } from '#server/http/validate';
import { guessesOpen } from '#server/utils/guesses';
import { NOTE_MAX, buildEmail } from '#server/utils/messages';

// « Envoyer un rappel » (README 22.17, DevineRappel): as often as the
// organiser wants (Correction 15), an email to those who have not made a
// guess yet, have an address and did not pass their turn, with the
// organiser's word if any. Who has played is known, never what.
const bodySchema = z.object({
  note: z.string().max(NOTE_MAX).default(''),
  // Those ticked on « Rappeler le jeu » (Correction 16); all by default.
  participationIds: z.array(z.string().min(1)).max(100).optional(),
});

export default defineEventHandler(async (event) => {
  const { user, group, db, edition, rules } = await requireEdition(event);
  if (!guessesOpen(edition, nowIso())) {
    throw createError({ statusCode: 409, statusMessage: 'guesses_closed' });
  }
  if (!emailConfigured(event)) {
    throw createError({
      statusCode: 503,
      statusMessage: 'email_not_configured',
    });
  }
  const { note, participationIds } = await validatedBody(event, bodySchema);
  const [people, members, rows] = await Promise.all([
    listParticipants(db, edition.id),
    gameMembers(db, edition.id),
    db
      .select()
      .from(participations)
      .where(eq(participations.secretSantaId, edition.id)),
  ]);
  const left = new Set(toRemind(members).map((m) => m.id));
  const targets = people.filter(
    (p) =>
      p.email &&
      left.has(p.id) &&
      (!participationIds || participationIds.includes(p.participationId)),
  );
  if (targets.length === 0) {
    throw createError({ statusCode: 409, statusMessage: 'email_missing' });
  }
  // The email is signed by the organiser who sends it (their first name).
  const sender = (await findAccountById(db, user.accountId))?.firstName ?? null;
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
              sender,
              editionLabel: edition.label,
              link: await personalLink(event, row, dataKey),
              guessEndsAt: edition.guessEndsAt,
              guessTimeZone: edition.guessTimeZone,
              guessMode: edition.guessMode as 'none' | 'santa' | 'all',
              christmas: group.category === 'christmas',
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
  unwrap(await sendEmails(event, emails));
  // The last reminder, for « Dernier rappel le… » and the automatic one.
  await db
    .update(secretSantas)
    .set({ guessReminderSentAt: nowIso() })
    .where(eq(secretSantas.id, edition.id));
  await recordEvent(db, {
    type: 'guess_reminder_sent',
    groupId: group.id,
    editionId: edition.id,
    actor: user.role,
    meta: { count: emails.length },
  });
  return { sent: emails.length };
});
