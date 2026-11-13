import { and, eq, inArray } from 'drizzle-orm';
import type { Db } from './client';
import { assignments, type EditionRow } from './schema';
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
