import { describe, expect, it } from 'vitest';
import {
  CAPS,
  LINK_LIMITS,
  capRefusal,
  dueBatch,
  hasWebAddress,
  linkVerdict,
  sessionsToClose,
} from './limits';

describe('the caps on what is written', () => {
  it('lets one more in until the cap, then names its refusal', () => {
    expect(capRefusal('lists', 0)).toBeNull();
    expect(capRefusal('lists', CAPS.lists - 1)).toBeNull();
    expect(capRefusal('lists', CAPS.lists)).toBe('limit_lists');
    expect(capRefusal('off_list', CAPS.off_list + 5)).toBe('limit_off_list');
  });

  it('closes the sessions seen longest ago so that a new one fits', () => {
    const sessions = Array.from({ length: CAPS.sessions + 1 }, (_, i) => ({
      id: `s${i}`,
      lastSeenAt: `2026-11-${String(i + 1).padStart(2, '0')}T08:00:00.000Z`,
    }));
    // One over the cap, and room for the new one: two go, the oldest.
    expect(sessionsToClose(sessions.toReversed())).toEqual(['s0', 's1']);
    expect(sessionsToClose(sessions.slice(0, CAPS.sessions - 1))).toEqual([]);
    expect(sessionsToClose(sessions.slice(0, CAPS.sessions))).toEqual(['s0']);
  });
});

describe('a name that carries a web address', () => {
  it('is spotted', () => {
    for (const text of [
      'http://exemple.fr',
      'Gagne sur https://promo.example.com/x',
      'www.gain.example',
      'promo.xyz',
      'Léa gain.example.com',
      'VISITE BIT.LY/abc',
      'noel-2026.party',
    ]) {
      expect(hasWebAddress(text), text).toBe(true);
    }
  });

  it('leaves ordinary names alone', () => {
    for (const text of [
      'Léa',
      'Jean-Baptiste',
      'J. Martin',
      'St. Nicolas',
      'Noël 2026',
      'Famille Dupont (côté Mamie)',
      'Les 3.5 cousins',
      'Anniversaire de Tom : 6 ans !',
    ]) {
      expect(hasWebAddress(text), text).toBe(false);
    }
  });
});

describe('a request for a login link', () => {
  const quiet = { forEmail: 0, fromIp: 0, today: 0 };

  it('is sent while everything is under its limit', () => {
    expect(linkVerdict(quiet)).toBe('send');
    expect(
      linkVerdict({
        forEmail: LINK_LIMITS.perEmail - 1,
        fromIp: LINK_LIMITS.perIp - 1,
        today: LINK_LIMITS.perDay - 1,
      }),
    ).toBe('send');
  });

  it('answers the same, without an email, to an address sent enough', () => {
    expect(linkVerdict({ ...quiet, forEmail: LINK_LIMITS.perEmail })).toBe(
      'silent',
    );
  });

  it('answers the same, without an email, the day the app sent too many', () => {
    expect(linkVerdict({ ...quiet, today: LINK_LIMITS.perDay })).toBe('silent');
  });

  it('refuses a client that asks too much, whatever the address', () => {
    expect(linkVerdict({ ...quiet, fromIp: LINK_LIMITS.perIp })).toBe('refuse');
    expect(
      linkVerdict({
        forEmail: LINK_LIMITS.perEmail,
        fromIp: LINK_LIMITS.perIp,
        today: 0,
      }),
    ).toBe('refuse');
  });

  it('takes other limits, for the tests', () => {
    expect(
      linkVerdict(
        { forEmail: 5, fromIp: 50, today: 0 },
        { perEmail: 10, perIp: 1000, perDay: 1000 },
      ),
    ).toBe('send');
  });
});

describe('what one run of a scheduled task handles', () => {
  it('takes the first rows that are due, no more than the run handles', () => {
    const rows = [1, 2, 3, 4, 5, 6, 7];
    expect(dueBatch(rows, (n) => n % 2 === 1, 3)).toEqual([1, 3, 5]);
    expect(dueBatch(rows, () => false, 3)).toEqual([]);
    expect(dueBatch(rows, () => true, 10)).toEqual(rows);
  });
});
