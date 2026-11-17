import {
  and,
  count,
  desc,
  eq,
  inArray,
  isNull,
  lt,
  type SQLWrapper,
} from 'drizzle-orm';
import type { AnySQLiteColumn } from 'drizzle-orm/sqlite-core';
import type { Db } from './client';
import {
  editions,
  giftPortraits,
  hintRequests,
  participations,
  wishes,
} from './schema';
import { listWishes } from './wishes';
import { touchHints } from './participations';
import { nowIso } from '#server/http/context';
import {
  EMPTY_PORTRAIT,
  HINT_ANSWERS,
  hasHints,
  type HintAnswer,
  type Portrait,
} from '#shared/utils/hints';

// Gift hints in the database (README 22.11). Never returned to an
// organiser: their routes only get whether someone left hints.

type PortraitRow = typeof giftPortraits.$inferSelect;

const answerOf = (value: string | null): HintAnswer | null =>
  (HINT_ANSWERS as readonly string[]).includes(value ?? '')
    ? (value as HintAnswer)
    : null;

/** A stored row as a portrait; no row is an empty portrait. */
const portraitOf = (row: PortraitRow | undefined): Portrait =>
  row
    ? {
        answers: {
          usefulOrSurprising: answerOf(row.usefulOrSurprising),
          objectOrMoment: answerOf(row.objectOrMoment),
          keepOrConsume: answerOf(row.keepOrConsume),
          selfOrShared: answerOf(row.selfOrShared),
          secondHand: answerOf(row.secondHand),
          surprise: answerOf(row.surprise),
        },
        texts: {
          lately: row.lately,
          wouldHelp: row.wouldHelp,
          avoid: row.avoid,
        },
      }
    : EMPTY_PORTRAIT;

/** The portrait of a participation, empty when never written. */
export const findPortrait = async (
  db: Db,
  participationId: string,
): Promise<Portrait> => {
  const [row] = await db
    .select()
    .from(giftPortraits)
    .where(eq(giftPortraits.participationId, participationId))
    .limit(1);
  return portraitOf(row);
};

/** Writes the whole portrait of a participation, and dates its hints. */
export const savePortrait = (
  db: Db,
  participationId: string,
  portrait: Portrait,
) => {
  const updatedAt = nowIso();
  const values = { ...portrait.answers, ...portrait.texts, updatedAt };
  return db.batch([
    db
      .insert(giftPortraits)
      .values({ participationId, ...values })
      .onConflictDoUpdate({
        target: giftPortraits.participationId,
        set: values,
      }),
    touchHints(db, participationId, updatedAt),
  ]);
};

/**
 * Whether the giver was already told this draw that hints arrived, and
 * marks it: true only for the first caller.
 */
export const markHintsAnnounced = async (
  db: Db,
  participationId: string,
): Promise<boolean> => {
  const rows = await db
    .update(participations)
    .set({ hintsAnnouncedAt: nowIso() })
    .where(
      and(
        eq(participations.id, participationId),
        isNull(participations.hintsAnnouncedAt),
      ),
    )
    .returning({ id: participations.id });
  return rows.length > 0;
};

/** How many precise ideas a participation wrote. */
export const countIdeas = async (
  db: Db,
  participationId: string,
): Promise<number> => {
  const [row] = await db
    .select({ n: count() })
    .from(wishes)
    .where(eq(wishes.participationId, participationId));
  return row?.n ?? 0;
};

/** Whether a participation left hints: an answer, a text or an idea. */
export const participationHasHints = async (
  db: Db,
  participationId: string,
): Promise<boolean> =>
  hasHints(
    await findPortrait(db, participationId),
    await countIdeas(db, participationId),
  );

/**
 * Which of these participations left hints, for the organiser and the
 * home page: a yes or no, never what they wrote.
 */
