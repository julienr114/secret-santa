import { eq } from 'drizzle-orm';
import type { H3Event } from 'h3';
import { useDb, type Db } from '#server/database/client';
import { parties, type PartyRow } from '#server/database/schema';
import { findSession, touchSession } from '#server/database/accounts';
import { nowIso } from './context';
import { activeSession, shouldTouchSession } from '#server/utils/accounts';
import { isOrganizer, organizedGroupCount } from '#server/database/groups';
import {
  canAccessGroup,
  isAdminUser,
  roleOf,
  type AdminUser,
  type SessionUser,
} from '#server/utils/auth';

// Session guards (README 8.4, 8.5): any account for /api/auth/*, an
// organiser or a super-admin for /api/admin/*.

/**
 * The logged-in user. The cookie only points to a session row, checked on
 * every request: revoking it, or disabling the account, takes effect at
 * once. The role comes from the account as it is now, never from the
 * cookie.
 */
export const requireAccount = async (event: H3Event): Promise<SessionUser> => {
  const session = await getUserSession(event);
  const sessionId = session?.user?.sessionId;
  const refuse = () =>
    createError({ statusCode: 401, statusMessage: 'unauthorized' });
  if (!sessionId) throw refuse();
  const db = useDb(event);
  const now = nowIso();
  const row = await findSession(db, sessionId);
  if (!row || !activeSession(row.session, row.account, now).ok) throw refuse();
  const role = roleOf({
    isSuperAdmin: row.account.isSuperAdmin,
    groupCount: row.account.isSuperAdmin
      ? 0
      : await organizedGroupCount(db, row.account.id),
  });
  if (shouldTouchSession(row.session.lastSeenAt, now)) {
    await touchSession(db, row.session.id, now);
  }
  return { role, accountId: row.account.id, sessionId: row.session.id };
};

/**
 * The logged-in user, or null: for pages open to everyone that show more
 * to an account.
 */
export const optionalAccount = (event: H3Event): Promise<SessionUser | null> =>
  requireAccount(event).catch(() => null);

/** A logged-in organiser or super-admin; a plain member gets 403. */
export const requireAdmin = async (event: H3Event): Promise<AdminUser> => {
  const user = await requireAccount(event);
  if (!isAdminUser(user)) {
    throw createError({ statusCode: 403, statusMessage: 'forbidden' });
  }
  return user;
};

/** A logged-in super-admin; anyone else gets 403. */
export const requireSuperAdmin = async (event: H3Event): Promise<AdminUser> => {
  const user = await requireAdmin(event);
  if (user.role !== 'super_admin') {
    throw createError({ statusCode: 403, statusMessage: 'forbidden' });
  }
  return user;
};

export type GroupContext = { user: AdminUser; group: PartyRow; db: Db };

/**
 * Loads the group named in the route (`[slug]`) and checks the session may
 * act on it. An organiser of another group gets 403, not 404, so the slug
 * list cannot be probed differently from any other refusal.
 */
export const requireGroupAccess = async (
  event: H3Event,
): Promise<GroupContext> => {
  const user = await requireAdmin(event);
  const slug = getRouterParam(event, 'slug') ?? '';
  const db = useDb(event);
  const [group] = await db
    .select()
    .from(parties)
    .where(eq(parties.slug, slug))
    .limit(1);
  const member =
    Boolean(group) &&
    user.role !== 'super_admin' &&
    (await isOrganizer(db, group?.id ?? '', user.accountId));
  if (!group || !canAccessGroup(user, member)) {
    throw createError({ statusCode: 403, statusMessage: 'forbidden' });
  }
  return { user, group, db };
};
