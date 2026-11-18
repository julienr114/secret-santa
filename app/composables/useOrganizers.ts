/**
 * How many organisers the group of the page has, set by the page from its
 * answer: the participant's texts say « ton organisateur » or « tes
 * organisateurs » (passed as `count` to their plural).
 * @returns A shared ref, 1 until a page says otherwise.
 */
export const useOrganizers = () => useState<number>('organizers', () => 1);

/**
 * Keeps the count of organisers of the page's answer.
 * @param count - The count, once the answer is there.
 * @returns Nothing.
 */
export const useOrganizersOf = (count: () => number | undefined) => {
  const organizers = useOrganizers();
  watch(
    count,
    (value) => {
      if (value !== undefined) organizers.value = value;
    },
    { immediate: true },
  );
};
