import { capRefusal, type Capped } from '#server/utils/limits';

/**
 * Refuses (409, `limit_…`) one more of something once its cap is reached
 * (lot 38 A, README 8): wide figures, met by a script, not by a family.
 * @param what - What is being written.
 * @param count - How many there are already.
 * @returns Once there is room.
 */
export const requireRoom = async (what: Capped, count: Promise<number>) => {
  const refusal = capRefusal(what, await count);
  if (refusal) throw createError({ statusCode: 409, statusMessage: refusal });
};
