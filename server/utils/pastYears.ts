import { pastDeed, type PastDeed } from '#shared/utils/years';

// What the pages of the years over say I did (ticket 108,
// docs/spec/v3/lignes.md, « Les lignes des événements passés »). Pure: the
// queries are in server/database/pastYears.ts.

/** A list in an event: shared there, else made for there. */
export type PartyList = {
  id: string;
  partyId: string;
  accountId: string;
  shareToken: string | null;
  visibility: 'party' | 'giver' | 'made';
  year: number;
};

/** The key of a year of an event. */
export const yearKey = (partyId: string, year: number) => `${partyId}:${year}`;

/** What I did in each list, as counts. */
export type ListCounts = {
  /** The gifts I ticked there, on the list or beside it. */
  offered: Map<string, number>;
  /** The gifts ticked by anyone, on the lists I hold. */
  received: Map<string, number>;
  /** The ideas of the lists I hold. */
  ideas: Map<string, number>;
};

/**
 * What I did in each year over of some events (lignes.md): whom I gave
 * to, else the gifts I ticked, else those ticked on my lists.
 * @param input - The years over, their Secret Santa, the lists, my counts.
 * @returns The deed of each year, by `yearKey`.
 */
export const deedsOf = (input: {
  years: readonly { partyId: string; year: number }[];
  loaded: readonly {
    partyId: string;
    year: number;
    santas: readonly { id: string }[];
  }[];
  receivers: ReadonlyMap<string, string>;
  lists: readonly PartyList[];
  held: ReadonlySet<string>;
  counts: ListCounts;
}): Map<string, PastDeed> =>
  new Map(
    input.years.map(({ partyId, year }) => {
      const santas =
        input.loaded.find((row) => row.partyId === partyId && row.year === year)
          ?.santas ?? [];
      const lists = input.lists.filter(
        (list) => list.partyId === partyId && list.year === year,
      );
      const mine = lists.filter((list) => input.held.has(list.id));
      const sum = (ids: readonly string[], counts: Map<string, number>) =>
        [...new Set(ids)].reduce(
          (total, id) => total + (counts.get(id) ?? 0),
          0,
        );
      return [
        yearKey(partyId, year),
        pastDeed({
          gaveTo: santas.flatMap((santa) => {
            const name = input.receivers.get(santa.id);
            return name ? [name] : [];
          }),
          offered: sum(
            lists
              .filter((list) => !input.held.has(list.id))
              .map((list) => list.id),
            input.counts.offered,
          ),
          received:
            mine.length === 0
              ? null
              : sum(
                  mine.map((list) => list.id),
                  input.counts.received,
                ),
        }),
      ];
    }),
  );
