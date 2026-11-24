import { describe, expect, it } from 'vitest';
import {
  crossesWarning,
  emailMayLeave,
  EMAIL_CAPS,
  gaugeOf,
  monthOf,
} from './spend';

describe('gaugeOf', () => {
  it('warns at 70 % and is full at the cap', () => {
    expect(gaugeOf(69, 100)).toEqual({
      used: 69,
      cap: 100,
      warn: false,
      full: false,
    });
    expect(gaugeOf(70, 100).warn).toBe(true);
    expect(gaugeOf(100, 100).full).toBe(true);
  });
});

describe('crossesWarning', () => {
  it('warns once, when a send goes past 70 %', () => {
    expect(crossesWarning(2000, 99, EMAIL_CAPS.month)).toBe(false);
    expect(crossesWarning(2099, 1, EMAIL_CAPS.month)).toBe(true);
    expect(crossesWarning(2100, 5, EMAIL_CAPS.month)).toBe(false);
  });
});

describe('emailMayLeave', () => {
  it('lets only the login links through while emails are suspended', () => {
    expect(emailMayLeave({ login: false, paused: true })).toBe(false);
    expect(emailMayLeave({ login: true, paused: true })).toBe(true);
    expect(emailMayLeave({ login: false, paused: false })).toBe(true);
  });
});

describe('monthOf', () => {
  it('keeps the year and the month', () => {
    expect(monthOf('2026-11-24')).toBe('2026-11');
  });
});
