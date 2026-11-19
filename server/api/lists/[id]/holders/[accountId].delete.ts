import { holdersOfLists, removeHolder } from '#server/database/lists';
import { requireHeldList } from '#server/http/lists';
import { holderRemovalRefusal } from '#server/utils/listAccess';

// « Retirer » one of those who hold the list (README 22.20): anyone may
// take another off, or leave; the last one cannot.
export default defineEventHandler(async (event) => {
  const { db, list } = await requireHeldList(event);
  const target = getRouterParam(event, 'accountId') ?? '';
  const holders = (await holdersOfLists(db, [list.id])).get(list.id) ?? [];
  const refusal = holderRemovalRefusal(
    holders.map((holder) => holder.accountId),
    target,
  );
  if (refusal) {
    throw createError({
      statusCode: refusal === 'last' ? 409 : 404,
      statusMessage: `holder_${refusal}`,
    });
  }
  await removeHolder(db, list.id, target);
  return { ok: true };
});
