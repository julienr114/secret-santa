import { z } from 'zod';
import { useDb } from '#server/database/client';
import { setSwitch } from '#server/database/switches';
import { requireSuperAdmin } from '#server/http/auth';
import { validatedBody } from '#server/http/validate';

// Super-admin only: the emergency switches (docs/spec/v3/administration.md,
// « En cas d'urgence »). « Suspendre les nouveaux Secret Santa »: those
// that exist carry on, lists may still be created.
const bodySchema = z.object({ newSecretSantas: z.boolean() });

export default defineEventHandler(async (event) => {
  await requireSuperAdmin(event);
  const body = await validatedBody(event, bodySchema);
  await setSwitch(useDb(event), 'new_secret_santas', body.newSecretSantas);
  return { ok: true };
});
