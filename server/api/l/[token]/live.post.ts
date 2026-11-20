import { optionalAccount } from '#server/http/auth';
import { listOfLink } from '#server/http/listLink';
import { roleOnList } from '#server/http/lists';
import { liveTicket } from '#server/http/live';

// The ticket to watch a list live by its link (lot 26, README 22.20).
// Whoever holds the list is there as such; whoever figures on it and
// writes their own ideas is there as that person, for the lines they
// write; everyone else, with or without an account, is a visitor:
// counted, never named.
export default defineEventHandler(async (event) => {
  const { db, list } = await listOfLink(event);
  const user = await optionalAccount(event);
  const { role, people } = await roleOnList(db, list, user?.accountId ?? null);
  return liveTicket(
    event,
    db,
    list.id,
    role === 'guest' ? 'visitor' : role,
    user?.accountId ?? null,
    people
      .filter((person) => person.member.accountId === user?.accountId)
      .map((person) => person.id),
  );
});
