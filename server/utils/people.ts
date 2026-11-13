import { z } from 'zod';
import {
  avatarColorSchema,
  avatarEmojiSchema,
  avatarOf,
  type Avatar,
} from './avatars';

// People and exclusions of a group (README 6.6, section 10).

const nameSchema = z.string().trim().min(1).max(60);

export const personInputSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema.nullable().default(null),
  avatarEmoji: avatarEmojiSchema.optional(),
  avatarColor: avatarColorSchema.optional(),
});

export const personPatchSchema = z
  .object({
    firstName: nameSchema,
    lastName: nameSchema.nullable(),
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
  avatarEmoji?: string | null;
  avatarColor?: string | null;
  createdAt: string;
};

export type PublicPerson = {
  id: string;
  firstName: string;
  lastName: string | null;
  active: boolean;
  avatar: Avatar;
  createdAt: string;
};

/** What the admin API exposes about a person. */
export const publicPerson = (person: PersonRow): PublicPerson => ({
  id: person.id,
  firstName: person.firstName,
  lastName: person.lastName ?? null,
  active: person.active,
  avatar: avatarOf(person),
  createdAt: person.createdAt,
});
