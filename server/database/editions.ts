import { and, asc, count, eq, inArray } from 'drizzle-orm';
import type { Db } from './client';
import { editions, participations, persons, type EditionRow } from './schema';
import { participationsWithHints } from './hints';
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
  /** When the organiser revealed who gave to whom, or null. */
  revealedAt: string | null;
  /** Drawn by the app, or already elsewhere (README 22.12). */
  drawMode: EditionRow['drawMode'];
  createdAt: string;
  participantCount?: number;
  /** When the organisers were reminded that the exchange is near. */
  reminderSentAt: string | null;
  /**
   * Exclusions applied at the draw, once it is done: the edition then
   * shows these, not the group's current ones, which may have changed.
   */
  exclusionsAtDraw?: {
    giverId: string;
    receiverId: string;
    reciprocal: boolean;
  }[];
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
  revealedAt: edition.revealedAt,
  drawMode: edition.drawMode,
  createdAt: edition.createdAt,
  reminderSentAt: edition.reminderSentAt,
  ...(participantCount === undefined ? {} : { participantCount }),
  ...(edition.status === 'drawn' || edition.status === 'closed'
    ? { exclusionsAtDraw: exclusionsOf(edition.rulesSnapshot) }
    : {}),
});

// The draw stores the exclusions it applied in rules_snapshot.
const exclusionsOf = (snapshot: unknown) => {
  const list = (snapshot as { manualExclusions?: unknown } | null)
    ?.manualExclusions;
  return Array.isArray(list)
    ? list.flatMap((e) =>
        e && typeof e.giverId === 'string' && typeof e.receiverId === 'string'
          ? [
              {
                giverId: e.giverId,
                receiverId: e.receiverId,
                reciprocal: Boolean(e.reciprocal),
              },
            ]
          : [],
      )
    : [];
};

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
  lastViewedAt: string | null;
  /** Left gift hints: a yes or no, never what (README 22.11). */
  hasHints: boolean;
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
  const withHints = await participationsWithHints(db, ids);
  return rows.map(({ participation, person }) => {
    const status = {
      participationId: participation.id,
      messageSentAt: participation.messageSentAt,
      linkCopiedAt: participation.linkCopiedAt,
      viewCount: participation.viewCount,
      lastViewedAt: participation.lastViewedAt,
      hasHints: withHints.has(participation.id),
    };
    return {
      ...publicPerson(person),
      ...status,
      badges: participantBadges(status),
    };
  });
};
