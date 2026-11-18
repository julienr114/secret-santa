import type { Assignment } from './draw';
import type { Guess, GuessMode } from './guesses';

// The awards of « Devine qui » (README 22.17, « Les prix, un par un »,
// Correction 14): each with its calculation and the condition to show it.
// Pure; the guesses given are those that count (`countedGuesses`).

/** The awards, in the order of the images. */
export const AWARD_ORDER = [
  'unmasked',
  'detective',
  'flawless',
  'transparent',
  'hidden',
  'rumour',
  'suspect',
  'twins',
  'triplets',
  'lastMinute',
  'weathervane',
  'group',
] as const;
export type AwardKind = (typeof AWARD_ORDER)[number];

/** One award shown in the images. */
export type Award = {
  kind: AwardKind;
  /** The winners by person, while few enough to be named; else empty. */
  winners: string[];
  /** How many share it. */
  count: number;
  /** Between 0 and 1: the weakest go first past eight screens. */
  strength: number;
  /** What its sentence says (see each award). */
  value: number;
  total?: number;
  extra?: number;
  /** « La rumeur »: the line, the person who received. */
  recipientId?: string;
  /** « Le score du groupe »: better than chance, about the same, worse. */
  tone?: 'better' | 'same' | 'worse';
};

/** At most this many award screens; « Démasqués » and the group's score stay. */
export const MAX_AWARD_SCREENS = 8;
/** « Démasqués » names up to nine people; the others up to three. */
const NAMED = { unmasked: 9 } as Partial<Record<AwardKind, number>>;
const NAMED_DEFAULT = 3;
const EPSILON = 1e-9;
const HOUR_MS = 60 * 60 * 1000;
const MINUTE_MS = 60 * 1000;

/**
 * The smoothed score of a count `k` out of `n`: one try never gives the
 * best score.
 * @param k - The count.
 * @param n - Out of how many.
 * @returns (k + 1) / (n + 2).
 */
export const smoothed = (k: number, n: number): number => (k + 1) / (n + 2);

/**
 * The threshold of the group (README 22.17): one player in four, rounded
 * up, at least 2 and at most 5. The condition of four awards.
 * @param players - How many made a guess that counts.
 * @returns The threshold.
 */
export const groupThreshold = (players: number): number =>
  Math.min(5, Math.max(2, Math.ceil(players / 4)));

/** An award for those who share it, named while few enough. */
const award = (
  kind: AwardKind,
  winners: string[],
  fields: Omit<Award, 'kind' | 'winners' | 'count'>,
): Award => ({
  kind,
  winners:
    winners.length <= (NAMED[kind] ?? NAMED_DEFAULT) ? winners.toSorted() : [],
  count: winners.length,
  ...fields,
});

/** Those ahead by the comparisons given, in turn; all of them when tied. */
const best = <T>(items: T[], ...compare: ((a: T, b: T) => number)[]): T[] => {
  const order = (a: T, b: T) => compare.reduce((done, c) => done || c(a, b), 0);
  const top = items.toSorted(order)[0];
  return top === undefined
    ? []
    : items.filter((item) => Math.abs(order(item, top)) < EPSILON);
};
/** Higher first, with floating numbers. */
const desc =
  <T>(f: (x: T) => number) =>
  (a: T, b: T) => {
    const d = f(b) - f(a);
    return Math.abs(d) < EPSILON ? 0 : d;
  };
const asc =
  <T>(f: (x: T) => number) =>
  (a: T, b: T) =>
    -desc(f)(a, b);

/** What the awards are computed from. */
export type AwardInput = {
  /** The guesses that count, with their time and earlier answers. */
  counted: Guess[];
  pairs: Assignment[];
  mode: GuessMode;
  /** When the guesses ended (the end time, or the reveal if earlier). */
  endedAt: string | null;
};

/** The facts every award shares. */
const factsOf = ({ counted, pairs }: AwardInput) => {
  const receiverOf = new Map(pairs.map((p) => [p.giverId, p.receiverId]));
  const giverOf = new Map(pairs.map((p) => [p.receiverId, p.giverId]));
  const right = (g: Guess) => receiverOf.get(g.giverId) === g.recipientId;
  const players = [...new Set(counted.map((g) => g.guesserId))];
  // About the Santas: not naming oneself, not the line one gives to (the
  // giver knows the answer there).
  const aboutSantas = counted.filter(
    (g) =>
      g.giverId !== g.guesserId && giverOf.get(g.recipientId) !== g.guesserId,
  );
  return { receiverOf, giverOf, right, players, aboutSantas };
};
type Facts = ReturnType<typeof factsOf>;

