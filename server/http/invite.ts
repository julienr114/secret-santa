import type { H3Event } from 'h3';
import { useDb, type Db } from '#server/database/client';
import { findInvite } from '#server/database/invite';
import { notFound } from './errors';
import { INVITE_CODE_SHAPE } from '#server/utils/invite';

/** The Secret Santa of an invitation link, with its event. */
export type InviteContext = NonNullable<
  Awaited<ReturnType<typeof findInvite>>
> & {
  db: Db;
};

/**
 * Guard of /api/invite/[code]/*: the code of the route must open a
 * Secret Santa. A malformed, unknown or closed code gets the same 404.
 * @param event - The request.
 * @returns The Secret Santa, its event and the database.
 */
export const requireInvite = async (event: H3Event): Promise<InviteContext> => {
  const code = getRouterParam(event, 'code') ?? '';
  if (!INVITE_CODE_SHAPE.test(code)) throw notFound('invite_invalid');
  const db = useDb(event);
  const row = await findInvite(db, code);
  if (!row) throw notFound('invite_invalid');
  return { ...row, db };
};
