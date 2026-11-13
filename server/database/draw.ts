import { and, eq, inArray } from 'drizzle-orm';
import type { Db } from './client';
import { assignments, type EditionRow } from './schema';
import { listCouples, listExclusions } from './people';
import { listEditions, listParticipants, type Participant } from './editions';
import { decrypt } from '#server/utils/crypto';
import type { DrawInput } from '#server/utils/draw';
import {
  buildHistory,
  historyEditions,
  type PastAssignment,
} from '#server/utils/editions';
import type { Rules } from '#server/utils/rules';

export type DrawContext = { participants: Participant[]; input: DrawInput };

/**
 * Everything the pure draw needs for an edition: participants, couples and
 * exclusions among them, and the receivers of the last N editions
 * (decrypted here, never returned to a client).
 */
export const loadDrawContext = async (
  db: Db,
  groupId: string,
  edition: EditionRow,
  rules: Rules,
  dataKey: CryptoKey,
): Promise<DrawContext> => {
  const [participants, couples, exclusions, editions] = await Promise.all([
    listParticipants(db, edition.id),
    listCouples(db, groupId),
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
  return {
    participants,
    input: {
      participants: [...ids],
      couples: couples
        .filter((c) => c.active && ids.has(c.personAId) && ids.has(c.personBId))
        .map((c): [string, string] => [c.personAId, c.personBId]),
      manualExclusions: exclusions.filter(
        (e) => ids.has(e.giverId) && ids.has(e.receiverId),
      ),
      history: buildHistory(
        past.filter((a): a is PastAssignment => a !== null),
        pastIds,
      ),
    },
  };
};

export const deleteAssignments = (db: Db, editionId: string) =>
  db.delete(assignments).where(and(eq(assignments.editionId, editionId)));
