import { describe, expect, it } from 'vitest';
import {
  CODE_TRIES,
  codeDigits,
  codeOf,
  codePrint,
  codeState,
  spacedCode,
} from './loginCode';

describe('codeOf', () => {
  it('gives six digits, leading zeros kept', () => {
    expect(codeOf(() => new Uint32Array([42]))).toBe('000042');
    expect(codeOf(() => new Uint32Array([482_913]))).toMatch(/^\d{6}$/);
  });

  it('draws again above the last full million, so no digit is favoured', () => {
    const draws = [0xffff_ffff, 7];
    expect(codeOf(() => new Uint32Array([draws.shift()!]))).toBe('000007');
  });
});

describe('spacedCode and codeDigits', () => {
  it('shows the code in two halves, and reads only digits', () => {
    expect(spacedCode('482913')).toBe('482 913');
    expect(codeDigits(' 482 913 7')).toBe('482913');
  });
});

describe('codeState', () => {
  const code = {
    expiresAt: '2026-11-24T10:15:00.000Z',
    usedAt: null,
    attempts: 0,
  };
  const now = '2026-11-24T10:05:00.000Z';

  it('is open for 15 minutes, once', () => {
    expect(codeState(code, now)).toBe('open');
    expect(codeState(code, '2026-11-24T10:15:00.000Z')).toBe('expired');
    expect(codeState({ ...code, usedAt: now }, now)).toBe('used');
  });

  it('refuses the sixth try, even with the right code', () => {
    expect(codeState({ ...code, attempts: CODE_TRIES - 1 }, now)).toBe('open');
    expect(codeState({ ...code, attempts: CODE_TRIES }, now)).toBe('spent');
  });
});

describe('codePrint', () => {
  it('binds the code to the device, and never says it', async () => {
    const print = await codePrint('482913', 'phone', 'secret');
    expect(print).not.toContain('482913');
    expect(print).toBe(await codePrint('482913', 'phone', 'secret'));
    expect(print).not.toBe(await codePrint('482913', 'laptop', 'secret'));
  });
});
