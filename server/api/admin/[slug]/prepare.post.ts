import { inArray } from 'drizzle-orm';
import { participations } from '#server/database/schema';
import {
  createSecretSanta,
  listEditions,
  yearIdFor,
} from '#server/database/editions';
import { listPeople } from '#server/database/people';
import { findAccountById } from '#server/database/accounts';
import { quotaAccountOf } from '#server/database/quota';
import { recordEvent } from '#server/database/audit';
import { isSwitchOn } from '#server/database/switches';
import { loadYears, timelineOf, todayOnServer } from '#server/database/years';
import { requireGroupAccess } from '#server/http/auth';
import { dataKeyOf, nowIso } from '#server/http/context';
import { unwrap } from '#server/http/errors';
import { mergeRules } from '#server/utils/rules';
import { carriedGame } from '#server/utils/guesses';
import {
  canOrganiseSecretSanta,
  remainingSecretSantas,
} from '#server/utils/quota';
import { labelForYear, yearToPrepare } from '#shared/utils/years';

// « Préparer Noël 2027 » (ticket 108, V3AccueilAnnee, Q-008): as many
// Secret Santa as the year before, each with its participants still
// active and its settings, its date moved to the year to come. Nothing is
// drawn nor sent: they are to prepare. The limit counts each of them.
export default defineEventHandler(async (event) => {
  const { user, group, db } = await requireGroupAccess(event);
  const account = await findAccountById(db, user.accountId);
  if (!account) {
    throw createError({ statusCode: 401, statusMessage: 'unauthorized' });
  }
  const years = await loadYears(db, [group.id]);
  const timeline = timelineOf(group, years);
  const before = years.find((row) => row.year === timeline.past[0]?.year);
  const current = years.find((row) => row.year === timeline.current?.year);
  const year = yearToPrepare(
    {
      organiser: true,
      recurring: group.recurring,
      current: timeline.current,
      santas: current?.santas.length ?? 0,
      santasBefore: before?.santas.length ?? 0,
    },
    todayOnServer(),
  );
  if (year === null || !before || !timeline.current?.date) {
    throw createError({ statusCode: 409, statusMessage: 'nothing_to_prepare' });
  }
  const eventDate = timeline.current.date;
  const quota = await quotaAccountOf(db, account);
  unwrap(
    canOrganiseSecretSanta(quota, await isSwitchOn(db, 'new_secret_santas')),
  );
  if (remainingSecretSantas(quota) < before.santas.length) {
    throw createError({
      statusCode: 403,
      statusMessage: 'secret_santa_limit_reached',
    });
  }
  const editions = (await listEditions(db, group.id)).filter((edition) =>
    before.santas.some((santa) => santa.id === edition.id),
  );
  const [taking, people] = await Promise.all([
    db
      .select({
        secretSantaId: participations.secretSantaId,
        personId: participations.personId,
      })
      .from(participations)
      .where(
        inArray(
          participations.secretSantaId,
          editions.map((edition) => edition.id),
        ),
      ),
    listPeople(db, group.id),
  ]);
  const active = new Set(
    people.filter((person) => person.active).map((person) => person.id),
  );
  const dataKey = await dataKeyOf(event);
  const createdAt = nowIso();
  const yearId = await yearIdFor(db, group.id, year, createdAt);
  const made: { id: string; label: string }[] = [];
  // One after the other: each draws its own links.
  for (const previous of editions) {
    const { edition, count } = await createSecretSanta(db, {
      partyId: group.id,
      yearId,
      year,
      label: labelForYear(previous.label, previous.year, year),
      rules: unwrap(mergeRules(previous.rules, { eventDate })),
      game: carriedGame(previous, eventDate),
      guessAutoReminder: previous.guessAutoReminder,
      personIds: taking
        .filter(
          (row) =>
            row.secretSantaId === previous.id && active.has(row.personId),
        )
        .map((row) => row.personId),
      dataKey,
      createdAt,
    });
    await recordEvent(db, {
      type: 'edition_created',
      groupId: group.id,
      editionId: edition.id,
      actor: user.role,
      meta: { label: edition.label, participants: count },
    });
    made.push({ id: edition.id, label: edition.label });
  }
  setResponseStatus(event, 201);
  return { year, secretSantas: made };
});
