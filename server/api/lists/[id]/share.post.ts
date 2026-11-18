import { z } from 'zod';
import { peopleOfLists, updateList } from '#server/database/lists';
import { newId, nowIso } from '#server/http/context';
import { requireHeldList } from '#server/http/lists';
import { validatedBody } from '#server/http/validate';
import { shareMissing } from '#server/utils/lists';

// « Partager » (README 22.19): the public link, made at the first share
// once the list has a name and someone on it; « Créer un nouveau lien »
// replaces it, the old one stops working, the ticks stay.
const bodySchema = z.object({ renew: z.boolean().default(false) });

export default defineEventHandler(async (event) => {
  const { db, list } = await requireHeldList(event);
  const { renew } = await validatedBody(event, bodySchema);
  const people = (await peopleOfLists(db, [list.id])).get(list.id) ?? [];
  const missing = shareMissing({
    title: list.title,
    peopleCount: people.length,
  });
  if (missing.length > 0) {
    throw createError({
      statusCode: 409,
      statusMessage: 'list_incomplete',
      data: { missing },
    });
  }
  if (list.shareToken && !renew) return { token: list.shareToken };
  const token = newId();
  await updateList(db, list.id, {
    shareToken: token,
    sharedAt: list.sharedAt ?? nowIso(),
  });
  return { token };
});
