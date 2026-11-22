import { describe, expect, it } from 'vitest';
import {
  resumeChoices,
  type ResumeEvent,
  type ResumeList,
} from './resumeChoices';

const christmas: ResumeEvent = {
  id: 'noel',
  category: 'christmas',
  forMemberId: null,
};
const otherChristmas: ResumeEvent = {
  id: 'noel-amis',
  category: 'christmas',
  forMemberId: null,
};
const leoBirthday: ResumeEvent = {
  id: 'leo-7',
  category: 'birthday',
  forMemberId: 'leo',
};
const zoeBirthday: ResumeEvent = {
  id: 'zoe-4',
  category: 'birthday',
  forMemberId: 'zoe',
};
const wedding: ResumeEvent = {
  id: 'mariage',
  category: 'wedding',
  forMemberId: null,
};

const list = (
  id: string,
  year: number,
  events: ResumeList['events'],
  memberIds: string[] = [],
): ResumeList => ({
  id,
  year,
  createdAt: `${year}-11-01T10:00:00Z`,
  events,
  memberIds,
});

describe('resumeChoices', () => {
  it('never offers, for Christmas with Camille, the birthday of Léo', () => {
    const target = list('new', 2026, [christmas], ['camille']);
    expect(
      resumeChoices(target, [list('leo', 2026, [leoBirthday], ['leo'])]),
    ).toEqual([]);
  });

  it('offers the same event another year first, the latest first', () => {
    const target = list('new', 2026, [christmas]);
    expect(
      resumeChoices(target, [
        list('amis-2025', 2025, [otherChristmas]),
        list('noel-2024', 2024, [christmas]),
        list('noel-2025', 2025, [christmas]),
      ]),
    ).toEqual(['noel-2025', 'noel-2024', 'amis-2025']);
  });

  it('then an event of the same kind; a birthday, of the same person', () => {
    const target = list('new', 2026, [leoBirthday]);
    expect(
      resumeChoices(target, [
        list('zoe', 2025, [zoeBirthday]),
        list('leo-other', 2025, [{ ...leoBirthday, id: 'leo-6' }]),
      ]),
    ).toEqual(['leo-other']);
  });

  it('a birthday for nobody known is like no other birthday', () => {
    const nobody: ResumeEvent = {
      id: 'anniv',
      category: 'birthday',
      forMemberId: null,
    };
    const target = list('new', 2026, [nobody]);
    expect(
      resumeChoices(target, [list('other', 2025, [{ ...nobody, id: 'x' }])]),
    ).toEqual([]);
  });

  it('two events « Autre » are not alike', () => {
    const party: ResumeEvent = {
      id: 'fete',
      category: 'other',
      forMemberId: null,
    };
    const target = list('new', 2026, [party]);
    expect(
      resumeChoices(target, [list('other', 2025, [{ ...party, id: 'y' }])]),
    ).toEqual([]);
  });

  it('then a list where one of its people figures', () => {
    const target = list('new', 2026, [wedding], ['camille', 'hugo']);
    expect(
      resumeChoices(target, [
        list('leo', 2025, [leoBirthday], ['leo']),
        list('camille', 2025, [christmas], ['camille']),
        list('noel', 2024, [christmas], ['hugo', 'zoe']),
      ]),
    ).toEqual(['camille', 'noel']);
  });

  it('offers three at most, and never the new list itself', () => {
    const target = list('new', 2026, [christmas]);
    const old = [2025, 2024, 2023, 2022].map((year) =>
      list(`noel-${year}`, year, [christmas]),
    );
    expect(resumeChoices(target, [target, ...old])).toEqual([
      'noel-2025',
      'noel-2024',
      'noel-2023',
    ]);
  });

  it('offers nothing to a list with nothing in common', () => {
    expect(
      resumeChoices(list('new', 2026, []), [list('a', 2025, [christmas])]),
    ).toEqual([]);
  });
});
