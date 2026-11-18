import type { H3Event } from 'h3';
import { useDb } from '#server/database/client';
import { findListByToken } from '#server/database/lists';
import { notFound } from '#server/http/errors';

/**
 * A shared list, by the token of its link; 404 for an unknown or replaced
 * link.
 * @param event - The request, with the token in its path.
 * @returns The database and the list.
 */
export const listOfLink = async (event: H3Event) => {
  const db = useDb(event);
  const list = await findListByToken(db, getRouterParam(event, 'token') ?? '');
  if (!list) throw notFound();
  return { db, list };
};
