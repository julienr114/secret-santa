import type { AnswerStatus } from '#server/utils/answers';

/** Icon of each answer status, its colour and that of the words. */
const STATES: Record<
  AnswerStatus,
  { icon: string; iconTone: string; tone: string }
> = {
  toCheck: {
    icon: 'i-lucide-triangle-alert',
    iconTone: 'text-primary-ink',
    tone: 'text-primary-ink',
  },
  toNotify: {
    icon: 'i-lucide-circle-dashed',
    iconTone: 'text-toned',
    tone: 'text-toned',
  },
  asked: {
    icon: 'i-lucide-clock',
    iconTone: 'text-warning-ink',
    tone: 'text-warning-ink',
  },
  answered: {
    icon: 'i-lucide-check',
    iconTone: 'text-success',
    tone: 'text-toned',
  },
};

/**
 * Where a participant stands with their answer to a draw made elsewhere
 * (README 22.12), as the lists show it: never what they answered.
 * @returns `answerLook`, giving the icon, its colour and the words.
 */
export const useAnswerLook = () => {
  const { t } = useT();
  /**
   * The look of an answer status.
   * @param status - The status.
   * @returns The icon, the tone classes of the icon and the words, the words.
   */
  const answerLook = (status: AnswerStatus) => ({
    ...STATES[status],
    text: t(`adminEdition.answers.status.${status}`),
  });
  return { answerLook };
};
