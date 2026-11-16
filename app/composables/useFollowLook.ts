import type { Participant } from '#server/database/editions';
import { followState, type FollowState } from '#server/utils/editions';

/** Icon and colour of each state after the draw. */
const STATES: Record<FollowState, { icon: string; tone: string }> = {
  toNotify: { icon: 'i-lucide-circle-dashed', tone: 'text-muted' },
  notOpened: { icon: 'i-lucide-clock', tone: 'text-warning-ink' },
  viewed: { icon: 'i-lucide-check', tone: 'text-success' },
};

/**
 * Where a participant stands after the draw, as shown in the lists and
 * the send sheet.
 * @returns `lookOf`, giving the icon, the tone class and the words.
 */
export const useFollowLook = () => {
  const { t } = useT();
  /**
   * The look of a participant's state.
   * @param p - The participant.
   * @returns The icon, its tone class and the text of the state.
   */
  const lookOf = (p: Participant) => {
    const state = followState(p);
    return {
      ...STATES[state],
      text:
        state === 'viewed'
          ? t('adminEdition.screen.follow.state.viewed', { count: p.viewCount })
          : t(`adminEdition.screen.follow.state.${state}`),
    };
  };
  return { lookOf };
};
