import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { offListOfLists } from '#server/database/claims';
import { claimedIdeas, peopleOfLists } from '#server/database/lists';
import {
  giftListIdeas,
  giftListPeople,
  giftOffList,
} from '#server/database/schema';
import { requireHeldList } from '#server/http/lists';
import { validatedBody } from '#server/http/validate';
import {
  ideasChangingPerson,
  mergeLines,
  orderWrites,
} from '#shared/utils/reorder';

// The order of a list (lot 24 ter, README 22.20): its people, each with
// their lines, as those who hold it dragged them. The whole order comes
// at once; only what moved is written. The gifts not on the list take
// their place among the ideas; they stay with their person, as an idea
// someone gives does (Julien, 24 November 2026). When the list is no
// longer the one the screen had (a line written or deleted meanwhile),
// nothing moves: the screen reads the list again.
const bodySchema = z.object({
  order: z
    .array(
      z.object({
        id: z.string().min(1),
        ideas: z.array(z.string().min(1)).max(500),
      }),
    )
    .max(200),
});

export default defineEventHandler(async (event) => {
  const { db, list } = await requireHeldList(event);
  const { order } = await validatedBody(event, bodySchema);
  const [people, offList] = await Promise.all([
    peopleOfLists(db, [list.id]).then((byList) => byList.get(list.id) ?? []),
    offListOfLists(db, [list.id]),
  ]);
  const gifts = new Set(offList.map((gift) => gift.id));
  const current = people.map((person) => ({
    id: person.id,
    ideas: mergeLines(
      person.ideas,
      offList.filter((gift) => gift.listPersonId === person.id),
    ),
  }));
  const writes = orderWrites(current, order);
  if (!writes) {
    throw createError({ statusCode: 409, statusMessage: 'list_changed' });
  }
  const away = ideasChangingPerson(current, writes);
  if (
    away.some((id) => gifts.has(id)) ||
    (away.length > 0 && (await claimedIdeas(db, away)).size > 0)
  ) {
    throw createError({ statusCode: 409, statusMessage: 'idea_claimed' });
  }
  const [first, ...rest] = [
    ...writes.people.map(({ id, position }) =>
      db
        .update(giftListPeople)
        .set({ position })
        .where(eq(giftListPeople.id, id)),
    ),
    ...writes.ideas.map(({ id, listPersonId, position }) =>
      gifts.has(id)
        ? db.update(giftOffList).set({ position }).where(eq(giftOffList.id, id))
        : db
            .update(giftListIdeas)
            .set({ listPersonId, position })
            .where(eq(giftListIdeas.id, id)),
    ),
  ];
  if (first) await db.batch([first, ...rest]);
  return { ok: true };
});
