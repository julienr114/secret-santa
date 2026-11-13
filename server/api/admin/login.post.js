import { z } from 'zod';
import { and, eq, gt } from 'drizzle-orm';
import { useDb } from '../../database/client.js';
import { groups, loginAttempts } from '../../database/schema.js';
import { timingSafeEqual, verifySecret } from '../../utils/crypto.js';
import {
  LOGIN_WINDOW_MS,
  loginThrottle,
  slugSchema,
} from '../../utils/auth.js';
import { ipHashOf, newId, nowIso, secretsOf } from '../../http/context.js';
import { validatedBody } from '../../http/validate.js';

const bodySchema = z.object({
  scope: z.union([z.literal('super'), slugSchema]),
  password: z.string().min(1).max(200),
});

const superAdminUser = (secrets, password) =>
  secrets.superAdminPassword &&
  timingSafeEqual(password, secrets.superAdminPassword)
    ? { role: 'super_admin', groupId: null, groupSlug: null }
    : null;

const guardianUser = async (db, secrets, slug, password) => {
  const [group] = await db
    .select()
    .from(groups)
    .where(eq(groups.slug, slug))
    .limit(1);
  if (!group?.guardianPasswordHash) return null;
  const valid = await verifySecret(password, {
    hash: group.guardianPasswordHash,
    salt: group.guardianPasswordSalt,
    pepper: secrets.pinPepper,
    iterations: secrets.pbkdf2Iterations,
  });
  return valid
    ? { role: 'guardian', groupId: group.id, groupSlug: group.slug }
    : null;
};

export default defineEventHandler(async (event) => {
  const { scope, password } = await validatedBody(event, bodySchema);
  const db = useDb(event);
  const secrets = secretsOf(event);
  const ipHash = await ipHashOf(event);
  const now = nowIso();

  const since = new Date(Date.parse(now) - LOGIN_WINDOW_MS).toISOString();
  const failures = await db
    .select({ createdAt: loginAttempts.createdAt })
    .from(loginAttempts)
    .where(
      and(
        eq(loginAttempts.scope, scope),
        eq(loginAttempts.ipHash, ipHash),
        gt(loginAttempts.createdAt, since),
      ),
    );
  const throttle = loginThrottle(
    failures.map((f) => f.createdAt),
    now,
  );
  if (throttle.blocked) {
    setResponseHeader(event, 'Retry-After', String(throttle.retryAfterSeconds));
    throw createError({
      statusCode: 429,
      statusMessage: 'too_many_attempts',
      data: { retryAfterSeconds: throttle.retryAfterSeconds },
    });
  }

  const user =
    scope === 'super'
      ? superAdminUser(secrets, password)
      : await guardianUser(db, secrets, scope, password);

  if (!user) {
    await db
      .insert(loginAttempts)
      .values({ id: newId(), scope, ipHash, createdAt: now });
    throw createError({
      statusCode: 401,
      statusMessage: 'invalid_credentials',
    });
  }

  await db
    .delete(loginAttempts)
    .where(
      and(eq(loginAttempts.scope, scope), eq(loginAttempts.ipHash, ipHash)),
    );
  await setUserSession(event, { user, loggedInAt: now });
  return { user };
});
