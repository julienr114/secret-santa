import { describe, it, expect } from 'vitest';
import {
  canAccessGroup,
  canRemoveOrganizer,
  isAdminUser,
  roleOf,
  slugSchema,
  sessionUserSchema,
} from './auth';

describe('roleOf', () => {
  it('is super-admin by the flag, whatever the groups', () => {
    expect(roleOf({ isSuperAdmin: true, groupCount: 0 })).toBe('super_admin');
    expect(roleOf({ isSuperAdmin: true, groupCount: 3 })).toBe('super_admin');
  });

  it('is organiser with at least one group, member without', () => {
    expect(roleOf({ isSuperAdmin: false, groupCount: 1 })).toBe('guardian');
    expect(roleOf({ isSuperAdmin: false, groupCount: 0 })).toBe('member');
  });
});

describe('isAdminUser', () => {
  it('keeps members out of the admin', () => {
    const user = { accountId: 'a', sessionId: 's' };
    expect(isAdminUser({ ...user, role: 'super_admin' })).toBe(true);
    expect(isAdminUser({ ...user, role: 'guardian' })).toBe(true);
    expect(isAdminUser({ ...user, role: 'member' })).toBe(false);
  });
});

describe('canAccessGroup', () => {
  it('lets super-admins in everywhere and organisers only in their groups', () => {
    expect(canAccessGroup({ role: 'super_admin' }, false)).toBe(true);
    expect(canAccessGroup({ role: 'guardian' }, true)).toBe(true);
    expect(canAccessGroup({ role: 'guardian' }, false)).toBe(false);
    expect(canAccessGroup(null, true)).toBe(false);
  });
});

describe('canRemoveOrganizer', () => {
  it('lets an organiser remove another one, never themselves', () => {
    const me = { role: 'guardian' as const, accountId: 'a1' };
    expect(canRemoveOrganizer(me, 'a2')).toBe(true);
    expect(canRemoveOrganizer(me, 'a1')).toBe(false);
  });

  it('lets a super-admin remove anyone, themselves included', () => {
    const admin = { role: 'super_admin' as const, accountId: 'a1' };
    expect(canRemoveOrganizer(admin, 'a1')).toBe(true);
  });
});

describe('schemas', () => {
  it('validates slugs and session users', () => {
    expect(slugSchema.safeParse('famille-rabin').success).toBe(true);
    expect(slugSchema.safeParse('Famille Rabin').success).toBe(false);
    expect(slugSchema.safeParse('-a').success).toBe(false);
    expect(
      sessionUserSchema.safeParse({
        role: 'guardian',
        accountId: 'a1',
        sessionId: 's1',
      }).success,
    ).toBe(true);
    expect(sessionUserSchema.safeParse({ role: 'guardian' }).success).toBe(
      false,
    );
    expect(
      sessionUserSchema.safeParse({
        role: 'root',
        accountId: 'a1',
        sessionId: 's1',
      }).success,
    ).toBe(false);
  });
});
