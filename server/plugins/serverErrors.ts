import { useDb } from '#server/database/client';
import { countUp } from '#server/database/counters';
import { nowIso } from '#server/http/context';

// « Erreurs du serveur » on the dashboard (ticket 129, V3Admin): every
// answer of 500 or more is counted by day. Nothing of the request is
// kept: no path, no address, no message.
export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('error', async (error, { event }) => {
    const status = (error as { statusCode?: number }).statusCode ?? 500;
    if (!event || status < 500) return;
    // The database may be what failed: never an error of its own here.
    try {
      await countUp(useDb(event), 'server_error', nowIso().slice(0, 10));
    } catch {
      // Not counted.
    }
  });
});
