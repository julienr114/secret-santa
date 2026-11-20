import { describe, expect, it } from 'vitest';
import { linkedVisibility, listPartySlug, ownPartyOf } from './listParties';

const NOW = '2026-11-20T10:00:00.000Z';

describe('ownPartyOf', () => {
  it('takes the name, icon and date of the list, and a category from its icon', () => {
    expect(
      ownPartyOf(
        {
          title: 'Les 7 ans de Léo',
          iconEmoji: '🎂',
          iconColor: 'mustard',
          eventDate: '2027-03-01',
        },
        NOW,
      ),
    ).toEqual({
      party: {
        name: 'Les 7 ans de Léo',
        category: 'birthday',
        iconEmoji: '🎂',
        iconColor: 'mustard',
        usualDate: null,
        recurring: false,
        fromList: true,
        rules: {},
      },
      year: { year: 2027, date: '2027-03-01' },
    });
  });

  it('puts a list without a date in the year it is made, and « other » for an icon of no category', () => {
    const { party, year } = ownPartyOf(
      { title: '', iconEmoji: '❄️', iconColor: 'night', eventDate: null },
      NOW,
    );
    expect(party.category).toBe('other');
    expect(year).toEqual({ year: 2026, date: null });
  });
});

describe('linkedVisibility', () => {
  it('opens a public list to the party, keeps the others for the giver', () => {
    expect(linkedVisibility({ shareToken: 'abc' })).toBe('party');
    expect(linkedVisibility({ shareToken: null })).toBe('giver');
  });
});

describe('listPartySlug', () => {
  it('writes the bytes in hex after « liste- »', () => {
    expect(listPartySlug(new Uint8Array([0, 15, 255]))).toBe('liste-000fff');
  });
});
