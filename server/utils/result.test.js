import { describe, it, expect } from 'vitest';
import { ok, fail, isOk, map, andThen, all } from './result.js';

describe('result', () => {
  it('builds ok and fail values', () => {
    expect(ok(1)).toEqual({ ok: true, value: 1 });
    expect(fail('nope', { a: 1 })).toEqual({
      ok: false,
      reason: 'nope',
      details: { a: 1 },
    });
    expect(fail('nope').details).toEqual({});
    expect(isOk(ok(0))).toBe(true);
    expect(isOk(fail('x'))).toBe(false);
  });

  it('maps and chains only on ok', () => {
    expect(map(ok(2), (n) => n * 2)).toEqual(ok(4));
    expect(map(fail('x'), (n) => n * 2)).toEqual(fail('x'));
    expect(andThen(ok(2), (n) => ok(n + 1))).toEqual(ok(3));
    expect(andThen(ok(2), () => fail('y'))).toEqual(fail('y'));
    expect(andThen(fail('x'), () => ok(1))).toEqual(fail('x'));
  });

  it('collects a list of results, first failure wins', () => {
    expect(all([ok(1), ok(2)])).toEqual(ok([1, 2]));
    expect(all([ok(1), fail('a'), fail('b')])).toEqual(fail('a'));
    expect(all([])).toEqual(ok([]));
  });
});
