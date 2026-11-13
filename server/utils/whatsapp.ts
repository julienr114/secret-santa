import { z } from 'zod';
import { ok, fail, type Result } from './result';

// WhatsApp "click to chat" links (README section 13). Numbers are stored in
// E.164 (+33612345678); wa.me wants the digits without the plus.

const DIGITS_MIN = 8;
const DIGITS_MAX = 15;

/**
 * Accepts "+33 6 12 34 56 78", "0033612345678" or "33612345678" and returns
 * the E.164 form. A national number (leading 0 without a country code) is
 * refused: the guardian must enter the international form.
 */
export const normalizePhone = (raw: unknown): Result<string> => {
  if (typeof raw !== 'string') return fail('invalid_phone');
  const compact = raw.replace(/[\s.\-()]/g, '');
  const match = /^(?:\+|00)?(\d+)$/.exec(compact);
  if (!match) return fail('invalid_phone');
  const hasPrefix = compact.startsWith('+') || compact.startsWith('00');
  const digits = match[1] as string;
  if (!hasPrefix && digits.startsWith('0'))
    return fail('invalid_phone', { hint: 'international' });
  if (
    digits.startsWith('0') ||
    digits.length < DIGITS_MIN ||
    digits.length > DIGITS_MAX
  ) {
    return fail('invalid_phone');
  }
  return ok(`+${digits}`);
};

/** Zod schema for API input: normalizes to E.164 or rejects. */
export const phoneSchema = z.string().transform((value, ctx) => {
  const result = normalizePhone(value);
  if (result.ok) return result.value;
  ctx.addIssue({ code: 'custom', message: 'invalid_phone' });
  return z.NEVER;
});

/** wa.me URL; without a phone, WhatsApp asks for the contact. */
export const whatsappUrl = ({
  phone,
  text,
}: {
  phone?: string | null;
  text: string;
}): string => {
  const digits = (phone ?? '').replace(/^\+/, '');
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
};
