import { carriedGame } from '#server/utils/guesses';
import { eq } from 'drizzle-orm';
import { participations } from '#server/database/schema';
import {
  createSecretSanta,
  listEditions,
  publicEdition,
  yearIdFor,
} from '#server/database/editions';
import { requireOpenYearNumber } from '#server/database/years';
import { listPeople } from '#server/database/people';
import { findAccountById } from '#server/database/accounts';
import { quotaAccountOf } from '#server/database/quota';
import { recordEvent } from '#server/database/audit';
import { isSwitchOn } from '#server/database/switches';
import { requireGroupAccess } from '#server/http/auth';
import { dataKeyOf, nowIso } from '#server/http/context';
import { validatedBody } from '#server/http/validate';
import {
  checkParticipantCount,
  editionInputSchema,
  previousEdition,
} from '#server/utils/editions';
import { unwrap } from '#server/http/errors';
import { mergeRules } from '#server/utils/rules';
import { canOrganiseSecretSanta } from '#server/utils/quota';

// Creates an edition, ready to prepare: links work at once. Its participants start as those of the previous
// edition who are still active (README 4.2), or every active person for a
// first edition. Each gets a personal link right away. No request to
// anyone: an account organises up to its limit of Secret Santa in progress
// (3 by default, docs/spec/v3/secret-santa.md), and a party may have
// several in the same year. While the super-admin pauses new Secret
// Santa, none is created (docs/spec/v3/administration.md).
export default defineEventHandler(async (event) => {
  const { user, group, db } = await requireGroupAccess(event);
  const body = await validatedBody(event, editionInputSchema);
  const dataKey = await dataKeyOf(event);
  const account = await findAccountById(db, user.accountId);
  if (!account) {
    throw createError({ statusCode: 401, statusMessage: 'unauthorized' });
  }
  unwrap(
    canOrganiseSecretSanta(
      await quotaAccountOf(db, account),
      await isSwitchOn(db, 'new_secret_santas'),
    ),
  );
  // Nothing is made in a year over (ticket 108); its date to come opens
  // again a year dated in the past by mistake.
  await requireOpenYearNumber(db, group, body.year, body.eventDate);
  const existing = await listEditions(db, group.id);
  const previous = previousEdition(existing, body.year);
  const previousIds = previous
    ? (
        await db
          .select({ personId: participations.personId })
          .from(participations)
          .where(eq(participations.secretSantaId, previous.id))
      ).map((r) => r.personId)
    : null;
  const people = (await listPeople(db, group.id)).filter(
    (p) => p.active && (previousIds === null || previousIds.includes(p.id)),
  );
  unwrap(checkParticipantCount(people.length));
  // « Devine qui » as chosen on the form, or the previous one's.
  const game = body.guess
    ? body.guess.mode === 'none'
      ? { guessMode: 'none' as const, guessEndsAt: null, guessTimeZone: null }
      : {
          guessMode: body.guess.mode,
          guessEndsAt: body.guess.endsAt,
          guessTimeZone: body.guess.timeZone,
        }
    : carriedGame(previous, body.eventDate);
  const createdAt = nowIso();
  const { edition, count } = await createSecretSanta(db, {
    partyId: group.id,
    yearId: await yearIdFor(db, group.id, body.year, createdAt),
    year: body.year,
    label: body.label,
    // Its own rules, copied from the previous Secret Santa of the party,
    // or the party's for a first one (docs/spec/v3/secret-santa.md, « Ses
    // réglages »). The day of the party belongs to it (README 22.9), and so
    // do what the form gave.
    rules: unwrap(
      mergeRules(previous?.rules ?? group.rules, {
        eventDate: body.eventDate,
        ...(body.budget === undefined ? {} : { budget: body.budget }),
        ...(body.guardianMessage === undefined
          ? {}
          : { guardianMessage: body.guardianMessage }),
        ...(body.messageNote === undefined
          ? {}
          : { messageNote: body.messageNote }),
      }),
    ),
    game,
    guessAutoReminder: previous?.guessAutoReminder ?? true,
    personIds: people.map((p) => p.id),
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
  setResponseStatus(event, 201);
  return { edition: publicEdition(edition, count) };
});
