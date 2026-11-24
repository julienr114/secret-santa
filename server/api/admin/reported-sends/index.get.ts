import { useDb } from '#server/database/client';
import { reportedParties } from '#server/database/emailBlocks';
import { requireSuperAdmin } from '#server/http/auth';

// The sends reported by their readers (ticket 130), by event and by
// account, for the super-admin, who may cut the emails of an event.
export default defineEventHandler(async (event) => {
  await requireSuperAdmin(event);
  return { parties: await reportedParties(useDb(event)) };
});
