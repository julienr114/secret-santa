import { z } from 'zod';
import { addOrganizer } from '#server/database/groups';
import { requireGroupAccess } from '#server/http/auth';
import { nowIso } from '#server/http/context';
import { validatedBody } from '#server/http/validate';
import { accountEmailSchema } from '#server/utils/accounts';

// Adds an organiser by their address. They log in with a link sent to
// that address: nothing else to set up.
const bodySchema = z.object({ email: accountEmailSchema });

export default defineEventHandler(async (event) => {
  const { group, db } = await requireGroupAccess(event);
  const { email } = await validatedBody(event, bodySchema);
  const organizer = await addOrganizer(db, {
    groupId: group.id,
    email,
    now: nowIso(),
  });
  setResponseStatus(event, 201);
  return { organizer };
});
