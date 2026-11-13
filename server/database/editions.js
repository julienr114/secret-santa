import { and, asc, count, eq, inArray } from 'drizzle-orm';
import { editions, participations, persons, wishes } from './schema.js';
import { encrypt, generateToken, hashToken } from '../utils/crypto.js';
import { participantBadges } from '../utils/editions.js';
import { publicPerson } from '../utils/people.js';
import { newId } from '../http/context.js';

export const listEditions = (db, groupId) =>
  db
    .select()
    .from(editions)
    .where(eq(editions.groupId, groupId))
    .orderBy(asc(editions.year));

export const findEdition = async (db, groupId, editionId) => {
  const [edition] = await db
    .select()
    .from(editions)
    .where(and(eq(editions.groupId, groupId), eq(editions.id, editionId)))
    .limit(1);
  return edition ?? null;
};

export const publicEdition = (edition, participantCount) => ({
  id: edition.id,
  label: edition.label,
  year: edition.year,
  status: edition.status,
  rulesOverride: edition.rulesOverride,
  drawnAt: edition.drawnAt,
  closedAt: edition.closedAt,
  createdAt: edition.createdAt,
  ...(participantCount === undefined ? {} : { participantCount }),
});

export const participantCounts = async (db, editionIds) => {
  if (editionIds.length === 0) return {};
  const rows = await db
    .select({ editionId: participations.editionId, n: count() })
    .from(participations)
    .where(inArray(participations.editionId, editionIds))
    .groupBy(participations.editionId);
  return Object.fromEntries(rows.map((r) => [r.editionId, r.n]));
};

/** A fresh participation with its personal link token, encrypted at rest. */
export const newParticipation = async ({ editionId, personId }, dataKey) => {
  const token = generateToken();
  const { enc, iv } = await encrypt(token, dataKey);
  return {
    id: newId(),
    editionId,
    personId,
    tokenHash: await hashToken(token),
    tokenEnc: enc,
    tokenIv: iv,
    messageSentAt: null,
    linkCopiedAt: null,
    viewCount: 0,
    firstViewedAt: null,
    lastViewedAt: null,
  };
};

/** Participants of an edition with their status badges, never a token. */
export const listParticipants = async (db, editionId) => {
  const rows = await db
    .select({ participation: participations, person: persons })
    .from(participations)
    .innerJoin(persons, eq(persons.id, participations.personId))
    .where(eq(participations.editionId, editionId))
    .orderBy(asc(persons.firstName));
  const ids = rows.map((r) => r.participation.id);
  const wishRows =
    ids.length === 0
      ? []
      : await db
          .select({ participationId: wishes.participationId, n: count() })
          .from(wishes)
          .where(inArray(wishes.participationId, ids))
          .groupBy(wishes.participationId);
  const wishCounts = Object.fromEntries(
    wishRows.map((r) => [r.participationId, r.n]),
  );
  return rows.map(({ participation, person }) => {
    const status = {
      participationId: participation.id,
      messageSentAt: participation.messageSentAt,
      linkCopiedAt: participation.linkCopiedAt,
      viewCount: participation.viewCount,
      wishesCount: wishCounts[participation.id] ?? 0,
      hasPin: Boolean(person.pinHash),
      pinLocked: Boolean(person.pinLockedAt),
    };
    return {
      ...publicPerson(person),
      ...status,
      badges: participantBadges(status),
    };
  });
};
