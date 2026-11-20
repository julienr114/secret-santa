import { describe, expect, it } from 'vitest';
import { pastDrawsByYear } from './home';

describe('pastDrawsByYear', () => {
  it('keeps the closed draws, by year, the latest first, then by group', () => {
    const past = (groupName: string, year: number, status = 'closed') => ({
      groupName,
      year,
      status,
    });
    expect(
      pastDrawsByYear([
        past('Cousins', 2024),
        past('Amis', 2025),
        past('Famille', 2026, 'drawn'),
        past('Amis', 2024),
      ]),
    ).toEqual([
      { year: 2025, draws: [past('Amis', 2025)] },
      { year: 2024, draws: [past('Amis', 2024), past('Cousins', 2024)] },
    ]);
    expect(pastDrawsByYear([])).toEqual([]);
  });
});
