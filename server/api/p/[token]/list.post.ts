import { z } from 'zod';
import {
  linkDraw,
  listsIFigureOn,
  newListForDraw,
} from '#server/database/drawLists';
import { santaNameForSubject } from '#server/database/editions';
import { findMyListFor, myListFor } from '#server/database/listSharing';
import { nowIso } from '#server/http/context';
import { requireMyDraw, takeMyDraw } from '#server/http/drawList';
import { notFound } from '#server/http/errors';
import { validatedBody } from '#server/http/validate';
import { drawListTitle } from '#server/utils/lists';
import { localeOf } from '#shared/i18n';

// « Ma liste de cadeaux », from my Secret Santa (tickets 107, 136, 148):
// the list linked to it if I have one; else the list I chose among those
// where I figure (« Quelle liste pour ton Secret Santa ? »), given to the
// one who draws me on top of its sharing; else a new one, made for the
// event and kept for the one who drew me, with no draft in between, and
// me on it already, first (V3ListeSecretNouvelle), named « Idées pour le
// Secret Santa ».
const bodySchema = z
  .object({ list: z.string().min(1).max(40).optional() })
  .default({});

export default defineEventHandler(async (event) => {
  const context = await requireMyDraw(event);
  const { db, group, account, person, edition } = context;
  const { list: chosen } = await validatedBody(event, bodySchema);
  await takeMyDraw(context);
  const held = await findMyListFor(db, account.id, group.id);
  if (held) return { id: held.id, created: false };
  const now = nowIso();
  if (chosen) {
    const mine = await listsIFigureOn(db, account.id, group.id);
    if (!mine.some((list) => list.id === chosen)) throw notFound();
    await linkDraw(db, account.id, chosen, group.id, now);
    return { id: chosen, created: false };
  }
  const id = await myListFor(
    db,
    account.id,
    group,
    async () =>
      (
        await newListForDraw(
          db,
          account.id,
          group,
          drawListTitle(
            localeOf(person.language),
            await santaNameForSubject(db, edition),
          ),
        )
      ).id,
    now,
  );
  // Made here: its visit opens on it (ticket 149).
  return { id, created: true };
});
