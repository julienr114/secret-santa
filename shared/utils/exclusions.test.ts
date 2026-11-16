import { describe, expect, it } from 'vitest';
import { notDrawnBy } from './exclusions';

const ex = (
  id: string,
  giverId: string,
  receiverId: string,
  reciprocal: boolean,
) => ({
  id,
  giverId,
  receiverId,
  reciprocal,
});

describe('notDrawnBy', () => {
  it('counts both ways for a reciprocal exclusion', () => {
    const list = [ex('e1', 'camille', 'hugo', true)];
    expect(notDrawnBy('camille', list)).toEqual([
      { exclusionId: 'e1', personId: 'hugo', reciprocal: true },
    ]);
    expect(notDrawnBy('hugo', list)).toEqual([
      { exclusionId: 'e1', personId: 'camille', reciprocal: true },
    ]);
  });

  it('counts one way only for the giver', () => {
    const list = [ex('e1', 'ines', 'louis', false)];
    expect(notDrawnBy('ines', list)).toEqual([
      { exclusionId: 'e1', personId: 'louis', reciprocal: false },
    ]);
    expect(notDrawnBy('louis', list)).toEqual([]);
  });

  it('ignores exclusions between others', () => {
    expect(notDrawnBy('rose', [ex('e1', 'a', 'b', true)])).toEqual([]);
  });
});
