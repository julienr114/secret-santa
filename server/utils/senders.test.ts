import { describe, expect, it } from 'vitest';
import { reminderSender } from './senders';

describe('who sent the last reminder (ticket 170)', () => {
  const two = [
    { id: 'a1', firstName: 'Camille' },
    { id: 'a2', firstName: 'Hugo' },
  ];

  it('names the other organiser, or says « toi »', () => {
    expect(reminderSender('a2', two, 'a1')).toEqual({
      me: false,
      name: 'Hugo',
    });
    expect(reminderSender('a1', two, 'a1')).toEqual({ me: true });
  });

  it('says nothing with one organiser, or nobody known', () => {
    expect(reminderSender('a1', [two[0]!], 'a1')).toBeNull();
    expect(reminderSender(undefined, two, 'a1')).toBeNull();
    expect(reminderSender('gone', two, 'a1')).toBeNull();
  });
});
