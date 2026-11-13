import { eq } from 'drizzle-orm';
import { useDb } from '../database/client.js';
import { groups } from '../database/schema.js';
import { canAccessGroup } from '../utils/auth.js';

// Session guards for /api/admin/* (README 8.4, 8.5).

export const requireAdmin = async (event) => {
  const session = await getUserSession(event);
  if (!session?.user?.role) {
    throw createError({ statusCode: 401, statusMessage: 'unauthorized' });
  }
  return session.user;
};

export const requireSuperAdmin = async (event) => {
  const user = await requireAdmin(event);
  if (user.role !== 'super_admin') {
    throw createError({ statusCode: 403, statusMessage: 'forbidden' });
  }
  return user;
};

/**
 * Loads the group named in the route (`[slug]`) and checks the session may
 * act on it. A guardian of another group gets 403, not 404, so the slug
 * list cannot be probed differently from any other refusal.
 */
export const requireGroupAccess = async (event) => {
  const user = await requireAdmin(event);
  const slug = getRouterParam(event, 'slug');
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
