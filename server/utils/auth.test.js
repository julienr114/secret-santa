import { describe, it, expect } from 'vitest';
import {
  canAccessGroup,
  loginThrottle,
  slugSchema,
  sessionUserSchema,
} from './auth.js';

describe('canAccessGroup', () => {
  it('lets super admins in everywhere and guardians only in their group', () => {
    expect(canAccessGroup({ role: 'super_admin', groupId: null }, 'g1')).toBe(
      true,
    );
    expect(canAccessGroup({ role: 'guardian', groupId: 'g1' }, 'g1')).toBe(
      true,
    );
    expect(canAccessGroup({ role: 'guardian', groupId: 'g1' }, 'g2')).toBe(
      false,
    );
    expect(canAccessGroup(null, 'g1')).toBe(false);
  });
});

describe('loginThrottle', () => {
  const now = '2026-11-13T12:00:00.000Z';
  const minutesAgo = (m) =>
    new Date(Date.parse(now) - m * 60_000).toISOString();

  it('allows with few recent failures', () => {
    expect(loginThrottle([minutesAgo(1), minutesAgo(2)], now)).toEqual({
      blocked: false,
      retryAfterSeconds: 0,
      failures: 2,
    });
  });

  it('blocks at ten failures within fifteen minutes and says how long', () => {
    const dates = Array.from({ length: 10 }, (_, i) => minutesAgo(i + 1));
    const result = loginThrottle(dates, now);
    expect(result.blocked).toBe(true);
    expect(result.retryAfterSeconds).toBe(5 * 60);
  });

  it('forgets failures older than the window and ignores junk dates', () => {
    const dates = [
      ...Array.from({ length: 9 }, () => minutesAgo(16)),
      minutesAgo(1),
      'junk',
    ];
    expect(loginThrottle(dates, now)).toEqual({
      blocked: false,
      retryAfterSeconds: 0,
      failures: 1,
    });
    expect(loginThrottle([], now).blocked).toBe(false);
  });
});

describe('schemas', () => {
  it('validates slugs and session users', () => {
    expect(slugSchema.safeParse('famille-rabin').success).toBe(true);
    ['Famille', 'a', '-x', 'x--y', 'é'].forEach((s) =>
      expect(slugSchema.safeParse(s).success, s).toBe(false),
    );
    expect(sessionUserSchema.parse({ role: 'super_admin' })).toEqual({
      role: 'super_admin',
      groupId: null,
      groupSlug: null,
    });
    expect(sessionUserSchema.safeParse({ role: 'root' }).success).toBe(false);
  });
});
