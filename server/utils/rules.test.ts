import { describe, it, expect } from 'vitest';
import {
  DEFAULT_RULES,
  mergeRules,
  rulesPatchSchema,
  rulesSchema,
  formatEventDate,
  isIsoDay,
  partyIsOver,
} from './rules';
import { failureOf, valueOf } from '~~/tests/helpers';

describe('rules', () => {
  it('has the defaults from README section 5', () => {
    expect(DEFAULT_RULES).toEqual({
      excludePreviousYears: 1,
      budget: '',
      eventDate: '',
      guardianMessage: '',
      wishlist: true,
      maxWishes: 10,
    });
  });

  it('merges defaults, group rules and edition override in that order', () => {
    const merged = mergeRules(
      { budget: '20 €', excludePreviousYears: 2 },
      { budget: '30 €' },
    );
    expect(merged.ok).toBe(true);
    expect(valueOf(merged).budget).toBe('30 €');
    expect(valueOf(merged).excludePreviousYears).toBe(2);
  });

  it('ignores null and undefined overrides and unknown keys', () => {
    const merged = mergeRules(
      { budget: '20 €', bogus: 1 },
      { budget: null, eventDate: undefined },
    );
    expect(valueOf(merged).budget).toBe('20 €');
    expect(valueOf(merged).eventDate).toBe('');
    expect('bogus' in valueOf(merged)).toBe(false);
  });

  it('accepts a missing or null override', () => {
    expect(mergeRules({}).ok).toBe(true);
    expect(valueOf(mergeRules({}, null))).toEqual(DEFAULT_RULES);
  });

  it('rejects invalid values and names the field', () => {
    const merged = failureOf(mergeRules({ excludePreviousYears: -1 }));
    expect(merged).toEqual({
      ok: false,
      reason: 'invalid_rules',
      details: { issues: ['excludePreviousYears'] },
    });
    expect(rulesSchema.safeParse({ maxWishes: 0 }).success).toBe(false);
  });

  it('keeps only the given keys in a partial override', () => {
    expect(rulesPatchSchema.parse({ budget: '15 €' })).toEqual({
      budget: '15 €',
    });
    expect(rulesPatchSchema.safeParse({ maxWishes: 0 }).success).toBe(false);
  });

  it('does not mutate its inputs', () => {
    const group = Object.freeze({ budget: 'x' });
    const override = Object.freeze({ budget: 'y' });
    expect(() => mergeRules(group, override)).not.toThrow();
  });
});

describe('date of the party', () => {
  it('recognizes an ISO day, not free text nor an impossible date', () => {
    expect(isIsoDay('2026-12-24')).toBe(true);
    expect(isIsoDay('24 décembre')).toBe(false);
    expect(isIsoDay('2026-13-45')).toBe(false);
    expect(isIsoDay('')).toBe(false);
    expect(isIsoDay(null)).toBe(false);
  });

  it('writes an ISO day in the language, and keeps free text as it is', () => {
    expect(formatEventDate('2026-12-24', 'fr')).toBe('24 décembre');
    expect(formatEventDate('2026-12-24', 'en')).toBe('December 24');
    expect(formatEventDate('2026-12-24', 'de')).toBe('24. Dezember');
    expect(formatEventDate('le soir du réveillon', 'en')).toBe(
      'le soir du réveillon',
    );
    expect(formatEventDate('', 'fr')).toBe('');
  });

  it('says the party is over only from the day after', () => {
    expect(partyIsOver('2026-12-24', '2026-12-23')).toBe(false);
    expect(partyIsOver('2026-12-24', '2026-12-24')).toBe(false);
    expect(partyIsOver('2026-12-24', '2026-12-25')).toBe(true);
  });

  it('never says it is too early without a real date', () => {
    expect(partyIsOver('', '2026-01-01')).toBe(true);
    expect(partyIsOver('24 décembre', '2026-01-01')).toBe(true);
  });
});
