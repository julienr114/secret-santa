import { describe, it, expect } from 'vitest';
import { normalizeWishes } from './wishes';
import { failureOf } from '../../tests/helpers';

const rules = { maxWishes: 3 };

describe('normalizeWishes', () => {
  it('trims, nulls empty urls and renumbers positions', () => {
    const result = normalizeWishes(
      [
        { label: '  Un livre  ', url: '' },
        { label: '', url: '' },
        { label: 'Des chaussettes', url: ' https://example.com/x ' },
      ],
      rules,
    );
    expect(result).toEqual({
      ok: true,
      value: [
        { position: 0, label: 'Un livre', url: null },
        { position: 1, label: 'Des chaussettes', url: 'https://example.com/x' },
      ],
    });
  });

  it('accepts an empty list and rejects a non-list', () => {
    expect(normalizeWishes([], rules)).toEqual({ ok: true, value: [] });
    expect(failureOf(normalizeWishes('nope', rules)).reason).toBe(
      'invalid_wishes',
    );
  });

  it('refuses more than maxWishes non-blank items', () => {
    const items = Array.from({ length: 4 }, (_, i) => ({ label: `idée ${i}` }));
    expect(normalizeWishes(items, rules)).toEqual({
      ok: false,
      reason: 'too_many_wishes',
      details: { max: 3, count: 4 },
    });
  });

  it('names the faulty item and field', () => {
    const field = (items: unknown) =>
      failureOf(normalizeWishes(items, rules)).details;
    expect(
      normalizeWishes(
        [{ label: 'ok' }, { label: '', url: 'https://a.b' }],
        rules,
      ),
    ).toEqual({
      ok: false,
      reason: 'invalid_wish',
      details: { index: 1, field: 'label' },
    });
    expect(field([{ label: 'x'.repeat(201) }])).toEqual({
      index: 0,
      field: 'label',
    });
    expect(field([{ label: 'ok', url: 'ftp://a.b' }])).toEqual({
      index: 0,
      field: 'url',
    });
    expect(field([{ label: 'ok', url: 'javascript:alert(1)' }]).field).toBe(
      'url',
    );
    expect(field([{ label: 'ok', url: 'pas une url' }]).field).toBe('url');
  });
});
