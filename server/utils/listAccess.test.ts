import { describe, expect, it } from 'vitest';
import {
  INVITE_KEEP_MS,
  INVITE_TTL_MS,
  MANAGING,
  WRITING,
  canWriteIdeas,
  holderMay,
  holderRemovalRefusal,
  inviteForgotten,
  inviteLinkUsable,
  inviteRefusal,
  listArrival,
  inviteState,
  invitesAccepted,
  levelChangeRefusal,
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

  const NOW = '2026-11-19T20:00:00.000Z';
  const waiting = {
    expiresAt: '2026-11-25T20:00:00.000Z',
    acceptedAt: null,
    declinedAt: null,
  };
  const expired = { ...waiting, expiresAt: '2026-11-12T20:00:00.000Z' };
  const declined = { ...waiting, declinedAt: '2026-11-18T10:00:00.000Z' };
  const accepted = { ...waiting, acceptedAt: '2026-11-18T10:00:00.000Z' };

  it('accepts by logging in the invitations still waiting for that address', () => {
    const invites = [
      { ...waiting, email: 'hugo@example.com', listId: 'noel' },
      { ...waiting, email: 'hugo@example.com', listId: 'anniversaire' },
      { ...waiting, email: 'mamie@example.com', listId: 'noel' },
      // Expired or refused: no access, even with the right address.
      { ...expired, email: 'hugo@example.com', listId: 'paques' },
      { ...declined, email: 'hugo@example.com', listId: 'fete' },
    ];
    expect(
      invitesAccepted(
        invites,
        { email: 'hugo@example.com', heldListIds: ['anniversaire'] },
        NOW,
      ).map((invite) => invite.listId),
    ).toEqual(['noel']);
    expect(
      invitesAccepted(
        invites,
        { email: 'tonton@example.com', heldListIds: [] },
        NOW,
      ),
    ).toEqual([]);
  });

  it('lets both levels write and see, and one of them manage', () => {
    for (const action of WRITING) {
      expect(holderMay('write', action)).toBe(true);
      expect(holderMay('manage', action)).toBe(true);
    }
    for (const action of MANAGING) {
      expect(holderMay('write', action)).toBe(false);
      expect(holderMay('manage', action)).toBe(true);
    }
  });

  const camille = { accountId: 'camille', level: 'manage' as const };
  const hugo = { accountId: 'hugo', level: 'write' as const };
  const mamie = { accountId: 'mamie', level: 'manage' as const };

  it('lets those who manage change a level, but the last one stays', () => {
    const holders = [camille, hugo];
    expect(levelChangeRefusal(holders, 'camille', 'hugo', 'manage')).toBeNull();
    expect(levelChangeRefusal(holders, 'hugo', 'hugo', 'manage')).toBe(
      'forbidden',
    );
    expect(levelChangeRefusal(holders, 'hugo', 'camille', 'write')).toBe(
      'forbidden',
    );
    expect(levelChangeRefusal(holders, 'tonton', 'hugo', 'manage')).toBe(
      'forbidden',
    );
    expect(levelChangeRefusal(holders, 'camille', 'tonton', 'write')).toBe(
      'unknown',
    );
    // The only one who manages is not brought down, by anyone.
    expect(levelChangeRefusal(holders, 'camille', 'camille', 'write')).toBe(
      'last_manager',
    );
    expect(
      levelChangeRefusal([camille, mamie], 'mamie', 'camille', 'write'),
    ).toBeNull();
  });

  it('takes someone off by those who manage, or by themself, but the last who manages', () => {
    const holders = [camille, hugo];
    expect(holderRemovalRefusal(holders, 'camille', 'hugo')).toBeNull();
    // « Aide à écrire » leaves, but takes nobody off.
    expect(holderRemovalRefusal(holders, 'hugo', 'hugo')).toBeNull();
    expect(holderRemovalRefusal(holders, 'hugo', 'camille')).toBe('forbidden');
    expect(holderRemovalRefusal(holders, 'tonton', 'hugo')).toBe('forbidden');
    expect(holderRemovalRefusal(holders, 'camille', 'tonton')).toBe('unknown');
    // The last who manages cannot go, alone or not.
    expect(holderRemovalRefusal(holders, 'camille', 'camille')).toBe('last');
    expect(holderRemovalRefusal([camille], 'camille', 'camille')).toBe('last');
    expect(
      holderRemovalRefusal([camille, mamie], 'camille', 'camille'),
    ).toBeNull();
    expect(
      holderRemovalRefusal([camille, mamie], 'mamie', 'camille'),
    ).toBeNull();
  });

  it('says where an invitation stands', () => {
    expect(inviteState(waiting, NOW)).toBe('waiting');
    expect(inviteState(expired, NOW)).toBe('expired');
    expect(inviteState(declined, NOW)).toBe('declined');
    expect(inviteState(accepted, NOW)).toBe('accepted');
    // On the very instant it ends, it has ended.
    expect(inviteState(waiting, waiting.expiresAt)).toBe('expired');
    // An answer wins over the time passed since.
    expect(inviteState({ ...expired, declinedAt: NOW }, NOW)).toBe('declined');
  });

  it('gives an invitation 7 days', () => {
    const sent = '2026-11-18T09:00:00.000Z';
    const invite = {
      ...waiting,
      expiresAt: new Date(Date.parse(sent) + INVITE_TTL_MS).toISOString(),
    };
    expect(invite.expiresAt).toBe('2026-11-25T09:00:00.000Z');
    expect(inviteState(invite, '2026-11-25T08:59:59.000Z')).toBe('waiting');
    expect(inviteState(invite, '2026-11-25T09:00:00.000Z')).toBe('expired');
  });

  it('lets the link of an invitation act once, within its time', () => {
    expect(inviteLinkUsable(waiting, NOW)).toBe(true);
    expect(inviteLinkUsable(accepted, NOW)).toBe(false);
    expect(inviteLinkUsable(declined, NOW)).toBe(false);
    expect(inviteLinkUsable(expired, NOW)).toBe(false);
  });

  it('forgets a line 30 days after it ended', () => {
    expect(inviteForgotten(waiting, NOW)).toBe(false);
    // Expired a week ago: still shown, with « Renvoyer ».
    expect(inviteForgotten(expired, NOW)).toBe(false);
    expect(inviteForgotten(expired, '2026-12-12T20:00:00.000Z')).toBe(true);
    expect(inviteForgotten(declined, '2026-12-18T09:59:59.000Z')).toBe(false);
    expect(inviteForgotten(declined, '2026-12-18T10:00:00.000Z')).toBe(true);
    expect(inviteForgotten(accepted, '2026-12-18T10:00:00.000Z')).toBe(true);
    expect(INVITE_KEEP_MS).toBe(30 * 24 * 60 * 60 * 1000);
  });
});

describe('listArrival', () => {
  const nobody = {
    loggedIn: true,
    holder: false,
    isPublic: false,
    member: false,
    giver: false,
  };

  it('opens to those who hold it, to members where it is shared, to all when public', () => {
    expect(listArrival({ ...nobody, holder: true })).toBe('open');
    expect(listArrival({ ...nobody, member: true })).toBe('open');
    expect(listArrival({ ...nobody, loggedIn: false, giver: true })).toBe(
      'open',
    );
    expect(listArrival({ ...nobody, loggedIn: false, isPublic: true })).toBe(
      'open',
    );
  });

  it('asks to log in first, and closes to an account it is not shared with', () => {
    expect(listArrival({ ...nobody, loggedIn: false })).toBe('login');
    expect(listArrival(nobody)).toBe('closed');
  });
});
