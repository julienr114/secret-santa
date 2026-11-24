import { describe, expect, it } from 'vitest';
import {
  canInviteToList,
  entersByListLink,
  memberNotes,
  organisingIds,
  placesTaken,
  takenOnce,
} from './members';

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

describe('the places newcomers take', () => {
  it('counts one each, none for a member already in by that address', () => {
    expect(
      placesTaken(
        [
          { email: 'ines@example.com' },
          { email: null },
          { email: 'hugo@example.com' },
        ],
        ['hugo@example.com'],
      ),
    ).toBe(2);
  });
});

describe('the members who organise', () => {
  it('finds them by their address, whatever its case', () => {
    expect(
      organisingIds(
        [
          { id: 'a', email: 'Camille@example.com' },
          { id: 'b', email: null },
          { id: 'c', email: 'hugo@example.com' },
        ],
        ['camille@example.com', 'paul@example.com'],
      ),
    ).toEqual(['a']);
  });

  it('finds nobody without organisers', () => {
    expect(organisingIds([{ id: 'a', email: 'a@example.com' }], [])).toEqual(
      [],
    );
  });
});

describe('what « Membres » writes under a first name', () => {
  const usual = {
    organises: false,
    takingPart: ['s1'],
    notDrawing: [],
    hasEmail: true,
  };
  const one = [{ id: 's1', name: 'Noël 2026' }];
  const two = [...one, { id: 's2', name: 'Les enfants' }];

  it('says nothing when all is as usual', () => {
    expect(memberNotes(usual, one)).toEqual([]);
    expect(memberNotes({ ...usual, takingPart: [] }, [])).toEqual([]);
  });

  it('says what sets someone apart, in its order', () => {
    expect(
      memberNotes(
        {
          organises: true,
          takingPart: [],
          notDrawing: ['Hugo'],
          hasEmail: false,
        },
        one,
      ),
    ).toEqual([
      { kind: 'organises' },
      { kind: 'outside' },
      { kind: 'notDrawing', names: ['Hugo'] },
      { kind: 'noEmail' },
    ]);
  });

  it('names the Secret Santa when there are several this year', () => {
    expect(memberNotes({ ...usual, takingPart: ['s2', 's1'] }, two)).toEqual([
      { kind: 'santas', names: ['Noël 2026', 'Les enfants'] },
    ]);
    expect(memberNotes({ ...usual, takingPart: [] }, two)).toEqual([
      { kind: 'noSanta' },
    ]);
  });
});
