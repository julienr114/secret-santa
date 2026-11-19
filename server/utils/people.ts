import { z } from 'zod';
import { isPlainName, WEB_ADDRESS_REFUSED } from './limits';
import { ok, fail, type Result } from './result';
import { LOCALES, localeOf, type Locale } from '#shared/i18n';
import {
  avatarColorSchema,
  avatarEmojiSchema,
  avatarOf,
  type Avatar,
} from './avatars';

// People and exclusions of a group (README 6.6, section 10).

/**
 * A first or last name. It is printed in emails sent to others: one that
 * carries a web address is refused (lot 38 A).
 */
export const nameSchema = z
  .string()
  .trim()
  .min(1)
  .max(60)
  .refine(isPlainName, WEB_ADDRESS_REFUSED);
/** Optional address: where the link is emailed, and what the person logs in with. */
export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .max(254)
  .pipe(z.email());

/** Preferred language of a person (personal page, messages, emails). */
export const languageSchema = z.enum(LOCALES);

export const personInputSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema.nullable().default(null),
  email: emailSchema.nullable().default(null),
  language: languageSchema.default('fr'),
  avatarEmoji: avatarEmojiSchema.optional(),
  avatarColor: avatarColorSchema.optional(),
});

export const personPatchSchema = z
  .object({
    firstName: nameSchema,
    lastName: nameSchema.nullable(),
    email: emailSchema.nullable(),
    language: languageSchema,
    avatarEmoji: avatarEmojiSchema,
    avatarColor: avatarColorSchema,
    active: z.boolean(),
  })
  .partial()
  .refine((patch) => Object.keys(patch).length > 0, 'nothing to update');

/** The profile of an account: who they are in the groups they create. */
export const profileSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema.nullable(),
  language: languageSchema,
  avatarEmoji: avatarEmojiSchema,
  avatarColor: avatarColorSchema,
});

/** What a profile needs from an account. */
export type ProfileAccount = {
  email: string;
  firstName: string | null;
  lastName: string | null;
  language: string;
  avatarEmoji: string | null;
  avatarColor: string | null;
};

/**
 * A first name guessed from an address, for an organiser with no profile
 * yet: "marie.dupont@x.fr" gives "Marie". They can change it later.
 * @param email - The address.
 * @returns The first word before the @, capitalised.
 */
export const firstNameFromEmail = (email: string): string => {
  const word = email.split('@')[0]?.split(/[._+\-\d]/)[0] ?? '';
  return word ? `${word[0]!.toUpperCase()}${word.slice(1, 60)}` : email;
};

/**
 * The person an organiser is in their group: a copy of their profile,
 * free to change afterwards.
 * @param account - The account and its profile.
 * @returns The person's fields; the first name is guessed from the
 *   address when the profile has none.
 */
export const personFromProfile = (account: ProfileAccount) => ({
  firstName: account.firstName ?? firstNameFromEmail(account.email),
  lastName: account.lastName,
  email: account.email,
  language: localeOf(account.language),
  avatarEmoji: avatarEmojiSchema.safeParse(account.avatarEmoji).data,
  avatarColor: avatarColorSchema.safeParse(account.avatarColor).data,
});

/**
 * An organiser stays a person of their group: they can be neither
 * deleted, nor deactivated, nor given another address.
 * @param email - The person's address.
 * @param organizerEmails - Addresses of the group's organisers.
 * @param change - What is asked: deletion, or the fields of an edit.
 * @returns Ok, or `person_is_organizer`.
 */
/**
 * Whether an address can be given to a person: one address belongs to one
 * person of a group (it is how they log in and find their draws).
 * @param email - The address given, or none.
 * @param holder - The person of the group who already has it, or null.
 * @param selfId - The person being saved, when they exist already.
 * @returns Ok, or `email_taken`.
 */
export const canUseEmail = (
  email: string | null | undefined,
  holder: { id: string } | null,
  selfId?: string,
): Result<true> =>
  !email || !holder || holder.id === selfId ? ok(true) : fail('email_taken');

export const canChangePerson = (
  email: string | null,
  organizerEmails: readonly string[],
  change: 'delete' | { active?: boolean; email?: string | null },
): Result<true> => {
  if (!email || !organizerEmails.includes(email)) return ok(true);
  if (change === 'delete') return fail('person_is_organizer');
  const leaves =
    change.active === false ||
    (change.email !== undefined && change.email !== email);
  return leaves ? fail('person_is_organizer') : ok(true);
};

export const exclusionInputSchema = z
  .object({
    giverId: z.string().min(1),
    receiverId: z.string().min(1),
    reciprocal: z.boolean().default(false),
  })
  .refine((e) => e.giverId !== e.receiverId, 'self exclusion is implicit');

/**
 * First and last name together, as far as they are known.
 * @param who - Names that may be missing.
 * @returns "Léa Martin", "Léa", or an empty string.
 */
export const fullName = (who: {
  firstName?: string | null;
  lastName?: string | null;
}): string => [who.firstName, who.lastName].filter(Boolean).join(' ');

/**
 * Orders people by first name, then by last name: two Adèle follow each
 * other, Bernard before Martin.
 * @param a - A person.
 * @param b - Another one.
 * @returns A comparison for `toSorted`.
 */
export const byName = (
  a: { firstName: string; lastName?: string | null },
  b: { firstName: string; lastName?: string | null },
): number =>
  a.firstName.localeCompare(b.firstName) ||
  (a.lastName ?? '').localeCompare(b.lastName ?? '');

export type Named = { id: string; firstName: string; lastName?: string | null };

/** Display name: first name, last name only to tell homonyms apart (README 20). */
export const displayName = (person: Named, people: Named[] = []): string => {
  const homonyms = people.filter(
    (p) => p.id !== person.id && p.firstName === person.firstName,
  );
  return homonyms.length > 0 && person.lastName
    ? `${person.firstName} ${person.lastName}`
    : person.firstName;
};

export type PersonRow = Named & {
  active: boolean;
  email?: string | null;
  language?: string | null;
  avatarEmoji?: string | null;
  avatarColor?: string | null;
  createdAt: string;
};

export type PublicPerson = {
  id: string;
  firstName: string;
  lastName: string | null;
  email: string | null;
  language: Locale;
  active: boolean;
  avatar: Avatar;
  createdAt: string;
};

/** What the admin API exposes about a person. */
export const publicPerson = (person: PersonRow): PublicPerson => ({
  id: person.id,
  firstName: person.firstName,
  lastName: person.lastName ?? null,
  email: person.email ?? null,
  language: localeOf(person.language),
  active: person.active,
  avatar: avatarOf(person),
  createdAt: person.createdAt,
});
