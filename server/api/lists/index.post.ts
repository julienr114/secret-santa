import { useDb } from '#server/database/client';
import { countLists } from '#server/database/caps';
import { createList, findHeldList, resumeList } from '#server/database/lists';
import { notFound } from '#server/http/errors';
import { requireRoom } from '#server/http/caps';
import { requireAccount } from '#server/http/auth';
import { partyFor } from '#server/http/party';
import { occasionDate } from '#server/database/listSharing';
import { validatedBody } from '#server/http/validate';
import { newListSchema } from '#server/utils/listSchemas';
import { listIconOfParty } from '#server/utils/lists';
import { partyEmoji } from '#shared/utils/categories';

// A new list, as a draft (docs/spec/v3/listes.md, « Une nouvelle liste »):
// for one of my events, whose name, date and icon it takes, or made by the
// document's first change on the screens of before.
// Any account may hold lists, without a quota, up to a wide cap (lot
// 38 A).
export default defineEventHandler(async (event) => {
  const user = await requireAccount(event);
  const body = await validatedBody(event, newListSchema);
  const db = useDb(event);
  await requireRoom('lists', countLists(db, user.accountId));
  // « Reprendre cette liste » (lot 27): a list I hold, or nothing.
  const source = body.from
    ? await findHeldList(db, user.accountId, body.from)
    : null;
  if (body.from && !source) throw notFound();
  // Made for one of my events: its name, its date and its icon.
  const occasion = body.party ? await partyFor(db, user, body.party) : null;
  const id = await createList(
    db,
    user.accountId,
    occasion
      ? {
          icon: listIconOfParty(
            {
              emoji: partyEmoji(occasion.party),
              color: occasion.party.iconColor,
            },
            (n) => crypto.getRandomValues(new Uint32Array(1))[0]! % n,
          ),
          title: occasion.party.name,
          eventDate: await occasionDate(db, occasion.party),
          partyId: occasion.party.id,
        }
      : body,
  );
  if (source) {
    const list = await findHeldList(db, user.accountId, id);
    if (list) await resumeList(db, list, source);
  }
  setResponseStatus(event, 201);
  return { id };
});
