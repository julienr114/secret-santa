import { updateList } from '#server/database/lists';
import { requireHeldList } from '#server/http/lists';
import { validatedBody } from '#server/http/validate';
import { listPatchSchema } from '#server/utils/listSchemas';

// What a list says of itself, changed in the document by touching it: its
// icon, name, date and word. Saved as it is typed, no button (README
// 22.19). The word, once changed, is the holder's; erased, there is none.
export default defineEventHandler(async (event) => {
  const { db, list } = await requireHeldList(event);
  const body = await validatedBody(event, listPatchSchema);
  await updateList(db, list.id, {
    ...(body.title === undefined ? {} : { title: body.title }),
    ...(body.eventDate === undefined ? {} : { eventDate: body.eventDate }),
    ...(body.note === undefined
      ? {}
      : { note: body.note || null, noteEdited: true }),
    ...(body.icon
      ? { iconEmoji: body.icon.emoji, iconColor: body.icon.color }
      : {}),
  });
  return { ok: true };
});
