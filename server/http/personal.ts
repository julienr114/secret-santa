import type { H3Event } from 'h3';
import { useDb, type Db } from '#server/database/client';
import { findParticipationByTokenHash } from '#server/database/participations';
import { notFound, unwrap } from './errors';
import { hashToken } from '#server/utils/crypto';
import { mergeRules, type Rules } from '#server/utils/rules';
import { requireOpenYear } from '#server/database/years';
import { writes } from './edition';

// Guard of /api/p/[token]/* (README 8.1): the personal link is the only
// credential. An unknown, malformed or regenerated token gets the same 404.

const TOKEN_SHAPE = /^[A-Za-z0-9_-]{43}$/;

export type PersonalContext = { db: Db; rules: Rules } & NonNullable<
  Awaited<ReturnType<typeof findParticipationByTokenHash>>
>;

/**
 * The participation of a personal link. A request that writes is refused
 * once the year of its Secret Santa is over (ticket 108), unless
 * `afterTheYear`: opening one's envelope, marking what one has seen and
 * one's language stay possible.
 */
export const requirePersonalLink = async (
  event: H3Event,
  options: { afterTheYear?: boolean } = {},
): Promise<PersonalContext> => {
  const token = getRouterParam(event, 'token') ?? '';
  if (!TOKEN_SHAPE.test(token)) throw notFound('link_invalid');
  const db = useDb(event);
  const row = await findParticipationByTokenHash(db, await hashToken(token));
  if (!row) throw notFound('link_invalid');
  if (writes(event) && !options.afterTheYear) {
    await requireOpenYear(db, row.edition.partyId, row.edition.yearId);
  }
  const rules = unwrap(mergeRules(row.edition.rules));
  return { db, rules, ...row };
};
