import { useDb } from '#server/database/client';
import { findMember, memberOf } from '#server/database/lists';
import { requireAccount } from '#server/http/auth';
import { notFound } from '#server/http/errors';
import { todayIso } from '#server/http/lists';
import { ageOn } from '#server/utils/lists';

// A person of my family (ListePersonne): their practical details and
// their tastes.
export default defineEventHandler(async (event) => {
  const user = await requireAccount(event);
  const row = await findMember(
    useDb(event),
    user.accountId,
    getRouterParam(event, 'id') ?? '',
  );
  if (!row) throw notFound();
  const member = memberOf(row);
  return {
    member: {
      ...member,
      age: member.birthDate ? ageOn(member.birthDate, todayIso()) : null,
    },
  };
});
