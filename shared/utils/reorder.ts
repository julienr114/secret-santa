// The order of a gift list (lot 24 ter, README 22.20): its people, each
// with their ideas, moved by dragging or from the keyboard. An order is
// the whole list, so that a move is one thing to save and to undo.

/** A person of a list with their ideas, in order. */
export type OrderSection = { id: string; ideas: string[] };
/** The whole order of a list. */
export type ListOrder = OrderSection[];

const clamp = (index: number, max: number) => Math.max(0, Math.min(index, max));

/**
 * An idea moved to a place among the ideas of a person: its own, or
 * another's. The place is counted among the other ideas, the one moved
 * taken out first; a place past the end is the end.
 * @param order - The order as it stands.
 * @param ideaId - The idea moved.
 * @param to - Where it goes.
 * @param to.personId - The person whose ideas it joins.
 * @param to.index - Its place among them.
 * @returns The new order; the same one when the idea or the person is
 * unknown.
 */
export const moveIdea = (
  order: ListOrder,
  ideaId: string,
  to: { personId: string; index: number },
): ListOrder => {
  const known =
    order.some((section) => section.ideas.includes(ideaId)) &&
    order.some((section) => section.id === to.personId);
  if (!known) return order;
  return order.map((section) => {
    const others = section.ideas.filter((id) => id !== ideaId);
    if (section.id !== to.personId) return { ...section, ideas: others };
    const index = clamp(to.index, others.length);
    return {
      ...section,
      ideas: [...others.slice(0, index), ideaId, ...others.slice(index)],
    };
  });
};

/**
 * A person moved to a place in the list, with their ideas. The place is
 * counted among the others, the one moved taken out first.
 * @param order - The order as it stands.
 * @param personId - The person moved.
 * @param index - Their place among the others.
 * @returns The new order; the same one when the person is unknown.
 */
export const movePerson = (
  order: ListOrder,
  personId: string,
  index: number,
): ListOrder => {
  const moved = order.find((section) => section.id === personId);
  if (!moved) return order;
  const others = order.filter((section) => section.id !== personId);
  const at = clamp(index, others.length);
  return [...others.slice(0, at), moved, ...others.slice(at)];
};

/**
 * Where an idea is: whose it is, and its place among theirs.
 * @param order - The order.
 * @param ideaId - The idea.
 * @returns The person, the place (from 0) and how many ideas they have;
 * null when the idea is unknown.
 */
export const placeOfIdea = (
  order: ListOrder,
  ideaId: string,
): { personId: string; index: number; count: number } | null => {
  const section = order.find((s) => s.ideas.includes(ideaId));
  return section
    ? {
        personId: section.id,
        index: section.ideas.indexOf(ideaId),
        count: section.ideas.length,
      }
    : null;
};

/**
 * An idea moved one step up or down, as `Alt` + an arrow does: among the
 * ideas of its person, then on to the end of the person above, or the
 * start of the one below. At either end of the list, nothing moves. An
 * idea someone gives stays with its person.
 * @param order - The order as it stands.
 * @param ideaId - The idea.
 * @param step - -1 up, 1 down.
 * @param stay - Whether it stays among the ideas of its person.
 * @returns The new order, the same one when it cannot move.
 */
export const stepIdea = (
  order: ListOrder,
  ideaId: string,
  step: -1 | 1,
  stay = false,
): ListOrder => {
  const place = placeOfIdea(order, ideaId);
  if (!place) return order;
  const to = place.index + step;
  if (to >= 0 && to < place.count) {
    return moveIdea(order, ideaId, { personId: place.personId, index: to });
  }
  if (stay) return order;
  const at = order.findIndex((section) => section.id === place.personId);
  const next = order[at + step];
  if (!next) return order;
  return moveIdea(order, ideaId, {
    personId: next.id,
    index: step < 0 ? next.ideas.length : 0,
  });
};

/**
 * A person moved one step up or down, as « Monter » and « Descendre » do.
 * @param order - The order as it stands.
 * @param personId - The person.
 * @param step - -1 up, 1 down.
 * @returns The new order, the same one at either end of the list.
 */
export const stepPerson = (
  order: ListOrder,
  personId: string,
  step: -1 | 1,
): ListOrder => {
  const at = order.findIndex((section) => section.id === personId);
  const to = at + step;
  return at < 0 || to < 0 || to >= order.length
    ? order
    : movePerson(order, personId, to);
};

/**
 * Whether two orders are the same.
 * @param a - An order.
 * @param b - Another.
 * @returns True when nothing moved.
 */
export const sameOrder = (a: ListOrder, b: ListOrder): boolean =>
  a.length === b.length &&
  a.every(
    (section, i) =>
      section.id === b[i]?.id &&
      section.ideas.length === b[i]?.ideas.length &&
      section.ideas.every((id, j) => id === b[i]?.ideas[j]),
  );

/**
 * Something put in an order: the people of a list, each with their ideas,
 * as an order says. What the order does not name keeps its place at the
 * end, so that an idea just written by someone else is never lost.
 * @param sections - The people as they came, each with their ideas.
 * @param order - The order wanted.
 * @param idOf - The id of an idea.
 * @returns The people and their ideas, in order.
 */
