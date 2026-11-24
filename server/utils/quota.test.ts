import { describe, expect, it } from 'vitest';
import {
  APP_GROUPS_COMFORT,
  appLoad,
  canDisableAccount,
  canOrganiseSecretSanta,
  remainingSecretSantas,
} from './quota';
import { failureOf } from '~~/tests/helpers';

const member = { isSuperAdmin: false, secretSantaLimit: 3, organisedCount: 0 };

describe('remainingSecretSantas', () => {
  it('is the limit minus those in progress, never negative', () => {
    expect(remainingSecretSantas(member)).toBe(3);
    expect(remainingSecretSantas({ ...member, organisedCount: 2 })).toBe(1);
    expect(
      remainingSecretSantas({
        ...member,
        secretSantaLimit: 1,
        organisedCount: 3,
      }),
    ).toBe(0);
  });

  it('has no limit for a super-admin', () => {
    expect(
      remainingSecretSantas({
        ...member,
        isSuperAdmin: true,
        organisedCount: 9,
      }),
    ).toBe(Infinity);
  });
});

describe('canOrganiseSecretSanta', () => {
  it('allows up to the limit, then refuses the next one', () => {
    expect(canOrganiseSecretSanta({ ...member, organisedCount: 2 }).ok).toBe(
      true,
    );
    expect(
      failureOf(canOrganiseSecretSanta({ ...member, organisedCount: 3 }))
        .reason,
    ).toBe('secret_santa_limit_reached');
  });

  it('refuses everyone while new Secret Santa are paused', () => {
    expect(failureOf(canOrganiseSecretSanta(member, true)).reason).toBe(
      'secret_santa_paused',
    );
    expect(
      failureOf(canOrganiseSecretSanta({ ...member, isSuperAdmin: true }, true))
        .reason,
    ).toBe('secret_santa_paused');
  });

  it('always allows a super-admin', () => {
    expect(
      canOrganiseSecretSanta({
        ...member,
        isSuperAdmin: true,
        organisedCount: 3,
      }).ok,
    ).toBe(true);
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
