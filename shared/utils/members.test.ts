import { describe, expect, it } from 'vitest';
import {
  canInviteToList,
  entersByListLink,
  entryParts,
  takenOnce,
} from './members';

describe('by where a member came in', () => {
  const event = {
    santas: [
      { id: 's1', name: 'Noël 2025', current: false },
      { id: 's2', name: 'Noël 2026', current: true },
    ],
    lists: [{ id: 'l1', holder: 'Camille' }],
  };

  it('says « Secret Santa » when the event has one this year', () => {
    expect(entryParts([{ kind: 'santa', santaId: 's2' }], event)).toEqual([
      { kind: 'santa', name: null },
    ]);
  });

  it('says it once for several years', () => {
    expect(
      entryParts(
        [
          { kind: 'santa', santaId: 's1' },
          { kind: 'santa', santaId: 's2' },
        ],
        event,
      ),
    ).toEqual([{ kind: 'santa', name: null }]);
  });

  it('names the Secret Santa of this year when there are several', () => {
    const two = {
      ...event,
      santas: [
        ...event.santas,
        { id: 's3', name: 'Les enfants', current: true },
      ],
    };
    expect(
      entryParts(
        [
          { kind: 'santa', santaId: 's3' },
          { kind: 'santa', santaId: 's1' },
        ],
        two,
      ),
    ).toEqual([
      { kind: 'santa', name: null },
      { kind: 'santa', name: 'Les enfants' },
    ]);
  });

  it('says the list, after the Secret Santa', () => {
    expect(
      entryParts(
        [
          { kind: 'list', listId: 'l1' },
          { kind: 'santa', santaId: 's2' },
        ],
        event,
      ),
    ).toEqual([
      { kind: 'santa', name: null },
      { kind: 'list', holder: 'Camille' },
    ]);
  });

  it('says nothing of a Secret Santa or a list gone, nor of no entry', () => {
    expect(
      entryParts(
        [
          { kind: 'santa', santaId: 'gone' },
          { kind: 'list', listId: 'gone' },
        ],
        event,
      ),
    ).toEqual([]);
    expect(entryParts([], event)).toEqual([]);
  });
});

describe('inviting someone to a list', () => {
  it('is for who manages a list shared with all the members of its event', () => {
    expect(canInviteToList({ manages: true, ownStage: 'party' })).toBe(true);
  });

  it('is not for a draft, a list kept for the one who drew, or a helper', () => {
    expect(canInviteToList({ manages: true, ownStage: null })).toBe(false);
    expect(canInviteToList({ manages: true, ownStage: 'giver' })).toBe(false);
    expect(canInviteToList({ manages: false, ownStage: 'party' })).toBe(false);
  });
});

describe('the link of a list makes one come in', () => {
  const arrival = {
    loggedIn: true,
    ownStage: 'party' as const,
    member: false,
    placesLeft: 3,
  };

  it('when logged in, not a member, shared with all, with a place left', () => {
    expect(entersByListLink(arrival)).toBe(true);
  });

  it('never from a draft or a list kept for the one who drew', () => {
    expect(entersByListLink({ ...arrival, ownStage: null })).toBe(false);
    expect(entersByListLink({ ...arrival, ownStage: 'giver' })).toBe(false);
  });

  it('never past 30, nor without a session, nor for a member', () => {
    expect(entersByListLink({ ...arrival, placesLeft: 0 })).toBe(false);
    expect(entersByListLink({ ...arrival, loggedIn: false })).toBe(false);
    expect(entersByListLink({ ...arrival, member: true })).toBe(false);
  });
});

describe('who « Qui reprendre ? » adds', () => {
  it('keeps each address once, and none already there', () => {
    const ticked = [
      { id: 'a', email: 'ines@example.com' },
      { id: 'b', email: 'ines@example.com' },
      { id: 'c', email: 'hugo@example.com' },
      { id: 'd', email: null },
      { id: 'e', email: null },
    ];
    expect(
      takenOnce(ticked, ['hugo@example.com']).map((person) => person.id),
    ).toEqual(['a', 'd', 'e']);
  });
});
