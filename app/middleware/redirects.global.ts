import { hintsPathOf, partyPathOf, pastPathOf } from '#shared/utils/navigation';

// The old addresses of a group lead to its party (ticket 104), and those
// of the gift hints to my list (ticket 107), « Tirages passés » to « Les
// événements passés » (ticket 108), links in emails already sent
// included, with their query.
export default defineNuxtRouteMiddleware((to) => {
  const moved =
    partyPathOf(to.path) ?? hintsPathOf(to.path) ?? pastPathOf(to.path);
  return moved
    ? navigateTo({ path: moved, query: to.query }, { redirectCode: 301 })
    : undefined;
});