/**
 * « Démasqués »: those who guessed their own Santa, out of those who
 * guessed it. At least one.
 */
const unmaskedAward = (input: AwardInput, f: Facts): Award[] => {
  const own = input.counted.filter((g) => g.recipientId === g.guesserId);
  const winners = own.filter(f.right).map((g) => g.guesserId);
  return winners.length === 0
    ? []
    : [
        award('unmasked', winners, {
          strength: winners.length / own.length,
          value: winners.length,
          total: own.length,
        }),
      ];
};

/** A player's score for the detective, right guesses, made, found alone. */
export type DetectiveScore = {
  playerId: string;
  score: number;
  right: number;
  made: number;
  /** Right where no other player was right. */
  alone: number;
};

/**
 * The detective's score of each player: each right guess is worth 1, plus
 * the share of the other players of that line who were wrong (0.5 alone
 * on the line); a wrong guess costs nothing.
 * @param counted - The guesses that count.
 * @param pairs - The draw.
 * @returns One score per player.
 */
export const detectiveScores = (
  counted: Guess[],
  pairs: Assignment[],
): DetectiveScore[] => {
  const receiverOf = new Map(pairs.map((p) => [p.giverId, p.receiverId]));
  const right = (g: Guess) => receiverOf.get(g.giverId) === g.recipientId;
  const players = [...new Set(counted.map((g) => g.guesserId))];
  return players.map((playerId) => {
    const own = counted.filter((g) => g.guesserId === playerId);
    const found = own.filter(right).map((g) => {
      const others = counted.filter(
        (o) => o.recipientId === g.recipientId && o.guesserId !== playerId,
      );
      const wrong = others.filter((o) => !right(o)).length;
      return {
        points: 1 + (others.length === 0 ? 0.5 : wrong / others.length),
        alone: others.length > 0 && wrong === others.length,
      };
    });
    return {
      playerId,
      score: found.reduce((sum, x) => sum + x.points, 0),
      right: found.length,
      made: own.length,
      alone: found.filter((x) => x.alone).length,
    };
  });
};

/**
 * « Le détective » (« Toutes les paires », at least 2 right): the best
 * score, then precision, then the fewest made. « Le sans-faute »: every
 * guess right, at least 3; it takes the detective's screen when it is the
 * same person.
 */
const detectiveAwards = (input: AwardInput): Award[] => {
  const scores = detectiveScores(input.counted, input.pairs);
  const detectives =
    input.mode === 'all'
      ? best(
          scores.filter((s) => s.right >= 2),
          desc((s) => s.score),
          desc((s) => s.right / s.made),
          asc((s) => s.made),
        )
      : [];
  const flawless = best(
    scores.filter((s) => s.made >= 3 && s.right === s.made),
    desc((s) => s.made),
  );
  const top = detectives[0];
  const flawlessIds = new Set(flawless.map((s) => s.playerId));
  const replaced = detectives.some((s) => flawlessIds.has(s.playerId));
  return [
    ...(top && !replaced
      ? [
          award(
            'detective',
            detectives.map((s) => s.playerId),
            {
              strength: smoothed(top.right, top.made),
              value: top.right,
              total: top.made,
              extra: top.alone,
            },
          ),
        ]
      : []),
    ...(flawless[0]
      ? [
          award(
            'flawless',
            flawless.map((s) => s.playerId),
            {
              strength: smoothed(flawless[0].made, flawless[0].made),
              value: flawless[0].made,
            },
          ),
        ]
      : []),
  ];
};

/** The tries on each Santa: guesses about the line of whom they give to. */
export type SantaScore = {
  giverId: string;
  tries: number;
  found: number;
  /** (fooled + 1) / (tries + 2): high is well hidden. */
  note: number;
};

/**
 * How well each Santa hid (README 22.17): the smoothed share of the tries
 * on their line that were wrong. Naming oneself is left out.
 * @param input - The guesses and the draw.
 * @returns One line per Santa.
 */
