// The cards of the home put off with "Plus tard" (README 22.10), kept in
// this browser only: a convenience, never a state to rely on.
const STORAGE_KEY = 'home-dismissed';

/**
 * Reads the cards put off, if the browser allows it.
 * @returns Their keys.
 */
const read = (): string[] => {
  try {
    const value: unknown = JSON.parse(
      localStorage.getItem(STORAGE_KEY) ?? '[]',
    );
    return Array.isArray(value)
      ? value.filter((v): v is string => typeof v === 'string')
      : [];
  } catch {
    return [];
  }
};

/**
 * The cards put off, and the way to put one off.
 * @returns The keys, and a function that adds one.
 */
export const useHomeDismissed = () => {
  const dismissed = useState<string[]>('home-dismissed', () => []);
  onMounted(() => {
    dismissed.value = read();
  });
  /**
   * Puts a card off.
   * @param key - What the card remembers.
   * @returns Nothing.
   */
  const dismiss = (key: string) => {
    dismissed.value = [...new Set([...dismissed.value, key])];
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dismissed.value));
    } catch {
      // Private browsing or blocked storage: put off for this visit only.
    }
  };
  return { dismissed, dismiss };
};
