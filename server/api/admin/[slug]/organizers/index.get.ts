import { listOrganizers } from '#server/database/groups';
import { requireGroupAccess } from '#server/http/auth';

// Who may manage the group. Super-admins can too, without being listed.
export default defineEventHandler(async (event) => {
  const { user, group, db } = await requireGroupAccess(event);
  const organizers = await listOrganizers(db, group.id);
  return {
    organizers: organizers.map((organizer) => ({
      ...organizer,
      me: organizer.accountId === user.accountId,
    })),
  };
});
