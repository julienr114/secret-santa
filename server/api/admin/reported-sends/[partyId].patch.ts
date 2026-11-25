import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { useDb } from '#server/database/client';
import { parties } from '#server/database/schema';
import { requireSuperAdmin } from '#server/http/auth';
import { validatedBody } from '#server/http/validate';

// Cutting the emails of an event (ticket 130): what its organisers send
// stops; sharing the links from the phone carries on.
const bodySchema = z.object({ emailsOff: z.boolean() });

export default defineEventHandler(async (event) => {
  await requireSuperAdmin(event);
  const { emailsOff } = await validatedBody(event, bodySchema);
  await useDb(event)
    .update(parties)
    .set({ emailsOff })
    .where(eq(parties.id, getRouterParam(event, 'partyId') ?? ''));
  return { ok: true };
});
