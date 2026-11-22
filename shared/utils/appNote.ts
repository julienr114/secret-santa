// « Le mot de l'application » (ticket 120, accueil-et-creation.md): a
// short text in the language of the account, at the top of « Quoi de
// neuf », shown to those it concerns, gone once closed. The switch to the
// V3 (ticket 113) writes one, for the accounts that knew the V2, with one
// more sentence for those who held a list shared by its link. Pure.

/** A word of the app: its id, its text and the sentence added for some. */
export type AppNote = { id: string; key: string; extraKey: string | null };

/** A word, and the accounts it concerns. */
export type AppNoteRule = {
  id: string;
  key: string;
  /** Whom it is for: accounts created before this instant (ISO), or all. */
  createdBefore: string | null;
  /** One more sentence, for the accounts that held a list shared by link. */
  linkKey: string | null;
};

/** The id of the word of the switch, kept by those who closed it. */
export const V3_NOTE_ID = 'v3';

/**
 * The words of the app: the one of the switch to the V3, for the accounts
 * created before it, once the V3 is out.
 * @param switchedAt - When the V3 went out (ISO), or null before.
 * @returns The words.
 */
export const appNotes = (switchedAt: string | null): AppNoteRule[] =>
  switchedAt === null
    ? []
    : [
        {
          id: V3_NOTE_ID,
          key: 'news.note.v3',
          createdBefore: switchedAt,
          linkKey: 'news.note.v3Link',
        },
      ];

/**
 * The instant of a date as SQLite writes it (`2026-11-23 06:02:11`, UTC),
 * as the app writes its own (ISO).
 * @param value - The date of SQLite, or nothing.
 * @returns The instant, or null when it is not one.
 */
export const isoOfSqlite = (value: unknown): string | null => {
  const match = /^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2}:\d{2})/.exec(
    String(value ?? ''),
  );
  return match ? `${match[1]}T${match[2]}.000Z` : null;
};

/**
 * The word an account sees: the first of the words that concerns it and
 * that it has not closed.
 * @param account - The account.
 * @param account.createdAt - When it was created (ISO).
 * @param account.heldLinkList - Whether it held a list shared by its link
 * when the word was written.
 * @param dismissed - The ids of the words it closed.
 * @param notes - The words of the app.
 * @returns The word, or null.
 */
export const noteFor = (
  account: { createdAt: string; heldLinkList: boolean },
  dismissed: readonly string[],
  notes: readonly AppNoteRule[],
): AppNote | null => {
  const found = notes.find(
    (note) =>
      !dismissed.includes(note.id) &&
      (note.createdBefore === null || account.createdAt < note.createdBefore),
  );
  if (!found) return null;
  return {
    id: found.id,
    key: found.key,
    extraKey: account.heldLinkList ? found.linkKey : null,
  };
};
