import { z } from 'zod';
import { holdersOfLists, setHolderLevel } from '#server/database/lists';
import { requireHeldList } from '#server/http/lists';
import { validatedBody } from '#server/http/validate';
import { HOLDER_LEVELS, levelChangeRefusal } from '#server/utils/listAccess';

// Changing the level of one of those who hold the list (lot 25 bis,
// README 22.20, maquette ListeTeneursNiveau): for those who manage it;
// the last one who manages stays so.
const bodySchema = z.object({ level: z.enum(HOLDER_LEVELS) });

export default defineEventHandler(async (event) => {
  const { db, user, list } = await requireHeldList(event);
  const { level } = await validatedBody(event, bodySchema);
  const target = getRouterParam(event, 'accountId') ?? '';
  const holders = (await holdersOfLists(db, [list.id])).get(list.id) ?? [];
  const refusal = levelChangeRefusal(holders, user.accountId, target, level);
  if (refusal) {
    throw createError({
      statusCode: { forbidden: 403, unknown: 404, last_manager: 409 }[refusal],
      statusMessage:
        refusal === 'forbidden' ? 'not_manager' : `holder_${refusal}`,
    });
  }
  await setHolderLevel(db, list.id, target, level);
  return { ok: true };
});
