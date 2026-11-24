import { findAccountById } from '#server/database/accounts';
import { amOnList, linkChoicesOf, linkDraw } from '#server/database/drawLists';
import { nowIso } from '#server/http/context';
import { notFound } from '#server/http/errors';
import { requireManagedList } from '#server/http/lists';

// « Lier à mon Secret Santa » (docs/spec/v3/listes.md, « Lier et
// délier », ticket 148): a list I manage and figure on, to one of my
// Secret Santa of the year whose draw is done. Linked elsewhere, it moves
// here.
export default defineEventHandler(async (event) => {
  const { db, list, user } = await requireManagedList(event, 'share');
  const partyId = getRouterParam(event, 'partyId') ?? '';
  const account = await findAccountById(db, user.accountId);
  if (!account || !(await amOnList(db, list.id, account.id))) {
    throw notFound();
  }
  const choices = await linkChoicesOf(db, list.id, account);
  if (!choices.some((choice) => choice.partyId === partyId)) throw notFound();
  await linkDraw(db, account.id, list.id, partyId, nowIso());
  return { ok: true };
});
