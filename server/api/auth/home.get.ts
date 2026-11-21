import { useDb } from '#server/database/client';
import { findAccountById } from '#server/database/accounts';
import { listParticipationsByEmail } from '#server/database/home';
import { requireAccount } from '#server/http/auth';
import { dataKeyOf } from '#server/http/context';
import { decrypt } from '#server/utils/crypto';

// What the screens of before the V3 home still ask of the account (ticket
// 103): its draws, for « Tirages passés » (until ticket 108). The home itself is
// /api/home. A draw is opened through its personal link: the address was
// proven by the login link, and it is the one the organiser gave for that
// person. Never a result here.
export default defineEventHandler(async (event) => {
  const user = await requireAccount(event);
  const db = useDb(event);
  const account = await findAccountById(db, user.accountId);
  const rows = account
    ? await listParticipationsByEmail(db, account.email)
    : [];
  const dataKey = rows.length > 0 ? await dataKeyOf(event) : null;
  const draws = await Promise.all(
    rows.map(async ({ participation, edition, groupName }) => {
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
        year: edition.year,
        status: edition.status,
      };
    }),
  );
  return {
    draws: draws.flatMap((draw) =>
      draw.path ? [{ ...draw, path: draw.path }] : [],
    ),
  };
});
