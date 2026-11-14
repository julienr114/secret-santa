import { z } from 'zod';
import { LOCALES, localeOf, type Locale } from '#shared/i18n';
import {
  avatarColorSchema,
  avatarEmojiSchema,
  avatarOf,
  type Avatar,
} from './avatars';

// People and exclusions of a group (README 6.6, section 10).

const nameSchema = z.string().trim().min(1).max(60);
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

export const exclusionInputSchema = z
  .object({
    giverId: z.string().min(1),
    receiverId: z.string().min(1),
    reciprocal: z.boolean().default(false),
  })
  .refine((e) => e.giverId !== e.receiverId, 'self exclusion is implicit');

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
