import { homeOf } from '~/composables/queries/useSession';

// /admin is the login page; everything below needs a session, and
// /admin/groupes needs the super-admin. A guardian only sees their group.
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
  const slug = typeof to.params.slug === 'string' ? to.params.slug : null;
  if (
    user.value?.role === 'guardian' &&
    slug &&
    slug !== user.value.groupSlug
  ) {
    return navigateTo(homeOf(user.value));
  }
  return undefined;
});
