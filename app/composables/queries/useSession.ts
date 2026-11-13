import type { SessionUser } from '#server/utils/auth';
import { api, useApiMutation } from './useApi';

type LoginBody = { scope: string; password: string };
type LoginResponse = { user: SessionUser };

// Session comes from nuxt-auth-utils (useUserSession); these mutations
// refresh it after login and logout.
export const useLoginMutation = () => {
  const { fetch } = useUserSession();
  return useApiMutation<LoginResponse, LoginBody>(async (body) => {
    const result = await api<LoginResponse>('/api/admin/login', {
      method: 'POST',
      body,
    });
    await fetch();
    return result;
  });
};

export const useLogoutMutation = () => {
  const { clear } = useUserSession();
  return useApiMutation<null, undefined>(async () => {
    await api('/api/admin/logout', { method: 'POST' });
    await clear();
    return null;
  });
};

/** Where a logged-in user lands. */
export const homeOf = (
  user: Partial<SessionUser> | null | undefined,
): string =>
  user?.role === 'super_admin'
    ? '/admin/groupes'
    : `/admin/${user?.groupSlug ?? ''}`;
