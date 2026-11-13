import { z } from 'zod';
import { replaceWishes } from '#server/database/wishes';
import { recordEvent } from '#server/database/audit';
import { requirePersonalLink } from '#server/http/personal';
import { unwrap } from '#server/http/errors';
import { validatedBody } from '#server/http/validate';
import { canEditWishes } from '#server/utils/personal';
import { normalizeWishes } from '#server/utils/wishes';
import { localeOf } from '#shared/i18n';

// Replaces the whole list (README 6 bis.3). Journaled every time, with the
// number of ideas and never their content.
const bodySchema = z.object({ wishes: z.array(z.unknown()).max(200) });

export default defineEventHandler(async (event) => {
  const { db, participation, edition, person, group, rules } =
    await requirePersonalLink(event);
  unwrap(canEditWishes(edition.status, rules));
  const body = await validatedBody(event, bodySchema);
  const list = unwrap(normalizeWishes(body.wishes, rules));
  await replaceWishes(db, participation.id, list);
  await recordEvent(db, {
    type: 'wishes_updated',
    groupId: group.id,
    editionId: edition.id,
    personId: person.id,
    actor: 'participant',
    meta: { count: list.length },
  });
  return {
    wishes: list.map(({ label, url }) => ({ label, url })),
    maxWishes: rules.maxWishes,
    editable: true,
    language: localeOf(person.language),
  };
});
