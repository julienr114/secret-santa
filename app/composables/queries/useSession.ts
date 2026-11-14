import { api, useApiMutation } from './useApi';

// The session comes from nuxt-auth-utils (useUserSession). Logging in is
// in useAuth (magic link); this is the way out.

export const useLogoutMutation = () => {
  const { clear } = useUserSession();
  return useApiMutation<null, undefined>(async () => {
    await api('/api/admin/logout', { method: 'POST' });
    await clear();
    return null;
  });
};

/** Where a logged-in user lands: their draws and their groups. */
export const HOME = '/';
/** The login page: an address, then a link in the mailbox. */
export const LOGIN = '/login';
