import { describe, expect, it } from 'vitest';
import { tourKindOf, tourSeen, tourSteps } from './listTour';

describe('listTour', () => {
  it('opens a visit from the address of a list just made, once per account', () => {
    expect(tourKindOf('secret', false)).toBe('secret');
    expect(tourKindOf('creer', false)).toBe('create');
    expect(tourKindOf('creer', true)).toBeNull();
    expect(tourKindOf(undefined, false)).toBeNull();
    expect(tourKindOf('autre', false)).toBeNull();
  });

  it('has six steps from a Secret Santa, five without « Repartir »', () => {
    expect(tourSteps('secret', true)).toEqual([
      'me',
      'line',
      'share',
      'name',
      'resume',
      'add',
    ]);
    expect(tourSteps('secret', false)).toHaveLength(5);
    expect(tourSteps('create', true)).toEqual(['name', 'add', 'share']);
  });

  it('keeps the note of the first line only after the visit from « Créer », to its end', () => {
    expect(tourSeen('create', 'done')).toBe('visit');
    expect(tourSeen('create', 'skipped')).toBe('both');
    expect(tourSeen('secret', 'done')).toBe('both');
  });
});
