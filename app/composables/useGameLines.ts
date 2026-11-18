import { COUNT_FROM, deadlineOf } from '#server/utils/nudges';

/**
 * « 4 sur 6 ont joué » and « Plus que 3 jours » (README 22.17, Correction
 * 15), for the tile, the card under the result and the home. The count
 * shows from two players; the deadline in the last seven days, read in
 * this browser's time zone once the page is mounted (the server does not
 * know the reader's zone).
 * @returns The two texts, each empty when there is nothing to say.
 */
export const useGameLines = () => {
  const { t, tk } = useT();
  const zone = ref<string | null>(null);
  onMounted(() => {
    zone.value = Intl.DateTimeFormat().resolvedOptions().timeZone;
  });
  return {
    /**
     * The count, from two players.
     * @param count - Played, out of how many.
     * @param key - The text: the tile's, or a sentence.
     * @returns The words, or empty.
     */
    count: (
      count: { played: number; total: number } | null | undefined,
      key = 'participant.home.tiles.game.count',
    ) =>
      count && count.played >= COUNT_FROM
        ? tk(key, { count: count.played, total: count.total })
        : '',
    /**
     * The deadline, in the last seven days.
     * @param endsAt - The end of the guesses.
     * @returns The words, or empty.
     */
    deadline: (endsAt: string | null | undefined) => {
      if (!zone.value || !endsAt) return '';
      const deadline = deadlineOf(endsAt, new Date().toISOString(), zone.value);
      if (!deadline) return '';
      return deadline.kind === 'lastDay'
        ? t('participant.home.tiles.game.lastDay')
        : t('participant.home.tiles.game.days', { count: deadline.days });
    },
  };
};
