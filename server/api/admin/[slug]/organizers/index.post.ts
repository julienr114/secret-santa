import { z } from 'zod';
import { addOrganizer } from '#server/database/groups';
import { requireGroupAccess } from '#server/http/auth';
import { nowIso } from '#server/http/context';
import { validatedBody } from '#server/http/validate';
import { accountEmailSchema } from '#server/utils/accounts';
import { nameSchema } from '#server/utils/people';

// Adds an organiser by their first name and address (ticket 161, V3Fete
// OrganisateurNouveau). They log in with a link sent to that address:
// nothing else to set up. A new account takes that first name; an
// account that exists keeps its own.
const bodySchema = z.object({
  firstName: nameSchema,
  email: accountEmailSchema,
});

export default defineEventHandler(async (event) => {
  const { group, db } = await requireGroupAccess(event);
  const { firstName, email } = await validatedBody(event, bodySchema);
  const organizer = await addOrganizer(db, {
    groupId: group.id,
    firstName,
    email,
    now: nowIso(),
  });
  setResponseStatus(event, 201);
  return { organizer };
});