export const santaScores = (input: AwardInput): SantaScore[] => {
  const f = factsOf(input);
  return input.pairs.map(({ giverId, receiverId }) => {
    const tries = f.aboutSantas.filter((g) => g.recipientId === receiverId);
    const found = tries.filter(f.right).length;
    return {
      giverId,
      tries: tries.length,
      found,
      note: smoothed(tries.length - found, tries.length),
    };
  });
};

/**
 * « Le mieux caché » (tried at least the threshold times): the highest
 * note, then the most fooled. « Le plus transparent » (found at least the
 * threshold times): the lowest note, then the most found; never one of
 * the best hidden.
 */
const santaAwards = (input: AwardInput, threshold: number): Award[] => {
  const scores = santaScores(input);
  const hidden = best(
    scores.filter((s) => s.tries >= threshold),
    desc((s) => s.note),
    desc((s) => s.tries - s.found),
  );
  const hiddenIds = new Set(hidden.map((s) => s.giverId));
  const transparent = best(
    scores.filter((s) => s.found >= threshold && !hiddenIds.has(s.giverId)),
    asc((s) => s.note),
    desc((s) => s.found),
  );
  const t = transparent[0];
  const h = hidden[0];
  return [
    ...(t
      ? [
          award(
            'transparent',
            transparent.map((s) => s.giverId),
            { strength: 1 - t.note, value: t.found, total: t.tries },
          ),
        ]
      : []),
    ...(h
      ? [
          award(
            'hidden',
            hidden.map((s) => s.giverId),
            { strength: h.note, value: h.found, total: h.tries },
          ),
        ]
      : []),
  ];
};

/**
 * « La rumeur »: the wrong pair « X offrait à Y » most believed, by the
 * smoothed share of the tries on that line; believed by at least the
 * threshold. One only: the most believers, then the line of the best
 * hidden Santa, then the oldest.
 */
const rumourAward = (
  input: AwardInput,
  f: Facts,
  threshold: number,
): Award[] => {
  const hiddenNote = new Map(
    santaScores(input).map((s) => [s.giverId, s.note]),
  );
  const wrong = f.aboutSantas.filter((g) => !f.right(g));
  const keys = [...new Set(wrong.map((g) => `${g.recipientId} ${g.giverId}`))];
  const rumours = keys.map((key) => {
    const [recipientId, giverId] = key.split(' ') as [string, string];
    const believers = wrong.filter(
      (g) => g.recipientId === recipientId && g.giverId === giverId,
    );
    const tries = f.aboutSantas.filter(
      (g) => g.recipientId === recipientId,
    ).length;
    return {
      recipientId,
      giverId,
      believers: believers.length,
      note: smoothed(believers.length, tries),
      hidden: hiddenNote.get(f.giverOf.get(recipientId) ?? '') ?? 0,
      oldest: believers.map((g) => g.at ?? '').toSorted()[0] ?? '',
    };
  });
  const [top] = rumours
    .filter((r) => r.believers >= threshold)
    .toSorted(
      (a, b) =>
        desc<typeof a>((r) => r.note)(a, b) ||
        b.believers - a.believers ||
        desc<typeof a>((r) => r.hidden)(a, b) ||
        a.oldest.localeCompare(b.oldest) ||
        `${a.recipientId}${a.giverId}`.localeCompare(
          `${b.recipientId}${b.giverId}`,
        ),
    );
  return top
    ? [
        award('rumour', [top.giverId], {
          strength: top.note,
          value: top.believers,
          recipientId: top.recipientId,
        }),
      ]
    : [];
};

/**
 * « Le suspect idéal »: named wrongly the most often, at least the
 * threshold; then the one never named rightly.
 */
const suspectAward = (
  input: AwardInput,
  f: Facts,
  threshold: number,
): Award[] => {
  const people = [...new Set(f.aboutSantas.map((g) => g.giverId))];
  const named = people.map((id) => {
    const about = f.aboutSantas.filter((g) => g.giverId === id);
    const wrong = about.filter((g) => !f.right(g)).length;
    return { id, wrong, rightly: about.length - wrong };
  });
  const suspects = best(
    named.filter((n) => n.wrong >= threshold),
    desc((n) => n.wrong),
    asc((n) => Math.min(n.rightly, 1)),
  );
  const top = suspects[0];
  return top
    ? [
        award(
          'suspect',
          suspects.map((n) => n.id),
          {
            strength: Math.min(1, top.wrong / Math.max(1, f.players.length)),
            value: top.wrong,
            extra: top.rightly === 0 ? 1 : 0,
          },
        ),
      ]
    : [];
};

