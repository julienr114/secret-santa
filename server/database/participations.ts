import { and, eq } from 'drizzle-orm';
import type { H3Event } from 'h3';
import type { Db } from './client';
import { secretSantas, parties, participations, persons } from './schema';
import { decrypt } from '#server/utils/crypto';
import { appUrl } from '#server/http/context';

/** A participation of the given group, with its edition and person. */
export const findParticipation = async (
  db: Db,
  groupId: string,
  participationId: string,
) => {
  const [row] = await db
    .select({
      participation: participations,
      edition: secretSantas,
      person: persons,
    })
    .from(participations)
    .innerJoin(secretSantas, eq(secretSantas.id, participations.secretSantaId))
    .innerJoin(persons, eq(persons.id, participations.personId))
    .where(
      and(
        eq(participations.id, participationId),
        eq(secretSantas.partyId, groupId),
      ),
    )
    .limit(1);
  return row ?? null;
};

/**
 * The path of a personal page, rebuilt from the encrypted token.
 * @returns "/p/<token>".
 */
export const personalPath = async (
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
  return `/p/${token.value}`;
};

/** The personal link, rebuilt from the encrypted token (README 8.1). */
export const personalLink = async (
  event: H3Event,
  participation: { tokenEnc: string; tokenIv: string },
  dataKey: CryptoKey,
): Promise<string> => appUrl(event, await personalPath(participation, dataKey));

/**
 * The participation behind a personal link, with its edition, person and
 * group. The group comes from the link itself: there is no session here.
 */
export const findParticipationByTokenHash = async (
  db: Db,
  tokenHash: string,
) => {
  const [row] = await db
    .select({
      participation: participations,
      edition: secretSantas,
      person: persons,
      group: parties,
    })
    .from(participations)
    .innerJoin(secretSantas, eq(secretSantas.id, participations.secretSantaId))
    .innerJoin(persons, eq(persons.id, participations.personId))
    .innerJoin(parties, eq(parties.id, secretSantas.partyId))
    .where(eq(participations.tokenHash, tokenHash))
    .limit(1);
  return row ?? null;
};

/** People taking part in an edition, each with their participation id. */
export const listEditionPeople = (db: Db, editionId: string) =>
  db
    .select({ person: persons, participationId: participations.id })
    .from(participations)
    .innerJoin(persons, eq(persons.id, participations.personId))
    .where(eq(participations.secretSantaId, editionId));
