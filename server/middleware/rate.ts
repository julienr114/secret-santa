import { limitRate } from '#server/http/rateLimit';
import { rateLimiterFor } from '#server/utils/rateLimit';

// The public routes are limited per client address (lot 38 A, README 8):
// asking for a login link or a group, an invitation, and writing on a
// list opened by its link. Beyond, 429 `too_many_requests`.
export default defineEventHandler(async (event) => {
  const limiter = rateLimiterFor(event.method, getRequestURL(event).pathname);
  if (limiter) await limitRate(event, limiter);
});
