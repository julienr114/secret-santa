import { guessEndText } from '#shared/utils/dates';

/**
 * The end of the guesses of « Devine qui » in words, read in this
 * browser's time zone (README 22.17). Empty until the page is mounted:
 * the server does not know the reader's zone, and the page would not
 * match once in the browser.
 * @returns A function giving « 25 décembre à 18 h » for an instant.
 */
export const useGuessEnd = () => {
  const { locale } = useT();
  const mounted = ref(false);
  onMounted(() => {
    mounted.value = true;
  });
  return (iso: string | null | undefined) =>
    mounted.value && iso ? guessEndText(iso, locale.value) : '';
};