export const participationsWithHints = async (
  db: Db,
  participationIds: string[],
): Promise<Set<string>> => {
  if (participationIds.length === 0) return new Set();
  const [portraits, ideas] = await Promise.all([
    db
      .select()
      .from(giftPortraits)
      .where(inArray(giftPortraits.participationId, participationIds)),
    db
      .selectDistinct({ id: wishes.participationId })
      .from(wishes)
      .where(inArray(wishes.participationId, participationIds)),
  ]);
  const withIdeas = new Set(ideas.map((row) => row.id));
  return new Set(
    participationIds.filter((id) =>
      hasHints(
        portraitOf(portraits.find((row) => row.participationId === id)),
        withIdeas.has(id) ? 1 : 0,
      ),
    ),
  );
};

/**
 * The most recent earlier participation of the same person, in the same
 * group, that left hints: what « Reprendre mes pistes » copies.
 */
export const findPreviousHints = async (
  db: Db,
  current: { personId: string; groupId: string; editionCreatedAt: string },
): Promise<{ participationId: string; editionLabel: string } | null> => {
  const rows = await db
    .select({
      participationId: participations.id,
      editionLabel: editions.label,
    })
    .from(participations)
    .innerJoin(editions, eq(editions.id, participations.editionId))
    .where(
      and(
        eq(participations.personId, current.personId),
        eq(editions.groupId, current.groupId),
        lt(editions.createdAt, current.editionCreatedAt),
      ),
    )
    .orderBy(desc(editions.createdAt))
    .limit(5);
  const withHints = await participationsWithHints(
    db,
    rows.map((row) => row.participationId),
  );
  return rows.find((row) => withHints.has(row.participationId)) ?? null;
};

/** The request made for a receiver in the current draw, if any. */
export const findHintRequest = async (
  db: Db,
  receiverParticipationId: string,
) => {
  const [row] = await db
    .select()
    .from(hintRequests)
    .where(eq(hintRequests.receiverParticipationId, receiverParticipationId))
    .limit(1);
  return row ?? null;
};

/** Records a request, without who asked (README 6 bis.3). */
export const insertHintRequest = (
  db: Db,
  request: { receiverParticipationId: string; editionId: string },
) =>
  db
    .insert(hintRequests)
    .values({ ...request, requestedAt: nowIso() })
    .onConflictDoNothing();

/** The hints arrived and the one who asked was told: never twice. */
export const markHintRequestAnswered = (
  db: Db,
  receiverParticipationId: string,
) =>
  db
    .update(hintRequests)
    .set({ answeredAt: nowIso() })
    .where(
      and(
        eq(hintRequests.receiverParticipationId, receiverParticipationId),
        isNull(hintRequests.answeredAt),
      ),
    )
    .returning({ answeredAt: hintRequests.answeredAt });

/**
 * Statements that forget the requests of an edition: a new draw gives new
 * givers, who may each ask once (README 22.11, « une seule demande par
 * tirage »).
 */
export const deleteHintRequestsOf = (db: Db, editionId: string) =>
  db.delete(hintRequests).where(eq(hintRequests.editionId, editionId));

/** Rows whose column is one of the ids, a list or a subquery. */
const inIds = (column: AnySQLiteColumn, ids: string[] | SQLWrapper) =>
  Array.isArray(ids) ? inArray(column, ids) : inArray(column, ids);

/** Statements that delete the hints of some participations. */
export const deleteHintsOf = (
  db: Db,
  participationIds: string[] | SQLWrapper,
) =>
  [
    db.delete(wishes).where(inIds(wishes.participationId, participationIds)),
    db
      .delete(giftPortraits)
      .where(inIds(giftPortraits.participationId, participationIds)),
    db
      .delete(hintRequests)
      .where(inIds(hintRequests.receiverParticipationId, participationIds)),
  ] as const;

/**
 * What the giver reads on their result (README 22.11): the portrait, the
 * precise ideas when the group keeps them, and whether they already asked
 * for hints (only the giver of a receiver can ask, so a request on the
 * receiver is theirs).
 */
export const giverHints = async (
  db: Db,
  receiverParticipationId: string,
  mode: 'full' | 'portrait',
) => {
  const [portrait, ideas, request] = await Promise.all([
    findPortrait(db, receiverParticipationId),
    mode === 'full' ? listWishes(db, receiverParticipationId) : [],
    findHintRequest(db, receiverParticipationId),
  ]);
  return { mode, portrait, ideas, requested: Boolean(request) };
};
