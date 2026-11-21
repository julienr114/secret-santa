import { hintsPathOf, partyPathOf } from '#shared/utils/navigation';

// The old addresses of a group lead to its party (ticket 104), and those
// of the gift hints to my list (ticket 107), links in emails already sent
// included, with their query.
export default defineNuxtRouteMiddleware((to) => {
  const moved = partyPathOf(to.path) ?? hintsPathOf(to.path);
  return moved
    ? navigateTo({ path: moved, query: to.query }, { redirectCode: 301 })
    : undefined;
});
