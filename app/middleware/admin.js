import { homeOf } from '../composables/queries/useSession.js';

// /admin is the login page; everything below needs a session, and
// /admin/groupes needs the super-admin.
export default defineNuxtRouteMiddleware((to) => {
  const { loggedIn, user } = useUserSession();
  if (to.path === '/admin' || to.path === '/admin/') {
    return loggedIn.value ? navigateTo(homeOf(user.value)) : undefined;
  }
  if (!loggedIn.value) return navigateTo('/admin');
  if (
    to.path.startsWith('/admin/groupes') &&
    user.value?.role !== 'super_admin'
  ) {
    return navigateTo(homeOf(user.value));
  }
  // A guardian only ever sees their own group.
  if (
    user.value?.role === 'guardian' &&
    to.params.slug &&
    to.params.slug !== user.value.groupSlug
  ) {
    return navigateTo(homeOf(user.value));
  }
  return undefined;
});
