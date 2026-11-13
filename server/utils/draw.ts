import { ok, fail, type Result } from './result';

// The draw (README section 6). Pure: randomness comes in through
// `random(n)`, an integer in [0, n). The caller prepares `history` (receivers
// of each giver over the last N editions, only for editions the giver took
// part in) because that needs the database and decryption.

export type ManualExclusion = {
  giverId: string;
  receiverId: string;
  reciprocal?: boolean;
};

export type DrawInput = {
  /** person ids taking part in the edition */
  participants: string[];
  /** active couples among them */
  couples?: Array<[string, string]>;
  manualExclusions?: ManualExclusion[];
  /** giverId -> past receivers to exclude */
  history?: Record<string, string[]>;
};

export type DrawRules = { excludeSpouse: boolean };
export type Assignment = { giverId: string; receiverId: string };
export type RandomInt = (n: number) => number;
export type Allowed = Record<string, string[]>;

export const MAX_REJECTION_ATTEMPTS = 1000;

const unique = <T>(items: T[]): T[] => [...new Set(items)];

const spousesOf = (couples: Array<[string, string]>, id: string): string[] =>
  couples.flatMap(([a, b]) => (a === id ? [b] : b === id ? [a] : []));

const manuallyExcluded = (
  manualExclusions: ManualExclusion[],
  id: string,
): string[] =>
  manualExclusions.flatMap(({ giverId, receiverId, reciprocal }) =>
    giverId === id
      ? [receiverId]
      : reciprocal && receiverId === id
        ? [giverId]
        : [],
  );

/** Receivers each giver may draw, per README 6.1. */
export const allowedReceivers = (
  input: DrawInput,
  rules: DrawRules,
): Allowed => {
  const participants = unique(input.participants);
  const forbiddenFor = (id: string) =>
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
 */
export const shuffle = <T>(items: readonly T[], random: RandomInt): T[] => {
  if (items.length <= 1) return [...items];
  const index = random(items.length);
  const rest = [...items.slice(0, index), ...items.slice(index + 1)];
  return [items[index] as T, ...shuffle(rest, random)];
};

const isValid = (assignments: Assignment[], allowed: Allowed): boolean =>
  assignments.every(({ giverId, receiverId }) =>
    allowed[giverId]?.includes(receiverId),
  );

// Rejection sampling: shuffle the receivers, keep the permutation if every
// pair is allowed. Uniform over valid solutions.
const drawByRejection = (
  givers: string[],
  allowed: Allowed,
  random: RandomInt,
  attemptsLeft: number,
): Assignment[] | null => {
  if (attemptsLeft === 0) return null;
  const receivers = shuffle(givers, random);
  const candidate = givers.map((giverId, i) => ({
    giverId,
    receiverId: receivers[i] as string,
  }));
  return isValid(candidate, allowed)
    ? candidate
    : drawByRejection(givers, allowed, random, attemptsLeft - 1);
};

// Backtracking, most constrained giver first, candidates in random order.
// Finds a solution whenever one exists, not uniformly.
const drawByBacktracking = (
  givers: string[],
  allowed: Allowed,
  random: RandomInt,
): Assignment[] | null => {
  const count = (id: string) => allowed[id]?.length ?? 0;
  const ordered = givers.toSorted((a, b) => count(a) - count(b));
  const solve = (
    remaining: string[],
    used: ReadonlySet<string>,
    acc: Assignment[],
  ): Assignment[] | null => {
    if (remaining.length === 0) return acc;
    const [giverId, ...rest] = remaining as [string, ...string[]];
    const candidates = shuffle(
      (allowed[giverId] ?? []).filter((receiverId) => !used.has(receiverId)),
      random,
    );
    const tryEach = (list: string[]): Assignment[] | null => {
      if (list.length === 0) return null;
      const [receiverId, ...others] = list as [string, ...string[]];
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

export type NoSolutionDetails = {
  blocked: string[];
  constrained: string[];
  allowedCounts: Record<string, number>;
};

const noSolution = (allowed: Allowed) =>
  fail('no_solution', {
    blocked: Object.keys(allowed).filter((id) => allowed[id]?.length === 0),
    constrained: Object.keys(allowed).filter((id) => {
      const n = allowed[id]?.length ?? 0;
      return n > 0 && n <= 2;
    }),
    allowedCounts: Object.fromEntries(
      Object.entries(allowed).map(([id, r]) => [id, r.length]),
    ),
  } satisfies NoSolutionDetails);

/** Is a draw possible? Explains why not with the participants to blame. */
export const checkFeasibility = (
  input: DrawInput,
  rules: DrawRules,
): Result<{ allowed: Allowed }> => {
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
 */
export const draw = (
  input: DrawInput,
  rules: DrawRules,
  { random }: { random: RandomInt },
): Result<{ assignments: Assignment[] }> => {
  const feasibility = checkFeasibility(input, rules);
  if (!feasibility.ok) return feasibility;
  const { allowed } = feasibility.value;
  const givers = Object.keys(allowed);
  const assignments =
    drawByRejection(givers, allowed, random, MAX_REJECTION_ATTEMPTS) ??
    drawByBacktracking(givers, allowed, random);
  return assignments ? ok({ assignments }) : noSolution(allowed);
};
