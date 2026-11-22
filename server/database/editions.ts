import { wroteListFor } from './listSharing';
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
import { subjectSantaName } from '#server/utils/messages';
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

/**
 * The name of a Secret Santa for the subject of its emails: only when its
 * event has several the same year (ticket 110).
 * @param db - The database.
 * @param santa - Its name and its year.
 * @param santa.label - Its name.
 * @param santa.yearId - Its year.
 * @returns The name, or null.
 */
export const santaNameForSubject = async (
  db: Db,
  santa: { label: string; yearId: string },
): Promise<string | null> => {
  const [row] = await db
    .select({ n: count() })
    .from(secretSantas)
    .where(eq(secretSantas.yearId, santa.yearId));
  return subjectSantaName(santa.label, row?.n ?? 0);
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

/** What a new Secret Santa takes, its draw settings complete. */
export type NewSecretSanta = {
  partyId: string;
  yearId: string;
  year: number;
  label: string;
  rules: SecretSantaRow['rules'];
  /** « Devine qui »: as chosen, or carried from the one before. */
  game: Pick<SecretSantaRow, 'guessMode' | 'guessEndsAt' | 'guessTimeZone'>;
  guessAutoReminder: boolean;
  /** Its participants, each given a personal link at once. */
  personIds: readonly string[];
  dataKey: CryptoKey;
  createdAt: string;
};

/**
 * Creates a Secret Santa to prepare, with its participants: nothing is
 * drawn nor sent. The creation of a Secret Santa (README 4.2) and
 * « Préparer Noël 2027 » (ticket 108) both go through here.
 * @param db - The database.
 * @param input - What it takes.
 * @returns The edition and how many take part.
 */
export const createSecretSanta = async (
  db: Db,
  input: NewSecretSanta,
): Promise<{ edition: Edition; count: number }> => {
  const { game, createdAt } = input;
  const edition: Edition = {
    id: newId(),
    partyId: input.partyId,
    yearId: input.yearId,
    label: input.label,
    year: input.year,
    status: 'preparing',
    rules: input.rules,
    rulesSnapshot: null,
    historyWaivers: null,
    reminderSentAt: null,
    drawnAt: null,
    closedAt: null,
    revealedAt: null,
    drawMode: 'app',
    // « Devine qui » is taken from the previous edition (README 22.17),
    // its end moved to the new party at the same time of day.
    ...game,
    guessReminderSentAt: null,
    guessesClosedAt: null,
    guessResultsSentAt: null,
    // The automatic reminder keeps the previous edition's setting.
    guessAutoReminder: input.guessAutoReminder,
    guessAutoReminderSentAt: null,
    guessPointSentAt: null,
    guessEndSentAt: null,
    // A game carried over is on from the creation (« activé moins de
    // trois jours avant la fin », README 22.17).
    guessEnabledAt: game.guessMode === 'none' ? null : createdAt,
    createdAt,
  };
  const rows = await Promise.all(
    input.personIds.map((personId) =>
      newParticipation({ secretSantaId: edition.id, personId }, input.dataKey),
    ),
  );
  // One statement per participant: D1 caps a statement at 100 bound
  // parameters, which a single multi-row insert passes at ten people.
  await db.batch([
    db.insert(secretSantas).values(secretSantaRow(edition)),
    ...rows.map((row) => db.insert(participations).values(row)),
  ]);
  return { edition, count: rows.length };
};

export type Participant = PublicPerson & {
  participationId: string;
  messageSentAt: string | null;
  linkCopiedAt: string | null;
  viewCount: number;
  lastViewedAt: string | null;
  /**
   * Wrote their list for the event (ticket 107), or left gift hints
   * before the V3: a yes or no, never what.
   */
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
  const [santa] = await db
    .select({ partyId: secretSantas.partyId })
    .from(secretSantas)
    .where(eq(secretSantas.id, editionId))
    .limit(1);
  const wrote = santa
    ? await wroteListFor(
        db,
        santa.partyId,
        rows.flatMap((r) => (r.person.email ? [r.person.email] : [])),
      )
    : new Set<string>();
  return rows.map(({ participation, person }) => {
    const status = {
      participationId: participation.id,
      messageSentAt: participation.messageSentAt,
      linkCopiedAt: participation.linkCopiedAt,
      viewCount: participation.viewCount,
      lastViewedAt: participation.lastViewedAt,
      hasHints:
        withHints.has(participation.id) ||
        Boolean(person.email && wrote.has(person.email)),
    };
    return {
      ...publicPerson(person),
      ...status,
      badges: participantBadges(status),
    };
  });
};
