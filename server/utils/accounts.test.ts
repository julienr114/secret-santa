import { describe, expect, it } from 'vitest';
import {
  LOGIN_LINK_TTL_MS,
  SESSION_TOUCH_MS,
  accountEmailSchema,
  activeSession,
  deviceLabel,
  isoAfter,
  shouldTouchSession,
  superAdminEmails,
  usableLink,
} from './accounts';
import { failureOf } from '~~/tests/helpers';

const NOW = '2026-11-14T10:00:00.000Z';

describe('accountEmailSchema', () => {
  it('trims and lower-cases, and refuses what is not an address', () => {
    expect(accountEmailSchema.parse(' Julien@Example.COM ')).toBe(
      'julien@example.com',
    );
    expect(accountEmailSchema.safeParse('pas-une-adresse').success).toBe(false);
    expect(accountEmailSchema.safeParse('').success).toBe(false);
  });
});

describe('superAdminEmails', () => {
  it('reads a comma-separated list, ignoring junk and duplicates', () => {
    expect(
      superAdminEmails(' A@x.fr, b@x.fr ,, pas-une-adresse, a@x.fr '),
    ).toEqual(['a@x.fr', 'b@x.fr']);
  });

  it('is empty when nothing is set', () => {
    expect(superAdminEmails('')).toEqual([]);
    expect(superAdminEmails(undefined)).toEqual([]);
  });
});

describe('usableLink', () => {
  const link = { expiresAt: isoAfter(NOW, LOGIN_LINK_TTL_MS), usedAt: null };

  it('works once, until it expires', () => {
    expect(usableLink(link, NOW).ok).toBe(true);
    expect(usableLink(link, isoAfter(NOW, LOGIN_LINK_TTL_MS - 1)).ok).toBe(
      true,
    );
  });

  it('is refused once used, even if still fresh', () => {
    expect(failureOf(usableLink({ ...link, usedAt: NOW }, NOW)).reason).toBe(
      'link_used',
    );
  });

  it('is refused from the very instant it expires', () => {
    expect(
      failureOf(usableLink(link, isoAfter(NOW, LOGIN_LINK_TTL_MS))).reason,
    ).toBe('link_expired');
  });
});

describe('activeSession', () => {
  const session = { expiresAt: isoAfter(NOW, 1000), revokedAt: null };
  const account = { disabledAt: null };

  it('stands while not revoked, not expired, account enabled', () => {
    expect(activeSession(session, account, NOW).ok).toBe(true);
  });

  it('falls when revoked, expired, or when the account is disabled', () => {
    expect(activeSession({ ...session, revokedAt: NOW }, account, NOW).ok).toBe(
      false,
    );
    expect(activeSession(session, account, isoAfter(NOW, 1000)).ok).toBe(false);
    expect(activeSession(session, { disabledAt: NOW }, NOW).ok).toBe(false);
  });
});

describe('shouldTouchSession', () => {
  it('only after the refresh interval', () => {
    expect(shouldTouchSession(NOW, isoAfter(NOW, SESSION_TOUCH_MS - 1))).toBe(
      false,
    );
    expect(shouldTouchSession(NOW, isoAfter(NOW, SESSION_TOUCH_MS))).toBe(true);
  });
});

describe('deviceLabel', () => {
  it('names the system and the browser', () => {
    expect(
      deviceLabel(
        'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',
      ),
    ).toBe('iPhone · Safari');
    expect(
      deviceLabel(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
      ),
    ).toBe('Mac · Chrome');
  });

  it('is null when nothing is recognised', () => {
    expect(deviceLabel('curl/8.0')).toBeNull();
    expect(deviceLabel(null)).toBeNull();
  });
});
