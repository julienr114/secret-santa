import { findAccountById } from '#server/database/accounts';
import { findListByToken } from '#server/database/lists';
import { requireAccount } from '#server/http/auth';
import { useDb } from '#server/database/client';
import { nowIso } from '#server/http/context';
import { letIn } from '#server/http/entries';
import { eventItLetsIn, listOfLink } from '#server/http/listLink';
import { personFromProfile } from '#server/utils/people';

// Coming into an event by the link of one of its lists (docs/spec/v3/
// listes.md, « Arriver par le lien », ticket 117): logged in, not let in
// otherwise, the list shared with all the members of its own event, a
// place left there. The account becomes a member of that event, by the
// list, and the list opens; never of another event it is shared in. Asked
// by the page after `GET /api/l/[token]` answered `list_join`.
export default defineEventHandler(async (event) => {
  const user = await requireAccount(event);
  const db = useDb(event);
  const account = await findAccountById(db, user.accountId);
  const list = await findListByToken(db, getRouterParam(event, 'token') ?? '');
  if (!account || !list) {
    throw createError({ statusCode: 403, statusMessage: 'list_not_shared' });
  }
  try {
    // Let in already: nothing to do.
    await listOfLink(event);
    return { ok: true };
  } catch (error) {
    if ((error as { statusMessage?: string }).statusMessage !== 'list_join') {
      throw error;
    }
  }
  const party = await eventItLetsIn(db, list);
  if (!party) {
    throw createError({ statusCode: 403, statusMessage: 'list_not_shared' });
  }
  const profile = personFromProfile(account);
  await letIn(db, {
    partyId: party.id,
    newcomers: [
      {
        ...profile,
        avatarEmoji: profile.avatarEmoji ?? null,
        avatarColor: profile.avatarColor ?? null,
      },
    ],
    via: { listId: list.id },
    now: nowIso(),
  });
  setResponseStatus(event, 201);
  return { ok: true };
});
