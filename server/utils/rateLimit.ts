// Limiting how fast the public routes are called (lot 38 A, README 8),
// with the rate limiting bindings of Workers (`[[ratelimits]]` in
// wrangler.toml). Pure: the route hands the binding and the client
// address in.

/** The bindings declared in wrangler.toml, and what each one guards. */
export const RATE_LIMITERS = {
  /** Asking for a login link, a group, or what an invitation link is. */
  ask: 'RATE_ASK',
  /** Writing on a list opened by its link. */
  write: 'RATE_WRITE',
} as const;
export type RateLimiter = keyof typeof RATE_LIMITERS;

/** What a rate limiting binding of Workers answers to. */
export type RateLimitBinding = {
  limit: (options: { key: string }) => Promise<{ success: boolean }>;
};

/**
 * Whether a call fits in the rate of its client. Without a binding (a
 * unit test, a build without Workers) nothing is limited; a binding that
 * fails lets the call through: the limiter must never take the app down.
 * @param binding - The binding, or nothing.
 * @param key - Who calls: the client address.
 * @returns False when the client calls too fast.
 */
export const withinRate = async (
  binding: RateLimitBinding | null | undefined,
  key: string,
): Promise<boolean> => {
  if (!binding) return true;
  try {
    return (await binding.limit({ key })).success;
  } catch {
    return true;
  }
};

const WRITES = ['POST', 'PUT', 'PATCH', 'DELETE'];

/**
 * Which limit a call falls under: the public routes only, those reached
 * without a session or with a secret link. Asking for a login link, for
 * a group, confirming a link, reading or using an invitation: « ask ».
 * Writing on a list opened by its link: « write ». Reading a list, and
 * everything behind a session, is not limited here.
 * @param method - The HTTP method.
 * @param path - The path of the request, without its query.
 * @returns The limiter, or null.
 */
export const rateLimiterFor = (
  method: string,
  path: string,
): RateLimiter | null => {
  const writes = WRITES.includes(method.toUpperCase());
  if (path.startsWith('/api/l/')) return writes ? 'write' : null;
  if (path.startsWith('/api/invite/')) return 'ask';
  if (path.startsWith('/api/invitations/')) return 'ask';
  if (
    writes &&
    [
      '/api/auth/link',
      '/api/auth/confirm',
      '/api/auth/group-requests',
    ].includes(path)
  ) {
    return 'ask';
  }
  return null;
};
