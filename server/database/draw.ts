import { and, eq, inArray } from 'drizzle-orm';
import type { Db } from './client';
import {
  assignments,
  editions,
  participations,
  persons,
  type EditionRow,
} from './schema';
import { listExclusions } from './people';
import { listEditions, listParticipants, type Participant } from './editions';
import { decrypt, encrypt } from '#server/utils/crypto';
import { DRAWN_PARTICIPATION } from '#server/utils/editions';
import { GAME_OFF, gamePossible } from '#server/utils/guesses';
import type { Assignment, DrawInput } from '#server/utils/draw';
import {
  applyWaivers,
  buildHistory,
  historyEditions,
  parseWaivers,
  type PastAssignment,
} from '#server/utils/editions';
import type { Rules } from '#server/utils/rules';

// `closedPairs`: decrypted pairs of the closed editions in the history
// window. Closed results are no longer secret (decision of 2026-11-13);
// pairs of a drawn but not yet closed edition never leave this module.
export type ClosedPair = PastAssignment & {
  editionLabel: string;
  editionYear: number;
};
export type DrawContext = {
  participants: Participant[];
  input: DrawInput;
  closedPairs: ClosedPair[];
};

/**
 * Everything the pure draw needs for an edition: participants, exclusions
 * among them, and the receivers of the last N editions
 * (decrypted here, never returned to a client).
 */
export const loadDrawContext = async (
  db: Db,
  groupId: string,
  edition: EditionRow,
  rules: Rules,
  dataKey: CryptoKey,
): Promise<DrawContext> => {
  const [participants, exclusions, editions] = await Promise.all([
    listParticipants(db, edition.id),
    listExclusions(db, groupId),
    listEditions(db, groupId),
  ]);
  const ids = new Set(participants.map((p) => p.id));
  const pastIds = historyEditions(
    editions,
    edition.id,
    rules.excludePreviousYears,
  ).map((e) => e.id);
  const rows =
    pastIds.length === 0
      ? []
      : await db
          .select()
          .from(assignments)
          .where(inArray(assignments.editionId, pastIds));
  const past = await Promise.all(
    rows.map(async (row): Promise<PastAssignment | null> => {
      const receiver = await decrypt(
        { enc: row.receiverEnc, iv: row.receiverIv },
        dataKey,
      );
      return receiver.ok
        ? {
            editionId: row.editionId,
            giverId: row.giverPersonId,
            receiverId: receiver.value,
          }
        : null;
    }),
  );
  const known = past.filter((a): a is PastAssignment => a !== null);
  const closed = new Map(
    editions
      .filter((e) => e.status === 'closed' && pastIds.includes(e.id))
      .map((e) => [e.id, { label: e.label, year: e.year }]),
  );
  return {
    participants,
    closedPairs: known.flatMap((a) =>
      closed.has(a.editionId)
        ? [
            {
              ...a,
              editionLabel: closed.get(a.editionId)?.label ?? '',
              editionYear: closed.get(a.editionId)?.year ?? 0,
            },
          ]
        : [],
    ),
    input: {
      participants: [...ids],
      manualExclusions: exclusions.filter(
        (e) => ids.has(e.giverId) && ids.has(e.receiverId),
      ),
      history: applyWaivers(
        buildHistory(known, pastIds),
        parseWaivers(edition.historyWaivers),
      ),
    },
  };
};

export const deleteAssignments = (db: Db, editionId: string) =>
  db.delete(assignments).where(and(eq(assignments.editionId, editionId)));

/**
 * The participation of the person `giverPersonId` gives to in an edition,
 * or null when there is no draw (or it cannot be read). Decrypted here and
 * only for the giver's own requests.
 */
export const findReceiverParticipationId = async (
  db: Db,
  editionId: string,
  giverPersonId: string,
  dataKey: CryptoKey,
): Promise<string | null> => {
  const [assignment] = await db
    .select()
    .from(assignments)
    .where(
      and(
        eq(assignments.editionId, editionId),
        eq(assignments.giverPersonId, giverPersonId),
      ),
    )
    .limit(1);
  if (!assignment) return null;
  const receiverId = await decrypt(
    { enc: assignment.receiverEnc, iv: assignment.receiverIv },
    dataKey,
  );
  if (!receiverId.ok) return null;
  const [row] = await db
    .select({ id: participations.id })
    .from(participations)
    .where(
      and(
        eq(participations.editionId, editionId),
        eq(participations.personId, receiverId.value),
      ),
    )
    .limit(1);
  return row?.id ?? null;
};

/**
 * The person `giverPersonId` gives to, once the draw is revealed (README
 * 22.18): for the home's card « Tu offres un cadeau à… ». Null without a
 * draw, or when it cannot be read.
 */
