import { eq } from 'drizzle-orm';
import { parties, partyYears } from '#server/database/schema';
import { loadYears, timelineOf } from '#server/database/years';
import { newId, nowIso } from '#server/http/context';
import { requireParty } from '#server/http/party';
import { validatedBody } from '#server/http/validate';
import { partyPatchSchema, usualDateOf } from '#server/utils/parties';
import { yearIsOver } from '#shared/utils/years';

// The settings of the party itself (V3FeteReglages, ticket 104): its
// category, its date (the usual day, and the date of its year), whether
// it comes back each year. Organisers only. A year over keeps its date
// (ticket 108): the date given is then that of a new year.
export default defineEventHandler(async (event) => {
  const { db, party } = await requireParty(event, 'organiser');
  const { date, ...body } = await validatedBody(event, partyPatchSchema);
  const years = await loadYears(db, [party.id]);
  const timeline = timelineOf(party, years);
  const latest = years.toSorted((a, b) => b.year - a.year)[0];
  const open =
    latest && !yearIsOver(timeline, latest.year) ? latest : undefined;
  const set = {
    ...body,
    ...(date === undefined ? {} : { usualDate: usualDateOf(date) }),
  };
  const year = date === undefined ? 0 : Number(date.slice(0, 4));
  const made = years.find((row) => row.year === year);
  if (date !== undefined && !open && made && yearIsOver(timeline, year)) {
    throw createError({ statusCode: 409, statusMessage: 'year_over' });
  }
  await db.batch([
    db.update(parties).set(set).where(eq(parties.id, party.id)),
    ...(date === undefined
      ? []
      : open
        ? [
            db
              .update(partyYears)
              .set({ date, year })
              .where(eq(partyYears.id, open.id)),
          ]
        : made
          ? [
              db
                .update(partyYears)
                .set({ date })
                .where(eq(partyYears.id, made.id)),
            ]
          : [
              db.insert(partyYears).values({
                id: newId(),
                partyId: party.id,
                year,
                date,
                createdAt: nowIso(),
              }),
            ]),
  ]);
  return { ok: true };
});
