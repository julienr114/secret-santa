import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { peopleOfLists } from '#server/database/lists';
import { giftListIdeas, giftListPeople } from '#server/database/schema';
import { requireHeldList } from '#server/http/lists';
import { validatedBody } from '#server/http/validate';
import { orderWrites } from '#shared/utils/reorder';

// The order of a list (lot 24 ter, README 22.20): its people, each with
// their ideas, as those who hold it dragged them. The whole order comes
// at once; only what moved is written. An idea that changes person keeps
// what was ticked. When the list is no longer the one the screen had (an
// idea written or deleted meanwhile), nothing moves: the screen reads
// the list again.
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
  const people = (await peopleOfLists(db, [list.id])).get(list.id) ?? [];
  const writes = orderWrites(
    people.map((person) => ({
      id: person.id,
      ideas: person.ideas.map((idea) => idea.id),
    })),
    order,
  );
  if (!writes) {
    throw createError({ statusCode: 409, statusMessage: 'list_changed' });
  }
  const [first, ...rest] = [
    ...writes.people.map(({ id, position }) =>
      db
        .update(giftListPeople)
        .set({ position })
        .where(eq(giftListPeople.id, id)),
    ),
    ...writes.ideas.map(({ id, listPersonId, position }) =>
      db
        .update(giftListIdeas)
        .set({ listPersonId, position })
        .where(eq(giftListIdeas.id, id)),
    ),
  ];
  if (first) await db.batch([first, ...rest]);
  return { ok: true };
});
