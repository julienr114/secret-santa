import { describe, expect, it } from 'vitest';
import {
  gameLine,
  listLine,
  listTitle,
  namesPart,
  organiserLine,
  participantLine,
  peopleNames,
  type GameFacts,
  type ListFacts,
  type LineText,
  type ParticipantFacts,
} from './lines';

/** The keys of a text, and its dot: what each case is about. */
const keys = (line: LineText | null) =>
  line ? { keys: line.parts.map((p) => p.key), dot: line.dot } : null;

describe('participantLine', () => {
  const drawn: ParticipantFacts = {
    drawn: true,
    opened: true,
    revealed: false,
    revealSeen: false,
    asked: false,
    receiverNews: false,
  };
  it.each<[string, Partial<ParticipantFacts>, string, boolean]>([
    ['not drawn yet', { drawn: false }, 'lines.santa.notDrawn', false],
    ['my envelope waits', { opened: false }, 'lines.santa.envelope', true],
    [
      'revealed, not looked at',
      { revealed: true },
      'lines.santa.revealedNew',
      true,
    ],
    ['someone asks me for ideas', { asked: true }, 'lines.santa.asked', true],
    [
      'new ideas for the one I drew',
      { receiverNews: true },
      'lines.santa.receiverNews',
      true,
    ],
    [
      'revealed, looked at',
      { revealed: true, revealSeen: true },
      'lines.santa.revealed',
      false,
    ],
    ['otherwise', {}, 'lines.santa.knows', false],
  ])('%s', (_, facts, key, dot) => {
    expect(keys(participantLine({ ...drawn, ...facts }))).toEqual({
      keys: [key],
      dot,
    });
  });

  it('takes the first case that applies', () => {
    expect(
      participantLine({ ...drawn, opened: false, asked: true }).parts[0]?.key,
    ).toBe('lines.santa.envelope');
    expect(
      participantLine({ ...drawn, asked: true, receiverNews: true }).parts[0]
        ?.key,
    ).toBe('lines.santa.asked');
  });
});

describe('organiserLine', () => {
  it('counts the participants of a Secret Santa to prepare', () => {
    expect(
      organiserLine({
        status: 'preparing',
        revealed: false,
        participants: 5,
        viewed: 0,
      }).parts,
    ).toEqual([
      { key: 'lines.organiser.prepare' },
      { key: 'lines.organiser.participants', params: { count: 5 } },
    ]);
  });

  it('says how many discovered, then everyone', () => {
    const drawn = {
      status: 'drawn' as const,
      revealed: false,
      participants: 8,
    };
    expect(organiserLine({ ...drawn, viewed: 6 }).parts[1]).toEqual({
      key: 'lines.organiser.someViewed',
      params: { viewed: 6, count: 8 },
    });
    expect(organiserLine({ ...drawn, viewed: 8 }).parts[1]?.key).toBe(
      'lines.organiser.allViewed',
    );
  });

  it('says revealed, then over', () => {
    expect(
      keys(
        organiserLine({
          status: 'drawn',
          revealed: true,
          participants: 8,
          viewed: 3,
        }),
      ),
    ).toEqual({ keys: ['lines.organiser.revealed'], dot: false });
    expect(
      keys(
        organiserLine({
          status: 'closed',
          revealed: true,
          participants: 8,
          viewed: 8,
        }),
      ),
    ).toEqual({ keys: ['lines.organiser.over'], dot: false });
  });
});