/** How close two players' guesses are (README 22.17, « Les jumeaux »). */
export type TwinScore = {
  ids: [string, string];
  common: number;
  same: number;
  sameWrong: number;
  note: number;
  /** When their last same guess was made: the earliest settled first. */
  settledAt: string;
};

/**
 * The closeness of every two players: 2 points per wrong guess in common,
 * 1 per right one, smoothed over twice the lines both guessed.
 * @param input - The guesses and the draw.
 * @returns One line per two players who guessed a line in common.
 */
export const twinScores = (input: AwardInput): TwinScore[] => {
  const f = factsOf(input);
  const ids = f.players.toSorted();
  return ids.flatMap((a, i) =>
    ids.slice(i + 1).flatMap((b): TwinScore[] => {
      const ofA = input.counted.filter((g) => g.guesserId === a);
      const ofB = input.counted.filter((g) => g.guesserId === b);
      const common = ofA.flatMap((ga) => {
        const gb = ofB.find((g) => g.recipientId === ga.recipientId);
        return gb ? [[ga, gb] as const] : [];
      });
      if (common.length === 0) return [];
      const same = common.filter(([ga, gb]) => ga.giverId === gb.giverId);
      const sameWrong = same.filter(([ga]) => !f.right(ga)).length;
      const points = 2 * sameWrong + (same.length - sameWrong);
      return [
        {
          ids: [a, b],
          common: common.length,
          same: same.length,
          sameWrong,
          note: smoothed(points, 2 * common.length),
          settledAt:
            same
              .flatMap(([ga, gb]) => [ga.at ?? '', gb.at ?? ''])
              .toSorted()
              .at(-1) ?? '',
        },
      ];
    }),
  );
};

/** Twins: at least this many same guesses. */
const TWIN_MIN = 3;

/**
 * « Les jumeaux »: the two closest players, at least 3 same guesses. One
 * pair only: the best note, then a pair without another award on screen,
 * then the one settled first. « Les triplés » in their place when exactly
 * one third player is a twin of both.
 */
const twinAwards = (input: AwardInput, awarded: Set<string>): Award[] => {
  const scores = twinScores(input).filter((s) => s.same >= TWIN_MIN);
  const [top] = scores.toSorted(
    (a, b) =>
      desc<TwinScore>((s) => s.note)(a, b) ||
      Number(a.ids.some((id) => awarded.has(id))) -
        Number(b.ids.some((id) => awarded.has(id))) ||
      a.settledAt.localeCompare(b.settledAt) ||
      a.ids.join().localeCompare(b.ids.join()),
  );
  if (!top) return [];
  const twins = (x: string, y: string) =>
    scores.some((s) => s.ids.includes(x) && s.ids.includes(y));
  const thirds = [...new Set(scores.flatMap((s) => s.ids))].filter(
    (id) =>
      !top.ids.includes(id) && twins(id, top.ids[0]) && twins(id, top.ids[1]),
  );
  return thirds.length === 1
    ? [
        award('triplets', [...top.ids, thirds[0]!], {
          strength: top.note,
          value: top.same,
          total: top.common,
        }),
      ]
    : [
        award('twins', [...top.ids], {
          strength: top.note,
          value: top.same,
          total: top.common,
          extra: top.sameWrong,
        }),
      ];
};

/**
 * « Sur le fil »: the last guess made before the end, in its last hour;
 * `value` is how many minutes before.
 */
const lastMinuteAward = (input: AwardInput): Award[] => {
  if (!input.endedAt) return [];
  const end = Date.parse(input.endedAt);
  const [last] = input.counted
    .filter((g) => g.at && Date.parse(g.at) <= end)
    .toSorted((a, b) => (b.at ?? '').localeCompare(a.at ?? ''));
  if (!last?.at) return [];
  const before = end - Date.parse(last.at);
  return before > HOUR_MS
    ? []
    : [
        award('lastMinute', [last.guesserId], {
          strength: 1 - before / HOUR_MS,
          value: Math.floor(before / MINUTE_MS),
        }),
      ];
};

/**
 * « La girouette »: the most changes of mind, all lines together, at
 * least 3; then the fewest guesses made.
 */
