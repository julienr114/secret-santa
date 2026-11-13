import { z } from 'zod';
import { ok, fail, type Result } from './result';

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

export type WishInput = { label?: string | null; url?: string | null };
export type Wish = { position: number; label: string; url: string | null };

const asInput = (item: unknown): WishInput =>
  item && typeof item === 'object' ? (item as WishInput) : {};
const isBlank = (item: WishInput) =>
  !(item.label ?? '').trim() && !(item.url ?? '').trim();

/**
 * Cleans a submitted list: blank rows dropped, labels trimmed, empty URLs
 * turned into null, positions renumbered from 0.
 */
export const normalizeWishes = (
  items: unknown,
  { maxWishes }: { maxWishes: number },
): Result<Wish[]> => {
  if (!Array.isArray(items)) return fail('invalid_wishes');
  const kept = items.map(asInput).filter((item) => !isBlank(item));
  if (kept.length > maxWishes) {
    return fail('too_many_wishes', { max: maxWishes, count: kept.length });
  }
  const parsed = kept.map((item, index) => ({
    index,
    result: wishSchema.safeParse({
      label: item.label ?? '',
      url: (item.url ?? '').trim() === '' ? null : item.url,
    }),
  }));
  const firstError = parsed.find(({ result }) => !result.success);
  if (firstError && !firstError.result.success) {
    return fail('invalid_wish', {
      index: firstError.index,
      field: firstError.result.error.issues[0]?.path[0] ?? 'label',
    });
  }
  return ok(
    parsed.flatMap(({ result }, position) =>
      result.success ? [{ position, ...result.data }] : [],
    ),
  );
};
