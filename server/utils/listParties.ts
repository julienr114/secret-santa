// Every list is in at least one party (docs/spec/v3/modele.md). Until the
// screens of the V3 come (tickets 104, 106), a list made on the screens of
// before gets a party of its own, like the lists kept apart at the
// migration (ticket 101): the pure part of it.
import { categoryOfEmoji, type PartyCategory } from '#shared/utils/categories';
import { isIsoDay } from './rules';

export type ListVisibility = 'party' | 'giver';

/** What a list says of itself, enough to make its own party. */
export type ListForParty = {
  title: string;
  iconEmoji: string;
  iconColor: string;
  eventDate: string | null;
};

/**
 * The party of a list kept apart: its name, icon and date, a category
 * from its icon, never coming back, hidden from the screens of a group.
 * @param list - The list.
 * @param now - ISO date of the creation.
 * @returns The fields of the party, and its year with its date.
 */
export const ownPartyOf = (list: ListForParty, now: string) => ({
  party: {
    name: list.title,
    category: categoryOfEmoji(list.iconEmoji) as PartyCategory,
    iconEmoji: list.iconEmoji,
    iconColor: list.iconColor,
    usualDate: null,
    recurring: false,
    fromList: true,
    rules: {},
  },
  year: {
    year: Number((isIsoDay(list.eventDate) ? list.eventDate : now).slice(0, 4)),
    date: isIsoDay(list.eventDate) ? list.eventDate : null,
  },
});

/**
 * How a list linked to a draw is seen in the draw's party: by the whole
 * party once it is public, else only by the one who drew its holder
 * (decided by Julien on 20 November 2026).
 * @param list - Its public link, if any.
 * @returns The visibility.
 */
export const linkedVisibility = (list: {
  shareToken: string | null;
}): ListVisibility => (list.shareToken === null ? 'giver' : 'party');

/**
 * The address of a party made for a list: never asked, never shown yet.
 * @param bytes - Random bytes.
 * @returns « liste- » and their hex.
 */
export const listPartySlug = (bytes: Uint8Array): string =>
  `liste-${[...bytes].map((b) => b.toString(16).padStart(2, '0')).join('')}`;
