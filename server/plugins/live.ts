import { useDb } from '#server/database/client';
import { findListByToken } from '#server/database/lists';
import { signalList } from '#server/http/live';
import { liveTarget } from '#server/utils/live';

// After every write that changed a list (lot 26, README 22.20): its room
// is told, and each browser that has the list open reads its own view
// again. One place for every route, by its path: an idea, a tick, a gift
// off the list, a person, the order, the name, the sharing. The word
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
      const listId =
        'listId' in target
          ? target.listId
          : (await findListByToken(useDb(event), target.token))?.id;
      if (listId) await signalList(event, listId);
    };
    event.waitUntil(tell().catch(() => undefined));
  });
});
