import { describe, expect, it } from 'vitest';
import { followState, followersToTell, toggledFollow } from './follows';

const context = {
  holders: new Set(['camille']),
  mayOpen: (id: string) => id !== 'gone',
  by: 'mamie',
  past: false,
};

describe('followersToTell', () => {
  const follows = [
    { accountId: 'hugo', listPersonId: 'leo' },
    { accountId: 'ines', listPersonId: 'zoe' },
    { accountId: 'tom', listPersonId: null },
  ];

  it('tells who follows Léo of an idea for Léo, not of one for Zoé', () => {
    expect(
      followersToTell(follows, { kind: 'idea', listPersonId: 'leo' }, context),
    ).toEqual(['hugo', 'tom']);
    expect(
      followersToTell(follows, { kind: 'idea', listPersonId: 'zoe' }, context),
    ).toEqual(['ines', 'tom']);
  });

  it('tells only who follows the whole list of a person added', () => {
    expect(followersToTell(follows, { kind: 'person' }, context)).toEqual([
      'tom',
    ]);
  });

  it('never tells who holds it, who wrote, or who may no longer open it', () => {
    const more = [
      ...follows,
      { accountId: 'camille', listPersonId: null },
      { accountId: 'mamie', listPersonId: null },
      { accountId: 'gone', listPersonId: 'leo' },
    ];
    expect(
      followersToTell(more, { kind: 'idea', listPersonId: 'leo' }, context),
    ).toEqual(['hugo', 'tom']);
  });

  it('tells nobody on a list of a year over', () => {
    expect(
      followersToTell(
        follows,
        { kind: 'idea', listPersonId: 'leo' },
        { ...context, past: true },
      ),
    ).toEqual([]);
  });

  it('tells once who follows both the list and a person', () => {
    expect(
      followersToTell(
        [
          { accountId: 'tom', listPersonId: null },
          { accountId: 'tom', listPersonId: 'leo' },
        ],
        { kind: 'idea', listPersonId: 'leo' },
        context,
      ),
    ).toEqual(['tom']);
  });
});

describe('followState', () => {
  it('says nothing, the whole list, or the people', () => {
    expect(followState([])).toEqual({ kind: 'none' });
    expect(
      followState([{ listPersonId: 'leo' }, { listPersonId: null }]),
    ).toEqual({ kind: 'list' });
    expect(followState([{ listPersonId: 'leo' }])).toEqual({
      kind: 'people',
      listPersonIds: ['leo'],
    });
  });
});

describe('toggledFollow', () => {
  const people = ['leo', 'zoe', 'camille'];

  it('follows the whole list, then stops', () => {
    expect(toggledFollow({ kind: 'none' }, { kind: 'list' }, people)).toEqual({
      list: true,
      people: [],
    });
    expect(toggledFollow({ kind: 'list' }, { kind: 'list' }, people)).toEqual({
      list: false,
      people: [],
    });
  });

  it('follows a person, then stops', () => {
    const leo = { kind: 'person' as const, listPersonId: 'leo' };
    expect(toggledFollow({ kind: 'none' }, leo, people)).toEqual({
      list: false,
      people: ['leo'],
    });
    expect(
      toggledFollow({ kind: 'people', listPersonIds: ['leo'] }, leo, people),
    ).toEqual({ list: false, people: [] });
  });

  it('keeps the others when a person is left while following all', () => {
    expect(
      toggledFollow(
        { kind: 'list' },
        { kind: 'person', listPersonId: 'zoe' },
        people,
      ),
    ).toEqual({ list: false, people: ['leo', 'camille'] });
  });
});
