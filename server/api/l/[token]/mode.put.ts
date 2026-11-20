import { z } from 'zod';
import { findMode, saveMode } from '#server/database/anonymous';
import { requireAccount } from '#server/http/auth';
import { listOfLink } from '#server/http/listLink';
import { roleOnList } from '#server/http/lists';
import { validatedBody } from '#server/http/validate';
import { chooseMode, dismissNotice, modeView } from '#server/utils/anonymous';

// « Mode anonyme », the switch of the bar on top of a list opened by its
// link (lot 27 ter, README 22.20), and « Compris » under its note. A
// setting by account and by list, for the ticks to come: what is ticked
// already does not change. Those who hold the list have none: in their
// document they tick under their name.
const bodySchema = z.union([
  z.object({ anonymous: z.boolean() }),
  z.object({ noticeSeen: z.literal(true) }),
]);

export default defineEventHandler(async (event) => {
  const user = await requireAccount(event);
  const { db, list } = await listOfLink(event);
  const body = await validatedBody(event, bodySchema);
  const { role } = await roleOnList(db, list, user.accountId);
  if (role === 'holder') {
    throw createError({ statusCode: 409, statusMessage: 'conflict' });
  }
  const row = await findMode(db, list.id, user.accountId);
  const next =
    'anonymous' in body ? chooseMode(row, body.anonymous) : dismissNotice(row);
  await saveMode(db, list.id, user.accountId, next);
  return modeView(next);
});
