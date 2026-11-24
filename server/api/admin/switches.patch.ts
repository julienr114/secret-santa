import { z } from 'zod';
import { useDb } from '#server/database/client';
import { setSwitch } from '#server/database/switches';
import { requireSuperAdmin } from '#server/http/auth';
import { validatedBody } from '#server/http/validate';

// Super-admin only: the emergency switches (docs/spec/v3/administration.md,
// « En cas d'urgence »), one at a time. « Suspendre les nouveaux Secret
// Santa »: those that exist carry on, lists may still be created.
// « Suspendre les emails »: none leaves but the login links. « Suspendre
// les inscriptions »: no new account, no new event (ticket 129).
const bodySchema = z
  .object({
    newSecretSantas: z.boolean(),
    emails: z.boolean(),
    signups: z.boolean(),
  })
  .partial()
  .refine((body) => Object.keys(body).length === 1, 'one switch at a time');

const NAMES = {
  newSecretSantas: 'new_secret_santas',
  emails: 'emails',
  signups: 'signups',
} as const;

export default defineEventHandler(async (event) => {
  await requireSuperAdmin(event);
  const body = await validatedBody(event, bodySchema);
  const [key, on] = (
    Object.entries(body) as [keyof typeof NAMES, boolean][]
  )[0]!;
  await setSwitch(useDb(event), NAMES[key], on);
  return { ok: true };
});
