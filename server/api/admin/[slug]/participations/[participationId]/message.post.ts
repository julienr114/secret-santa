import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { participations } from '#server/database/schema';
import { personalLink } from '#server/database/participations';
import { recordEvent } from '#server/database/audit';
import { requireParticipation } from '#server/http/participation';
import { dataKeyOf, nowIso } from '#server/http/context';
import { unwrap } from '#server/http/errors';
import { validatedBody } from '#server/http/validate';
import { canSendLinks } from '#server/utils/editions';
import { MESSAGE_TYPES, buildMessage } from '#server/utils/messages';
import { mergeRules } from '#server/utils/rules';

// The guardian shares a message (README 13): we build the text with the
// personal link, mark the participant as "sent" and journal it.
const bodySchema = z.object({
  type: z.enum(MESSAGE_TYPES),
  via: z.enum(['share', 'copy']),
});

export default defineEventHandler(async (event) => {
  const { user, group, db, edition, person, participation } =
    await requireParticipation(event);
  if (!canSendLinks(edition.status)) {
    throw createError({ statusCode: 409, statusMessage: 'links_not_open' });
  }
  const { type, via } = await validatedBody(event, bodySchema);
  const rules = unwrap(mergeRules(group.rules, edition.rulesOverride));
  const link = await personalLink(event, participation, await dataKeyOf(event));
  const text = unwrap(
    buildMessage(type, {
      firstName: person.firstName,
      groupName: group.name,
      editionLabel: edition.label,
      link,
      budget: rules.budget,
      eventDate: rules.eventDate,
    }),
  );
  await db
    .update(participations)
    .set({ messageSentAt: nowIso() })
    .where(eq(participations.id, participation.id));
  await recordEvent(db, {
    type: 'message_sent',
    groupId: group.id,
    editionId: edition.id,
    personId: person.id,
    actor: user.role,
    meta: { messageType: type, via },
  });
  return { text, link };
});
