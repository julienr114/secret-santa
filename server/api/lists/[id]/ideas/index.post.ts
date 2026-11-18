import { createIdea, findListPerson } from '#server/database/lists';
import { notFound } from '#server/http/errors';
import { requireHeldList } from '#server/http/lists';
import { validatedBody } from '#server/http/validate';
import { splitIdea } from '#server/utils/lists';
import { newIdeaSchema } from '#server/utils/listSchemas';

// A new idea for a person of the list, written in its empty line, after
// another one or last (README 22.19). An address in the text becomes its
// link; a line left empty is not kept.
export default defineEventHandler(async (event) => {
  const { db, list } = await requireHeldList(event);
  const body = await validatedBody(event, newIdeaSchema);
  if (!(await findListPerson(db, list.id, body.listPersonId))) throw notFound();
  const split = splitIdea(body.text);
  const url = body.url ?? split?.url ?? null;
  if (!split && !url) {
    throw createError({ statusCode: 400, statusMessage: 'empty_idea' });
  }
  const id = await createIdea(
    db,
    list.id,
    body.listPersonId,
    { text: split?.text ?? '', url },
    body.after,
  );
  setResponseStatus(event, 201);
  return { id };
});
