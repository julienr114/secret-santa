// The categories of a party (docs/spec/v3/categories.md): a code, stored
// on the party, and the starting settings it gives. A category forbids
// nothing and every setting stays changeable. Their names are in
// shared/i18n; the emoji is only the party's icon when none was chosen.

export const PARTY_CATEGORIES = [
  'christmas',
  'birthday',
  'birth',
  'wedding',
  'housewarming',
  'other',
] as const;
export type PartyCategory = (typeof PARTY_CATEGORIES)[number];

/** « On s'offre tous », « pour quelqu'un », « pour un foyer », or none. */
export type PartyForm = 'everyone' | 'someone' | 'household' | 'none';

export type CategoryDefaults = {
  /** The icon of the party and of its lists; null: chosen by hand. */
  emoji: string | null;
  form: PartyForm;
  /** The usual day as `MM-DD`; null: entered by hand, or a birth date. */
  usualDate: string | null;
  /** Whether it comes back each year; null: chosen by hand. */
  recurring: boolean | null;
};

export const CATEGORY_DEFAULTS: Readonly<
  Record<PartyCategory, CategoryDefaults>
> = {
  christmas: {
    emoji: '🎄',
    form: 'everyone',
    usualDate: '12-25',
    recurring: true,
  },
  birthday: { emoji: '🎂', form: 'someone', usualDate: null, recurring: true },
  birth: { emoji: '🍼', form: 'household', usualDate: null, recurring: false },
  wedding: {
    emoji: '💍',
    form: 'household',
    usualDate: null,
    recurring: false,
  },
  housewarming: {
    emoji: '🏡',
    form: 'household',
    usualDate: null,
    recurring: false,
  },
  other: { emoji: null, form: 'none', usualDate: null, recurring: null },
};

/**
 * The category whose emoji this is, else « other »: how a list kept
 * apart before the V3 gets the category of its own party.
 * @param emoji - The icon of the list.
 * @returns The category code.
 */
export const categoryOfEmoji = (emoji: string): PartyCategory =>
  PARTY_CATEGORIES.find((code) => CATEGORY_DEFAULTS[code].emoji === emoji) ??
  'other';

/**
 * The icon of a party: its own, else its category's.
 * @param party - The category and the emoji chosen, if any.
 * @returns The emoji, or null when neither gives one.
 */
export const partyEmoji = (party: {
  category: PartyCategory;
  iconEmoji: string | null;
}): string | null => party.iconEmoji ?? CATEGORY_DEFAULTS[party.category].emoji;

/**
 * The next time a day of the year comes, today included.
 * @param monthDay - « 12-25 ».
 * @param today - « 2026-11-20 ».
 * @returns « 2026-12-25 », or the year after once the day is past.
 */
export const nextOccurrence = (monthDay: string, today: string): string => {
  const year = Number(today.slice(0, 4));
  const thisYear = `${year}-${monthDay}`;
  return thisYear >= today ? thisYear : `${year + 1}-${monthDay}`;
};

/**
 * What a category fills in « Pour quelle occasion ? » (categories.md):
 * the date and whether it comes back. A birthday takes the birth date of
 * the one it is for, when known.
 * @param category - The category chosen.
 * @param input - Today, and the birth date of the one it is for, if any.
 * @returns The date (ISO, or null to enter by hand) and the recurrence.
 */
export const newPartyDefaults = (
  category: PartyCategory,
  input: { today: string; birthDate?: string | null },
): { date: string | null; recurring: boolean } => {
  const defaults = CATEGORY_DEFAULTS[category];
  const monthDay =
    category === 'birthday' && input.birthDate
      ? input.birthDate.slice(5, 10)
      : defaults.usualDate;
  return {
    date: monthDay ? nextOccurrence(monthDay, input.today) : null,
    recurring: defaults.recurring ?? false,
  };
};
