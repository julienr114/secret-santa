import type { Participant } from '#server/database/editions';
import { followState, type FollowState } from '#server/utils/editions';
import type { Reach } from '#server/utils/drawEmails';

/** Icon of each state after the draw, its colour and that of the words. */
const STATES: Record<
  FollowState,
  { icon: string; iconTone: string; tone: string }
> = {
  toNotify: {
    icon: 'i-lucide-circle-dashed',
    iconTone: 'text-toned',
    tone: 'text-toned',
  },
  notOpened: {
    icon: 'i-lucide-clock',
    iconTone: 'text-warning-ink',
    tone: 'text-warning-ink',
  },
  viewed: {
    icon: 'i-lucide-check',
    iconTone: 'text-success',
    tone: 'text-toned',
  },
};

/**
 * Where a participant stands after the draw, as shown in the lists and
 * the send sheet.
 * @returns `lookOf`, giving the icon, its colour and the words, and
 * `seriesLook`, the same for a series without its count.
 */
export const useFollowLook = () => {
  const { t } = useT();
  /**
   * The look of a participant's state.
   * @param p - The participant.
   * @returns The icon, the tone classes of the icon and the words, the words.
   */
  const lookOf = (p: Participant & { reach?: Reach }) => {
    const state = followState(p);
    // After the draw, someone the app does not email is said so
    // (ticket 169): « Pas encore envoyé » only when the sending failed.
    const byHand =
      state === 'toNotify' && p.reach && p.reach !== 'email' ? p.reach : null;
    return {
      ...STATES[state],
      ...(byHand ? { icon: 'i-lucide-mail-x' } : {}),
      text: byHand
        ? t(`adminEdition.screen.follow.state.${byHand}`)
        : state === 'viewed'
          ? t('adminEdition.screen.follow.state.viewed', { count: p.viewCount })
          : t(`adminEdition.screen.follow.state.${state}`),
    };
  };
  /**
   * The look of a series of the list, under its fold row.
   * @param state - The state the series shares.
   * @returns The icon, the tone classes of the icon and the words, the words.
   */
  const seriesLook = (state: FollowState) => ({
    ...STATES[state],
    text: t(`adminEdition.screen.lists.series.${state}`),
  });
  return { lookOf, seriesLook };
};
