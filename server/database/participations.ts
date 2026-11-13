import { and, eq } from 'drizzle-orm';
import type { H3Event } from 'h3';
import type { Db } from './client';
import { editions, participations, persons } from './schema';
import { decrypt } from '#server/utils/crypto';
import { secretsOf } from '#server/http/context';

/** A participation of the given group, with its edition and person. */
export const findParticipation = async (
  db: Db,
  groupId: string,
  participationId: string,
) => {
  const [row] = await db
    .select({
      participation: participations,
      edition: editions,
      person: persons,
    })
    .from(participations)
    .innerJoin(editions, eq(editions.id, participations.editionId))
    .innerJoin(persons, eq(persons.id, participations.personId))
    .where(
      and(
        eq(participations.id, participationId),
        eq(editions.groupId, groupId),
      ),
    )
    .limit(1);
  return row ?? null;
};

/** The personal link, rebuilt from the encrypted token (README 8.1). */
export const personalLink = async (
  event: H3Event,
  participation: { tokenEnc: string; tokenIv: string },
  dataKey: CryptoKey,
): Promise<string> => {
  const token = await decrypt(
    { enc: participation.tokenEnc, iv: participation.tokenIv },
    dataKey,
  );
  if (!token.ok) {
    throw createError({ statusCode: 500, statusMessage: 'token_unreadable' });
  }
  const base = secretsOf(event).baseUrl || getRequestURL(event).origin;
  return `${base.replace(/\/$/, '')}/p/${token.value}`;
};
