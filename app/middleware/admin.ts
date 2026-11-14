import { HOME, LOGIN } from '~/composables/queries/useSession';

// Pages of a logged-in account. Everything under /admin is for organisers
// and super-admins: a plain member is sent home. The style guide and the
// creation of a group are for super-admins. Which groups an organiser may
// open is decided by the server.
const SUPER_ONLY = ['/admin/guide-de-style', '/admin/groupes/nouveau'];

export default defineNuxtRouteMiddleware((to) => {
  const { loggedIn, user } = useUserSession();
  if (!loggedIn.value) return navigateTo(LOGIN);
  if (to.path.startsWith('/admin') && user.value?.role === 'member') {
    return navigateTo(HOME);
  }
  if (
    SUPER_ONLY.some((path) => to.path.startsWith(path)) &&
    user.value?.role !== 'super_admin'
  ) {
    return navigateTo(HOME);
  }
  return undefined;
});