const weathervaneAward = (input: AwardInput, f: Facts): Award[] => {
  const changes = f.players.map((id) => {
    const own = input.counted.filter((g) => g.guesserId === id);
    return {
      id,
      made: own.length,
      changes: own.reduce((sum, g) => sum + (g.previous?.length ?? 0), 0),
    };
  });
  const vanes = best(
    changes.filter((c) => c.changes >= 3),
    desc((c) => c.changes),
    asc((c) => c.made),
  );
  const top = vanes[0];
  return top
    ? [
        award(
          'weathervane',
          vanes.map((c) => c.id),
          {
            strength: smoothed(top.changes, top.changes + top.made),
            value: top.changes,
          },
        ),
      ]
    : [];
};

/** Clearly better than chance: half as much again, and 2 more at least. */
const BETTER = 1.5;
/** Worse than chance: two thirds of it, or less. */
const WORSE = 2 / 3;

/**
 * « Le score du groupe »: right guesses out of those that count, against
 * chance (guesses / (participants − 2), rounded); at least 6 guesses.
 */
const groupAward = (input: AwardInput, f: Facts): Award[] => {
  const total = input.counted.length;
  if (total < 6) return [];
  const right = input.counted.filter(f.right).length;
  const chance = Math.round(total / Math.max(1, input.pairs.length - 2));
  const tone =
    right >= chance * BETTER && right - chance >= 2
      ? 'better'
      : right <= chance * WORSE
        ? 'worse'
        : 'same';
  return [
    award('group', [], {
      strength: right / total,
      value: right,
      total,
      extra: chance,
      tone,
    }),
  ];
};

/**
 * The award screens of a palmarès (README 22.17): every award whose
 * condition is met, at most eight (the weakest left out, never
 * « Démasqués » nor the group's score), in the order of the images.
 * @param input - The guesses that count, the draw, the mode, the end.
 * @returns The awards.
 */
export const awardsOf = (input: AwardInput): Award[] => {
  const f = factsOf(input);
  const threshold = groupThreshold(f.players.length);
  const others = [
    ...unmaskedAward(input, f),
    ...detectiveAwards(input),
    ...santaAwards(input, threshold),
    ...rumourAward(input, f, threshold),
    ...suspectAward(input, f, threshold),
    ...lastMinuteAward(input),
    ...weathervaneAward(input, f),
  ];
  const awarded = new Set(others.flatMap((a) => a.winners));
  return pickAwards([
    ...others,
    ...twinAwards(input, awarded),
    ...groupAward(input, f),
  ]);
};

/**
 * The award screens kept: at most eight, the weakest left out, never
 * « Démasqués » nor the group's score; in the order of the images.
 * @param all - Every award whose condition is met.
 * @returns Those shown.
 */
export const pickAwards = (all: Award[]): Award[] => {
  const kept = new Set(
    [
      ...all.filter((a) => a.kind === 'unmasked' || a.kind === 'group'),
      ...all
        .filter((a) => a.kind !== 'unmasked' && a.kind !== 'group')
        .toSorted((a, b) => b.strength - a.strength),
    ].slice(0, MAX_AWARD_SCREENS),
  );
  return all
    .filter((a) => kept.has(a))
    .toSorted(
      (a, b) => AWARD_ORDER.indexOf(a.kind) - AWARD_ORDER.indexOf(b.kind),
    );
};

/**
 * « Si près du but », for one player only: a line where they had the right
 * answer, then changed for a wrong one; of several, the line of the best
 * hidden Santa.
 * @param playerId - The player.
 * @param input - The guesses that count, the draw.
 * @returns The line (the person who received), or null.
 */
export const closeCallOf = (
  playerId: string,
  input: AwardInput,
): string | null => {
  const f = factsOf(input);
  const hidden = new Map(santaScores(input).map((s) => [s.giverId, s.note]));
  const lines = input.counted.filter((g) => {
    const actual = f.giverOf.get(g.recipientId);
    return (
      g.guesserId === playerId &&
      !f.right(g) &&
      actual !== undefined &&
      (g.previous ?? []).includes(actual)
    );
  });
  const [top] = lines.toSorted(
    (a, b) =>
      (hidden.get(f.giverOf.get(b.recipientId)!) ?? 0) -
        (hidden.get(f.giverOf.get(a.recipientId)!) ?? 0) ||
      a.recipientId.localeCompare(b.recipientId),
  );
  return top?.recipientId ?? null;
};
