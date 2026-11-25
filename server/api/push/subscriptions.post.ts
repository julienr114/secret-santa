import { z } from 'zod';
import { useDb } from '#server/database/client';
import { subscribeDevice } from '#server/database/push';
import { requireAccount } from '#server/http/auth';
import { nowIso } from '#server/http/context';
import { validatedBody } from '#server/http/validate';

// « Notifications », on this phone (ticket 124): the device the browser
// subscribed at its push service, kept for the account; one row per
// device.
const bodySchema = z.object({
  endpoint: z.url().startsWith('https://').max(1000),
  keys: z.object({
    p256dh: z.string().regex(/^[A-Za-z0-9_-]{80,100}$/),
    auth: z.string().regex(/^[A-Za-z0-9_-]{16,32}$/),
  }),
});

export default defineEventHandler(async (event) => {
  const user = await requireAccount(event);
  const body = await validatedBody(event, bodySchema);
  await subscribeDevice(
    useDb(event),
    { accountId: user.accountId, ...body },
    nowIso(),
  );
  return { ok: true };
});
