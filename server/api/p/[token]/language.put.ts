import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { persons } from '#server/database/schema';
import { recordEvent } from '#server/database/audit';
import { requirePersonalLink } from '#server/http/personal';
import { validatedBody } from '#server/http/validate';
import { languageSchema } from '#server/utils/people';

// A participant chooses the language of their own page, messages and
// emails. Like the avatar, the person comes from the link, never from the
// request. Allowed at any time: it changes no result and no list, and it
// is written to the journal like every change made with a link.
const bodySchema = z.object({ language: languageSchema });

export default defineEventHandler(async (event) => {
  const { db, person, group, edition } = await requirePersonalLink(event);
  const { language } = await validatedBody(event, bodySchema);
  if (language === person.language) return { language };
  await db.update(persons).set({ language }).where(eq(persons.id, person.id));
  await recordEvent(db, {
    type: 'language_changed',
    groupId: group.id,
    editionId: edition.id,
    personId: person.id,
    actor: 'participant',
    meta: { language },
  });
  return { language };
});
