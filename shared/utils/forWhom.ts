// A birthday knows whom it is for (ticket 118, docs/spec/v3/categories.md,
// « Pour un anniversaire »): one of the people of an account, from whom
// the event says an age (« ses 4 ans », « Ses 3 ans ») and a first name
// (« 7 cadeaux offerts à Zoé »). Never their birth date itself. Pure.
import type { PartyCategory } from './categories';

/** Whom a birthday is for, as a screen shows it. */
export type ForWhom = {
  firstName: string;
  /** The age turned the year shown; null without a birth date. */
  age: number | null;
  /** It is me: « tes 40 ans ». */
  me: boolean;
  /** The person, only when one of mine: what the settings choose from. */
  memberId: string | null;
};

/** What a person of an account gives to the birthday made for them. */
export type ForWhomMember = {
  id: string;
  accountId: string;
  firstName: string;
  birthDate: string | null;
  isSelf: boolean;
  linkedAccountId: string | null;
};

/**
 * The age turned a given year.
 * @param birthDate - « 2022-12-14 », or null.
 * @param year - « 2026 ».
 * @returns « 4 », or null without a birth date or before the first one.
 */
export const ageIn = (
  birthDate: string | null,
  year: number,
): number | null => {
  const born = Number(birthDate?.slice(0, 4));
  if (!birthDate || !Number.isInteger(born)) return null;
  const age = year - born;
  return age >= 1 ? age : null;
};

/**
 * Whom a birthday is for, seen by an account, a given year.
 * @param input - The category of the event, the person (if still there),
 *   the account that looks, the year.
 * @returns The first name, the age and whether it is me; null for
 *   another category, or without a person.
 */
export const forWhomOf = (input: {
  category: PartyCategory;
  member: ForWhomMember | null | undefined;
  viewer: string;
  year: number | null;
}): ForWhom | null => {
  const { category, member, viewer, year } = input;
  if (category !== 'birthday' || !member) return null;
  const mine = member.accountId === viewer;
  return {
    firstName: member.firstName,
    age: year === null ? null : ageIn(member.birthDate, year),
    me: (member.isSelf && mine) || member.linkedAccountId === viewer,
    memberId: mine ? member.id : null,
  };
};
