import { describe, expect, it } from 'vitest';
import { testDb } from '../../tests/d1';
import { isSwitchOn, setSwitch } from './switches';

// « Suspendre les nouveaux Secret Santa » (ticket 109): off until turned
// on, then as last set.

describe('the emergency switches', () => {
  it('are off without a row, then as last set', async () => {
    const { db } = testDb();
    expect(await isSwitchOn(db, 'new_secret_santas')).toBe(false);
    await setSwitch(db, 'new_secret_santas', true);
    expect(await isSwitchOn(db, 'new_secret_santas')).toBe(true);
    await setSwitch(db, 'new_secret_santas', false);
    expect(await isSwitchOn(db, 'new_secret_santas')).toBe(false);
  });
});
