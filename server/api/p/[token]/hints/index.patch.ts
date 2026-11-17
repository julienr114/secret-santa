import { z } from 'zod';
import { findPortrait, savePortrait } from '#server/database/hints';
import { requirePersonalLink } from '#server/http/personal';
import { hintsPayload, tellRequesterIfAsked } from '#server/http/hints';
import { unwrap } from '#server/http/errors';
import { validatedBody } from '#server/http/validate';
import { applyPortraitPatch, canEditHints } from '#server/utils/hints';

// One answer or one text at a time (README 22.11). Not journaled: the
// event `wishes_updated` is gone, the parade to a stolen link stays to
// regenerate it.
const bodySchema = z.object({
  answers: z.record(z.string(), z.unknown()).optional(),
  texts: z.record(z.string(), z.unknown()).optional(),
});

export default defineEventHandler(async (event) => {
  const ctx = await requirePersonalLink(event);
  const { db, participation, edition, rules } = ctx;
  unwrap(canEditHints(edition.status, rules.giftHints));
  const patch = await validatedBody(event, bodySchema);
  const portrait = unwrap(
    applyPortraitPatch(await findPortrait(db, participation.id), patch),
  );
  await savePortrait(db, participation.id, portrait);
  await tellRequesterIfAsked(event, ctx);
  return hintsPayload(ctx);
});
