import { z } from 'zod';
import { markSeenByEmail } from '#server/database/news';
import { nowIso } from '#server/http/context';
import { requirePersonalLink } from '#server/http/personal';
import { validatedBody } from '#server/http/validate';

// My page of a Secret Santa opened (ticket 120): the news of the account
// of this person about it are seen, but the envelope's, seen once it is
// opened (reveal.post.ts), as the line says. A POST, since reading never
// writes (README 8.3), and link previews only read.
const bodySchema = z.object({ target: z.enum(['santa']) });

export default defineEventHandler(async (event) => {
  const { db, person, edition } = await requirePersonalLink(event, {
    afterTheYear: true,
  });
  const { target } = await validatedBody(event, bodySchema);
  await markSeenByEmail(db, person.email, target, edition.id, nowIso(), [
    'hint_request',
    'receiver_ideas',
    'revealed',
  ]);
  return { ok: true };
});
