/** What saving a chosen list of participants changes in an edition. */
export type ParticipantChanges = {
  /** People ticked who do not take part yet. */
  add: string[];
  /** People taking part who were unticked. */
  remove: string[];
};

/**
 * Compares who takes part with who is ticked.
 * @param current - The people taking part now.
 * @param chosen - The people ticked.
 * @returns Who to add and who to remove, in the order given.
 */
export const participantChanges = (
  current: readonly string[],
  chosen: readonly string[],
): ParticipantChanges => ({
  add: chosen.filter((id) => !current.includes(id)),
  remove: current.filter((id) => !chosen.includes(id)),
});

/**
 * Ticks or unticks one person.
 * @param chosen - The people ticked.
 * @param id - The person.
 * @param on - True to tick them.
 * @returns The people ticked afterwards, each once.
 */
export const toggleChosen = (
  chosen: readonly string[],
  id: string,
  on: boolean,
): string[] =>
  on ? [...chosen.filter((v) => v !== id), id] : chosen.filter((v) => v !== id);
