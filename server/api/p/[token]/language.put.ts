import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { persons } from '#server/database/schema';
import { requirePersonalLink } from '#server/http/personal';
import { validatedBody } from '#server/http/validate';
import { languageSchema } from '#server/utils/people';

// A participant chooses the language of their own page, messages and
// emails. Like the avatar, the person comes from the link, never from the
// request. Allowed at any time: it changes no result and no list.
const bodySchema = z.object({ language: languageSchema });

export default defineEventHandler(async (event) => {
  const { db, person } = await requirePersonalLink(event);
  const { language } = await validatedBody(event, bodySchema);
  await db.update(persons).set({ language }).where(eq(persons.id, person.id));
  return { language };
});
