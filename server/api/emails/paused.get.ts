import { useDb } from '#server/database/client';
import { isSwitchOn } from '#server/database/switches';
import { requireAccount } from '#server/http/auth';

// Whether the emails are suspended (ticket 129, EnvoiSuspendu): the
// organiser who wants to send sees it before writing anything.
export default defineEventHandler(async (event) => {
  await requireAccount(event);
  return { paused: await isSwitchOn(useDb(event), 'emails') };
});
