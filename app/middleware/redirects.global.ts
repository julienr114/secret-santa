import {
  hintsPathOf,
  invitationPathOf,
  listsPathOf,
  partyPathOf,
  pastPathOf,
} from '#shared/utils/navigation';

// The old addresses (docs/spec/v3/navigation.md, « Les anciennes
// adresses ») never give an error page: those of a group lead to its party
// (ticket 104), those of the gift hints to my list (ticket 107), « Tirages
// passés » to « Les événements passés » (ticket 108), « Listes » to the
// home (ticket 114), the invitation link of an event to its members
// (ticket 116), links in emails already sent included, with their query.
export default defineNuxtRouteMiddleware((to) => {
  const moved =
    partyPathOf(to.path) ??
    invitationPathOf(to.path) ??
    hintsPathOf(to.path) ??
    pastPathOf(to.path) ??
    listsPathOf(to.path);
  return moved
    ? navigateTo({ path: moved, query: to.query }, { redirectCode: 301 })
    : undefined;
});
