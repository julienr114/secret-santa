import { findAccountById } from '#server/database/accounts';
import { useDb } from '#server/database/client';
import { loadPastEvents } from '#server/database/pastYears';
import { requireAccount } from '#server/http/auth';
import { dataKeyOf } from '#server/http/context';
import { pastByYear } from '#shared/utils/years';

// « Les événements passés » (ticket 108, V3FetesPassees): by year, a line
// per event and year over, with what I did there. My own result only.
export default defineEventHandler(async (event) => {
  const user = await requireAccount(event);
  const db = useDb(event);
  const account = await findAccountById(db, user.accountId);
  if (!account) {
    throw createError({ statusCode: 403, statusMessage: 'forbidden' });
  }
  return {
    years: pastByYear(
      await loadPastEvents(db, account, await dataKeyOf(event)),
    ),
  };
});
