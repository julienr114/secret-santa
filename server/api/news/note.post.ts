import { z } from 'zod';
import { useDb } from '#server/database/client';
import { noteDismissals } from '#server/database/schema';
import { requireAccount } from '#server/http/auth';
import { nowIso } from '#server/http/context';
import { validatedBody } from '#server/http/validate';

// « Le mot de l'application » closed (ticket 120): not shown again.
const bodySchema = z.object({ noteId: z.string().min(1).max(64) });

export default defineEventHandler(async (event) => {
  const user = await requireAccount(event);
  const { noteId } = await validatedBody(event, bodySchema);
  await useDb(event)
    .insert(noteDismissals)
    .values({ accountId: user.accountId, noteId, dismissedAt: nowIso() })
    .onConflictDoNothing();
  return { ok: true };
});
