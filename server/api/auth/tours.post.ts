import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { useDb } from '#server/database/client';
import { accounts } from '#server/database/schema';
import { requireAccount } from '#server/http/auth';
import { validatedBody } from '#server/http/validate';

// The visit of a new list, seen or skipped (ticket 149): kept on the
// account, so it never comes back, on any device. The visit from a
// Secret Santa also counts for the note on the first line.
const bodySchema = z.object({
  seen: z.enum(['visit', 'firstLine', 'both']),
});

export default defineEventHandler(async (event) => {
  const user = await requireAccount(event);
  const { seen } = await validatedBody(event, bodySchema);
  const db = useDb(event);
  await db
    .update(accounts)
    .set({
      ...(seen !== 'firstLine' && { listTourSeen: true }),
      ...(seen !== 'visit' && { firstLineNoteSeen: true }),
    })
    .where(eq(accounts.id, user.accountId));
  return { ok: true };
});
