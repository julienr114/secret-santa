import { partyPathOf } from '#shared/utils/navigation';

// The old addresses of a group lead to its party (ticket 104), links in
// emails already sent included, with their query.
export default defineNuxtRouteMiddleware((to) => {
  const moved = partyPathOf(to.path);
  return moved
    ? navigateTo({ path: moved, query: to.query }, { redirectCode: 301 })
    : undefined;
});
