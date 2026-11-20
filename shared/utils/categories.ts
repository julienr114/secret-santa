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
