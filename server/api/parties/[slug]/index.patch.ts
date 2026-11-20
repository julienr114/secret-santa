import { desc, eq } from 'drizzle-orm';
import { parties, partyYears } from '#server/database/schema';
import { requireParty } from '#server/http/party';
import { validatedBody } from '#server/http/validate';
import { partyPatchSchema, usualDateOf } from '#server/utils/parties';

// The settings of the party itself (V3FeteReglages, ticket 104): its
// category, its date (the usual day, and the date of its year), whether
// it comes back each year. Organisers only.
export default defineEventHandler(async (event) => {
  const { db, party } = await requireParty(event, 'organiser');
  const { date, ...body } = await validatedBody(event, partyPatchSchema);
  const [year] = await db
    .select({ id: partyYears.id })
    .from(partyYears)
    .where(eq(partyYears.partyId, party.id))
    .orderBy(desc(partyYears.year))
    .limit(1);
  const set = {
    ...body,
    ...(date === undefined ? {} : { usualDate: usualDateOf(date) }),
  };
  await db.batch([
    db.update(parties).set(set).where(eq(parties.id, party.id)),
    ...(date !== undefined && year
      ? [
          db
            .update(partyYears)
            .set({ date, year: Number(date.slice(0, 4)) })
            .where(eq(partyYears.id, year.id)),
        ]
      : []),
  ]);
  return { ok: true };
});
