import type { H3Event } from 'h3';
import { useDb } from '#server/database/client';
import { countUp } from '#server/database/counters';
import { ipHashOf, nowIso, secretsOf } from './context';
import {
  RATE_LIMITERS,
  withinRate,
  type RateLimitBinding,
  type RateLimiter,
} from '#server/utils/rateLimit';

/**
 * Refuses (429, `too_many_requests`) a client that calls a public route
 * too fast (lot 38 A, README 8). Counted per client address, taken from
 * `CF-Connecting-IP`, which a client cannot forge, and hashed: these
 * routes have no session to count by. Cloudflare counts per location and
 * roughly: this is a net against a script, not an exact quota. Turned
 * off by `NUXT_RATE_LIMITS=off`, for the tests, which call from one
 * address.
 * @param event - The request.
 * @param limiter - Which limit applies.
 * @returns Once the call is let through.
 */
export const limitRate = async (event: H3Event, limiter: RateLimiter) => {
  if (!secretsOf(event).rateLimits) return;
  const env = (event.context.cloudflare?.env ?? {}) as Record<
    string,
    RateLimitBinding | undefined
  >;
  const ok = await withinRate(
    env[RATE_LIMITERS[limiter]],
    `${limiter}:${await ipHashOf(event)}`,
  );
  if (!ok) {
    // Counted for the dashboard (ticket 129).
    await countUp(useDb(event), 'rate_limited', nowIso().slice(0, 10));
    throw createError({
      statusCode: 429,
      statusMessage: 'too_many_requests',
    });
  }
};
