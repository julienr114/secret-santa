import { requirePersonalLink } from '#server/http/personal';
import { hintsPayload } from '#server/http/hints';

// The participant's own gift hints (README 22.11): the link is enough.
export default defineEventHandler(async (event) => {
  const ctx = await requirePersonalLink(event);
  if (ctx.rules.giftHints === 'none') {
    throw createError({
      statusCode: 403,
      statusMessage: 'gift_hints_disabled',
    });
  }
  return hintsPayload(ctx);
});
