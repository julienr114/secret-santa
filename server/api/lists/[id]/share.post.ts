import { z } from 'zod';
import { peopleOfLists, updateList } from '#server/database/lists';
import { newId, nowIso } from '#server/http/context';
import { requireManagedList } from '#server/http/lists';
import { validatedBody } from '#server/http/validate';
import { SHARE_ASKS, shareChange, shareMissing } from '#server/utils/lists';

// The switch « Partage par lien » (README 22.19): on, the list has its
// public link, once it has a name and someone on it; off, the link stops
// working at once, the ticks stay, and sharing again gives the same link;
// « Changer de lien » replaces it, the old one stops working.
const bodySchema = z.object({ ask: z.enum(SHARE_ASKS).default('on') });

export default defineEventHandler(async (event) => {
  const { db, list } = await requireManagedList(event, 'share');
  const { ask } = await validatedBody(event, bodySchema);
  if (ask !== 'off') {
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
  }
  const next = shareChange(list, ask, { token: newId(), now: nowIso() });
  if (next.shareToken !== list.shareToken || next.sharedAt !== list.sharedAt) {
    await updateList(db, list.id, next);
  }
  return { token: next.shareToken, shared: next.sharedAt !== null };
});
