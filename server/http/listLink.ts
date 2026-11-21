import type { H3Event } from 'h3';
import { useDb } from '#server/database/client';
import { findAccountById } from '#server/database/accounts';
import { findHolding, findListByToken } from '#server/database/lists';
import { drewHolderWhere } from '#server/database/anonymous';
import {
  memberWhereShared,
  sharedEventsOf,
} from '#server/database/listSharing';
import { dataKeyOf, secretsOf } from '#server/http/context';
import { verifyParticipation } from '#server/utils/anonymous';
import { optionalAccount, requireAccount } from '#server/http/auth';
import { roleOnList, settleArrivals } from '#server/http/lists';
import { canWriteIdeas, listArrival } from '#server/utils/listAccess';

/**
 * A list by the token of its link, for whoever may get in (docs/spec/v3/
 * listes.md, « Arriver par le lien »): those who hold it, the members of
 * an event it is shared in, the one who drew a holder where it is kept
 * for that one (by their account, or the participation their link
 * vouched for), everyone once it is public. Anyone else gets
 * the same refusal whether the list exists or not, so that a link says
 * nothing: 401 `list_login` without a session, 403 `list_not_shared`
 * with one.
 * @param event - The request, with the token in its path.
 * @returns The database and the list.
 */
export const listOfLink = async (event: H3Event) => {
  const db = useDb(event);
  const user = await optionalAccount(event);
  const list = await findListByToken(db, getRouterParam(event, 'token') ?? '');
  const account = user ? await findAccountById(db, user.accountId) : null;
  if (account) await settleArrivals(db, account.id);
  const holder = Boolean(
    list && account && (await findHolding(db, account.id, list.id)),
  );
  const member = Boolean(
    list &&
    account &&
    !holder &&
    (await memberWhereShared(db, list.id, account)),
  );
  const giver =
    list && !holder && !member && !list.sharedAt
      ? await drewHolderWhere(
          db,
          list.id,
          (await sharedEventsOf(db, list.id))
            .filter((row) => row.visibility === 'giver')
            .map((row) => row.id),
          {
            email: account?.email ?? '',
            participationId: await verifyParticipation(
              typeof getQuery(event).p === 'string'
                ? String(getQuery(event).p)
                : null,
              secretsOf(event).dataKey,
            ),
          },
          await dataKeyOf(event),
        )
      : false;
  const arrival = listArrival({
    loggedIn: Boolean(account),
    holder,
    isPublic: Boolean(list?.sharedAt),
    member,
    giver,
  });
  if (list && arrival === 'open') return { db, list };
  throw account
    ? createError({ statusCode: 403, statusMessage: 'list_not_shared' })
    : createError({ statusCode: 401, statusMessage: 'list_login' });
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
