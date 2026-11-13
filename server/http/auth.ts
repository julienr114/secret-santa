import { eq } from 'drizzle-orm';
import type { H3Event } from 'h3';
import { useDb, type Db } from '#server/database/client';
import { groups, type GroupRow } from '#server/database/schema';
import { canAccessGroup, type SessionUser } from '#server/utils/auth';

// Session guards for /api/admin/* (README 8.4, 8.5).

export const requireAdmin = async (event: H3Event): Promise<SessionUser> => {
  const session = await getUserSession(event);
  const user = session?.user;
  if (!user?.role) {
    throw createError({ statusCode: 401, statusMessage: 'unauthorized' });
  }
  return user;
};

export const requireSuperAdmin = async (
  event: H3Event,
): Promise<SessionUser> => {
  const user = await requireAdmin(event);
  if (user.role !== 'super_admin') {
    throw createError({ statusCode: 403, statusMessage: 'forbidden' });
  }
  return user;
};

export type GroupContext = { user: SessionUser; group: GroupRow; db: Db };

/**
 * Loads the group named in the route (`[slug]`) and checks the session may
 * act on it. A guardian of another group gets 403, not 404, so the slug
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
    .from(groups)
    .where(eq(groups.slug, slug))
    .limit(1);
  if (!group || !canAccessGroup(user, group.id)) {
    throw createError({ statusCode: 403, statusMessage: 'forbidden' });
  }
  return { user, group, db };
};
