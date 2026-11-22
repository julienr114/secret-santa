import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { secretSantas } from '#server/database/schema';
import { countActiveMembers } from '#server/database/people';
import { requireEdition } from '#server/http/edition';
import { validatedBody } from '#server/http/validate';
import { MAX_PARTY_MEMBERS } from '#server/utils/parties';
import {
  INVITE_MESSAGE_MAX,
  defaultInvitePlaces,
  generateInviteCode,
} from '#server/utils/invite';

// Opens, sets, renews or closes the invitation link of a Secret Santa
// (ticket 116). Opening takes an optional last day, a number of places (by
// default, what the event can still take) and the organiser's words for its
// page. Renewing gives a new code: the old link stops working. The link
// lives until the draw: once drawn, nothing opens it again.
const bodySchema = z.object({
  open: z.boolean(),
  renew: z.boolean().default(false),
  until: z.iso.date().nullable().optional(),
  places: z.number().int().min(1).max(MAX_PARTY_MEMBERS).optional(),
  message: z.string().trim().max(INVITE_MESSAGE_MAX).nullable().optional(),
});

export default defineEventHandler(async (event) => {
  const { db, group, edition: santa } = await requireEdition(event);
  const body = await validatedBody(event, bodySchema);
  if (!body.open) {
    await db
      .update(secretSantas)
      .set({ inviteCode: null, inviteUntil: null, invitePlaces: null })
      .where(eq(secretSantas.id, santa.id));
    return { inviteCode: null };
  }
  if (santa.status !== 'preparing') {
    throw createError({ statusCode: 409, statusMessage: 'invite_drawn' });
  }
  const settings = {
    inviteCode:
      body.renew || !santa.inviteCode ? generateInviteCode() : santa.inviteCode,
    inviteUntil:
      body.until !== undefined ? body.until : (santa.inviteUntil ?? null),
    invitePlaces:
      body.places ??
      santa.invitePlaces ??
      defaultInvitePlaces(await countActiveMembers(db, group.id)),
    inviteMessage:
      body.message !== undefined
        ? body.message || null
        : (santa.inviteMessage ?? null),
  };
  await db
    .update(secretSantas)
    .set(settings)
    .where(eq(secretSantas.id, santa.id));
  return settings;
});
