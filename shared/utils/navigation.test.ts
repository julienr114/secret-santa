import { describe, expect, it } from 'vitest';
import { backMove } from './navigation';

describe('backMove', () => {
  it('goes back when the page before is the parent', () => {
    expect(
      backMove('/admin/famille/editions/e1', '/admin/famille/editions/e1'),
    ).toBe('history');
  });

  it('opens the parent otherwise, whatever the history says', () => {
    // Opened from the home, the journal of a group still goes up to it.
    expect(backMove('/', '/admin/famille')).toBe('navigate');
    expect(backMove(null, '/admin/famille')).toBe('navigate');
    // The same page with another query is another place.
    expect(
      backMove(
        '/admin/famille/editions/e1',
        '/admin/famille/editions/e1?envoyer=p1',
      ),
    ).toBe('navigate');
  });
});