describe('gameLine', () => {
  const open: GameFacts = {
    shown: true,
    open: true,
    played: false,
    resultsOut: false,
    resultsSeen: false,
    endsAt: '2026-12-25T17:00:00.000Z',
  };
  it('is not shown without the game, the draw, or me in it', () => {
    expect(gameLine({ ...open, shown: false })).toBeNull();
  });

  it.each<[string, Partial<GameFacts>, string[], boolean]>([
    ['open, not played', {}, ['lines.game.play', 'lines.game.until'], true],
    [
      'open, played',
      { played: true },
      ['lines.game.played', 'lines.game.answerDay'],
      false,
    ],
    ['closed, no palmarès yet', { open: false }, ['lines.game.waiting'], false],
    [
      'the palmarès, not seen',
      { open: false, resultsOut: true },
      ['lines.game.palmaresNew'],
      true,
    ],
    [
      'the palmarès, seen',
      { open: false, resultsOut: true, resultsSeen: true },
      ['lines.game.palmares'],
      false,
    ],
  ])('%s', (_, facts, expected, dot) => {
    expect(keys(gameLine({ ...open, ...facts }))).toEqual({
      keys: expected,
      dot,
    });
  });

  it('gives the end of the game to write', () => {
    expect(gameLine(open)?.parts[1]?.end).toBe('2026-12-25T17:00:00.000Z');
  });
});

describe('namesPart', () => {
  it('says one, two, three names, then counts', () => {
    expect(namesPart('p', ['Mamie'])).toEqual({
      key: 'p.one',
      params: { a: 'Mamie' },
    });
    expect(namesPart('p', ['Léo', 'Zoé'])).toEqual({
      key: 'p.two',
      params: { a: 'Léo', b: 'Zoé' },
    });
    expect(namesPart('p', ['Léo', 'Zoé', 'Hugo'])).toEqual({
      key: 'p.three',
      params: { a: 'Léo', b: 'Zoé', c: 'Hugo' },
    });
    expect(namesPart('p', ['Léo', 'Zoé', 'Hugo', 'Inès'])).toEqual({
      key: 'p.more',
      params: { a: 'Léo', b: 'Zoé', count: 2 },
    });
  });
});

describe('peopleNames', () => {
  const leo = { name: 'Léo', me: false };
  const zoe = { name: 'Zoé', me: false };
  const me = { name: 'Hugo', me: true };

  it('puts « moi » last', () => {
    expect(peopleNames('p', [me, leo, zoe])).toEqual({
      key: 'p.threeMe',
      params: { a: 'Léo', b: 'Zoé' },
    });
    expect(peopleNames('p', [leo, me])).toEqual({
      key: 'p.twoMe',
      params: { a: 'Léo' },
    });
    expect(peopleNames('p', [me])).toEqual({ key: 'p.me' });
  });

  it('says the names alone without me, and nothing for nobody', () => {
    expect(peopleNames('p', [leo, zoe])).toEqual({
      key: 'p.two',
      params: { a: 'Léo', b: 'Zoé' },
    });
    expect(peopleNames('p', [])).toBeNull();
  });

  it('counts me among the others past two names', () => {
    expect(
      peopleNames('p', [leo, zoe, { name: 'Inès', me: false }, me]),
    ).toEqual({ key: 'p.more', params: { a: 'Léo', b: 'Zoé', count: 2 } });
  });
});

const list: ListFacts = {
  holder: true,
  people: [
    { name: 'Léo', me: false },
    { name: 'Zoé', me: false },
    { name: 'Hugo', me: true },
  ],
  holders: ['Hugo'],
  draft: false,
  ideas: 9,
  ticked: 0,
  giverOnly: false,
  elsewhere: [],
  offered: 0,
  newIdeas: 0,
};

describe('listTitle', () => {
  it('is « Ma liste de cadeaux » when I hold it', () => {
    expect(listTitle(list)).toEqual({ key: 'lines.list.mine' });
  });

  it('names those it is made for', () => {
    expect(
      listTitle({
        ...list,
        holder: false,
        people: [{ name: 'Mamie', me: false }],
      }),
    ).toEqual({ key: 'lines.list.of.one', params: { a: 'Mamie' } });
    expect(listTitle({ ...list, holder: false }).key).toBe(
      'lines.list.of.three',
    );
  });

  it('names those who hold a list made for nobody', () => {
    expect(
      listTitle({
        ...list,
        holder: false,
        people: [],
        holders: ['Karim', 'Sofia'],
      }),
    ).toEqual({
      key: 'lines.list.of.two',
      params: { a: 'Karim', b: 'Sofia' },
    });
  });
});

