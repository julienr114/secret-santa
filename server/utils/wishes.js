import { z } from 'zod';
import { ok, fail } from './result.js';

// Wish lists (README section 6 bis). The whole list is replaced on save, so
// normalization returns the rows to insert, positions included.

export const WISH_LABEL_MAX = 200;

const urlSchema = z
  .string()
  .trim()
  .max(2000)
  .url()
  .refine((value) => /^https?:\/\//i.test(value), 'http or https only');

const wishSchema = z.object({
  label: z.string().trim().min(1).max(WISH_LABEL_MAX),
  url: urlSchema.nullable(),
});

const isBlank = (item) =>
  !(item?.label ?? '').trim() && !(item?.url ?? '').trim();

/**
 * Cleans a submitted list: blank rows dropped, labels trimmed, empty URLs
 * turned into null, positions renumbered from 0.
 * @param {unknown} items
 * @param {{ maxWishes: number }} rules
 * @returns {import('./result.js').Result<Array<{ position: number, label: string, url: string | null }>>}
 */
export const normalizeWishes = (items, { maxWishes }) => {
  if (!Array.isArray(items)) return fail('invalid_wishes');
  const kept = items.filter((item) => !isBlank(item));
  if (kept.length > maxWishes)
    return fail('too_many_wishes', { max: maxWishes, count: kept.length });
  const parsed = kept.map((item, index) => ({
    index,
    result: wishSchema.safeParse({
      label: item?.label ?? '',
      url: (item?.url ?? '').trim() === '' ? null : item.url,
    }),
  }));
  const firstError = parsed.find(({ result }) => !result.success);
  if (firstError) {
    return fail('invalid_wish', {
      index: firstError.index,
      field: firstError.result.error.issues[0]?.path[0] ?? 'label',
    });
  }
  return ok(
    parsed.map(({ result }, position) => ({ position, ...result.data })),
  );
};
