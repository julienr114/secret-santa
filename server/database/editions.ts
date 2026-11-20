import { and, asc, count, eq, getTableColumns, inArray } from 'drizzle-orm';
import type { Db } from './client';
import {
  parties,
  partyYears,
  secretSantas,
  participations,
  persons,
  type SecretSantaRow,
} from './schema';
import { participationsWithHints } from './hints';
import { encrypt, generateToken, hashToken } from '#server/utils/crypto';
import { participantBadges, type Badge } from '#server/utils/editions';
import { publicPerson, type PublicPerson } from '#server/utils/people';
import { newId } from '#server/http/context';

/**
 * A Secret Santa with the year of its party: what the screens of before
 * call an edition (ticket 101 keeps them as they are).
 */
export type Edition = SecretSantaRow & { year: number };

/** The columns of an edition: the Secret Santa, and its year. */
export const editionColumns = {
  ...getTableColumns(secretSantas),
  year: partyYears.year,
};

/** The row of the table: an edition without its year. */
export const secretSantaRow = ({ year: _year, ...row }: Edition) => row;

/** The editions, joined to their year: add a where and an order. */
export const selectEditions = (db: Db) =>
  db
    .select(editionColumns)
    .from(secretSantas)
    .innerJoin(partyYears, eq(partyYears.id, secretSantas.yearId));

export const listEditions = (db: Db, partyId: string): Promise<Edition[]> =>
  selectEditions(db)
    .where(eq(secretSantas.partyId, partyId))
    .orderBy(asc(partyYears.year));

export const findEdition = async (
  db: Db,
  partyId: string,
  editionId: string | undefined,
): Promise<Edition | null> => {
  if (!editionId) return null;
  const [edition] = await selectEditions(db)
    .where(
      and(eq(secretSantas.partyId, partyId), eq(secretSantas.id, editionId)),
    )
    .limit(1);
  return edition ?? null;
};

/**
 * The year of a party, made when it does not exist yet: its date is the
 * party's usual day that year, when it has one.
 * @returns The id of the year.
 */
export const yearIdFor = async (
  db: Db,
  partyId: string,
  year: number,
  createdAt: string,
): Promise<string> => {
  const [party] = await db
    .select({ usualDate: parties.usualDate })
    .from(parties)
    .where(eq(parties.id, partyId))
    .limit(1);
  await db
    .insert(partyYears)
    .values({
      id: newId(),
      partyId,
      year,
      date: party?.usualDate ? `${year}-${party.usualDate}` : null,
      createdAt,
    })
    .onConflictDoNothing();
  const [row] = await db
    .select({ id: partyYears.id })
    .from(partyYears)
    .where(and(eq(partyYears.partyId, partyId), eq(partyYears.year, year)))
    .limit(1);
  return row!.id;
};

export type PublicEdition = {
  id: string;
  label: string;
  year: number;
  status: SecretSantaRow['status'];
  rulesOverride: unknown;
  drawnAt: string | null;
  closedAt: string | null;
  /** When the organiser revealed who gave to whom, or null. */
  revealedAt: string | null;
  /** Drawn by the app, or already elsewhere (README 22.12). */
  drawMode: SecretSantaRow['drawMode'];
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
  edition: Edition,
  participantCount?: number,
): PublicEdition => ({
  id: edition.id,
  label: edition.label,
  year: edition.year,
  status: edition.status,
  // The screens of before send it back with one rule changed.
  rulesOverride: edition.rules,
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
    .select({ editionId: participations.secretSantaId, n: count() })
    .from(participations)
    .where(inArray(participations.secretSantaId, editionIds))
    .groupBy(participations.secretSantaId);
  return Object.fromEntries(rows.map((r) => [r.editionId, r.n]));
};

/** A fresh participation with its personal link token, encrypted at rest. */
export const newParticipation = async (
  { secretSantaId, personId }: { secretSantaId: string; personId: string },
  dataKey: CryptoKey,
) => {
  const token = generateToken();
  const { enc, iv } = await encrypt(token, dataKey);
  return {
    id: newId(),
    secretSantaId,
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
    .where(eq(participations.secretSantaId, editionId))
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
