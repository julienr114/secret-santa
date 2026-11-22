import { setIdeaGivers } from '#server/http/claims';
import { requireHeldList } from '#server/http/lists';
import { validatedBody } from '#server/http/validate';
import { giversSchema } from '#server/utils/listSchemas';

// « Qui l'offre ? » (21 November 2026): those who hold a list say who
// gives an idea, in its place: someone the app knows, a first name
// written, or a first name with an address. Nobody is told, by email or
// otherwise. The answer is the same whether an address has an account
// or not.
export default defineEventHandler(async (event) => {
  const { db, user, list } = await requireHeldList(event);
  await setIdeaGivers(
    db,
    list.id,
    user.accountId,
    getRouterParam(event, 'ideaId') ?? '',
    await validatedBody(event, giversSchema),
  );
  return { ok: true };
});
