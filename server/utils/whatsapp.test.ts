import { describe, it, expect } from 'vitest';
import { normalizePhone, phoneSchema, whatsappUrl } from './whatsapp';
import { valueOf } from '~~/tests/helpers';

describe('normalizePhone', () => {
  it('normalizes international forms to E.164', () => {
    expect(normalizePhone('+33 6 12 34 56 78')).toEqual({
      ok: true,
      value: '+33612345678',
    });
    expect(normalizePhone('0033612345678')).toEqual({
      ok: true,
      value: '+33612345678',
    });
    expect(normalizePhone('33612345678')).toEqual({
      ok: true,
      value: '+33612345678',
    });
    expect(valueOf(normalizePhone('+1 (415) 555-2671'))).toBe('+14155552671');
    expect(valueOf(normalizePhone('+41.79.123.45.67'))).toBe('+41791234567');
  });

  it('refuses national numbers and garbage', () => {
    expect(normalizePhone('06 12 34 56 78')).toEqual({
      ok: false,
      reason: 'invalid_phone',
      details: { hint: 'international' },
    });
    [
      '',
      '+',
      'abc',
      '+33 6 12',
      '+0612345678',
      '+1234567890123456',
      42,
      null,
    ].forEach((raw) => expect(normalizePhone(raw).ok, String(raw)).toBe(false));
  });

  it('works as a zod schema', () => {
    expect(phoneSchema.safeParse('+33 6 12 34 56 78').data).toBe(
      '+33612345678',
    );
    expect(phoneSchema.safeParse('0612345678').success).toBe(false);
  });
});

describe('whatsappUrl', () => {
  it('builds a click-to-chat link with the encoded text', () => {
    const url = whatsappUrl({
      phone: '+33612345678',
      text: 'Salut Léa !\nTon lien : https://x.y/p/abc',
    });
    expect(url).toBe(
      'https://wa.me/33612345678?text=Salut%20L%C3%A9a%20!%0ATon%20lien%20%3A%20https%3A%2F%2Fx.y%2Fp%2Fabc',
    );
    expect(
      decodeURIComponent(new URL(url).searchParams.get('text') ?? ''),
    ).toContain('Léa');
  });

  it('falls back to the contact picker without a phone', () => {
    expect(whatsappUrl({ phone: null, text: 'x' })).toBe(
      'https://wa.me/?text=x',
    );
    expect(whatsappUrl({ text: '🎁' })).toBe(
      'https://wa.me/?text=%F0%9F%8E%81',
    );
  });
});