export const applyOrder = <S extends { id: string; ideas: unknown[] }>(
  sections: readonly S[],
  order: ListOrder,
  idOf: (idea: S['ideas'][number]) => string,
): S[] => {
  const ideas = new Map(
    sections.flatMap((s) => s.ideas.map((idea) => [idOf(idea), idea] as const)),
  );
  const placed = new Set(order.flatMap((section) => section.ideas));
  const byId = new Map(sections.map((section) => [section.id, section]));
  const named = order.flatMap((wanted) => {
    const section = byId.get(wanted.id);
    if (!section) return [];
    return [
      {
        ...section,
        ideas: [
          ...wanted.ideas.flatMap((id) => {
            const idea = ideas.get(id);
            return idea === undefined ? [] : [idea];
          }),
          ...section.ideas.filter((idea) => !placed.has(idOf(idea))),
        ],
      },
    ];
  });
  const ordered = new Set(order.map((section) => section.id));
  return [...named, ...sections.filter((s) => !ordered.has(s.id))];
};

/** One row to write: an idea with its person and place, or a person. */
export type OrderWrites = {
  people: { id: string; position: number }[];
  ideas: { id: string; listPersonId: string; position: number }[];
};

/**
 * What an order wanted changes in a list, or null when it is not the
 * same list any more: a person or an idea missing, added or named twice
 * (someone wrote in the meantime; the screen reads the list again).
 * @param current - The order stored.
 * @param wanted - The order asked.
 * @returns The rows that change, none when nothing moved; null when the
 * two do not hold the same people and ideas.
 */
export const orderWrites = (
  current: ListOrder,
  wanted: ListOrder,
): OrderWrites | null => {
  const same = (a: readonly string[], b: readonly string[]) =>
    a.length === b.length &&
    new Set(a).size === a.length &&
    a.every((id) => b.includes(id));
  const ideasOf = (order: ListOrder) => order.flatMap((s) => s.ideas);
  if (
    !same(
      wanted.map((s) => s.id),
      current.map((s) => s.id),
    ) ||
    !same(ideasOf(wanted), ideasOf(current))
  ) {
    return null;
  }
  const place = (order: ListOrder) =>
    new Map(
      order.flatMap((section) =>
        section.ideas.map(
          (id, position) => [id, `${section.id}:${position}`] as const,
        ),
      ),
    );
  const before = place(current);
  return {
    people: wanted.flatMap((section, position) =>
      current[position]?.id === section.id
        ? []
        : [{ id: section.id, position }],
    ),
    // A person whose lines changed has them all written again, so that
    // their places count from 0 with no gap: a gift not on the list takes
    // the same count (Julien, 24 November 2026).
    ideas: wanted.flatMap((section) =>
      section.ideas.every(
        (id, position) => before.get(id) === `${section.id}:${position}`,
      )
        ? []
        : section.ideas.map((id, position) => ({
            id,
            listPersonId: section.id,
            position,
          })),
    ),
  };
};

/**
 * The ideas an order moves to another person: those someone gives may
 * not (Julien, 24 November 2026).
 * @param current - The order stored.
 * @param writes - What the order wanted changes.
 * @returns The ideas that change person.
 */
export const ideasChangingPerson = (
  current: ListOrder,
  writes: OrderWrites,
): string[] =>
  writes.ideas.flatMap(({ id, listPersonId }) =>
    current.some(
      (section) => section.id !== listPersonId && section.ideas.includes(id),
    )
      ? [id]
      : [],
  );

/** A line of a person, with what places it. */
type Placed = { id: string; position: number | null; createdAt: string };

/**
 * The lines of a person in order: their ideas, and the gifts not on the
 * list, which take the same count (Julien, 24 November 2026). A gift not
 * placed yet comes after them all; at the same place, the idea first.
 * @param ideas - Their ideas.
 * @param gifts - The gifts not on the list given to them.
 * @returns The ids of the lines, in order.
 */
export const mergeLines = (
  ideas: readonly Placed[],
  gifts: readonly Placed[],
): string[] =>
  [
    ...ideas.map((line) => ({ ...line, gift: 0 })),
    ...gifts.map((line) => ({ ...line, gift: 1 })),
  ]
    .toSorted(
      (a, b) =>
        (a.position ?? Infinity) - (b.position ?? Infinity) ||
        a.gift - b.gift ||
        a.createdAt.localeCompare(b.createdAt),
    )
    .map((line) => line.id);

/**
 * The lines of each person as an order wants them, their ideas and the
 * gifts not on the list mixed (Julien, 24 November 2026); what the order
 * does not name keeps its place after, as it came.
 * @param sections - The people, their ideas already in the order.
 * @param order - The order wanted, or null for the lines as they came.
 * @returns The people, each with their lines.
 */
export const withLines = <
  S extends {
    id: string;
    ideas: readonly { id: string }[];
    offList: readonly { id: string }[];
    lines: readonly string[];
  },
>(
  sections: readonly S[],
  order: ListOrder | null,
): S[] =>
  sections.map((section) => {
    const known = new Set([
      ...section.ideas.map((idea) => idea.id),
      ...section.offList.map((gift) => gift.id),
    ]);
    const wanted = (
      order?.find((s) => s.id === section.id)?.ideas ?? []
    ).filter((id) => known.has(id));
    const named = new Set(wanted);
    const rest = [
      ...section.lines,
      ...section.ideas.map((idea) => idea.id),
    ].filter(
      (id, at, all) =>
        known.has(id) && !named.has(id) && all.indexOf(id) === at,
    );
    return { ...section, lines: [...wanted, ...rest] };
  });

/**
 * An order with the ids of its ideas read again (ticket 166): a line just
 * written has an id of this screen until the server gives it its own.
 * @param order - The order.
 * @param idOf - The id an idea has now.
 * @returns The same order, its ideas renamed.
 */
export const orderWithIds = (
  order: ListOrder,
  idOf: (id: string) => string,
): ListOrder =>
  order.map((section) => ({ ...section, ideas: section.ideas.map(idOf) }));
