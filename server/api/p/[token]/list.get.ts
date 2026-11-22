import { listsIFigureOn } from '#server/database/drawLists';
import { findMyListFor } from '#server/database/listSharing';
import { requireMyDraw } from '#server/http/drawList';
import { drawListOrder } from '#shared/utils/drawLists';
import { forWhom } from '#shared/utils/lines';

// « Quelle liste pour ton Secret Santa ? » (ticket 136,
// V3TirageQuelleListe): my list for the event if I have one; else the
// lists I manage this year where I figure, the one chosen beforehand
// first (the same event, else the same category, else the most recent),
// each with whom it is for and its events. Nothing is changed here.
export default defineEventHandler(async (event) => {
  const { db, group, account } = await requireMyDraw(event);
  const held = await findMyListFor(db, account.id, group.id);
  if (held) return { list: held.id, choices: [] };
  const lists = await listsIFigureOn(db, account.id, group.id);
  const order = drawListOrder(
    { id: group.id, category: group.category },
    lists,
  );
  return {
    list: null,
    choices: order.flatMap((id) => {
      const list = lists.find((one) => one.id === id);
      if (!list) return [];
      return [
        {
          id: list.id,
          title: list.title,
          forWhom: forWhom(list.people),
          events: list.events.map((one) => one.name),
        },
      ];
    }),
  };
});
