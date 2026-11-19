import { holdersOfLists, removeHolder } from '#server/database/lists';
import { requireHeldList } from '#server/http/lists';
import { holderRemovalRefusal } from '#server/utils/listAccess';

// « Retirer » one of those who hold the list (README 22.20, lot 25 bis):
// those who manage it take anyone off; anyone may leave; the last one who
// manages cannot go.
export default defineEventHandler(async (event) => {
  const { db, user, list } = await requireHeldList(event);
  const target = getRouterParam(event, 'accountId') ?? '';
  const holders = (await holdersOfLists(db, [list.id])).get(list.id) ?? [];
  const refusal = holderRemovalRefusal(holders, user.accountId, target);
  if (refusal) {
    throw createError({
      statusCode: { forbidden: 403, unknown: 404, last: 409 }[refusal],
      statusMessage:
        refusal === 'forbidden' ? 'not_manager' : `holder_${refusal}`,
    });
  }
  await removeHolder(db, list.id, target);
  return { ok: true };
});
