import { describe, expect, it } from 'vitest';
import { isForeignWrite } from './origin';

describe('requests from another site', () => {
  const own = ['https://under-the-tree.party'];

  it('refuses a write sent from another site', () => {
    for (const method of ['POST', 'PUT', 'PATCH', 'DELETE', 'post']) {
      expect(
        isForeignWrite({ method, origin: 'https://evil.example' }, own),
      ).toBe(true);
    }
    // Close is not the same: another scheme, a sub-domain, « null ».
    for (const origin of [
      'http://under-the-tree.party',
      'https://x.under-the-tree.party',
      'null',
    ]) {
      expect(isForeignWrite({ method: 'POST', origin }, own)).toBe(true);
    }
  });

  it('lets through its own pages, reads, and requests without an origin', () => {
    expect(
      isForeignWrite(
        { method: 'POST', origin: 'https://under-the-tree.party' },
        own,
      ),
    ).toBe(false);
    expect(
      isForeignWrite({ method: 'GET', origin: 'https://evil.example' }, own),
    ).toBe(false);
    expect(isForeignWrite({ method: 'POST', origin: null }, own)).toBe(false);
    expect(isForeignWrite({ method: 'DELETE', origin: '' }, own)).toBe(false);
  });
});
