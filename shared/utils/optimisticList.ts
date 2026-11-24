// What is written in a list shows at once (Julien, 24 November 2026,
// ticket 166), as a tick does (optimisticTick.ts): the page's data is
// changed before the server answers; once every change is answered, the
// list is read again and the server has the last word (a refusal
// included). Pure.

/** A person of a list, as much as these functions touch. */
type Person<I extends { id: string }> = {
  id: string;
  ideas: I[];
  /** Their ideas and gifts not on the list, in order (ticket 158). */
  lines?: string[];
};
/** A list, as much as these functions touch. */
type Doc<I extends { id: string }> = { people: Person<I>[] };
/** An idea of a list. */
type IdeaOf<D extends Doc<{ id: string }>> =
  D['people'][number]['ideas'][number];

/**
 * An idea changed in place: its text, its link, its stars, a title.
 * @param doc - The list.
 * @param ideaId - The idea.
 * @param patch - What changes.
 * @returns A new list; the same ideas elsewhere.
 */
export const withIdeaChanged = <D extends Doc<{ id: string }>>(
  doc: D,
  ideaId: string,
  patch: Partial<IdeaOf<D>>,
): D => ({
  ...doc,
  people: doc.people.map((person) => ({
    ...person,
    ideas: person.ideas.map((idea) =>
      idea.id === ideaId ? { ...idea, ...patch } : idea,
    ),
  })),
});

/**
 * An idea taken off the list, and off the order of its person.
 * @param doc - The list.
 * @param ideaId - The idea.
 * @returns A new list.
 */
export const withoutIdea = <D extends Doc<{ id: string }>>(
  doc: D,
  ideaId: string,
): D => ({
  ...doc,
  people: doc.people.map((person) => ({
    ...person,
    ideas: person.ideas.filter((idea) => idea.id !== ideaId),
    ...(person.lines
      ? { lines: person.lines.filter((id) => id !== ideaId) }
      : {}),
  })),
});

/**
 * A new idea, at its place: after the line it was written from, else at
 * the end of its person's ideas.
 * @param doc - The list.
 * @param personId - Its person.
 * @param after - The line it follows, or null.
 * @param idea - The idea, as it shows until the server answers.
 * @returns A new list.
 */
export const withIdeaAdded = <D extends Doc<{ id: string }>>(
  doc: D,
  personId: string,
  after: string | null,
  idea: IdeaOf<D>,
): D => {
  /** Puts an id after another one, else at the end. */
  const inserted = <T>(items: T[], at: number, item: T) =>
    at < 0 ? [...items, item] : items.toSpliced(at + 1, 0, item);
  return {
    ...doc,
    people: doc.people.map((person) =>
      person.id !== personId
        ? person
        : {
            ...person,
            ideas: inserted(
              person.ideas,
              after === null
                ? -1
                : person.ideas.findIndex((i) => i.id === after),
              idea,
            ),
            ...(person.lines
              ? {
                  lines: inserted(
                    person.lines,
                    after === null ? -1 : person.lines.indexOf(after),
                    idea.id,
                  ),
                }
              : {}),
          },
    ),
  };
};

/** What « Modifier » changes of a list itself. */
export type ListChange = {
  title?: string;
  eventDate?: string | null;
  icon?: { emoji: string; color: string };
  note?: string | null;
};

/**
 * The head of a list changed in place: its name, its date, its icon, its
 * word (shown as written: emptied, the list has none).
 * @param list - The head of the list.
 * @param change - What changes.
 * @returns A new head.
 */
export const withListChanged = <
  L extends {
    title: string;
    eventDate: string | null;
    icon: { emoji: string; color: string };
    note: { kind: 'none' } | { kind: 'text'; text: string };
  },
>(
  list: L,
  { note, ...rest }: ListChange,
): L => ({
  ...list,
  ...rest,
  ...(note === undefined
    ? {}
    : {
        note: note?.trim()
          ? { kind: 'text' as const, text: note.trim() }
          : { kind: 'none' as const },
      }),
});
