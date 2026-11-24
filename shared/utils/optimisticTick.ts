// A box ticked or unticked shows it at once (Julien, 23 November 2026):
// the line is changed in the page's data before the server answers, and
// put back if it refuses. The server's answer then replaces it.

/** What a line says of who gives it, as much as these functions touch. */
type View =
  | { kind: 'free' }
  | { kind: 'mine'; mode: 'alone'; anonymous: boolean }
  | { kind: 'taken'; by: string | null }
  | {
      kind: 'group';
      closed: boolean;
      mine: boolean;
      leads: boolean;
      people: { me: boolean }[];
    };

/** An idea of a list, as much as these functions touch. */
type Line = {
  id: string;
  view: View;
  /** Changed here, the server has not answered yet. */
  pending?: boolean;
  mine: {
    mode: 'alone' | 'group';
    anonymous: boolean;
    note: string | null;
  } | null;
};

/** A list as the page holds it: its people, each with their ideas. */
type Doc<L extends Line> = { people: { ideas: L[] }[] };

/**
 * A line I just ticked: mine, alone, in the mode of the list.
 * @param line - The line.
 * @param anonymous - Whether I tick anonymously here.
 * @returns The line as it will be.
 */
export const tickedLine = <L extends Line>(line: L, anonymous: boolean): L =>
  line.view.kind === 'free'
    ? {
        ...line,
        view: { kind: 'mine', mode: 'alone', anonymous },
        mine: { mode: 'alone', anonymous, note: null },
        pending: true,
      }
    : line;

/**
 * A line I just unticked: free when I gave it alone; out of the group when
 * I gave it with others, free once nobody is left.
 * @param line - The line.
 * @returns The line as it will be.
 */
export const untickedLine = <L extends Line>(line: L): L => {
  const { view } = line;
  if (view.kind === 'mine')
    return { ...line, view: { kind: 'free' }, mine: null, pending: true };
  if (view.kind !== 'group' || !view.mine) return line;
  const people = view.people.filter((person) => !person.me);
  return {
    ...line,
    view:
      people.length === 0
        ? { kind: 'free' }
        : { ...view, mine: false, leads: false, people },
    mine: null,
    pending: true,
  };
};

/**
 * The list with one of its lines changed.
 * @param doc - The list.
 * @param ideaId - The line.
 * @param change - What becomes of it.
 * @returns A new list; the same when the line is not there.
 */
export const withLine = <L extends Line, D extends Doc<L>>(
  doc: D,
  ideaId: string,
  change: (line: L) => L,
): D => ({
  ...doc,
  people: doc.people.map((person) => ({
    ...person,
    ideas: person.ideas.map((idea) =>
      idea.id === ideaId ? change(idea) : idea,
    ),
  })),
});
