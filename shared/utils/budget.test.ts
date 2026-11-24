import { describe, expect, it } from 'vitest';
import { budgetOf, budgetPick } from './budget';

const tiles = ['5 €', '15 €', '30 €', '50 €', '75 €', 'Sans limite'];

describe('the page « Budget »', () => {
  it('chooses the tile whose text a budget is, else the line', () => {
    expect(budgetPick('15 €', tiles)).toEqual({ tile: 1, free: '' });
    expect(budgetPick('Sans limite', tiles)).toEqual({ tile: 5, free: '' });
    // Written otherwise, from a Secret Santa before: on the line, as it is.
    expect(budgetPick(' 20 € ', tiles)).toEqual({ tile: null, free: '20 €' });
    expect(budgetPick('', tiles)).toEqual({ tile: null, free: '' });
  });

  it('saves the text of the tile, or the line; nothing, no budget', () => {
    expect(budgetOf({ tile: 2, free: '' }, tiles)).toBe('30 €');
    expect(budgetOf({ tile: null, free: ' Fait main ' }, tiles)).toBe(
      'Fait main',
    );
    expect(budgetOf({ tile: null, free: '' }, tiles)).toBe('');
  });
});
