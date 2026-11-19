import type { H3Event } from 'h3';
import { useDb } from '#server/database/client';
import { findListByToken } from '#server/database/lists';
import { requireAccount } from '#server/http/auth';
import { notFound } from '#server/http/errors';
import { roleOnList } from '#server/http/lists';
import { canWriteIdeas } from '#server/utils/listAccess';

/**
 * A shared list, by the token of its link; 404 for an unknown or replaced
 * link, 410 for a list whose sharing was stopped (its link is kept for
 * the day it is shared again).
 * @param event - The request, with the token in its path.
 * @returns The database and the list.
 */
export const listOfLink = async (event: H3Event) => {
  const db = useDb(event);
  const list = await findListByToken(db, getRouterParam(event, 'token') ?? '');
  if (!list) throw notFound();
  if (!list.sharedAt) {
    throw createError({ statusCode: 410, statusMessage: 'list_unshared' });
  }
  return { db, list };
};

/**
 * A shared list by its link, for someone logged in who writes ideas on
 * it: what they may write is their own section, when a person of the
 * list is linked to their account (those who hold it, everything).
 * @param event - The request, with the token in its path.
 * @returns The database, the list, and who they may write for.
 */
export const requireLinkWriter = async (event: H3Event) => {
  const user = await requireAccount(event);
  const { db, list } = await listOfLink(event);
  const { role, people } = await roleOnList(db, list, user.accountId);
  const may = (listPersonId: string) => {
    const person = people.find((p) => p.id === listPersonId);
    return Boolean(
      person &&
      canWriteIdeas(
        role,
        { linkedAccountId: person.member.accountId },
        user.accountId,
      ),
    );
  };
  return { db, list, user, may };
};
