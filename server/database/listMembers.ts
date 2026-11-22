import { and, eq } from 'drizzle-orm';
import type { Db } from './client';
import { giftListParties, parties } from './schema';
import type { OwnStage } from '#shared/utils/members';

// The event a list makes people come into (ticket 117, docs/spec/v3/
// listes.md, « Inviter quelqu'un »): only its own, the occasion chosen at
// its creation, never another event it is shared in.

/**
 * The event a list was made for, and the list's stage there.
 * @param db - The database.
 * @param list - The list.
 * @param list.id - Its id.
 * @param list.partyId - The event it was made for.
 * @returns The event and the stage, or null without an event.
 */
export const ownEventOf = async (
  db: Db,
  list: { id: string; partyId: string | null },
): Promise<{
  party: typeof parties.$inferSelect;
  stage: OwnStage;
} | null> => {
  if (!list.partyId) return null;
  const [row] = await db
    .select({ party: parties, visibility: giftListParties.visibility })
    .from(parties)
    .leftJoin(
      giftListParties,
      and(
        eq(giftListParties.partyId, parties.id),
        eq(giftListParties.listId, list.id),
      ),
    )
    .where(eq(parties.id, list.partyId))
    .limit(1);
  if (!row) return null;
  return { party: row.party, stage: row.visibility ?? null };
};
