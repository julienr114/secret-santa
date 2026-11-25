import { z } from 'zod';
import { wasDrawCancelled } from '#server/database/audit';
import { isSwitchOn } from '#server/database/switches';
import { sendDrawEmails } from '#server/http/drawEmails';
import { emailConfigured } from '#server/http/email';
import { requireEdition } from '#server/http/edition';
import { validatedBody } from '#server/http/validate';

// « Renvoyer les emails » after a sending that failed, and the email of
// someone whose address was added after the draw (ticket 169): the
// message of the draw, from the app, to those not written to yet.
const bodySchema = z.object({
  participationIds: z.array(z.string().min(1)).min(1).max(500).optional(),
});

export default defineEventHandler(async (event) => {
  const { user, group, db, edition, rules } = await requireEdition(event);
  if (edition.status !== 'drawn') {
    throw createError({ statusCode: 409, statusMessage: 'invalid_transition' });
  }
  const { participationIds } = await validatedBody(event, bodySchema);
  if (await isSwitchOn(db, 'emails')) {
    throw createError({ statusCode: 503, statusMessage: 'emails_paused' });
  }
  if (!emailConfigured(event)) {
    throw createError({
      statusCode: 503,
      statusMessage: 'email_not_configured',
    });
  }
  const result = await sendDrawEmails(event, {
    db,
    group,
    edition,
    rules,
    type: (await wasDrawCancelled(db, group.id, edition.id))
      ? 'redraw'
      : 'drawn',
    only: participationIds,
    accountId: user.accountId,
  });
  if (result.failed) {
    throw createError({ statusCode: 503, statusMessage: result.failed });
  }
  return { sent: result.sent };
});
