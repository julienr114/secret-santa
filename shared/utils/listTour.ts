// The visit of a new list (docs/spec/v3/listes.md, « La visite d'une
// liste neuve », ticket 149): which visit, its steps, and what the
// account keeps once it ends.

/** From a Secret Santa (six steps) or from « Créer » (three). */
export type TourKind = 'secret' | 'create';

/** What is in the light at a step. */
export type TourStep = 'me' | 'line' | 'share' | 'name' | 'resume' | 'add';

/** What the address of a list just made says: `?visite=secret|creer`. */
const KINDS: Record<string, TourKind> = { secret: 'secret', creer: 'create' };

/**
 * The visit to open on a list, from its address, once per account.
 * @param asked - `visite` in the address.
 * @param seen - Whether the account saw or skipped a visit already.
 * @returns The visit, or null.
 */
export const tourKindOf = (asked: unknown, seen: boolean): TourKind | null =>
  !seen && typeof asked === 'string' ? (KINDS[asked] ?? null) : null;

/**
 * The steps of a visit, in order. « Repartir d'une liste » is left out
 * when its block is not on the list (the count says « sur 5 »).
 * @param kind - The visit.
 * @param resume - Whether « Repartir d'une liste » is there.
 * @returns The steps.
 */
export const tourSteps = (kind: TourKind, resume: boolean): TourStep[] =>
  kind === 'secret'
    ? [
        'me',
        'line',
        'share',
        'name',
        ...(resume ? ['resume' as const] : []),
        'add',
      ]
    : ['name', 'add', 'share'];

/**
 * What the account keeps once a visit ends. The one from a Secret Santa
 * counts for the note on the first line; « Passer » stops everything.
 * @param kind - The visit.
 * @param how - To its end, or skipped.
 * @returns What is seen now.
 */
export const tourSeen = (
  kind: TourKind,
  how: 'done' | 'skipped',
): 'visit' | 'both' => (kind === 'create' && how === 'done' ? 'visit' : 'both');
