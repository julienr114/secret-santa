import { describe, expect, it } from 'vitest';
import {
  canWriteIdeas,
  holderRemovalRefusal,
  inviteRefusal,
  invitesAccepted,
  listRole,
  seesGivers,
} from './listAccess';

describe('who may do what on a list', () => {
  const list = { holderIds: ['camille', 'hugo'], linkedIds: ['hugo', 'mamie'] };

  it('says what an account is to a list', () => {
    expect(listRole(list, 'camille')).toBe('holder');
    // Holding wins over figuring on the list.
    expect(listRole(list, 'hugo')).toBe('holder');
    expect(listRole(list, 'mamie')).toBe('linked');
    expect(listRole(list, 'tonton')).toBe('guest');
    expect(listRole(list, null)).toBe('guest');
  });

  it('lets a holder write everywhere, a linked person for themself only', () => {
    const mamies = { linkedAccountId: 'mamie' };
    const leos = { linkedAccountId: null };
    expect(canWriteIdeas('holder', leos, 'camille')).toBe(true);
    expect(canWriteIdeas('holder', mamies, 'camille')).toBe(true);
    expect(canWriteIdeas('linked', mamies, 'mamie')).toBe(true);
    expect(canWriteIdeas('linked', leos, 'mamie')).toBe(false);
    expect(canWriteIdeas('linked', { linkedAccountId: 'hugo' }, 'mamie')).toBe(
      false,
    );
    expect(canWriteIdeas('guest', mamies, 'tonton')).toBe(false);
    expect(canWriteIdeas('guest', leos, null)).toBe(false);
  });

  it('shows who gives to those who hold the list only', () => {
    expect(seesGivers('holder')).toBe(true);
    expect(seesGivers('linked')).toBe(false);
    expect(seesGivers('guest')).toBe(false);
  });

  it('invites an address once, and never someone who holds the list', () => {
    const there = {
      holderEmails: ['camille@example.com'],
      invitedEmails: ['mamie@example.com'],
    };
    expect(inviteRefusal('hugo@example.com', there)).toBeNull();
    expect(inviteRefusal('camille@example.com', there)).toBe('holder');
    expect(inviteRefusal('mamie@example.com', there)).toBe('invited');
  });

  it('accepts by logging in the invitations sent to that address', () => {
    const invites = [
      { email: 'hugo@example.com', listId: 'noel' },
      { email: 'hugo@example.com', listId: 'anniversaire' },
      { email: 'mamie@example.com', listId: 'noel' },
    ];
    expect(
      invitesAccepted(invites, {
        email: 'hugo@example.com',
        heldListIds: ['anniversaire'],
      }),
    ).toEqual([{ email: 'hugo@example.com', listId: 'noel' }]);
    expect(
      invitesAccepted(invites, {
        email: 'tonton@example.com',
        heldListIds: [],
      }),
    ).toEqual([]);
  });

  it('takes anyone off but the last one', () => {
    expect(holderRemovalRefusal(['camille', 'hugo'], 'hugo')).toBeNull();
    // Oneself too, while someone else stays.
    expect(holderRemovalRefusal(['camille', 'hugo'], 'camille')).toBeNull();
    expect(holderRemovalRefusal(['camille'], 'camille')).toBe('last');
    expect(holderRemovalRefusal(['camille'], 'hugo')).toBe('unknown');
  });
});
