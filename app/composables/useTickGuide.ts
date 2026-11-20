// The note after the first tick (Correction 30, maquette ListeCocheGuide):
// « C'est noté », pointed at « Tu l'offres › », the first time one ticks
// on this device, then never again. Kept in this browser only: a
// convenience, never a state to rely on.
const STORAGE_KEY = 'tick-guide-seen';

/**
 * Whether the note was already shown on this device.
 * @returns True once seen, or when the browser keeps nothing.
 */
const seenBefore = (): boolean => {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
};

/**
 * The idea the note points at, and how to show it or take it away.
 * @returns The idea pointed at (null without a note), `offer` after a
 *   tick, `understood` for « Compris ».
 */
export const useTickGuide = () => {
  const pointed = useState<string | null>('tick-guide', () => null);
  /**
   * After a tick of mine: the note, the first time on this device.
   * @param ideaId - The idea ticked.
   * @returns Nothing.
   */
  const offer = (ideaId: string) => {
    if (pointed.value || seenBefore()) return;
    pointed.value = ideaId;
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      // Blocked storage: shown again another time, no harm.
    }
  };
  /** « Compris », or the line gone: no note any more. */
  const understood = () => {
    pointed.value = null;
  };
  return { pointed: readonly(pointed), offer, understood };
};
