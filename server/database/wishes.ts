import { asc, eq } from 'drizzle-orm';
import type { Db } from './client';
import { wishes } from './schema';
import type { Wish } from '#server/utils/wishes';
import { newId, nowIso } from '#server/http/context';
import { touchHints } from './participations';

export type PublicWish = { label: string; url: string | null };

/** The wish list of a participation, in display order. */
export const listWishes = (
  db: Db,
  participationId: string,
): Promise<PublicWish[]> =>
  db
    .select({ label: wishes.label, url: wishes.url })
    .from(wishes)
    .where(eq(wishes.participationId, participationId))
    .orderBy(asc(wishes.position));

/**
 * Replaces the whole list in one transaction (README 6 bis.3). One insert
 * per wish: D1 caps a statement at 100 bound parameters.
 */
export const replaceWishes = (
  db: Db,
  participationId: string,
  list: Wish[],
) => {
  const createdAt = nowIso();
  return db.batch([
    touchHints(db, participationId, createdAt),
    db.delete(wishes).where(eq(wishes.participationId, participationId)),
    ...list.map((wish) =>
      db
        .insert(wishes)
        .values({ id: newId(), participationId, createdAt, ...wish }),
    ),
  ]);
};