describe('listLine, a list I hold', () => {
  it('says a draft, and nothing else', () => {
    expect(keys(listLine({ ...list, draft: true, ticked: 2 }))).toEqual({
      keys: ['lines.list.draft'],
      dot: false,
    });
  });

  it('says an empty list, and nothing else', () => {
    expect(keys(listLine({ ...list, ideas: 0, ticked: 2 }))).toEqual({
      keys: ['lines.list.empty'],
      dot: false,
    });
  });

  it('says whom it is for, me last', () => {
    expect(listLine(list).parts).toEqual([
      { key: 'lines.list.for.threeMe', params: { a: 'Léo', b: 'Zoé' } },
    ]);
    expect(
      listLine({
        ...list,
        people: [
          { name: 'Léo', me: false },
          { name: 'Hugo', me: true },
        ],
      }).parts[0],
    ).toEqual({ key: 'lines.list.for.twoMe', params: { a: 'Léo' } });
    expect(
      listLine({
        ...list,
        people: [
          { name: 'Léo', me: false },
          { name: 'Zoé', me: false },
          { name: 'Inès', me: false },
          { name: 'Hugo', me: true },
        ],
      }).parts[0],
    ).toEqual({
      key: 'lines.list.for.more',
      params: { a: 'Léo', b: 'Zoé', count: 2 },
    });
    expect(
      listLine({
        ...list,
        people: [
          { name: 'Léo', me: false },
          { name: 'Zoé', me: false },
        ],
      }).parts[0],
    ).toEqual({ key: 'lines.list.for.two', params: { a: 'Léo', b: 'Zoé' } });
  });

  it('counts the ideas of a list for me alone, or for nobody', () => {
    const mine = { ...list, people: [{ name: 'Hugo', me: true }] };
    expect(listLine(mine).parts).toEqual([
      { key: 'lines.list.ideas', params: { count: 9 } },
    ]);
    expect(listLine({ ...list, people: [] }).parts[0]?.key).toBe(
      'lines.list.ideas',
    );
  });

  it('says the ticks since my visit first, with the dot', () => {
    expect(
      keys(listLine({ ...list, ticked: 2, giverOnly: true, elsewhere: ['A'] })),
    ).toEqual({
      keys: ['lines.list.for.threeMe', 'lines.list.ticked'],
      dot: true,
    });
  });

  it('then that only the one who drew me sees it', () => {
    expect(
      keys(listLine({ ...list, giverOnly: true, elsewhere: ['A'] })),
    ).toEqual({
      keys: ['lines.list.for.threeMe', 'lines.list.giverOnly'],
      dot: false,
    });
  });

  it('then the other events, with no preposition before a name', () => {
    expect(listLine({ ...list, elsewhere: ['Chez Mamie'] }).parts[1]).toEqual({
      key: 'lines.list.alsoOne',
      params: { name: 'Chez Mamie' },
    });
    expect(listLine({ ...list, elsewhere: ['A', 'B'] }).parts[1]).toEqual({
      key: 'lines.list.alsoMany',
      params: { count: 2 },
    });
  });
});

describe('listLine, someone else’s list', () => {
  const theirs = { ...list, holder: false };
  it.each<[string, Partial<ListFacts>, string[], boolean]>([
    ['empty', { ideas: 0, newIdeas: 0 }, ['lines.list.empty'], false],
    [
      'I offer, and something new',
      { offered: 2, newIdeas: 1 },
      ['lines.list.offer', 'lines.list.newIdeas'],
      true,
    ],
    ['something new', { newIdeas: 3 }, ['lines.list.newIdeas'], true],
    ['I offer', { offered: 2 }, ['lines.list.offer'], false],
    ['otherwise', {}, ['lines.list.ideas'], false],
  ])('%s', (_, facts, expected, dot) => {
    expect(keys(listLine({ ...theirs, ...facts }))).toEqual({
      keys: expected,
      dot,
    });
  });

  it('counts a list never opened as all new', () => {
    expect(listLine({ ...theirs, ideas: 4, newIdeas: 4 }).parts).toEqual([
      { key: 'lines.list.newIdeas', params: { count: 4 } },
    ]);
  });
});
