import { and, eq, inArray } from 'drizzle-orm';
import type { Db } from './client';
import { assignments, participations, type EditionRow } from './schema';
import { listExclusions } from './people';
import { listEditions, listParticipants, type Participant } from './editions';
import { decrypt } from '#server/utils/crypto';
import type { DrawInput } from '#server/utils/draw';
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
