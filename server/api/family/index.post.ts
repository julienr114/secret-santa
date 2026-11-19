import { useDb } from '#server/database/client';
import { createMember } from '#server/database/lists';
import { requireAccount } from '#server/http/auth';
import { validatedBody } from '#server/http/validate';
import { newMemberSchema } from '#server/utils/listSchemas';

// « Ajouter quelqu'un » from the page « Mes proches » (maquette Famille):
// a person who is on no list yet.
export default defineEventHandler(async (event) => {
  const user = await requireAccount(event);
  const member = await validatedBody(event, newMemberSchema);
  const id = await createMember(useDb(event), user.accountId, member);
  setResponseStatus(event, 201);
  return { id };
});
