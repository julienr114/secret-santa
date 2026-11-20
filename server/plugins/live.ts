import { useDb } from '#server/database/client';
import { findListByToken, placesOfMember } from '#server/database/lists';
import { signalList } from '#server/http/live';
import { liveTarget } from '#server/utils/live';

// After every write that changed a list (lot 26, README 22.20): its room
// is told, and each browser that has the list open reads its own view
// again. One place for every route, by its path: an idea, a tick, a gift
// off the list, a person, the order, the name, the sharing; and the
// page of one of my people, for every list they are on. The word
// goes after the answer, and never delays nor fails it.
export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('afterResponse', (event) => {
    const target = liveTarget(
      event.method,
      getRequestURL(event).pathname,
      getResponseStatus(event),
    );
    if (!target) return;
    const tell = async () => {
      const db = useDb(event);
      // One of my people changed: every list they are on is told.
      const listIds =
        'listId' in target
          ? [target.listId]
          : 'token' in target
            ? [(await findListByToken(db, target.token))?.id]
            : (await placesOfMember(db, target.memberId)).places.map(
                (place) => place.list.id,
              );
      for (const listId of listIds) {
        if (listId) await signalList(event, listId);
      }
    };
    event.waitUntil(tell().catch(() => undefined));
  });
});
