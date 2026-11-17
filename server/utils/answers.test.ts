import { describe, expect, it } from 'vitest';
import {
  answerCounters,
  answerStatusOf,
  preselectedForAnswers,
  answersAllow,
  answersCard,
  answersState,
  canValidateAnswers,
  pairsFromAnswers,
  sortByAnswer,
  validAnswers,
  type Answer,
} from './answers';

const PEOPLE = ['camille', 'hugo', 'ines', 'louis', 'rose'];
const a = (giverId: string, receiverId: string): Answer => ({
  giverId,
  receiverId,
});
// A cycle: Camille → Hugo → Inès → Louis → Rose → Camille.
const ALL = [
  a('camille', 'hugo'),
  a('hugo', 'ines'),
  a('ines', 'louis'),
  a('louis', 'rose'),
  a('rose', 'camille'),
];

describe('validAnswers', () => {
  it('drops an answer from or about someone taken out, or to oneself', () => {
    expect(
      validAnswers(
        ['camille', 'hugo', 'ines'],
        [
          a('camille', 'hugo'),
          a('hugo', 'louis'),
          a('louis', 'ines'),
          a('ines', 'ines'),
        ],
      ),
    ).toEqual([a('camille', 'hugo')]);
  });

  it('keeps one answer per giver, the first', () => {
    expect(
      validAnswers(PEOPLE, [a('camille', 'hugo'), a('camille', 'ines')]),
    ).toEqual([a('camille', 'hugo')]);
  });
});

describe('answersState', () => {
  it('is ready when everyone answered and nobody clashes', () => {
    expect(answersState(PEOPLE, ALL)).toEqual({
      answered: PEOPLE,
      missing: [],
      conflicts: [],
      deduced: null,
      ready: true,
    });
  });

  it('names those who named the same person, never whom', () => {
    const state = answersState(PEOPLE, [
      a('camille', 'hugo'),
      a('hugo', 'louis'),
      a('ines', 'louis'),
      a('rose', 'camille'),
    ]);
    expect(state.conflicts).toEqual(['hugo', 'ines']);
    expect(state.missing).toEqual(['louis']);
    expect(state.deduced).toBeNull();
    expect(state.ready).toBe(false);
    expect(JSON.stringify(state)).not.toMatch(/receiverId/);
  });

  it('deduces the one missing answer from the others', () => {
    const state = answersState(
      PEOPLE,
      ALL.filter((x) => x.giverId !== 'louis'),
    );
    expect(state.missing).toEqual(['louis']);
    expect(state.deduced).toEqual(a('louis', 'rose'));
    expect(canValidateAnswers(state)).toBe(true);
  });

  it('deduces nothing when the person left is the one missing', () => {
    // Nobody named Louis, and Louis has not answered: he cannot give to
    // himself, one of the others is wrong. Wait for his answer.
    const state = answersState(PEOPLE, [
      a('camille', 'hugo'),
      a('hugo', 'ines'),
      a('ines', 'rose'),
      a('rose', 'camille'),
    ]);
    expect(state.deduced).toBeNull();
    expect(canValidateAnswers(state)).toBe(false);
  });

  it('deduces nothing with two answers missing', () => {
    expect(answersState(PEOPLE, ALL.slice(0, 3)).deduced).toBeNull();
  });

  it('needs as many people as a draw', () => {
    const two = answersState(
      ['camille', 'hugo'],
      [a('camille', 'hugo'), a('hugo', 'camille')],
    );
    expect(two.ready).toBe(false);
  });

  it('a newcomer has not answered yet', () => {
    const state = answersState([...PEOPLE, 'zoe'], ALL);
    expect(state.missing).toEqual(['zoe']);
    expect(state.ready).toBe(false);
    // Everyone is named already: Zoé would give to herself.
    expect(state.deduced).toBeNull();
  });
});

describe('pairsFromAnswers', () => {
  it('turns answers that fit into the pairs of a draw', () => {
    expect(pairsFromAnswers(PEOPLE, ALL)).toEqual({ ok: true, value: ALL });
  });

  it('adds the deduced answer', () => {
    const result = pairsFromAnswers(
      PEOPLE,
      ALL.filter((x) => x.giverId !== 'louis'),
    );
    expect(result.ok && result.value).toContainEqual(a('louis', 'rose'));
    expect(result.ok && result.value).toHaveLength(5);
  });

  it('refuses answers that clash or are missing', () => {
    expect(pairsFromAnswers(PEOPLE, ALL.slice(0, 3))).toMatchObject({
      ok: false,
      reason: 'answers_not_ready',
      details: { missing: 2, conflicts: 0 },
    });
  });
});

