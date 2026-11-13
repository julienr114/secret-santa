import { and, asc, count, eq, inArray } from 'drizzle-orm';
import type { Db } from './client';
import {
  editions,
  participations,
  persons,
  wishes,
  type EditionRow,
} from './schema';
import { encrypt, generateToken, hashToken } from '#server/utils/crypto';
import { participantBadges, type Badge } from '#server/utils/editions';
import { publicPerson, type PublicPerson } from '#server/utils/people';
import { newId } from '#server/http/context';

export const listEditions = (db: Db, groupId: string) =>
  db
    .select()
    .from(editions)
    .where(eq(editions.groupId, groupId))
    .orderBy(asc(editions.year));

export const findEdition = async (
  db: Db,
  groupId: string,
  editionId: string | undefined,
): Promise<EditionRow | null> => {
  if (!editionId) return null;
  const [edition] = await db
    .select()
    .from(editions)
    .where(and(eq(editions.groupId, groupId), eq(editions.id, editionId)))
    .limit(1);
  return edition ?? null;
};

export type PublicEdition = {
  id: string;
  label: string;
  year: number;
  status: EditionRow['status'];
  rulesOverride: unknown;
  drawnAt: string | null;
  closedAt: string | null;
  createdAt: string;
  participantCount?: number;
};

export const publicEdition = (
  edition: EditionRow,
  participantCount?: number,
): PublicEdition => ({
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

export const participantCounts = async (
  db: Db,
  editionIds: string[],
): Promise<Record<string, number>> => {
  if (editionIds.length === 0) return {};
  const rows = await db
    .select({ editionId: participations.editionId, n: count() })
    .from(participations)
    .where(inArray(participations.editionId, editionIds))
    .groupBy(participations.editionId);
  return Object.fromEntries(rows.map((r) => [r.editionId, r.n]));
};

/** A fresh participation with its personal link token, encrypted at rest. */
export const newParticipation = async (
  { editionId, personId }: { editionId: string; personId: string },
  dataKey: CryptoKey,
) => {
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

export type Participant = PublicPerson & {
  participationId: string;
  messageSentAt: string | null;
  linkCopiedAt: string | null;
  viewCount: number;
  wishesCount: number;
  badges: Badge[];
};

/** Participants of an edition with their status badges, never a token. */
export const listParticipants = async (
  db: Db,
  editionId: string,
): Promise<Participant[]> => {
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
    };
    return {
      ...publicPerson(person),
      ...status,
      badges: participantBadges(status),
    };
  });
};
