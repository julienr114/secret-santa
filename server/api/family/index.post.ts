import { useDb } from '#server/database/client';
import { countFamily } from '#server/database/caps';
import { createMember } from '#server/database/lists';
import { requireRoom } from '#server/http/caps';
import { requireAccount } from '#server/http/auth';
import { validatedBody } from '#server/http/validate';
import { newMemberSchema } from '#server/utils/listSchemas';

// « Ajouter quelqu'un » from the page « Mes proches » (maquette Famille):
// a person who is on no list yet.
export default defineEventHandler(async (event) => {
  const user = await requireAccount(event);
  const member = await validatedBody(event, newMemberSchema);
  const db = useDb(event);
  await requireRoom('family', countFamily(db, user.accountId));
  const id = await createMember(db, user.accountId, member);
  setResponseStatus(event, 201);
  return { id };
});