export const findRevealedReceiver = async (
  db: Db,
  editionId: string,
  giverPersonId: string,
  dataKey: CryptoKey,
) => {
  const participationId = await findReceiverParticipationId(
    db,
    editionId,
    giverPersonId,
    dataKey,
  );
  if (!participationId) return null;
  const [row] = await db
    .select({ person: persons })
    .from(participations)
    .innerJoin(persons, eq(persons.id, participations.personId))
    .where(eq(participations.id, participationId))
    .limit(1);
  return row?.person ?? null;
};

/**
 * The participation of whoever gives to a receiver, by decrypting the
 * draw of the edition (README 8.3): only to email them that hints arrived
 * after their request (README 6 bis.3). Never returned by a route.
 */
export const findGiverParticipationId = async (
  db: Db,
  editionId: string,
  receiverPersonId: string,
  dataKey: CryptoKey,
): Promise<string | null> => {
  const rows = await db
    .select()
    .from(assignments)
    .where(eq(assignments.editionId, editionId));
  const receivers = await Promise.all(
    rows.map(async (row) => ({
      giverPersonId: row.giverPersonId,
      receiverId: await decrypt(
        { enc: row.receiverEnc, iv: row.receiverIv },
        dataKey,
      ),
    })),
  );
  const giver = receivers.find(
    ({ receiverId }) => receiverId.ok && receiverId.value === receiverPersonId,
  );
  if (!giver) return null;
  const [row] = await db
    .select({ id: participations.id })
    .from(participations)
    .where(
      and(
        eq(participations.editionId, editionId),
        eq(participations.personId, giver.giverPersonId),
      ),
    )
    .limit(1);
  return row?.id ?? null;
};

/**
 * The statements that store a draw: the pairs, receivers encrypted, the
 * edition drawn (only if it was still being prepared), and the sending
 * tracked from here on. Shared by the draw of the app and the answers of
 * a draw made elsewhere, once validated (README 22.12).
 * @param db - The database.
 * @param draw - The edition, its pairs, what it was drawn with, and when.
 * @param dataKey - The server key.
 * @returns The statements, for one batch; the unique (edition, giver)
 *   index makes a concurrent second draw fail.
 */
export const drawStatements = async (
  db: Db,
  draw: {
    editionId: string;
    pairs: Assignment[];
    snapshot: unknown;
    now: string;
    newId: () => string;
  },
  dataKey: CryptoKey,
) => {
  const rows = await Promise.all(
    draw.pairs.map(async ({ giverId, receiverId }) => {
      const { enc, iv } = await encrypt(receiverId, dataKey);
      return {
        id: draw.newId(),
        editionId: draw.editionId,
        giverPersonId: giverId,
        receiverEnc: enc,
        receiverIv: iv,
        createdAt: draw.now,
      };
    }),
  );
  return [
    db
      .update(editions)
      .set({
        status: 'drawn',
        drawnAt: draw.now,
        rulesSnapshot: draw.snapshot,
        // At three, everyone knows who gives to them: « Devine qui » is
        // turned off (Correction 12).
        ...(gamePossible(draw.pairs.length) ? {} : GAME_OFF),
      })
      .where(
        and(eq(editions.id, draw.editionId), eq(editions.status, 'preparing')),
      ),
    // One statement per assignment: D1 caps a statement at 100 bound
    // parameters, which a single multi-row insert passes at 17 people.
    ...rows.map((row) => db.insert(assignments).values(row)),
    // Sending is tracked from the draw on: an invitation shared earlier
    // does not count as the "draw done" message.
    db
      .update(participations)
      .set({ ...DRAWN_PARTICIPATION })
      .where(eq(participations.editionId, draw.editionId)),
  ] as const;
};

/**
 * Every pair of a draw, decrypted: only once it is revealed or closed
 * (README 22.9), for the results and the palmarès of « Devine qui ».
 * @param db - The database.
 * @param editionId - The edition.
 * @param dataKey - The server key.
 * @returns The pairs that can be read.
 */
export const readPairs = async (
  db: Db,
  editionId: string,
  dataKey: CryptoKey,
): Promise<Assignment[]> => {
  const rows = await db
    .select()
    .from(assignments)
    .where(eq(assignments.editionId, editionId));
  const pairs = await Promise.all(
    rows.map(async (row) => {
      const receiver = await decrypt(
        { enc: row.receiverEnc, iv: row.receiverIv },
        dataKey,
      );
      return receiver.ok
        ? [{ giverId: row.giverPersonId, receiverId: receiver.value }]
        : [];
    }),
  );
  return pairs.flat();
};
