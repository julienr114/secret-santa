import { z } from 'zod';
import { loadPastYear } from '#server/database/pastYears';
import { dataKeyOf } from '#server/http/context';
import { notFound } from '#server/http/errors';
import { requireParty } from '#server/http/party';

// A year over of an event (ticket 108, V3FeteAnneePassee), for its members
// and its organisers, read only. A year not over is not here: 404.
const yearSchema = z.coerce.number().int().min(2000).max(2100);

export default defineEventHandler(async (event) => {
  const { db, party, account, role } = await requireParty(event);
  const year = yearSchema.safeParse(getRouterParam(event, 'year'));
  if (!year.success) throw notFound();
  const page = await loadPastYear(db, {
    party,
    account,
    role,
    year: year.data,
    dataKey: await dataKeyOf(event),
  });
  if (!page) throw notFound();
  return page;
});
