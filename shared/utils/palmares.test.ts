import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { LOCALES, santaKey, translateKey } from '#shared/i18n';
import fr from '#shared/i18n/locales/fr';
import {
  noGuessKey,
  storyEnd,
  storyLooks,
  storyScreens,
  storyStep,
} from './palmares';

describe('storyScreens', () => {
  it('opens, shows one’s own Santa, each award won, then ends', () => {
    expect(
      storyScreens({
        awards: [{ kind: 'detective' }, { kind: 'hidden' }],
        hasSanta: true,
      }).map((s) => (s.kind === 'award' ? s.award : s.kind)),
    ).toEqual(['opening', 'suspense', 'santa', 'detective', 'hidden', 'end']);
  });

  it('leaves one’s own Santa out for an organiser who does not play', () => {
    expect(
      storyScreens({ awards: [{ kind: 'suspect' }], hasSanta: false }).map(
        (s) => s.kind,
      ),
    ).toEqual(['opening', 'award', 'end']);
  });
});

describe('« Si près du but » and the colours', () => {
  it('puts « Si près du but » right after one’s own Santa', () => {
    expect(
      storyScreens({
        awards: [{ kind: 'unmasked' }],
        hasSanta: true,
        closeCall: true,
      }).map((s) => s.kind),
    ).toEqual(['opening', 'suspense', 'santa', 'closeCall', 'award', 'end']);
  });

  it('turns the award colours by rank, the fixed screens keeping theirs', () => {
    const screens = storyScreens({
      awards: [
        { kind: 'unmasked' },
        { kind: 'hidden' },
        { kind: 'suspect' },
        { kind: 'twins' },
        { kind: 'group' },
      ],
      hasSanta: true,
    });
    expect(storyLooks(screens)).toEqual([
      'pine',
      'brick',
      'brick',
      'mustard',
      'plum',
      'pine',
      'brick',
      'mustard',
      'cream',
    ]);
  });

  it('never gives two award neighbours the same colour', () => {
    const KINDS = ['unmasked', 'hidden', 'rumour', 'group'] as const;
    fc.assert(
      fc.property(
        fc.array(fc.constantFrom(...KINDS), { maxLength: 10 }),
        fc.boolean(),
        fc.boolean(),
        (kinds, hasSanta, closeCall) => {
          const screens = storyScreens({
            awards: kinds.map((kind) => ({ kind })),
            hasSanta,
            closeCall: hasSanta && closeCall,
          });
          const looks = storyLooks(screens);
          return looks.every(
            (look, i) =>
              i === 0 ||
              look !== looks[i - 1] ||
              // Suspense, Santa and « Si près du but » are all brick.
              (screens[i]!.kind !== 'award' &&
                screens[i - 1]!.kind !== 'award'),
          );
        },
      ),
    );
  });
});

describe('storyStep', () => {
  it('goes on to the right, back to the left, never past the ends', () => {
    expect(storyStep(0, 5, 'right')).toBe(1);
    expect(storyStep(4, 5, 'right')).toBe(4);
    expect(storyStep(2, 5, 'left')).toBe(1);
    expect(storyStep(0, 5, 'left')).toBe(0);
  });
});

describe('storyEnd', () => {
  it('says « pour cette année » only in a party that comes back', () => {
    expect(storyEnd({ recurring: true, firstName: 'Inès' })).toEqual({
      eyebrow: 'participant.game.story.endEyebrow',
      title: 'participant.game.story.endTitle',
      params: { name: 'Inès' },
    });
    expect(storyEnd({ recurring: false, firstName: null })).toEqual({
      eyebrow: 'participant.game.story.endEyebrowOnce',
      title: 'participant.game.story.endTitleAlone',
    });
  });

  it('thanks the reader outside Christmas, everyone for an organiser', () => {
    const say = (christmas: boolean, firstName: string | null) => {
      const end = storyEnd({ recurring: false, firstName });
      return translateKey('fr', santaKey(end.title, christmas), end.params);
    };
    expect(say(true, 'Inès')).toBe('Joyeux Noël,\nInès');
    expect(say(false, 'Inès')).toBe('Merci d’avoir joué,\nInès');
    expect(say(false, null)).toBe('Merci à tous !');
  });
});

describe('noGuessKey', () => {
  it('promises a next year only in a party that comes back', () => {
    expect(translateKey('fr', noGuessKey(true))).toBe(
      'Tu n’avais pas fait de pronostic. L’an prochain ?',
    );
    expect(translateKey('fr', noGuessKey(false))).toBe(
      'Tu n’avais pas fait de pronostic.',
    );
  });
});

describe('the palmarès outside Christmas', () => {
  /**
   * Every text under a key, its plural forms as one.
   * @param node - A branch of the French dictionary.
   * @param path - Its key.
   * @returns The keys of its texts.
   */
  const leaves = (node: unknown, path: string): string[] =>
    typeof node === 'object' && node !== null && !('other' in node)
      ? Object.entries(node).flatMap(([key, child]) =>
          leaves(child, `${path}.${key}`),
        )
      : [path];
  const keys = [
    ...leaves(fr.participant.game.story, 'participant.game.story'),
    ...leaves(fr.participant.game.awards, 'participant.game.awards'),
  ].filter((key) => !/Neutral(\.|$)/.test(key));

  it('never says « Noël », in any language', () => {
    const christmas = /No[eë]l|Christmas|Weihnacht/i;
    const said = LOCALES.flatMap((locale) =>
      keys
        .map((key) =>
          translateKey(locale, santaKey(key, false), {
            name: 'Inès',
            a: 'Inès',
            count: 2,
          }),
        )
        .filter((text) => christmas.test(text)),
    );
    expect(keys.length).toBeGreaterThan(40);
    expect(said).toEqual([]);
  });
});
