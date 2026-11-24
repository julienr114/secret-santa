import { describe, expect, it } from 'vitest';
import { rateLimiterFor, withinRate } from './rateLimit';

describe('the rate of a client', () => {
  it('follows what the binding says, for the key given', async () => {
    const seen: string[] = [];
    const binding = {
      limit: async ({ key }: { key: string }) => {
        seen.push(key);
        return { success: seen.length <= 2 };
      },
    };
    expect(await withinRate(binding, 'a')).toBe(true);
    expect(await withinRate(binding, 'a')).toBe(true);
    expect(await withinRate(binding, 'a')).toBe(false);
    expect(seen).toEqual(['a', 'a', 'a']);
  });

  it('limits nothing without a binding', async () => {
    expect(await withinRate(undefined, 'a')).toBe(true);
    expect(await withinRate(null, 'a')).toBe(true);
  });

  it('lets the call through when the binding fails', async () => {
    const broken = {
      limit: async () => {
        throw new Error('down');
      },
    };
    expect(await withinRate(broken, 'a')).toBe(true);
  });
});

describe('which routes are limited', () => {
  it('limits what is asked without a session', () => {
    expect(rateLimiterFor('POST', '/api/auth/link')).toBe('ask');
    expect(rateLimiterFor('POST', '/api/auth/confirm')).toBe('ask');
    expect(rateLimiterFor('POST', '/api/auth/group-requests')).toBe('ask');
    expect(rateLimiterFor('GET', '/api/invite/abc')).toBe('ask');
    expect(rateLimiterFor('POST', '/api/invite/abc/join')).toBe('ask');
    expect(rateLimiterFor('GET', '/api/invitations/tok')).toBe('ask');
    expect(rateLimiterFor('POST', '/api/invitations/tok/accept')).toBe('ask');
  });

  it('limits writing on a list by its link, not reading it', () => {
    expect(rateLimiterFor('POST', '/api/l/tok/claims')).toBe('write');
    expect(rateLimiterFor('DELETE', '/api/l/tok/ideas/1')).toBe('write');
    expect(rateLimiterFor('patch', '/api/l/tok/claims/1')).toBe('write');
    expect(rateLimiterFor('GET', '/api/l/tok')).toBeNull();
  });

  it('leaves the rest alone', () => {
    expect(rateLimiterFor('GET', '/api/auth/home')).toBeNull();
    expect(rateLimiterFor('GET', '/api/auth/link')).toBeNull();
    expect(rateLimiterFor('POST', '/api/lists')).toBeNull();
    expect(rateLimiterFor('POST', '/api/admin/famille/people')).toBeNull();
    expect(rateLimiterFor('GET', '/l/tok')).toBeNull();
  });
});

describe('the links at the foot of the emails (ticket 130)', () => {
  it('are limited, read or written', () => {
    expect(rateLimiterFor('GET', '/api/stop/abc')).toBe('ask');
    expect(rateLimiterFor('POST', '/api/stop/abc')).toBe('ask');
    expect(rateLimiterFor('POST', '/api/report-send/abc')).toBe('ask');
  });
});
