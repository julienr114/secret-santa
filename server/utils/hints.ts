import { z } from 'zod';
import { ok, fail, type Result } from './result';
import type { EditionStatus } from './editions';
import { plainEmail, type Email } from './messages';
import { translate, type Locale } from '#shared/i18n';
import {
  HINT_ANSWERS,
  HINT_QUESTIONS,
  HINT_TEXTS,
  HINT_TEXT_MAX,
  type GiftHintsMode,
  type Portrait,
} from '#shared/utils/hints';

// Gift hints (README 22.11): who may write them, who may ask for them, and
// what a change does. Pure: the routes load and save.

const answerSchema = z.enum(HINT_ANSWERS).nullable();
// An empty or blank text is no text.
const textSchema = z
  .string()
  .trim()
  .max(HINT_TEXT_MAX)
  .nullable()
  .transform((value) => (value ? value : null));

/** A change to a portrait: only the keys given are touched. */
export const portraitPatchSchema = z.object({
  answers: z
    .object(
      Object.fromEntries(
        HINT_QUESTIONS.map((question) => [question, answerSchema]),
      ) as Record<(typeof HINT_QUESTIONS)[number], typeof answerSchema>,
    )
    .partial()
    .default({}),
  texts: z
    .object(
      Object.fromEntries(HINT_TEXTS.map((key) => [key, textSchema])) as Record<
        (typeof HINT_TEXTS)[number],
        typeof textSchema
      >,
    )
    .partial()
    .default({}),
});
export type PortraitPatch = z.infer<typeof portraitPatchSchema>;

/**
 * Applies a change to a portrait: an answer given or taken back, a text
 * written or emptied. Unknown keys are ignored.
 * @param portrait - The portrait as it is.
 * @param patch - What the participant sent.
 * @returns The new portrait, or `invalid_hints` with the faulty key.
 */
export const applyPortraitPatch = (
  portrait: Portrait,
  patch: unknown,
): Result<Portrait> => {
  const parsed = portraitPatchSchema.safeParse(patch ?? {});
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return fail('invalid_hints', {
      field: issue?.path.slice(0, 2).join('.') ?? '',
    });
  }
  return ok({
    answers: { ...portrait.answers, ...parsed.data.answers },
    texts: { ...portrait.texts, ...parsed.data.texts },
  });
};

/**
 * The portrait (questions and texts) is written from the creation of the
 * edition until it is closed, unless the group has no hints.
 * @param status - Status of the edition.
 * @param mode - The group setting.
 * @returns Ok, or why not.
 */
export const canEditHints = (
  status: EditionStatus,
  mode: GiftHintsMode,
): Result<true> => {
  if (mode === 'none') return fail('gift_hints_disabled');
  if (status === 'closed') return fail('edition_closed');
  return ok(true);
};

/**
 * The precise ideas, the same, but only when the group keeps them.
 * @param status - Status of the edition.
 * @param mode - The group setting.
 * @returns Ok, or why not.
 */
export const canEditIdeas = (
  status: EditionStatus,
  mode: GiftHintsMode,
): Result<true> =>
  mode === 'full' ? canEditHints(status, mode) : fail('ideas_disabled');

/**
 * « Lui demander des pistes » (README 22.11): once per draw, after the
 * draw and before the edition is closed, only when the receiver left
 * nothing at all.
 * @param state - Status of the edition, the group setting, whether the
 *   receiver left hints, whether the giver already asked.
 * @returns Ok, or why not.
 */
export const canRequestHints = (state: {
  status: EditionStatus;
  mode: GiftHintsMode;
  receiverHasHints: boolean;
  alreadyRequested: boolean;
}): Result<true> => {
  if (state.mode === 'none') return fail('gift_hints_disabled');
  if (state.status !== 'drawn') return fail('draw_not_done');
  if (state.alreadyRequested) return fail('hints_already_requested');
  if (state.receiverHasHints) return fail('hints_already_given');
  return ok(true);
};

/** The hints of a receiver, as their giver sees them (lot 16 bis). */
export type GiverHintsState = 'none' | 'some' | 'new';

/**
 * Whether the giver has hints to read, and whether they are new: left or
 * changed since the giver last opened their result. Before a first
 * opening, they are hints, not news; opening the result makes them old.
 * @param state - Whether the receiver has hints, when they last changed,
 *   when the giver last opened their result.
 * @returns none, some or new.
 */
export const giverHintsState = (state: {
  hasHints: boolean;
  hintsUpdatedAt: string | null;
  lastOpenedAt: string | null;
}): GiverHintsState => {
  if (!state.hasHints) return 'none';
  return state.lastOpenedAt &&
    state.hintsUpdatedAt &&
    state.hintsUpdatedAt > state.lastOpenedAt
    ? 'new'
    : 'some';
};

/**
 * Whether saving hints is the moment to email the giver « des pistes sont
 * arrivées »: the first time hints appear after the giver discovered
 * their result, asked or not; once per draw, never for a change.
 * @param state - Hints before and after the save, whether the giver has
 *   discovered their result, whether this draw already announced them.
 * @returns True once.
 */
export const shouldAnnounceHints = (state: {
  hadHints: boolean;
  hasHintsNow: boolean;
  giverRevealed: boolean;
  alreadyAnnounced: boolean;
}): boolean =>
  !state.hadHints &&
  state.hasHintsNow &&
  state.giverRevealed &&
  !state.alreadyAnnounced;

/**
 * The email to the one who receives: the person who gives them a present
 * looks for ideas. It never says who asks (README 22.11).
 * @param data - First name, edition, group, link to their hints page.
 * @param locale - Language of the receiver.
 * @returns The email.
 */
export const buildHintsRequestEmail = (
  data: {
    firstName: string;
    editionLabel: string;
    groupName: string;
    link: string;
    /** Five questions without the precise ideas, six with them. */
    mode: GiftHintsMode;
    /** Who asks, once the draw is revealed (README 22.18); else nobody. */
    from?: string | null;
  },
  locale: Locale,
): Email =>
  plainEmail({
    subject: data.from
      ? translate(locale, 'hints.email.request.subjectFrom', {
          from: data.from,
        })
      : translate(locale, 'hints.email.request.subject'),
    before: [
      translate(locale, 'hints.email.request.greeting', {
        name: data.firstName,
      }),
      translate(
        locale,
        `hints.email.request.${data.mode === 'portrait' ? 'bodyPortrait' : 'body'}${data.from ? 'From' : ''}`,
        {
          edition: data.editionLabel,
          group: data.groupName,
          from: data.from ?? '',
        },
      ),
      translate(locale, 'hints.email.request.cta'),
    ],
    link: data.link,
    after: [
      ...(data.from
        ? []
        : [translate(locale, 'hints.email.request.anonymous')]),
      translate(locale, 'hints.email.request.once'),
    ],
  });

/**
 * The email to the one who asked: hints arrived. It never names the
 * receiver: an email holds no result (README 8.6).
 * @param data - First name of the giver, edition, group, their own link.
 * @param locale - Language of the giver.
 * @returns The email.
 */
export const buildHintsArrivedEmail = (
  data: {
    firstName: string;
    editionLabel: string;
    groupName: string;
    link: string;
  },
  locale: Locale,
): Email =>
  plainEmail({
    subject: translate(locale, 'hints.email.arrived.subject'),
    before: [
      translate(locale, 'hints.email.arrived.greeting', {
        name: data.firstName,
      }),
      translate(locale, 'hints.email.arrived.body', {
        edition: data.editionLabel,
        group: data.groupName,
      }),
    ],
    link: data.link,
    after: [translate(locale, 'messages.email.personal')],
  });
