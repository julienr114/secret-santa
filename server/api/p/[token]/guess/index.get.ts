import { markSeenByEmail } from '#server/database/news';
import { dataKeyOf, nowIso } from '#server/http/context';
import { gamePayload } from '#server/http/guesses';
import { requirePersonalLink } from '#server/http/personal';

// « Devine qui » (README 22.17) for one participant: the people, their own
// guesses, and the palmarès once the draw is revealed. Never anyone
// else's guess before.
export default defineEventHandler(async (event) => {
  const ctx = await requirePersonalLink(event);
  const game = await gamePayload(ctx, await dataKeyOf(event));
  if (!game)
    throw createError({ statusCode: 409, statusMessage: 'guesses_off' });
  // Opening the game sees its « À toi de jouer » (ticket 142); the
  // palmarès is seen with the palmarès.
  await markSeenByEmail(
    ctx.db,
    ctx.person.email,
    'game',
    ctx.edition.id,
    nowIso(),
    ['game_open'],
  );
  return game;
});
