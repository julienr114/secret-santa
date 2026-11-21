import { asc, eq } from 'drizzle-orm';
import type { Db } from './client';
import { wishes } from './schema';

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
