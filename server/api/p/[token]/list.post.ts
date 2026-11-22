import { z } from 'zod';
import {
  giveListToDraw,
  listsIFigureOn,
  newListForDraw,
} from '#server/database/drawLists';
import { findMyListFor, myListFor } from '#server/database/listSharing';
import { nowIso } from '#server/http/context';
import { requireMyDraw, takeMyDraw } from '#server/http/drawList';
import { notFound } from '#server/http/errors';
import { validatedBody } from '#server/http/validate';

// « Ma liste de cadeaux », from my Secret Santa (tickets 107, 136): my
// list for the event if I have one; else the list I chose among those
// where I figure (« Quelle liste pour ton Secret Santa ? »), given to the
// one who draws me on top of its sharing; else a new one, made for the
// event and kept for the one who drew me, with no draft in between, and
// me on it already, first (V3ListeSecretNouvelle).
const bodySchema = z
  .object({ list: z.string().min(1).max(40).optional() })
  .default({});

export default defineEventHandler(async (event) => {
  const context = await requireMyDraw(event);
  const { db, group, account } = context;
  const { list: chosen } = await validatedBody(event, bodySchema);
  await takeMyDraw(context);
  const held = await findMyListFor(db, account.id, group.id);
  if (held) return { id: held.id };
  const now = nowIso();
  if (chosen) {
    const mine = await listsIFigureOn(db, account.id, group.id);
    if (!mine.some((list) => list.id === chosen)) throw notFound();
    await giveListToDraw(db, chosen, group.id, now);
    return { id: chosen };
  }
  const id = await myListFor(
    db,
    account.id,
    group,
    async () => (await newListForDraw(db, account.id, group)).id,
    now,
  );
  return { id };
});
