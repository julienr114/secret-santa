// Who sent, when an event has more than one organiser (ticket 170):
// « Dernier rappel le 20 décembre, par Hugo », or « par toi ». With one
// organiser, nothing is said.

/** Who sent the last reminder: me, or an organiser by first name. */
export type Sender = { me: true } | { me: false; name: string };

/**
 * Who sent, as the reader is told.
 * @param by - The account that sent, as the journal kept it.
 * @param organisers - The organisers of the event, with their first names.
 * @param me - The reader's account.
 * @returns Me, a first name, or null with one organiser or nobody known.
 */
export const reminderSender = (
  by: unknown,
  organisers: readonly { id: string; firstName: string | null }[],
  me: string,
): Sender | null => {
  if (organisers.length < 2 || typeof by !== 'string') return null;
  if (by === me) return { me: true };
  const name = organisers.find((one) => one.id === by)?.firstName;
  return name ? { me: false, name } : null;
};
