import { z } from 'zod';
import { useDb } from '#server/database/client';
import { requireAccount } from '#server/http/auth';
import { blockedAddresses } from '#server/http/emailStatus';
import { validatedBody } from '#server/http/validate';
import { blockWarning } from '#server/utils/stopEmail';

// Whether addresses typed by someone logged in receive nothing (ticket
// 130, StopSaisie, StopEnvoi): that the person asked for it, or that the
// address does not seem to exist. Never when, nor why else.
const bodySchema = z.object({
  emails: z.array(z.string().trim().max(254)).max(100),
});

export default defineEventHandler(async (event) => {
  await requireAccount(event);
  const { emails } = await validatedBody(event, bodySchema);
  const blocked = await blockedAddresses(event, useDb(event), emails);
  return {
    warnings: Object.fromEntries(
      [...blocked].map(([email, cause]) => [email, blockWarning(cause)]),
    ),
  };
});
