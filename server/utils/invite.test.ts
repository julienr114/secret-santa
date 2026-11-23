import { describe, expect, it } from 'vitest';
import {
  INVITE_CODE_SHAPE,
  buildInviteMessage,
  canClaim,
  canSignUp,
  invitePlace,
  defaultInvitePlaces,
  linkPlaces,
  generateInviteCode,
  safeNext,
} from './invite';
import { MAX_PARTY_MEMBERS } from './parties';
import { failureOf } from '~~/tests/helpers';

describe('generateInviteCode', () => {
  it('makes 16 URL-safe characters, different each time', () => {
    const code = generateInviteCode();
    expect(code).toMatch(INVITE_CODE_SHAPE);
    expect(generateInviteCode()).not.toBe(code);
  });
});

describe('canSignUp', () => {
  const door = {
    status: 'preparing',
    until: '2026-12-20',
    places: 3,
    member: false,
  } as const;

  it('lets people in until the last day, while places remain', () => {
    expect(canSignUp(door, '2026-12-01').ok).toBe(true);
    expect(canSignUp(door, '2026-12-20').ok).toBe(true);
    expect(canSignUp({ ...door, until: null }, '2030-01-01').ok).toBe(true);
  });

  it('refuses after the last day', () => {
    expect(failureOf(canSignUp(door, '2026-12-21')).reason).toBe(
      'invite_expired',
    );
  });

  it('refuses a newcomer once the places are taken, not a member', () => {
    expect(
      failureOf(canSignUp({ ...door, places: 0 }, '2026-12-01')).reason,
    ).toBe('invite_full');
    expect(
      canSignUp({ ...door, places: 0, member: true }, '2026-12-01').ok,
    ).toBe(true);
  });

  it('lets nobody in once the draw is done', () => {
    expect(
      failureOf(canSignUp({ ...door, status: 'drawn' }, '2026-12-01')).reason,
    ).toBe('invite_drawn');
    expect(
      failureOf(
        canSignUp({ ...door, status: 'closed', member: true }, '2026-12-01'),
      ).reason,
    ).toBe('invite_drawn');
  });
});

describe('invitePlace', () => {
  it('adds the Secret Santa between brackets only when it must be said', () => {
    expect(invitePlace('Famille Camille', null)).toBe('Famille Camille');
    expect(invitePlace('Famille Camille', 'Les adultes')).toBe(
      'Famille Camille (Les adultes)',
    );
  });
});

describe('defaultInvitePlaces', () => {
  it('offers what the party can still take before 30 members', () => {
    expect(defaultInvitePlaces(8)).toBe(MAX_PARTY_MEMBERS - 8);
    expect(defaultInvitePlaces(MAX_PARTY_MEMBERS + 5)).toBe(0);
  });
});

describe('linkPlaces', () => {
  it('never offers more than what is left before 30 members', () => {
    expect(linkPlaces(10, 5)).toBe(10);
    expect(linkPlaces(10, 25)).toBe(5);
    expect(linkPlaces(10, MAX_PARTY_MEMBERS)).toBe(0);
    expect(linkPlaces(null, 5)).toBe(0);
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
    place: 'Famille Démo',
    url: 'https://under-the-tree.party/rejoindre/abcdefghijklmnop',
    until: '2026-12-20',
  };

  it('names the Secret Santa, says until when, ends on the link alone', () => {
    const text = buildInviteMessage(invite, 'fr');
    expect(text).toContain('Famille Démo');
    expect(text).toContain('20 décembre');
    expect(text.split('\n').at(-1)).toBe(invite.url);
  });

  it('invites to the Secret Santa, its name between brackets when needed', () => {
    expect(buildInviteMessage(invite, 'fr')).toContain(
      'Je t’invite au Secret Santa « Famille Démo »',
    );
    expect(
      buildInviteMessage(
        { ...invite, place: invitePlace('Famille Démo', 'Les adultes') },
        'fr',
      ),
    ).toContain('« Famille Démo (Les adultes) »');
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
