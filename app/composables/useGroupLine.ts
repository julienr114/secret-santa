import type { GroupDraw } from '#server/utils/overview';

/**
 * How the administration says what a group is: « 5 membres », and where
 * its draw in progress stands (« tirage fait, 1 sur 5 a consulté »).
 * @returns The two parts of the line.
 */
export const useGroupLine = () => {
  const { t } = useT();
  /**
   * How many members a group has.
   * @param count - Its active people.
   * @returns « 5 membres ».
   */
  const membersPart = (count: number) => t('auth.admin.members', { count });
  /**
   * Where the draw in progress stands.
   * @param draw - The draw, or null.
   * @param views - Whether to say how many opened their result.
   * @returns « à préparer », « tirage fait, 1 sur 5 a consulté »…
   */
  const drawPart = (draw: GroupDraw, views = false) => {
    if (!draw) return t('auth.admin.draw.none');
    const state = t(`auth.admin.draw.${draw.status}`);
    return views && draw.status === 'drawn'
      ? `${state}, ${t('auth.admin.draw.viewed', {
          count: draw.viewed,
          total: draw.participants,
        })}`
      : state;
  };
  return { membersPart, drawPart };
};
