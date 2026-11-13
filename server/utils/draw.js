import { ok, fail } from './result.js';

// The draw (README section 6). Pure: randomness comes in through
// `random(n)`, an integer in [0, n). The caller prepares `history` (receivers
// of each giver over the last N editions, only for editions the giver took
// part in) because that needs the database and decryption.

/**
 * @typedef {object} DrawInput
 * @property {string[]} participants person ids taking part in the edition
 * @property {Array<[string, string]>} couples active couples among them
 * @property {Array<{ giverId: string, receiverId: string, reciprocal?: boolean }>} manualExclusions
 * @property {Record<string, string[]>} history giverId -> past receivers to exclude
 */
/** @typedef {{ giverId: string, receiverId: string }} Assignment */
/** @typedef {(n: number) => number} RandomInt */

export const MAX_REJECTION_ATTEMPTS = 1000;

const unique = (items) => [...new Set(items)];

const spousesOf = (couples, id) =>
  couples.flatMap(([a, b]) => (a === id ? [b] : b === id ? [a] : []));

const manuallyExcluded = (manualExclusions, id) =>
  manualExclusions.flatMap(({ giverId, receiverId, reciprocal }) =>
    giverId === id
      ? [receiverId]
      : reciprocal && receiverId === id
        ? [giverId]
        : [],
  );

/**
 * Receivers each giver may draw, per README 6.1.
 * @param {DrawInput} input
 * @param {{ excludeSpouse: boolean }} rules
 * @returns {Record<string, string[]>}
 */
export const allowedReceivers = (input, rules) => {
  const participants = unique(input.participants);
  const forbiddenFor = (id) =>
    new Set([
      id,
      ...(rules.excludeSpouse ? spousesOf(input.couples ?? [], id) : []),
      ...manuallyExcluded(input.manualExclusions ?? [], id),
      ...(input.history?.[id] ?? []),
    ]);
  return Object.fromEntries(
    participants.map((id) => {
      const forbidden = forbiddenFor(id);
      return [id, participants.filter((other) => !forbidden.has(other))];
    }),
  );
};

/**
 * Uniform shuffle without mutation: pick a random element, recurse on the
 * rest. Quadratic, which is fine for a family.
 * @template T @param {T[]} items @param {RandomInt} random @returns {T[]}
 */
export const shuffle = (items, random) => {
  if (items.length <= 1) return [...items];
  const index = random(items.length);
  const rest = [...items.slice(0, index), ...items.slice(index + 1)];
  return [items[index], ...shuffle(rest, random)];
};

const isValid = (assignments, allowed) =>
  assignments.every(({ giverId, receiverId }) =>
    allowed[giverId].includes(receiverId),
  );

// Rejection sampling: shuffle the receivers, keep the permutation if every
// pair is allowed. Uniform over valid solutions.
const drawByRejection = (givers, allowed, random, attemptsLeft) => {
  if (attemptsLeft === 0) return null;
  const receivers = shuffle(givers, random);
  const candidate = givers.map((giverId, i) => ({
    giverId,
    receiverId: receivers[i],
  }));
  return isValid(candidate, allowed)
    ? candidate
    : drawByRejection(givers, allowed, random, attemptsLeft - 1);
};

// Backtracking, most constrained giver first, candidates in random order.
// Finds a solution whenever one exists, not uniformly.
const drawByBacktracking = (givers, allowed, random) => {
  const ordered = givers.toSorted(
    (a, b) => allowed[a].length - allowed[b].length,
  );
  const solve = (remaining, used, acc) => {
    if (remaining.length === 0) return acc;
    const [giverId, ...rest] = remaining;
    const candidates = shuffle(
      allowed[giverId].filter((receiverId) => !used.has(receiverId)),
      random,
    );
    const tryEach = (list) => {
      if (list.length === 0) return null;
      const [receiverId, ...others] = list;
      const found = solve(rest, new Set([...used, receiverId]), [
        ...acc,
        { giverId, receiverId },
      ]);
      return found ?? tryEach(others);
    };
    return tryEach(candidates);
  };
  return solve(ordered, new Set(), []);
};

const noSolution = (allowed) =>
  fail('no_solution', {
    blocked: Object.keys(allowed).filter((id) => allowed[id].length === 0),
    constrained: Object.keys(allowed).filter(
      (id) => allowed[id].length > 0 && allowed[id].length <= 2,
    ),
    allowedCounts: Object.fromEntries(
      Object.entries(allowed).map(([id, r]) => [id, r.length]),
    ),
  });

/**
 * Is a draw possible? Explains why not with the participants to blame.
 * @param {DrawInput} input
 * @param {{ excludeSpouse: boolean }} rules
 * @returns {import('./result.js').Result<{ allowed: Record<string, string[]> }>}
 */
export const checkFeasibility = (input, rules) => {
  const participants = unique(input.participants);
  if (participants.length < 2) {
    return fail('too_few_participants', { count: participants.length });
  }
  const allowed = allowedReceivers(input, rules);
  const solution = drawByBacktracking(participants, allowed, () => 0);
  return solution ? ok({ allowed }) : noSolution(allowed);
};

/**
 * Runs the draw. Rejection sampling first (uniform), backtracking as a
 * fallback (README 6.2).
 * @param {DrawInput} input
 * @param {{ excludeSpouse: boolean }} rules
 * @param {{ random: RandomInt }} deps
 * @returns {import('./result.js').Result<{ assignments: Assignment[] }>}
 */
export const draw = (input, rules, { random }) => {
  const feasibility = checkFeasibility(input, rules);
  if (!feasibility.ok) return feasibility;
  const { allowed } = feasibility.value;
  const givers = Object.keys(allowed);
  const assignments =
    drawByRejection(givers, allowed, random, MAX_REJECTION_ATTEMPTS) ??
    drawByBacktracking(givers, allowed, random);
  return assignments ? ok({ assignments }) : noSolution(allowed);
};
