import { z } from 'zod';
import { useDb } from '#server/database/client';
import { markSeen } from '#server/database/news';
import { requireAccount } from '#server/http/auth';
import { nowIso } from '#server/http/context';
import { validatedBody } from '#server/http/validate';

// I opened a thing (ticket 120): its news are seen, here and on every
// dot. A POST, since reading never writes (README 8.3). Only my own news
// are touched.
const bodySchema = z.object({
  target: z.enum(['follow', 'list', 'party']),
  targetId: z.string().min(1).max(64),
});

export default defineEventHandler(async (event) => {
  const user = await requireAccount(event);
  const body = await validatedBody(event, bodySchema);
  await markSeen(
    useDb(event),
    { accountId: user.accountId, target: body.target, targetId: body.targetId },
    nowIso(),
  );
  return { ok: true };
});
