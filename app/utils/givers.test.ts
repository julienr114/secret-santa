import { describe, expect, it } from 'vitest';
import { ideaChips, namesInOne } from './givers';

const avatar = { emoji: '🦌', color: 'plum' } as const;
const group = (
  names: string[],
  opts: { me?: string; closed?: boolean } = {},
) => ({
  kind: 'group' as const,
  closed: opts.closed ?? false,
  mine: opts.me !== undefined,
  leads: false,
  people: names.map((name) => ({ name, avatar, me: name === opts.me })),
});
const none = {
  givers: [],
  crowd: null,
  closed: false,
  mine: null,
  join: false,
};

describe('the row of pills under an idea', () => {
  it('is empty for an idea nobody gives', () => {
    expect(ideaChips({ kind: 'free' }, [])).toEqual(none);
  });

  it('says my own state in one pill, under my name or anonymous', () => {
    expect(
      ideaChips({ kind: 'mine', mode: 'alone', anonymous: false }, []),
    ).toEqual({ ...none, mine: 'alone' });
    expect(
      ideaChips({ kind: 'mine', mode: 'alone', anonymous: true }, []),
    ).toEqual({ ...none, mine: 'anonymous' });
  });

  it('is one pill for one first name, with its tick to take off', () => {
    expect(
      ideaChips({ kind: 'taken', by: 'Mamie' }, [
        { id: 'c1', by: 'Mamie', at: '2026-11-12T10:00:00.000Z' },
      ]).givers,
    ).toEqual([{ name: 'Mamie', claimId: 'c1' }]);
  });

  it('says « Anonyme » by a pill without a name, which unticks too', () => {
    expect(
      ideaChips({ kind: 'taken', by: null }, [{ id: 'c1', by: null, at: null }])
        .givers,
    ).toEqual([{ name: null, claimId: 'c1' }]);
  });

  it('shows nothing to who does not hold the list: the box says « pris »', () => {
    expect(ideaChips({ kind: 'taken', by: null }, [])).toEqual(none);
  });

  it('names the others of a gift given by several, then « Se joindre »', () => {
    expect(ideaChips(group(['Mamie', 'Tonton']), [])).toEqual({
      ...none,
      givers: [
        { name: 'Mamie', claimId: null },
        { name: 'Tonton', claimId: null },
      ],
      join: true,
    });
  });

  it('never names me: « Tu participes » says it', () => {
    expect(
      ideaChips(group(['Mamie', 'Camille', 'Tonton'], { me: 'Camille' }), [
        { id: 'c1', by: 'Mamie', at: 'a' },
        { id: 'c3', by: 'Tonton', at: 'c' },
      ]),
    ).toEqual({
      ...none,
      givers: [
        { name: 'Mamie', claimId: 'c1' },
        { name: 'Tonton', claimId: 'c3' },
      ],
      mine: 'group',
    });
  });

  it('says « Au complet » and offers nothing to join once closed', () => {
    const chips = ideaChips(group(['Mamie', 'Tonton'], { closed: true }), []);
    expect(chips.closed).toBe(true);
    expect(chips.join).toBe(false);
  });

  it('counts them beyond three, me included, for who cannot untick', () => {
    const many = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
    expect(ideaChips(group(many), [])).toMatchObject({ givers: [], crowd: 7 });
    // Three others and me: still named.
    expect(
      ideaChips(group(['A', 'B', 'C', 'Moi'], { me: 'Moi' }), []).givers,
    ).toHaveLength(3);
    // Those who hold the list keep one pill each: each unticks its own.
    expect(
      ideaChips(
        group(many),
        many.map((by, index) => ({ id: `c${index}`, by, at: 'a' })),
      ),
    ).toMatchObject({ crowd: null, givers: { length: 7 } });
  });

  it('tells two people of the same first name apart, in their order', () => {
    expect(
      ideaChips(group(['Léa', 'Léa']), [
        { id: 'c1', by: 'Léa', at: 'a' },
        { id: 'c2', by: 'Léa', at: 'b' },
      ]).givers,
    ).toEqual([
      { name: 'Léa', claimId: 'c1' },
      { name: 'Léa', claimId: 'c2' },
    ]);
  });
});

describe('several first names as one reads them', () => {
  it('joins the last one with « et »', () => {
    expect(namesInOne([], 'et')).toBe('');
    expect(namesInOne(['Mamie'], 'et')).toBe('Mamie');
    expect(namesInOne(['Mamie', 'Tonton'], 'et')).toBe('Mamie et Tonton');
    expect(namesInOne(['Mamie', 'Tonton', 'Hugo'], 'and')).toBe(
      'Mamie, Tonton and Hugo',
    );
  });
});
