// « Le mot de l'application » (ticket 120, accueil-et-creation.md): a
// short text in the language of the account, at the top of « Quoi de
// neuf », shown to those it concerns, gone once closed. The switch to the
// V3 goes out without one (Q-034). Pure.

/** A word of the app: its id, its text (a key of the dictionaries). */
export type AppNote = { id: string; key: string };

/** A word, and the accounts it concerns. */
export type AppNoteRule = AppNote & {
  /** Whom it is for: accounts created before this instant (ISO), or all. */
  createdBefore: string | null;
};

/**
 * The words of the app now: none.
 */
export const APP_NOTES: readonly AppNoteRule[] = [];

/**
 * The word an account sees: the first of the words that concerns it and
 * that it has not closed.
 * @param account - The account.
 * @param account.createdAt - When it was created (ISO).
 * @param dismissed - The ids of the words it closed.
 * @param notes - The words of the app.
 * @returns The word, or null.
 */
export const noteFor = (
  account: { createdAt: string },
  dismissed: readonly string[],
  notes: readonly AppNoteRule[] = APP_NOTES,
): AppNote | null => {
  const found = notes.find(
    (note) =>
      !dismissed.includes(note.id) &&
      (note.createdBefore === null || account.createdAt < note.createdBefore),
  );
  return found ? { id: found.id, key: found.key } : null;
};
