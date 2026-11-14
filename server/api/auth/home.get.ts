import { useDb } from '#server/database/client';
import { findAccountById } from '#server/database/accounts';
import { listOrganizedGroups, publicGroup } from '#server/database/groups';
import {
  latestRequest,
  pendingRequestCount,
  quotaAccountOf,
} from '#server/database/quota';
import { remainingGroups } from '#server/utils/quota';
import {
  currentEditionSummaries,
  listParticipationsByEmail,
  wishesCounts,
} from '#server/database/home';
import { requireAccount } from '#server/http/auth';
import { dataKeyOf } from '#server/http/context';
import { avatarOf } from '#server/utils/avatars';
import { decrypt } from '#server/utils/crypto';
import { nextStep } from '#server/utils/personal';
import { mergeRules } from '#server/utils/rules';

// The home of a logged-in account, the same for everyone: the draws the
// address takes part in, the groups it organises, and whether it may
// create one or where its request stands. A super-admin also learns how
// many requests await them. A draw is opened through its
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
  const ideas = await wishesCounts(
    db,
    rows.map((row) => row.participation.id),
  );
  const draws = await Promise.all(
    rows.map(
      async ({ participation, edition, person, groupName, groupRules }) => {
        const merged = mergeRules(groupRules, edition.rulesOverride);
        const rules = merged.ok
          ? merged.value
          : { wishlist: false, eventDate: '' };
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
          step: nextStep({
            status: edition.status,
            revealed: participation.viewCount > 0,
            wishlist: rules.wishlist,
            wishesCount: ideas[participation.id] ?? 0,
          }),
          eventDate: rules.eventDate,
          firstName: person.firstName,
          avatar: avatarOf(person),
        };
      },
    ),
  );
  const managed = await listOrganizedGroups(db, user.accountId);
  const summaries = await currentEditionSummaries(
    db,
    managed.map((group) => group.id),
  );
  const request = account ? await latestRequest(db, account.id) : null;
  const quota = account ? await quotaAccountOf(db, account) : null;
  return {
    role: user.role,
    firstName: account?.firstName ?? null,
    lastName: account?.lastName ?? null,
    avatar: avatarOf({ id: user.accountId, ...account }),
    draws: draws.flatMap((draw) =>
      draw.path ? [{ ...draw, path: draw.path }] : [],
    ),
    groups: managed.map((group) => ({
      ...publicGroup(group),
      current: summaries[group.id] ?? null,
    })),
    ...(() => {
      const left = quota ? remainingGroups(quota) : 0;
      return {
        canCreateGroup: left > 0,
        // How many more groups; null when there is no limit.
        groupsLeft: Number.isFinite(left) ? left : null,
      };
    })(),
    request: request
      ? { status: request.status, createdAt: request.createdAt }
      : null,
    pendingRequests:
      user.role === 'super_admin' ? await pendingRequestCount(db) : 0,
  };
});
