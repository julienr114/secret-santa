import { useApiMutation, api } from './useApi.js';

// Session comes from nuxt-auth-utils (useUserSession); these mutations
// refresh it after login and logout.
export const useLoginMutation = () => {
  const { fetch } = useUserSession();
  return useApiMutation(async (body) => {
    const result = await api('/api/admin/login', { method: 'POST', body });
    await fetch();
    return result;
  });
};

export const useLogoutMutation = () => {
  const { clear } = useUserSession();
  return useApiMutation(async () => {
    await api('/api/admin/logout', { method: 'POST' });
    await clear();
  });
};

/** Where a logged-in user lands. */
export const homeOf = (user) =>
  user?.role === 'super_admin'
    ? '/admin/groupes'
    : `/admin/${user?.groupSlug ?? ''}`;
