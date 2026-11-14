import { z } from 'zod';
import { and, count, eq } from 'drizzle-orm';
import { groups, persons } from '#server/database/schema';
import { requireGroupAccess } from '#server/http/auth';
import { validatedBody } from '#server/http/validate';
import { MAX_PARTICIPANTS } from '#server/utils/editions';
import {
  INVITE_MESSAGE_MAX,
  defaultInvitePlaces,
  generateInviteCode,
} from '#server/utils/invite';

// Opens, sets, renews or closes the invitation link of a group. Opening
// takes an optional last day, a number of places (by default, what a
// draw can still take) and the organiser's words for its page. Renewing gives a new code: the old link stops
// working.
const bodySchema = z.object({
  open: z.boolean(),
  renew: z.boolean().default(false),
  until: z.iso.date().nullable().optional(),
  places: z.number().int().min(1).max(MAX_PARTICIPANTS).optional(),
  message: z.string().trim().max(INVITE_MESSAGE_MAX).nullable().optional(),
});

export default defineEventHandler(async (event) => {
  const { db, group } = await requireGroupAccess(event);
  const body = await validatedBody(event, bodySchema);
  if (!body.open) {
    await db
      .update(groups)
      .set({ inviteCode: null, inviteUntil: null, invitePlaces: null })
      .where(eq(groups.id, group.id));
    return { inviteCode: null };
  }
  const [active] = await db
    .select({ n: count() })
    .from(persons)
    .where(and(eq(persons.groupId, group.id), eq(persons.active, true)));
  const settings = {
    inviteCode:
      body.renew || !group.inviteCode ? generateInviteCode() : group.inviteCode,
    inviteUntil:
      body.until !== undefined ? body.until : (group.inviteUntil ?? null),
    invitePlaces:
      body.places ?? group.invitePlaces ?? defaultInvitePlaces(active?.n ?? 0),
    inviteMessage:
      body.message !== undefined
        ? body.message || null
        : (group.inviteMessage ?? null),
  };
  await db.update(groups).set(settings).where(eq(groups.id, group.id));
  return settings;
});
