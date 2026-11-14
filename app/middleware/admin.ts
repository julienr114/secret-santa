import { HOME, LOGIN } from '~/composables/queries/useSession';

// Pages of a logged-in account. Creating a group is open to any account:
// the server checks its quota. The rest of /admin is for organisers and
// super-admins, and some pages for super-admins only. Which groups an
// organiser may open is decided by the server.
const NEW_GROUP = '/admin/groupes/nouveau';
const SUPER_ONLY = [
  '/admin/guide-de-style',
  '/admin/comptes',
  '/admin/groupes',
];

export default defineNuxtRouteMiddleware(async (to) => {
  const { loggedIn, user, fetch } = useUserSession();
  if (!loggedIn.value) return navigateTo(LOGIN);
  if (!to.path.startsWith('/admin') || to.path === NEW_GROUP) return undefined;
  // The role may have changed since the session was read: a member who
  // was just made an organiser must not be turned away.
  if (user.value?.role === 'member') await fetch();
  if (!loggedIn.value) return navigateTo(LOGIN);
  const superOnly = SUPER_ONLY.some(
    (path) => to.path === path || to.path.startsWith(`${path}/`),
  );
  return user.value?.role === 'member' ||
    (superOnly && user.value?.role !== 'super_admin')
    ? navigateTo(HOME)
    : undefined;
});
