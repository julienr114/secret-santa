import { describe, expect, it } from 'vitest';
import {
  INVITE_CODE_SHAPE,
  buildInviteMessage,
  canClaim,
  canJoinGroup,
  defaultInvitePlaces,
  generateInviteCode,
  safeNext,
} from './invite';
import { MAX_PARTICIPANTS } from './editions';
import { failureOf } from '~~/tests/helpers';

describe('generateInviteCode', () => {
  it('makes 16 URL-safe characters, different each time', () => {
    const code = generateInviteCode();
    expect(code).toMatch(INVITE_CODE_SHAPE);
    expect(generateInviteCode()).not.toBe(code);
  });
});

describe('canJoinGroup', () => {
  const limits = { until: '2026-12-20', places: 3 };

  it('lets people in until the last day, while places remain', () => {
    expect(canJoinGroup(limits, '2026-12-01').ok).toBe(true);
    expect(canJoinGroup(limits, '2026-12-20').ok).toBe(true);
    expect(canJoinGroup({ until: null, places: 1 }, '2030-01-01').ok).toBe(
      true,
    );
  });

  it('refuses after the last day', () => {
    expect(failureOf(canJoinGroup(limits, '2026-12-21')).reason).toBe(
      'invite_expired',
    );
  });

  it('refuses once the places are taken', () => {
    expect(
      failureOf(canJoinGroup({ ...limits, places: 0 }, '2026-12-01')).reason,
    ).toBe('invite_full');
  });
});

describe('defaultInvitePlaces', () => {
  it('offers what a draw can still take', () => {
    expect(defaultInvitePlaces(8)).toBe(MAX_PARTICIPANTS - 8);
    expect(defaultInvitePlaces(MAX_PARTICIPANTS + 5)).toBe(0);
  });
});

describe('canClaim', () => {
  it('links a person without address, or with the same one', () => {
    expect(canClaim(null, 'lea@example.com').ok).toBe(true);
    expect(canClaim('lea@example.com', 'lea@example.com').ok).toBe(true);
  });

  it('refuses a person given another address', () => {
    expect(
      failureOf(canClaim('tom@example.com', 'lea@example.com')).reason,
    ).toBe('person_has_other_email');
  });
});

describe('safeNext', () => {
  it('keeps an invitation or a personal page', () => {
    expect(safeNext('/rejoindre/abcdefghijklmnop')).toBe(
      '/rejoindre/abcdefghijklmnop',
    );
    expect(safeNext(`/p/${'a'.repeat(43)}`)).toBe(`/p/${'a'.repeat(43)}`);
    // A gift list, maybe with the idea to tick once back (lot 22).
    const list = `/l/${'b'.repeat(21)}?cocher=${'c'.repeat(21)}`;
    expect(safeNext(list)).toBe(list);
    expect(safeNext(`/l/${'b'.repeat(21)}?cocher=x`)).toBeNull();
  });

  it('refuses anything else', () => {
    expect(safeNext('https://evil.example/p/x')).toBeNull();
    expect(safeNext('//evil.example')).toBeNull();
    expect(safeNext('/admin/comptes')).toBeNull();
    expect(safeNext('/rejoindre/short')).toBeNull();
    expect(safeNext(undefined)).toBeNull();
  });
});

describe('buildInviteMessage', () => {
  const invite = {
    groupName: 'Famille Démo',
    url: 'https://under-the-tree.party/rejoindre/abcdefghijklmnop',
    until: '2026-12-20',
  };

  it('names the group, says until when, ends on the link alone', () => {
    const text = buildInviteMessage(invite, 'fr');
    expect(text).toContain('Famille Démo');
    expect(text).toContain('20 décembre');
    expect(text.split('\n').at(-1)).toBe(invite.url);
  });

  it('leaves the deadline out when there is none', () => {
    expect(buildInviteMessage({ ...invite, until: null }, 'fr')).not.toContain(
      'décembre',
    );
  });

  it('has no placeholder left in any language', () => {
    (['fr', 'en', 'de'] as const).forEach((locale) => {
      expect(buildInviteMessage(invite, locale), locale).not.toMatch(/\{\w+\}/);
    });
  });
});
