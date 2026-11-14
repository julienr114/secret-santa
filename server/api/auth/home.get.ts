import { useDb } from '#server/database/client';
import { findAccountById } from '#server/database/accounts';
import { listManagedGroups, publicGroup } from '#server/database/groups';
import { listParticipationsByEmail } from '#server/database/home';
import { requireAccount } from '#server/http/auth';
import { dataKeyOf } from '#server/http/context';
import { avatarOf } from '#server/utils/avatars';
import { decrypt } from '#server/utils/crypto';

// The home of a logged-in account, the same for everyone: the draws the
// address takes part in, then the groups it manages (all of them for a
// super-admin, none for a plain member). A draw is opened through its
// personal link: the address was proven by the login link, and it is the
// one the organiser gave for that person. Never a result here.
export default defineEventHandler(async (event) => {
  const user = await requireAccount(event);
  const db = useDb(event);
  const account = await findAccountById(db, user.accountId);
  const rows = account
    ? await listParticipationsByEmail(db, account.email)
    : [];
  const dataKey = rows.length > 0 ? await dataKeyOf(event) : null;
  const draws = await Promise.all(
    rows.map(async ({ participation, edition, person, groupName }) => {
      const token = dataKey
        ? await decrypt(
            { enc: participation.tokenEnc, iv: participation.tokenIv },
            dataKey,
          )
        : null;
      return {
        id: participation.id,
        path: token?.ok ? `/p/${token.value}` : null,
        groupName,
        editionLabel: edition.label,
        status: edition.status,
        firstName: person.firstName,
        avatar: avatarOf(person),
      };
    }),
  );
  const managed = await listManagedGroups(db, user);
  return {
    role: user.role,
    draws: draws.flatMap((draw) =>
      draw.path ? [{ ...draw, path: draw.path }] : [],
    ),
    groups: managed.map(publicGroup),
  };
});
