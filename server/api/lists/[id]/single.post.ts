import { makeListSingle, peopleOfLists } from '#server/database/lists';
import { requireHeldList } from '#server/http/lists';
import { singleRefusal } from '#server/utils/lists';

// « Une liste sans personne » (lot 27 bis, README 22.20): for a wedding,
// a housewarming, the ideas one under the other. An empty list becomes
// one; so does a list with one person, whose ideas become the list's.
// Only while it is not shared.
export default defineEventHandler(async (event) => {
  const { db, list } = await requireHeldList(event);
  const people = (await peopleOfLists(db, [list.id])).get(list.id) ?? [];
  const refusal = singleRefusal({ sharedAt: list.sharedAt, people });
  if (refusal) throw createError({ statusCode: 409, statusMessage: refusal });
  // Already one: a second tap.
  if (people[0]?.member.placeholder) return { ok: true };
  await makeListSingle(db, list, people[0]?.id ?? null);
  return { ok: true };
});
