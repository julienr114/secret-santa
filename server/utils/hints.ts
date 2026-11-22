import { ok, fail, type Result } from './result';
import type { EditionStatus } from './editions';
import { buttonEmail, emailSubject, type Email } from './messages';
import { translate, translateKey, type Locale } from '#shared/i18n';
import type { GiftHintsMode } from '#shared/utils/hints';

// Gift hints (README 22.11): who may write them, who may ask for them, and
// what a change does. Pure: the routes load and save.

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
 * The email to the one who receives (PistesEmail, ticket 110): the person
 * who gives them a present looks for ideas, and they are asked to write
 * their list. It never says who asks, even once the draw is revealed
 * (docs/spec/v3/vocabulaire.md: « toujours anonyme »).
 * @param data - First name, edition, event, the Secret Santa's name when
 *   the event has several that year, link to their list.
 * @param locale - Language of the receiver.
 * @returns The email.
 */
export const buildHintsRequestEmail = (
  data: {
    firstName: string;
    editionLabel: string;
    groupName: string;
    santaName?: string | null;
    link: string;
  },
  locale: Locale,
): Email => {
  const params = {
    name: data.firstName,
    edition: data.editionLabel,
    group: data.groupName,
  };
  const t = (key: string) =>
    translateKey(locale, `hints.email.request.${key}`, params);
  return buttonEmail({
    subject: emailSubject(
      locale,
      { event: data.groupName, santa: data.santaName },
      t('subject'),
    ),
    before: [t('greeting'), t('body'), t('help')],
    cta: t('cta'),
    link: data.link,
    after: [
      t('anonymous'),
      translate(locale, 'messages.email.signature', {
        groupName: data.groupName,
      }),
    ],
  });
};
