import type { H3Event } from 'h3';
import { requireAccount } from '#server/http/auth';

// When the app asks for its session, answer with the role the account has
// now, not the one sealed in the cookie at login: a member who creates a
// group, or an organiser taken off theirs, sees the right screens at
// once. A revoked session fails here, which logs the app out.
export default defineNitroPlugin(() => {
  sessionHooks.hook('fetch', async (session, event) => {
    if (!session.user) return;
    // The hook works by changing the session it is given.
    Object.assign(session, {
      user: await requireAccount(event as unknown as H3Event),
    });
  });
});