describe('answerStatusOf and sortByAnswer', () => {
  it('says where each one stands', () => {
    const of = (over: Partial<Parameters<typeof answerStatusOf>[0]>) =>
      answerStatusOf({
        answered: false,
        inConflict: false,
        messageSentAt: null,
        ...over,
      });
    expect(of({})).toBe('toNotify');
    expect(of({ messageSentAt: '2026-11-14' })).toBe('asked');
    expect(of({ answered: true })).toBe('answered');
    expect(of({ answered: true, inConflict: true })).toBe('toCheck');
  });

  it('lists answers to check, to ask, asked, answered, then by name', () => {
    const people = [
      { name: 'Rose', answerStatus: 'answered' as const },
      { name: 'Louis', answerStatus: 'asked' as const },
      { name: 'Inès', answerStatus: 'toCheck' as const },
      { name: 'Camille', answerStatus: 'answered' as const },
      { name: 'Hugo', answerStatus: 'toCheck' as const },
      { name: 'Zoé', answerStatus: 'toNotify' as const },
    ];
    expect(sortByAnswer(people, (p) => p.name).map((p) => p.name)).toEqual([
      'Hugo',
      'Inès',
      'Zoé',
      'Louis',
      'Camille',
      'Rose',
    ]);
  });
});

describe('answersCard', () => {
  it('follows the answers', () => {
    expect(answersCard(answersState(PEOPLE, []))).toBe('collect');
    expect(answersCard(answersState(PEOPLE, ALL))).toBe('ready');
    expect(answersCard(answersState(PEOPLE, ALL.slice(0, 4)))).toBe(
      'oneMissing',
    );
    expect(
      answersCard(
        answersState(PEOPLE, [a('camille', 'hugo'), a('ines', 'hugo')]),
      ),
    ).toBe('conflict');
  });
});

describe('answersAllow', () => {
  const edition = (status: string, drawMode: 'app' | 'elsewhere') => ({
    status,
    drawMode,
  });
  it('starts, and draws with the app, only an edition drawn by the app', () => {
    expect(answersAllow(edition('preparing', 'app'), 'start').ok).toBe(true);
    expect(answersAllow(edition('preparing', 'app'), 'draw').ok).toBe(true);
    expect(
      answersAllow(edition('preparing', 'elsewhere'), 'draw'),
    ).toMatchObject({ ok: false, reason: 'collecting_answers' });
  });

  it('takes answers, abandons or validates only while collecting', () => {
    ['answer', 'abandon', 'validate'].forEach((action) => {
      expect(
        answersAllow(edition('preparing', 'elsewhere'), action as 'answer').ok,
      ).toBe(true);
      expect(
        answersAllow(edition('preparing', 'app'), action as 'answer'),
      ).toMatchObject({ ok: false, reason: 'not_collecting_answers' });
    });
  });

  it('does nothing once drawn', () => {
    expect(answersAllow(edition('drawn', 'elsewhere'), 'answer')).toMatchObject(
      { ok: false, reason: 'invalid_transition' },
    );
  });
});

describe('answerCounters and preselectedForAnswers', () => {
  const people = (['toCheck', 'toNotify', 'asked', 'answered'] as const).map(
    (answerStatus) => ({ answerStatus, email: 'x@example.com' }),
  );
  it('counts an answer to check as given', () => {
    expect(answerCounters(people)).toEqual({
      toNotify: 1,
      asked: 1,
      answered: 2,
    });
  });

  it('ticks first those each message is for, with an address', () => {
    const ticked = (type: string) =>
      people
        .filter((p) => preselectedForAnswers(type, p))
        .map((p) => p.answerStatus);
    expect(ticked('answerRequest')).toEqual(['toNotify']);
    expect(ticked('answerReminder')).toEqual(['asked']);
    expect(ticked('answerCheck')).toEqual(['toCheck']);
    expect(
      preselectedForAnswers('answerRequest', {
        email: null,
        answerStatus: 'toNotify',
      }),
    ).toBe(false);
  });
});
