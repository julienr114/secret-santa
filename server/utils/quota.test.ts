import { describe, expect, it } from 'vitest';
import {
  APP_GROUPS_COMFORT,
  GROUP_QUOTA_MAX,
  appLoad,
  canCreateGroup,
  canDisableAccount,
  canRequestGroup,
  quotaAfterApproval,
  remainingGroups,
} from './quota';
import { failureOf } from '~~/tests/helpers';

const member = { isSuperAdmin: false, groupQuota: 0, createdCount: 0 };

describe('remainingGroups', () => {
  it('is the quota minus the groups created, never negative', () => {
    expect(remainingGroups(member)).toBe(0);
    expect(remainingGroups({ ...member, groupQuota: 2, createdCount: 1 })).toBe(
      1,
    );
    expect(remainingGroups({ ...member, groupQuota: 1, createdCount: 3 })).toBe(
      0,
    );
  });

  it('has no limit for a super-admin', () => {
    expect(remainingGroups({ ...member, isSuperAdmin: true })).toBe(Infinity);
  });
});

describe('canCreateGroup', () => {
  it('refuses by default and once the quota is used up', () => {
    expect(failureOf(canCreateGroup(member)).reason).toBe(
      'group_quota_reached',
    );
    expect(
      failureOf(canCreateGroup({ ...member, groupQuota: 1, createdCount: 1 }))
        .reason,
    ).toBe('group_quota_reached');
  });

  it('allows with room left, and always for a super-admin', () => {
    expect(canCreateGroup({ ...member, groupQuota: 1 }).ok).toBe(true);
    expect(canCreateGroup({ ...member, isSuperAdmin: true }).ok).toBe(true);
  });
});

describe('canRequestGroup', () => {
  it('allows an account with no room and no pending request', () => {
    expect(canRequestGroup(member, false).ok).toBe(true);
  });

  it('refuses a second request while one is pending', () => {
    expect(failureOf(canRequestGroup(member, true)).reason).toBe(
      'group_request_pending',
    );
  });

  it('refuses when the account can already create a group', () => {
    expect(
      failureOf(canRequestGroup({ ...member, groupQuota: 1 }, false)).reason,
    ).toBe('group_request_useless');
    expect(
      failureOf(canRequestGroup({ ...member, isSuperAdmin: true }, false))
        .reason,
    ).toBe('group_request_useless');
  });
});

describe('quotaAfterApproval', () => {
  it('leaves room for exactly one more group', () => {
    expect(quotaAfterApproval({ groupQuota: 0, createdCount: 0 })).toBe(1);
    expect(quotaAfterApproval({ groupQuota: 1, createdCount: 1 })).toBe(2);
    // A quota lowered below what exists is caught up first.
    expect(quotaAfterApproval({ groupQuota: 0, createdCount: 2 })).toBe(3);
  });

  it('never goes over the maximum', () => {
    expect(
      quotaAfterApproval({
        groupQuota: GROUP_QUOTA_MAX,
        createdCount: GROUP_QUOTA_MAX,
      }),
    ).toBe(GROUP_QUOTA_MAX);
  });
});

describe('canDisableAccount', () => {
  it('lets a super-admin disable anyone but themselves', () => {
    expect(canDisableAccount('a', 'b').ok).toBe(true);
    expect(failureOf(canDisableAccount('a', 'a')).reason).toBe(
      'cannot_disable_self',
    );
  });
});

describe('appLoad', () => {
  it('is fine well below the comfort level', () => {
    expect(appLoad(0)).toBe('ok');
    expect(appLoad(APP_GROUPS_COMFORT * 0.8 - 2)).toBe('ok');
  });

  it('warns when close, then past it', () => {
    expect(appLoad(APP_GROUPS_COMFORT * 0.8 - 1)).toBe('near');
    expect(appLoad(APP_GROUPS_COMFORT - 1)).toBe('near');
    expect(appLoad(APP_GROUPS_COMFORT)).toBe('over');
  });
});
