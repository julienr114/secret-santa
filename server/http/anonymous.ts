import type { H3Event } from 'h3';
import { findAccountById } from '#server/database/accounts';
import {
  findMode,
  givesToSomeoneOn,
  saveMode,
} from '#server/database/anonymous';
import type { Db } from '#server/database/client';
import type { GiftListRow } from '#server/database/schema';
import { dataKeyOf, secretsOf } from '#server/http/context';
import { todayIso } from '#server/http/lists';
import {
  modeView,
  settleMode,
  signParticipation,
  verifyParticipation,
  type ModeView,
} from '#server/utils/anonymous';

// « Mode anonyme » on a list opened by its link (lot 27 ter), as the
// routes use it.

/**
 * My mode on a list as I open it by its link, settled and kept: under my
 * first name unless the address asks otherwise, I have no first name, or
 * the server finds that, in a draw still secret, I give to someone the
 * list is about. That is looked for once: after its note, the switch is
 * mine. Nothing says which draw nor who.
 * @param event - The request, with `anonyme` and `p` in its query.
 * @param db - The database.
 * @param list - The list.
 * @param accountId - The account looking; not one of those who hold it.
 * @returns What the bar shows.
 */
export const openMode = async (
  event: H3Event,
  db: Db,
  list: GiftListRow,
  accountId: string,
): Promise<ModeView> => {
  const row = await findMode(db, list.id, accountId);
  const query = getQuery(event);
  const account = await findAccountById(db, accountId);
  // The draw is read only while it may still turn the mode on.
  const detected =
    row.notice === null && account
      ? await givesToSomeoneOn(
          db,
          list.id,
          {
            email: account.email,
            participationId: await verifyParticipation(
              typeof query.p === 'string' ? query.p : null,
              secretsOf(event).dataKey,
            ),
          },
          await dataKeyOf(event),
          todayIso(),
        )
      : false;
  const next = settleMode(row, {
    detected,
    asked: query.anonyme !== undefined,
    named: Boolean(account?.firstName),
  });
  if (next.anonymous !== row.anonymous || next.notice !== row.notice) {
    await saveMode(db, list.id, accountId, next);
  }
  return modeView(next);
};

/**
 * Whether my next tick on a list is anonymous, when the tick itself does
 * not say: my setting for that list.
 * @param db - The database.
 * @param listId - The list.
 * @param accountId - The account ticking.
 * @returns True for « Anonyme ».
 */
export const ticksAnonymous = async (
  db: Db,
  listId: string,
  accountId: string,
): Promise<boolean> =>
  (await findMode(db, listId, accountId)).anonymous === true;

/**
 * The address of a gift list for the one who gives, from their draw: the
 * list opens in anonymous mode, and carries their participation, signed,
 * so that the list finds their draw even opened with another address.
 * @param event - The request.
 * @param shareToken - The token of the list's link.
 * @param participationId - The participation of the one who gives.
 * @returns The path to open.
 */
export const listPathFromDraw = async (
  event: H3Event,
  shareToken: string,
  participationId: string,
): Promise<string> =>
  `/l/${shareToken}?anonyme=1&p=${encodeURIComponent(
    await signParticipation(participationId, secretsOf(event).dataKey),
  )}`;
