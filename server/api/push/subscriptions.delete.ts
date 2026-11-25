import { z } from 'zod';
import { useDb } from '#server/database/client';
import { unsubscribeDevice } from '#server/database/push';
import { requireAccount } from '#server/http/auth';
import { validatedBody } from '#server/http/validate';

// « Notifications » turned off on this phone (ticket 124).
const bodySchema = z.object({ endpoint: z.string().max(1000) });

export default defineEventHandler(async (event) => {
  const user = await requireAccount(event);
  const { endpoint } = await validatedBody(event, bodySchema);
  await unsubscribeDevice(useDb(event), user.accountId, endpoint);
  return { ok: true };
});
